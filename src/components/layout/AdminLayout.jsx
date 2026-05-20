import { useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getSmtpSetting, updateSmtpSetting } from '../../api/appointmentInvoiceApi'
import { getUnreadCount } from '../../api/notificationApi'
import useAuth from '../../hooks/useAuth'
import { sweetAlert } from '../../utils/sweetAlert'
import { hasRole, ROLES } from '../../utils/roles'

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const isAdmin = hasRole(user?.role, [ROLES.ADMIN])
  const basePath = location.pathname.startsWith('/staff') ? '/staff' : '/admin'
  const panelLabel = isAdmin ? 'Admin Panel' : 'Staff Panel'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [senderEmail, setSenderEmail] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount()
      setUnreadCount(res.data ?? 0)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    refreshUnreadCount()
    const interval = setInterval(refreshUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [refreshUnreadCount])

  const navItems = [
    ...(isAdmin ? [{ to: basePath, label: 'Dashboard', end: true }] : []),
    ...(isAdmin ? [{ to: `${basePath}/staff`, label: 'Staff Management' }] : []),
    { to: `${basePath}/customers`, label: 'Customer Management' },
    { to: `${basePath}/vehicles`, label: 'Vehicles' },
          ...(isAdmin
      ? [
          { to: `${basePath}/vendors`, label: 'Vendor Management' },
          { to: `${basePath}/parts`, label: 'Parts Management' },
          { to: `${basePath}/inventory`, label: 'Inventory Monitoring' },
          { to: `${basePath}/purchases`, label: 'Purchase Invoices' },
          { to: `${basePath}/customer-part-invoices`, label: 'Customer Part Invoices' },
          { to: `${basePath}/appointment-invoices`, label: 'Appointment Invoices' },
        ]
      : [
          { to: `${basePath}/customers/reports`, label: 'Customer Reports' },
          { to: `${basePath}/part-requests`, label: 'Part Request Approvals' },
          { to: `${basePath}/customer-part-invoices`, label: 'Customer Part Invoices' },
          { to: `${basePath}/appointment-invoices`, label: 'Appointment Invoices' },
          { to: `${basePath}/sales`, label: 'Sales' },
          { to: `${basePath}/notifications`, label: 'Notifications' },
        ]),
  ]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNavClick() {
    setSidebarOpen(false)
  }

  async function openSettings() {
    setSettingsOpen(true)
    try {
      const response = await getSmtpSetting()
      setSenderEmail(response.data.senderEmail || '')
    } catch {
      setSenderEmail('')
    }
  }

  async function submitSettings(event) {
    event.preventDefault()
    try {
      setSettingsSaving(true)
      const response = await updateSmtpSetting(senderEmail)
      setSenderEmail(response.data.senderEmail || '')
      setSettingsOpen(false)
      await sweetAlert({ title: 'SMTP sender saved', message: 'Invoice emails will use the updated sender address.', icon: 'success' })
    } catch {
      await sweetAlert({ title: 'Settings failed', message: 'Sender email could not be saved.', icon: 'error' })
    } finally {
      setSettingsSaving(false)
    }
  }

  return (
    <div className="admin-shell">
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <button
          className="admin-sidebar-close"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="admin-brand">Partivex</div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={handleNavClick}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              className="hamburger-btn"
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <span className="eyebrow">{panelLabel}</span>
              <h1>Operations</h1>
            </div>
          </div>
          <div className="topbar-actions">
            {isAdmin && (
              <button className="topbar-icon-button" type="button" onClick={openSettings} aria-label="Email settings" title="Email settings">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.06V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.06-.33H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.06V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 .67 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.38.36.72.6 1 .28.28.66.44 1.06.44H21a2 2 0 0 1 0 4h-.09c-.4 0-.78.16-1.06.44-.28.28-.48.62-.45 1.12Z"></path>
                </svg>
              </button>
            )}
            <button
              className="topbar-icon-button"
              type="button"
              onClick={() => navigate(`${basePath}/notifications`)}
              aria-label="Notifications"
              title="Notifications"
              style={{ position: 'relative' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: 'var(--color-danger, #e53e3e)', color: '#fff',
                  borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, pointerEvents: 'none'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <span className="metric-pill">{user?.email || user?.role || panelLabel}</span>
            <button className="text-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {settingsOpen && (
        <div className="dialog-overlay">
          <form className="dialog-card" onSubmit={submitSettings}>
            <h3>Email sender settings</h3>
            <p>Set the sender email used for invoice emails.</p>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="smtp-sender-email">Sender email</label>
              <input id="smtp-sender-email" className="form-control" type="email" value={senderEmail} onChange={(event) => setSenderEmail(event.target.value)} required />
            </div>
            <div className="dialog-actions">
              <button className="button button-secondary" type="button" onClick={() => setSettingsOpen(false)}>Cancel</button>
              <button className="button" type="submit" disabled={settingsSaving}>{settingsSaving ? 'Saving...' : 'Save sender'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminLayout
