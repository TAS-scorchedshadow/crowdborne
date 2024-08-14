// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use csv;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, error::Error, fs::File, path::PathBuf, vec};
use tauri::api::file;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[derive(Debug, Serialize, Deserialize)]
struct CSVFormat {
    name: String,
    role: String,
    trainee_preferences: String,
    lead_preferences: String,
    github: String,
    discord: String,
    group: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
// #[serde(rename_all = "camelCase")]
struct PersonRecord {
    name: String,
    role: String,
    lead_preferences: Vec<String>,
    trainee_preferences: Vec<String>,
    github: String,
    discord: String,
}

fn split_str(string: String, delimiter: char) -> Vec<String> {
    string
        .split(delimiter)
        .map(|s| s.trim().to_string())
        .filter(|s| s.len() > 0)
        .collect()
}

fn run_parser(file_path: PathBuf) -> Result<HashMap<String, Vec<PersonRecord>>, Box<dyn Error>> {
    let mut rdr = csv::Reader::from_path(file_path)?;
    let mut results: HashMap<String, Vec<PersonRecord>> = HashMap::new();
    for result in rdr.deserialize() {
        let record: CSVFormat = result?;
        let vecd = PersonRecord {
            name: record.name,
            role: record.role,
            trainee_preferences: split_str(record.trainee_preferences, ','),
            lead_preferences: split_str(record.lead_preferences, ','),
            github: record.github,
            discord: record.discord,
        };
        dbg!(&vecd);
        results
            .entry(record.group.clone())
            .and_modify(|group| group.push(vecd.clone()))
            .or_insert(vec![vecd]);
    }
    let headers = rdr.headers()?;
    println!("{:?}", headers);
    Ok(results)
}

#[tauri::command]
fn load_file() -> Result<HashMap<String, Vec<PersonRecord>>, String> {
    use tauri::api::dialog::blocking::FileDialogBuilder;
    let dialog_result = FileDialogBuilder::new().pick_file();
    let records = match dialog_result {
        None => return Err("Bad file selected".to_string()),
        Some(file_path) => match run_parser(file_path) {
            Ok(records) => Ok(records),
            Err(e) => Err(e.to_string()),
        },
    };

    match records {
        Ok(r) => Ok(r),
        Err(e) => Err(e),
    }
    // do something with the optional file path here
    // the file path is `None` if the user closed the dialog
}

#[tauri::command]
fn save_file(groups: HashMap<String, Vec<PersonRecord>>) -> Result<(), String> {
    use tauri::api::dialog::blocking::FileDialogBuilder;
    let file_path = FileDialogBuilder::new().save_file();
    if let Some(fp) = file_path {
        let mut wtr = csv::Writer::from_path(fp).map_err(|e| e.to_string())?;
        for (key, val) in &groups {
            for record in val {
                let out_format = CSVFormat {
                    name: record.name.clone(),
                    role: record.role.clone(),
                    group: key.to_string(),
                    trainee_preferences: record.trainee_preferences.join(","),
                    lead_preferences: record.lead_preferences.join(","),
                    github: record.github.clone(),
                    discord: record.discord.clone(),
                };
                let _ = wtr.serialize(out_format);
            }
        }
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, load_file, save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
