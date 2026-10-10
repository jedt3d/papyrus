use dioxus::prelude::*;

pub const BUTTON_STORY_ID: &str = "button/primary";
pub const STORY_CSS: Asset = asset!("/assets/story.css");
pub const STORY_CSS_TEXT: &str = include_str!("../assets/story.css");
pub const THAI_FIXTURE: &str = "น้ำ กุ้ง ปี่ กี้ เก้า ภาษาไทย";
pub const THAI_LONG: &str = "ภาษาไทยมีสระและวรรณยุกต์อยู่หลายตำแหน่ง เราต้องอ่านข้อความนี้ได้ครบโดยไม่มีตัวอักษรหายและไม่มีเครื่องหมายถูกตัด ข้อความยาวนี้ใช้ตรวจการตัดบรรทัดในพื้นที่แคบ";

#[cfg(feature = "embedded-style")]
pub fn embedded_stylesheet() -> String {
    use base64::{Engine, engine::general_purpose::STANDARD};
    STORY_CSS_TEXT
        .replace(
            "DejaVuSans.woff2",
            &format!(
                "data:font/woff2;base64,{}",
                STANDARD.encode(include_bytes!("../public/assets/DejaVuSans.woff2"))
            ),
        )
        .replace(
            "NotoSansThai.ttf",
            &format!(
                "data:font/ttf;base64,{}",
                STANDARD.encode(include_bytes!("../public/assets/NotoSansThai.ttf"))
            ),
        )
}

#[component]
pub fn Button(label: String, onpress: EventHandler<()>) -> Element {
    rsx! {
        button {
            r#type: "button",
            class: "primary-button",
            onclick: move |_| onpress.call(()),
            "{label}"
        }
    }
}

#[component]
pub fn TextInputStory() -> Element {
    let mut value = use_signal(String::new);
    let mut starts = use_signal(|| 0_u32);
    let mut updates = use_signal(|| 0_u32);
    let mut ends = use_signal(|| 0_u32);
    let mut phase = use_signal(|| "idle");
    let mut composition = use_signal(String::new);
    rsx! {
        section { class: "story thai-story", "data-story-id": "text-input/thai", lang: "th",
            h2 { "Thai text / Input" }
            p { id: "thai-marks", "{THAI_FIXTURE}" }
            p { id: "thai-long", "{THAI_LONG}" }
            label { r#for: "thai-input", "Thai / IME input" }
            // Keep the input uncontrolled so observing preedit never rewrites it.
            input { id: "thai-input", r#type: "text",
                oninput: move |event| value.set(event.value()),
                oncompositionstart: move |_| { starts += 1; phase.set("active"); },
                oncompositionupdate: move |event| { updates += 1; composition.set(event.data().data()); },
                oncompositionend: move |event| { ends += 1; phase.set("idle"); composition.set(event.data().data()); },
            }
            output { id: "input-echo", "Input value: {value}" }
            p { class: "input-note", "The value may include preedit. A typed Thai string alone does not prove IME composition." }
            output { id: "composition-status", "Composition: {phase}; starts: {starts}; updates: {updates}; ends: {ends}" }
            output { id: "composition-data", "Last composition data: {composition}" }
        }
    }
}

#[component]
pub fn Preview() -> Element {
    rsx! { ButtonStory {} TextInputStory {} }
}

#[component]
pub fn ButtonStory() -> Element {
    let mut presses = use_signal(|| 0_u32);
    // Native asset URLs call filesystem APIs on WASM; use the data URI provider.
    #[cfg(feature = "embedded-style")]
    let styles = {
        let css = use_hook(embedded_stylesheet);
        rsx! { document::Style { "{css}" } }
    };
    #[cfg(not(feature = "embedded-style"))]
    let styles = rsx! { document::Stylesheet { href: STORY_CSS } };

    rsx! {
        {styles}
        main {
            class: "story",
            "data-story-id": BUTTON_STORY_ID,
            p { class: "eyebrow", "Papyrus / Phase 0" }
            h1 { "Button / Primary" }
            p { class: "description", "A shared Rust component, styled with ordinary CSS." }
            section {
                class: "fixture",
                "aria-label": "Button story",
                Button { label: "Press me", onpress: move |_| presses += 1 }
                output { id: "press-count", role: "status", "aria-live": "polite", "Presses: {presses}" }
            }
            p { class: "story-id", "Story: {BUTTON_STORY_ID}" }
        }
    }
}
