"""Check the production Pages artifact without network access."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

ROOT = Path(__file__).resolve().parents[1] / 'public'
BASE = 'https://jedt3d.github.io/papyrus/'


class PageLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
        self.language = None
        self.alternates = {}
        self.language_links = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.language = attrs.get('lang')
        if tag == 'link' and attrs.get('rel') == 'alternate' and attrs.get('hreflang'):
            self.alternates[attrs['hreflang']] = attrs.get('href')
        if tag == 'a' and attrs.get('hreflang'):
            self.language_links[attrs['hreflang']] = (attrs.get('href'), attrs.get('aria-current'))
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        for name in ('href', 'src'):
            if attrs.get(name):
                self.links.append(attrs[name])


def check_site():
    pages = {}
    for file in ROOT.rglob('*.html'):
        parser = PageLinks()
        parser.feed(file.read_text())
        pages[file] = parser
    assert ROOT / 'index.html' in pages, 'Build the site first'
    failures = []
    checked = 0
    for file, page in pages.items():
        page_url = urljoin(BASE, file.relative_to(ROOT).as_posix())
        for raw in page.links:
            url = urlparse(urljoin(page_url, raw.strip()))
            if url.netloc != 'jedt3d.github.io':
                continue
            if url.path != '/papyrus' and not url.path.startswith('/papyrus/'):
                failures.append(f'{file.name}: escapes /papyrus/: {raw}')
                continue
            target = ROOT / unquote(url.path[len('/papyrus/'):])
            if target.is_dir():
                target /= 'index.html'
            checked += 1
            if not target.exists():
                failures.append(f'{file.name}: missing {raw}')
            elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
                failures.append(f'{file.name}: missing anchor {raw}')
    assert not failures, '\n'.join(failures)
    proposal_urls = {'en': urljoin(BASE, 'proposal/'), 'th': urljoin(BASE, 'proposal/th/')}
    for language, path in [('en', 'proposal/index.html'), ('th', 'proposal/th/index.html')]:
        file = ROOT / path
        assert file in pages, f'Missing {language} proposal'
        page = pages[file]
        assert page.language == language, f'Wrong HTML language for {path}'
        for target_language, target_url in proposal_urls.items():
            assert page.alternates.get(target_language) == target_url, f'Missing language alternate in {path}'
            link, current = page.language_links[target_language]
            assert urljoin(BASE, link) == target_url, f'Wrong language link in {path}'
            assert (current == 'page') == (target_language == language), f'Wrong active language in {path}'
        assert page.alternates.get('x-default') == proposal_urls['en'], f'English must be the default in {path}'
        assert 'mermaid' in file.read_text(), f'Proposal diagram output is missing in {path}'
    assert not (ROOT / 'agent-docs').exists(), 'Agent directory must not be auto-published'
    print(f'Checked {checked} internal links/assets across {len(pages)} HTML pages')


if __name__ == '__main__':
    check_site()
