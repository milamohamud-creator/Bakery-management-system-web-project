/**
 * BakeMaster MIS — Core Application Logic
 * Nidaamka Maamulka Dukaanka Rootiga iyo Macmacaanka
 */

// ==========================================
// 1. STATE & SAMPLE DATA (6+ High Quality Images)
// ==========================================
const API_URL = 'http://localhost:5000/api';
let isBackendConnected = false;

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: "Keeg Shukulaato ah (Chocolate Drip)",
    category: "Cakes",
    price: 18.50,
    stock: 14,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    description: "Keeg shukulaato macaan oo leh kareem Belgium iyo miro lagu qurxiyey."
  },
  {
    id: 2,
    name: "Keeg Dhalasho (Celebration Cake)",
    category: "Cakes",
    price: 24.00,
    stock: 6, // Low stock example
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80",
    description: "Keeg loogu talagalay xafladaha dhalashada oo leh midabyo soo jiidasho leh."
  },
  {
    id: 3,
    name: "Donuts Caano & Strawberry ah",
    category: "Donuts",
    price: 2.50,
    stock: 45,
    image: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=600&auto=format&fit=crop&q=80",
    description: "Donuts jilicsan oo lagu dahaadhay glaze strawberry iyo shukulaato."
  },
  {
    id: 4,
    name: "Cupcakes Miro iyo Vanilla ah",
    category: "Cupcakes",
    price: 3.50,
    stock: 28,
    image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&auto=format&fit=crop&q=80",
    description: "Cupcake macaan oo lagu qurxiyey cream furan iyo miro daray ah."
  },
  {
    id: 5,
    name: "Rooti Cusub (Artisan Sourdough)",
    category: "Bread",
    price: 4.00,
    stock: 5, // Low stock example
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    description: "Rooti foorno kulul laga soo saaray oo dabiici ah, jilicsan gudahana ka buuxo."
  },
  {
    id: 6,
    name: "Cookies Shukulaato & Buskud",
    category: "Cookies",
    price: 2.00,
    stock: 50,
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80",
    description: "Buskud crunch ah oo ay ku dhex milan yihiin dhibco shukulaato qani ah."
  }
];

const SAMPLE_CUSTOMERS = [
  { id: 1, name: "Axmed Cali Nuur", phone: "+252 61 5123456", email: "axmed@gmail.com", address: "Hodan, Muqdisho", totalSpent: 42.50 },
  { id: 2, name: "Faadumo Maxamed", phone: "+252 63 4123456", email: "faadumo@gmail.com", address: "26 June, Hargeysa", totalSpent: 75.00 },
  { id: 3, name: "Cabdiqaadir Xasan", phone: "+252 90 7123456", email: "cabdi@gmail.com", address: "Garowe", totalSpent: 18.50 }
];

const SAMPLE_SALES = [
  {
    id: "INV-1001",
    date: "2026-10-28 14:30",
    customer: "Faadumo Maxamed",
    paymentMethod: "Zaad/EVC",
    items: [
      { id: 1, name: "Keeg Shukulaato ah", qty: 2, price: 18.50, subtotal: 37.00 },
      { id: 3, name: "Donuts Strawberry", qty: 4, price: 2.50, subtotal: 10.00 }
    ],
    total: 47.00
  },
  {
    id: "INV-1002",
    date: "2026-10-29 09:15",
    customer: "Axmed Cali Nuur",
    paymentMethod: "Kaash",
    items: [
      { id: 5, name: "Rooti Cusub", qty: 3, price: 4.00, subtotal: 12.00 },
      { id: 6, name: "Cookies Shukulaato", qty: 5, price: 2.00, subtotal: 10.00 }
    ],
    total: 22.00
  }
];

let appState = {
  products: [],
  customers: [],
  sales: [],
  cart: [],
  currentCategoryPill: 'All',
  settings: {
    bakeryName: "BakeMaster Bakery & Sweets",
    currency: "$",
    lowStockThreshold: 8,
    phone: "+252 61 5000000"
  }
};

// ==========================================
// 2. INITIALIZATION & DATABASE SYNC
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupEventListeners();
  await checkBackendAndLoadData();
});

