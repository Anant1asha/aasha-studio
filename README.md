# AASHA Studio: AI Textbook-to-Interactive Learning & Gamified Assessment Engine

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Dual Package](https://img.shields.io/badge/Architecture-Dual_Package_(CLI_+_Tauri_v2)-green.svg)]()
[![Zero Token Bleed](https://img.shields.io/badge/Security-Windows_DPAPI_Key_Vault-blueviolet.svg)]()

Transform any school textbook PDF (NCERT, CBSE, ICSE, State Boards, International curricula) into high-impact, bilingual, offline HTML micro-learning apps with interactive simulations and gamified assessments.

---

## 🚀 3-Tier Execution Architecture (Zero-Rust Developer Experience)

We solved the native desktop build barrier (Rust + Microsoft C++ Build Tools) by offering **3 flexible ways** to run AASHA Studio:

| Execution Tier | Target Audience | Prerequisites | How to Run |
|---|---|---|---|
| **Tier 1: Prebuilt Windows App** | Teachers, Schools, NGOs | **None** (Self-contained) | Download & run `AASHA-Studio-Setup.exe` from Releases |
| **Tier 2: Universal CLI** | Developers, Automated Pipelines | **Node.js 18+** only | `npx @aasha/cli ingest chapter.pdf` |
| **Tier 3: Browser Studio GUI** | Developers without Rust | **Node.js 18+** only | `npx @aasha/cli studio` (opens in Edge/Chrome) |

> [!NOTE]
> **Windows SmartScreen Notice**: For initial releases while SignPath Foundation Authenticode certificate review is in progress, Windows may display *"Windows protected your PC"*. Simply click **"More info"** $\rightarrow$ **"Run anyway"**. All binaries are compiled transparently on GitHub Actions.

---

## 🔒 Bring-Your-Own-Key (BYOK) & Privacy

- **Zero Cloud Data Leakage**: Your textbook PDFs and student files remain 100% local on your machine.
- **Hardware-Encrypted Key Vault**: In the desktop app, API keys for OpenRouter, Google Gemini, or Ollama are encrypted via **Windows DPAPI** (Data Protection API) and stored in the Windows Credential Manager. No `.env` files are written to disk.
- **Completely Offline Option**: Connect to local LLMs via Ollama or LM Studio (`http://localhost:11434/v1`) for zero-internet processing.

---

## 🧩 Core Innovations

1. **Section 24 Reusable Content Contract**: Guarantees pedagogical consistency, 4-tier progressive hints ($H_1 \text{ Hook} \rightarrow H_2 \text{ Concept} \rightarrow H_3 \text{ Formula} \rightarrow H_4 \text{ Step}$), and misconception diagnostics (`m` attribute).
2. **20+ Prebuilt Simulation Foundations (F01–F20)**: Automatically maps mathematics, science, physics, and geography concepts to interactive canvas, JSXGraph, and `<aasha-sim>` Web Component manipulatives.
3. **L-Truth Anti-Spoiler Benchmark**: Dual-gate static verification ensuring distractor explanations never leak answers or spoil cognitive effort.
4. **Single-File Offline Delivery**: Emits self-contained offline HTML ($<20$ MB) with inline JS/CSS and Hindi-focused bilingual word-tap lexicon (`window.WM`).

---

## 🛠️ Developer Quickstart

```bash
# Clone the repository
git clone https://github.com/AASHA-Ecosystem/aasha-studio.git
cd aasha-studio

# Install dependencies
npm install

# Launch the visual studio in your browser (Zero Rust required!)
npm run studio

# Or run the CLI directly
npm run cli -- ingest ./samples/chapter.pdf --provider openrouter
```

---

## 📄 License
Dual-licensed: **GNU AGPLv3** for non-profits, educators, and open-source contributors; commercial licensing available for proprietary platform integration.
