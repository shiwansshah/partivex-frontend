import Button from '../ui/Button'
import Input from '../ui/Input'

function CustomerSearchBar({ value, onChange, onSearch, onClear, isSearching = false }) {
  function handleSubmit(event) {
    event.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form className="toolbar customer-search-bar" onSubmit={handleSubmit}>
      <Input
        id="customer-search"
        label="Search customers"
        className="search-input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name, phone, customer ID, or vehicle number"
      />

      <div className="table-actions">
        <Button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
        <Button type="button" variant="outline" onClick={onClear} disabled={!value.trim() && !isSearching}>
          Clear
        </Button>
      </div>
    </form>
  )
}

export default CustomerSearchBar
