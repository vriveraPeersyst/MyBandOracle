use obi::{OBIDeserialize, OBISchema, OBISerialize};
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

const EXTERNAL_ID: i64 = 1;
const DATA_SOURCE_ID: i64 = 1;

#[no_mangle]
fn prepare_impl(input: Input) {
    // Arguments to your data source: "results <matchday>"
    let calldata = format!("results {}", input.matchday);
    oei::ask_external_data(EXTERNAL_ID, DATA_SOURCE_ID, calldata.as_bytes());
}

#[no_mangle]
fn execute_impl(_input: Input) -> Output {
    let raw = ext::load_majority(EXTERNAL_ID);
    let json = std::str::from_utf8(&raw).unwrap();
    let decoded: Vec<Match> = serde_json::from_str(json).unwrap();
    Output { matches: decoded }
}

prepare_entry_point!(prepare_impl);
execute_entry_point!(execute_impl);
