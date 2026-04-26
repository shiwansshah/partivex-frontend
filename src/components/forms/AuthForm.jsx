function AuthForm({ title, subtitle, children, footer }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">Partivex</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {children}

        {footer && <div className="auth-footer">{footer}</div>}
      </section>
    </main>
  )
}

export default AuthForm
