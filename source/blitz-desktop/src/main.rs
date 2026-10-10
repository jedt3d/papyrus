use dioxus_native::{Config, LogicalSize, WindowAttributes, build_single_font_ctx};
use parley::fontique::{Blob, FontInfoOverride, GenericFamily};
use std::sync::Arc;

fn main() {
    let mut fonts = build_single_font_ctx(include_bytes!("../../public/assets/DejaVuSans.woff2"));
    let thai = fonts.collection.register_fonts(
        Blob::new(Arc::new(include_bytes!("../../public/assets/NotoSansThai.ttf").to_vec()) as _),
        Some(FontInfoOverride {
            family_name: Some("Papyrus Thai"),
            ..Default::default()
        }),
    );
    assert!(!thai.is_empty(), "the bundled Thai font must register");
    fonts
        .collection
        .append_generic_families(GenericFamily::SansSerif, thai.iter().map(|(id, _)| *id));
    let window = WindowAttributes::default()
        .with_title("Papyrus / Blitz Desktop / Phase 0")
        .with_surface_size(LogicalSize::new(1280.0, 720.0));
    dioxus_native::launch_cfg(
        preview,
        vec![],
        vec![Box::new(
            Config::new()
                .with_font_ctx(fonts)
                .with_window_attributes(window),
        )],
    );
}

fn preview() -> dioxus::prelude::Element {
    let window = dioxus_native::use_window();
    dioxus::prelude::use_hook(move || {
        eprintln!(
            "Papyrus desktop: surface={:?}; scale={}; renderer=vello-hybrid",
            window.surface_size(),
            window.scale_factor()
        );
    });
    papyrus_stories::Preview()
}