async function checkBackendAndLoadData() {
  try {
    const res = await fetch(`${API_URL}/products`, { method: 'GET' });
    if (res.ok) {
      isBackendConnected = true;
      document.getElementById('db-status-dot').className = 'status-dot active';
      document.getElementById('db-status-title').innerText = 'SQLite Server Live';
      document.getElementById('db-status-sub').innerText = 'Backend-ka wuu shaqaynayaa';
      
      const [prodData, custData, salesData] = await Promise.all([
        fetch(`${API_URL}/products`).then(r => r.json()),
        fetch(`${API_URL}/customers`).then(r => r.json()),
        fetch(`${API_URL}/sales`).then(r => r.json())
      ]);
      appState.products = prodData;
      appState.customers = custData;
      appState.sales = salesData;
    } else {
      throw new Error();
    }
  } catch (err) {
    // Fallback to Persistent LocalStorage with Sample Data
    isBackendConnected = false;
    document.getElementById('db-status-dot').className = 'status-dot active';
    document.getElementById('db-status-title').innerText = 'Local Persistent DB';
    document.getElementById('db-status-sub').innerText = 'Xogta Browser-ka ku xafidan';

    const savedProd = localStorage.getItem('bm_products');
    const savedCust = localStorage.getItem('bm_customers');
    const savedSales = localStorage.getItem('bm_sales');
    const savedSet = localStorage.getItem('bm_settings');

    appState.products = savedProd ? JSON.parse(savedProd) : [...SAMPLE_PRODUCTS];
    appState.customers = savedCust ? JSON.parse(savedCust) : [...SAMPLE_CUSTOMERS];
    appState.sales = savedSales ? JSON.parse(savedSales) : [...SAMPLE_SALES];
    if (savedSet) appState.settings = JSON.parse(savedSet);

    saveLocalState();
  }

  refreshAllUI();
}

function saveLocalState() {
  localStorage.setItem('bm_products', JSON.stringify(appState.products));
  localStorage.setItem('bm_customers', JSON.stringify(appState.customers));
  localStorage.setItem('bm_sales', JSON.stringify(appState.sales));
  localStorage.setItem('bm_settings', JSON.stringify(appState.settings));
}

function refreshAllUI() {
  renderDashboard();
  renderProducts();
  renderCategories();
  renderPosCatalog();
  renderPosCart();
  renderSalesHistory();
  renderInventory();
  renderCustomers();
  renderReports();
  populateCustomerSelects();
}

// ==========================================
// 3. NAVIGATION (ROUTER)
// ==========================================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      navigateToView(view);
    });
  });

  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function navigateToView(viewId) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

  const targetView = document.getElementById(`view-${viewId}`);
  const targetBtn = document.querySelector(`.nav-item[data-view="${viewId}"]`);

  if (targetView) targetView.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');

  const titles = {
    dashboard: "Dashboard — Bogga Guud",
    products: "Products — Maareynta Alaabta",
    categories: "Categories — Noocyada Macmacaanka",
    sales: "Sales — Diiwaangelinta Iibka (POS)",
    inventory: "Inventory — Maareynta Kaydka",
    customers: "Customers — Macaamiisha Dukaanka",
    reports: "Reports — Warbixinnada Dukaanka",
    settings: "Settings — Dejinta Nidaamka"
  };

  document.getElementById('pageTitle').innerText = titles[viewId] || "BakeMaster MIS";
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

// ==========================================
// 4. VIEW RENDERING: DASHBOARD
// ==========================================
function renderDashboard() {
  const totalProducts = appState.products.length;
  const totalSales = appState.sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalStock = appState.products.reduce((sum, p) => sum + Number(p.stock), 0);
  const lowStockItems = appState.products.filter(p => Number(p.stock) <= appState.settings.lowStockThreshold);

  document.getElementById('dashTotalProducts').innerText = totalProducts;
  document.getElementById('dashTotalSales').innerText = `${appState.settings.currency}${totalSales.toFixed(2)}`;
  document.getElementById('dashTotalSalesCount').innerText = `${appState.sales.length} Iib Guud`;
  document.getElementById('dashTotalStock').innerText = totalStock;
  document.getElementById('dashLowStockCount').innerText = lowStockItems.length;

  // Recent Sales Table
  const recentTbody = document.getElementById('recentSalesTbody');
  const recent = [...appState.sales].reverse().slice(0, 5);
  if (recent.length === 0) {
    recentTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#888;">Weli wax iib ah ma jiraan.</td></tr>`;
  } else {
    recentTbody.innerHTML = recent.map(s => `
      <tr>
        <td><strong>#${s.id}</strong></td>
        <td>${s.customer}</td>
        <td>${s.items ? s.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Alaab'}</td>
        <td>${s.date}</td>
        <td><strong style="color:var(--pink-primary);">${appState.settings.currency}${Number(s.total).toFixed(2)}</strong></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="viewReceipt('${s.id}')"><i class="fa-solid fa-receipt"></i> Rasiidh</button>
        </td>
      </tr>
    `).join('');
  }

  // Low Stock Alerts List
  const lowStockList = document.getElementById('lowStockList');
  if (lowStockItems.length === 0) {
    lowStockList.innerHTML = `<p style="color:#2E7D32; font-size:13px;"><i class="fa-solid fa-circle-check"></i> Dhammaan kaydku waa mid ku filan!</p>`;
  } else {
    lowStockList.innerHTML = lowStockItems.map(p => `
      <div class="low-stock-item">
        <div>
          <strong style="font-size:13.5px;">${p.name}</strong>
          <div style="font-size:11px; color:#C62828;">Kaliya ${p.stock} xabbo ayaa haray</div>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="quickRestock(${p.id})">+ Buuxi</button>
      </div>
    `).join('');
  }
}

