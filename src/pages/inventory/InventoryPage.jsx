import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import { getInventoryMonitoring } from '../../api/inventoryApi'
import { getRequestErrorMessage } from '../../api/axiosClient'

function InventoryPage() {
  const [monitoring, setMonitoring] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(true)

  async function loadInventory({ showLoading = true } = {}) {
    try {
      if (showLoading) {
        setIsLoading(true)
      }

      const response = await getInventoryMonitoring()
      setMonitoring(response.data)
      setStatus({ type: '', message: '' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(
          error,
          'Inventory data could not be loaded. Check the backend and try again.',
        ),
      })
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const summary = monitoring?.summary

  return (
    <div className="stack">
      <section className="card inventory-hero">
        <div className="inventory-hero-copy">
          <span className="auth-brand">Partivex</span>
          <h2>Inventory Monitoring</h2>
          <p>
            View the current stock overview from the admin dashboard and refresh the latest
            numbers from the backend.
          </p>
        </div>
        <div className="inventory-hero-actions">
          <Button onClick={() => loadInventory()} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh data'}
          </Button>
        </div>
      </section>

      {status.message && (
        <div className="inventory-notice is-error">{status.message}</div>
      )}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Inventory Summary</h2>
            <p>Live stock overview based on the current inventory records in the backend.</p>
          </div>
          <div className="inventory-meta">
            <span>Last updated</span>
            <strong>{formatDate(summary?.lastUpdatedAt)}</strong>
          </div>
        </div>

        <div className="stats-grid inventory-stats-grid">
          <div className="stat-card">
            <span>Tracked Parts</span>
            <strong>{summary?.totalParts ?? 0}</strong>
          </div>
          <div className="stat-card">
            <span>Units in Stock</span>
            <strong>{summary?.totalUnits ?? 0}</strong>
          </div>
          <div className="stat-card stat-card-alert">
            <span>Low Stock Items</span>
            <strong>{summary?.lowStockItems ?? 0}</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

function formatDate(value) {
  if (!value) {
    return 'Waiting for data'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default InventoryPage
