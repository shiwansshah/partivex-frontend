import PageHeader from '../../components/common/PageHeader'

function AddVehicle() {
  return (
    <section className="surface-panel">
      <PageHeader
        title="Add Vehicle"
        subtitle="Vehicle creation is available from the managed Vehicle workspace."
      />
      <div className="feature-status-card">
        <h3>Use Vehicle Management</h3>
        <p>Select a customer on the Vehicles page to add, update, or delete vehicle records with the real backend API.</p>
      </div>
    </section>
  )
}

export default AddVehicle
