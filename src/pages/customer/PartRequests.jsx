import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { createPartRequest, getPartRequests } from '../../api/customerPortalApi'
import {
  checkoutCustomerParts,
  downloadMyCustomerPartInvoicePdf,
  getCustomerPartCatalog,
  getMyCustomerPartInvoices,
} from '../../api/customerPartPurchaseApi'
import { getRequestErrorMessage, apiBaseUrl } from '../../api/axiosClient'
import { getMyVehicles } from '../../api/vehicleApi'
import PortalHero from '../../components/customer/PortalHero'
import PortalModal from '../../components/customer/PortalModal'
import StatusMessage from '../../components/ui/StatusMessage'
import { customerPortalImages } from '../../utils/customerPortalImages'
import { formatDateTime } from '../../utils/customerPortalFormatters'
import { sweetAlert, sweetConfirm } from '../../utils/sweetAlert'

const loyaltyThreshold = 5000
const loyaltyRate = 0.05

function PartRequests() {
  const { setPartShopCart } = useOutletContext() || {}
  const [parts, setParts] = useState([])
  const [requests, setRequests] = useState([])
  const [invoices, setInvoices] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [requestsOpen, setRequestsOpen] = useState(false)
  const [invoicesOpen, setInvoicesOpen] = useState(false)
  const [requestPart, setRequestPart] = useState(null)
  const [requestValues, setRequestValues] = useState({ vehicleId: '', quantity: '1', notes: '' })
  const [isSaving, setIsSaving] = useState(false)
  const openCart = useCallback(() => setCartOpen(true), [])

  async function loadData() {
    const [partsResponse, requestsResponse, invoicesResponse, vehiclesResponse] = await Promise.all([
      getCustomerPartCatalog(),
      getPartRequests(),
      getMyCustomerPartInvoices(),
      getMyVehicles(),
    ])
    setParts(partsResponse.data || [])
    setRequests(requestsResponse.data || [])
    setInvoices(invoicesResponse.data || [])
    setVehicles(vehiclesResponse.data || [])
  }

  useEffect(() => {
    let isCurrent = true
    async function fetchData() {
      try {
        await loadData()
      } catch (err) {
        if (isCurrent) setError(getRequestErrorMessage(err, 'Failed to load parts catalog.'))
      } finally {
        if (isCurrent) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    if (!setPartShopCart) return
    setPartShopCart({ count: cart.length, onOpen: openCart })
  }, [cart.length, openCart, setPartShopCart])

  useEffect(() => {
    return () => {
      if (setPartShopCart) setPartShopCart({ count: 0, onOpen: null })
    }
  }, [setPartShopCart])

  const visibleParts = parts.filter((part) => {
    const query = searchTerm.trim().toLowerCase()
    const matchesSearch = !query || [part.name, part.partCode, part.category, part.compatibleVehicle]
      .join(' ')
      .toLowerCase()
      .includes(query)
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'available' && part.currentStock > 0) ||
      (stockFilter === 'unavailable' && part.currentStock <= 0)
    return matchesSearch && matchesStock
  })

  const totals = useMemo(() => {
    const subTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const discount = subTotal > loyaltyThreshold ? subTotal * loyaltyRate : 0
    return { subTotal, discount, total: subTotal - discount }
  }, [cart])

  function resolveImageUrl(url) {
    if (!url) return customerPortalImages.partsDetail
    if (url.startsWith('http')) return url
    return `${apiBaseUrl.replace('/api', '')}${url}`
  }

  function addToCart(part, quantity = 1) {
    setCart((current) => {
      const existing = current.find((item) => item.id === part.id)
      if (existing) {
        return current.map((item) =>
          item.id === part.id
            ? { ...item, quantity: Math.min(part.currentStock, item.quantity + quantity) }
            : item)
      }
      return [...current, { ...part, quantity: Math.min(part.currentStock, quantity) }]
    })
    setCartOpen(true)
  }

  async function buyNow(part) {
    setCart([{ ...part, quantity: 1 }])
    setCheckoutOpen(true)
  }

  function updateCartQuantity(partId, quantity) {
    setCart((current) => current.map((item) => {
      if (item.id !== partId) return item
      return { ...item, quantity: Math.max(1, Math.min(item.currentStock, Number(quantity) || 1)) }
    }))
  }

  function removeCartItem(partId) {
    setCart((current) => current.filter((item) => item.id !== partId))
  }

  async function submitCheckout() {
    if (cart.length === 0) return
    const confirmed = await sweetConfirm({
      title: 'Place order?',
      message: `Your invoice total will be ${formatCurrency(totals.total)}.`,
      confirmText: 'Checkout',
    })
    if (!confirmed) return

    try {
      setIsSaving(true)
      await checkoutCustomerParts(cart.map((item) => ({ partId: item.id, quantity: item.quantity })))
      setCart([])
      setCartOpen(false)
      setCheckoutOpen(false)
      await loadData()
      await sweetAlert({ title: 'Order confirmed', message: 'Your invoice has been created.', icon: 'success' })
    } catch (err) {
      await sweetAlert({ title: 'Checkout failed', message: getRequestErrorMessage(err, 'Unable to checkout.'), icon: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  async function submitUnavailableRequest(event) {
    event.preventDefault()
    if (!requestPart) return
    const quantity = Number(requestValues.quantity)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      await sweetAlert({ title: 'Quantity needed', message: 'Enter a valid requested quantity.', icon: 'error' })
      return
    }

    try {
      setIsSaving(true)
      await createPartRequest({
        partId: requestPart.id,
        partName: requestPart.name,
        vehicleId: requestValues.vehicleId || null,
        brandModelSpecification: requestPart.compatibleVehicle || null,
        quantity,
        reason: requestValues.notes.trim() || `Customer requested unavailable part ${requestPart.partCode}.`,
      })
      setRequestPart(null)
      setRequestValues({ vehicleId: '', quantity: '1', notes: '' })
      await loadData()
      await sweetAlert({ title: 'Request sent', message: 'Staff can review this unavailable part request.', icon: 'success' })
    } catch (err) {
      await sweetAlert({ title: 'Request failed', message: getRequestErrorMessage(err, 'Unable to request this part.'), icon: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  async function downloadInvoice(invoice) {
    try {
      const response = await downloadMyCustomerPartInvoicePdf(invoice.id)
      downloadBlob(response.data, `${invoice.invoiceNumber}.pdf`)
    } catch (err) {
      await sweetAlert({ title: 'Download failed', message: getRequestErrorMessage(err, 'Unable to download invoice.'), icon: 'error' })
    }
  }

  if (loading) {
    return <div className="customer-container portal-container"><StatusMessage type="loading" message="Loading parts shop..." /></div>
  }

  if (error) {
    return <div className="customer-card"><StatusMessage type="error" message={error} /></div>
  }

  return (
    <div className="customer-page part-shop-page">
      <PortalHero
        eyebrow="Parts shop"
        title="Buy genuine parts"
        description="Browse available stock, checkout with invoices, or request unavailable parts."
        imageSrc={customerPortalImages.parts}
        imageAlt="Vehicle parts catalog"
        actions={(
          <>
            <button className="btn-primary" type="button" onClick={() => setRequestsOpen(true)}>Unavailable requests</button>
            <button className="btn-outline btn-outline-on-dark" type="button" onClick={() => setInvoicesOpen(true)}>Purchase invoices</button>
          </>
        )}
      />

      <section className="customer-card part-shop-toolbar">
        <div>
          <span className="customer-eyebrow">Catalog</span>
          <h2>{visibleParts.length} parts shown</h2>
        </div>
        <input className="customer-input" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search parts, SKU, category, vehicle..." />
        <select className="customer-input" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
          <option value="all">All stock</option>
          <option value="available">Available only</option>
          <option value="unavailable">Out of stock</option>
        </select>
      </section>

      <section className="part-product-grid">
        {visibleParts.map((part) => {
          const inStock = part.currentStock > 0
          return (
            <article key={part.id} className={`part-product-card ${!inStock ? 'is-out' : ''}`}>
              <div className="part-product-media">
                <img src={resolveImageUrl(part.imageUrl)} alt={part.name} />
                <span className={`part-stock-badge ${inStock ? 'is-in' : 'is-out'}`}>{inStock ? 'In stock' : 'Out of stock'}</span>
              </div>
              <div className="part-product-body">
                <span className="customer-eyebrow">{part.category}</span>
                <h3>{part.name}</h3>
                <p>{part.compatibleVehicle || 'Universal fitment check required'}</p>
                <div className="part-price-row">
                  <strong>{formatCurrency(part.unitPrice)}</strong>
                  <span>{inStock ? `${part.currentStock} available` : 'Request restock'}</span>
                </div>
                <div className="part-card-actions">
                  {inStock ? (
                    <>
                      <button
                        className="part-card-cart-button"
                        type="button"
                        onClick={() => addToCart(part)}
                        aria-label={`Add ${part.name} to cart`}
                        title="Add to cart"
                      >
                        <CartIcon />
                      </button>
                      <button className="btn-primary part-card-buy-button" type="button" onClick={() => buyNow(part)}>Buy now</button>
                    </>
                  ) : (
                    <button className="btn-primary" type="button" onClick={() => setRequestPart(part)}>Request part</button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </section>

      {(cartOpen || checkoutOpen) && (
        <PortalModal
          title={checkoutOpen ? 'Secure checkout' : 'Shopping cart'}
          onClose={() => { setCartOpen(false); setCheckoutOpen(false) }}
          footer={(
            <>
              <button className="btn-outline" type="button" onClick={() => setCartOpen(false)}>Continue shopping</button>
              <button className="btn-primary" type="button" disabled={cart.length === 0 || isSaving} onClick={checkoutOpen ? submitCheckout : () => setCheckoutOpen(true)}>
                {isSaving ? 'Processing...' : checkoutOpen ? 'Place order' : 'Checkout'}
              </button>
            </>
          )}
        >
          <CartPanel cart={cart} totals={totals} onQuantityChange={updateCartQuantity} onRemove={removeCartItem} />
        </PortalModal>
      )}

      {requestsOpen && (
        <PortalModal title="Unavailable requests" className="portal-modal-wide" onClose={() => setRequestsOpen(false)}>
          <div className="part-shop-modal-table">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Part</th><th>Vehicle</th><th>Qty</th><th>Status</th><th>Requested</th></tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td><div className="inventory-part-cell"><strong>{request.partName}</strong><span>{request.brandModelSpecification || 'No specification'}</span></div></td>
                      <td>{request.vehicleName ? `${request.vehicleName} - ${request.vehicleNumber}` : 'General request'}</td>
                      <td>{request.quantity}</td>
                      <td><span className="status-pill is-draft">{request.status}</span></td>
                      <td>{formatDateTime(request.createdAt)}</td>
                    </tr>
                  ))}
                  {requests.length === 0 && <tr><td colSpan="5" className="table-empty">No unavailable part requests yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </PortalModal>
      )}

      {invoicesOpen && (
        <PortalModal title="Purchase invoices" className="portal-modal-wide" onClose={() => setInvoicesOpen(false)}>
          <div className="part-shop-modal-table">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Invoice</th><th>Date</th><th>Source</th><th>Total</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td><div className="inventory-part-cell"><strong>{invoice.invoiceNumber}</strong><span>{invoice.items?.length || 0} items</span></div></td>
                      <td>{formatDateTime(invoice.createdAt)}</td>
                      <td>{invoice.source}</td>
                      <td>{formatCurrency(invoice.totalAmount)}</td>
                      <td><span className={`status-pill ${getStatusPillClass(invoice.status)}`}>{invoice.status}</span></td>
                      <td>
                        <div className="table-actions">
                          <button className="button button-outline" type="button" onClick={() => downloadInvoice(invoice)}>PDF</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && <tr><td colSpan="6" className="table-empty">No customer part invoices found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </PortalModal>
      )}

      {requestPart && (
        <PortalModal title="Request unavailable part" onClose={() => setRequestPart(null)}>
          <form className="customer-form" onSubmit={submitUnavailableRequest}>
            <div className="part-request-summary">
              <strong>{requestPart.name}</strong>
              <span>{requestPart.partCode} - {requestPart.category}</span>
            </div>
            <div className="portal-form-row">
              <label className="customer-form-group">
                <span>Quantity</span>
                <input className="customer-input" type="number" min="1" value={requestValues.quantity} onChange={(event) => setRequestValues((current) => ({ ...current, quantity: event.target.value }))} />
              </label>
              <label className="customer-form-group">
                <span>Vehicle</span>
                <select className="customer-input" value={requestValues.vehicleId} onChange={(event) => setRequestValues((current) => ({ ...current, vehicleId: event.target.value }))}>
                  <option value="">General request</option>
                  {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name} - {vehicle.number}</option>)}
                </select>
              </label>
            </div>
            <label className="customer-form-group">
              <span>Notes</span>
              <textarea className="customer-input portal-textarea" value={requestValues.notes} onChange={(event) => setRequestValues((current) => ({ ...current, notes: event.target.value }))} placeholder="Fitment, preferred brand, urgency..." />
            </label>
            <button className="btn-primary" type="submit" disabled={isSaving}>{isSaving ? 'Sending...' : 'Send request'}</button>
          </form>
        </PortalModal>
      )}
    </div>
  )
}

function CartPanel({ cart, totals, onQuantityChange, onRemove }) {
  if (cart.length === 0) return <p className="text-muted">Your cart is empty.</p>
  return (
    <div className="cart-checkout-panel">
      {cart.map((item) => (
        <div key={item.id} className="cart-line">
          <div><strong>{item.name}</strong><span>{formatCurrency(item.unitPrice)} · {item.currentStock} in stock</span></div>
          <input className="customer-input" type="number" min="1" max={item.currentStock} value={item.quantity} onChange={(event) => onQuantityChange(item.id, event.target.value)} />
          <button className="btn-outline" type="button" onClick={() => onRemove(item.id)}>Remove</button>
        </div>
      ))}
      <div className="checkout-totals">
        <div><span>Subtotal</span><strong>{formatCurrency(totals.subTotal)}</strong></div>
        <div><span>Loyalty discount</span><strong>-{formatCurrency(totals.discount)}</strong></div>
        <div><span>Total</span><strong>{formatCurrency(totals.total)}</strong></div>
      </div>
      <p className="customer-field-help">A 5% loyalty discount applies when the purchase total is above NPR 5,000.</p>
    </div>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="21" r="1"></circle>
      <circle cx="19" cy="21" r="1"></circle>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.72a2 2 0 0 0 2-1.61l1.38-7.39H5.12"></path>
    </svg>
  )
}

function getStatusPillClass(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('approved') || normalized.includes('paid') || normalized.includes('completed')) return 'is-good'
  if (normalized.includes('reject') || normalized.includes('cancel') || normalized.includes('out')) return 'is-alert'
  return 'is-draft'
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', minimumFractionDigits: 0 }).format(value ?? 0)
}

export default PartRequests
