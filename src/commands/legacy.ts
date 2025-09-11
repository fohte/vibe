import { spawn } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const legacyCommand = (args: string[]): void => {
  const scriptPath = resolve(__dirname, '../../scripts/vibe.sh')

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
