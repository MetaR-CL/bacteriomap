import { useEffect } from 'react'
import { marked } from 'marked'
import { T } from './data.js'

marked.setOptions({ breaks: true })

const STYLE_ID = 'bm-markdown-styles'

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    .bm-md p { margin: 0 0 0.75em }
    .bm-md p:last-child { margin-bottom: 0 }
    .bm-md strong { font-weight: 600 }
    .bm-md em { font-style: italic }
    .bm-md ul, .bm-md ol { padding-left: 1.4em; margin: 0 0 0.75em }
    .bm-md li { margin-bottom: 0.2em }
    .bm-md code { font-family: 'IBM Plex Mono', monospace; font-size: 12px; background: var(--bgSoft); padding: 1px 4px }
  `
  document.head.appendChild(s)
}

export default function MarkdownView({ content, style }) {
  useEffect(() => { injectStyles() }, [])
  if (!content) return null
  return (
    <div
      className="bm-md"
      style={{ fontFamily: T.serif, fontSize: 14, lineHeight: 1.65, color: 'var(--ink)', ...style }}
      dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
    />
  )
}
