import { execa } from 'execa'
import { existsSync } from 'fs'
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

  async status(): Promise<GitStatus> {
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

    return {
      isClean: !hasChanges,
      branch,
      hasUncommittedChanges: hasChanges,
      hasUntrackedFiles,
    }
  }

  async createWorktree(
    name: string,
    baseBranch = 'origin/master',
  ): Promise<string> {
    const worktreePath = join(this.repoPath, '.worktrees', name)
    const branchName = `claude/${name}`

    if (existsSync(worktreePath)) {
      throw new GitError(`Worktree ${name} already exists`)
    }

    try {
      await execa(
        'git',
        ['worktree', 'add', '-b', branchName, worktreePath, baseBranch],
        {
          cwd: this.repoPath,
        },
      )
    } catch (error) {
      throw new GitError(
        `Failed to create worktree: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    return worktreePath
  }

  async removeWorktree(name: string, force = false): Promise<void> {
    const worktreePath = join(this.repoPath, '.worktrees', name)

    if (!existsSync(worktreePath)) {
      throw new GitError(`Worktree ${name} does not exist`)
    }

    const args = ['worktree', 'remove', worktreePath]
    if (force) {
      args.push('--force')
    }

    try {
      await execa('git', args, { cwd: this.repoPath })
    } catch (error) {
      throw new GitError(
        `Failed to remove worktree: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async listWorktrees(): Promise<Worktree[]> {
    const { stdout } = await execa('git', ['worktree', 'list', '--porcelain'], {
      cwd: this.repoPath,
    })

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

    return worktrees
  }

  async deleteBranch(branchName: string, force = false): Promise<void> {
    const args = ['branch', force ? '-D' : '-d', branchName]

    try {
      await execa('git', args, { cwd: this.repoPath })
    } catch (error) {
      throw new GitError(
        `Failed to delete branch: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async isBranchMerged(branchName: string): Promise<boolean> {
    try {
      const { stdout } = await execa('git', ['branch', '--merged', 'master'], {
        cwd: this.repoPath,
      })

      return stdout.split('\n').some((line) => line.trim() === branchName)
    } catch (error) {
      throw new GitError(
        `Failed to check merge status: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async getCurrentBranch(): Promise<string> {
    const { stdout } = await execa('git', ['branch', '--show-current'], {
      cwd: this.repoPath,
    })

    return stdout.trim()
  }

  async checkoutBranch(branchName: string): Promise<void> {
    try {
      await execa('git', ['checkout', branchName], { cwd: this.repoPath })
    } catch (error) {
      throw new GitError(
        `Failed to checkout branch: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
