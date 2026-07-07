import React from 'react'

// <img> with lazy loading + fade-in on load, to smooth out the pop-in of
// large uncompressed images loading behind fast-rendering text content.
export default function FadeImg({ style, onLoad, ...props }) {
  const [loaded, setLoaded] = React.useState(false)
  return (
    <img
      {...props}
      loading="lazy"
      decoding="async"
      onLoad={e => { setLoaded(true); onLoad?.(e) }}
      style={{ ...style, opacity: loaded ? (style?.opacity ?? 1) : 0, transition: 'opacity .25s ease' }}
    />
  )
}
