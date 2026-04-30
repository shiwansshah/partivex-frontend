import { useEffect, useState } from 'react'
import InventoryItemForm from '../../components/inventory/InventoryItemForm'
import Button from '../../components/ui/Button'
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryMonitoring,
  updateInventoryItem,
} from '../../api/inventoryApi'
import { getRequestErrorMessage } from '../../api/axiosClient'

const initialFormValues = {
  partNumber: '',
  name: '',
  category: '',
  vendorName: '',
  storageLocation: '',
  quantityInStock: '0',
  reorderLevel: '10',
  unitCost: '0',
  changedBy: 'Partivex Admin',
  referenceCode: '',
  notes: '',
  stockChangeType: '',
}

function InventoryPage() {
  const [monitoring, setMonitoring] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeItemId, setActiveItemId] = useState(null)
  const [formValues, setFormValues] = useState(initialFormValues)
  const [formErrors, setFormErrors] = useState({})

  async function loadInventory({ showLoading = true, nextStatus = null } = {}) {
    try {
      if (showLoading) {
        setIsLoading(true)
      }

      const response = await getInventoryMonitoring()
      setMonitoring(response.data)

      if (nextStatus) {
        setStatus(nextStatus)
      }
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

  function handleFieldChange(event) {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => ({ ...current, [name]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    try {
      setIsSaving(true)
      const payload = buildPayload(formValues)

      if (activeItemId) {
        await updateInventoryItem(activeItemId, payload)
        await loadInventory({
          showLoading: false,
          nextStatus: {
            type: 'success',
            message: 'Inventory item updated successfully.',
          },
        })
      } else {
        await createInventoryItem(payload)
        await loadInventory({
          showLoading: false,
          nextStatus: {
            type: 'success',
            message: 'Inventory item created successfully.',
          },
        })
      }

      resetEditor()
    } catch (error) {
      setFormErrors(extractValidationErrors(error))
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(
          error,
          'The inventory item could not be saved. Review the form and try again.',
        ),
      })
    } finally {
      setIsSaving(false)
    }
  }

  function handleEdit(item) {
    setActiveItemId(item.id)
    setFormErrors({})
    setStatus({ type: '', message: '' })
    setFormValues({
      partNumber: item.partNumber,
      name: item.name,
      category: item.category,
      vendorName: item.vendorName,
      storageLocation: item.storageLocation,
      quantityInStock: String(item.quantityInStock),
      reorderLevel: String(item.reorderLevel),
      unitCost: String(item.unitCost),
      changedBy: 'Partivex Admin',
      referenceCode: '',
      notes: '',
      stockChangeType: '',
    })
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete ${item.name}? This removes the inventory record and its stock history.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setStatus({ type: '', message: '' })
      setIsSaving(true)
      await deleteInventoryItem(item.id)
      await loadInventory({
        showLoading: false,
        nextStatus: {
          type: 'success',
          message: `${item.name} was deleted successfully.`,
        },
      })

      if (activeItemId === item.id) {
        resetEditor()
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(
          error,
          'The inventory item could not be deleted. Try again in a moment.',
        ),
      })
    } finally {
      setIsSaving(false)
    }
  }

  function resetEditor() {
    setActiveItemId(null)
    setFormValues(initialFormValues)
    setFormErrors({})
  }

  const summary = monitoring?.summary
  const items = monitoring?.items ?? []
  const recentChanges = monitoring?.recentChanges ?? []

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
          <Button onClick={() => loadInventory()} disabled={isLoading || isSaving}>
            {isLoading ? 'Refreshing...' : 'Refresh data'}
          </Button>
        </div>
      </section>

      {status.message && (
        <div className={`inventory-notice ${status.type === 'success' ? 'is-success' : 'is-error'}`}>
          {status.message}
        </div>
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

      <div className="inventory-management-grid">
        <InventoryItemForm
          values={formValues}
          errors={formErrors}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={resetEditor}
          isSaving={isSaving}
          isEditing={Boolean(activeItemId)}
        />

        <section className="card inventory-workflow-card">
          <div className="page-header">
            <h2>Workflow Notes</h2>
            <p>Outline the admin flow before wiring the save actions into the page.</p>
          </div>

          <div className="inventory-workflow-list">
            <div>
              <strong>1. Create part records</strong>
              <p>Capture vendor, location, stock level, and reference information in one form.</p>
            </div>
            <div>
              <strong>2. Review current stock</strong>
              <p>Compare new inputs against existing inventory before making adjustments.</p>
            </div>
            <div>
              <strong>3. Track changes</strong>
              <p>Keep stock movement visible so the admin view stays aligned with operations.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Current Stock</h2>
            <p>Live inventory records from the backend, ordered for quick stock review.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table inventory-table">
            <thead>
              <tr>
                <th>Part</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Location</th>
                <th>Stock</th>
                <th>Unit Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="inventory-part-cell">
                      <strong>{item.name}</strong>
                      <span>{item.partNumber}</span>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.vendorName}</td>
                  <td>{item.storageLocation}</td>
                  <td>
                    <div className="inventory-stock-cell">
                      <strong>{item.quantityInStock}</strong>
                      <span>Reorder at {item.reorderLevel}</span>
                    </div>
                  </td>
                  <td>{formatCurrency(item.unitCost)}</td>
                  <td>
                    <span className={`status-pill ${item.isLowStock ? 'is-alert' : 'is-good'}`}>
                      {item.isLowStock ? 'Low stock' : 'Healthy'}
                    </span>
                  </td>
                  <td>
                    <div className="inventory-action-group">
                      <Button
                        type="button"
                        variant="secondary"
                        className="inventory-action-button"
                        onClick={() => handleEdit(item)}
                        disabled={isSaving}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="inventory-action-button"
                        onClick={() => handleDelete(item)}
                        disabled={isSaving}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="8" className="table-empty">
                    No inventory items are available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="page-header">
          <h2>Stock Change Tracking</h2>
          <p>Recent stock movements for quick auditing of purchase and sales activity.</p>
        </div>

        <div className="table-wrap">
          <table className="table inventory-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Part</th>
                <th>Change</th>
                <th>After Change</th>
                <th>Reference</th>
                <th>Handled By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {recentChanges.map((change) => (
                <tr key={change.id}>
                  <td>{formatDate(change.changedAt)}</td>
                  <td>
                    <div className="inventory-part-cell">
                      <strong>{change.partName}</strong>
                      <span>{change.partNumber}</span>
                    </div>
                  </td>
                  <td>
                    <div className="inventory-change-cell">
                      <span className="change-type">{change.changeType}</span>
                      <strong className={change.quantityChanged < 0 ? 'change-loss' : 'change-gain'}>
                        {formatQuantity(change.quantityChanged)}
                      </strong>
                    </div>
                  </td>
                  <td>{change.quantityAfterChange}</td>
                  <td>{change.referenceCode}</td>
                  <td>{change.changedBy}</td>
                  <td>{change.notes}</td>
                </tr>
              ))}
              {recentChanges.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="7" className="table-empty">
                    No stock movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function buildPayload(values) {
  return {
    partNumber: values.partNumber.trim(),
    name: values.name.trim(),
    category: values.category.trim(),
    vendorName: values.vendorName.trim(),
    storageLocation: values.storageLocation.trim(),
    quantityInStock: Number.parseInt(values.quantityInStock, 10),
    reorderLevel: Number.parseInt(values.reorderLevel, 10),
    unitCost: Number.parseFloat(values.unitCost),
    changedBy: values.changedBy.trim(),
    referenceCode: values.referenceCode.trim(),
    notes: values.notes.trim(),
    stockChangeType: values.stockChangeType.trim(),
  }
}

function extractValidationErrors(error) {
  const validationErrors = error.response?.data?.errors
  if (!validationErrors) {
    return {}
  }

  return Object.entries(validationErrors).reduce((accumulator, [field, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : messages
    const normalizedField = field.charAt(0).toLowerCase() + field.slice(1)
    accumulator[normalizedField] = message
    return accumulator
  }, {})
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

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value ?? 0)
}

function formatQuantity(value) {
  return value > 0 ? `+${value}` : String(value)
}

export default InventoryPage
