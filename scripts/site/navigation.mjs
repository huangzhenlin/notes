import fs from 'node:fs'
import path from 'node:path'
import {
  knowledgeRoot,
  ignoredDirectories,
  sortEntries,
  isDocFile,
  pageTitle,
  stripNumericPrefix,
  stripTopLevelPrefix,
  topLevelCode
} from './shared.mjs'

export function topLevelEntries() {
  return sortEntries(
    fs.readdirSync(knowledgeRoot, { withFileTypes: true }).filter((entry) =>
      entry.isDirectory() &&
      /^0[1-9]-/.test(entry.name) &&
      !ignoredDirectories.has(entry.name)
    )
  )
}

export function firstDocumentRoute(directory, routeMap) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true }).filter(
      (entry) => !ignoredDirectories.has(entry.name)
    )
  )

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      const nestedRoute = firstDocumentRoute(entryPath, routeMap)
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

export function collectDirectoryRoutes(directory, routeMap, titleRouteMap) {
  const entries = sortEntries(
    fs.readdirSync(directory, { withFileTypes: true }).filter(
      (entry) => !ignoredDirectories.has(entry.name)
    )
  )

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const entryPath = path.join(directory, entry.name)
    const routePath = firstDocumentRoute(entryPath, routeMap)
    if (routePath && !titleRouteMap.has(entry.name)) {
      titleRouteMap.set(entry.name, routePath)
    }

    collectDirectoryRoutes(entryPath, routeMap, titleRouteMap)
  }
}

export function buildItems(directory, routeMap) {
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
    const childItems = buildItems(directoryPath, routeMap)

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

export function buildNav(topDirectories, routeMap) {
  return topDirectories.map((entry) => ({
    text: stripTopLevelPrefix(entry.name),
    link: firstDocumentRoute(path.join(knowledgeRoot, entry.name), routeMap) ?? '/'
  }))
}

export function buildSidebar(topDirectories, routeMap) {
  return Object.fromEntries(
    topDirectories.map((entry) => [
      `/${topLevelCode(entry.name)}/`,
      sortEntries(
        fs.readdirSync(path.join(knowledgeRoot, entry.name), { withFileTypes: true }).filter(
          (child) => child.isDirectory() && !ignoredDirectories.has(child.name)
        )
      ).map((child) => ({
        text: stripNumericPrefix(child.name),
        collapsed: false,
        items: buildItems(path.join(knowledgeRoot, entry.name, child.name), routeMap)
      }))
    ])
  )
}
