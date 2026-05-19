import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function Dashboard() {
  const { user } = useAuth()

  return (
    <section className="page-stack" style={{ padding: '0 var(--space-4)' }}>
      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 'var(--space-6)'
      }}>

        {/* Large Hero Card */}
        <div className="panel hero-panel" style={{
          gridColumn: '1 / -1',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          overflow: 'hidden',
          padding: 'var(--space-12)',
          background: 'var(--color-sidebar-bg)',
          color: 'white'
        }}>
          {/* Faux background image / gradient for premium feel */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(239, 35, 60, 0.8), rgba(23, 26, 33, 0.9)), url("/src/assets/auth-vehicle-bg.png") center / cover',
            zIndex: 0,
            opacity: 0.7
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: '#2B303B',
              border: '1px solid #3A404C',
              borderRadius: '999px',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              marginBottom: 'var(--space-4)'
            }}>
              Partivex Workspace
            </span>
            <h1 style={{ color: 'white', fontSize: 'var(--text-6xl)', fontWeight: 'var(--weight-extrabold)', marginBottom: 'var(--space-4)', letterSpacing: '-1px', lineHeight: 1.1 }}>
              Precision service management.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-8)' }}>
              Track customer vehicles, manage updates, and keep service records moving from one focused workspace.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <Link className="button" style={{ background: 'white', color: 'black' }} to="/vehicles">
                Manage Vehicles
              </Link>
              <Link className="button" style={{ background: '#2B303B', color: 'white', border: '1px solid #3A404C' }} to="/customers">
                View Customers
              </Link>
            </div>
          </div>
        </div>

        {/* Status / Account Card */}
        <div className="panel" style={{ background: 'white' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <span className="eyebrow" style={{ display: 'block' }}>Signed In As</span>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>{user?.fullName || user?.email || 'Partivex user'}</h2>
            </div>
          </div>

          <div className="details-grid" style={{ background: 'var(--color-bg)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Role</span>
              <strong style={{ display: 'block', fontSize: 'var(--text-lg)', marginTop: '4px' }}>{user?.role || 'Customer'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Customer ID</span>
              <strong style={{ display: 'block', fontSize: 'var(--text-lg)', marginTop: '4px' }}>{user?.customerId || 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* Feature Cards with Premium Styling */}
        <Link className="panel" to="/customers/reports" style={{ textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 35, 60, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            </div>
            <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Operations Reports</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.5 }}>
              Access customer analytics, service performance, and generate complete operational reports.
            </p>
          </div>
        </Link>

      </div>
    </section>
  )
}

export default Dashboard
