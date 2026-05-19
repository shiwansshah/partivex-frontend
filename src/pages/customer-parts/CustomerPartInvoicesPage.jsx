import { useEffect, useMemo, useState } from 'react'
import {
  downloadCustomerPartPurchaseInvoicePdf,
  getCustomerPartPurchaseInvoices,
  sendCustomerPartPurchaseInvoiceEmail,
} from '../../api/customerPartPurchaseApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import Input from '../../components/ui/Input'
import { sweetAlert } from '../../utils/sweetAlert'

function CustomerPartInvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [emailTarget, setEmailTarget] = useState(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    let isCurrent = true
    async function loadInvoices() {
      try {
        const response = await getCustomerPartPurchaseInvoices()
        if (isCurrent) setInvoices(response.data || [])
      } catch (err) {
        if (isCurrent) setError(getRequestErrorMessage(err, 'Could not load customer part invoices.'))
      } finally {
        if (isCurrent) setLoading(false)
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
    return [invoice.invoiceNumber, invoice.customerName, invoice.customerEmail, invoice.source, invoice.status]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const totalAmount = useMemo(
    () => visibleInvoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0),
    [visibleInvoices],
  )

  async function downloadInvoice(invoice) {
    try {
      const response = await downloadCustomerPartPurchaseInvoicePdf(invoice.id)
      downloadBlob(response.data, `${invoice.invoiceNumber}.pdf`)
    } catch (err) {
      await sweetAlert({ title: 'Download failed', message: getRequestErrorMessage(err, 'Unable to download invoice.'), icon: 'error' })
    }
  }

  async function submitEmail(event) {
    event.preventDefault()
    if (!emailTarget) return
    try {
      setIsSending(true)
      const response = await sendCustomerPartPurchaseInvoiceEmail(emailTarget.id, email)
      setEmailTarget(null)
      setEmail('')
      await sweetAlert({
        title: response.data.emailSent ? 'Email sent' : 'Invoice ready',
        message: response.data.message,
        icon: response.data.emailSent ? 'success' : 'info',
      })
    } catch (err) {
      await sweetAlert({ title: 'Email failed', message: getRequestErrorMessage(err, 'Unable to send invoice email.'), icon: 'error' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="stack">
      <section className="card purchase-hero">
        <div className="purchase-hero-copy">
          <span className="auth-brand">Partivex</span>
          <h2>Customer Part Purchase Invoices</h2>
          <p>Invoices generated from customer checkout, buy now, and staff-approved unavailable part requests.</p>
        </div>
        <div className="inventory-meta">
          <span>Total shown</span>
          <strong>{formatCurrency(totalAmount)}</strong>
        </div>
      </section>

      {error && <div className="inventory-notice is-error">{error}</div>}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Invoices</h2>
            <p>Download PDF invoices or send them by email with the PDF attached.</p>
          </div>
        </div>
        <Input id="customerPartInvoiceSearch" label="Search invoices" name="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Invoice, customer, email, status..." />
        {loading ? (
          <p className="purchase-loading">Loading invoices...</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Source</th><th>Total</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {visibleInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><button className="purchase-invoice-link" type="button" onClick={() => setSelectedInvoice(selectedInvoice?.id === invoice.id ? null : invoice)}>{invoice.invoiceNumber}</button></td>
                    <td>{formatDate(invoice.createdAt)}</td>
                    <td><div className="inventory-part-cell"><strong>{invoice.customerName}</strong><span>{invoice.customerEmail}</span></div></td>
                    <td>{invoice.source}</td>
                    <td>{formatCurrency(invoice.totalAmount)}</td>
                    <td><span className="status-pill is-good">{invoice.status}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="button button-outline" type="button" onClick={() => downloadInvoice(invoice)}>PDF</button>
                        <button className="button button-outline" type="button" onClick={() => { setEmailTarget(invoice); setEmail(invoice.customerEmail) }}>Email</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleInvoices.length === 0 && <tr><td colSpan="7" className="table-empty">No customer part invoices found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedInvoice && (
        <section className="card">
          <div className="purchase-detail-header">
            <strong>Invoice {selectedInvoice.invoiceNumber}</strong>
            <p className="purchase-detail-notes">Subtotal {formatCurrency(selectedInvoice.subTotal)} - Discount {formatCurrency(selectedInvoice.discountAmount)}</p>
          </div>
          <table className="table purchase-lines-table">
            <thead><tr><th>SKU</th><th>Part</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>
              {selectedInvoice.items.map((item) => (
                <tr key={item.id}><td>{item.partCode}</td><td>{item.partName}</td><td>{formatCurrency(item.unitPrice)}</td><td>{item.quantity}</td><td>{formatCurrency(item.subTotal)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {emailTarget && (
        <div className="dialog-overlay">
          <form className="dialog-card" onSubmit={submitEmail}>
            <h3>Send invoice email</h3>
            <p>Send {emailTarget.invoiceNumber} with the invoice PDF attached.</p>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="invoice-email">Customer email</label>
              <input id="invoice-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="dialog-actions">
              <button className="button button-secondary" type="button" onClick={() => setEmailTarget(null)}>Cancel</button>
              <button className="button" type="submit" disabled={isSending}>{isSending ? 'Sending...' : 'Send invoice'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', minimumFractionDigits: 0 }).format(value ?? 0)
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export default CustomerPartInvoicesPage
