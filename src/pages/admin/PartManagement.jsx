import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Table from '../../components/common/Table'
import { createPart, deletePart, getParts, updatePart } from '../../api/partApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import { required } from '../../utils/validator'

const columns = [
  { key: 'name', label: 'Part Name' },
  { key: 'partCode', label: 'Part Code' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const initialValues = {
  name: '',
  partCode: '',
  price: '',
  stock: '',
  isActive: true,
}

function PartManagement() {
  const [parts, setParts] = useState([])
  const [values, setValues] = useState(initialValues)
  const [editingPartId, setEditingPartId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = editingPartId !== null

  const filteredParts = parts.filter((part) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true

    return [part.name, part.partCode, part.price, part.stock]
      .some((value) => String(value || '').toLowerCase().includes(query))
  })

  const rows = filteredParts.map((part) => ({
    ...part,
    price: Number(part.price).toFixed(2),
    status: <span className="status-pill status-active">Active</span>,
    actions: (
      <div className="table-actions">
        <Button type="button" variant="secondary" onClick={() => startEdit(part)}>
          Edit
        </Button>
        <Button type="button" variant="danger" onClick={() => handleDelete(part.id)}>
          Delete
        </Button>
      </div>
    ),
  }))

  useEffect(() => {
    loadParts()
  }, [])

  async function loadParts() {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const response = await getParts()
      if (Array.isArray(response.data)) {
        setParts(response.data)
      } else {
        setParts([])
        setErrorMessage('Parts API is reachable, but list data is not available yet.')
      }
    } catch (error) {
      setParts([])
      setErrorMessage(getRequestErrorMessage(error, 'Unable to load parts.'))
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

    if (!required(values.name)) nextErrors.name = 'Part name is required.'
    if (!required(values.partCode)) nextErrors.partCode = 'Part code is required.'

    if (!required(values.price)) {
      nextErrors.price = 'Price is required.'
    } else {
      const parsedPrice = Number(values.price)
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        nextErrors.price = 'Enter a valid non-negative price.'
      }
    }

    if (!required(values.stock)) {
      nextErrors.stock = 'Stock is required.'
    } else {
      const parsedStock = Number(values.stock)
      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        nextErrors.stock = 'Enter a valid non-negative whole number.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function mapPayload() {
    return {
      name: values.name.trim(),
      partCode: values.partCode.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
      isActive: values.isActive,
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!validate()) return

    try {
      setIsSubmitting(true)
      const payload = mapPayload()

      if (isEditing) {
        await updatePart(editingPartId, payload)
        await loadParts()
        setSuccessMessage('Part updated successfully.')
      } else {
        await createPart(payload)
        await loadParts()
        setSuccessMessage('Part added successfully.')
      }

      resetForm()
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error, 'Unable to save part.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEdit(part) {
    setEditingPartId(part.id)
    setValues({
      name: part.name,
      partCode: part.partCode,
      price: String(part.price),
      stock: String(part.stock),
      isActive: part.isActive,
    })
    setErrors({})
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this part?')
    if (!confirmed) return

    try {
      setErrorMessage('')
      setSuccessMessage('')
      await deletePart(id)
      if (editingPartId === id) {
        resetForm()
      }
      await loadParts()
      setSuccessMessage('Part removed successfully.')
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error, 'Unable to delete part.'))
    }
  }

  function resetForm() {
    setEditingPartId(null)
    setValues(initialValues)
    setErrors({})
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Parts Management</h2>
            <p>Admin can manage part details and availability from this area.</p>
          </div>
        </div>

        <Input
          id="part-search"
          label="Search Parts"
          name="partSearch"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name, code, price, or stock"
        />

        {isLoading ? (
          <p>Loading parts...</p>
        ) : rows.length > 0 ? (
          <Table columns={columns} rows={rows} />
        ) : searchTerm ? (
          <p>No parts match your search.</p>
        ) : (
          <p>No parts have been added yet.</p>
        )}
      </section>

      <section className="card">
        <div className="page-header">
          <h2>{isEditing ? 'Edit Part' : 'Add Part'}</h2>
          <p>{isEditing ? 'Update part details.' : 'Create a part record for inventory tracking.'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="part-name"
            label="Part Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Input
            id="part-code"
            label="Part Code"
            name="partCode"
            value={values.partCode}
            onChange={handleChange}
            error={errors.partCode}
          />
          <Input
            id="part-price"
            label="Price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={handleChange}
            error={errors.price}
          />
          <Input
            id="part-stock"
            label="Stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={handleChange}
            error={errors.stock}
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Part' : 'Save Part'}
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

export default PartManagement
