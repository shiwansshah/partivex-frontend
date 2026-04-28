import Button from '../ui/Button'
import Input from '../ui/Input'

const stockChangeOptions = [
  { value: '', label: 'Auto-detect from stock change' },
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Sale', label: 'Sale' },
  { value: 'Adjustment In', label: 'Adjustment In' },
  { value: 'Adjustment Out', label: 'Adjustment Out' },
]

function InventoryItemForm({
  values,
  errors,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
  isEditing,
}) {
  return (
    <section className="card inventory-form-card">
      <div className="section-heading">
        <div>
          <h2>{isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
          <p>
            Maintain part details, stock position, and update metadata from the same
            administration flow.
          </p>
        </div>
      </div>

      <form className="inventory-form" onSubmit={onSubmit} noValidate>
        <div className="inventory-form-grid">
          <Input
            id="partNumber"
            label="Part Number"
            name="partNumber"
            value={values.partNumber}
            onChange={onChange}
            error={errors.partNumber}
          />
          <Input
            id="name"
            label="Part Name"
            name="name"
            value={values.name}
            onChange={onChange}
            error={errors.name}
          />
          <Input
            id="category"
            label="Category"
            name="category"
            value={values.category}
            onChange={onChange}
            error={errors.category}
          />
          <Input
            id="vendorName"
            label="Vendor Name"
            name="vendorName"
            value={values.vendorName}
            onChange={onChange}
            error={errors.vendorName}
          />
          <Input
            id="storageLocation"
            label="Storage Location"
            name="storageLocation"
            value={values.storageLocation}
            onChange={onChange}
            error={errors.storageLocation}
          />
          <Input
            id="changedBy"
            label="Handled By"
            name="changedBy"
            value={values.changedBy}
            onChange={onChange}
            error={errors.changedBy}
          />
          <Input
            id="quantityInStock"
            label="Quantity In Stock"
            name="quantityInStock"
            type="number"
            min="0"
            value={values.quantityInStock}
            onChange={onChange}
            error={errors.quantityInStock}
          />
          <Input
            id="reorderLevel"
            label="Reorder Level"
            name="reorderLevel"
            type="number"
            min="0"
            value={values.reorderLevel}
            onChange={onChange}
            error={errors.reorderLevel}
          />
          <Input
            id="unitCost"
            label="Unit Cost"
            name="unitCost"
            type="number"
            min="0"
            step="0.01"
            value={values.unitCost}
            onChange={onChange}
            error={errors.unitCost}
          />
          <div className="form-group">
            <label htmlFor="stockChangeType">Stock Change Type</label>
            <select
              id="stockChangeType"
              name="stockChangeType"
              className={`form-control ${errors.stockChangeType ? 'is-invalid' : ''}`}
              value={values.stockChangeType}
              onChange={onChange}
            >
              {stockChangeOptions.map((option) => (
                <option key={option.value || 'auto'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.stockChangeType && <span className="field-error">{errors.stockChangeType}</span>}
          </div>
          <Input
            id="referenceCode"
            label="Reference Code"
            name="referenceCode"
            value={values.referenceCode}
            onChange={onChange}
            error={errors.referenceCode}
          />
          <div className="form-group inventory-form-span-2">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              className={`form-control inventory-textarea ${errors.notes ? 'is-invalid' : ''}`}
              value={values.notes}
              onChange={onChange}
              rows="4"
            />
            {errors.notes && <span className="field-error">{errors.notes}</span>}
          </div>
        </div>

        <div className="inventory-form-actions">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
          </Button>
          {isEditing && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
              Cancel Edit
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}

export default InventoryItemForm
