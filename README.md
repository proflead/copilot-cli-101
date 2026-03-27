# Copilot CLI Tutorial — Example Repository

This repository is a hands-on learning resource for GitHub Copilot CLI. It includes an example client-side web app in the `example/` directory and curated lessons, exercises, and reference material to help developers learn how to use Copilot CLI effectively and safely.

Repository layout
- example/ — Example expense-tracker web app (vanilla JS, no build step). Read: `example/DOCUMENTATION.md`.
- COPILOT_CLI_HELP.md — Quick reference for common slash commands and shortcuts.
- PROJECT_SUMMARY.md — Goals and learning objectives for this tutorial.
- share.md — How to share exercises and learning artifacts.

Why this repo?
This repo is designed to be the best starting point for developers who want to learn Copilot CLI: installation across OSes, authentication, slash commands, model selection, LSP integration, safe workspace permissions, example-driven exercises, and Git + PR workflows using the agent.

Quick links
- Example app: ./example/index.html (open directly or serve via a static server)
- App docs: ./example/DOCUMENTATION.md
- Quick help: ./COPILOT_CLI_HELP.md

Prerequisites
- Git (2.25+ recommended)
- Node (optional, for some exercises)
- A GitHub account with Copilot access (some features require a subscription or organizational allowance)

1) Installing Copilot CLI

macOS
- Homebrew (recommended):
  - brew install copilot-cli
- Install script (single-line):
  - /bin/bash -c "$(curl -fsSL https://gh.io/copilot-install)"
- npm (alternative): npm install -g @github/copilot

Linux
- Homebrew on Linux: brew install copilot-cli
- Install script: curl -fsSL https://gh.io/copilot-install | bash
- npm: npm install -g @github/copilot

Windows
- WinGet: winget install GitHub.Copilot
- Scoop/Chocolatey (if available) or npm: npm install -g @github/copilot

Notes
- Use the `VERSION` and `PREFIX` environment variables with the install script to pin versions or install to custom locations.
- Homebrew or OS package managers keep things easy to update.

2) Authentication

- First run: execute `copilot`. If not authenticated, run the slash command `/login` inside the CLI and follow the browser flow.
- PAT alternative: Generate a fine-grained Personal Access Token (PAT) with the "Copilot Requests" permission and set it in your environment: `export GH_TOKEN=your_token_here` (macOS/Linux) or set `GITHUB_TOKEN`/`GH_TOKEN` in Windows environment variables.
- Organization-managed access: ensure your org admin has enabled Copilot for your account.

3) Core concepts & UX

Slash commands
- Commands start with `/` and change agent behavior or trigger integrations. Examples:
  - /login, /logout — authentication
  - /model — switch AI model
  - /plan — create an implementation plan
  - /delegate — create PRs from agent work
  - /pr — create or manage pull requests
  - /diff, /review — inspect code changes or request review assistance
  - /lsp — manage language server config
  - /experimental — toggle experimental features

Modes & Shortcuts
- Shift+Tab — cycle modes (Interactive, Plan, Autopilot)
- Ctrl+S — run command while keeping input
- Ctrl+G — edit prompt in external editor
- ! — run local shell commands from inside Copilot (use cautiously)
- Esc / Ctrl+C — cancel or clear input

Models & Limits
- Use `/model` to pick a model (Claude, GPT, etc.). Different models may give different behavior and costs.
- Each Copilot CLI request may consume quota depending on your plan. Monitor usage with `/usage`.

4) Language Server Protocol (LSP) integration

Why LSP
- LSP servers provide richer local code intelligence: go-to-definition, diagnostics, hover, and completions that Copilot CLI can surface.

Installing LSP servers
- TypeScript: npm install -g typescript-language-server typescript
- Python: pip install 'python-lsp-server[all]'
- Rust: rust-analyzer (install via rustup or package manager)

Configuring LSP
- User-level: edit `~/.copilot/lsp-config.json`
- Repository-level: create `.github/lsp.json`

Example lsp-config.json
{
  "lspServers": {
    "typescript": {
      "command": "typescript-language-server",
      "args": ["--stdio"],
      "fileExtensions": { ".ts": "typescript", ".tsx": "typescript" }
    }
  }
}

5) Hands-on exercises (recommended order)
- Exercise 1: Run Copilot and authenticate (`copilot`, then `/login`).
- Exercise 2: Open this repo and try `/plan "Add unit tests for storage manager"` to generate a plan.
- Exercise 3: Use `/delegate` after asking the agent to implement the plan; inspect diffs with `/diff` before applying.
- Exercise 4: Configure an LSP server for JS and ask Copilot CLI to show diagnostics with `/lsp`.
- Exercise 5: Create a PR using `/pr` and iterate on review comments using `/review`.

Each exercise should be done in a dedicated branch. Use `git status` and `git log` to inspect changes created by the agent.

6) Example workflows & slash-command recipes

Create a feature end-to-end
1. copilot
2. /plan "Add export to CSV feature to reports module" (review plan)
3. /delegate apply —agent to implement and open a branch (review diffs with `/diff`)
4. Run tests locally (if present) and iterate
5. /pr create to open a pull request

Code review assistant
- After making changes locally, run `/review` to get suggestions for improvements, security issues, and test coverage gaps.

7) Security & safety best practices
- Least privilege: only give the agent access to directories you want it to modify (`/add-dir`), avoid /allow-all.
- Secrets: do not expose API keys, tokens, or private credentials in the workspace you allow the agent to access.
- Review everything: the agent will propose changes but always inspect diffs before applying.
- Use feature branches for agent-generated changes and require human approval before merging.

8) Troubleshooting
- Can't authenticate: re-run `/login` and check browser pop-up or PAT env var.
- Agent can't access files: use `/add-dir path/to/dir` to grant access.
- LSP not working: verify the server is installed and `~/.copilot/lsp-config.json` is valid JSON.
- CLI crashes: run `copilot --version` and check for updates with `/update`.

9) Exercises and guided curriculum (expandable)
- Beginner: Setup & basic slash commands
- Intermediate: Planning, delegating tasks, and using LSP
- Advanced: Fleet mode, background tasks, and automating PR workflows

10) Contributing to this tutorial
- Add new exercises in `example/exercises/` (use numbered folders and README.md per exercise)
- Improve docs in COPILOT_CLI_HELP.md
- Open issues or PRs for corrections and suggestions

License & attribution
- This repo is a learning resource. Attribution: includes Copilot CLI guidance summarized from official docs.

Further reading
- Official docs: https://docs.github.com/copilot
- Copilot CLI help inside the tool: run `copilot` then `/help`

---

This README was expanded to provide a full Copilot CLI tutorial, platform install steps, walkthroughs, slash-command recipes, LSP setup, exercises, and safety guidance.
