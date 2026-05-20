import { useEffect, useState } from 'react'
import { approveStaffPartRequest, getCustomerPartCatalog, getStaffPartRequests } from '../../api/customerPartPurchaseApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import { sweetAlert, sweetConfirm } from '../../utils/sweetAlert'

function PartRequestApprovals() {
  const [requests, setRequests] = useState([])
  const [parts, setParts] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [email, setEmail] = useState('')
  const [partId, setPartId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isApproving, setIsApproving] = useState(false)

  async function loadData() {
    const [requestResponse, partsResponse] = await Promise.all([
      getStaffPartRequests(),
      getCustomerPartCatalog(),
    ])
    setRequests(requestResponse.data || [])
    setParts((partsResponse.data || []).filter((part) => part.currentStock > 0))
  }

  useEffect(() => {
    let isCurrent = true
    async function fetchData() {
      try {
        await loadData()
      } catch (err) {
        if (isCurrent) setError(getRequestErrorMessage(err, 'Unable to load customer part requests.'))
      } finally {
        if (isCurrent) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isCurrent = false
    }
  }, [])

  function openApproval(request) {
    setSelectedRequest(request)
    setEmail(request.customerEmail || '')
    setPartId(request.partId ? String(request.partId) : '')
  }

  async function submitApproval(event) {
    event.preventDefault()
    if (!selectedRequest) return
    const confirmed = await sweetConfirm({
      title: 'Approve and sell part?',
      message: 'This will reduce stock and create a customer part purchase invoice.',
      confirmText: 'Approve',
    })
    if (!confirmed) return

    try {
      setIsApproving(true)
      const response = await approveStaffPartRequest(selectedRequest.id, {
        email,
        partId: partId ? Number(partId) : null,
      })
      setSelectedRequest(null)
      await loadData()
      const emailResult = response.data?.email
      await sweetAlert({
        title: emailResult?.emailSent === false ? 'Request approved' : 'Request approved',
        message: emailResult?.message || 'Invoice created.',
        icon: emailResult?.emailSent === false ? 'info' : 'success',
      })
    } catch (err) {
      await sweetAlert({ title: 'Approval failed', message: getRequestErrorMessage(err, 'Unable to approve request.'), icon: 'error' })
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <div className="stack">
      <section className="card purchase-hero">
        <div className="purchase-hero-copy">
          <span className="auth-brand">Partivex</span>
          <h2>Unavailable Part Requests</h2>
          <p>Approve customer requests once stock is available, sell the part, and generate the invoice.</p>
        </div>
        <div className="inventory-meta"><span>Pending requests</span><strong>{requests.length}</strong></div>
      </section>

      {error && <div className="inventory-notice is-error">{error}</div>}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Customer requests</h2>
            <p>Staff approval is required before unavailable part requests become sales.</p>
          </div>
        </div>
        {loading ? (
          <p className="purchase-loading">Loading requests...</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Customer</th><th>Part</th><th>Vehicle</th><th>Qty</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td><div className="inventory-part-cell"><strong>{request.customerName || 'Customer'}</strong><span>{request.customerEmail}</span></div></td>
                    <td><div className="inventory-part-cell"><strong>{request.partName}</strong><span>{request.brandModelSpecification || 'No specification'}</span></div></td>
                    <td>{request.vehicleName ? `${request.vehicleName} - ${request.vehicleNumber}` : 'General request'}</td>
                    <td>{request.quantity}</td>
                    <td><span className="status-pill is-draft">{request.status}</span></td>
                    <td><button className="button button-outline" type="button" onClick={() => openApproval(request)}>Approve sale</button></td>
                  </tr>
                ))}
                {requests.length === 0 && <tr><td colSpan="6" className="table-empty">No pending unavailable part requests.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRequest && (
        <div className="dialog-overlay">
          <form className="dialog-card part-approval-dialog" onSubmit={submitApproval}>
            <h3>Approve request</h3>
            <p>{selectedRequest.partName} for {selectedRequest.customerName || 'customer'}.</p>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="approval-part">Available part to sell</label>
              <select id="approval-part" className="form-control" value={partId} onChange={(event) => setPartId(event.target.value)} required>
                <option value="">Select available stock</option>
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>{part.name} ({part.partCode}) - {part.currentStock} in stock</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="approval-email">Invoice email</label>
              <input id="approval-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="dialog-actions">
              <button className="button button-secondary" type="button" onClick={() => setSelectedRequest(null)}>Cancel</button>
              <button className="button" type="submit" disabled={isApproving}>{isApproving ? 'Approving...' : 'Approve and invoice'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default PartRequestApprovals
