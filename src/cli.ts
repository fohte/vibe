#!/usr/bin/env node

import { Command } from 'commander'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
)

const program = new Command()

program
  .name('vibe')
  .description(
    'A sophisticated wrapper for Claude Code that manages git worktrees and tmux sessions',
  )
  .version(packageJson.version)

program
  .option('-R <repo>', 'specify the repository to work on')
  .option('-v, --verbose', 'enable verbose output')

program
  .command('start [name]')
  .description('Start a new vibe session')
  .option(
    '-m, --message <message>',
    'AI-generate branch name from task description',
  )
  .action(async () => {
    console.log('Start command not implemented yet')
  })

program
  .command('done [name]')
  .description('Finish and cleanup a vibe session')
  .option('-f, --force', 'force cleanup without merge check')
  .action(async () => {
    console.log('Done command not implemented yet')
  })

program
  .command('list')
  .description('List all active vibe sessions')
  .action(async () => {
    console.log('List command not implemented yet')
  })

program.parse()
