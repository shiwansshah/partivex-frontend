import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { getProfile } from '../../api/authApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import { getAppointments, getPartRequests, getReviews } from '../../api/customerPortalApi'
import { getMyVehicles } from '../../api/vehicleApi'
import StatusBadge from '../../components/customer/StatusBadge'
import StatusMessage from '../../components/ui/StatusMessage'
import { formatDate, formatTime } from '../../utils/customerPortalFormatters'
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
  const completedAppointments = appointments.filter((appointment) => appointment.status === 'Completed')

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

  return (
    <div className="customer-page customer-dashboard-page">
      <section className="customer-dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="customer-eyebrow">Welcome back</span>
          <h1>{profile?.fullName ? `${profile.fullName}'s service hub` : 'Your service hub'}</h1>
          <p>Track vehicles, book service visits, request parts, and keep your experience history organized.</p>
          <div className="dashboard-hero-actions">
            <Link className="btn-primary" to="/customer/appointments">Book service</Link>
            <Link className="btn-outline btn-outline-on-dark" to="/customer/part-requests">Request a part</Link>
          </div>
        </div>
        <img src={customerPortalImages.dashboardHero} alt="Mechanic servicing a vehicle in a professional garage" />
      </section>

      <section className="customer-metric-grid" aria-label="Portal summary">
        <Link className="customer-metric-card" to="/customer/vehicles">
          <span>Registered vehicles</span>
          <strong>{vehicles.length}</strong>
          <small>Manage vehicle records and photos</small>
        </Link>
        <Link className="customer-metric-card" to="/customer/appointments">
          <span>Appointments</span>
          <strong>{appointments.length}</strong>
          <small>{completedAppointments.length} completed services</small>
        </Link>
        <Link className="customer-metric-card" to="/customer/part-requests">
          <span>Pending parts</span>
          <strong>{pendingRequests.length}</strong>
          <small>Requests awaiting review</small>
        </Link>
        <Link className="customer-metric-card" to="/customer/reviews">
          <span>Reviews</span>
          <strong>{reviews.length}</strong>
          <small>Feedback shared with the team</small>
        </Link>
      </section>

      <div className="dashboard-main-grid">
        <section className="customer-card dashboard-focus-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Next step</span>
              <h2>{nextAppointment ? 'Upcoming appointment' : 'Plan your next service'}</h2>
              <p>{nextAppointment ? 'Your next visit is ready to review.' : 'Choose a registered vehicle and preferred time when you are ready.'}</p>
            </div>
          </div>

          {nextAppointment ? (
            <article className="dashboard-appointment-card">
              <div>
                <h3>{nextAppointment.serviceType}</h3>
                <p>{nextAppointment.vehicleName} - {nextAppointment.vehicleNumber}</p>
              </div>
              <StatusBadge status={nextAppointment.status} />
              <div className="portal-meta-grid">
                <span>{formatDate(nextAppointment.preferredDate)}</span>
                <span>{formatTime(nextAppointment.preferredTime)}</span>
              </div>
              <Link className="btn-outline" to="/customer/appointments">View appointments</Link>
            </article>
          ) : (
            <div className="customer-empty-panel">
              <img src={customerPortalImages.appointment} alt="Vehicle service appointment desk" />
              <div>
                <h3>No upcoming appointment</h3>
                <p>Book a service visit to keep your vehicle records and service updates in one place.</p>
                <Link className="btn-primary" to="/customer/appointments">Book appointment</Link>
              </div>
            </div>
          )}
        </section>

        <section className="customer-card dashboard-support-card">
          <img src={customerPortalImages.support} alt="Service support team discussing customer work" />
          <div>
            <span className="customer-eyebrow">Service promise</span>
            <h2>Clear status, fewer phone calls</h2>
            <p>Each request keeps its status visible, so you can see whether a visit is pending, confirmed, completed, or cancelled.</p>
          </div>
        </section>
      </div>

      <section className="customer-trust-strip" aria-label="What you can manage">
        <div>
          <strong>Vehicles</strong>
          <span>Keep model and plate details current.</span>
        </div>
        <div>
          <strong>Appointments</strong>
          <span>Book visits and cancel eligible bookings.</span>
        </div>
        <div>
          <strong>Parts</strong>
          <span>Request unavailable parts with specifications.</span>
        </div>
        <div>
          <strong>Reviews</strong>
          <span>Share feedback for completed or general service.</span>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
