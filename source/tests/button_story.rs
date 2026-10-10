use dioxus::core::Mutation;
use dioxus::prelude::*;
use dioxus_html::{
    EventData, SerializedHtmlEventConverter, SerializedMouseData, set_event_converter,
};
use papyrus_stories::{ButtonFixture, ButtonStory};

fn disabled_story() -> Element {
    rsx! { ButtonFixture { story_id: "button/disabled", label: "Press me", disabled: true } }
}

#[test]
fn disabled_button_rejects_clicks_delivered_by_a_renderer() {
    set_event_converter(Box::new(SerializedHtmlEventConverter));
    let mut dom = VirtualDom::new(disabled_story);
    let mutations = dom.rebuild_to_vec();
    let button = mutations
        .edits
        .iter()
        .find_map(|edit| match edit {
            Mutation::NewEventListener { name, id } if name == "click" => Some(*id),
            _ => None,
        })
        .expect("the Button has a public click handler");
    let data = EventData::Mouse(SerializedMouseData::default()).into_any();
    dom.runtime()
        .handle_event("click", Event::new(data, true), button);
    dom.render_immediate_to_vec();
    assert!(dioxus_ssr::render(&dom).contains("Presses: 0"));
}

#[test]
fn button_activation_updates_the_visible_count() {
    set_event_converter(Box::new(SerializedHtmlEventConverter));
    let mut dom = VirtualDom::new(ButtonStory);
    let mutations = dom.rebuild_to_vec();
    let html = dioxus_ssr::render(&dom);
    assert!(html.contains("data-story-id=\"button/primary\""));
    assert!(html.contains("Press me"));
    assert!(html.contains("Presses: 0"));

    let buttons: Vec<_> = mutations
        .edits
        .iter()
        .filter_map(|edit| match edit {
            Mutation::NewEventListener { name, id } if name == "click" => Some(*id),
            _ => None,
        })
        .collect();
    assert_eq!(buttons.len(), 1, "the baseline has one action button");

    for expected in ["Presses: 1", "Presses: 2"] {
        let data = EventData::Mouse(SerializedMouseData::default()).into_any();
        dom.runtime()
            .handle_event("click", Event::new(data, true), buttons[0]);
        dom.render_immediate_to_vec();
        assert!(dioxus_ssr::render(&dom).contains(expected));
    }
}
