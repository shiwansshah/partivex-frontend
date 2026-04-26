function Input({ id, label, error, className = '', ...props }) {
  return (
    <div className={`form-group ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      <input id={id} className={`form-control ${error ? 'is-invalid' : ''}`} {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default Input
