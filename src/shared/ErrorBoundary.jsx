import React from 'react'

// Catches render/lifecycle errors in the active screen so a single broken
// component shows a recoverable message instead of a blank white app.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Bacteriomap crashed:', error, info)
  }

  componentDidUpdate(prevProps) {
    // Clear the error whenever the boundary's children change (e.g. navigate() swapped routes)
    if (this.state.error && prevProps.children !== this.props.children) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: 40, textAlign: 'center', fontFamily: '"Newsreader", serif', color: 'var(--ink)', background: 'var(--bg)',
        }}>
          <div style={{ fontSize: 22, fontStyle: 'italic' }}>Une erreur est survenue.</div>
          <div style={{ fontSize: 14, color: 'var(--ink3)', maxWidth: 440 }}>
            Cette page a rencontré un problème inattendu. Vous pouvez retourner à l'accueil et réessayer.
          </div>
          <button
            onClick={() => { this.setState({ error: null }); this.props.onReset?.() }}
            style={{
              marginTop: 8, padding: '10px 20px', background: 'var(--accent)', color: 'var(--paper)',
              border: 'none', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer',
            }}
          >
            ← RETOUR À L'ACCUEIL
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
