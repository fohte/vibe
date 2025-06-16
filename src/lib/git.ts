import { execa } from 'execa'
import { existsSync } from 'fs'
import { err, ok, Result } from 'neverthrow'
import { join } from 'path'

export class GitError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = 'GitError'
  }
}

export interface GitStatus {
  isClean: boolean
  branch: string
  hasUncommittedChanges: boolean
  hasUntrackedFiles: boolean
}

export interface Worktree {
  path: string
  branch: string
  commit: string
}

export class Git {
  constructor(private repoPath: string) {}

  async status(): Promise<Result<GitStatus, GitError>> {
    try {
      const { stdout: branch } = await execa(
        'git',
        ['branch', '--show-current'],
        {
          cwd: this.repoPath,
        },
      )

      const { stdout: statusOutput } = await execa(
        'git',
        ['status', '--porcelain'],
        {
          cwd: this.repoPath,
        },
      )

      const hasChanges = statusOutput.trim().length > 0
      const hasUntrackedFiles = statusOutput
        .split('\n')
        .some((line) => line.startsWith('??'))

      return ok({
        isClean: !hasChanges,
        branch,
        hasUncommittedChanges: hasChanges,
        hasUntrackedFiles,
      })
    } catch (error) {
      return err(
        new GitError(
          `Failed to get status: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async createWorktree(
    name: string,
    baseBranch = 'origin/master',
  ): Promise<Result<string, GitError>> {
    const worktreePath = join(this.repoPath, '.worktrees', name)
    const branchName = `claude/${name}`

    if (existsSync(worktreePath)) {
      return err(new GitError(`Worktree ${name} already exists`))
    }

    try {
      await execa(
        'git',
        ['worktree', 'add', '-b', branchName, worktreePath, baseBranch],
        {
          cwd: this.repoPath,
        },
      )
      return ok(worktreePath)
    } catch (error) {
      return err(
        new GitError(
          `Failed to create worktree: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async removeWorktree(
    name: string,
    force = false,
  ): Promise<Result<void, GitError>> {
    const worktreePath = join(this.repoPath, '.worktrees', name)

    if (!existsSync(worktreePath)) {
      return err(new GitError(`Worktree ${name} does not exist`))
    }

    const args = ['worktree', 'remove', worktreePath]
    if (force) {
      args.push('--force')
    }

    try {
      await execa('git', args, { cwd: this.repoPath })
      return ok(undefined)
    } catch (error) {
      return err(
        new GitError(
          `Failed to remove worktree: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async listWorktrees(): Promise<Result<Worktree[], GitError>> {
    try {
      const { stdout } = await execa(
        'git',
        ['worktree', 'list', '--porcelain'],
        {
          cwd: this.repoPath,
        },
      )

      const worktrees: Worktree[] = []
      const lines = stdout.split('\n')
      let currentWorktree: Partial<Worktree> = {}

      for (const line of lines) {
        if (line.startsWith('worktree ')) {
          currentWorktree.path = line.substring(9)
        } else if (line.startsWith('HEAD ')) {
          currentWorktree.commit = line.substring(5)
        } else if (line.startsWith('branch ')) {
          currentWorktree.branch = line.substring(7)
        } else if (line === '') {
          if (currentWorktree.path) {
            worktrees.push(currentWorktree as Worktree)
            currentWorktree = {}
          }
        }
      }

      if (currentWorktree.path) {
        worktrees.push(currentWorktree as Worktree)
      }

      return ok(worktrees)
    } catch (error) {
      return err(
        new GitError(
          `Failed to list worktrees: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async deleteBranch(
    branchName: string,
    force = false,
  ): Promise<Result<void, GitError>> {
    const args = ['branch', force ? '-D' : '-d', branchName]

    try {
      await execa('git', args, { cwd: this.repoPath })
      return ok(undefined)
    } catch (error) {
      return err(
        new GitError(
          `Failed to delete branch: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async isBranchMerged(branchName: string): Promise<Result<boolean, GitError>> {
    try {
      const { stdout } = await execa('git', ['branch', '--merged', 'master'], {
        cwd: this.repoPath,
      })

      return ok(stdout.split('\n').some((line) => line.trim() === branchName))
    } catch (error) {
      return err(
        new GitError(
          `Failed to check merge status: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async getCurrentBranch(): Promise<Result<string, GitError>> {
    try {
      const { stdout } = await execa('git', ['branch', '--show-current'], {
        cwd: this.repoPath,
      })

      return ok(stdout.trim())
    } catch (error) {
      return err(
        new GitError(
          `Failed to get current branch: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async checkoutBranch(branchName: string): Promise<Result<void, GitError>> {
    try {
      await execa('git', ['checkout', branchName], { cwd: this.repoPath })
      return ok(undefined)
    } catch (error) {
      return err(
        new GitError(
          `Failed to checkout branch: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }
}