// ==========================================
// 5. VIEW RENDERING: PRODUCTS
// ==========================================
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const search = document.getElementById('productSearch')?.value.toLowerCase() || '';
  const cat = document.getElementById('categoryFilter')?.value || 'All';

  const filtered = appState.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search) || (p.description && p.description.toLowerCase().includes(search));
    const matchesCat = (cat === 'All' || p.category === cat);
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">Wax alaab ah lama helin.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-img-wrap">
        <span class="product-category-pill">${p.category}</span>
        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'">
      </div>
      <div class="product-body">
        <h4 class="product-title">${p.name}</h4>
        <p class="product-desc">${p.description || 'Macmacaan iyo rooti tayo sare leh oo maalin walba cusub.'}</p>
        <div class="product-meta">
          <span class="product-price">${appState.settings.currency}${Number(p.price).toFixed(2)}</span>
          <span class="badge ${p.stock <= appState.settings.lowStockThreshold ? (p.stock === 0 ? 'badge-danger' : 'badge-warning') : 'badge-success'}">
            ${p.stock === 0 ? 'Kayd ma jiro' : `Kaydka: ${p.stock}`}
          </span>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary btn-sm" onclick="quickSellProduct(${p.id})" ${p.stock === 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-cart-shopping"></i> Iibi
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openProductModal(${p.id})" title="Wax ka beddel">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${p.id})" title="Tirtir">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterProducts() {
  renderProducts();
}

// ==========================================
// 6. VIEW RENDERING: CATEGORIES
// ==========================================
function renderCategories() {
  const categories = [
    { name: "Cakes", icon: "fa-cake-candles", desc: "Keegyada dhalashada, aroosyada iyo xafladaha" },
    { name: "Donuts", icon: "fa-circle-dot", desc: "Donuts shukulaato, strawberry iyo sonkor leh" },
    { name: "Cupcakes", icon: "fa-mug-saucer", desc: "Cupcakes qurux badan oo macaan" },
    { name: "Bread", icon: "fa-bread-slice", desc: "Rooti foorno, sandwich iyo sourdough" },
    { name: "Cookies", icon: "fa-cookie-bite", desc: "Buskud iyo cookies crunch ah" },
    { name: "Other Desserts", icon: "fa-ice-cream", desc: "Macmacaanka kale ee dukaanka" }
  ];

  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = categories.map(c => {
    const prods = appState.products.filter(p => p.category === c.name);
    const stock = prods.reduce((sum, p) => sum + Number(p.stock), 0);
    return `
      <div class="category-card" onclick="filterByCategory('${c.name}')">
        <div class="category-icon-box">
          <i class="fa-solid ${c.icon}"></i>
        </div>
        <div>
          <h4>${c.name}</h4>
          <p style="font-size:12px; color:var(--text-muted);">${c.desc}</p>
          <div style="margin-top:6px; font-size:12px; font-weight:700; color:var(--pink-primary);">
            ${prods.length} Nooc | ${stock} Xabbo oo kayd ah
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterByCategory(catName) {
  navigateToView('products');
  const catFilter = document.getElementById('categoryFilter');
  if (catFilter) catFilter.value = catName;
  renderProducts();
}

// ==========================================
// 7. POINT OF SALE (POS) & CART LOGIC
// ==========================================
function switchSalesTab(tab) {
  const posView = document.getElementById('posView');
  const historyView = document.getElementById('historyView');
  const tabs = document.querySelectorAll('.sales-tabs .tab-btn');

  tabs.forEach(t => t.classList.remove('active'));

  if (tab === 'pos') {
    posView.style.display = 'grid';
    historyView.style.display = 'none';
    tabs[0].classList.add('active');
  } else {
    posView.style.display = 'none';
    historyView.style.display = 'block';
    tabs[1].classList.add('active');
  }
}

function renderPosCatalog() {
  const container = document.getElementById('posItemsGrid');
  const search = document.getElementById('posSearch')?.value.toLowerCase() || '';

  // Render Category Filter Pills
  const catPillsBox = document.getElementById('posCatPills');
  const cats = ['All', 'Cakes', 'Donuts', 'Cupcakes', 'Bread', 'Cookies', 'Other Desserts'];
  catPillsBox.innerHTML = cats.map(c => `
    <span class="pos-cat-pill ${appState.currentCategoryPill === c ? 'active' : ''}" onclick="setPosCatPill('${c}')">${c}</span>
  `).join('');

  const filtered = appState.products.filter(p => {
    const matchName = p.name.toLowerCase().includes(search);
    const matchCat = (appState.currentCategoryPill === 'All' || p.category === appState.currentCategoryPill);
    return matchName && matchCat;
  });

  container.innerHTML = filtered.map(p => `
    <div class="pos-item-card" onclick="addToCart(${p.id})">
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'">
      <h5>${p.name}</h5>
      <strong>${appState.settings.currency}${Number(p.price).toFixed(2)}</strong>
      <div style="font-size:11px; color:${p.stock <= appState.settings.lowStockThreshold ? '#C62828' : '#2E7D32'}; font-weight:bold;">
        Kaydka: ${p.stock}
      </div>
    </div>
  `).join('');
}

function setPosCatPill(cat) {
  appState.currentCategoryPill = cat;
  renderPosCatalog();
}

function renderPosProducts() {
  renderPosCatalog();
}

function addToCart(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    showToast("Alaabtan kaydkeeda waa eber!", "error");
    return;
  }

  const existing = appState.cart.find(item => item.id === productId);
  if (existing) {
    if (existing.qty + 1 > product.stock) {
      showToast(`Kaydka dukaanka waxaa ku haray kaliya ${product.stock} xabbo!`, "error");
      return;
    }
    existing.qty += 1;
    existing.subtotal = existing.qty * existing.price;
  } else {
    appState.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      subtotal: product.price
    });
  }

  renderPosCart();
}

function updateCartQty(productId, delta) {
  const item = appState.cart.find(i => i.id === productId);
  const prod = appState.products.find(p => p.id === productId);
  if (!item || !prod) return;

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    appState.cart = appState.cart.filter(i => i.id !== productId);
  } else {
    if (newQty > prod.stock) {
      showToast(`Kaliya ${prod.stock} xabbo ayaa kaydka taalla!`, "error");
      return;
    }
    item.qty = newQty;
    item.subtotal = item.qty * item.price;
  }
  renderPosCart();
}

function clearCart() {
  appState.cart = [];
  renderPosCart();
}

function renderPosCart() {
  const container = document.getElementById('cartItemsContainer');
  if (appState.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-message">
        <i class="fa-solid fa-basket-shopping"></i>
        <p>Weli wax alaab ah maadan dooran.<br>Guji alaabta si aad ugu darto iibka.</p>
      </div>
    `;
    document.getElementById('billSubtotal').innerText = `${appState.settings.currency}0.00`;
    document.getElementById('billGrandTotal').innerText = `${appState.settings.currency}0.00`;
    document.getElementById('btnPayTotal').innerText = '0.00';
    return;
  }

  const subtotal = appState.cart.reduce((sum, i) => sum + i.subtotal, 0);

  container.innerHTML = appState.cart.map(item => `
    <div class="cart-item-row">
      <div class="cart-item-info">
        <h6>${item.name}</h6>
        <small>${appState.settings.currency}${item.price.toFixed(2)} x ${item.qty} = ${appState.settings.currency}${item.subtotal.toFixed(2)}</small>
      </div>
      <div class="cart-qty-ctrls">
        <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
        <span style="font-weight:700; font-size:13px; min-width:18px; text-align:center;">${item.qty}</span>
        <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');

  document.getElementById('billSubtotal').innerText = `${appState.settings.currency}${subtotal.toFixed(2)}`;
  document.getElementById('billGrandTotal').innerText = `${appState.settings.currency}${subtotal.toFixed(2)}`;
  document.getElementById('btnPayTotal').innerText = subtotal.toFixed(2);
}

async function checkoutSale() {
  if (appState.cart.length === 0) {
    showToast("Fadlan marka hore alaab ku dar rasiidhka!", "error");
    return;
  }

  const customerName = document.getElementById('posCustomer').value;
  const payMethodInput = document.querySelector('input[name="payMethod"]:checked');
  const payMethod = payMethodInput ? payMethodInput.value : 'Kaash';
  const total = appState.cart.reduce((sum, i) => sum + i.subtotal, 0);

  const saleRecord = {
    id: `INV-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    customer: customerName,
    paymentMethod: payMethod,
    items: [...appState.cart],
    total: total
  };

  // Reduce Stock in memory & server
  for (const cartItem of appState.cart) {
    const p = appState.products.find(item => item.id === cartItem.id);
    if (p) {
      p.stock = Math.max(0, p.stock - cartItem.qty);
      if (isBackendConnected) {
        await fetch(`${API_URL}/products/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        });
      }
    }
  }

  // Update customer total spend
  const customer = appState.customers.find(c => c.name === customerName);
  if (customer) {
    customer.totalSpent = (Number(customer.totalSpent) || 0) + total;
  }

  // Save Sale Record
  appState.sales.unshift(saleRecord);

  if (isBackendConnected) {
    await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleRecord)
    });
  } else {
    saveLocalState();
  }

  showToast(`Iibka waa la xaqiijiyey! #${saleRecord.id}`, "success");
  clearCart();
  refreshAllUI();
  viewReceipt(saleRecord.id);
}

function quickSellProduct(productId) {
  navigateToView('sales');
  switchSalesTab('pos');
  addToCart(productId);
}

// ==========================================
// 8. VIEW RENDERING: INVENTORY
// ==========================================
function renderInventory() {
  const tbody = document.getElementById('inventoryTbody');
  const search = document.getElementById('inventorySearch')?.value.toLowerCase() || '';

  const filtered = appState.products.filter(p => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search));

  tbody.innerHTML = filtered.map(p => {
    let badgeClass = 'badge-success';
    let statusText = 'Ku Filan';
    if (p.stock === 0) {
      badgeClass = 'badge-danger';
      statusText = 'Eber / Dhammaatay';
    } else if (p.stock <= appState.settings.lowStockThreshold) {
      badgeClass = 'badge-warning';
      statusText = 'Sii Dhamaanaya';
    }

    return `
      <tr>
        <td>
          <img src="${p.image}" style="width:44px; height:44px; border-radius:8px; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'">
        </td>
        <td><strong>${p.name}</strong></td>
        <td><span class="badge badge-brown">${p.category}</span></td>
        <td>${appState.settings.currency}${Number(p.price).toFixed(2)}</td>
        <td><strong style="font-size:15px;">${p.stock}</strong></td>
        <td><span class="badge ${badgeClass}">${statusText}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-sm" onclick="adjustStock(${p.id}, 5)">+5</button>
            <button class="btn btn-secondary btn-sm" onclick="adjustStock(${p.id}, 10)">+10</button>
            <button class="btn btn-primary btn-sm" onclick="promptCustomStock(${p.id})">Tiri</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterInventory() {
  renderInventory();
}

function filterLowStockOnly() {
  const searchInput = document.getElementById('inventorySearch');
  searchInput.value = '';
  const low = appState.products.filter(p => p.stock <= appState.settings.lowStockThreshold);
  const tbody = document.getElementById('inventoryTbody');
  tbody.innerHTML = low.map(p => `
    <tr>
      <td><img src="${p.image}" style="width:44px; height:44px; border-radius:8px; object-fit:cover;"></td>
      <td><strong>${p.name}</strong></td>
      <td><span class="badge badge-brown">${p.category}</span></td>
      <td>${appState.settings.currency}${Number(p.price).toFixed(2)}</td>
      <td><strong style="font-size:15px; color:#C62828;">${p.stock}</strong></td>
      <td><span class="badge badge-danger">Sii Dhamaanaya</span></td>
      <td><button class="btn btn-primary btn-sm" onclick="adjustStock(${p.id}, 10)">+10 Buuxi</button></td>
    </tr>
  `).join('');
}

async function adjustStock(productId, amount) {
  const p = appState.products.find(item => item.id === productId);
  if (!p) return;
  p.stock += amount;

  if (isBackendConnected) {
    await fetch(`${API_URL}/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
  } else {
    saveLocalState();
  }

  showToast(`Kaydka ${p.name} waxaa lagu daray +${amount}`, "success");
  refreshAllUI();
}

function promptCustomStock(productId) {
  const p = appState.products.find(item => item.id === productId);
  if (!p) return;
  const val = prompt(`Geli tirada cusub ee kaydka (${p.name}):`, p.stock);
  if (val !== null && !isNaN(val) && val !== '') {
    p.stock = Math.max(0, parseInt(val, 10));
    saveLocalState();
    refreshAllUI();
    showToast(`Kaydka waa la cusbooneysiiyey!`, "success");
  }
}

function quickRestock(productId) {
  adjustStock(productId, 10);
}

// ==========================================
// 9. VIEW RENDERING: CUSTOMERS
// ==========================================
function renderCustomers() {
  const tbody = document.getElementById('customersTbody');
  const search = document.getElementById('customerSearch')?.value.toLowerCase() || '';

  const filtered = appState.customers.filter(c => c.name.toLowerCase().includes(search) || c.phone.includes(search));

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.phone}</td>
      <td>${c.email || 'N/A'}</td>
      <td><strong style="color:var(--pink-primary);">${appState.settings.currency}${(c.totalSpent || 0).toFixed(2)}</strong></td>
      <td>${c.address || 'Muqdisho'}</td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-secondary btn-sm" onclick="openCustomerModal(${c.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteCustomer(${c.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterCustomers() {
  renderCustomers();
}

function populateCustomerSelects() {
  const select = document.getElementById('posCustomer');
  if (!select) return;
  select.innerHTML = `
    <option value="Macaamil Caadi ah">Macaamil Caadi ah (Walk-in)</option>
    ${appState.customers.map(c => `<option value="${c.name}">${c.name} (${c.phone})</option>`).join('')}
  `;
}

// ==========================================
// 10. VIEW RENDERING: REPORTS
// ==========================================
function renderReports() {
  const totalRev = appState.sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalInv = appState.products.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock)), 0);

  let totalItemsSold = 0;
  const productSalesMap = {};
  const categorySalesMap = {};

  appState.sales.forEach(sale => {
    if (sale.items) {
      sale.items.forEach(item => {
        totalItemsSold += item.qty;
        productSalesMap[item.name] = (productSalesMap[item.name] || 0) + item.qty;
      });
    }
  });

  document.getElementById('repTotalRevenue').innerText = `${appState.settings.currency}${totalRev.toFixed(2)}`;
  document.getElementById('repTotalInvoices').innerText = appState.sales.length;
  document.getElementById('repTotalItemsSold').innerText = `${totalItemsSold} xabbo`;
  document.getElementById('repInventoryValue').innerText = `${appState.settings.currency}${totalInv.toFixed(2)}`;

  // Top Selling Products Table
  const topTbody = document.getElementById('topSellingTbody');
  const sortedProds = Object.keys(productSalesMap)
    .map(name => {
      const p = appState.products.find(prod => prod.name.startsWith(name) || name.startsWith(prod.name));
      const qty = productSalesMap[name];
      const revenue = p ? p.price * qty : 0;
      return { name, category: p ? p.category : 'General', qty, revenue };
    })
    .sort((a, b) => b.qty - a.qty);

  if (sortedProds.length === 0) {
    topTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px; color:#888;">Xog iib ma jirto.</td></tr>`;
  } else {
    topTbody.innerHTML = sortedProds.map(item => `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td><span class="badge badge-pink">${item.category}</span></td>
        <td><strong style="color:#2E7D32;">${item.qty} xabbo</strong></td>
        <td>${appState.settings.currency}${item.revenue.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  // Category Breakdown Bars
  const catBreakdown = document.getElementById('categorySalesBreakdown');
  const categories = ['Cakes', 'Donuts', 'Cupcakes', 'Bread', 'Cookies', 'Other Desserts'];
  catBreakdown.innerHTML = categories.map(cat => {
    const prodsInCat = appState.products.filter(p => p.category === cat);
    const stock = prodsInCat.reduce((sum, p) => sum + p.stock, 0);
    const percent = Math.min(100, Math.round((stock / 150) * 100));

    return `
      <div class="breakdown-row">
        <div class="breakdown-info">
          <span>${cat}</span>
          <span>${stock} xabbo kayd ah</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 11. SALES HISTORY & RECEIPT PRINTING
// ==========================================
function renderSalesHistory() {
  const tbody = document.getElementById('salesHistoryTbody');
  const search = document.getElementById('salesSearch')?.value.toLowerCase() || '';

  const filtered = appState.sales.filter(s => s.id.toLowerCase().includes(search) || s.customer.toLowerCase().includes(search));

  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td><strong>#${s.id}</strong></td>
      <td>${s.date}</td>
      <td>${s.customer}</td>
      <td><span class="badge badge-brown">${s.paymentMethod || 'Kaash'}</span></td>
      <td>${s.items ? s.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Alaab'}</td>
      <td><strong style="color:var(--pink-primary);">${appState.settings.currency}${Number(s.total).toFixed(2)}</strong></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="viewReceipt('${s.id}')"><i class="fa-solid fa-receipt"></i> Rasiidh</button>
      </td>
    </tr>
  `).join('');
}

function filterSalesHistory() {
  renderSalesHistory();
}

function viewReceipt(invoiceId) {
  const sale = appState.sales.find(s => s.id === invoiceId);
  if (!sale) return;

  document.getElementById('rcptBakeryName').innerText = appState.settings.bakeryName;
  document.getElementById('rcptBakeryPhone').innerText = `Tel: ${appState.settings.phone}`;
  document.getElementById('rcptInvoiceId').innerText = `#${sale.id}`;
  document.getElementById('rcptDate').innerText = sale.date;
  document.getElementById('rcptCustomer').innerText = sale.customer;
  document.getElementById('rcptPaymentMethod').innerText = sale.paymentMethod || 'Kaash';
  document.getElementById('rcptTotalAmount').innerText = `${appState.settings.currency}${Number(sale.total).toFixed(2)}`;

  const tbody = document.getElementById('rcptItemsTbody');
  tbody.innerHTML = (sale.items || []).map(i => `
    <tr>
      <td>${i.name}</td>
      <td align="center">${i.qty}</td>
      <td align="right">${appState.settings.currency}${i.price.toFixed(2)}</td>
      <td align="right">${appState.settings.currency}${i.subtotal.toFixed(2)}</td>
    </tr>
  `).join('');

  openModal('receiptModal');
}

function printReceipt() {
  const printContents = document.getElementById('receiptPrintArea').innerHTML;
  const originalContents = document.body.innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload();
}

// ==========================================
// 12. CRUD MODALS (PRODUCT & CUSTOMER)
// ==========================================
function openProductModal(productId = null) {
  const form = document.getElementById('productForm');
  form.reset();

  if (productId) {
    const p = appState.products.find(item => item.id === productId);
    if (!p) return;
    document.getElementById('productModalTitle').innerText = "Wax Ka Beddel Alaabta";
    document.getElementById('prodEditId').value = p.id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodStock').value = p.stock;
    document.getElementById('prodImage').value = p.image;
    document.getElementById('prodDescription').value = p.description || '';
  } else {
    document.getElementById('productModalTitle').innerText = "Kudar Alaab Cusub";
    document.getElementById('prodEditId').value = '';
    setSampleImg('cake');
  }

  openModal('productModal');
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('prodEditId').value;
  const productData = {
    name: document.getElementById('prodName').value,
    category: document.getElementById('prodCategory').value,
    price: parseFloat(document.getElementById('prodPrice').value),
    stock: parseInt(document.getElementById('prodStock').value, 10),
    image: document.getElementById('prodImage').value,
    description: document.getElementById('prodDescription').value
  };

  if (editId) {
    const id = parseInt(editId, 10);
    const idx = appState.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      appState.products[idx] = { id, ...productData };
      if (isBackendConnected) {
        await fetch(`${API_URL}/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appState.products[idx])
        });
      }
    }
    showToast("Alaabta waa la cusbooneysiiyey!", "success");
  } else {
    const newId = Date.now();
    const newProd = { id: newId, ...productData };
    appState.products.unshift(newProd);

    if (isBackendConnected) {
      await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
    }
    showToast("Alaab cusub ayaa lagu daray!", "success");
  }

  saveLocalState();
  closeModal('productModal');
  refreshAllUI();
}

async function deleteProduct(productId) {
  if (confirm("Ma hubtaa inaad tirtirto alaabtan?")) {
    appState.products = appState.products.filter(p => p.id !== productId);
    if (isBackendConnected) {
      await fetch(`${API_URL}/products/${productId}`, { method: 'DELETE' });
    }
    saveLocalState();
    refreshAllUI();
    showToast("Alaabta waa la tirtiray!", "info");
  }
}

function openCustomerModal(customerId = null) {
  const form = document.getElementById('customerForm');
  form.reset();

  if (customerId) {
    const c = appState.customers.find(item => item.id === customerId);
    if (!c) return;
    document.getElementById('customerModalTitle').innerText = "Wax Ka Beddel Macaamilka";
    document.getElementById('custEditId').value = c.id;
    document.getElementById('custName').value = c.name;
    document.getElementById('custPhone').value = c.phone;
    document.getElementById('custEmail').value = c.email || '';
    document.getElementById('custAddress').value = c.address || '';
  } else {
    document.getElementById('customerModalTitle').innerText = "Diiwaangeli Macaamil Cusub";
    document.getElementById('custEditId').value = '';
  }

  openModal('customerModal');
}

async function handleCustomerSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('custEditId').value;
  const custData = {
    name: document.getElementById('custName').value,
    phone: document.getElementById('custPhone').value,
    email: document.getElementById('custEmail').value,
    address: document.getElementById('custAddress').value
  };

  if (editId) {
    const id = parseInt(editId, 10);
    const idx = appState.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      appState.customers[idx] = { ...appState.customers[idx], ...custData };
      if (isBackendConnected) {
        await fetch(`${API_URL}/customers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appState.customers[idx])
        });
      }
    }
    showToast("Xogta macaamilka waa la beddelay!", "success");
  } else {
    const newCust = { id: Date.now(), ...custData, totalSpent: 0 };
    appState.customers.push(newCust);
    if (isBackendConnected) {
      await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust)
      });
    }
    showToast("Macaamil cusub ayaa la diiwaangeliyay!", "success");
  }

  saveLocalState();
  closeModal('customerModal');
  refreshAllUI();
}

async function deleteCustomer(customerId) {
  if (confirm("Ma hubtaa inaad tirtirto macaamilkan?")) {
    appState.customers = appState.customers.filter(c => c.id !== customerId);
    if (isBackendConnected) {
      await fetch(`${API_URL}/customers/${customerId}`, { method: 'DELETE' });
    }
    saveLocalState();
    refreshAllUI();
    showToast("Macaamilka waa la tirtiray!", "info");
  }
}

// Quick Sample Image URLs for Add Product
function setSampleImg(type) {
  const images = {
    cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    bday: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80",
    donut: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=600&auto=format&fit=crop&q=80",
    cupcake: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&auto=format&fit=crop&q=80",
    bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    cookie: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80"
  };
  const imgInput = document.getElementById('prodImage');
  if (imgInput && images[type]) {
    imgInput.value = images[type];
  }
}

// ==========================================
// 13. SETTINGS & UTILITIES
// ==========================================
function saveSettings(e) {
  e.preventDefault();
  appState.settings.bakeryName = document.getElementById('settingBakeryName').value;
  appState.settings.currency = document.getElementById('settingCurrency').value;
  appState.settings.lowStockThreshold = parseInt(document.getElementById('settingLowStock').value, 10);
  appState.settings.phone = document.getElementById('settingPhone').value;

  saveLocalState();
  refreshAllUI();
  showToast("Dejinta nidaamka waa la keydiyey!", "success");
}

function resetToSampleData() {
  if (confirm("Tani waxay dib u buuxinaysaa dhammaan alaabtii, iibkii iyo macaamiishii tusaalaha ahayd. Ma doonaysaa inaad sii waddo?")) {
    appState.products = [...SAMPLE_PRODUCTS];
    appState.customers = [...SAMPLE_CUSTOMERS];
    appState.sales = [...SAMPLE_SALES];
    saveLocalState();
    refreshAllUI();
    showToast("Xogtii tusaalaha ahayd waa la soo celiyay!", "info");
  }
}

function openSaleModal() {
  navigateToView('sales');
  switchSalesTab('pos');
}

function openModal(id) {
  document.getElementById(id).classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

function setupEventListeners() {
  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('show');
    }
  });

  // Radio button active pill state for POS
  document.querySelectorAll('.pay-option').forEach(label => {
    label.addEventListener('click', () => {
      document.querySelectorAll('.pay-option').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
    });
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}