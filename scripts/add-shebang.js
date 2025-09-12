#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const filePath = path.resolve(process.argv[2])
const shebang = '#!/usr/bin/env node\n'

const content = fs.readFileSync(filePath, 'utf8')
const contentWithShebang = shebang + content

fs.writeFileSync(filePath, contentWithShebang)
fs.chmodSync(filePath, 0o755)

console.log(`✅ Added shebang and made ${filePath} executable`)
