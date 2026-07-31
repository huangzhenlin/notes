import fs from 'node:fs'
import path from 'node:path'
import {
  knowledgeRoot,
  ignoredDirectories,
  pageTitle,
  extractNumericPrefix,
  topLevelCode,
  sortEntries,
  isDocFile
} from './shared.mjs'

export function routePathForFile(filePath) {
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

export function collectMarkdownFiles(directory, routeMap, titleRouteMap) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true }).filter(
      (entry) => !ignoredDirectories.has(entry.name)
    )
  )

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      collectMarkdownFiles(entryPath, routeMap, titleRouteMap)
      continue
    }

    if (!isDocFile(entry)) {
      continue
    }

    const routePath = routePathForFile(entryPath)
    if (!routePath) {
      continue
    }

    const resolvedPath = path.resolve(entryPath)
    routeMap.set(resolvedPath, routePath)

    const title = pageTitle(entry.name)
    if (!titleRouteMap.has(title)) {
      titleRouteMap.set(title, routePath)
    }
  }
}

export function resolveDocumentRoute(target, sourceFilePath, routeMap, titleRouteMap) {
  const normalizedTarget = target.trim().replace(/\\/g, '/')
  const targetWithExtension = normalizedTarget.toLowerCase().endsWith('.md')
    ? normalizedTarget
    : `${normalizedTarget}.md`
  const candidates = []

  if (normalizedTarget.startsWith('/')) {
    candidates.push(path.resolve(knowledgeRoot, targetWithExtension.slice(1)))
  } else {
    candidates.push(path.resolve(path.dirname(sourceFilePath), targetWithExtension))
    candidates.push(path.resolve(knowledgeRoot, targetWithExtension))
  }

  for (const candidate of candidates) {
    const routePath = routeMap.get(candidate)
    if (routePath) {
      return routePath
    }
  }

  return titleRouteMap.get(normalizedTarget) ?? null
}

export function rewriteWikiLinks(markdown, sourceFilePath, routeMap, titleRouteMap) {
  return markdown.replace(
    /\[\[([^|\]#]+)(?:#([^|\]]+))?(?:\|([^\]]+))?\]\]/g,
    (fullMatch, target, heading = '', alias = '') => {
      const routePath = resolveDocumentRoute(
        target,
        sourceFilePath,
        routeMap,
        titleRouteMap
      )
      if (!routePath) {
        return fullMatch
      }

      const label = alias.trim() || target.trim()
      const hash = heading.trim() ? `#${heading.trim()}` : ''
      return `[${label}](${routePath}${hash})`
    }
  )
}

export function rewriteMarkdownLinks(markdown, sourceFilePath, routeMap) {
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
