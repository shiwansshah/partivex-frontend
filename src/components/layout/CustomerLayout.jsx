import { useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getProfile } from '../../api/authApi'
import { getUnreadCount } from '../../api/notificationApi'
import { downloadMyAppointmentInvoicePdf, getMyAppointmentInvoices, payMyAppointmentInvoice } from '../../api/appointmentInvoiceApi'
import { removeToken } from '../../utils/tokenStorage'
import { sweetAlert } from '../../utils/sweetAlert'
import useAuth from '../../hooks/useAuth'
import PortalModal from '../customer/PortalModal'
import '../../styles/customer.css'

const portalLinks = [
  {
    to: '/customer',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
  },
  {
    to: '/customer/vehicles',
    label: 'Vehicles',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
        <circle cx="7" cy="17" r="2"></circle>
        <path d="M9 17h6"></path>
        <circle cx="17" cy="17" r="2"></circle>
      </svg>
    ),
  },
  {
    to: '/customer/appointments',
    label: 'Appointments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
  },
  {
    to: '/customer/part-requests',
    label: 'Parts Shop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15"></path>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
        <path d="m3.3 7 8.7 5 8.7-5"></path>
        <path d="M12 22V12"></path>
      </svg>
    ),
  },
  {
    to: '/customer/reviews',
    label: 'Reviews',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  },
]

const profileMenuItems = [
  {
    to: '/customer/profile',
    label: 'Profile settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
  {
    to: '/customer/appointments',
    label: 'Appointments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <path d="m9 16 2 2 4-5"></path>
      </svg>
    ),
  },
]

const logoutIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)

function CustomerLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [partShopCart, setPartShopCart] = useState({ count: 0, onOpen: null })
  const [appointmentInvoicesOpen, setAppointmentInvoicesOpen] = useState(false)
  const [appointmentInvoices, setAppointmentInvoices] = useState([])
  const [appointmentInvoicesLoading, setAppointmentInvoicesLoading] = useState(false)
  const [notifUnreadCount, setNotifUnreadCount] = useState(0)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const refreshNotifCount = useCallback(async () => {
    try {
      const res = await getUnreadCount()
      setNotifUnreadCount(res.data ?? 0)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    refreshNotifCount()
    const id = setInterval(refreshNotifCount, 30000)
    return () => clearInterval(id)
  }, [refreshNotifCount])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (user?.fullName && !user.fullName.includes('@')) {
      return
    }

    let isCurrent = true

    async function loadProfileName() {
      try {
        const response = await getProfile()
        if (isCurrent) setProfileName(response.data?.fullName || '')
      } catch {
        if (isCurrent) setProfileName('')
      }
    }

    loadProfileName()

    return () => {
      isCurrent = false
    }
  }, [user?.fullName])

  function handleLogout() {
    removeToken()
    navigate('/login')
  }

  function closeMenus() {
    setDropdownOpen(false)
    setMobileNavOpen(false)
  }

  function openPartShopCart() {
    if (typeof partShopCart.onOpen === 'function') {
      partShopCart.onOpen()
      return
    }

    navigate('/customer/part-requests')
  }

  async function openAppointmentInvoices() {
    setAppointmentInvoicesOpen(true)
    setAppointmentInvoicesLoading(true)
    try {
      const response = await getMyAppointmentInvoices()
      setAppointmentInvoices(response.data || [])
    } catch {
      setAppointmentInvoices([])
      await sweetAlert({ title: 'Invoices unavailable', message: 'Appointment invoices could not be loaded.', icon: 'error' })
    } finally {
      setAppointmentInvoicesLoading(false)
    }
  }

  async function payAppointmentInvoice(invoice) {
    try {
      await payMyAppointmentInvoice(invoice.id)
      const response = await getMyAppointmentInvoices()
      setAppointmentInvoices(response.data || [])
      await sweetAlert({ title: 'Payment complete', message: `${invoice.invoiceNumber} is marked as paid.`, icon: 'success' })
    } catch {
      await sweetAlert({ title: 'Payment failed', message: 'Appointment invoice could not be paid.', icon: 'error' })
    }
  }

  async function downloadAppointmentInvoice(invoice) {
    try {
      const response = await downloadMyAppointmentInvoicePdf(invoice.id)
      downloadBlob(response.data, `${invoice.invoiceNumber}.pdf`)
    } catch {
      await sweetAlert({ title: 'Download failed', message: 'Appointment invoice PDF could not be downloaded.', icon: 'error' })
    }
  }

  const tokenName = user?.fullName && !user.fullName.includes('@') ? user.fullName : ''
  const customerName = profileName || tokenName || user?.email?.split('@')[0] || 'Customer'
  const userInitials = customerName && customerName !== 'Customer'
    ? customerName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'C'

  return (
    <div className="customer-shell">
      <a className="customer-skip-link" href="#customer-main">Skip to main content</a>

      <header className="customer-topbar">
        <div className="customer-topbar-inner">
          <div className="customer-brand-block">
            <NavLink to="/customer" className="customer-navbar-brand" onClick={closeMenus}>
              Parti<span>vex</span>
            </NavLink>
            <span>Vehicle Service Portal</span>
          </div>

          <button
            className="customer-menu-btn"
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`customer-nav-links ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Customer portal navigation">
            {portalLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/customer'}
                className="customer-nav-link"
                onClick={closeMenus}
              >
                <span className="customer-nav-icon" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="customer-nav-right" ref={dropdownRef}>
            <button
              className="customer-cart-nav-button"
              type="button"
              onClick={() => navigate('/customer/notifications')}
              aria-label="Notifications"
              title="Notifications"
              style={{ position: 'relative' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {notifUnreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: 'var(--color-danger, #e53e3e)', color: '#fff',
                  borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, pointerEvents: 'none'
                }}>
                  {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
                </span>
              )}
            </button>
            <button
              className={`customer-cart-nav-button ${appointmentInvoices.some((invoice) => invoice.paymentStatus === 'Pending') ? 'has-items' : ''}`}
              type="button"
              onClick={openAppointmentInvoices}
              aria-label="Open appointment invoices"
              title="Appointment invoices"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 2h16v20l-3-2-3 2-3-2-3 2-4-2V2Z"></path>
                <path d="M8 7h8"></path>
                <path d="M8 11h8"></path>
                <path d="M8 15h5"></path>
              </svg>
            </button>

            <button
              className={`customer-cart-nav-button ${partShopCart.count > 0 ? 'has-items' : ''}`}
              type="button"
              onClick={openPartShopCart}
              aria-label={`Open cart${partShopCart.count > 0 ? ` with ${partShopCart.count} items` : ''}`}
              title="Cart"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="21" r="1"></circle>
                <circle cx="19" cy="21" r="1"></circle>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.72a2 2 0 0 0 2-1.61l1.38-7.39H5.12"></path>
              </svg>
              {partShopCart.count > 0 && <span>{partShopCart.count}</span>}
            </button>

            <button
              className="profile-avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Profile menu"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              type="button"
            >
              <div className="avatar-circle" aria-hidden="true">
                {userInitials}
              </div>
            </button>

            {dropdownOpen && (
              <div className="profile-stack-menu" role="menu" aria-label="Customer quick menu">
                {profileMenuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="profile-stack-item"
                    role="menuitem"
                    aria-label={item.label}
                    title={item.label}
                    onClick={closeMenus}
                  >
                    {item.icon}
                  </NavLink>
                ))}
                <button
                  className="profile-stack-item is-danger"
                  role="menuitem"
                  aria-label="Logout"
                  title="Logout"
                  onClick={handleLogout}
                  type="button"
                >
                  {logoutIcon}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {mobileNavOpen && <button className="customer-nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <div className="customer-app">
        <main id="customer-main" className="customer-content" tabIndex="-1">
          <Outlet context={{ setPartShopCart }} />
        </main>
      </div>

      {appointmentInvoicesOpen && (
        <PortalModal title="Appointment invoices" className="portal-modal-wide" onClose={() => setAppointmentInvoicesOpen(false)}>
          {appointmentInvoicesLoading ? (
            <p className="text-muted">Loading appointment invoices...</p>
          ) : (
            <div className="part-shop-modal-table">
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Invoice</th><th>Service</th><th>Vehicle</th><th>Total</th><th>Payment</th><th>Actions</th></tr></thead>
                  <tbody>
                    {appointmentInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td><div className="inventory-part-cell"><strong>{invoice.invoiceNumber}</strong><span>{formatDateTime(invoice.invoiceDate)}</span></div></td>
                        <td>{invoice.serviceType}</td>
                        <td>{invoice.vehicleName} - {invoice.vehicleNumber}</td>
                        <td>{formatCurrency(invoice.amount)}</td>
                        <td><span className={`status-pill ${invoice.paymentStatus === 'Paid' ? 'is-good' : 'is-draft'}`}>{invoice.paymentStatus}</span></td>
                        <td>
                          <div className="table-actions">
                            {invoice.paymentStatus === 'Pending' && <button className="button button-outline" type="button" onClick={() => payAppointmentInvoice(invoice)}>Pay</button>}
                            <button className="button button-outline" type="button" onClick={() => downloadAppointmentInvoice(invoice)}>PDF</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {appointmentInvoices.length === 0 && <tr><td colSpan="6" className="table-empty">No appointment invoices yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </PortalModal>
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

export default CustomerLayout
