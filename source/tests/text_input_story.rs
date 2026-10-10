use dioxus::core::Mutation;
use dioxus::prelude::*;
use dioxus_html::{
    EventData, SerializedFormData, SerializedHtmlEventConverter, set_event_converter,
};
use papyrus_stories::TextInputStory;

#[test]
fn thai_input_and_editing_preserve_the_visible_value() {
    set_event_converter(Box::new(SerializedHtmlEventConverter));
    let mut dom = VirtualDom::new(TextInputStory);
    let mutations = dom.rebuild_to_vec();
    let input = mutations
        .edits
        .iter()
        .find_map(|edit| match edit {
            Mutation::NewEventListener { name, id } if name == "input" => Some(*id),
            _ => None,
        })
        .expect("the story exposes an input event");
    for value in ["น้ำ กุ้ง ปี่ กี้ เก้า ภาษาไทย", "น้ำ กุ้ง", ""]
    {
        let data = EventData::Form(SerializedFormData::new(value.into(), vec![])).into_any();
        dom.runtime()
            .handle_event("input", Event::new(data, true), input);
        dom.render_immediate_to_vec();
        let html = dioxus_ssr::render(&dom);
        assert!(
            html.contains(&format!("Input value: {value}</output>")),
            "{html}"
        );
    }
}
