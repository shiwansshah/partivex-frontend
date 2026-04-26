import Button from '../../components/ui/Button'
import Table from '../../components/common/Table'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
]

const rows = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@partivex.com', role: 'Staff' },
  { id: 2, name: 'Nisha Karki', email: 'nisha@partivex.com', role: 'Staff' },
  { id: 3, name: 'Raj Thapa', email: 'raj@partivex.com', role: 'Staff' },
]

function StaffManagement() {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <h2>Staff Management</h2>
          <p>Admin can manage staff accounts from this area.</p>
        </div>
        <Button>Add Staff</Button>
      </div>

      <Table columns={columns} rows={rows} />
    </section>
  )
}

export default StaffManagement
