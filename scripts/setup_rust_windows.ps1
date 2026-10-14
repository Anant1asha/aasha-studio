<#
.SYNOPSIS
    AASHA Studio Native Toolchain Setup Wrapper
#>
$ErrorActionPreference = "Continue"
$rootScript = Join-Path $PSScriptRoot "../scripts/setup_rust_windows.ps1"
if (Test-Path $rootScript) {
    & $rootScript @args
} else {
    Write-Host "Please run the root setup script: powershell -ExecutionPolicy Bypass -File ./scripts/setup_rust_windows.ps1"
}
