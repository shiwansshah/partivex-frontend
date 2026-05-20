import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import CustomerForm from '../../components/customers/CustomerForm'
import StatusMessage from '../../components/ui/StatusMessage'
import { getCustomerById, updateCustomer } from '../../services/customerService'
import { buildPanelPath } from '../../utils/panelRoutes'

function EditCustomer() {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const customersPath = buildPanelPath(location.pathname, '/customers')
  const [customer, setCustomer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadCustomer() {
      try {
        const customerData = await getCustomerById(id)
        if (isCurrent) setCustomer(customerData)
      } catch (error) {
        if (isCurrent) setStatus(getApiErrorMessage(error, 'Unable to load customer for editing.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadCustomer()

    return () => {
      isCurrent = false
    }
  }, [id])

  async function handleSubmit(values) {
    try {
      setIsSaving(true)
      setStatus('')
      await updateCustomer(id, {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        phone: values.phone,
        email: values.email,
        address: values.address,
        profileImage: values.profileImage,
      })
      navigate(`${customersPath}/${id}`)
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to update customer.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <StatusMessage message="Loading customer details..." />
  }

  if (status && !customer) {
    return <StatusMessage type="error" message={status} />
  }

  if (!customer) {
    return <StatusMessage type="empty" message="Customer was not found." />
  }

  return (
    <section className="page-stack narrow-page">
      <div className="surface-panel">
        <div className="section-heading">
          <PageHeader title="Edit Customer" subtitle="Update customer profile details." />
          <Link className="button button-outline" to={`${customersPath}/${id}`}>
            Cancel
          </Link>
        </div>

        <CustomerForm
          initialValues={customer}
          onSubmit={handleSubmit}
          submitLabel="Update Customer"
          isSubmitting={isSaving}
          serverError={status}
        />
      </div>
    </section>
  )
}

export default EditCustomer
