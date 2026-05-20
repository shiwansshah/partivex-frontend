import { Fragment, useEffect, useMemo, useState } from 'react'
import { getPurchaseInvoices } from '../../api/purchaseApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import Input from '../../components/ui/Input'

function PurchasesPage() {
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    let isCurrent = true
    async function loadInvoices() {
      try {
        const response = await getPurchaseInvoices()
        if (isCurrent) setInvoices(response.data || [])
      } catch (error) {
        if (isCurrent) {
          setStatus({
            type: 'error',
            message: getRequestErrorMessage(error, 'Could not load purchase invoices.'),
          })
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }
    loadInvoices()
    return () => {
      isCurrent = false
    }
  }, [])

  const visibleInvoices = invoices.filter((invoice) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    const itemText = invoice.items
      .map((item) => `${item.partName} ${item.partNumber}`)
      .join(' ')
    return [invoice.invoiceNumber, invoice.vendorName, invoice.invoiceDate, itemText]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const totalPurchases = useMemo(
    () => visibleInvoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0),
    [visibleInvoices],
  )

  return (
    <div className="stack">
      <section className="card purchase-hero">
        <div className="purchase-hero-copy">
          <span className="auth-brand">Partivex</span>
          <h2>Purchases</h2>
          <p>Purchase invoices are generated automatically from inventory stock updates.</p>
        </div>
        <div className="inventory-meta">
          <span>Total purchases shown</span>
          <strong>{formatCurrency(totalPurchases)}</strong>
        </div>
      </section>

      {status.message && <div className="inventory-notice is-error">{status.message}</div>}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Purchase Invoices</h2>
            <p>Search by vendor, part, invoice number, or date.</p>
          </div>
        </div>
        <Input id="purchaseSearch" label="Search Purchases" name="purchaseSearch" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Invoice, vendor, part, or date..." />

        {isLoading ? (
          <p className="purchase-loading">Loading invoices...</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Invoice #</th><th>Date</th><th>Vendor</th><th>Part</th><th>Quantity</th><th>Total Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {visibleInvoices.map((invoice) => {
                  const firstItem = invoice.items[0]
                  const partLabel = invoice.items.length > 1 ? 'Multiple parts' : firstItem?.partName || '-'
                  return (
                    <Fragment key={invoice.id}>
                      <tr className={selectedInvoice?.id === invoice.id ? 'purchase-row-active' : ''}>
                        <td>
                          <button className="purchase-invoice-link" onClick={() => setSelectedInvoice(selectedInvoice?.id === invoice.id ? null : invoice)}>
                            {invoice.invoiceNumber}
                          </button>
                        </td>
                        <td>{formatDate(invoice.invoiceDate)}</td>
                        <td>{invoice.vendorName}</td>
                        <td>{partLabel}</td>
                        <td>{invoice.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                        <td>{formatCurrency(invoice.totalAmount)}</td>
                        <td><span className="status-pill is-good">{invoice.status}</span></td>
                      </tr>
                      {selectedInvoice?.id === invoice.id && (
                        <tr className="purchase-detail-row">
                          <td colSpan="7">
                            <div className="purchase-detail-panel">
                              <div className="purchase-detail-header">
                                <strong>Invoice {invoice.invoiceNumber}</strong>
                                {invoice.notes && <p className="purchase-detail-notes">{invoice.notes}</p>}
                              </div>
                              <table className="table purchase-lines-table">
                                <thead>
                                  <tr><th>SKU</th><th>Part</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr>
                                </thead>
                                <tbody>
                                  {invoice.items.map((item) => (
                                    <tr key={item.id}>
                                      <td>{item.partNumber}</td>
                                      <td>{item.partName}</td>
                                      <td>{formatCurrency(item.unitPrice)}</td>
                                      <td>{item.quantity}</td>
                                      <td>{formatCurrency(item.subTotal)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
                {visibleInvoices.length === 0 && (
                  <tr><td colSpan="7" className="table-empty">No purchase invoices found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(value ?? 0)
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export default PurchasesPage
