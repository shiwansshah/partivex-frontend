function ensureStyles() {
  if (document.getElementById('sweet-alert-lite-styles')) return
  const style = document.createElement('style')
  style.id = 'sweet-alert-lite-styles'
  style.textContent = `
    .sweet-lite-backdrop{position:fixed;inset:0;z-index:3000;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.48)}
    .sweet-lite-card{width:min(430px,100%);padding:26px;border:1px solid #e4e7ec;border-radius:8px;background:#fff;box-shadow:0 20px 54px rgba(16,24,40,.2);text-align:center;font-family:Inter,system-ui,sans-serif}
    .sweet-lite-icon{width:58px;height:58px;margin:0 auto 16px;border-radius:999px;display:grid;place-items:center;font-weight:800;font-size:28px}
    .sweet-lite-icon.success{color:#137333;background:#eaf7ee}.sweet-lite-icon.error{color:#f03e3e;background:#fff5f5}.sweet-lite-icon.info{color:#175cd3;background:#eff6ff}
    .sweet-lite-title{margin:0;color:#1f2328;font-size:22px}.sweet-lite-message{margin:10px 0 0;color:#667085;line-height:1.55}
    .sweet-lite-actions{display:flex;justify-content:center;gap:10px;margin-top:22px}.sweet-lite-actions button{min-height:40px;padding:8px 18px;border-radius:4px;border:1px solid #171a21;font-weight:700;cursor:pointer}
    .sweet-lite-confirm{color:#fff;background:#ef233c;border-color:#ef233c!important}.sweet-lite-cancel{color:#1f2328;background:#fff}
  `
  document.head.appendChild(style)
}

export function sweetAlert({ title, message = '', icon = 'info', confirmText = 'OK' }) {
  ensureStyles()
  return new Promise((resolve) => {
    const root = document.createElement('div')
    root.className = 'sweet-lite-backdrop'
    root.innerHTML = `
      <div class="sweet-lite-card" role="dialog" aria-modal="true">
        <div class="sweet-lite-icon ${icon}">${icon === 'success' ? 'OK' : icon === 'error' ? '!' : 'i'}</div>
        <h2 class="sweet-lite-title">${escapeHtml(title)}</h2>
        ${message ? `<p class="sweet-lite-message">${escapeHtml(message)}</p>` : ''}
        <div class="sweet-lite-actions"><button class="sweet-lite-confirm" type="button">${escapeHtml(confirmText)}</button></div>
      </div>
    `
    document.body.appendChild(root)
    root.querySelector('button').focus()
    root.querySelector('button').addEventListener('click', () => {
      root.remove()
      resolve(true)
    })
  })
}

export function sweetConfirm({ title, message = '', confirmText = 'Confirm', cancelText = 'Cancel', icon = 'info' }) {
  ensureStyles()
  return new Promise((resolve) => {
    const root = document.createElement('div')
    root.className = 'sweet-lite-backdrop'
    root.innerHTML = `
      <div class="sweet-lite-card" role="dialog" aria-modal="true">
        <div class="sweet-lite-icon ${icon}">${icon === 'error' ? '!' : '?'}</div>
        <h2 class="sweet-lite-title">${escapeHtml(title)}</h2>
        ${message ? `<p class="sweet-lite-message">${escapeHtml(message)}</p>` : ''}
        <div class="sweet-lite-actions">
          <button class="sweet-lite-cancel" type="button">${escapeHtml(cancelText)}</button>
          <button class="sweet-lite-confirm" type="button">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `
    document.body.appendChild(root)
    root.querySelector('.sweet-lite-confirm').focus()
    root.querySelector('.sweet-lite-cancel').addEventListener('click', () => {
      root.remove()
      resolve(false)
    })
    root.querySelector('.sweet-lite-confirm').addEventListener('click', () => {
      root.remove()
      resolve(true)
    })
  })
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
