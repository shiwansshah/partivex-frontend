import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import CustomerForm from '../../components/customers/CustomerForm'
import { createCustomer } from '../../api/customerApi'
import { getRequestErrorMessage } from '../../api/axiosClient'

function AddCustomer() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleCreateCustomer(customerData) {
    try {
      setIsSubmitting(true)
      setError('')

      await createCustomer(customerData)
      navigate('/admin/customers')
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to create customer.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card">
      <div className="page-header with-actions">
        <div>
          <h2>Add Customer</h2>
          <p>Register a customer record for vehicle and service tracking.</p>
        </div>

        <Link className="button button-secondary" to="/admin/customers">
          Back to Customers
        </Link>
      </div>

      <CustomerForm
        onSubmit={handleCreateCustomer}
        submitLabel="Create Customer"
        isSubmitting={isSubmitting}
        serverError={error}
      />
    </section>
  )
}

export default AddCustomer
