# Free Windows Code-Signing Setup via SignPath Foundation

To eliminate the blue Windows SmartScreen ("Windows protected your PC") warning on downloaded `.exe` and `.msi` files, **SignPath Foundation** provides **100% free code-signing certificates** for recognized open-source projects.

---

## 📋 3 Steps to Enable Free Code-Signing

### Step 1: Apply for Free Open-Source Signing
1. Visit [https://about.signpath.io/open-source](https://about.signpath.io/open-source).
2. Click **"Apply now"** and submit your project details:
   - **Project Name**: AASHA Studio
   - **Repository URL**: `https://github.com/Anant1asha/aasha-studio`
   - **License**: GNU Affero General Public License v3.0 (AGPL-3.0)
3. SignPath Foundation reviews and approves open-source projects typically within 24–48 hours.

### Step 2: Configure Your Project on SignPath
1. Once approved, log in to your SignPath dashboard.
2. Create a project named `aasha-studio`.
3. Create a Signing Policy named `release-signing` (using the free Foundation certificate).
4. Generate an **API Token**.

### Step 3: Add Secrets to Your GitHub Repository
1. Open your repository on GitHub: [https://github.com/Anant1asha/aasha-studio/settings/secrets/actions](https://github.com/Anant1asha/aasha-studio/settings/secrets/actions).
2. Click **"New repository secret"** and add:
   - `SIGNPATH_API_TOKEN`: Your API token generated in Step 2.
   - `SIGNPATH_ORGANIZATION_ID`: Your SignPath Organization ID (visible in your SignPath organization settings).

---

## 🚀 How Releases Work

Whenever you want to release a new version:
```bash
git tag v1.0.0
git push origin v1.0.0
```
GitHub Actions will automatically:
1. Compile the native Windows `.msi` and `.exe` installers via Tauri v2 on cloud runners.
2. Submit the binaries to SignPath Foundation for Authenticode signing.
3. Attach the signed, SmartScreen-trusted installers directly to the GitHub Release.
