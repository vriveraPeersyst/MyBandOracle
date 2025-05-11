use obi::{OBISchema, OBIDeserialize, OBISerialize};
use owasm::{oei, ext, prepare_entry_point, execute_entry_point};

#[derive(OBIDeserialize, OBISchema)]
struct Input {
    matchday: u64,
}

#[derive(OBISerialize, OBISchema, serde::Deserialize)]
struct Match {
    id: String,
    result: String,
}

#[derive(OBISerialize, OBISchema)]
struct Output {
    matches: Vec<Match>,
}

#[no_mangle]
fn prepare_impl(input: Input) {
    oei::ask_external_data(1, 1, input.matchday.to_string().as_bytes());
}

#[no_mangle]
fn execute_impl(_input: Input) -> Output {
    let raw = ext::load_majority(1);
    let json = std::str::from_utf8(&raw).unwrap();
    let decoded: Vec<Match> = serde_json::from_str(json).unwrap();
    Output { matches: decoded }
}

prepare_entry_point!(prepare_impl);
execute_entry_point!(execute_impl);
