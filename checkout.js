/* ============================================================
   BURGER TOWN — Checkout Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ========== Element refs ========== */
  const summaryItems   = document.getElementById('summaryItems');
  const summaryCount   = document.getElementById('summaryCount');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryDelivery = document.getElementById('summaryDelivery');
  const summaryTotal   = document.getElementById('summaryTotal');
  const summaryPricing = document.getElementById('summaryPricing');
  const summaryEmpty   = document.getElementById('summaryEmpty');
  const payBtn         = document.getElementById('payBtn');
  const payBtnText     = document.getElementById('payBtnText');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmOrderId = document.getElementById('confirmOrderId');

  let deliveryType  = 'pickup';
  let paymentMethod = 'paystack';

  /* ========== Render order summary ========== */
  function renderSummary() {
    const items = BurgerCart.getItems();
    const count = BurgerCart.getCount();
    const subtotal = BurgerCart.getSubtotal();
    const fee = BurgerCart.getDeliveryFee(deliveryType);
    const total = subtotal + fee;

    summaryCount.textContent = count;

    if (items.length === 0) {
      summaryItems.innerHTML = '';
      summaryPricing.style.display = 'none';
      payBtn.style.display = 'none';
      summaryEmpty.style.display = 'block';
      return;
    }

    summaryPricing.style.display = 'block';
    payBtn.style.display = 'flex';
    summaryEmpty.style.display = 'none';

    summaryItems.innerHTML = items.map(item => `
      <div class="summary-item" data-item-id="${item.id}">
        <div class="summary-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="summary-item-info">
          <div class="summary-item-name">${item.name}</div>
          <div class="summary-item-qty">Qty: ${item.quantity} × ${BurgerCart.formatPrice(item.price)}</div>
        </div>
        <div class="summary-item-price">${BurgerCart.formatPrice(item.price * item.quantity)}</div>
        <button class="summary-item-remove" type="button" title="Remove item" aria-label="Remove ${item.name}">
          <i class="ri-close-line"></i>
        </button>
      </div>
    `).join('');

    // Add event listeners to remove buttons
    document.querySelectorAll('.summary-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const itemId = btn.closest('.summary-item').dataset.itemId;
        BurgerCart.removeItem(itemId);
        renderSummary();
      });
    });

    summarySubtotal.textContent = BurgerCart.formatPrice(subtotal);

    if (deliveryType === 'pickup') {
      summaryDelivery.innerHTML = '<span class="free-tag">Pickup</span>';
    } else if (fee === 0) {
      summaryDelivery.innerHTML = '<span class="free-tag">FREE</span>';
    } else {
      summaryDelivery.textContent = BurgerCart.formatPrice(fee);
    }

    summaryTotal.textContent = BurgerCart.formatPrice(total);
    payBtnText.textContent = `Pay ${BurgerCart.formatPrice(total)}`;
  }

  renderSummary();

  /* ========== Delivery type toggle ========== */
  const deliveryOptions = document.querySelectorAll('.delivery-option');
  const deliveryAddress = document.getElementById('deliveryAddress');

  deliveryOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      deliveryOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      deliveryType = opt.dataset.type;

      if (deliveryType === 'delivery') {
        deliveryAddress.classList.add('show');
      } else {
        deliveryAddress.classList.remove('show');
      }

      renderSummary();
    });
  });

  /* ========== Payment method toggle ========== */
  const paymentMethods = document.querySelectorAll('.payment-method');

  paymentMethods.forEach(method => {
    method.addEventListener('click', () => {
      paymentMethods.forEach(m => m.classList.remove('active'));
      method.classList.add('active');
      paymentMethod = method.dataset.method;
    });
  });

  /* ========== Form validation ========== */
  function validateForm() {
    let valid = true;

    const name  = document.getElementById('customerName');
    const phone = document.getElementById('customerPhone');
    const email = document.getElementById('customerEmail');
    const addr  = document.getElementById('customerAddress');

    // Reset
    [name, phone, email, addr].forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));

    if (!name.value.trim()) {
      name.classList.add('error');
      document.getElementById('nameError').classList.add('show');
      valid = false;
    }

    if (!phone.value.trim() || phone.value.replace(/\D/g, '').length < 10) {
      phone.classList.add('error');
      document.getElementById('phoneError').classList.add('show');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value)) {
      email.classList.add('error');
      document.getElementById('emailError').classList.add('show');
      valid = false;
    }

    if (deliveryType === 'delivery' && !addr.value.trim()) {
      addr.classList.add('error');
      document.getElementById('addressError').classList.add('show');
      valid = false;
    }

    return valid;
  }

  /* ========== Collect customer data ========== */
  function getCustomerData() {
    return {
      name:     document.getElementById('customerName').value.trim(),
      phone:    document.getElementById('customerPhone').value.trim(),
      email:    document.getElementById('customerEmail').value.trim(),
      address:  document.getElementById('customerAddress').value.trim(),
      city:     document.getElementById('customerCity').value.trim(),
      landmark: document.getElementById('customerLandmark').value.trim(),
      notes:    document.getElementById('customerNotes').value.trim()
    };
  }

  /* ========== Save order after verified payment ========== */
  async function saveVerifiedOrder(paymentInfo) {
    const customer = getCustomerData();
    const items = BurgerCart.getItems();
    const subtotal = BurgerCart.getSubtotal();
    const fee = BurgerCart.getDeliveryFee(deliveryType);
    const total = subtotal + fee;
    const orderId = BurgerCart.generateOrderId();

    const order = {
      id:           orderId,
      items:        items,
      subtotal:     subtotal,
      deliveryFee:  fee,
      total:        total,
      deliveryType: deliveryType,
      customer:     customer,
      payment: {
        method:       paymentMethod,
        reference:    paymentInfo.reference,
        status:       'verified',
        verifiedAt:   new Date().toISOString()
      },
      status:    'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to verified orders
    BurgerCart.saveVerifiedOrder(order);
    BurgerCart.clear();

    // Show confirmation
    if (confirmOrderId) {
      confirmOrderId.textContent = orderId;
    }
    if (confirmOverlay) {
      confirmOverlay.classList.add('show');
    }

    // Update step indicator
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    if (step2) {
      step2.classList.remove('active');
      step2.classList.add('completed');
    }
    if (step3) {
      step3.classList.add('active');
      step3.classList.add('completed');
    }

    // Redirect to orders page after 3 seconds
    setTimeout(() => {
      window.location.href = 'orders.html?orderid=' + orderId;
    }, 3000);

    return order;
  }

  /* ========== Paystack Payment ========== */
  function payWithPaystack() {
    const customer = getCustomerData();
    const total = BurgerCart.getTotal(deliveryType);
    const ref = BurgerCart.generatePaymentRef();

    // Check if Paystack SDK is available
    if (typeof PaystackPop !== 'undefined') {
      try {
        const handler = PaystackPop.setup({
          key: 'pk_test_your_paystack_public_key_here',
          email: customer.email,
          amount: total * 100,
          currency: 'NGN',
          ref: ref,
          metadata: {
            custom_fields: [
              { display_name: "Customer Name", variable_name: "customer_name", value: customer.name },
              { display_name: "Phone", variable_name: "phone", value: customer.phone },
              { display_name: "Address", variable_name: "address", value: customer.address || 'Pickup' }
            ]
          },
          callback: async function(response) {
            // Verify payment
            await verifyPaystackPayment(response.reference);
          },
          onClose: function() {
            setLoading(false);
            showNotification('Payment cancelled', 'error');
          }
        });
        handler.openIframe();
      } catch(e) {
        console.error('Paystack error:', e);
        simulatePaymentFlow(ref, 'paystack');
      }
    } else {
      simulatePaymentFlow(ref, 'paystack');
    }
  }

  /* ========== Flutterwave Payment ========== */
  function payWithFlutterwave() {
    const customer = getCustomerData();
    const total = BurgerCart.getTotal(deliveryType);
    const ref = BurgerCart.generatePaymentRef();

    if (typeof FlutterwaveCheckout !== 'undefined') {
      try {
        FlutterwaveCheckout({
          public_key: 'FLWPUBK_TEST-your_flutterwave_public_key_here',
          tx_ref: ref,
          amount: total,
          currency: 'NGN',
          payment_options: 'card,mobilemoney,ussd,banktransfer',
          customer: {
            email: customer.email,
            phone_number: customer.phone,
            name: customer.name,
          },
          customizations: {
            title: 'Burger Town',
            description: 'Payment for your Burger Town order',
            logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&q=80',
          },
          callback: async function(data) {
            if (data.status === 'successful' || data.status === 'completed') {
              await verifyFlutterwavePayment(data.transaction_id || ref);
            } else {
              setLoading(false);
              showNotification('Payment unsuccessful', 'error');
            }
          },
          onclose: function() {
            setLoading(false);
          }
        });
      } catch(e) {
        console.error('Flutterwave error:', e);
        simulatePaymentFlow(ref, 'flutterwave');
      }
    } else {
      simulatePaymentFlow(ref, 'flutterwave');
    }
  }

  /* ========== Verify Paystack Payment ========== */
  async function verifyPaystackPayment(reference) {
    try {
      // In production, verify with your backend
      // const response = await fetch('/api/verify-paystack', { method: 'POST', body: JSON.stringify({ reference }) });
      
      // For demo: use simulated verification
      const result = await BurgerCart.simulatePaymentVerification(reference, 'paystack');
      
      if (result.verified) {
        setLoading(false);
        await saveVerifiedOrder(result);
      } else {
        setLoading(false);
        showNotification('Payment verification failed', 'error');
      }
    } catch(e) {
      console.error('Verification error:', e);
      setLoading(false);
      showNotification('Verification error: ' + e.message, 'error');
    }
  }

  /* ========== Verify Flutterwave Payment ========== */
  async function verifyFlutterwavePayment(transactionId) {
    try {
      // In production, verify with your backend
      // const response = await fetch('/api/verify-flutterwave', { method: 'POST', body: JSON.stringify({ transactionId }) });
      
      // For demo: use simulated verification
      const result = await BurgerCart.simulatePaymentVerification(transactionId, 'flutterwave');
      
      if (result.verified) {
        setLoading(false);
        await saveVerifiedOrder(result);
      } else {
        setLoading(false);
        showNotification('Payment verification failed', 'error');
      }
    } catch(e) {
      console.error('Verification error:', e);
      setLoading(false);
      showNotification('Verification error: ' + e.message, 'error');
    }
  }

  /* ========== Simulate Payment Flow for Demo ========== */
  async function simulatePaymentFlow(ref, method) {
    try {
      const result = await BurgerCart.simulatePaymentVerification(ref, method);
      setLoading(false);
      if (result.verified) {
        await saveVerifiedOrder(result);
      } else {
        showNotification('Payment simulation failed', 'error');
      }
    } catch(e) {
      setLoading(false);
      showNotification('Error: ' + e.message, 'error');
    }
  }

  /* ========== Notification Helper ========== */
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<i class="ri-${type === 'error' ? 'error' : 'check'}-line"></i> ${message}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ff4757' : '#2ed573'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  }

  /* ========== Loading state ========== */
  function setLoading(loading) {
    if (loading) {
      payBtn.classList.add('loading');
      payBtn.disabled = true;
    } else {
      payBtn.classList.remove('loading');
      payBtn.disabled = false;
    }
  }

  /* ========== Pay button handler ========== */
  payBtn.addEventListener('click', () => {
    if (BurgerCart.getCount() === 0) {
      showNotification('Your cart is empty', 'error');
      return;
    }
    if (!validateForm()) {
      const firstError = document.querySelector('.form-group input.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    if (paymentMethod === 'paystack') {
      payWithPaystack();
    } else {
      payWithFlutterwave();
    }
  });

  /* ========== Clear errors on input ========== */
  document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) errorEl.classList.remove('show');
    });
  });

});
