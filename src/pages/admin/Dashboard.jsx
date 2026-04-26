function Dashboard() {
  return (
    <section className="card">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of staff and customer management will be displayed here.</p>
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
  )
}

export default Dashboard
