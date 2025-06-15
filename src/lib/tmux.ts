import { execa } from 'execa'

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

  async createSession(sessionName = this.sessionName): Promise<void> {
    try {
      await execa('tmux', ['new-session', '-d', '-s', sessionName])
    } catch (error) {
      throw new TmuxError(
        `Failed to create session: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async createWindow(
    windowName: string,
    command?: string,
    sessionName = this.sessionName,
  ): Promise<void> {
    const args = ['new-window', '-t', `${sessionName}:`, '-n', windowName]

    if (command) {
      args.push(command)
    }

    try {
      await execa('tmux', args)
    } catch (error) {
      throw new TmuxError(
        `Failed to create window: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async selectWindow(
    windowName: string,
    sessionName = this.sessionName,
  ): Promise<void> {
    try {
      await execa('tmux', [
        'select-window',
        '-t',
        `${sessionName}:${windowName}`,
      ])
    } catch (error) {
      throw new TmuxError(
        `Failed to select window: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async listWindows(sessionName = this.sessionName): Promise<TmuxWindow[]> {
    try {
      const { stdout } = await execa('tmux', [
        'list-windows',
        '-t',
        sessionName,
        '-F',
        '#{window_id}:#{window_name}:#{window_active}:#{window_panes}',
      ])

      return stdout
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
    } catch (error) {
      throw new TmuxError(
        `Failed to list windows: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async killWindow(
    windowName: string,
    sessionName = this.sessionName,
  ): Promise<void> {
    try {
      await execa('tmux', ['kill-window', '-t', `${sessionName}:${windowName}`])
    } catch (error) {
      throw new TmuxError(
        `Failed to kill window: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async attachSession(sessionName = this.sessionName): Promise<void> {
    try {
      await execa('tmux', ['attach-session', '-t', sessionName])
    } catch (error) {
      throw new TmuxError(
        `Failed to attach session: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async isInsideTmux(): Promise<boolean> {
    return process.env.TMUX !== undefined
  }

  async getCurrentWindow(): Promise<string | null> {
    if (!(await this.isInsideTmux())) {
      return null
    }

    try {
      const { stdout } = await execa('tmux', [
        'display-message',
        '-p',
        '#{window_name}',
      ])
      return stdout.trim()
    } catch {
      return null
    }
  }

  async getCurrentSession(): Promise<string | null> {
    if (!(await this.isInsideTmux())) {
      return null
    }

    try {
      const { stdout } = await execa('tmux', [
        'display-message',
        '-p',
        '#{session_name}',
      ])
      return stdout.trim()
    } catch {
      return null
    }
  }

  async sendKeys(
    windowName: string,
    keys: string,
    sessionName = this.sessionName,
  ): Promise<void> {
    try {
      await execa('tmux', [
        'send-keys',
        '-t',
        `${sessionName}:${windowName}`,
        keys,
        'Enter',
      ])
    } catch (error) {
      throw new TmuxError(
        `Failed to send keys: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async renameWindow(
    oldName: string,
    newName: string,
    sessionName = this.sessionName,
  ): Promise<void> {
    try {
      await execa('tmux', [
        'rename-window',
        '-t',
        `${sessionName}:${oldName}`,
        newName,
      ])
    } catch (error) {
      throw new TmuxError(
        `Failed to rename window: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async listSessions(): Promise<TmuxSession[]> {
    try {
      const { stdout } = await execa('tmux', [
        'list-sessions',
        '-F',
        '#{session_name}:#{session_created}:#{session_windows}:#{session_attached}',
      ])

      return stdout
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
    } catch {
      return []
    }
  }
}
