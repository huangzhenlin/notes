import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const knowledgeRoot = path.join(projectRoot, 'knowledge')
const contentRoot = path.join(projectRoot, '.vitepress/.content')
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

function isMarkdownFile(entry) {
  return entry.isFile() && entry.name.toLowerCase().endsWith('.md')
}

function isDocFile(entry) {
  return isMarkdownFile(entry) && entry.name !== 'README.md' && entry.name !== 'AGENTS.md'
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
  const codeSegments = segments.length > 2 ? segments.slice(2) : segments.slice(1)
  const codes = codeSegments
    .map((segment) => extractNumericPrefix(pageTitle(segment)))
    .filter(Boolean)

  if (codes.length === 0) {
    throw new Error(`无法从路径提取编号: ${relativePath}`)
  }

  return `/${topCode}/${codes.join('/')}/`
}

function contentFilePathFromRoute(routePath) {
  const relativeRoute = routePath.replace(/^\//, '')
  return path.join(contentRoot, relativeRoute, 'index.md')
}

function ensureCleanDirectory(directory) {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
  fs.mkdirSync(directory, { recursive: true })
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

function collectMarkdownFiles(directory) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true }).filter(
      (entry) => !ignoredDirectories.has(entry.name)
    )
  )

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      collectMarkdownFiles(entryPath)
      continue
    }

    if (!isDocFile(entry)) {
      continue
    }

    const routePath = routePathForFile(entryPath)
    if (routePath) {
      routeMap.set(path.resolve(entryPath), routePath)
    }
  }
}

function rewriteMarkdownLinks(markdown, sourceFilePath) {
  return markdown.replace(/\]\(([^)#]+?\.md)(#[^)]+)?\)/g, (fullMatch, targetPath, hash = '') => {
    if (/^(?:[a-z]+:)?\/\//i.test(targetPath)) {
      return fullMatch
    }

    const resolvedPath = path.resolve(path.dirname(sourceFilePath), targetPath)
    const routePath = routeMap.get(resolvedPath)
    if (!routePath) {
      return fullMatch
    }

    return `](${routePath}${hash})`
  })
}

function writeContentPage(routePath, content) {
  const targetPath = contentFilePathFromRoute(routePath)
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, content, 'utf-8')
}

function firstDocumentRoute(directory) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true }).filter(
      (entry) => !ignoredDirectories.has(entry.name)
    )
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

    if (isDocFile(entry)) {
      return routeMap.get(path.resolve(entryPath)) ?? null
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
    const routePath = routeMap.get(path.resolve(filePath))
    if (!routePath) {
      continue
    }

    items.push({
      text: stripNumericPrefix(pageTitle(file.name)),
      link: routePath
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

function generateContent() {
  ensureCleanDirectory(contentRoot)

  const homeSourcePath = path.join(projectRoot, 'index.md')
  const homeContent = fs.readFileSync(homeSourcePath, 'utf-8')
  fs.writeFileSync(path.join(contentRoot, 'index.md'), homeContent, 'utf-8')

  for (const [sourcePath, routePath] of routeMap.entries()) {
    const rawContent = fs.readFileSync(sourcePath, 'utf-8')
    const rewrittenContent = rewriteMarkdownLinks(rawContent, sourcePath)
    writeContentPage(routePath, rewrittenContent)
  }
}

const topDirectories = topLevelEntries()
collectMarkdownFiles(knowledgeRoot)
generateContent()

const nav = topDirectories.map((entry) => ({
  text: stripTopLevelPrefix(entry.name),
  link: firstDocumentRoute(path.join(knowledgeRoot, entry.name)) ?? '/'
}))

const sidebar = Object.fromEntries(
  topDirectories.map((entry) => [
    `/${topLevelCode(entry.name)}/`,
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
