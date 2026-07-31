import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const knowledgeRoot = path.join(projectRoot, 'knowledge')
const navOutputPath = path.join(projectRoot, '.vitepress/nav.json')
const sidebarOutputPath = path.join(projectRoot, '.vitepress/sidebar.json')
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

function pageTitle(fileName) {
  return fileName.replace(/\.md$/i, '')
}

function stripTopLevelPrefix(value) {
  return value.replace(/^\d+-/, '')
}

function stripNumericPrefix(value) {
  return value.replace(/^\d+(?:\.\d+)*\.?\s*/, '')
}

function isMarkdownFile(entry) {
  return entry.isFile() && entry.name.toLowerCase().endsWith('.md')
}

function isDocFile(entry) {
  return isMarkdownFile(entry) && entry.name !== 'README.md' && entry.name !== 'AGENTS.md'
}

function topLevelEntries() {
  return sortEntries(
    fs.readdirSync(knowledgeRoot, { withFileTypes: true }).filter((entry) =>
      entry.isDirectory() &&
      /^0[1-9]-/.test(entry.name) &&
      !ignoredDirectories.has(entry.name)
    )
  )
}

function toRoutePath(filePath) {
  const relativePath = path.relative(knowledgeRoot, filePath)
  const normalizedPath = relativePath.split(path.sep).join('/')
  return `/${normalizedPath.replace(/\.md$/i, '')}`
}

function firstDocumentLink(directory) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true }).filter(
      (entry) => !ignoredDirectories.has(entry.name)
    )
  )

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      const nestedLink = firstDocumentLink(entryPath)
      if (nestedLink) {
        return nestedLink
      }
      continue
    }

    if (isDocFile(entry)) {
      return toRoutePath(entryPath)
    }
  }

  return null
}

function buildItems(directory) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true }).filter(
      (entry) => !ignoredDirectories.has(entry.name)
    )
  )

  const files = entries.filter(isDocFile)
  const directories = entries.filter((entry) => entry.isDirectory())
  const items = []

  for (const file of files) {
    const filePath = path.join(directory, file.name)
    items.push({
      text: stripNumericPrefix(pageTitle(file.name)),
      link: toRoutePath(filePath)
    })
  }

  for (const directoryEntry of directories) {
    const directoryPath = path.join(directory, directoryEntry.name)
    const childItems = buildItems(directoryPath)

    if (childItems.length > 0) {
      items.push({
        text: stripNumericPrefix(directoryEntry.name),
        collapsed: true,
        items: childItems
      })
    }
  }

  return items
}

const topDirectories = topLevelEntries()

const nav = topDirectories.map((entry) => ({
  text: stripTopLevelPrefix(entry.name),
  link: firstDocumentLink(path.join(knowledgeRoot, entry.name)) ?? '/'
}))

const sidebar = Object.fromEntries(
  topDirectories.map((entry) => [
    `/${entry.name}/`,
    sortEntries(
      fs.readdirSync(path.join(knowledgeRoot, entry.name), { withFileTypes: true }).filter(
        (child) => child.isDirectory() && !ignoredDirectories.has(child.name)
      )
    ).map((child) => ({
      text: stripNumericPrefix(child.name),
      collapsed: false,
      items: buildItems(path.join(knowledgeRoot, entry.name, child.name))
    }))
  ])
)

fs.mkdirSync(path.dirname(navOutputPath), { recursive: true })
fs.writeFileSync(navOutputPath, `${JSON.stringify(nav, null, 2)}\n`, 'utf-8')
fs.writeFileSync(sidebarOutputPath, `${JSON.stringify(sidebar, null, 2)}\n`, 'utf-8')
console.log(
  `Generated ${path.relative(projectRoot, navOutputPath)} and ${path.relative(projectRoot, sidebarOutputPath)}`
)
