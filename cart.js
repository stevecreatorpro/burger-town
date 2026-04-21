/* ============================================================
   BURGER TOWN — Cart & Orders Module (localStorage-based)
   Shared across: index.html, checkout.html, orders.html
   ============================================================ */

const BurgerCart = (() => {
  const CART_KEY = 'burgertown_cart';
  const ORDERS_KEY = 'burgertown_orders';
  const VERIFIED_ORDERS_KEY = 'burgertown_verified_orders';
  const listeners = [];

  /* ---------- Helpers ---------- */
  function generateId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function formatPrice(amount) {
    return '₦' + Number(amount).toLocaleString();
  }

  function generateOrderId() {
    const d = new Date();
    const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `BT-${date}-${rand}`;
  }

  function generatePaymentRef() {
    return 'BT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }

  /* ---------- Cart CRUD ---------- */
  function getItems() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  }

  function saveItems(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    notify();
  }

  function addItem(item) {
    const items = getItems();
    const id = item.id || generateId(item.name);
    const existing = items.find(i => i.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        id,
        name: item.name,
        price: Number(item.price),
        image: item.image || '',
        desc: item.desc || '',
        quantity: 1
      });
    }
    saveItems(items);
    return { items, isNew: !existing };
  }

  function removeItem(id) {
    const items = getItems().filter(i => i.id !== id);
    saveItems(items);
    return items;
  }

  function updateQty(id, qty) {
    if (qty <= 0) return removeItem(id);
    const items = getItems();
    const item = items.find(i => i.id === id);
    if (item) item.quantity = qty;
    saveItems(items);
    return items;
  }

  function clear() {
    localStorage.removeItem(CART_KEY);
    notify();
  }

  function getSubtotal() {
    return getItems().reduce((s, i) => s + i.price * i.quantity, 0);
  }

  function getCount() {
    return getItems().reduce((s, i) => s + i.quantity, 0);
  }

  /* ---------- Delivery fee logic ---------- */
  function getDeliveryFee(type) {
    if (type !== 'delivery') return 0;
    return getSubtotal() >= 5000 ? 0 : 500;
  }

  function getTotal(deliveryType) {
    return getSubtotal() + getDeliveryFee(deliveryType || 'pickup');
  }

  /* ---------- Orders ---------- */
  function getOrders() {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); }
    catch { return []; }
  }

  function saveOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return order;
  }

  function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
    return orders;
  }

  function deleteOrder(orderId) {
    const orders = getOrders().filter(o => o.id !== orderId);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return orders;
  }

  /* ---------- Verified Orders ---------- */
  function getVerifiedOrders() {
    try { return JSON.parse(localStorage.getItem(VERIFIED_ORDERS_KEY) || '[]'); }
    catch { return []; }
  }

  function saveVerifiedOrder(order) {
    const verified = getVerifiedOrders();
    verified.unshift({
      ...order,
      paymentStatus: 'verified',
      verifiedAt: new Date().toISOString()
    });
    localStorage.setItem(VERIFIED_ORDERS_KEY, JSON.stringify(verified));
    return order;
  }

  function getVerifiedOrderById(orderId) {
    return getVerifiedOrders().find(o => o.id === orderId);
  }

  function getAllVerifiedOrders() {
    return getVerifiedOrders();
  }

  /* ---------- Payment Simulation/Verification ---------- */
  function simulatePaymentVerification(paymentRef, method) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          reference: paymentRef,
          method: method,
          verified: true,
          timestamp: new Date().toISOString(),
          message: 'Payment verified successfully'
        });
      }, 1500);
    });
  }

  /* ---------- Observers ---------- */
  function onChange(fn) { listeners.push(fn); }
  function notify() { listeners.forEach(fn => fn(getItems())); }

  /* ---------- Public API ---------- */
  return {
    getItems, addItem, removeItem, updateQty, clear,
    getSubtotal, getCount, getDeliveryFee, getTotal, formatPrice,
    getOrders, saveOrder, updateOrderStatus, deleteOrder,
    getVerifiedOrders, saveVerifiedOrder, getVerifiedOrderById, getAllVerifiedOrders,
    generateOrderId, generatePaymentRef,
    simulatePaymentVerification,
    onChange
  };
})();
