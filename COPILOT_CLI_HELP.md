# Help Guide

## Global
| Key | Action |
|-----|--------|
| @ | mention files, include contents in context |
| ctrl+s | run command while preserving input |
| shift+tab | cycle modes (interactive → plan) |
| ctrl+t | toggle model reasoning display |
| ctrl+o | expand recent timeline (when no input) |
| ctrl+e | expand all timeline (when no input) |
| ↑ ↓ | navigate command history |
| ctrl+c | cancel / clear input / copy selection |
| ctrl+c ×2 | exit from the CLI |
| ! | execute command in your local shell (bypass Copilot) |
| Esc | cancel the current operation |
| ctrl+d | shutdown |
| ctrl+l | clear the screen |
| ctrl+x → o | open link from most recent timeline event |

## Editing
| Key | Action |
|-----|--------|
| ctrl+a | move to beginning of line (when typing) |
| ctrl+e | move to end of line (when typing) |
| ctrl+h | delete previous character |
| ctrl+w | delete previous word |
| ctrl+u | delete from cursor to beginning of line |
| ctrl+k | delete from cursor to end of line (joins lines at end of line) |
| meta+← → | move cursor by word |
| ctrl+g | edit prompt in external editor |

## Agent environment
| Command | Description |
|---------|-------------|
| /init | Initialize Copilot instructions for this repository, or suppress the init suggestion |
| /agent | Browse and select from available agents (if any) |
| /skills | Manage skills for enhanced capabilities |
| /mcp | Manage MCP server configuration |
| /plugin | Manage plugins and plugin marketplaces |

## Models and subagents
| Command | Description |
|---------|-------------|
| /model | Select AI model to use |
| /delegate | Send this session to GitHub and Copilot will create a PR |
| /fleet | Enable fleet mode for parallel subagent execution |
| /tasks | View and manage background tasks (subagents and shell sessions) |

## Code
| Command | Description |
|---------|-------------|
| /ide | Connect to an IDE workspace |
| /diff | Review the changes made in the current directory |
| /pr | Operate on pull requests for the current branch |
| /review | Run code review agent to analyze changes |
| /lsp | Manage language server configuration |
| /terminal-setup | Configure terminal for multiline input support (shift+enter) |

## Permissions
| Command | Description |
|---------|-------------|
| /allow-all | Enable all permissions (tools, paths, and URLs) |
| /add-dir | Add a directory to the allowed list for file access |
| /list-dirs | Display all allowed directories for file access |
| /cwd | Change working directory or show current directory |
| /reset-allowed-tools | Reset the list of allowed tools |

## Session
| Command | Description |
|---------|-------------|
| /resume | Switch to a different session (optionally specify session ID) |
| /rename | Rename the current session (alias for /session rename) |
| /context | Show context window token usage and visualization |
| /usage | Display session usage metrics and statistics |
| /session | Show session info and workspace summary. Use subcommands for details. |
| /compact | Summarize conversation history to reduce context window usage |
| /share | Share session or research report to markdown file or GitHub gist |
| /copy | Copy the last response to the clipboard |

## Help and feedback
| Command | Description |
|---------|-------------|
| /help | Show help for interactive commands |
| /changelog | Display changelog for CLI versions. Add 'summarize' to get an AI summary. |
| /feedback | Provide feedback about the CLI |
| /theme | View or set color mode |
| /update | Update the CLI to the latest version |
| /version | Display version information and check for updates |
| /experimental | Show available experimental features, or enable/disable experimental mode |
| /clear | Clear the conversation history |
| /instructions | View and toggle custom instruction files |
| /streamer-mode | Toggle streamer mode (hides preview model names and quota details for streaming) |

## Other commands
| Command | Description |
|---------|-------------|
| /exit, /quit | Exit the CLI |
| /login | Log in to Copilot |
| /logout | Log out of Copilot |
| /plan | Create an implementation plan before coding |
| /research | Run deep research investigation using GitHub search and web sources |
| /restart | Restart the CLI, preserving the current session |
| /user | Manage GitHub user list |

*Run with --experimental or use /experimental for more commands*

## Copilot instruction file locations
Copilot respects instructions from these locations:
- `CLAUDE.md`
- `GEMINI.md`
- `AGENTS.md` (in git root & cwd)
- `.github/instructions/**/*.instructions.md` (in git root & cwd)
- `.github/copilot-instructions.md`
- `$HOME/.copilot/copilot-instructions.md`
- Additional directories via `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` environment variable
