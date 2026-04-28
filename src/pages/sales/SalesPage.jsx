import { useMemo, useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const partCatalog = [
  {
    id: 'P-1001',
    name: 'Brake Pad Set',
    category: 'Brake System',
    vehicleFit: 'Toyota Corolla',
    price: 2800,
    stock: 18,
  },
  {
    id: 'P-1002',
    name: 'Engine Oil 5W-30',
    category: 'Engine Care',
    vehicleFit: 'Universal',
    price: 1650,
    stock: 42,
  },
  {
    id: 'P-1003',
    name: 'Air Filter',
    category: 'Filters',
    vehicleFit: 'Hyundai i20',
    price: 950,
    stock: 26,
  },
  {
    id: 'P-1004',
    name: 'Spark Plug',
    category: 'Ignition',
    vehicleFit: 'Honda City',
    price: 720,
    stock: 35,
  },
  {
    id: 'P-1005',
    name: 'Headlight Bulb',
    category: 'Lighting',
    vehicleFit: 'Universal',
    price: 480,
    stock: 64,
  },
  {
    id: 'P-1006',
    name: 'Battery 12V',
    category: 'Electrical',
    vehicleFit: 'SUV / Sedan',
    price: 6200,
    stock: 9,
  },
]

const customerSnapshots = [
  {
    id: 'C-201',
    name: 'Ramesh Karki',
    phone: '9801234567',
    vehicleNo: 'BA 12 PA 3456',
  },
  {
    id: 'C-202',
    name: 'Anita Shrestha',
    phone: '9812345678',
    vehicleNo: 'GA 05 CHA 2244',
  },
  {
    id: 'C-203',
    name: 'Saurav Shah',
    phone: '9841122334',
    vehicleNo: 'BA 15 CHA 8821',
  },
]

const emptyCustomer = {
  name: '',
  phone: '',
  vehicleNo: '',
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(value)

function SalesPage() {
  const [customer, setCustomer] = useState(emptyCustomer)
  const [searchTerm, setSearchTerm] = useState('')
  const [cartItems, setCartItems] = useState([])

  const filteredParts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return partCatalog
    }

    return partCatalog.filter((part) =>
      [part.id, part.name, part.category, part.vehicleFit]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [searchTerm])

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  const handleCustomerChange = (event) => {
    const { name, value } = event.target
    setCustomer((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const selectCustomer = (selectedCustomer) => {
    setCustomer({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      vehicleNo: selectedCustomer.vehicleNo,
    })
  }

  const addPartToCart = (part) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === part.id)

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === part.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, item.stock),
              }
            : item,
        )
      }

      return [...currentItems, { ...part, quantity: 1 }]
    })
  }

  const updateQuantity = (partId, value) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== partId) {
          return item
        }

        const parsedValue = Number(value)
        const quantity = Number.isNaN(parsedValue)
          ? 1
          : Math.min(Math.max(parsedValue, 1), item.stock)

        return {
          ...item,
          quantity,
        }
      }),
    )
  }

  const removeCartItem = (partId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== partId),
    )
  }

  const clearSale = () => {
    setCustomer(emptyCustomer)
    setSearchTerm('')
    setCartItems([])
  }

  const saleReady =
    customer.name.trim() &&
    customer.phone.trim() &&
    customer.vehicleNo.trim() &&
    cartItems.length > 0

  return (
    <section className="sales-page">
      <PageHeader title="Sales Processing" />

      <div className="sales-layout">
        <div className="sales-main">
          <section className="card sales-panel">
            <div className="section-heading">
              <div>
                <h2>Customer Details</h2>
                <p>Name, phone, and vehicle number snapshot</p>
              </div>
              <Button variant="secondary" onClick={() => setCustomer(emptyCustomer)}>
                Clear
              </Button>
            </div>

            <div className="customer-form-grid">
              <Input
                id="customerName"
                label="Customer name"
                name="name"
                placeholder="Enter customer name"
                value={customer.name}
                onChange={handleCustomerChange}
              />
              <Input
                id="customerPhone"
                label="Phone number"
                name="phone"
                placeholder="Enter phone number"
                value={customer.phone}
                onChange={handleCustomerChange}
              />
              <Input
                id="vehicleNo"
                label="Vehicle number"
                name="vehicleNo"
                placeholder="Enter vehicle number"
                value={customer.vehicleNo}
                onChange={handleCustomerChange}
              />
            </div>

            <div className="snapshot-row" aria-label="Customer snapshots">
              {customerSnapshots.map((snapshot) => (
                <button
                  className="snapshot-chip"
                  key={snapshot.id}
                  onClick={() => selectCustomer(snapshot)}
                  type="button"
                >
                  <strong>{snapshot.name}</strong>
                  <span>{snapshot.vehicleNo}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card sales-panel">
            <div className="section-heading">
              <div>
                <h2>Parts</h2>
                <p>Search by part, code, category, or vehicle fit</p>
              </div>
            </div>

            <Input
              id="partSearch"
              label="Search parts"
              placeholder="Brake pad, P-1001, Toyota"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <div className="part-list">
              {filteredParts.map((part) => {
                const cartItem = cartItems.find((item) => item.id === part.id)
                const cartQuantity = cartItem?.quantity ?? 0
                const isMaxQuantity = cartQuantity >= part.stock

                return (
                  <article className="part-row" key={part.id}>
                    <div>
                      <div className="part-title-row">
                        <strong>{part.name}</strong>
                        <span>{part.id}</span>
                      </div>
                      <div className="part-meta">
                        <span>{part.category}</span>
                        <span>{part.vehicleFit}</span>
                        <span>{part.stock} in stock</span>
                      </div>
                    </div>

                    <div className="part-action">
                      <strong>{formatCurrency(part.price)}</strong>
                      <Button
                        disabled={isMaxQuantity}
                        onClick={() => addPartToCart(part)}
                      >
                        {cartQuantity ? `Added ${cartQuantity}` : 'Add'}
                      </Button>
                    </div>
                  </article>
                )
              })}

              {filteredParts.length === 0 && (
                <div className="empty-state">No matching parts found.</div>
              )}
            </div>
          </section>
        </div>

        <aside className="card sales-summary-panel">
          <div className="section-heading">
            <div>
              <h2>Cart</h2>
              <p>{cartItems.length} selected parts</p>
            </div>
          </div>

          {cartItems.length > 0 ? (
            <div className="cart-list">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{formatCurrency(item.price)} each</span>
                  </div>

                  <div className="quantity-row">
                    <button
                      aria-label={`Decrease ${item.name} quantity`}
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      type="button"
                    >
                      -
                    </button>
                    <input
                      aria-label={`${item.name} quantity`}
                      max={item.stock}
                      min="1"
                      onChange={(event) =>
                        updateQuantity(item.id, event.target.value)
                      }
                      type="number"
                      value={item.quantity}
                    />
                    <button
                      aria-label={`Increase ${item.name} quantity`}
                      disabled={item.quantity >= item.stock}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-line-total">
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    <button
                      className="text-button"
                      onClick={() => removeCartItem(item.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No parts added yet.</div>
          )}

          <div className="summary-totals">
            <div>
              <span>Customer</span>
              <strong>{customer.name || 'Not selected'}</strong>
            </div>
            <div>
              <span>Vehicle</span>
              <strong>{customer.vehicleNo || 'Not entered'}</strong>
            </div>
            <div className="subtotal-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
          </div>

          <div className="summary-actions">
            <Button className="full-width" disabled={!saleReady}>
              Ready for Billing
            </Button>
            <Button
              className="full-width"
              disabled={!customer.name && !cartItems.length}
              onClick={clearSale}
              variant="secondary"
            >
              Start New Sale
            </Button>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default SalesPage
