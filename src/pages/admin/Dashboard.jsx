function Dashboard() {
  return (
    <div className="stack">
      <section className="card inventory-hero">
        <div className="inventory-hero-copy">
          <span className="auth-brand">Partivex</span>
          <h2>Dashboard</h2>
          <p>
            Track the current operational snapshot, then move into inventory monitoring to
            review live stock and recent stock movements.
          </p>
        </div>
      </section>

      <section className="card">
        <div className="page-header">
          <h2>Operations Snapshot</h2>
          <p>Quick view of the core administration areas defined in the coursework workflow.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Staff</span>
            <strong>12</strong>
          </div>
          <div className="stat-card">
            <span>Customers</span>
            <strong>248</strong>
          </div>
          <div className="stat-card">
            <span>Vehicles</span>
            <strong>319</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
