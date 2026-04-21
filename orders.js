/* ============================================================
   BURGER TOWN — Order Execution Dashboard
   Displays verified paid orders with full customer information
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ========== DOM Elements ========== */
  const ordersGrid = document.getElementById('ordersGrid');
  const ordersEmpty = document.getElementById('ordersEmpty');
  const searchInput = document.getElementById('searchOrders');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const orderModal = document.getElementById('orderModal');
  const modalClose = document.getElementById('modalClose');
  const modalClose2 = document.getElementById('modalClose2');

  let currentFilter = 'all';
  let searchQuery = '';
  let verifiedOrders = [];

  /* ========== Load and display orders ========== */
  function loadOrders() {
    verifiedOrders = BurgerCart.getAllVerifiedOrders();
    renderOrders();
  }

  /* ========== Render orders based on filter and search ========== */
  function renderOrders() {
    let filtered = verifiedOrders;

    // Apply filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(order => order.status === currentFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.phone.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query)
      );
    }

    // Show empty state or render
    if (filtered.length === 0) {
      ordersGrid.innerHTML = '';
      ordersEmpty.style.display = 'block';
      return;
    }

    ordersEmpty.style.display = 'none';
    ordersGrid.innerHTML = filtered.map(order => createOrderCard(order)).join('');

    // Add click handlers
    document.querySelectorAll('.order-card').forEach(card => {
      card.addEventListener('click', () => {
        const orderId = card.dataset.orderId;
        showOrderDetail(orderId);
      });
    });
  }

  /* ========== Create order card HTML ========== */
  function createOrderCard(order) {
    const statusClass = `status-${order.status}`;
    const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const orderDate = new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="order-card ${statusClass}" data-order-id="${order.id}">
        <div class="card-header">
          <div class="card-title">
            <h4>${order.id}</h4>
            <span class="status-badge status-${order.status}">${order.status}</span>
          </div>
          <div class="card-date">${dateStr} ${timeStr}</div>
        </div>

        <div class="card-body">
          <div class="card-info-row">
            <span class="label">Customer:</span>
            <span class="value">${order.customer.name}</span>
          </div>
          <div class="card-info-row">
            <span class="label">Phone:</span>
            <span class="value">${order.customer.phone}</span>
          </div>
          <div class="card-info-row">
            <span class="label">Items:</span>
            <span class="value">${itemsCount} item${itemsCount !== 1 ? 's' : ''}</span>
          </div>
          <div class="card-info-row">
            <span class="label">Delivery:</span>
            <span class="value">${order.deliveryType === 'pickup' ? '🏪 Pickup' : '🛵 Delivery'}</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="card-total">
            <strong>${BurgerCart.formatPrice(order.total)}</strong>
          </div>
          <div class="card-payment">
            <i class="ri-shield-check-fill"></i> ${order.payment.method}
          </div>
        </div>

        <div class="card-hover-cta">
          <i class="ri-arrow-right-line"></i> View Details
        </div>
      </div>
    `;
  }

  /* ========== Show order detail modal ========== */
  function showOrderDetail(orderId) {
    const order = BurgerCart.getVerifiedOrderById(orderId);
    if (!order) return;

    // Populate order header
    document.getElementById('modalOrderId').textContent = `Order #${order.id}`;
    document.getElementById('modalOrderStatus').textContent = order.status;
    document.getElementById('modalOrderStatus').className = `order-status-badge status-${order.status}`;

    // Populate timestamp
    const orderDate = new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    document.getElementById('modalOrderTime').textContent = `Ordered on ${dateStr}`;

    // Populate customer info
    document.getElementById('modalCustomerName').textContent = order.customer.name;
    document.getElementById('modalCustomerEmail').textContent = order.customer.email;
    document.getElementById('modalCustomerPhone').textContent = order.customer.phone;

    // Populate delivery info
    document.getElementById('modalDeliveryType').textContent = order.deliveryType;

    if (order.deliveryType === 'delivery') {
      document.getElementById('addressRow').style.display = 'block';
      document.getElementById('landmarkRow').style.display = order.customer.landmark ? 'block' : 'none';
      document.getElementById('notesRow').style.display = order.customer.notes ? 'block' : 'none';

      document.getElementById('modalDeliveryAddress').textContent = order.customer.address || 'N/A';
      if (order.customer.landmark) {
        document.getElementById('modalDeliveryLandmark').textContent = order.customer.landmark;
      }
      if (order.customer.notes) {
        document.getElementById('modalDeliveryNotes').textContent = order.customer.notes;
      }
    } else {
      document.getElementById('addressRow').style.display = 'none';
      document.getElementById('landmarkRow').style.display = 'none';
      document.getElementById('notesRow').style.display = 'none';
    }

    // Populate items
    const itemsHtml = order.items.map(item => `
      <div class="item-line">
        <div class="item-details">
          <div class="item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            <div class="item-qty">Qty: ${item.quantity}</div>
          </div>
        </div>
        <div class="item-price">${BurgerCart.formatPrice(item.price * item.quantity)}</div>
      </div>
    `).join('');
    document.getElementById('modalItems').innerHTML = itemsHtml;

    // Populate payment info
    document.getElementById('modalPaymentMethod').textContent = order.payment.method;
    document.getElementById('modalPaymentStatus').textContent = 'Verified';
    document.getElementById('modalPaymentRef').textContent = order.payment.reference;

    // Populate pricing
    document.getElementById('modalSubtotal').textContent = BurgerCart.formatPrice(order.subtotal);
    const feeText = order.deliveryFee === 0 ? 'FREE' : BurgerCart.formatPrice(order.deliveryFee);
    document.getElementById('modalDeliveryFee').innerHTML = feeText;
    document.getElementById('modalTotal').textContent = BurgerCart.formatPrice(order.total);

    // Show modal
    orderModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  /* ========== Close modal ========== */
  function closeModal() {
    orderModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalClose2.addEventListener('click', closeModal);

  orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) closeModal();
  });

  /* ========== Filter buttons ========== */
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderOrders();
    });
  });

  /* ========== Search functionality ========== */
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderOrders();
  });

  /* ========== Check for specific order in URL ========== */
  function checkUrlOrder() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderid');
    if (orderId) {
      setTimeout(() => {
        showOrderDetail(orderId);
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 500);
    }
  }

  /* ========== Initialize ========== */
  loadOrders();
  checkUrlOrder();

  // Reload orders every 30 seconds to check for status updates
  setInterval(loadOrders, 30000);

});
