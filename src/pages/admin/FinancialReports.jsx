import { useEffect, useMemo, useState } from 'react'
import { getRequestErrorMessage } from '../../api/axiosClient'
import { getFinancialReport } from '../../api/financialReportApi'

const periods = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

function FinancialReports() {
  const [period, setPeriod] = useState('monthly')
  const [referenceDate, setReferenceDate] = useState(getLocalDateValue())
  const [report, setReport] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadReport() {
      try {
        setLoading(true)
        setError('')
        const response = await getFinancialReport({ period, referenceDate })
        if (isCurrent) setReport(response.data)
      } catch (err) {
        if (isCurrent) setError(getRequestErrorMessage(err, 'Could not load financial report.'))
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadReport()

    return () => {
      isCurrent = false
    }
  }, [period, referenceDate])

  const visibleTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const transactions = report?.recentTransactions || []
    if (!query) return transactions

    return transactions.filter((transaction) =>
      [
        transaction.type,
        transaction.invoiceNumber,
        transaction.counterparty,
        transaction.source,
        transaction.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [report, searchTerm])

  const summary = report?.summary
  const series = report?.series || []
  const strongestPeriod = [...series].sort((a, b) => Number(b.profitLoss) - Number(a.profitLoss))[0]
  const weakestPeriod = [...series].sort((a, b) => Number(a.profitLoss) - Number(b.profitLoss))[0]

  return (
    <div className="stack">
      <section className="card purchase-hero financial-report-hero">
        <div className="purchase-hero-copy">
          <span className="auth-brand">Partivex</span>
          <h2>Financial Reports</h2>
          <p>Admin-only purchase, sales, and profit/loss reporting from inventory purchases, part invoices, and appointment invoices.</p>
        </div>
        <div className="financial-report-controls" aria-label="Report filters">
          <div className="period-toggle">
            {periods.map((item) => (
              <button
                key={item.value}
                className={period === item.value ? 'is-active' : ''}
                type="button"
                onClick={() => setPeriod(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {period === 'daily' && (
            <input
              className="form-control"
              type="date"
              value={referenceDate}
              onChange={(event) => setReferenceDate(event.target.value)}
              aria-label="Report date"
            />
          )}
          {period === 'monthly' && (
            <input
              className="form-control"
              type="month"
              value={referenceDate.slice(0, 7)}
              onChange={(event) => setReferenceDate(`${event.target.value}-01`)}
              aria-label="Report month"
            />
          )}
          {period === 'yearly' && (
            <input
              className="form-control"
              type="number"
              min="2000"
              max="2100"
              value={referenceDate.slice(0, 4)}
              onChange={(event) => setReferenceDate(`${event.target.value || new Date().getFullYear()}-01-01`)}
              aria-label="Report year"
            />
          )}
        </div>
      </section>

      {error && <div className="inventory-notice is-error">{error}</div>}
      {loading && <p className="purchase-loading">Loading financial report...</p>}
      {!loading && !error && !summary && (
        <div className="empty-state">
          Financial report data is not available yet. Restart the backend so the new report API is active, then refresh this page.
        </div>
      )}

      {!loading && !error && summary && (
        <>
          <section className="financial-kpi-grid">
            <div className="stat-card financial-kpi">
              <span>Total sales</span>
              <strong>{formatCurrency(summary.totalSales)}</strong>
              <small>Parts and appointment invoices</small>
            </div>
            <div className="stat-card financial-kpi">
              <span>Total purchases</span>
              <strong>{formatCurrency(summary.totalPurchases)}</strong>
              <small>Inventory stock additions</small>
            </div>
            <div className={`stat-card financial-kpi ${summary.profitLoss < 0 ? 'is-loss' : 'is-profit'}`}>
              <span>Profit / loss</span>
              <strong>{formatCurrency(summary.profitLoss)}</strong>
              <small>{formatPercent(summary.profitMarginPercent)} margin</small>
            </div>
            <div className="stat-card financial-kpi">
              <span>Outstanding</span>
              <strong>{formatCurrency(summary.outstandingAppointmentSales)}</strong>
              <small>{summary.pendingAppointmentInvoiceCount} pending appointment invoices</small>
            </div>
          </section>

          <section className="financial-report-grid">
            <div className="card">
              <div className="section-heading">
                <div>
                  <h2>Sales Breakdown</h2>
                  <p>Customer part sales are generated from customer purchases; appointment sales use the invoice amount entered by staff/admin.</p>
                </div>
              </div>
              <div className="financial-channel-list">
                {report.salesChannels.map((channel) => (
                  <div className="financial-channel" key={channel.name}>
                    <div>
                      <strong>{channel.name}</strong>
                      <span>{channel.count} invoices</span>
                    </div>
                    <div className="financial-channel-amount">
                      <strong>{formatCurrency(channel.amount)}</strong>
                      <span>{formatPercent(channel.sharePercent)}</span>
                    </div>
                    <div className="financial-meter" aria-hidden="true">
                      <span style={{ width: `${Math.min(Number(channel.sharePercent || 0), 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="section-heading">
                <div>
                  <h2>Period Insight</h2>
                  <p>{formatRange(report.periodStart, report.periodEnd)} financial performance snapshot.</p>
                </div>
              </div>
              <div className="financial-insight-list">
                <div>
                  <span>Purchase invoices</span>
                  <strong>{summary.purchaseInvoiceCount}</strong>
                </div>
                <div>
                  <span>Part sale invoices</span>
                  <strong>{summary.customerPartInvoiceCount}</strong>
                </div>
                <div>
                  <span>Appointment invoices</span>
                  <strong>{summary.appointmentInvoiceCount}</strong>
                </div>
                <div>
                  <span>Paid appointments</span>
                  <strong>{summary.paidAppointmentInvoiceCount}</strong>
                </div>
                <div>
                  <span>Best result</span>
                  <strong>{strongestPeriod ? `${strongestPeriod.label} - ${formatCurrency(strongestPeriod.profitLoss)}` : '-'}</strong>
                </div>
                <div>
                  <span>Weakest result</span>
                  <strong>{weakestPeriod ? `${weakestPeriod.label} - ${formatCurrency(weakestPeriod.profitLoss)}` : '-'}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="section-heading">
              <div>
                <h2>{getSeriesTitle(period)}</h2>
                <p>Purchases, sales, and net result for the selected reporting period.</p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Purchases</th>
                    <th>Sales</th>
                    <th>Profit / Loss</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((item) => (
                    <tr key={item.label}>
                      <td>{item.label}</td>
                      <td>{formatCurrency(item.purchases)}</td>
                      <td>{formatCurrency(item.sales)}</td>
                      <td className={item.profitLoss < 0 ? 'financial-loss-text' : 'financial-profit-text'}>{formatCurrency(item.profitLoss)}</td>
                      <td><span className={`status-pill ${item.profitLoss < 0 ? 'is-alert' : 'is-good'}`}>{item.profitLoss < 0 ? 'Loss' : 'Profit'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <div className="section-heading">
              <div>
                <h2>Recent Finance Ledger</h2>
                <p>Latest purchase and sales movements inside this report window.</p>
              </div>
            </div>
            <input
              className="form-control"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search invoice, customer, vendor, source, or status..."
            />
            <div className="table-wrap financial-ledger-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Party</th>
                    <th>Source</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTransactions.map((transaction) => (
                    <tr key={`${transaction.type}-${transaction.invoiceNumber}-${transaction.date}`}>
                      <td><span className={`status-pill ${transaction.type === 'Sale' ? 'is-good' : 'is-draft'}`}>{transaction.type}</span></td>
                      <td>{transaction.invoiceNumber}</td>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.counterparty}</td>
                      <td>{transaction.source}</td>
                      <td>{formatCurrency(transaction.amount)}</td>
                      <td>{transaction.status}</td>
                    </tr>
                  ))}
                  {visibleTransactions.length === 0 && (
                    <tr><td colSpan="7" className="table-empty">No financial transactions found for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function getLocalDateValue() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getSeriesTitle(period) {
  if (period === 'daily') return 'Hourly Profit Trend'
  if (period === 'yearly') return 'Monthly Profit Trend'
  return 'Daily Profit Trend'
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(value ?? 0)
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

function formatRange(start, end) {
  if (!start || !end) return ''
  const endDate = new Date(end)
  endDate.setDate(endDate.getDate() - 1)
  return `${formatDate(start)} to ${formatDate(endDate)}`
}

export default FinancialReports
