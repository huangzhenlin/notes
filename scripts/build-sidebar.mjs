import fs from 'node:fs'
import path from 'node:path'
import {
  knowledgeRoot,
  navOutputPath,
  projectRoot,
  sidebarOutputPath,
  titlesOutputPath
} from './site/shared.mjs'
import { generateContent } from './site/content.mjs'
import { collectMarkdownFiles } from './site/routes.mjs'
import {
  buildNav,
  buildSidebar,
  collectDirectoryRoutes,
  topLevelEntries
} from './site/navigation.mjs'

const routeMap = new Map()
const titleRouteMap = new Map()
const topDirectories = topLevelEntries()

collectMarkdownFiles(knowledgeRoot, routeMap, titleRouteMap)
collectDirectoryRoutes(knowledgeRoot, routeMap, titleRouteMap)
generateContent(routeMap, titleRouteMap)

const nav = buildNav(topDirectories, routeMap)
const sidebar = buildSidebar(topDirectories, routeMap)
const titles = Object.fromEntries(
  [...routeMap.entries()].map(([sourcePath, routePath]) => {
    const title = sourcePath
      .split('\\')
      .at(-1)
      ?.replace(/\.md$/i, '')
      .replace(/^\d+(?:\.\d+)*\.?\s*/, '') ?? '未命名'

    return [routePath, title]
  })
)

fs.mkdirSync(path.dirname(navOutputPath), { recursive: true })
fs.writeFileSync(navOutputPath, `${JSON.stringify(nav, null, 2)}\n`, 'utf-8')
fs.writeFileSync(sidebarOutputPath, `${JSON.stringify(sidebar, null, 2)}\n`, 'utf-8')
fs.writeFileSync(titlesOutputPath, `${JSON.stringify(titles, null, 2)}\n`, 'utf-8')
console.log(
  `Generated ${path.relative(projectRoot, navOutputPath)}, ${path.relative(projectRoot, sidebarOutputPath)} and ${path.relative(projectRoot, titlesOutputPath)}`
)
