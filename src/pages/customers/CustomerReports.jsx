import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import StatusMessage from '../../components/ui/StatusMessage'
import {
  getCreditCustomersReport,
  getHighSpendersReport,
  getRegularCustomersReport,
} from '../../services/customerService'

const reportConfig = [
  {
    key: 'regular',
    title: 'Regular Customers',
    subtitle: 'Customers with steady service or purchase activity.',
    loader: getRegularCustomersReport,
  },
  {
    key: 'highSpenders',
    title: 'High Spenders',
    subtitle: 'Customers with the largest recorded spending totals.',
    loader: getHighSpendersReport,
  },
  {
    key: 'credit',
    title: 'Credit Customers',
    subtitle: 'Customers with tracked credit or balance information.',
    loader: getCreditCustomersReport,
  },
]

function normalizeReportRows(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.records)) return data.records
  if (Array.isArray(data?.customers)) return data.customers
  if (Array.isArray(data?.items)) return data.items
  return []
}

function resolveMetric(row) {
  const value = row.totalSpent ?? row.totalAmount ?? row.amount ?? row.balance ?? row.outstandingBalance ?? row.creditAmount

  if (value === null || value === undefined || value === '') return 'Not set'
  if (typeof value === 'number') return value.toLocaleString()

  const parsedValue = Number(value)
  return Number.isNaN(parsedValue) ? String(value) : parsedValue.toLocaleString()
}

function CustomerReports() {
  const [reports, setReports] = useState(() =>
    reportConfig.reduce(
      (accumulator, item) => ({
        ...accumulator,
        [item.key]: { rows: [], loading: true, error: '' },
      }),
      {},
    ),
  )

  useEffect(() => {
    let isCurrent = true

    async function loadReport(item) {
      try {
        const data = await item.loader()
        if (!isCurrent) return

        setReports((current) => ({
          ...current,
          [item.key]: {
            rows: normalizeReportRows(data),
            loading: false,
            error: '',
          },
        }))
      } catch (error) {
        if (!isCurrent) return

        setReports((current) => ({
          ...current,
          [item.key]: {
            rows: [],
            loading: false,
            error: getApiErrorMessage(error, `Unable to load ${item.title.toLowerCase()}.`),
          },
        }))
      }
    }

    reportConfig.forEach((item) => {
      loadReport(item)
    })

    return () => {
      isCurrent = false
    }
  }, [])

  function renderReportTable(rows) {
    return (
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Metric</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id ?? `${row.fullName || row.name || 'customer'}-${index}`}>
                <td>{row.fullName || row.name || 'Unnamed customer'}</td>
                <td>{row.phoneNumber || row.phone || <span className="text-muted">Not set</span>}</td>
                <td>{row.email || <span className="text-muted">Not set</span>}</td>
                <td>{resolveMetric(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <section className="page-stack">
      <div className="surface-panel">
        <PageHeader
          title="Customer Reports"
          subtitle="Operational summaries for regular customers, high spenders, and customers on credit."
        />
      </div>

      {reportConfig.map((item) => {
        const section = reports[item.key]

        return (
          <div className="surface-panel" key={item.key}>
            <div className="section-heading">
              <PageHeader title={item.title} subtitle={item.subtitle} />
              <span className="metric-pill">{section.rows.length} records</span>
            </div>

            {section.loading && <StatusMessage message={`Loading ${item.title.toLowerCase()}...`} />}
            {section.error && <StatusMessage type="error" message={section.error} />}
            {!section.loading && !section.error && section.rows.length === 0 && (
              <StatusMessage type="empty" message={`No ${item.title.toLowerCase()} records were found.`} />
            )}
            {!section.loading && !section.error && section.rows.length > 0 && renderReportTable(section.rows)}
          </div>
        )
      })}
    </section>
  )
}

export default CustomerReports
