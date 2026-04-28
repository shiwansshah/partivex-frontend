import { useDeferredValue, useEffect, useState } from 'react'
import InventoryItemForm from '../../components/inventory/InventoryItemForm'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryMonitoring,
  updateInventoryItem,
} from '../../api/inventoryApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import { required } from '../../utils/validator'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('all')

  const deferredSearchTerm = useDeferredValue(searchTerm)

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
    let isActive = true

    async function initialize() {
      try {
        const response = await getInventoryMonitoring()
        if (isActive) {
          setMonitoring(response.data)
        }
      } catch (error) {
        if (isActive) {
          setStatus({
            type: 'error',
            message: getRequestErrorMessage(
              error,
              'Inventory data could not be loaded. Check the backend and try again.',
            ),
          })
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    initialize()

    return () => {
      isActive = false
    }
  }, [])

  function handleFieldChange(event) {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => ({ ...current, [name]: '' }))
  }

  function handleSearchChange(event) {
    setSearchTerm(event.target.value)
  }

  function handleStockFilterChange(event) {
    setStockFilter(event.target.value)
  }

  function validateForm() {
    const nextErrors = {}

    if (!required(formValues.partNumber)) nextErrors.partNumber = 'Part number is required.'
    if (!required(formValues.name)) nextErrors.name = 'Part name is required.'
    if (!required(formValues.category)) nextErrors.category = 'Category is required.'
    if (!required(formValues.vendorName)) nextErrors.vendorName = 'Vendor name is required.'
    if (!required(formValues.storageLocation)) nextErrors.storageLocation = 'Storage location is required.'
    if (!required(formValues.changedBy)) nextErrors.changedBy = 'Handled by is required.'

    if (!isWholeNumber(formValues.quantityInStock)) {
      nextErrors.quantityInStock = 'Enter a valid stock quantity.'
    }

    if (!isWholeNumber(formValues.reorderLevel)) {
      nextErrors.reorderLevel = 'Enter a valid reorder level.'
    }

    if (!isDecimalNumber(formValues.unitCost)) {
      nextErrors.unitCost = 'Enter a valid unit cost.'
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    if (!validateForm()) {
      return
    }

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
  const visibleItems = items.filter((item) => {
    const searchValue = deferredSearchTerm.trim().toLowerCase()
    const matchesSearch =
      searchValue.length === 0 ||
      [item.name, item.partNumber, item.category, item.vendorName, item.storageLocation]
        .join(' ')
        .toLowerCase()
        .includes(searchValue)

    const matchesStockFilter =
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.isLowStock) ||
      (stockFilter === 'healthy' && !item.isLowStock)

    return matchesSearch && matchesStockFilter
  })

  return (
    <div className="stack">
      <section className="card inventory-hero">
        <div className="inventory-hero-copy">
          <span className="auth-brand">Partivex</span>
          <h2>Inventory Monitoring</h2>
          <p>
            Admin can monitor live stock, maintain part records, and keep every quantity change
            traceable from the same workspace.
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
            <p>Keep the CRUD process aligned with the coursework’s inventory monitoring flow.</p>
          </div>

          <div className="inventory-workflow-list">
            <div>
              <strong>1. Create part records</strong>
              <p>Register vendor, storage, stock level, and opening metadata in one action.</p>
            </div>
            <div>
              <strong>2. Update stock carefully</strong>
              <p>When quantity changes, the system records a movement entry for audit tracking.</p>
            </div>
            <div>
              <strong>3. Watch low stock</strong>
              <p>Use the low-stock filter to identify items that are approaching reorder level.</p>
            </div>
            <div>
              <strong>4. Delete with intent</strong>
              <p>Removing an item clears its history, so only delete retired or duplicate parts.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Current Stock</h2>
            <p>
              Search, filter, edit, and remove inventory records while keeping the stock table
              aligned with the admin workflow.
            </p>
          </div>
          <div className="inventory-toolbar">
            <div className="inventory-toolbar-field">
              <Input
                id="inventorySearch"
                label="Search parts"
                name="inventorySearch"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Name, part number, category, vendor..."
              />
            </div>
            <div className="form-group inventory-toolbar-select">
              <label htmlFor="stockFilter">Stock Filter</label>
              <select
                id="stockFilter"
                className="form-control"
                value={stockFilter}
                onChange={handleStockFilterChange}
              >
                <option value="all">All items</option>
                <option value="low">Low stock only</option>
                <option value="healthy">Healthy stock only</option>
              </select>
            </div>
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
              {visibleItems.map((item) => (
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
              {visibleItems.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="8" className="table-empty">
                    No inventory items match the current filters.
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
          <p>
            Recent purchase, sale, and adjustment activity for auditing stock movement over
            time.
          </p>
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
                    No stock changes have been recorded yet.
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
    partNumber: values.partNumber,
    name: values.name,
    category: values.category,
    vendorName: values.vendorName,
    storageLocation: values.storageLocation,
    quantityInStock: Number(values.quantityInStock),
    reorderLevel: Number(values.reorderLevel),
    unitCost: Number(values.unitCost),
    changedBy: values.changedBy,
    referenceCode: values.referenceCode,
    notes: values.notes,
    stockChangeType: values.stockChangeType,
  }
}

function extractValidationErrors(error) {
  const validationErrors = error?.response?.data?.errors
  if (!validationErrors) {
    return {}
  }

  return Object.entries(validationErrors).reduce((result, [key, value]) => {
    const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1)
    result[normalizedKey] = Array.isArray(value) ? value[0] : value
    return result
  }, {})
}

function isWholeNumber(value) {
  return /^\d+$/.test(String(value).trim())
}

function isDecimalNumber(value) {
  return /^\d+(\.\d{1,2})?$/.test(String(value).trim())
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value ?? 0)
}

function formatDate(value) {
  if (!value) {
    return 'No updates yet'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatQuantity(value) {
  if (value > 0) {
    return `+${value}`
  }

  return `${value}`
}

export default InventoryPage
