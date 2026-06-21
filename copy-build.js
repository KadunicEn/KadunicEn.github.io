const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, 'out')
const destDir = __dirname

try {
  // recursive: true copies folders, force: true overwrites existing files
  fs.cpSync(srcDir, destDir, { recursive: true, force: true })
  console.log('Successfully copied the contents of out/ to the root directory.')
} catch (err) {
  console.error('Error copying build files:', err)
  process.exit(1)
}
