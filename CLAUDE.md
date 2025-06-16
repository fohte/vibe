# vibe - Claude Code Instructions

This document contains project-specific instructions for Claude Code development.

## Bash commands

### Build & Development

```bash
npm run build     # Compile TypeScript to dist/
npm run dev       # Watch mode for development
npm run lint      # Run ESLint
npm run format    # Fix formatting (ESLint + Prettier)
npm run test      # Run all tests (type + unit)
```

### Git operations

```bash
git add -A && git commit -m "message"  # Stage and commit all changes
git status                             # Check current changes
```

## Core files

- `src/cli.ts`: Main CLI entry point with Commander.js setup
- `src/lib/git.ts`: Git operations with neverthrow Result types
- `src/lib/tmux.ts`: Tmux session/window management with Result types
- `src/types/index.ts`: TypeScript interfaces for the entire project
- `src/commands/`: Command implementations (Phase 2 - not yet implemented)
- `src/utils/`: Utility modules (Phase 2 - not yet implemented)

## Code style

### Error handling

- Use `neverthrow` Result types for all operations that can fail
- Return `Result<T, Error>` instead of throwing exceptions
- Use custom error classes (GitError, TmuxError) for domain-specific errors

**Good:**

```typescript
async createWorktree(name: string): Promise<Result<string, GitError>> {
  if (existsSync(worktreePath)) {
    return err(new GitError(`Worktree ${name} already exists`))
  }
  // ...
  return ok(worktreePath)
}
```

**Bad:**

```typescript
async createWorktree(name: string): Promise<string> {
  if (existsSync(worktreePath)) {
    throw new GitError(`Worktree ${name} already exists`)
  }
  // ...
  return worktreePath
}
```

### Imports

- Import order is automatically sorted by ESLint
- Group imports: external packages, then internal modules

### Naming conventions

- Commands: `src/commands/<command>.ts`
- Utilities: `src/utils/<utility>.ts`
- Types: Export from `src/types/index.ts`

## Testing instructions

- Run `npm run test:type` for TypeScript type checking
- Run `npm run test:unit` for unit tests (Vitest)
- Always run `npm run lint` before committing

## Warnings

### Pre-commit hooks

- Project uses pre-commit hooks that auto-fix formatting
- If commit fails, stage the auto-fixed files and retry
- Hooks will add newlines at end of files and fix formatting

### ESLint configuration

- Enforces absolute imports - relative imports will error

### Package management

- Project uses npm as package manager
- Use `npm install --save-exact <package>` for exact versions
- Build outputs to `dist/` directory

### TypeScript configuration

- Path aliases configured: `@/*` maps to `src/*`

### Current implementation status

- Phase 1 (core modules) is complete
- Commands in CLI are not yet functional (Phase 2)
- Do not attempt to run `vibe` commands - they will only log "not implemented"

### Error handling patterns

- All Git and Tmux operations return Result types
- Always handle both success and error cases when using these modules
- Use `.match()` or `.isOk()` / `.isErr()` to handle Results

## Repository etiquette

### Commit messages

- Use descriptive commit messages explaining the "why"
- Include emoji footer: 🤖 Generated with [Claude Code]
- Add Co-Authored-By: Claude <noreply@anthropic.com>

### Branch naming

- Feature branches: `claude/<feature-name>`
- This matches the vibe tool's own branch naming convention
