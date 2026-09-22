// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use keyring::Entry;

// Tauri IPC Command: Store API Key securely in Windows Credential Manager (DPAPI)
#[tauri::command]
fn save_secret(service: String, secret: String) -> Result<String, String> {
    let entry = Entry::new("aasha_studio", &service).map_err(|e| e.to_string())?;
    entry.set_password(&secret).map_err(|e| e.to_string())?;
    Ok("Key stored securely in Windows Credential Manager".into())
}

// Tauri IPC Command: Retrieve API Key from Windows Credential Manager
#[tauri::command]
fn get_secret(service: String) -> Result<String, String> {
    let entry = Entry::new("aasha_studio", &service).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(pwd) => Ok(pwd),
        Err(_) => Ok("".into()),
    }
}

// Tauri IPC Command: Remove API Key
#[tauri::command]
fn delete_secret(service: String) -> Result<String, String> {
    let entry = Entry::new("aasha_studio", &service).map_err(|e| e.to_string())?;
    entry.delete_password().map_err(|e| e.to_string())?;
    Ok("Key deleted".into())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_secret, get_secret, delete_secret])
        .run(tauri::generate_context!())
        .expect("error while running AASHA Studio desktop application");
}
