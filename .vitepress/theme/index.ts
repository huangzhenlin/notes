import DefaultTheme from 'vitepress/theme'
import { h, nextTick, watch } from 'vue'
import { inBrowser, useData, useRoute } from 'vitepress'
import Layout from './Layout.vue'
import './custom.css'

let mermaidModulePromise: Promise<typeof import('mermaid')> | null = null

function getMermaidModule() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import('mermaid')
  }
  return mermaidModulePromise
}

async function renderMermaidDiagrams(isDark: boolean) {
  if (!inBrowser) {
    return
  }

  const { default: mermaid } = await getMermaidModule()
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'loose'
  })

  const wrappers = Array.from(
    document.querySelectorAll<HTMLElement>('.vp-doc .mermaid-diagram')
  )

  for (const wrapper of wrappers) {
    const source = wrapper.dataset.source ?? ''
    wrapper.innerHTML = ''

    const container = document.createElement('div')
    container.className = 'mermaid'
    container.textContent = source
    wrapper.appendChild(container)
  }

  await mermaid.run({
    nodes: Array.from(document.querySelectorAll('.vp-doc .mermaid-diagram .mermaid'))
  })
}

function prepareMermaidBlocks() {
  if (!inBrowser) {
    return
  }

  const codeBlocks = Array.from(
    document.querySelectorAll<HTMLElement>('.vp-doc pre code.language-mermaid')
  )

  for (const codeBlock of codeBlocks) {
    const pre = codeBlock.parentElement
    if (!pre || pre.parentElement?.classList.contains('mermaid-diagram')) {
      continue
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'mermaid-diagram'
    wrapper.dataset.source = codeBlock.textContent ?? ''
    pre.replaceWith(wrapper)
  }
}

export default {
  extends: DefaultTheme,
  Layout() {
    const route = useRoute()
    const { isDark } = useData()

    const run = async () => {
      await nextTick()
      prepareMermaidBlocks()
      await renderMermaidDiagrams(isDark.value)
    }

    if (inBrowser) {
      watch(
        [() => route.path, () => isDark.value],
        () => {
          void run()
        },
        { immediate: true }
      )
    }

    return h(Layout)
  }
}
