/* ============================================
   CAPIZZANO — SPA Logic v3
   ============================================ */

const IC = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  pizza: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 11h.01"/><path d="M11 15h.01"/><path d="M16 16h.01"/><path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"/></svg>'
};

// ---- Products ----
const products = [
  { id:1, name:'Margarita', price:100, desc:'Tradicional salsa de tomate, con queso mozzarella fundido y frescas hojas de albahaca que aportan un aroma inconfundible.', img:'img/pizza-margarita.png' },
  { id:2, name:'Marinara', price:110, desc:'Clásica salsa de tomate, realzada con ajo, especias y un toque de aceite de oliva sobre masa crujiente.', img:'img/pizza-marinara.png' },
  { id:3, name:'Pepperoni', price:125, desc:'Deliciosa salsa de tomate, acompañada de queso mozzarella fundido y crujientes rodajas de pepperoni.', img:'img/pizza-pepperoni.png' },
  { id:4, name:'4 Quesos', price:135, desc:'Exquisita base de salsa de tomate, y una mezcla selecta de quesos: Oaxaca, Chihuahua, Manchego y la cremosidad de queso Philadelphia.', img:'img/pizza-4quesos.png' },
  { id:5, name:'Jamón Serrano', price:230, desc:'Sutil salsa de tomate, acompañada de queso mozzarella fundido y finas láminas de jamón serrano.', img:'img/pizza-jamon-serrano.png' }
];

// ---- State ----
let cart = [];
let cQty = {};
products.forEach(p => cQty[p.id] = 0);

// ---- DOM refs ----
const menuGrid = document.getElementById('menuGrid');
const cartBody = document.getElementById('cartBody');
const cartFoot = document.getElementById('cartFoot');
const cSub = document.getElementById('cSub');
const cTot = document.getElementById('cTot');
const coBtn = document.getElementById('coBtn');
const navBadge = document.getElementById('navBadge');
const topBadge = document.getElementById('topBadge');
const cartPanel = document.getElementById('cartPanel');
const cartOverlay = document.getElementById('cartOverlay');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// ============================================
// NAVIGATION
// ============================================
const tabs = document.querySelectorAll('.nav-tab');
const pages = document.querySelectorAll('.page');

function goTo(page) {
  pages.forEach(p => p.classList.remove('active'));
  tabs.forEach(t => t.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
  const tab = document.querySelector(`.nav-tab[data-page="${page}"]`);
  if (tab) tab.classList.add('active');
}

tabs.forEach(t => t.addEventListener('click', () => goTo(t.dataset.page)));

// ============================================
// CART OPEN / CLOSE
// ============================================
function openCart() {
  cartPanel.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartPanel.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('openCartBtn').addEventListener('click', openCart);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ============================================
// RENDER MENU
// ============================================
function renderMenu() {
  menuGrid.innerHTML = products.map((p, i) => `
    <div class="p-card fade-in" style="transition-delay:${i * 0.07}s" id="card-${p.id}">
      <div class="p-card-img">
        <img src="${p.img}" alt="Pizza ${p.name}" loading="lazy">
        <div class="fade"></div>
        <div class="price">$${p.price}</div>
      </div>
      <div class="p-card-body">
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="p-card-actions">
          <div class="stepper">
            <button onclick="step(${p.id},-1)">&minus;</button>
            <span class="val" id="v-${p.id}">0</span>
            <button onclick="step(${p.id},1)">&plus;</button>
          </div>
          <button class="add-btn" id="ab-${p.id}" onclick="addToCart(${p.id})">
            <span class="icon">${IC.plus}</span>
            Agregar
          </button>
        </div>
      </div>
    </div>
  `).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.p-card.fade-in').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.1 });
      obs.observe(el);
    });
  });
}

// ============================================
// STEPPER
// ============================================
function step(id, d) {
  cQty[id] = Math.max(0, (cQty[id] || 0) + d);
  const el = document.getElementById('v-' + id);
  if (el) {
    el.textContent = cQty[id];
    el.classList.add('pop');
    setTimeout(() => el.classList.remove('pop'), 180);
  }
}

