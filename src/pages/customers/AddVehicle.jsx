import { Link, useLocation, useParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import { buildPanelPath } from '../../utils/panelRoutes'

function AddVehicle() {
  const location = useLocation()
  const { id } = useParams()
  const vehiclesPath = buildPanelPath(location.pathname, '/vehicles')

  return (
    <section className="surface-panel">
      <div className="section-heading">
        <PageHeader
          title="Add Vehicle"
          subtitle="Vehicle creation is available from the managed Vehicle workspace."
        />
        <Link className="button" to={`${vehiclesPath}?customerId=${id}`}>
          Open Vehicle Management
        </Link>
      </div>
      <div className="feature-status-card">
        <h3>Use Vehicle Management</h3>
        <p>Select a customer on the Vehicles page to add, update, or delete vehicle records with the real backend API.</p>
      </div>
    </section>
  )
}

export default AddVehicle
