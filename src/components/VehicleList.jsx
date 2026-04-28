import Button from './ui/Button'

function VehicleList({ vehicles, isReadOnly, onDelete, onEdit }) {
  if (!vehicles.length) {
    return <div className="empty-state">No vehicles found for this customer.</div>
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Vehicle Number</th>
            <th>Model</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.vehicleNumber}</td>
              <td>{vehicle.model}</td>
              <td>
                <div className="table-actions">
                  <Button variant="secondary" onClick={() => onEdit(vehicle)} disabled={isReadOnly}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(vehicle.id)} disabled={isReadOnly}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VehicleList
