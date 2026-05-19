function AuthForm({ title, subtitle, children, footer, sidePanelTitle, sidePanelSubtitle }) {
  return (
    <main className="auth-page">
      <div className="auth-container">

        {/* Left Side: Image panel with solid content block */}
        <section className="auth-side-panel" style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'var(--space-12)'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 35%, rgba(0,0,0,0.82) 100%)',
            zIndex: 1
          }} />

          <div className="side-panel-content" style={{
            position: 'relative',
            zIndex: 2,
            background: '#171A21',
            border: '1px solid #2B303B',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            maxWidth: '480px',
            color: 'white',
            boxShadow: 'var(--shadow-lg)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
          }}>
            <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--weight-extrabold)', marginBottom: 'var(--space-3)', letterSpacing: '-0.5px' }}>
              {sidePanelTitle || 'Welcome to Partivex'}
            </h2>
            <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
              {sidePanelSubtitle || 'Manage your vehicles and services efficiently.'}
            </p>
          </div>
        </section>

        {/* Right Side: Clean White Form Area */}
        <section className="auth-card">
          <div className="auth-header" style={{ marginBottom: 'var(--space-10)' }}>
            <div className="auth-brand" style={{ marginBottom: 'var(--space-8)', display: 'inline-block' }}>
              Parti<span style={{ color: 'var(--color-primary)' }}>vex</span>
            </div>
            <h1 style={{ fontSize: 'var(--text-5xl)', letterSpacing: '-1px', marginBottom: 'var(--space-2)' }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>{subtitle}</p>}
          </div>

          <div style={{ background: 'white' }}>
            {children}
          </div>

          {footer && (
            <div className="auth-footer" style={{ marginTop: 'var(--space-10)', fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)' }}>
              {footer}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default AuthForm
