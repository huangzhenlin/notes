import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const knowledgeRoot = path.join(projectRoot, 'knowledge')
const siteRoot = path.join(projectRoot, 'site')
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

function removeDirectory(directory) {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
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

function siteFilePathFromRoute(routePath) {
  const relativeRoute = routePath.replace(/^\//, '')
  return path.join(siteRoot, relativeRoute, 'index.md')
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

function writeSiteFile(routePath, content) {
  const targetPath = siteFilePathFromRoute(routePath)
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, content, 'utf-8')
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

function landingPageContent(title, sections) {
  const lines = [`# ${title}`, '', '## 目录', '']

  for (const section of sections) {
    lines.push(`### ${section.title}`)
    for (const child of section.items) {
      lines.push(`- [${child.title}](${child.link})`)
    }
    lines.push('')
  }

  return `${lines.join('\n').trim()}\n`
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

function sectionChildren(directory) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => !ignoredDirectories.has(entry.name))
  )

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const link = firstDocumentRoute(path.join(directory, entry.name))
      return {
        title: stripNumericPrefix(entry.name),
        link
      }
    })
    .filter((entry) => entry.link)
}

function buildTopLandingPages(entries) {
  for (const entry of entries) {
    const topCode = topLevelCode(entry.name)
    const topPath = path.join(knowledgeRoot, entry.name)
    const secondLevelEntries = sortEntries(
      fs.readdirSync(topPath, { withFileTypes: true })
        .filter((child) => child.isDirectory() && !ignoredDirectories.has(child.name))
    )

    const sections = secondLevelEntries
      .map((child) => ({
        title: stripNumericPrefix(child.name),
        items: sectionChildren(path.join(topPath, child.name))
      }))
      .filter((section) => section.items.length > 0)

    writeSiteFile(`/${topCode}`, landingPageContent(stripTopLevelPrefix(entry.name), sections))
  }
}

function generateSiteContent(entries) {
  removeDirectory(siteRoot)
  fs.mkdirSync(siteRoot, { recursive: true })

  const homeSourcePath = path.join(projectRoot, 'index.md')
  const firstTopEntry = entries[0]
  const firstTopRoute = firstTopEntry ? `/${topLevelCode(firstTopEntry.name)}/` : '/'
  const homeContent = fs.readFileSync(homeSourcePath, 'utf-8')
    .replace(/link:\s*\/[^\n]+/, `link: ${firstTopRoute}`)
  fs.writeFileSync(path.join(siteRoot, 'index.md'), homeContent, 'utf-8')

  buildTopLandingPages(entries)

  for (const [sourcePath, routePath] of routeMap.entries()) {
    const rawContent = fs.readFileSync(sourcePath, 'utf-8')
    const rewrittenContent = rewriteMarkdownLinks(rawContent, sourcePath)
    writeSiteFile(routePath, rewrittenContent)
  }
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

const topDirectories = topLevelEntries()

collectMarkdownFiles(knowledgeRoot)
generateSiteContent(topDirectories)

const nav = topDirectories.map((entry) => ({
  text: stripTopLevelPrefix(entry.name),
  link: `/${topLevelCode(entry.name)}/`
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

fs.mkdirSync(path.dirname(navOutputPath), { recursive: true })
fs.writeFileSync(navOutputPath, `${JSON.stringify(nav, null, 2)}\n`, 'utf-8')
fs.writeFileSync(sidebarOutputPath, `${JSON.stringify(sidebar, null, 2)}\n`, 'utf-8')
console.log(`Generated ${path.relative(projectRoot, navOutputPath)} and ${path.relative(projectRoot, sidebarOutputPath)}`)
