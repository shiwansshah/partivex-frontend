import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Table from '../../components/common/Table'
import { createVendor, deleteVendor, getVendors, updateVendor } from '../../api/vendorApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import { isEmail, required } from '../../utils/validator'

const columns = [
  { key: 'name', label: 'Vendor Name' },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const initialValues = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  isActive: true,
}

function VendorManagement() {
  const [vendors, setVendors] = useState([])
  const [values, setValues] = useState(initialValues)
  const [editingVendorId, setEditingVendorId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = editingVendorId !== null

  const filteredVendors = vendors.filter((vendor) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true

    return [vendor.name, vendor.contactPerson, vendor.email, vendor.phone]
      .some((value) => String(value || '').toLowerCase().includes(query))
  })

  const rows = filteredVendors.map((vendor) => ({
    ...vendor,
    status: <span className="status-pill status-active">Active</span>,
    actions: (
      <div className="table-actions">
        <Button type="button" variant="secondary" onClick={() => startEdit(vendor)}>
          Edit
        </Button>
        <Button type="button" variant="danger" onClick={() => handleDelete(vendor.id)}>
          Delete
        </Button>
      </div>
    ),
  }))

  useEffect(() => {
    loadVendors()
  }, [])

  async function loadVendors() {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const response = await getVendors()
      if (Array.isArray(response.data)) {
        setVendors(response.data)
      } else {
        setVendors([])
        setErrorMessage('Vendor API is reachable, but list data is not available yet.')
      }
    } catch (error) {
      setVendors([])
      setErrorMessage(getRequestErrorMessage(error, 'Unable to load vendors.'))
    } finally {
      setIsLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function validate() {
    const nextErrors = {}

    if (!required(values.name)) nextErrors.name = 'Vendor name is required.'
    if (!required(values.contactPerson)) {
      nextErrors.contactPerson = 'Contact person is required.'
    }
    if (!required(values.email)) nextErrors.email = 'Email is required.'
    else if (!isEmail(values.email)) nextErrors.email = 'Enter a valid email.'
    if (!required(values.phone)) nextErrors.phone = 'Phone is required.'
    if (!required(values.address)) nextErrors.address = 'Address is required.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!validate()) return

    try {
      setIsSubmitting(true)
      if (isEditing) {
        await updateVendor(editingVendorId, values)
        await loadVendors()
        setSuccessMessage('Vendor updated successfully.')
      } else {
        await createVendor(values)
        await loadVendors()
        setSuccessMessage('Vendor added successfully.')
      }

      resetForm()
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error, 'Unable to save vendor.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEdit(vendor) {
    setEditingVendorId(vendor.id)
    setValues({
      name: vendor.name,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      isActive: vendor.isActive,
    })
    setErrors({})
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this vendor?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')
      await deleteVendor(id)
      if (editingVendorId === id) {
        resetForm()
      }
      await loadVendors()
      setSuccessMessage('Vendor removed successfully.')
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error, 'Unable to delete vendor.'))
    }
  }

  function resetForm() {
    setEditingVendorId(null)
    setValues(initialValues)
    setErrors({})
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Vendor Management</h2>
            <p>Admin can manage supplier details from this area.</p>
          </div>
        </div>

        <Input
          id="vendor-search"
          label="Search Vendors"
          name="vendorSearch"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name, contact, email, or phone"
        />

        {isLoading ? (
          <p>Loading vendors...</p>
        ) : rows.length > 0 ? (
          <Table columns={columns} rows={rows} />
        ) : searchTerm ? (
          <p>No vendors match your search.</p>
        ) : (
          <p>No vendors have been added yet.</p>
        )}
      </section>

      <section className="card">
        <div className="page-header">
          <h2>{isEditing ? 'Edit Vendor' : 'Add Vendor'}</h2>
          <p>{isEditing ? 'Update supplier contact details.' : 'Create a supplier record for parts purchasing.'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="vendor-name"
            label="Vendor Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Input
            id="vendor-contact-person"
            label="Contact Person"
            name="contactPerson"
            value={values.contactPerson}
            onChange={handleChange}
            error={errors.contactPerson}
          />
          <Input
            id="vendor-email"
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            id="vendor-phone"
            label="Phone"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <Input
            id="vendor-address"
            label="Address"
            name="address"
            value={values.address}
            onChange={handleChange}
            error={errors.address}
          />
          <label className="form-group">
            <span>Active</span>
            <input
              name="isActive"
              type="checkbox"
              checked={values.isActive}
              onChange={handleChange}
            />
          </label>
          {errorMessage && <div className="form-alert">{errorMessage}</div>}
          {successMessage && <div className="form-alert form-success">{successMessage}</div>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Vendor' : 'Save Vendor'}
          </Button>
          {isEditing && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </form>
      </section>
    </div>
  )
}

export default VendorManagement
