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
            <th>Vehicle Name / Model</th>
            <th>Vehicle Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.name || vehicle.model}</td>
              <td>{vehicle.number || vehicle.vehicleNumber}</td>
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
