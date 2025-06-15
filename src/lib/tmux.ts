import { execa } from 'execa'
import { err, ok, Result } from 'neverthrow'

export class TmuxError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = 'TmuxError'
  }
}

export interface TmuxSession {
  name: string
  created: string
  windows: number
  attached: boolean
}

export interface TmuxWindow {
  id: string
  name: string
  active: boolean
  panes: number
}

export class Tmux {
  private sessionName = 'vibe'

  async isRunning(): Promise<boolean> {
    try {
      await execa('tmux', ['info'])
      return true
    } catch {
      return false
    }
  }

  async sessionExists(sessionName = this.sessionName): Promise<boolean> {
    try {
      await execa('tmux', ['has-session', '-t', sessionName])
      return true
    } catch {
      return false
    }
  }

  async createSession(
    sessionName = this.sessionName,
  ): Promise<Result<void, TmuxError>> {
    try {
      await execa('tmux', ['new-session', '-d', '-s', sessionName])
      return ok(undefined)
    } catch (error) {
      return err(
        new TmuxError(
          `Failed to create session: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async createWindow(
    windowName: string,
    command?: string,
    sessionName = this.sessionName,
  ): Promise<Result<void, TmuxError>> {
    const args = ['new-window', '-t', `${sessionName}:`, '-n', windowName]

    if (command) {
      args.push(command)
    }

    try {
      await execa('tmux', args)
      return ok(undefined)
    } catch (error) {
      return err(
        new TmuxError(
          `Failed to create window: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async selectWindow(
    windowName: string,
    sessionName = this.sessionName,
  ): Promise<Result<void, TmuxError>> {
    try {
      await execa('tmux', [
        'select-window',
        '-t',
        `${sessionName}:${windowName}`,
      ])
      return ok(undefined)
    } catch (error) {
      return err(
        new TmuxError(
          `Failed to select window: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async listWindows(
    sessionName = this.sessionName,
  ): Promise<Result<TmuxWindow[], TmuxError>> {
    try {
      const { stdout } = await execa('tmux', [
        'list-windows',
        '-t',
        sessionName,
        '-F',
        '#{window_id}:#{window_name}:#{window_active}:#{window_panes}',
      ])

      const windows = stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [id, name, active, panes] = line.split(':')
          return {
            id: id || '',
            name: name || '',
            active: active === '1',
            panes: parseInt(panes || '0', 10),
          }
        })

      return ok(windows)
    } catch (error) {
      return err(
        new TmuxError(
          `Failed to list windows: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async killWindow(
    windowName: string,
    sessionName = this.sessionName,
  ): Promise<Result<void, TmuxError>> {
    try {
      await execa('tmux', ['kill-window', '-t', `${sessionName}:${windowName}`])
      return ok(undefined)
    } catch (error) {
      return err(
        new TmuxError(
          `Failed to kill window: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async attachSession(
    sessionName = this.sessionName,
  ): Promise<Result<void, TmuxError>> {
    try {
      await execa('tmux', ['attach-session', '-t', sessionName])
      return ok(undefined)
    } catch (error) {
      return err(
        new TmuxError(
          `Failed to attach session: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async isInsideTmux(): Promise<boolean> {
    return process.env.TMUX !== undefined
  }

  async getCurrentWindow(): Promise<Result<string | null, TmuxError>> {
    if (!(await this.isInsideTmux())) {
      return ok(null)
    }

    try {
      const { stdout } = await execa('tmux', [
        'display-message',
        '-p',
        '#{window_name}',
      ])
      return ok(stdout.trim())
    } catch (error) {
      return err(
        new TmuxError(
          `Failed to get current window: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async getCurrentSession(): Promise<Result<string | null, TmuxError>> {
    if (!(await this.isInsideTmux())) {
      return ok(null)
    }

    try {
      const { stdout } = await execa('tmux', [
        'display-message',
        '-p',
        '#{session_name}',
      ])
      return ok(stdout.trim())
    } catch (error) {
      return err(
        new TmuxError(
          `Failed to get current session: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async sendKeys(
    windowName: string,
    keys: string,
    sessionName = this.sessionName,
  ): Promise<Result<void, TmuxError>> {
    try {
      await execa('tmux', [
        'send-keys',
        '-t',
        `${sessionName}:${windowName}`,
        keys,
        'Enter',
      ])
      return ok(undefined)
    } catch (error) {
      return err(
        new TmuxError(
          `Failed to send keys: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async renameWindow(
    oldName: string,
    newName: string,
    sessionName = this.sessionName,
  ): Promise<Result<void, TmuxError>> {
    try {
      await execa('tmux', [
        'rename-window',
        '-t',
        `${sessionName}:${oldName}`,
        newName,
      ])
      return ok(undefined)
    } catch (error) {
      return err(
        new TmuxError(
          `Failed to rename window: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  async listSessions(): Promise<Result<TmuxSession[], TmuxError>> {
    try {
      const { stdout } = await execa('tmux', [
        'list-sessions',
        '-F',
        '#{session_name}:#{session_created}:#{session_windows}:#{session_attached}',
      ])

      const sessions = stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [name, created, windows, attached] = line.split(':')
          return {
            name: name || '',
            created: created || '',
            windows: parseInt(windows || '0', 10),
            attached: attached === '1',
          }
        })

      return ok(sessions)
    } catch (error) {
      // If tmux is not running, return empty array
      if (
        error instanceof Error &&
        error.message.includes('no server running')
      ) {
        return ok([])
      }
      return err(
        new TmuxError(
          `Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }
}
