import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { addInventoryStock, getInventoryMonitoring } from '../../api/inventoryApi'
import { getParts } from '../../api/partApi'
import { getVendors } from '../../api/vendorApi'
import { getRequestErrorMessage } from '../../api/axiosClient'

const today = new Date().toISOString().slice(0, 10)

const initialFormValues = {
  vendorSearch: '',
  partSearch: '',
  purchaseQuantity: '',
  purchaseDate: today,
  invoiceNumber: '',
  changedBy: 'Partivex Admin',
  remarks: '',
}

function InventoryPage() {
  const [monitoring, setMonitoring] = useState(null)
  const [parts, setParts] = useState([])
  const [vendors, setVendors] = useState([])
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formValues, setFormValues] = useState(initialFormValues)
  const [formErrors, setFormErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('all')

  const deferredSearchTerm = useDeferredValue(searchTerm)
  const selectedVendor = useMemo(
    () => vendors.find((vendor) => optionLabel(vendor.name, vendor.email) === formValues.vendorSearch),
    [formValues.vendorSearch, vendors],
  )
  const selectedPart = useMemo(
    () => parts.find((part) => optionLabel(part.name, part.partCode) === formValues.partSearch),
    [formValues.partSearch, parts],
  )
  const purchaseQuantity = Number(formValues.purchaseQuantity) || 0
  const totalAmount = selectedPart ? selectedPart.unitPrice * purchaseQuantity : 0

  async function loadData({ showLoading = true, nextStatus = null } = {}) {
    try {
      if (showLoading) setIsLoading(true)
      const [monitoringRes, partsRes, vendorsRes] = await Promise.all([
        getInventoryMonitoring(),
        getParts(),
        getVendors(),
      ])
      setMonitoring(monitoringRes.data)
      setParts((partsRes.data || []).filter((part) => part.isActive))
      setVendors((vendorsRes.data || []).filter((vendor) => vendor.isActive))
      if (nextStatus) setStatus(nextStatus)
    } catch (error) {
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(error, 'Inventory data could not be loaded.'),
      })
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleFieldChange(event) {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => ({ ...current, [name]: '' }))
  }

  function validateForm() {
    const nextErrors = {}
    if (!selectedVendor) nextErrors.vendorSearch = 'Select an active vendor from the list.'
    if (!selectedPart) nextErrors.partSearch = 'Select an active part from the list.'
    if (!Number.isInteger(purchaseQuantity) || purchaseQuantity <= 0) {
      nextErrors.purchaseQuantity = 'Enter a purchase quantity greater than zero.'
    }
    if (!formValues.purchaseDate) nextErrors.purchaseDate = 'Purchase date is required.'
    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    if (!validateForm()) return

    try {
      setIsSaving(true)
      await addInventoryStock({
        vendorId: selectedVendor.id,
        partId: selectedPart.id,
        purchaseQuantity,
        purchaseDate: new Date(formValues.purchaseDate).toISOString(),
        invoiceNumber: formValues.invoiceNumber.trim(),
        changedBy: formValues.changedBy.trim(),
        remarks: formValues.remarks.trim(),
      })
      await loadData({
        showLoading: false,
        nextStatus: { type: 'success', message: 'Stock updated and purchase invoice created.' },
      })
      setFormValues(initialFormValues)
      setFormErrors({})
    } catch (error) {
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(error, 'The stock update could not be saved.'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const summary = monitoring?.summary
  const items = monitoring?.items ?? []
  const recentChanges = monitoring?.recentChanges ?? []
  const visibleItems = items.filter((item) => {
    const searchValue = deferredSearchTerm.trim().toLowerCase()
    const matchesSearch =
      searchValue.length === 0 ||
      [item.name, item.partNumber, item.category, item.compatibleVehicle, item.stockStatus]
        .join(' ')
        .toLowerCase()
        .includes(searchValue)

    const matchesStockFilter =
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.stockStatus === 'Low Stock') ||
      (stockFilter === 'out' && item.stockStatus === 'Out of Stock') ||
      (stockFilter === 'in' && item.stockStatus === 'In Stock')

    return matchesSearch && matchesStockFilter
  })

  return (
    <div className="stack">
      <section className="card inventory-hero">
        <div className="inventory-hero-copy">
          <span className="auth-brand">Partivex</span>
          <h2>Inventory</h2>
          <p>Update stock for existing active parts from existing active vendors.</p>
        </div>
        <div className="inventory-hero-actions">
          <Button onClick={() => loadData()} disabled={isLoading || isSaving}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </section>

      {status.message && <div className={`inventory-notice ${status.type === 'success' ? 'is-success' : 'is-error'}`}>{status.message}</div>}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Add / Update Stock</h2>
            <p>Saving this form increases stock, creates a purchase invoice, and records stock history.</p>
          </div>
        </div>

        <form className="purchase-form" onSubmit={handleSubmit} noValidate>
          <datalist id="vendor-options">
            {vendors.map((vendor) => <option key={vendor.id} value={optionLabel(vendor.name, vendor.email)} />)}
          </datalist>
          <datalist id="part-options">
            {parts.map((part) => <option key={part.id} value={optionLabel(part.name, part.partCode)} />)}
          </datalist>

          <div className="purchase-form-header-grid">
            <Input id="vendorSearch" label="Vendor" name="vendorSearch" list="vendor-options" value={formValues.vendorSearch} onChange={handleFieldChange} error={formErrors.vendorSearch} placeholder="Search active vendors..." />
            <Input id="partSearch" label="Part" name="partSearch" list="part-options" value={formValues.partSearch} onChange={handleFieldChange} error={formErrors.partSearch} placeholder="Search active parts..." />
            <Input id="currentStock" label="Current Stock" name="currentStock" value={selectedPart?.currentStock ?? ''} readOnly />
            <Input id="unitPrice" label="Unit Price" name="unitPrice" value={selectedPart ? formatCurrency(selectedPart.unitPrice) : ''} readOnly />
            <Input id="purchaseQuantity" label="Purchase Quantity" name="purchaseQuantity" type="number" min="1" step="1" value={formValues.purchaseQuantity} onChange={handleFieldChange} error={formErrors.purchaseQuantity} />
            <Input id="totalAmount" label="Total Amount" name="totalAmount" value={formatCurrency(totalAmount)} readOnly />
            <Input id="purchaseDate" label="Purchase Date" name="purchaseDate" type="date" value={formValues.purchaseDate} onChange={handleFieldChange} error={formErrors.purchaseDate} />
            <Input id="invoiceNumber" label="Invoice Number" name="invoiceNumber" value={formValues.invoiceNumber} onChange={handleFieldChange} placeholder="Auto-generated if blank" />
            <Input id="changedBy" label="Created By" name="changedBy" value={formValues.changedBy} onChange={handleFieldChange} />
            <div className="form-group purchase-form-span-2">
              <label htmlFor="remarks">Remarks</label>
              <textarea id="remarks" name="remarks" className="form-control inventory-textarea" value={formValues.remarks} onChange={handleFieldChange} rows="2" />
            </div>
          </div>

          <div className="inventory-form-actions">
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Stock Update'}</Button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Stock Summary</h2>
            <p>Current stock status is calculated from current stock and minimum stock level.</p>
          </div>
          <div className="inventory-meta">
            <span>Last updated</span>
            <strong>{formatDate(summary?.lastUpdatedAt)}</strong>
          </div>
        </div>
        <div className="stats-grid inventory-stats-grid">
          <div className="stat-card"><span>Tracked Parts</span><strong>{summary?.totalParts ?? 0}</strong></div>
          <div className="stat-card"><span>Units in Stock</span><strong>{summary?.totalUnits ?? 0}</strong></div>
          <div className="stat-card stat-card-alert"><span>Attention Needed</span><strong>{summary?.lowStockItems ?? 0}</strong></div>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Current Stock</h2>
            <p>Search and filter existing parts.</p>
          </div>
          <div className="inventory-toolbar">
            <div className="inventory-toolbar-field">
              <Input id="inventorySearch" label="Search parts" name="inventorySearch" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Name, SKU, category, vehicle..." />
            </div>
            <div className="form-group inventory-toolbar-select">
              <label htmlFor="stockFilter">Stock Filter</label>
              <select id="stockFilter" className="form-control" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
                <option value="all">All parts</option>
                <option value="in">In stock</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table inventory-table">
            <thead>
              <tr><th>Part</th><th>Category</th><th>Vehicle</th><th>Stock</th><th>Unit Price</th><th>Status</th></tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id}>
                  <td><div className="inventory-part-cell"><strong>{item.name}</strong><span>{item.partNumber}</span></div></td>
                  <td>{item.category}</td>
                  <td>{item.compatibleVehicle || 'Any compatible model'}</td>
                  <td><div className="inventory-stock-cell"><strong>{item.quantityInStock}</strong><span>Minimum {item.reorderLevel}</span></div></td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td><span className={`status-pill ${item.stockStatus === 'In Stock' ? 'is-good' : 'is-alert'}`}>{item.stockStatus}</span></td>
                </tr>
              ))}
              {visibleItems.length === 0 && !isLoading && <tr><td colSpan="6" className="table-empty">No parts match the current filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="page-header">
          <h2>Stock History</h2>
          <p>Recent stock updates and purchases.</p>
        </div>
        <div className="table-wrap">
          <table className="table inventory-table">
            <thead>
              <tr><th>Date</th><th>Vendor</th><th>Part</th><th>Qty</th><th>After</th><th>Invoice</th><th>Remarks</th></tr>
            </thead>
            <tbody>
              {recentChanges.map((change) => (
                <tr key={change.id}>
                  <td>{formatDate(change.changedAt)}</td>
                  <td>{change.vendorName}</td>
                  <td><div className="inventory-part-cell"><strong>{change.partName}</strong><span>{change.partNumber}</span></div></td>
                  <td className="change-gain">+{change.quantityChanged}</td>
                  <td>{change.quantityAfterChange}</td>
                  <td>{change.referenceCode}</td>
                  <td>{change.notes || 'No remarks'}</td>
                </tr>
              ))}
              {recentChanges.length === 0 && !isLoading && <tr><td colSpan="7" className="table-empty">No stock movements recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function optionLabel(primary, secondary) {
  return secondary ? `${primary} (${secondary})` : primary
}

function formatDate(value) {
  if (!value) return 'Waiting for data'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(value ?? 0)
}

export default InventoryPage
