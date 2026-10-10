use dioxus::prelude::*;

pub const BUTTON_STORY_ID: &str = "button/primary";
pub const STORY_CSS: Asset = asset!("/assets/story.css");
pub const STORY_CSS_TEXT: &str = include_str!("../assets/story.css");
pub const THAI_FIXTURE: &str = "น้ำ กุ้ง ปี่ กี้ เก้า ภาษาไทย";
pub const THAI_LONG: &str = "ภาษาไทยมีสระและวรรณยุกต์อยู่หลายตำแหน่ง เราต้องอ่านข้อความนี้ได้ครบโดยไม่มีตัวอักษรหายและไม่มีเครื่องหมายถูกตัด ข้อความยาวนี้ใช้ตรวจการตัดบรรทัดในพื้นที่แคบ";
pub const LONG_CONTENT: &str = "A narrow card still needs to keep every word readable. This fixture includes a longer sentence so we can inspect wrapping, spacing, and the end of the text across three renderers. The final words must remain visible.";

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
pub fn Button(
    label: String,
    #[props(default)] disabled: bool,
    onpress: EventHandler<()>,
) -> Element {
    rsx! {
        button {
            r#type: "button",
            class: "primary-button",
            disabled: disabled.then_some(true),
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
    let mut selected = use_signal(|| BUTTON_STORY_ID);
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
        nav { class: "story-picker", "aria-label": "Choose story",
            for (id, label) in [
                (BUTTON_STORY_ID, "Button / Primary"),
                ("button/disabled", "Button / Disabled"),
                ("button/long-content", "Button / Long content"),
                ("card/default", "Card / Default"),
                ("card/long-content", "Card / Long content"),
                ("text-input/default", "TextInput / Default"),
                ("text-input/disabled", "TextInput / Disabled"),
                ("text-input/long-content", "TextInput / Long content"),
            ] {
                button { r#type: "button", "aria-pressed": selected() == id,
                    onclick: move |_| selected.set(id), "{label}"
                }
            }
        }
        match selected() {
            "button/disabled" => rsx! { ButtonFixture { key: "{selected}", story_id: "button/disabled", label: "Press me", disabled: true } },
            "button/long-content" => rsx! { ButtonFixture { key: "{selected}", story_id: "button/long-content", label: "Press this button with a longer label to check how the text wraps inside a narrow fixture." } },
            "card/default" => rsx! { CardStory { story_id: "card/default", body: "Shared Rust props, CSS, and bundled fonts." } },
            "card/long-content" => rsx! { CardStory { story_id: "card/long-content", body: LONG_CONTENT } },
            "text-input/default" => rsx! { InputStory { key: "{selected}", story_id: "text-input/default", initial_value: "Papyrus" } },
            "text-input/disabled" => rsx! { InputStory { key: "{selected}", story_id: "text-input/disabled", initial_value: "Read only fixture", disabled: true } },
            "text-input/long-content" => rsx! { InputStory { key: "{selected}", story_id: "text-input/long-content", initial_value: LONG_CONTENT } },
            _ => rsx! { ButtonStory {} TextInputStory {} },
        }
    }
}

#[component]
pub fn Card(title: String, body: String) -> Element {
    rsx! { article { class: "card",
        h2 { "{title}" }
        p { class: "card-body", "{body}" }
    } }
}

#[component]
pub fn CardStory(story_id: String, body: String) -> Element {
    rsx! { main { class: "story", "data-story-id": "{story_id}",
        h1 { "Card" }
        Card { title: "One component, three renderers", body }
        p { class: "story-id", "Story: {story_id}" }
    } }
}

#[component]
pub fn TextInput(
    label: String,
    value: String,
    #[props(default)] disabled: bool,
    oninput: EventHandler<String>,
) -> Element {
    rsx! {
        label { r#for: "component-input", "{label}" }
        input { id: "component-input", r#type: "text", value,
            // Omit false boolean attributes: Native treats their presence as true.
            disabled: disabled.then_some(true),
            oninput: move |event| oninput.call(event.value()),
        }
    }
}

#[component]
pub fn InputStory(
    story_id: String,
    initial_value: String,
    #[props(default)] disabled: bool,
) -> Element {
    let mut value = use_signal(|| initial_value);
    rsx! { main { class: "story input-story", "data-story-id": "{story_id}",
        h1 { "TextInput" }
        TextInput { label: "Component name", value: value(), disabled,
            oninput: move |next| value.set(next),
        }
        output { id: "text-value", "Value: {value}" }
        p { class: "story-id", "Story: {story_id}" }
    } }
}

#[component]
pub fn ButtonStory() -> Element {
    rsx! { ButtonFixture { story_id: BUTTON_STORY_ID, label: "Press me" } }
}

#[component]
pub fn ButtonFixture(story_id: String, label: String, #[props(default)] disabled: bool) -> Element {
    let mut presses = use_signal(|| 0_u32);
    rsx! {
        main {
            class: "story",
            "data-story-id": "{story_id}",
            p { class: "eyebrow", "Papyrus / Phase 0" }
            h1 { "Button" }
            p { class: "description", "A shared Rust component, styled with ordinary CSS." }
            section {
                class: "fixture",
                "aria-label": "Button story",
                Button { label, disabled, onpress: move |_| presses += 1 }
                output { id: "press-count", role: "status", "aria-live": "polite", "Presses: {presses}" }
            }
            p { class: "story-id", "Story: {story_id}" }
        }
    }
}
