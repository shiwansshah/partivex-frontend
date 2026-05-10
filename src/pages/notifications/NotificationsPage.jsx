import PageHeader from '../../components/common/PageHeader'

function NotificationsPage() {
  return (
    <section className="surface-panel">
      <PageHeader
        title="Notifications"
        subtitle="Notification surfaces are reserved, but alert delivery and AI prediction logic are not implemented yet."
      />
      <div className="feature-status-grid">
        <div className="feature-status-card">
          <h3>Alerts</h3>
          <p>No backend notification table or alert rules exist yet.</p>
        </div>
        <div className="feature-status-card">
          <h3>Email</h3>
          <p>Email delivery needs provider configuration and templates.</p>
        </div>
        <div className="feature-status-card">
          <h3>Predictions</h3>
          <p>AI predictions require historical service or inventory data first.</p>
        </div>
      </div>
    </section>
  )
}

export default NotificationsPage
