import Button from '../../components/ui/Button'
import Table from '../../components/common/Table'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
]

const rows = [
  { id: 1, name: 'Suman Rai', email: 'suman@example.com', phone: '+977 9800000001' },
  { id: 2, name: 'Maya Gurung', email: 'maya@example.com', phone: '+977 9800000002' },
  { id: 3, name: 'Bikash Shrestha', email: 'bikash@example.com', phone: '+977 9800000003' },
]

function CustomerManagement() {
  return (
    <div className="stack">
      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Customer Management</h2>
            <p>Staff can create and manage customer records from this area.</p>
          </div>
          <Button>Add Customer</Button>
        </div>

        <Table columns={columns} rows={rows} />
      </section>

      <section className="card">
        <div className="page-header">
          <h2>Customer Details</h2>
          <p>Static customer and vehicle information preview.</p>
        </div>

        <div className="details-grid">
          <div>
            <span>Name</span>
            <strong>Suman Rai</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>suman@example.com</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>+977 9800000001</strong>
          </div>
          <div>
            <span>Vehicle Info</span>
            <strong>Honda City, 2021, Bagmati Province 01-025</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CustomerManagement
