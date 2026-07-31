import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const knowledgeRoot = path.join(projectRoot, 'knowledge')
const navOutputPath = path.join(projectRoot, '.vitepress/nav.json')
const sidebarOutputPath = path.join(projectRoot, '.vitepress/sidebar.json')
const rewritesOutputPath = path.join(projectRoot, '.vitepress/rewrites.json')
const ignoredDirectories = new Set([
  '.git',
  '.obsidian',
  '.agents',
  '.codex',
  '.vitepress',
  'node_modules'
])
const routeMap = new Map()

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

function extractNumericPrefix(value) {
  const match = value.match(/^(\d+(?:\.\d+)*)/)
  return match ? match[1] : null
}

function topLevelCode(directoryName) {
  const match = directoryName.match(/^(\d+)/)
  if (!match) {
    throw new Error(`无法从顶级目录提取编号: ${directoryName}`)
  }
  return match[1]
}

function routePathForFile(filePath) {
  const relativePath = path.relative(knowledgeRoot, filePath)
  const segments = relativePath.split(path.sep)

  if (segments.length === 1 && segments[0] === 'README.md') {
    return null
  }

  if (segments.length < 2) {
    throw new Error(`无法为文件生成路由: ${relativePath}`)
  }

  const topCode = topLevelCode(segments[0])
  const parentCode = extractNumericPrefix(segments[segments.length - 2])
  const fileCode = extractNumericPrefix(pageTitle(segments[segments.length - 1]))

  if (!parentCode || !fileCode) {
    throw new Error(`无法从路径提取编号: ${relativePath}`)
  }

  return `/${topCode}/${parentCode}/${fileCode}`
}

function collectMarkdownFiles(directory) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => !ignoredDirectories.has(entry.name))
  )

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      collectMarkdownFiles(entryPath)
      continue
    }

    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) {
      continue
    }

    if (entry.name === 'AGENTS.md') {
      continue
    }

    const routePath = routePathForFile(entryPath)
    if (routePath) {
      routeMap.set(path.resolve(entryPath), routePath)
    }
  }
}

function firstDocumentRoute(directory) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => !ignoredDirectories.has(entry.name))
  )

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      const nestedRoute = firstDocumentRoute(entryPath)
      if (nestedRoute) {
        return nestedRoute
      }
      continue
    }

    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md') || entry.name === 'AGENTS.md') {
      continue
    }

    return routeMap.get(path.resolve(entryPath)) ?? null
  }

  return null
}

function pageLink(filePath) {
  const routePath = routeMap.get(path.resolve(filePath))
  if (!routePath) {
    throw new Error(`未找到文档对应的路由: ${filePath}`)
  }
  return routePath
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
      text: stripNumericPrefix(pageTitle(file.name)),
      link: pageLink(filePath)
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

function topLevelEntries() {
  return sortEntries(
    fs.readdirSync(knowledgeRoot, { withFileTypes: true })
      .filter((entry) =>
        entry.isDirectory() &&
        /^0[1-9]-/.test(entry.name) &&
        !ignoredDirectories.has(entry.name)
      )
  )
}

const topDirectories = topLevelEntries()

collectMarkdownFiles(knowledgeRoot)

const nav = topDirectories.map((entry) => ({
  text: stripTopLevelPrefix(entry.name),
  link: firstDocumentRoute(path.join(knowledgeRoot, entry.name)) ?? '/'
}))

const sidebar = Object.fromEntries(
  topDirectories.map((entry) => [
    `/${topLevelCode(entry.name)}/`,
    sortEntries(
      fs.readdirSync(path.join(knowledgeRoot, entry.name), { withFileTypes: true })
        .filter((child) => child.isDirectory() && !ignoredDirectories.has(child.name))
    ).map((child) => ({
      text: stripNumericPrefix(child.name),
      collapsed: false,
      items: buildItems(path.join(knowledgeRoot, entry.name, child.name))
    }))
  ])
)

const rewrites = Object.fromEntries(
  [...routeMap.entries()].map(([sourcePath, routePath]) => {
    const relativePath = path.relative(knowledgeRoot, sourcePath)
      .replace(/\\/g, '/')
      .replace(/\.md$/i, '')

    return [relativePath, routePath.replace(/^\//, '')]
  })
)

fs.mkdirSync(path.dirname(navOutputPath), { recursive: true })
fs.writeFileSync(navOutputPath, `${JSON.stringify(nav, null, 2)}\n`, 'utf-8')
fs.writeFileSync(sidebarOutputPath, `${JSON.stringify(sidebar, null, 2)}\n`, 'utf-8')
fs.writeFileSync(rewritesOutputPath, `${JSON.stringify(rewrites, null, 2)}\n`, 'utf-8')
console.log(
  `Generated ${path.relative(projectRoot, navOutputPath)}, ${path.relative(projectRoot, sidebarOutputPath)} and ${path.relative(projectRoot, rewritesOutputPath)}`
)
