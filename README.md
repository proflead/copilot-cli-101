# Copilot CLI Tutorial — Example Repository

This repository is organized as a learning resource for GitHub Copilot CLI. It contains an example client-side web app in the `example/` directory and comprehensive documentation and instructions for developers who want to learn and use the Copilot CLI.

Contents
- example/ — The example expense-tracker web app (vanilla JS, no build step)
- COPILOT_CLI_HELP.md — Additional quick notes
- PROJECT_SUMMARY.md — Project summary and learning objectives
- share.md — Sharing guidelines

Why this repo?
This repository is crafted to teach developers how to use Copilot CLI effectively: installing, authenticating, running slash commands, using LSPs, integrating with git, and best practices for safe agent use.

Quick links
- Example app: ./example/index.html (open directly or serve via a local static server)
- App documentation: ./example/DOCUMENTATION.md

Prerequisites
- Git (latest stable)
- A GitHub account with Copilot access (some features require a subscription)

Installing Copilot CLI
This section summarizes official installation options. Refer to the official docs for updates.

macOS / Linux (recommended)
- Homebrew: `brew install copilot-cli`
- Install script: `curl -fsSL https://gh.io/copilot-install | bash`
- npm: `npm install -g @github/copilot`

Windows
- WinGet: `winget install GitHub.Copilot`
- npm: `npm install -g @github/copilot`

Authentication
- Run `copilot` and use `/login` to authenticate via browser flow.
- Alternatively, set a PAT with the "Copilot Requests" permission in `GH_TOKEN` or `GITHUB_TOKEN`.

Core concepts developers should know
- Slash commands: typed with a leading `/` in the CLI to perform actions (e.g., `/login`, `/model`, `/pr`, `/plan`). They drive agent behavior and integrations.
- Models: Copilot CLI supports multiple models; change with `/model`.
- Modes: Interactive and Plan modes; cycle via Shift+Tab to enable the agent to run multi-step tasks.
- Permissions & allowed directories: Use `/add-dir` and `/allow-all` carefully; prefer least privilege.
- LSP integration: Install language servers separately and configure via `~/.copilot/lsp-config.json` or `.github/lsp.json`.
- Experimental features: Enable with `--experimental` or `/experimental` and expect change.

Using this repo
1. Open the example app: `cd example && python3 -m http.server 8080` then open http://localhost:8080
2. Explore `example/DOCUMENTATION.md` for app architecture and developer guidance.
3. Launch Copilot CLI in this repo: `copilot` and try `/init`, `/plan`, `/delegate`, `/diff`, and `/pr` to see agent integration with git and the workspace.

Security & safety
- Review planned changes before applying; the agent will prompt for approval.
- Do not give Copilot CLI access to directories with secrets unless necessary; use `/add-dir` selectively.

Contributing
- Update the example app, documentation, or add new learning exercises.
- Open issues for improvements or doc corrections.

---

For the authoritative Copilot CLI docs, see: https://docs.github.com/copilot

README updated to be a Copilot CLI tutorial and example guide.
