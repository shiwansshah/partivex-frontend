import { useEffect, useState } from 'react'
import {
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
} from '../../api/permissionApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/ui/Button'
import StatusMessage from '../../components/ui/StatusMessage'

const roles = ['Admin', 'Staff']

function Permissions() {
  const [permissions, setPermissions] = useState([])
  const [roleName, setRoleName] = useState('Admin')
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([])
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isCurrent = true

    async function loadInitialData() {
      try {
        const [permissionsResponse, rolePermissionsResponse] = await Promise.all([
          getPermissions(),
          getRolePermissions(roleName),
        ])

        if (isCurrent) {
          setPermissions(permissionsResponse.data)
          setSelectedPermissionIds(getAssignedPermissionIds(rolePermissionsResponse.data.permissions))
        }
      } catch (error) {
        if (isCurrent) {
          setStatus({
            type: 'error',
            message: getRequestErrorMessage(error, 'Unable to load permissions.'),
          })
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadInitialData()

    return () => {
      isCurrent = false
    }
  }, [])

  async function handleRoleChange(event) {
    const nextRoleName = event.target.value
    setRoleName(nextRoleName)
    setStatus({ type: '', message: '' })

    try {
      setIsLoading(true)
      const response = await getRolePermissions(nextRoleName)
      setSelectedPermissionIds(getAssignedPermissionIds(response.data.permissions))
    } catch (error) {
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(error, 'Unable to load role permissions.'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handlePermissionToggle(permissionId) {
    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId],
    )
  }

  async function handleSave() {
    try {
      setIsSaving(true)
      setStatus({ type: '', message: '' })

      const response = await updateRolePermissions(roleName, selectedPermissionIds)
      setSelectedPermissionIds(getAssignedPermissionIds(response.data.permissions))
      setStatus({
        type: 'success',
        message: `${roleName} permissions updated successfully.`,
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: getRequestErrorMessage(error, 'Unable to update permissions.'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="page-stack">
      <div className="surface-panel">
        <PageHeader
          title="Permissions"
          subtitle="Coursework permission assignments. Identity roles still control real access."
        />

        <div className="managed-form">
          <div className="form-group">
            <label htmlFor="roleName">Role</label>
            <select
              id="roleName"
              className="form-control"
              value={roleName}
              onChange={handleRoleChange}
              disabled={isSaving}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="surface-panel">
        {status.message && <StatusMessage type={status.type} message={status.message} />}
        {isLoading && <StatusMessage message="Loading permissions..." />}
        {!isLoading && permissions.length === 0 && (
          <StatusMessage type="empty" message="No permissions found." />
        )}

        {!isLoading && permissions.length > 0 && (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Assigned</th>
                    <th>Permission</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedPermissionIds.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          disabled={isSaving}
                          aria-label={`Assign ${permission.name}`}
                        />
                      </td>
                      <td>
                        <strong>{permission.name}</strong>
                      </td>
                      <td>{permission.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="form-actions">
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Permissions'}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function getAssignedPermissionIds(rolePermissions) {
  return rolePermissions
    .filter((permission) => permission.assigned)
    .map((permission) => permission.id)
}

export default Permissions
