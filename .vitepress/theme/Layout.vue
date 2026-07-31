<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import nav from '../nav.json'

const route = useRoute()
const Layout = DefaultTheme.Layout

const sectionTitleMap = new Map(
  nav.map((item) => {
    const match = item.link.match(/^\/(\d+)\//)
    return [match?.[1] ?? '', item.text]
  })
)

const currentSectionTitle = computed(() => {
  const path = route.path

  if (path === '/' || path === '/index' || path === '/index.html') {
    return '技术知识库'
  }

  const match = path.match(/^\/(\d+)\//)
  if (!match) {
    return '技术知识库'
  }

  return sectionTitleMap.get(match[1]) ?? '技术知识库'
})
</script>

<template>
  <Layout>
    <template #nav-bar-title-after>
      <span class="dynamic-site-title">{{ currentSectionTitle }}</span>
    </template>
  </Layout>
</template>
