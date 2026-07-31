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
  srcDir: 'site',
  lang: 'zh-CN',
  title: '技术知识库',
  description: 'huangzhenlin/notes 技术知识库',
  base: '/notes/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  themeConfig: {
    logo: undefined,
    nav: [
      { text: '首页', link: '/' },
      ...nav,
      { text: 'GitHub', link: 'https://github.com/huangzhenlin/notes' }
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
