import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import StatusMessage from '../../components/ui/StatusMessage'
import { addCustomerHistory } from '../../services/customerService'
import { buildPanelPath } from '../../utils/panelRoutes'
import { required } from '../../utils/validator'

function getTodayValue() {
  return new Date().toISOString().slice(0, 10)
}

function AddCustomerHistory() {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const customersPath = buildPanelPath(location.pathname, '/customers')
  const detailsPath = `${customersPath}/${id}`
  const [values, setValues] = useState(() => ({
    historyType: 'Service',
    vehicle: '',
    description: '',
    amount: '',
    paymentStatus: 'Paid',
    date: getTodayValue(),
  }))
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function validate() {
    const nextErrors = {}

    if (!required(values.historyType)) nextErrors.historyType = 'History type is required.'
    if (!required(values.description)) nextErrors.description = 'Description is required.'
    if (!required(values.date)) nextErrors.date = 'Date is required.'
    if (values.amount && Number.isNaN(Number(values.amount))) nextErrors.amount = 'Enter a valid amount.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('')

    if (!validate()) return

    try {
      setIsSubmitting(true)
      await addCustomerHistory(id, {
        historyType: values.historyType.trim(),
        vehicle: values.vehicle.trim() || null,
        description: values.description.trim(),
        amount: values.amount ? Number(values.amount) : null,
        paymentStatus: values.paymentStatus.trim(),
        date: values.date,
      })
      navigate(detailsPath)
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to add customer history.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-stack narrow-page">
      <div className="surface-panel">
        <div className="section-heading">
          <PageHeader title="Add Customer History" subtitle="Record a service, purchase, or credit snapshot for this customer." />
          <Link className="button button-outline" to={detailsPath}>
            Cancel
          </Link>
        </div>

        <form className="managed-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="historyType">History type</label>
            <select
              id="historyType"
              name="historyType"
              className={`form-control ${errors.historyType ? 'is-invalid' : ''}`}
              value={values.historyType}
              onChange={handleChange}
            >
              <option value="Service">Service</option>
              <option value="Purchase">Purchase</option>
              <option value="Credit">Credit</option>
              <option value="Payment">Payment</option>
            </select>
            {errors.historyType && <span className="field-error">{errors.historyType}</span>}
          </div>

          <Input
            id="vehicle"
            label="Vehicle / Number"
            name="vehicle"
            value={values.vehicle}
            onChange={handleChange}
          />

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows="4"
              value={values.description}
              onChange={handleChange}
              placeholder="Add a short note about the purchase, service, or credit entry"
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <Input
            id="amount"
            label="Amount"
            name="amount"
            inputMode="decimal"
            value={values.amount}
            onChange={handleChange}
            error={errors.amount}
          />

          <div className="form-group">
            <label htmlFor="paymentStatus">Payment status</label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              className="form-control"
              value={values.paymentStatus}
              onChange={handleChange}
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <Input
            id="date"
            label="Date"
            name="date"
            type="date"
            value={values.date}
            onChange={handleChange}
            error={errors.date}
          />

          {status && <StatusMessage type="error" message={status} />}

          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save History'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default AddCustomerHistory