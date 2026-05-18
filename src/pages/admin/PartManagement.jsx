import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Table from '../../components/common/Table'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { createPart, deletePart, getParts, updatePart } from '../../api/partApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import { required } from '../../utils/validator'

const columns = [
  { key: 'image', label: 'Image' },
  { key: 'name', label: 'Part Name' },
  { key: 'partCode', label: 'SKU' },
  { key: 'category', label: 'Category' },
  { key: 'unitPrice', label: 'Unit Price' },
  { key: 'currentStock', label: 'Stock' },
  { key: 'stockStatus', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const initialValues = {
  name: '',
  partCode: '',
  category: '',
  compatibleVehicle: '',
  unitPrice: '',
  minimumStockLevel: '',
  currentStock: '',
  isActive: true,
}

function PartManagement() {
  const [parts, setParts] = useState([])
  const [values, setValues] = useState(initialValues)
  const [image, setImage] = useState(null)
  const [editingPartId, setEditingPartId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingPart, setDeletingPart] = useState(null)

  const isEditing = editingPartId !== null
  const filteredParts = parts.filter((part) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return [part.name, part.partCode, part.category, part.compatibleVehicle, part.stockStatus]
      .some((value) => String(value || '').toLowerCase().includes(query))
  })

  const rows = filteredParts.map((part) => ({
    ...part,
    image: part.imageUrl ? <img className="part-thumb" src={part.imageUrl} alt={part.name} /> : 'No image',
    unitPrice: formatCurrency(part.unitPrice),
    currentStock: part.currentStock,
    stockStatus: <span className={`status-pill ${part.stockStatus === 'In Stock' ? 'is-good' : 'is-alert'}`}>{part.stockStatus}</span>,
    actions: (
      <div className="table-actions">
        <Button type="button" variant="secondary" onClick={() => startEdit(part)}>Edit</Button>
        <Button type="button" variant="danger" onClick={() => setDeletingPart(part)}>Delete</Button>
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
      setParts(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      setParts([])
      setErrorMessage(getRequestErrorMessage(error, 'Unable to load parts.'))
    } finally {
      setIsLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value, type, checked, files } = event.target
    if (type === 'file') {
      setImage(files?.[0] ?? null)
      return
    }

    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function validate() {
    const nextErrors = {}
    if (!required(values.name)) nextErrors.name = 'Part name is required.'
    if (!required(values.partCode)) nextErrors.partCode = 'Part code is required.'
    if (!required(values.category)) nextErrors.category = 'Category is required.'
    if (!isNonNegativeDecimal(values.unitPrice)) nextErrors.unitPrice = 'Enter a valid unit price.'
    if (!isWholeNumber(values.minimumStockLevel)) nextErrors.minimumStockLevel = 'Enter a valid minimum stock level.'
    if (!isWholeNumber(values.currentStock)) nextErrors.currentStock = 'Enter a valid current stock.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function mapPayload() {
    const formData = new FormData()
    Object.entries({
      name: values.name.trim(),
      partCode: values.partCode.trim(),
      category: values.category.trim(),
      compatibleVehicle: values.compatibleVehicle.trim(),
      unitPrice: Number(values.unitPrice),
      minimumStockLevel: Number(values.minimumStockLevel),
      currentStock: Number(values.currentStock),
      isActive: values.isActive,
    }).forEach(([key, value]) => formData.append(key, value))
    if (image) formData.append('image', image)
    return formData
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    if (!validate()) return

    try {
      setIsSubmitting(true)
      if (isEditing) {
        await updatePart(editingPartId, mapPayload())
        setSuccessMessage('Part updated successfully.')
      } else {
        await createPart(mapPayload())
        setSuccessMessage('Part added successfully.')
      }
      await loadParts()
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
      category: part.category,
      compatibleVehicle: part.compatibleVehicle || '',
      unitPrice: String(part.unitPrice),
      minimumStockLevel: String(part.minimumStockLevel),
      currentStock: String(part.currentStock),
      isActive: part.isActive,
    })
    setImage(null)
    setErrors({})
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function confirmDeletePart() {
    if (!deletingPart) return
    try {
      setErrorMessage('')
      setSuccessMessage('')
      await deletePart(deletingPart.id)
      if (editingPartId === deletingPart.id) resetForm()
      await loadParts()
      setSuccessMessage('Part removed successfully.')
      setDeletingPart(null)
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error, 'Unable to delete part.'))
    }
  }

  function resetForm() {
    setEditingPartId(null)
    setValues(initialValues)
    setImage(null)
    setErrors({})
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Parts Management</h2>
            <p>Admin-managed vehicle parts, pricing, stock thresholds, and images.</p>
          </div>
        </div>

        <Input id="part-search" label="Search Parts" name="partSearch" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name, SKU, category, vehicle, or status" />
        {isLoading ? <p>Loading parts...</p> : rows.length > 0 ? <Table columns={columns} rows={rows} /> : <p>No parts found.</p>}
      </section>

      <section className="card">
        <div className="page-header">
          <h2>{isEditing ? 'Edit Part' : 'Add Part'}</h2>
          <p>{isEditing ? 'Update part details.' : 'Create a part record before stock is purchased.'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input id="part-name" label="Part Name" name="name" value={values.name} onChange={handleChange} error={errors.name} />
          <Input id="part-code" label="Part Code / SKU" name="partCode" value={values.partCode} onChange={handleChange} error={errors.partCode} />
          <Input id="part-category" label="Category" name="category" value={values.category} onChange={handleChange} error={errors.category} placeholder="Engine, brake, electrical..." />
          <Input id="part-compatible-vehicle" label="Compatible Vehicle" name="compatibleVehicle" value={values.compatibleVehicle} onChange={handleChange} />
          <Input id="part-unit-price" label="Unit Price" name="unitPrice" type="number" min="0" step="0.01" value={values.unitPrice} onChange={handleChange} error={errors.unitPrice} />
          <Input id="part-minimum-stock" label="Minimum Stock Level" name="minimumStockLevel" type="number" min="0" step="1" value={values.minimumStockLevel} onChange={handleChange} error={errors.minimumStockLevel} />
          <Input id="part-current-stock" label="Current Stock" name="currentStock" type="number" min="0" step="1" value={values.currentStock} onChange={handleChange} error={errors.currentStock} />
          <label className="form-group">
            <span>Part Image</span>
            <input className="form-control" name="image" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleChange} />
          </label>
          <label className="form-group">
            <span>Active</span>
            <input name="isActive" type="checkbox" checked={values.isActive} onChange={handleChange} />
          </label>
          {errorMessage && <div className="form-alert">{errorMessage}</div>}
          {successMessage && <div className="form-alert form-success">{successMessage}</div>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : isEditing ? 'Update Part' : 'Save Part'}</Button>
          {isEditing && <Button type="button" variant="secondary" onClick={resetForm}>Cancel Edit</Button>}
        </form>
      </section>

      <ConfirmDialog
        isOpen={Boolean(deletingPart)}
        title="Delete Part"
        message={`Are you sure you want to delete ${deletingPart?.name || 'this part'}? Parts with stock cannot be deleted.`}
        confirmLabel="Delete Part"
        onConfirm={confirmDeletePart}
        onCancel={() => setDeletingPart(null)}
      />
    </div>
  )
}

function isWholeNumber(value) {
  return /^\d+$/.test(String(value).trim())
}

function isNonNegativeDecimal(value) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(value ?? 0)
}

export default PartManagement
