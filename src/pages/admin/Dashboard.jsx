import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboardSummary } from '../../api/adminDashboardApi'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import StatusMessage from '../../components/ui/StatusMessage'

const emptySummary = {
  staffCount: 0,
  customerCount: 0,
  vehicleCount: 0,
  totalSales: 0,
  totalStockQuantity: 0,
  lowStockPartsCount: 0,
  lineGraphData: [],
  histogramData: [],
}

function Dashboard() {
  const [summary, setSummary] = useState(emptySummary)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadDashboard() {
      try {
        setStatus('')
        const response = await getAdminDashboardSummary()
        if (isCurrent) setSummary(normalizeSummary(response.data))
      } catch (error) {
        if (isCurrent) setStatus(getApiErrorMessage(error, 'Unable to load dashboard.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadDashboard()

    return () => {
      isCurrent = false
    }
  }, [])

  const cards = [
    { label: 'Staff', value: formatNumber(summary.staffCount), to: '/admin/staff' },
    { label: 'Customers', value: formatNumber(summary.customerCount), to: '/admin/customers' },
    { label: 'Vehicles', value: formatNumber(summary.vehicleCount), to: '/admin/vehicles' },
    { label: 'Total sales', value: formatCurrency(summary.totalSales) },
    { label: 'Stock quantity', value: formatNumber(summary.totalStockQuantity), to: '/admin/inventory' },
    { label: 'Low stock parts', value: formatNumber(summary.lowStockPartsCount), to: '/admin/inventory' },
  ]

  return (
    <section className="page-stack admin-dashboard">
      <div className="surface-panel dashboard-hero-panel">
        <PageHeader
          title="Dashboard"
          subtitle="Live operational snapshot from staff, customers, sales, and inventory."
        />

        {isLoading && <StatusMessage message="Loading dashboard..." />}
        {status && <StatusMessage type="error" message={status} />}

        {!isLoading && !status && (
          <div className="dashboard-stat-grid">
            {cards.map((card) =>
              card.to ? (
                <Link key={card.label} className="dashboard-stat-card stat-link" to={card.to}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </Link>
              ) : (
                <article key={card.label} className="dashboard-stat-card">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </article>
              ),
            )}
          </div>
        )}
      </div>

      {!isLoading && !status && (
        <div className="dashboard-chart-grid">
          <article className="surface-panel dashboard-chart-panel">
            <div className="section-heading">
              <PageHeader title="Sales Trend" subtitle="Paid invoice totals over the last 7 days." />
            </div>
            <LineChart data={summary.lineGraphData} />
          </article>

          <article className="surface-panel dashboard-chart-panel">
            <div className="section-heading">
              <PageHeader title="Stock by Category" subtitle="Current active stock grouped by category." />
            </div>
            <BarChart data={summary.histogramData} />
          </article>
        </div>
      )}
    </section>
  )
}

function LineChart({ data }) {
  const points = Array.isArray(data) ? data : []
  const maxValue = Math.max(...points.map((point) => Number(point.value) || 0), 1)
  const width = 640
  const height = 260
  const padding = 34
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2
  const chartPoints = points.map((point, index) => {
    const x = padding + (points.length <= 1 ? 0 : (index / (points.length - 1)) * innerWidth)
    const y = padding + innerHeight - ((Number(point.value) || 0) / maxValue) * innerHeight
    return { ...point, x, y }
  })
  const path = chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

  if (points.length === 0) {
    return <StatusMessage type="empty" message="No sales trend data yet." />
  }

  return (
    <div className="dashboard-chart-scroll">
      <svg className="dashboard-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sales trend line graph">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
        <path d={path} className="dashboard-line-path" />
        {chartPoints.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" />
            <text x={point.x} y={height - 9} textAnchor="middle">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function BarChart({ data }) {
  const bars = Array.isArray(data) ? data : []
  const maxValue = Math.max(...bars.map((bar) => Number(bar.value) || 0), 1)

  if (bars.length === 0) {
    return <StatusMessage type="empty" message="No stock data yet." />
  }

  return (
    <div className="dashboard-bars" role="img" aria-label="Stock by category bar chart">
      {bars.map((bar) => {
        const percentage = Math.max(4, ((Number(bar.value) || 0) / maxValue) * 100)

        return (
          <div key={bar.label} className="dashboard-bar-row">
            <span>{bar.label}</span>
            <div className="dashboard-bar-track">
              <div className="dashboard-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
            <strong>{formatNumber(bar.value)}</strong>
          </div>
        )
      })}
    </div>
  )
}

function normalizeSummary(data = {}) {
  return {
    staffCount: data.staffCount ?? data.StaffCount ?? 0,
    customerCount: data.customerCount ?? data.CustomerCount ?? 0,
    vehicleCount: data.vehicleCount ?? data.VehicleCount ?? 0,
    totalSales: data.totalSales ?? data.TotalSales ?? 0,
    totalStockQuantity: data.totalStockQuantity ?? data.TotalStockQuantity ?? 0,
    lowStockPartsCount: data.lowStockPartsCount ?? data.LowStockPartsCount ?? 0,
    lineGraphData: normalizePoints(data.lineGraphData ?? data.LineGraphData),
    histogramData: normalizePoints(data.histogramData ?? data.HistogramData),
  }
}

function normalizePoints(points = []) {
  return points.map((point) => ({
    label: point.label ?? point.Label ?? '',
    value: Number(point.value ?? point.Value ?? 0),
  }))
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 }).format(value ?? 0)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(value ?? 0)
}

export default Dashboard
