import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getSmtpSetting, updateSmtpSetting } from '../../api/appointmentInvoiceApi'
import { getMyStaffFeatureAccess } from '../../api/staffFeatureAccessApi'
import { STAFF_FEATURES } from '../../constants/staffFeatures'
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
  const [smtpSettings, setSmtpSettings] = useState({
    senderEmail: '',
    host: '',
    port: 587,
    username: '',
    password: '',
    enableSsl: true,
  })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [staffFeatures, setStaffFeatures] = useState([])

  useEffect(() => {
    let isCurrent = true

    async function loadStaffFeatures() {
      if (isAdmin) {
        setStaffFeatures([])
        return
      }

      try {
        const response = await getMyStaffFeatureAccess()
        if (isCurrent) setStaffFeatures(response.data.features)
      } catch {
        if (isCurrent) setStaffFeatures([])
      }
    }

    loadStaffFeatures()

    return () => {
      isCurrent = false
    }
  }, [isAdmin])

  const enabledStaffFeatureKeys = new Set(
    staffFeatures.filter((feature) => feature.isEnabled).map((feature) => feature.featureKey),
  )

  const navItems = [
    ...(isAdmin ? [{ to: basePath, label: 'Dashboard', end: true }] : []),
    ...(isAdmin ? [{ to: `${basePath}/staff`, label: 'Staff Management' }] : []),
    ...(isAdmin ? [{ to: `${basePath}/customers`, label: 'Customer Management' }] : []),
    ...(isAdmin ? [{ to: `${basePath}/vehicles`, label: 'Vehicles' }] : []),
          ...(isAdmin
      ? [
          { to: `${basePath}/vendors`, label: 'Vendor Management' },
          { to: `${basePath}/parts`, label: 'Parts Management' },
          { to: `${basePath}/inventory`, label: 'Inventory Monitoring' },
          { to: `${basePath}/purchases`, label: 'Purchase Invoices' },
          { to: `${basePath}/customer-part-invoices`, label: 'Customer Part Invoices' },
          { to: `${basePath}/appointment-invoices`, label: 'Appointment Invoices' },
        ]
      : STAFF_FEATURES.filter((feature) => enabledStaffFeatureKeys.has(feature.key)).map((feature) => ({
          to: feature.path,
          label: feature.label,
        }))),
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
      setSmtpSettings({
        senderEmail: response.data.senderEmail || '',
        host: response.data.host || '',
        port: response.data.port || 587,
        username: response.data.username || '',
        password: '',
        enableSsl: response.data.enableSsl ?? true,
      })
    } catch {
      setSmtpSettings((current) => ({ ...current, password: '' }))
    }
  }

  function handleSmtpChange(event) {
    const { name, type, value, checked } = event.target
    setSmtpSettings((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function submitSettings(event) {
    event.preventDefault()
    try {
      setSettingsSaving(true)
      const response = await updateSmtpSetting({
        ...smtpSettings,
        port: Number(smtpSettings.port) || 587,
        password: smtpSettings.password.trim() || null,
      })
      setSmtpSettings({
        senderEmail: response.data.senderEmail || '',
        host: response.data.host || '',
        port: response.data.port || 587,
        username: response.data.username || '',
        password: '',
        enableSsl: response.data.enableSsl ?? true,
      })
      setSettingsOpen(false)
      await sweetAlert({ title: 'SMTP settings saved', message: 'Customer part and appointment invoice email menus will use these SMTP settings.', icon: 'success' })
    } catch {
      await sweetAlert({ title: 'Settings failed', message: 'SMTP settings could not be saved.', icon: 'error' })
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
            <h3>Email SMTP settings</h3>
            <p>Set the real SMTP connection used by customer part and appointment invoice email actions.</p>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="smtp-sender-email">Sender email</label>
              <input id="smtp-sender-email" name="senderEmail" className="form-control" type="email" value={smtpSettings.senderEmail} onChange={handleSmtpChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="smtp-host">SMTP host</label>
              <input id="smtp-host" name="host" className="form-control" value={smtpSettings.host} onChange={handleSmtpChange} placeholder="smtp.gmail.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="smtp-port">Port</label>
              <input id="smtp-port" name="port" className="form-control" type="number" min="1" max="65535" value={smtpSettings.port} onChange={handleSmtpChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="smtp-username">Username</label>
              <input id="smtp-username" name="username" className="form-control" value={smtpSettings.username} onChange={handleSmtpChange} />
            </div>
            <div className="form-group">
              <label htmlFor="smtp-password">Password</label>
              <input id="smtp-password" name="password" className="form-control" type="password" value={smtpSettings.password} onChange={handleSmtpChange} placeholder="Leave blank to keep saved password" />
            </div>
            <label className="form-check">
              <input name="enableSsl" type="checkbox" checked={smtpSettings.enableSsl} onChange={handleSmtpChange} />
              <span>Use SSL/TLS</span>
            </label>
            <div className="inventory-notice" style={{ marginTop: 12 }}>
              Customer part invoices, appointment invoices, and overdue reminders all use this SMTP setup.
            </div>
            <div className="dialog-actions">
              <button className="button button-secondary" type="button" onClick={() => setSettingsOpen(false)}>Cancel</button>
              <button className="button" type="submit" disabled={settingsSaving}>{settingsSaving ? 'Saving...' : 'Save SMTP settings'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminLayout
