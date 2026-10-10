#![cfg(feature = "embedded-style")]

use base64::{Engine, engine::general_purpose::STANDARD};
use papyrus_stories::embedded_stylesheet;

#[test]
fn embedded_css_carries_the_original_fonts_without_filesystem_urls() {
    let css = embedded_stylesheet();
    let mut decoded = Vec::new();
    for prefix in ["data:font/woff2;base64,", "data:font/ttf;base64,"] {
        let encoded = css
            .split_once(prefix)
            .expect("a font data URI")
            .1
            .split('"')
            .next()
            .unwrap();
        decoded.push(STANDARD.decode(encoded).expect("valid font encoding"));
    }
    assert_eq!(
        decoded[0].as_slice(),
        include_bytes!("../public/assets/DejaVuSans.woff2")
    );
    assert_eq!(
        decoded[1].as_slice(),
        include_bytes!("../public/assets/NotoSansThai.ttf")
    );
    assert!(!css.contains("url(\"DejaVuSans.woff2\")"));
    assert!(!css.contains("url(\"NotoSansThai.ttf\")"));
    assert!(css.contains("background: #24553d;"));
}
