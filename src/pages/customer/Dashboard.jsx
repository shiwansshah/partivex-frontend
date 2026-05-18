import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { getProfile } from '../../api/authApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import { getAppointments, getPartRequests, getReviews } from '../../api/customerPortalApi'
import { getMyVehicles } from '../../api/vehicleApi'
import PortalEmptyState from '../../components/customer/PortalEmptyState'
import PortalHero from '../../components/customer/PortalHero'
import StatusBadge from '../../components/customer/StatusBadge'
import StatusMessage from '../../components/ui/StatusMessage'
import { formatDate, formatDateTime, formatTime } from '../../utils/customerPortalFormatters'
import { customerPortalImages } from '../../utils/customerPortalImages'

function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [appointments, setAppointments] = useState([])
  const [partRequests, setPartRequests] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadDashboard() {
      try {
        const [profileResponse, vehicleResponse, appointmentResponse, requestResponse, reviewResponse] = await Promise.all([
          getProfile(),
          getMyVehicles(),
          getAppointments(),
          getPartRequests(),
          getReviews(),
        ])

        if (!isCurrent) return

        setProfile(profileResponse.data)
        setVehicles(vehicleResponse.data)
        setAppointments(appointmentResponse.data)
        setPartRequests(requestResponse.data)
        setReviews(reviewResponse.data)
      } catch (err) {
        if (isCurrent) {
          setError(getRequestErrorMessage(err, 'Failed to load your customer dashboard.'))
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      isCurrent = false
    }
  }, [])

  const nextAppointment = useMemo(() => {
    const now = new Date()

    return appointments
      .filter((appointment) => appointment.status !== 'Cancelled')
      .map((appointment) => ({
        ...appointment,
        dateTime: new Date(`${appointment.preferredDate}T${appointment.preferredTime || '00:00'}`),
      }))
      .filter((appointment) => appointment.dateTime >= now)
      .sort((a, b) => a.dateTime - b.dateTime)[0]
  }, [appointments])

  const pendingRequests = partRequests.filter((request) => request.status === 'Pending')
  const openAppointments = appointments.filter((appointment) => ['Pending', 'Confirmed'].includes(appointment.status))
  const completedAppointments = appointments.filter((appointment) => appointment.status === 'Completed')
  const recentPartRequests = [...partRequests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  if (loading) {
    return (
      <div className="customer-container portal-container">
        <StatusMessage type="loading" message="Preparing your service dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="customer-container portal-container">
        <div className="customer-state-card">
          <StatusMessage type="error" message={error} />
        </div>
      </div>
    )
  }

  const firstName = profile?.fullName?.split(' ').filter(Boolean)[0] || 'there'

  return (
    <div className="customer-page">
      <PortalHero
        eyebrow={`Welcome back, ${firstName}`}
        title="A clear home for your vehicles, visits, and parts"
        description="Review your registered vehicles, upcoming service requests, part inquiries, and feedback history from one organized customer workspace."
        imageSrc={customerPortalImages.dashboardHero}
        imageAlt="Technician working in a professional vehicle service bay"
        actions={(
          <>
            <Link className="btn-primary" to="/customer/appointments">Book service</Link>
            <Link className="btn-outline btn-outline-on-dark" to="/customer/part-requests">Request parts</Link>
          </>
        )}
        meta={(
          <>
            <span>Vehicle-linked service records</span>
            <span>Status tracking across requests</span>
            <span>Customer feedback history</span>
          </>
        )}
      />

      <section className="customer-metric-grid" aria-label="Account overview">
        <Link className="customer-metric-card" to="/customer/vehicles">
          <span className="metric-label">Registered vehicles</span>
          <strong className="metric-value">{vehicles.length}</strong>
          <span className="metric-trend">Ready for service booking</span>
        </Link>
        <Link className="customer-metric-card" to="/customer/appointments">
          <span className="metric-label">Open appointments</span>
          <strong className="metric-value">{openAppointments.length}</strong>
          <span className="metric-trend">{completedAppointments.length} completed in history</span>
        </Link>
        <Link className="customer-metric-card" to="/customer/part-requests">
          <span className="metric-label">Pending part requests</span>
          <strong className="metric-value">{pendingRequests.length}</strong>
          <span className="metric-trend">Awaiting staff review</span>
        </Link>
        <Link className="customer-metric-card" to="/customer/reviews">
          <span className="metric-label">Reviews shared</span>
          <strong className="metric-value">{reviews.length}</strong>
          <span className="metric-trend">Feedback linked to your account</span>
        </Link>
      </section>

      <div className="dashboard-main-grid dashboard-activity-row">
        <section className="customer-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Next service movement</span>
              <h2>{nextAppointment ? 'Upcoming appointment' : 'Start with a service booking'}</h2>
              <p>Keep the next visit visible so planning does not get buried in history.</p>
            </div>
            <Link to="/customer/appointments" className="btn-outline">View all</Link>
          </div>

          {nextAppointment ? (
            <article className="dashboard-record-card">
              <div className="portal-list-title-row">
                <h3>{nextAppointment.serviceType}</h3>
                <StatusBadge status={nextAppointment.status} />
              </div>
              <p>{nextAppointment.vehicleName} - {nextAppointment.vehicleNumber}</p>
              <div className="portal-meta-grid">
                <span>{formatDate(nextAppointment.preferredDate)}</span>
                <span>{formatTime(nextAppointment.preferredTime)}</span>
              </div>
              {nextAppointment.notes && <p className="record-note">{nextAppointment.notes}</p>}
            </article>
          ) : (
            <PortalEmptyState
              imageSrc={customerPortalImages.appointment}
              imageAlt="Service advisor planning a vehicle appointment"
              title="No scheduled visits yet"
              message="Book a regular inspection or a specific repair request and it will appear here as the next item to track."
              action={<Link className="btn-primary" to="/customer/appointments">Schedule service</Link>}
            />
          )}
        </section>

        <aside className="customer-side-panel">
          <img src={customerPortalImages.support} alt="Technician preparing a vehicle service bay" />
          <div>
            <span className="customer-eyebrow">Service reassurance</span>
            <h2>Every request stays connected to the right vehicle and account.</h2>
            <p>Appointments, part inquiries, and reviews remain easy to trace whenever you need to plan your next visit.</p>
          </div>
        </aside>
      </div>

      <div className="dashboard-main-grid dashboard-activity-row">
        <section className="customer-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Recent parts activity</span>
              <h2>Part inquiry queue</h2>
              <p>See your latest part requests and their current review status.</p>
            </div>
            <Link to="/customer/part-requests" className="btn-outline">Open parts</Link>
          </div>

          {recentPartRequests.length === 0 ? (
            <PortalEmptyState
              compact
              imageSrc={customerPortalImages.parts}
              imageAlt="Organized vehicle parts and tools"
              title="No part inquiries yet"
              message="Submit an inquiry when you need a spare part checked for availability or fitment."
            />
          ) : (
            <div className="portal-item-list">
              {recentPartRequests.map((request) => (
                <article key={request.id} className="portal-list-item">
                  <div className="portal-list-main">
                    <div className="portal-list-title-row">
                      <h3>{request.partName}</h3>
                      <StatusBadge status={request.status} />
                    </div>
                    <p>{request.vehicleName ? `${request.vehicleName} - ${request.vehicleNumber}` : 'General inquiry'}</p>
                    <div className="portal-meta-grid">
                      <span>Qty {request.quantity}</span>
                      <span>{formatDateTime(request.createdAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="customer-card dashboard-support-card">
          <img src={customerPortalImages.partsDetail} alt="Vehicle parts ready for inspection" />
          <div>
            <span className="customer-eyebrow">Parts confidence</span>
            <h2>Fitment details make requests easier to review.</h2>
            <p>Adding vehicle context and notes gives the service team the information they need before they respond.</p>
          </div>
        </aside>
      </div>

      <section className="customer-trust-strip" aria-label="Portal assurances">
        <div>
          <strong>Account-linked</strong>
          <span>Your vehicles, appointments, part inquiries, and reviews stay tied to your customer account.</span>
        </div>
        <div>
          <strong>Vehicle-aware</strong>
          <span>Bookings and part requests can stay connected to registered vehicles.</span>
        </div>
        <div>
          <strong>Status-led</strong>
          <span>Open, completed, cancelled, and reviewed records are easy to scan.</span>
        </div>
        <div>
          <strong>Mobile-ready</strong>
          <span>The portal keeps forms and history usable on smaller screens.</span>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
