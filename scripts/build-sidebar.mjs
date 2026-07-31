import fs from 'node:fs'
import path from 'node:path'

const root = path.join(process.cwd(), 'knowledge')
const outputPath = path.join(process.cwd(), '.vitepress/sidebar.json')
const ignoredDirectories = new Set([
  '.git',
  '.obsidian',
  '.agents',
  '.codex',
  '.vitepress',
  'node_modules'
])

function sortEntries(entries) {
  return entries.sort((a, b) =>
    a.name.localeCompare(b.name, 'zh-CN', { numeric: true })
  )
}

function pageLink(filePath) {
  const relativePath = path.relative(root, filePath)
  return `/${relativePath.replace(/\\/g, '/').replace(/\.md$/i, '')}`
}

function pageTitle(fileName) {
  return fileName.replace(/\.md$/i, '')
}

function buildItems(directory) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => !ignoredDirectories.has(entry.name))
  )

  const files = entries.filter(
    (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md')
  )
  const directories = entries.filter((entry) => entry.isDirectory())
  const items = []

  for (const file of files) {
    const filePath = path.join(directory, file.name)
    items.push({
      text: pageTitle(file.name),
      link: pageLink(filePath)
    })
  }

  for (const directoryEntry of directories) {
    const directoryPath = path.join(directory, directoryEntry.name)
    const childItems = buildItems(directoryPath)

    if (childItems.length > 0) {
      items.push({
        text: directoryEntry.name,
        collapsed: true,
        items: childItems
      })
    }
  }

  return items
}

const topLevelDirectories = sortEntries(
  fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) =>
      entry.isDirectory() &&
      /^0[1-9]-/.test(entry.name) &&
      !ignoredDirectories.has(entry.name)
    )
)

const sidebar = [
  {
    text: '总览',
    items: [{ text: '知识库导航', link: '/README' }]
  },
  ...topLevelDirectories.map((entry) => ({
    text: entry.name,
    collapsed: false,
    items: buildItems(path.join(root, entry.name))
  }))
]

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(sidebar, null, 2)}\n`, 'utf-8')
console.log(`Generated ${path.relative(root, outputPath)}`)
