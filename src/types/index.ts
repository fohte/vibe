export interface VibeSession {
  name: string
  worktreePath: string
  branchName: string
  repository: string
  createdAt: Date
  prUrl?: string
  status: 'active' | 'merged' | 'closed'
}

export interface StartCommandOptions {
  message?: string
  repository?: string
}

export interface DoneCommandOptions {
  force?: boolean
  repository?: string
}

export interface ListCommandOptions {
  repository?: string
  all?: boolean
}

export interface GlobalOptions {
  repository?: string
  verbose?: boolean
}

export interface Config {
  defaultRepository?: string
  tmuxSessionName: string
  worktreePrefix: string
  branchPrefix: string
  claudeCommand: string
  ghqRoot?: string
}

export interface AINameGeneratorOptions {
  apiKey?: string
  model?: string
  maxTokens?: number
}

export interface GitHubPullRequest {
  number: number
  title: string
  url: string
  state: 'open' | 'closed' | 'merged'
  mergeable: boolean
  draft: boolean
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
  }
}

export interface ClaudeOptions {
  workingDirectory: string
  prompt?: string
  env?: Record<string, string>
}
