import { useEffect, useState } from 'react'
import { getNotifications, markAsRead } from '../../api/notificationApi'
import PageHeader from '../../components/common/PageHeader'

const TYPE_LABELS = {
  LowStock: { label: 'Low Stock', color: 'is-warn' },
  NewSale: { label: 'New Sale', color: 'is-good' },
  NewCustomer: { label: 'New Customer', color: 'is-info' },
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await getNotifications()
        if (active) setNotifications(res.data || [])
      } catch {
        if (active) setError('Could not load notifications.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  async function handleMarkRead(id) {
    try {
      await markAsRead(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
    } catch {
      // silent
    }
  }

  async function handleMarkAllRead() {
    const unread = notifications.filter((n) => !n.isRead)
    await Promise.all(unread.map((n) => markAsRead(n.id).catch(() => {})))
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <section className="surface-panel">
      <PageHeader
        title="Notifications"
        subtitle="System alerts for low stock, new sales, and new customer registrations."
      />

      {loading && <p className="text-muted">Loading notifications...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="text-muted">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</span>
            {unreadCount > 0 && (
              <button className="button button-outline" type="button" onClick={handleMarkAllRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 && (
              <p className="text-muted" style={{ padding: '24px 0' }}>No notifications yet.</p>
            )}
            {notifications.map((n) => {
              const typeInfo = TYPE_LABELS[n.type] || { label: n.type, color: '' }
              return (
                <div
                  key={n.id}
                  className={`notification-item ${n.isRead ? 'is-read' : 'is-unread'}`}
                >
                  <div className="notification-item-header">
                    <span className={`status-pill ${typeInfo.color}`}>{typeInfo.label}</span>
                    <span className="notification-time">{formatTimeAgo(n.createdAt)}</span>
                  </div>
                  <strong className="notification-title">{n.title}</strong>
                  <p className="notification-message">{n.message}</p>
                  {!n.isRead && (
                    <button
                      className="button button-outline button-sm"
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}

function formatTimeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default NotificationsPage
