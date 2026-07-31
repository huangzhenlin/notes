import path from 'node:path'

export const projectRoot = process.cwd()
export const knowledgeRoot = path.join(projectRoot, 'knowledge')
export const contentRoot = path.join(projectRoot, '.vitepress/.content')
export const publicSourceRoot = path.join(projectRoot, 'public')
export const publicContentRoot = path.join(contentRoot, 'public')
export const navOutputPath = path.join(projectRoot, '.vitepress/nav.json')
export const sidebarOutputPath = path.join(projectRoot, '.vitepress/sidebar.json')

export const ignoredDirectories = new Set([
  '.git',
  '.obsidian',
  '.agents',
  '.codex',
  '.vitepress',
  'node_modules'
])

export function sortEntries(entries) {
  return entries.sort((a, b) =>
    a.name.localeCompare(b.name, 'zh-CN', { numeric: true })
  )
}

export function pageTitle(fileName) {
  return fileName.replace(/\.md$/i, '')
}

export function stripTopLevelPrefix(value) {
  return value.replace(/^\d+-/, '')
}

export function stripNumericPrefix(value) {
  return value.replace(/^\d+(?:\.\d+)*\.?\s*/, '')
}

export function extractNumericPrefix(value) {
  const match = value.match(/^(\d+(?:\.\d+)*)/)
  return match ? match[1] : null
}

export function topLevelCode(directoryName) {
  const match = directoryName.match(/^(\d+)/)
  if (!match) {
    throw new Error(`无法从顶级目录提取编号: ${directoryName}`)
  }
  return match[1]
}

export function isMarkdownFile(entry) {
  return entry.isFile() && entry.name.toLowerCase().endsWith('.md')
}

export function isDocFile(entry) {
  return isMarkdownFile(entry) && entry.name !== 'README.md' && entry.name !== 'AGENTS.md'
}

export function contentFilePathFromRoute(routePath) {
  const relativeRoute = routePath.replace(/^\//, '')
  return path.join(contentRoot, relativeRoute, 'index.md')
}
