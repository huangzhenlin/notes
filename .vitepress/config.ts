import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

const navPath = path.resolve(process.cwd(), '.vitepress/nav.json')
const sidebarPath = path.resolve(process.cwd(), '.vitepress/sidebar.json')
const titlesPath = path.resolve(process.cwd(), '.vitepress/titles.json')
const nav = fs.existsSync(navPath)
  ? JSON.parse(fs.readFileSync(navPath, 'utf-8'))
  : []
const sidebar = fs.existsSync(sidebarPath)
  ? JSON.parse(fs.readFileSync(sidebarPath, 'utf-8'))
  : []
const titles = fs.existsSync(titlesPath)
  ? JSON.parse(fs.readFileSync(titlesPath, 'utf-8'))
  : {}

function sectionCodeFromPath(pagePath: string) {
  return pagePath.replace(/\\/g, '/').match(/^\/?(\d+)\//)?.[1] ?? ''
}

const sectionTitleMap = new Map(
  nav.map((item: { text: string; link: string }) => [
    sectionCodeFromPath(item.link),
    item.text
  ])
)

export default defineConfig({
  srcDir: '.vitepress/.content',
  lang: 'zh-CN',
  title: '技术知识库',
  description: 'huangzhenlin/notes 技术知识库',
  base: '/notes/',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/notes/favicon.svg' }]
  ],
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  transformPageData(pageData) {
    if (pageData.relativePath === 'index.md') {
      return {
        title: '技术知识库',
        titleTemplate: false
      }
    }

    const routePath = `/${pageData.relativePath
      .replace(/\\/g, '/')
      .replace(/\/index\.md$/i, '/')}`
    const sectionTitle = sectionTitleMap.get(
      sectionCodeFromPath(pageData.relativePath)
    )
    const pageTitle = titles[routePath]

    if (!sectionTitle || !pageTitle) {
      return {}
    }

    return {
      title: pageTitle,
      titleTemplate: `:title | ${sectionTitle} | 技术知识库`
    }
  },
  srcExclude: [
    'AGENTS.md',
    '**/.agents/**',
    '**/.codex/**',
    '**/.obsidian/**'
  ],
  themeConfig: {
    logo: undefined,
    siteTitle: false,
    nav: [
      { text: '首页', link: '/' },
      ...nav
    ],
    sidebar,
    outline: {
      level: [2, 4]
    },
    search: {
      provider: 'local'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    lastUpdated: {
      text: '最后更新'
    }
  }
})
