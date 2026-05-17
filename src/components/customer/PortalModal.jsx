import { useEffect } from 'react'

function PortalModal({ title, children, footer, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="portal-modal-backdrop" onMouseDown={handleBackdropClick}>
      <section className="portal-modal" role="dialog" aria-modal="true" aria-labelledby="portal-modal-title">
        <div className="portal-modal-header">
          <h3 id="portal-modal-title">{title}</h3>
          <button className="btn-outline portal-modal-close" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="portal-modal-body">{children}</div>
        {footer && <div className="portal-modal-footer">{footer}</div>}
      </section>
    </div>
  )
}

export default PortalModal
