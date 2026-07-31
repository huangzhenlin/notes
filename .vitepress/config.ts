import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

const navPath = path.resolve(process.cwd(), '.vitepress/nav.json')
const sidebarPath = path.resolve(process.cwd(), '.vitepress/sidebar.json')
const nav = fs.existsSync(navPath)
  ? JSON.parse(fs.readFileSync(navPath, 'utf-8'))
  : []
const sidebar = fs.existsSync(sidebarPath)
  ? JSON.parse(fs.readFileSync(sidebarPath, 'utf-8'))
  : []

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
  transformHtml(code) {
    return code.replace(/<title>.*?<\/title>/, '<title>技术知识库</title>')
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
