import { useEffect, useState } from 'react'
import { getActivityLogs } from '../../api/activityLogApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import StatusMessage from '../../components/ui/StatusMessage'

const initialFilters = {
  user: '',
  action: '',
  from: '',
  to: '',
}

function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  async function loadLogs(nextFilters = filters) {
    try {
      setIsLoading(true)
      setStatus('')

      const params = Object.fromEntries(
        Object.entries(nextFilters).filter(([, value]) => value),
      )

      const response = await getActivityLogs(params)
      setLogs(response.data)
    } catch (error) {
      setStatus(getRequestErrorMessage(error, 'Unable to load activity logs.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs(initialFilters)
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    loadLogs(filters)
  }

  function handleReset() {
    setFilters(initialFilters)
    loadLogs(initialFilters)
  }

  return (
    <section className="page-stack">
      <div className="surface-panel">
        <PageHeader
          title="Activity Logs"
          subtitle="Review admin actions recorded by the system."
        />

        <form className="managed-form" onSubmit={handleSubmit}>
          <Input label="User" name="user" value={filters.user} onChange={handleChange} />
          <Input label="Action" name="action" value={filters.action} onChange={handleChange} />
          <Input
            label="From"
            name="from"
            type="datetime-local"
            value={filters.from}
            onChange={handleChange}
          />
          <Input
            label="To"
            name="to"
            type="datetime-local"
            value={filters.to}
            onChange={handleChange}
          />

          <div className="form-actions">
            <Button type="submit">Filter</Button>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </div>

      <div className="surface-panel">
        {status && <StatusMessage type="error" message={status} />}
        {isLoading && <StatusMessage message="Loading activity logs..." />}
        {!isLoading && !status && logs.length === 0 && (
          <StatusMessage type="empty" message="No activity logs found." />
        )}

        {!isLoading && !status && logs.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Description</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.createdAt)}</td>
                    <td>{log.userName || log.userId || 'System'}</td>
                    <td>{log.role}</td>
                    <td>{log.action}</td>
                    <td>{[log.entityName, log.entityId].filter(Boolean).join(' ')}</td>
                    <td>{log.description}</td>
                    <td>{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default ActivityLogs
