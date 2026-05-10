import PageHeader from '../../components/common/PageHeader'

function CustomerReports() {
  return (
    <section className="surface-panel">
      <PageHeader
        title="Customer Reports"
        subtitle="Report categories are defined in the UI, but report endpoints are not available in the backend yet."
      />
      <div className="feature-status-grid">
        <div className="feature-status-card">
          <h3>Regular Customers</h3>
          <p>Needs service visit or purchase frequency data.</p>
        </div>
        <div className="feature-status-card">
          <h3>High Spenders</h3>
          <p>Needs invoice totals before spending reports can be generated.</p>
        </div>
        <div className="feature-status-card">
          <h3>Credit Customers</h3>
          <p>Needs billing and outstanding balance records.</p>
        </div>
      </div>
    </section>
  )
}

export default CustomerReports
