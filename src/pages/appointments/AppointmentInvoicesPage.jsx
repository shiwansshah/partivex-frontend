import { useEffect, useMemo, useState } from 'react'
import {
  createAppointmentInvoice,
  downloadAppointmentInvoicePdf,
  getAppointmentInvoices,
  getStaffAppointments,
  sendAppointmentInvoiceEmail,
  sendOverdueAppointmentInvoiceReminders,
  updateAppointmentInvoicePaymentStatus,
} from '../../api/appointmentInvoiceApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import { sweetAlert } from '../../utils/sweetAlert'

const emptyInvoice = { appointmentId: '', amount: '', paymentStatus: 'Pending', notes: '' }

function AppointmentInvoicesPage() {
  const [appointments, setAppointments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [invoiceTarget, setInvoiceTarget] = useState(null)
  const [values, setValues] = useState(emptyInvoice)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function loadData() {
    const [appointmentsResponse, invoicesResponse] = await Promise.all([
      getStaffAppointments(),
      getAppointmentInvoices(),
    ])
    setAppointments(appointmentsResponse.data || [])
    setInvoices(invoicesResponse.data || [])
  }

  useEffect(() => {
    let isCurrent = true
    async function fetchData() {
      try {
        await loadData()
      } catch (err) {
        if (isCurrent) setError(getRequestErrorMessage(err, 'Could not load appointment invoice data.'))
      } finally {
        if (isCurrent) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isCurrent = false
    }
  }, [])

  const invoicedAppointmentIds = useMemo(() => new Set(invoices.map((invoice) => invoice.appointmentId)), [invoices])
  const visibleAppointments = appointments.filter((appointment) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return [appointment.customerName, appointment.customerEmail, appointment.serviceType, appointment.vehicleName, appointment.vehicleNumber, appointment.status]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  function openInvoiceModal(appointment) {
    setInvoiceTarget(appointment)
    setValues({ ...emptyInvoice, appointmentId: appointment.id })
  }

  async function submitInvoice(event) {
    event.preventDefault()
    try {
      setIsSaving(true)
      await createAppointmentInvoice({
        appointmentId: values.appointmentId,
        amount: Number(values.amount),
        paymentStatus: values.paymentStatus,
        notes: values.notes.trim() || null,
      })
      setInvoiceTarget(null)
      setValues(emptyInvoice)
      await loadData()
      await sweetAlert({ title: 'Invoice created', message: 'Appointment invoice is now available to the customer.', icon: 'success' })
    } catch (err) {
      await sweetAlert({ title: 'Invoice failed', message: getRequestErrorMessage(err, 'Could not create appointment invoice.'), icon: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  async function updatePayment(invoice, paymentStatus) {
    try {
      await updateAppointmentInvoicePaymentStatus(invoice.id, paymentStatus)
      await loadData()
    } catch (err) {
      await sweetAlert({ title: 'Status failed', message: getRequestErrorMessage(err, 'Could not update payment status.'), icon: 'error' })
    }
  }

  async function emailInvoice(invoice) {
    try {
      const response = await sendAppointmentInvoiceEmail(invoice.id)
      await sweetAlert({ title: response.data.emailSent ? 'Email sent' : 'Invoice ready', message: response.data.message, icon: response.data.emailSent ? 'success' : 'info' })
    } catch (err) {
      await sweetAlert({ title: 'Email failed', message: getRequestErrorMessage(err, 'Could not send appointment invoice email.'), icon: 'error' })
    }
  }

  async function sendReminders() {
    try {
      const response = await sendOverdueAppointmentInvoiceReminders()
      await sweetAlert({ title: 'Overdue reminders processed', message: `${response.data.sentCount} sent, ${response.data.skippedCount} skipped.`, icon: 'success' })
      await loadData()
    } catch (err) {
      await sweetAlert({ title: 'Reminder failed', message: getRequestErrorMessage(err, 'Could not send overdue reminders.'), icon: 'error' })
    }
  }

  async function downloadInvoice(invoice) {
    try {
      const response = await downloadAppointmentInvoicePdf(invoice.id)
      downloadBlob(response.data, `${invoice.invoiceNumber}.pdf`)
    } catch (err) {
      await sweetAlert({ title: 'Download failed', message: getRequestErrorMessage(err, 'Could not download appointment invoice.'), icon: 'error' })
    }
  }

  return (
    <div className="stack">
      <section className="card purchase-hero">
        <div className="purchase-hero-copy">
          <span className="auth-brand">Partivex</span>
          <h2>Appointment Invoices</h2>
          <p>Track appointment requests, create service invoices, and manage customer payment status.</p>
        </div>
        <div className="inventory-meta"><span>Pending payments</span><strong>{invoices.filter((invoice) => invoice.paymentStatus === 'Pending').length}</strong></div>
      </section>

      {error && <div className="inventory-notice is-error">{error}</div>}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Appointments</h2>
            <p>Generate one invoice per customer appointment.</p>
          </div>
          <div className="table-actions">
            <button className="button button-outline" type="button" onClick={sendReminders}>Send overdue reminders</button>
          </div>
        </div>
        <input className="form-control" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search appointments..." />
        {loading ? (
          <p className="purchase-loading">Loading appointments...</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Customer</th><th>Service</th><th>Vehicle</th><th>Appointment</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {visibleAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td><div className="inventory-part-cell"><strong>{appointment.customerName}</strong><span>{appointment.customerEmail}</span></div></td>
                    <td>{appointment.serviceType}</td>
                    <td>{appointment.vehicleName} - {appointment.vehicleNumber}</td>
                    <td>{formatDateTime(appointment.preferredAt)}</td>
                    <td><span className="status-pill is-draft">{appointment.status}</span></td>
                    <td><button className="button button-outline" type="button" disabled={invoicedAppointmentIds.has(appointment.id)} onClick={() => openInvoiceModal(appointment)}>{invoicedAppointmentIds.has(appointment.id) ? 'Invoiced' : 'Create invoice'}</button></td>
                  </tr>
                ))}
                {visibleAppointments.length === 0 && <tr><td colSpan="6" className="table-empty">No appointments found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Generated invoices</h2>
            <p>Download, email, and update payment status.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Service</th><th>Total</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td><button className="purchase-invoice-link" type="button" onClick={() => downloadInvoice(invoice)}>{invoice.invoiceNumber}</button></td>
                  <td><div className="inventory-part-cell"><strong>{invoice.customerName}</strong><span>{invoice.customerEmail}</span></div></td>
                  <td>{invoice.serviceType}</td>
                  <td>{formatCurrency(invoice.amount)}</td>
                  <td><span className={`status-pill ${invoice.paymentStatus === 'Paid' ? 'is-good' : 'is-draft'}`}>{invoice.paymentStatus}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="button button-outline" type="button" onClick={() => updatePayment(invoice, invoice.paymentStatus === 'Paid' ? 'Pending' : 'Paid')}>{invoice.paymentStatus === 'Paid' ? 'Mark pending' : 'Mark paid'}</button>
                      <button className="button button-outline" type="button" onClick={() => emailInvoice(invoice)}>Email</button>
                      <button className="button button-outline" type="button" onClick={() => downloadInvoice(invoice)}>PDF</button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan="6" className="table-empty">No appointment invoices generated.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {invoiceTarget && (
        <div className="dialog-overlay">
          <form className="dialog-card" onSubmit={submitInvoice}>
            <h3>Create appointment invoice</h3>
            <p>{invoiceTarget.serviceType} for {invoiceTarget.customerName}.</p>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="appointment-invoice-amount">Amount</label>
              <input id="appointment-invoice-amount" className="form-control" type="number" min="0.01" step="0.01" value={values.amount} onChange={(event) => setValues((current) => ({ ...current, amount: event.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="appointment-invoice-status">Payment status</label>
              <select id="appointment-invoice-status" className="form-control" value={values.paymentStatus} onChange={(event) => setValues((current) => ({ ...current, paymentStatus: event.target.value }))}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="appointment-invoice-notes">Notes</label>
              <textarea id="appointment-invoice-notes" className="form-control" value={values.notes} onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))} />
            </div>
            <div className="dialog-actions">
              <button className="button button-secondary" type="button" onClick={() => setInvoiceTarget(null)}>Cancel</button>
              <button className="button" type="submit" disabled={isSaving}>{isSaving ? 'Creating...' : 'Create invoice'}</button>
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

function formatDateTime(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default AppointmentInvoicesPage
