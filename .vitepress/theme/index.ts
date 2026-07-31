import DefaultTheme from 'vitepress/theme'
import { inBrowser, onContentUpdated } from 'vitepress'
import Layout from './Layout.vue'
import './custom.css'

let mermaidModulePromise: Promise<typeof import('mermaid')> | null = null

function getMermaidModule() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import('mermaid')
  }
  return mermaidModulePromise
}

function isDarkMode() {
  return document.documentElement.classList.contains('dark')
}

async function renderMermaidDiagrams() {
  if (!inBrowser) {
    return
  }

  const { default: mermaid } = await getMermaidModule()
  mermaid.initialize({
    startOnLoad: false,
    theme: isDarkMode() ? 'dark' : 'default',
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

  const blocks = Array.from(
    document.querySelectorAll<HTMLElement>('.vp-doc div.language-mermaid')
  )

  for (const block of blocks) {
    if (block.classList.contains('mermaid-diagram')) {
      continue
    }

    const codeBlock = block.querySelector<HTMLElement>('pre code')
    if (!codeBlock) {
      continue
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'mermaid-diagram'
    wrapper.dataset.source = codeBlock.textContent ?? ''
    block.replaceWith(wrapper)
  }
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ router }) {
    const run = async () => {
      prepareMermaidBlocks()
      await renderMermaidDiagrams()
    }

    if (!inBrowser) {
      return
    }

    onContentUpdated(() => {
      void run()
    })

    router.onAfterRouteChange = async () => {
      void run()
    }

    const observer = new MutationObserver(() => {
      void run()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    void run()
  }
}
