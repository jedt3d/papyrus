use dioxus::prelude::*;

pub const BUTTON_STORY_ID: &str = "button/primary";
pub const STORY_CSS: Asset = asset!("/assets/story.css");

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
pub fn ButtonStory() -> Element {
    let mut presses = use_signal(|| 0_u32);

    rsx! {
        document::Stylesheet { href: STORY_CSS }
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
