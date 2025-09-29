import { spawn } from 'child_process'
import { resolve } from 'path'

export const legacyCommand = (args: string[]): void => {
  const projectRoot = process.cwd()
  const scriptPath = resolve(projectRoot, 'scripts/vibe.sh')

  const child = spawn(scriptPath, args, {
    stdio: 'inherit',
    shell: true,
  })

  child.on('error', (error) => {
    console.error(`Failed to execute legacy vibe script: ${error.message}`)
    process.exit(1)
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}
