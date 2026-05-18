function formatDate(value) {
  if (!value) return 'Not set'

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString()
}

function formatAmount(value) {
  if (value === null || value === undefined || value === '') return 'Not set'
  if (typeof value === 'number') return value.toLocaleString()

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? String(value) : numericValue.toLocaleString()
}

function resolveHistoryLabel(record) {
  if (typeof record === 'string') return record

  return record.historyType || record.type || record.title || 'History entry'
}

function resolveVehicleLabel(record) {
  if (typeof record === 'string') return 'Not set'

  return record.vehicle?.number || record.vehicleNumber || record.vehicle || 'Not set'
}

function resolveDescription(record) {
  if (typeof record === 'string') return record

  return record.description || record.summary || record.notes || 'Not set'
}

function resolvePaymentStatus(record) {
  if (typeof record === 'string') return 'Not set'

  return record.paymentStatus || record.status || 'Not set'
}

function resolveAmount(record) {
  if (typeof record === 'string') return 'Not set'

  return formatAmount(record.amount ?? record.total ?? record.balance)
}

function resolveDate(record) {
  if (typeof record === 'string') return 'Not set'

  return formatDate(record.date ?? record.createdAt ?? record.recordedAt)
}

function CustomerHistoryTable({ records = [] }) {
  if (records.length === 0) {
    return <div className="customer-empty">No history records have been added yet.</div>
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Vehicle</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Payment Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={record.id ?? `${resolveHistoryLabel(record)}-${index}`}>
              <td>{resolveHistoryLabel(record)}</td>
              <td>{resolveVehicleLabel(record)}</td>
              <td>{resolveDescription(record)}</td>
              <td>{resolveAmount(record)}</td>
              <td>{resolvePaymentStatus(record)}</td>
              <td>{resolveDate(record)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CustomerHistoryTable
