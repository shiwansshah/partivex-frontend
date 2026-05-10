import PageHeader from '../../components/common/PageHeader'

function EditCustomer() {
  return (
    <section className="surface-panel">
      <PageHeader
        title="Edit Customer"
        subtitle="Customer profile editing for staff/admin needs a backend update endpoint before this screen can save changes."
      />
      <div className="feature-status-card">
        <h3>Not Connected Yet</h3>
        <p>The backend currently supports customer listing, details, and history reads, but not admin/staff customer profile updates.</p>
      </div>
    </section>
  )
}

export default EditCustomer
