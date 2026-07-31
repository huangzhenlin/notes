<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import nav from '../nav.json'

const route = useRoute()
const Layout = DefaultTheme.Layout

function sectionCodeFromPath(path: string) {
  return path.match(/(?:^|\/)(\d+)(?:\/|$)/)?.[1] ?? ''
}

const sectionTitleMap = new Map(
  nav.map((item) => {
    return [sectionCodeFromPath(item.link), item.text]
  })
)

const currentSectionTitle = computed(() => {
  const path = route.path

  if (path === '/' || path === '/index' || path === '/index.html') {
    return '技术知识库'
  }

  const sectionCode = sectionCodeFromPath(path)
  if (!sectionCode) {
    return '技术知识库'
  }

  return sectionTitleMap.get(sectionCode) ?? '技术知识库'
})
</script>

<template>
  <Layout>
    <template #nav-bar-title-after>
      <span class="dynamic-site-title">{{ currentSectionTitle }}</span>
    </template>
  </Layout>
</template>
