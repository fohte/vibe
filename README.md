# vibe

> [!WARNING]
> This project is currently under development. Phase 1 (core functionality) has been completed, but the CLI commands are not yet functional.

`vibe` is a sophisticated wrapper for Claude Code that manages git worktrees and tmux sessions for isolated development environments.

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

# Build the TypeScript code
npm run build

# Link globally (coming in Phase 2)
# npm link
```

> [!NOTE]
> The CLI is not yet functional. Global installation will be available after Phase 2 implementation.

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
- **Neverthrow**: Functional error handling with Result types

### Module Structure

```
src/
├── cli.ts              # Main CLI entry point
├── commands/           # Command implementations (Phase 2)
│   ├── start.ts        # Start command implementation
│   ├── done.ts         # Done command implementation
│   └── list.ts         # List command implementation
├── lib/                # Core functionality modules
│   ├── git.ts          # Git operations with Result types
│   ├── tmux.ts         # Tmux session management with Result types
│   ├── claude.ts       # Claude Code integration (Phase 3)
│   └── ai.ts           # AI name generation (Phase 3)
├── utils/              # Utility modules (Phase 2)
│   ├── config.ts       # Configuration management
│   ├── logger.ts       # Logging utilities
│   └── errors.ts       # Error handling
└── types/
    └── index.ts        # TypeScript type definitions
```

## Current Implementation Status

### Completed (Phase 1)

The core foundation has been implemented with:

- **CLI Framework**: Basic command structure using Commander.js with `start`, `done`, and `list` commands (not yet functional)
- **Git Module** (`src/lib/git.ts`): Complete implementation with Result types for:
  - Worktree creation and removal
  - Branch management (create, delete, checkout)
  - Status checking and merge verification
  - Listing existing worktrees
  - All operations return `Result<T, GitError>` for type-safe error handling
- **Tmux Module** (`src/lib/tmux.ts`): Full tmux integration with Result types including:
  - Session and window management
  - Window creation, selection, and removal
  - Detecting current tmux context
  - Sending commands to windows
  - All operations return `Result<T, TmuxError>` for consistent error handling
- **Type Definitions** (`src/types/index.ts`): Complete TypeScript interfaces for all components
- **Build System**: TypeScript compilation configured with proper module resolution

### Next Steps

The project is ready for Phase 2 implementation, which will make the CLI commands functional by connecting them to the core modules.

## Development Roadmap

### Phase 1: Core Functionality ✅

- [x] Project setup and README
- [x] Basic CLI structure with Commander.js
- [x] Git operations module
- [x] Tmux integration module

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

- Node.js
- Git
- Tmux
- Claude Code CLI (`claude`)
- `ghq` - for repository management

## License

MIT
