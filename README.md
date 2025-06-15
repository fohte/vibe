# vibe - Node.js Port

A Node.js implementation of the vibe command - a sophisticated wrapper for Claude Code that manages git worktrees and tmux sessions for isolated development environments.

## Overview

vibe is a CLI tool that streamlines working with Claude Code by:

- Creating isolated git worktrees for each coding session
- Managing tmux sessions and windows for better organization
- Automating branch creation with a consistent naming scheme (`claude/<name>`)
- Tracking pull requests and session status
- Using AI to generate descriptive branch names from task descriptions

## Key Features

### 🌳 Git Worktree Management

- Creates isolated worktrees in `.worktrees/<name>` directory
- Branches from `origin/master` with `claude/` prefix
- Safely removes worktrees and branches when done
- Verifies merge status before cleanup

### 🖥️ Tmux Integration

- Creates/manages a dedicated `vibe` tmux session
- Opens each Claude Code instance in its own tmux window
- Auto-detects current vibe from tmux context
- Handles edge cases like last window closing

### 🤖 AI-Powered Naming

- Generates descriptive branch names from task descriptions
- Uses Claude API for intelligent name generation
- Supports interactive naming via editor

### 📊 Session Tracking

- Lists all active vibe sessions across repositories
- Shows PR status and URLs
- Color-coded status indicators

### 🔗 Claude Code Integration

- Maintains project directory consistency via symlinks
- Passes initial prompts to Claude Code
- Shares GitHub tokens automatically

## Installation

```bash
# Clone the repository
git clone https://github.com/fohte/vibe
cd vibe

# Install dependencies
npm install

# Link globally
npm link
```

## Usage

```bash
# Start a new vibe session with a name
vibe start feature-x

# Start with AI-generated name from description
vibe start -m "Add dark mode support to settings page"

# Start with interactive editor for description
vibe start

# List all active sessions
vibe list

# Finish and cleanup a session
vibe done feature-x

# Force cleanup (skip merge check)
vibe done feature-x --force

# Work in a specific repository
vibe -R dotfiles start bugfix
```

## Architecture

### Technology Stack

- **TypeScript**: For type safety and better developer experience
- **Commander.js**: CLI argument parsing and command routing
- **Execa**: Modern process execution for git and tmux commands
- **Chalk**: Terminal output styling
- **Ora**: Elegant terminal spinners
- **Inquirer**: Interactive prompts
- **Node.js Built-ins**: fs/promises, path, os

### Module Structure

```
src/
├── cli.ts              # Main CLI entry point
├── commands/
│   ├── start.ts        # Start command implementation
│   ├── done.ts         # Done command implementation
│   └── list.ts         # List command implementation
├── lib/
│   ├── git.ts          # Git operations
│   ├── tmux.ts         # Tmux session management
│   ├── claude.ts       # Claude Code integration
│   └── ai.ts           # AI name generation
├── utils/
│   ├── config.ts       # Configuration management
│   ├── logger.ts       # Logging utilities
│   └── errors.ts       # Error handling
└── types/
    └── index.ts        # TypeScript type definitions
```

## Development Roadmap

### Phase 1: Core Functionality ✅

- [x] Project setup and README
- [ ] Basic CLI structure with Commander.js
- [ ] Git operations module
- [ ] Tmux integration module

### Phase 2: Command Implementation

- [ ] `start` command with basic functionality
- [ ] `done` command with cleanup
- [ ] `list` command with table output
- [ ] Error handling and validation

### Phase 3: Advanced Features

- [ ] AI-powered name generation
- [ ] Claude Code project symlink management
- [ ] GitHub PR integration
- [ ] Interactive prompts and editor support

### Phase 4: Polish

- [ ] Comprehensive test suite
- [ ] Performance optimizations
- [ ] Better error messages
- [ ] Configuration file support
- [ ] Plugin system for extensions

## Requirements

- Node.js 18+ (for native fetch API)
- Git
- Tmux
- Claude Code CLI (`claude`)
- GitHub CLI (`gh`) - for PR features
- `ghq` - for repository management

## Configuration

vibe looks for configuration in these locations (in order):

1. `.vibe.json` in the current repository
2. `~/.config/vibe/config.json`
3. Environment variables

### Example Configuration

```json
{
  "defaultBranch": "main",
  "worktreePrefix": ".worktrees",
  "branchPrefix": "claude",
  "tmuxSession": "vibe",
  "ai": {
    "model": "claude-3-opus-20240229",
    "maxTokens": 100
  }
}
```

## Differences from Bash Version

### Improvements

- **Better Error Handling**: Proper error types and stack traces
- **Async/Await**: Modern async patterns instead of callbacks
- **Type Safety**: Full TypeScript support
- **Testing**: Comprehensive test suite
- **Cross-Platform**: Better Windows support (where possible)
- **Performance**: Parallel operations where applicable

### Compatibility

- Maintains full CLI compatibility with bash version
- Same directory structure and naming conventions
- Interoperable with existing vibe sessions

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT

## Acknowledgments

This is a Node.js port of the original bash implementation by @fohte.
