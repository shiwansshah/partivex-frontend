import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Table from '../../components/common/Table'

const columns = [
  { key: 'name', label: 'Vendor Name' },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const rows = [
  {
    id: 1,
    name: 'Himal Auto Parts',
    contactPerson: 'Ramesh Karki',
    email: 'ramesh@himalparts.com',
    phone: '+977 9800000101',
    status: 'Active',
    actions: (
      <div className="table-actions">
        <Button>Edit</Button>
        <Button>Delete</Button>
      </div>
    ),
  },
  {
    id: 2,
    name: 'Bagmati Spares',
    contactPerson: 'Sita Shrestha',
    email: 'sita@bagmatispares.com',
    phone: '+977 9800000102',
    status: 'Active',
    actions: (
      <div className="table-actions">
        <Button>Edit</Button>
        <Button>Delete</Button>
      </div>
    ),
  },
]

function VendorManagement() {
  return (
    <div className="stack">
      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Vendor Management</h2>
            <p>Admin can manage supplier details from this area.</p>
          </div>
          <Button>Add Vendor</Button>
        </div>

        <Table columns={columns} rows={rows} />
      </section>

      <section className="card">
        <div className="page-header">
          <h2>Add Vendor</h2>
          <p>Basic vendor entry form structure.</p>
        </div>

        <form className="auth-form">
          <Input id="vendor-name" label="Vendor Name" name="name" />
          <Input id="vendor-contact-person" label="Contact Person" name="contactPerson" />
          <Input id="vendor-email" label="Email" name="email" type="email" />
          <Input id="vendor-phone" label="Phone" name="phone" />
          <Input id="vendor-address" label="Address" name="address" />
          <Button type="button">Save Vendor</Button>
        </form>
      </section>

      <section className="card">
        <div className="page-header">
          <h2>Edit Vendor</h2>
          <p>Vendor update form structure for the next implementation step.</p>
        </div>

        <form className="auth-form">
          <Input id="edit-vendor-name" label="Vendor Name" name="editName" />
          <Input
            id="edit-vendor-contact-person"
            label="Contact Person"
            name="editContactPerson"
          />
          <Input id="edit-vendor-email" label="Email" name="editEmail" type="email" />
          <Input id="edit-vendor-phone" label="Phone" name="editPhone" />
          <Input id="edit-vendor-address" label="Address" name="editAddress" />
          <Button type="button">Update Vendor</Button>
        </form>
      </section>
    </div>
  )
}

export default VendorManagement
