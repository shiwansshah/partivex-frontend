import { useEffect, useRef } from 'react'

function PortalModal({ title, children, footer, onClose, className = '' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusableElements = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) return

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    const previouslyFocused = document.activeElement
    window.setTimeout(() => {
      dialogRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus()
    }, 0)

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="portal-modal-backdrop" onMouseDown={handleBackdropClick}>
      <section ref={dialogRef} className={`portal-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby="portal-modal-title">
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
