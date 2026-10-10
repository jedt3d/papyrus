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

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
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
    proposal = (ROOT / 'proposal/index.html').read_text()
    assert 'lang=th' in proposal or 'lang="th"' in proposal
    assert 'mermaid' in proposal, 'Proposal diagram output is missing'
    assert not (ROOT / 'agent-docs').exists(), 'Agent directory must not be auto-published'
    print(f'Checked {checked} internal links/assets across {len(pages)} HTML pages')


if __name__ == '__main__':
    check_site()
