import PageHeader from '../../components/common/PageHeader'

function SalesPage() {
  return (
    <section className="surface-panel">
      <PageHeader
        title="Sales"
        subtitle="Billing and invoice workflows are planned, but there is no sales backend module yet."
      />
      <div className="feature-status-grid">
        <div className="feature-status-card">
          <h3>Invoices</h3>
          <p>Requires invoice entities, numbering, totals, and payment status.</p>
        </div>
        <div className="feature-status-card">
          <h3>Payments</h3>
          <p>No payment records or settlement flow exists yet.</p>
        </div>
        <div className="feature-status-card">
          <h3>Loyalty</h3>
          <p>Discount rules need real customer purchase history first.</p>
        </div>
      </div>
    </section>
  )
}

export default SalesPage
