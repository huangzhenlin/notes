import fs from 'node:fs'
import path from 'node:path'
import {
  contentRoot,
  contentFilePathFromRoute,
  projectRoot,
  publicSourceRoot,
  publicContentRoot
} from './shared.mjs'
import { rewriteMarkdownLinks, rewriteWikiLinks } from './routes.mjs'

function ensureCleanDirectory(directory) {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
  fs.mkdirSync(directory, { recursive: true })
}

function writeContentPage(routePath, content) {
  const targetPath = contentFilePathFromRoute(routePath)
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, content, 'utf-8')
}

export function generateContent(routeMap, titleRouteMap) {
  ensureCleanDirectory(contentRoot)

  const homeSourcePath = path.join(projectRoot, 'index.md')
  const homeContent = fs.readFileSync(homeSourcePath, 'utf-8')
  fs.writeFileSync(path.join(contentRoot, 'index.md'), homeContent, 'utf-8')

  if (fs.existsSync(publicSourceRoot)) {
    fs.cpSync(publicSourceRoot, publicContentRoot, { recursive: true })
  }

  for (const [sourcePath, routePath] of routeMap.entries()) {
    const rawContent = fs.readFileSync(sourcePath, 'utf-8')
    const rewrittenContent = rewriteWikiLinks(
      rewriteMarkdownLinks(rawContent, sourcePath, routeMap),
      sourcePath,
      routeMap,
      titleRouteMap
    )
    writeContentPage(routePath, rewrittenContent)
  }
}
