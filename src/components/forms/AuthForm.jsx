function AuthForm({ title, subtitle, children, footer, sidePanelTitle, sidePanelSubtitle }) {
  return (
    <main className="auth-page">
      <div className="auth-container">
        <section className="auth-card">
          <div className="auth-header">
            <div className="auth-brand">
              Parti<span>vex</span>
            </div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          {children}

          {footer && <div className="auth-footer">{footer}</div>}
        </section>

        <section className="auth-side-panel">
          <div className="side-panel-content">
            <h2>{sidePanelTitle || 'Welcome to Partivex'}</h2>
            <p>{sidePanelSubtitle || 'Manage your vehicles and services efficiently.'}</p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthForm
