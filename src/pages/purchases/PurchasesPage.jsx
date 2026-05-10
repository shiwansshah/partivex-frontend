import { useEffect, useState } from 'react'
import {
  confirmPurchaseInvoice,
  createPurchaseInvoice,
  deletePurchaseInvoice,
  getPurchaseInvoices,
} from '../../api/purchaseApi'
import { getInventoryItems } from '../../api/inventoryApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const emptyForm = {
  invoiceNumber: '',
  vendorName: '',
  invoiceDate: new Date().toISOString().slice(0, 10),
  createdBy: '',
  notes: '',
}

function PurchasesPage() {
  const [invoices, setInvoices] = useState([])
  const [inventoryItems, setInventoryItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [lines, setLines] = useState([{ inventoryItemId: '', quantity: 1, unitCost: '' }])
  const [lineErrors, setLineErrors] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  async function loadData() {
    try {
      setIsLoading(true)
      const [invoicesRes, itemsRes] = await Promise.all([getPurchaseInvoices(), getInventoryItems()])
      setInvoices(invoicesRes.data)
      setInventoryItems(itemsRes.data)
    } catch (error) {
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(error, 'Could not load data. Check the backend and try again.'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleFieldChange(e) {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handleLineChange(index, field, value) {
    setLines((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }

      if (field === 'inventoryItemId' && value) {
        const item = inventoryItems.find((i) => String(i.id) === String(value))
        if (item) {
          next[index].unitCost = String(item.unitCost)
        }
      }

      return next
    })
    setLineErrors((prev) => {
      const next = [...prev]
      if (next[index]) next[index] = { ...next[index], [field]: '' }
      return next
    })
  }

  function addLine() {
    setLines((prev) => [...prev, { inventoryItemId: '', quantity: 1, unitCost: '' }])
  }

  function removeLine(index) {
    if (lines.length === 1) return
    setLines((prev) => prev.filter((_, i) => i !== index))
    setLineErrors((prev) => prev.filter((_, i) => i !== index))
  }

  function validateForm() {
    const errors = {}
    if (!formValues.invoiceNumber.trim()) errors.invoiceNumber = 'Invoice number is required.'
    if (!formValues.vendorName.trim()) errors.vendorName = 'Vendor name is required.'
    if (!formValues.createdBy.trim()) errors.createdBy = 'Created by is required.'
    if (!formValues.invoiceDate) errors.invoiceDate = 'Invoice date is required.'

    const nextLineErrors = lines.map((line) => {
      const e = {}
      if (!line.inventoryItemId) e.inventoryItemId = 'Select an item.'
      if (!line.quantity || Number(line.quantity) < 1) e.quantity = 'Min 1.'
      if (line.unitCost === '' || Number(line.unitCost) < 0) e.unitCost = 'Enter cost.'
      return e
    })

    setFormErrors(errors)
    setLineErrors(nextLineErrors)

    const hasLineErrors = nextLineErrors.some((e) => Object.keys(e).length > 0)
    return Object.keys(errors).length === 0 && !hasLineErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus({ type: '', message: '' })
    if (!validateForm()) return

    try {
      setIsSaving(true)
      await createPurchaseInvoice({
        invoiceNumber: formValues.invoiceNumber.trim(),
        vendorName: formValues.vendorName.trim(),
        invoiceDate: new Date(formValues.invoiceDate).toISOString(),
        createdBy: formValues.createdBy.trim(),
        notes: formValues.notes.trim(),
        lines: lines.map((l) => ({
          inventoryItemId: Number(l.inventoryItemId),
          quantity: Number(l.quantity),
          unitCost: Number(l.unitCost),
        })),
      })

      await loadData()
      setStatus({ type: 'success', message: 'Purchase invoice created as Draft.' })
      resetForm()
    } catch (error) {
      const validationErrors = error.response?.data?.errors
      if (validationErrors) {
        const mapped = Object.entries(validationErrors).reduce((acc, [field, messages]) => {
          const key = field.charAt(0).toLowerCase() + field.slice(1)
          acc[key] = Array.isArray(messages) ? messages[0] : messages
          return acc
        }, {})
        setFormErrors(mapped)
      }
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(error, 'Could not create invoice. Check the form and try again.'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleConfirm(invoice) {
    const confirmed = window.confirm(
      `Confirm invoice ${invoice.invoiceNumber}? This will update stock for all line items.`,
    )
    if (!confirmed) return

    try {
      setIsSaving(true)
      setStatus({ type: '', message: '' })
      await confirmPurchaseInvoice(invoice.id)
      await loadData()
      setStatus({
        type: 'success',
        message: `Invoice ${invoice.invoiceNumber} confirmed. Stock has been updated.`,
      })
      if (selectedInvoice?.id === invoice.id) setSelectedInvoice(null)
    } catch (error) {
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(error, 'Could not confirm invoice. Try again.'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(invoice) {
    const confirmed = window.confirm(`Delete draft invoice ${invoice.invoiceNumber}?`)
    if (!confirmed) return

    try {
      setIsSaving(true)
      setStatus({ type: '', message: '' })
      await deletePurchaseInvoice(invoice.id)
      await loadData()
      setStatus({ type: 'success', message: `Invoice ${invoice.invoiceNumber} deleted.` })
      if (selectedInvoice?.id === invoice.id) setSelectedInvoice(null)
    } catch (error) {
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(error, 'Could not delete invoice. Try again.'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  function resetForm() {
    setFormValues(emptyForm)
    setFormErrors({})
    setLines([{ inventoryItemId: '', quantity: 1, unitCost: '' }])
    setLineErrors([])
    setShowForm(false)
  }

  const totalAmount = lines.reduce((sum, l) => {
    const qty = Number(l.quantity) || 0
    const cost = Number(l.unitCost) || 0
    return sum + qty * cost
  }, 0)

  return (
    <div className="stack">
      <section className="card purchase-hero">
        <div className="purchase-hero-copy">
          <span className="auth-brand">Partivex</span>
          <h2>Purchase &amp; Stock Management</h2>
          <p>
            Create vendor purchase invoices, add parts with quantities and costs, and confirm
            invoices to automatically update inventory stock levels.
          </p>
        </div>
        <div className="purchase-hero-actions">
          <Button onClick={() => { setShowForm((v) => !v); setStatus({ type: '', message: '' }) }} disabled={isLoading}>
            {showForm ? 'Cancel' : '+ New Invoice'}
          </Button>
        </div>
      </section>

      {status.message && (
        <div className={`inventory-notice ${status.type === 'success' ? 'is-success' : 'is-error'}`}>
          {status.message}
        </div>
      )}

      {showForm && (
        <section className="card">
          <div className="section-heading">
            <div>
              <h2>New Purchase Invoice</h2>
              <p>Fill in vendor details, add line items, and save as a draft. Confirm later to update stock.</p>
            </div>
          </div>

          <form className="purchase-form" onSubmit={handleSubmit} noValidate>
            <div className="purchase-form-header-grid">
              <Input
                id="invoiceNumber"
                label="Invoice Number"
                name="invoiceNumber"
                value={formValues.invoiceNumber}
                onChange={handleFieldChange}
                error={formErrors.invoiceNumber}
                placeholder="e.g. PO-2026-001"
              />
              <Input
                id="vendorName"
                label="Vendor Name"
                name="vendorName"
                value={formValues.vendorName}
                onChange={handleFieldChange}
                error={formErrors.vendorName}
                placeholder="e.g. Himal Auto Traders"
              />
              <Input
                id="invoiceDate"
                label="Invoice Date"
                name="invoiceDate"
                type="date"
                value={formValues.invoiceDate}
                onChange={handleFieldChange}
                error={formErrors.invoiceDate}
              />
              <Input
                id="createdBy"
                label="Created By"
                name="createdBy"
                value={formValues.createdBy}
                onChange={handleFieldChange}
                error={formErrors.createdBy}
                placeholder="e.g. Store Manager"
              />
              <div className="form-group purchase-form-span-2">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control inventory-textarea"
                  value={formValues.notes}
                  onChange={handleFieldChange}
                  rows="2"
                  placeholder="Optional notes about this purchase..."
                />
              </div>
            </div>

            <div className="purchase-lines-section">
              <div className="purchase-lines-heading">
                <h3>Line Items</h3>
                <Button type="button" variant="secondary" onClick={addLine} disabled={isSaving}>
                  + Add Item
                </Button>
              </div>

              <div className="purchase-lines-table-wrap">
                <table className="table purchase-lines-table">
                  <thead>
                    <tr>
                      <th>Part</th>
                      <th>Qty</th>
                      <th>Unit Cost</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => {
                      const subtotal = (Number(line.quantity) || 0) * (Number(line.unitCost) || 0)
                      const lineErr = lineErrors[index] || {}
                      return (
                        <tr key={index}>
                          <td>
                            <select
                              className={`form-control ${lineErr.inventoryItemId ? 'is-invalid' : ''}`}
                              value={line.inventoryItemId}
                              onChange={(e) => handleLineChange(index, 'inventoryItemId', e.target.value)}
                            >
                              <option value="">Select a part...</option>
                              {inventoryItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.partNumber})
                                </option>
                              ))}
                            </select>
                            {lineErr.inventoryItemId && (
                              <span className="field-error">{lineErr.inventoryItemId}</span>
                            )}
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className={`form-control purchase-number-input ${lineErr.quantity ? 'is-invalid' : ''}`}
                              value={line.quantity}
                              onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                            />
                            {lineErr.quantity && <span className="field-error">{lineErr.quantity}</span>}
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className={`form-control purchase-number-input ${lineErr.unitCost ? 'is-invalid' : ''}`}
                              value={line.unitCost}
                              onChange={(e) => handleLineChange(index, 'unitCost', e.target.value)}
                            />
                            {lineErr.unitCost && <span className="field-error">{lineErr.unitCost}</span>}
                          </td>
                          <td className="purchase-subtotal">{formatCurrency(subtotal)}</td>
                          <td>
                            <Button
                              type="button"
                              variant="danger"
                              className="inventory-action-button"
                              onClick={() => removeLine(index)}
                              disabled={lines.length === 1 || isSaving}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="purchase-total-label">Total</td>
                      <td className="purchase-total-amount">{formatCurrency(totalAmount)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="inventory-form-actions">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Purchase Invoices</h2>
            <p>
              Draft invoices can be edited or confirmed. Confirming an invoice updates inventory stock
              automatically.
            </p>
          </div>
          <div className="purchase-legend">
            <span className="status-pill is-good">Confirmed</span>
            <span className="status-pill is-draft">Draft</span>
          </div>
        </div>

        {isLoading ? (
          <p className="purchase-loading">Loading invoices...</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Lines</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <>
                    <tr key={invoice.id} className={selectedInvoice?.id === invoice.id ? 'purchase-row-active' : ''}>
                      <td>
                        <button
                          className="purchase-invoice-link"
                          onClick={() => setSelectedInvoice(selectedInvoice?.id === invoice.id ? null : invoice)}
                        >
                          {invoice.invoiceNumber}
                        </button>
                      </td>
                      <td>{invoice.vendorName}</td>
                      <td>{formatDate(invoice.invoiceDate)}</td>
                      <td>{invoice.items.length}</td>
                      <td>{formatCurrency(invoice.totalAmount)}</td>
                      <td>
                        <span className={`status-pill ${invoice.status === 'Confirmed' ? 'is-good' : 'is-draft'}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>{invoice.createdBy}</td>
                      <td>
                        <div className="inventory-action-group">
                          {invoice.status === 'Draft' && (
                            <>
                              <Button
                                type="button"
                                variant="primary"
                                className="inventory-action-button"
                                onClick={() => handleConfirm(invoice)}
                                disabled={isSaving}
                              >
                                Confirm
                              </Button>
                              <Button
                                type="button"
                                variant="danger"
                                className="inventory-action-button"
                                onClick={() => handleDelete(invoice)}
                                disabled={isSaving}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {selectedInvoice?.id === invoice.id && (
                      <tr key={`${invoice.id}-detail`} className="purchase-detail-row">
                        <td colSpan="8">
                          <div className="purchase-detail-panel">
                            <div className="purchase-detail-header">
                              <strong>Invoice {invoice.invoiceNumber} — Line Items</strong>
                              {invoice.notes && <p className="purchase-detail-notes">{invoice.notes}</p>}
                            </div>
                            <table className="table purchase-lines-table">
                              <thead>
                                <tr>
                                  <th>Part Number</th>
                                  <th>Part Name</th>
                                  <th>Qty</th>
                                  <th>Unit Cost</th>
                                  <th>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoice.items.map((item) => (
                                  <tr key={item.id}>
                                    <td>{item.partNumber}</td>
                                    <td>{item.partName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.unitCost)}</td>
                                    <td>{formatCurrency(item.subTotal)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan="4" className="purchase-total-label">Total</td>
                                  <td className="purchase-total-amount">{formatCurrency(invoice.totalAmount)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan="8" className="table-empty">
                      No purchase invoices yet. Create one using the button above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>How Purchase Invoices Work</h2>
            <p>A quick guide to the purchase and stock management workflow.</p>
          </div>
        </div>
        <div className="inventory-workflow-list">
          <div>
            <strong>1. Create a Draft Invoice</strong>
            <p>Enter vendor details, invoice number, date, and select parts with quantities and unit costs.</p>
          </div>
          <div>
            <strong>2. Review Line Items</strong>
            <p>Click an invoice number to expand and review all line items before confirming.</p>
          </div>
          <div>
            <strong>3. Confirm to Update Stock</strong>
            <p>Confirming the invoice automatically adds the purchased quantities to inventory stock.</p>
          </div>
          <div>
            <strong>4. Track in Inventory</strong>
            <p>Confirmed purchases appear in the stock change log on the Inventory page for full audit trails.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value ?? 0)
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export default PurchasesPage