// ============================================
// ADD TO CART
// ============================================
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const qty = cQty[id] || 0;
  const addQty = qty > 0 ? qty : 1;

  const ex = cart.find(x => x.id === id);
  if (ex) { ex.qty += addQty; } else { cart.push({ ...p, qty: addQty }); }

  // Reset stepper
  cQty[id] = 0;
  const vEl = document.getElementById('v-' + id);
  if (vEl) vEl.textContent = '0';

  // Button feedback
  const btn = document.getElementById('ab-' + id);
  if (btn) {
    btn.classList.add('ok');
    btn.innerHTML = `<span class="icon">${IC.check}</span> Agregado`;
    setTimeout(() => {
      btn.classList.remove('ok');
      btn.innerHTML = `<span class="icon">${IC.plus}</span> Agregar`;
    }, 1200);
  }

  updateCart();
  showToast(p.name + ' agregada al carrito');
}

// ============================================
// CART UPDATE
// ============================================
function updateCart() {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Badges
  if (totalItems > 0) {
    navBadge.textContent = totalItems;
    navBadge.classList.add('vis');
    topBadge.textContent = totalItems;
    topBadge.classList.add('vis');
  } else {
    navBadge.classList.remove('vis');
    topBadge.classList.remove('vis');
  }

  // Empty
  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <span class="icon">${IC.bag}</span>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega tus pizzas favoritas desde el menú</p>
      </div>
    `;
    cartFoot.classList.remove('vis');
    return;
  }

  // Items
  cartBody.innerHTML = cart.map(item => `
    <div class="c-item">
      <div class="c-item-img"><img src="${item.img}" alt="${item.name}"></div>
      <div class="c-item-info">
        <div class="c-item-name">${item.name}</div>
        <div class="c-item-price">$${item.price} × ${item.qty} = <strong>$${item.price * item.qty}</strong></div>
        <div class="c-item-qty">
          <button onclick="cItemQty(${item.id},-1)">&minus;</button>
          <span class="qv">${item.qty}</span>
          <button onclick="cItemQty(${item.id},1)">&plus;</button>
        </div>
      </div>
      <button class="c-item-del" onclick="removeItem(${item.id})">
        <span class="icon">${IC.trash}</span>
      </button>
    </div>
  `).join('');

  cartFoot.classList.add('vis');
  cSub.textContent = '$' + totalPrice;
  cTot.textContent = '$' + totalPrice;
  validateCo();
}

function cItemQty(id, d) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + d);
  updateCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

// ============================================
// CHECKOUT VALIDATION
// ============================================
function validateCo() {
  const n = document.getElementById('dName').value.trim();
  const a = document.getElementById('dAddr').value.trim();
  coBtn.disabled = !(cart.length > 0 && n && a);
}

['dName', 'dAddr', 'dRef'].forEach(id => {
  document.getElementById(id).addEventListener('input', validateCo);
});

// ============================================
// WHATSAPP CHECKOUT
// ============================================
coBtn.addEventListener('click', () => {
  const name = document.getElementById('dName').value.trim();
  const addr = document.getElementById('dAddr').value.trim();
  const ref = document.getElementById('dRef').value.trim();
  if (!name || !addr) { showToast('Completa nombre y dirección'); return; }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  let m = '\uD83C\uDF55 *NUEVO PEDIDO — CAPIZZANO* \uD83C\uDF55\n';
  m += '────────────────────\n\n';
  m += '\uD83D\uDC64 *Cliente:* ' + name + '\n';
  m += '\uD83D\uDCCD *Dirección:* ' + addr + '\n';
  if (ref) m += '\uD83D\uDCDD *Referencia:* ' + ref + '\n';
  m += '\n────────────────────\n';
  m += '\uD83D\uDCCB *DETALLE DEL PEDIDO:*\n\n';

  cart.forEach(item => {
    m += '\uD83C\uDF55 *' + item.name + '*\n';
    m += '   Cantidad: ' + item.qty + ' | $' + item.price + ' c/u\n';
    m += '   Subtotal: $' + (item.price * item.qty) + '\n\n';
  });

  m += '────────────────────\n';
  m += '\uD83D\uDCB0 *TOTAL A PAGAR: $' + total + '*\n';
  m += '────────────────────\n\n';
  m += '\uD83D\uDE4F Gracias por elegir Capizzano.';

  window.open('https://wa.me/529619390460?text=' + encodeURIComponent(m), '_blank');

  cart = [];
  document.getElementById('dName').value = '';
  document.getElementById('dAddr').value = '';
  document.getElementById('dRef').value = '';
  updateCart();
  closeCart();
  showToast('Pedido enviado por WhatsApp');
});

// ============================================
// TOAST
// ============================================
let tTimer;
function showToast(msg) {
  clearTimeout(tTimer);
  toastMsg.textContent = msg;
  toast.classList.add('show');
  tTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  updateCart();
});
