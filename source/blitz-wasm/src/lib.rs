#![cfg(target_arch = "wasm32")]

use dioxus_native::{Config, build_single_font_ctx};
use parley::fontique::{Blob, FontInfoOverride, GenericFamily};
use std::sync::Arc;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
    let mut fonts = build_single_font_ctx(include_bytes!("../../public/assets/DejaVuSans.woff2"));
    let thai = fonts.collection.register_fonts(
        Blob::new(Arc::new(include_bytes!("../../public/assets/NotoSansThai.ttf").to_vec()) as _),
        Some(FontInfoOverride {
            family_name: Some("Papyrus Thai"),
            ..Default::default()
        }),
    );
    fonts
        .collection
        .append_generic_families(GenericFamily::SansSerif, thai.iter().map(|(id, _)| *id));
    assert!(!thai.is_empty(), "the bundled Thai font must register");
    dioxus_native::launch_cfg(
        papyrus_stories::Preview,
        vec![],
        vec![Box::new(Config::new().with_font_ctx(fonts))],
    );
}
