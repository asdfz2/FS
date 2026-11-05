import { gzipSync } from 'node:zlib'
import { readFile, readdir, stat } from 'node:fs/promises'

const root = new URL('../dist/', import.meta.url)
const assetsDir = new URL('assets/', root)
const html = await readFile(new URL('index.html', root), 'utf8')
const entryMatch = html.match(/<script[^>]+src="\/assets\/([^"]+\.js)"/)

if (!entryMatch) {
  throw new Error('Unable to find the initial JavaScript entry in dist/index.html')
}

const entryPath = new URL(entryMatch[1], assetsDir)
const entry = await readFile(entryPath)
const entryGzip = gzipSync(entry).length
const files = await readdir(assetsDir)
const jsFiles = files.filter((file) => file.endsWith('.js'))
const fontFiles = files.filter(
  (file) => file.startsWith('noto-sans-sc-chinese-simplified-') && file.endsWith('.woff2'),
)

let largestChunk = { name: '', size: 0 }
for (const file of jsFiles) {
  const info = await stat(new URL(file, assetsDir))
  if (info.size > largestChunk.size) largestChunk = { name: file, size: info.size }
}

const limits = {
  entryGzip: 160 * 1024,
  chunkRaw: 500 * 1024,
  chineseFonts: 2,
}

const failures = []
if (entryGzip > limits.entryGzip) {
  failures.push(`entry gzip ${(entryGzip / 1024).toFixed(1)} KB exceeds 160 KB`)
}
if (largestChunk.size > limits.chunkRaw) {
  failures.push(
    `chunk ${largestChunk.name} is ${(largestChunk.size / 1024).toFixed(1)} KB, exceeds 500 KB`,
  )
}
if (fontFiles.length > limits.chineseFonts) {
  failures.push(`${fontFiles.length} Chinese font files emitted, expected at most 2`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(
  `Bundle OK: entry ${(entryGzip / 1024).toFixed(1)} KB gzip, ` +
    `largest chunk ${(largestChunk.size / 1024).toFixed(1)} KB, ` +
    `${fontFiles.length} Chinese font files.`,
)
