# QUICK START GUIDE - Burger Town Ordering System

## Installation & Configuration

### Step 1: Verify All Files Are In Place ✅
```
burger-town/
├── index.html ✓
├── checkout.html ✓
├── orders.html ✓
├── cart.js ✓
├── checkout.js ✓
├── orders.js ✓
├── script.js ✓
├── styles.css ✓
├── checkout.css ✓
├── orders.css ✓
└── README.md ✓
```

### Step 2: Test the System (Demo Mode - No Keys Needed)
1. Open `index.html` in a web browser
2. Add items to cart by clicking "Add to Cart"
3. Click checkout button at top
4. Fill in customer details
5. Select delivery method and payment method
6. Click "Pay" button
7. Wait for simulated payment (2 seconds)
8. See confirmation and click "View Orders Dashboard"
9. View your order in the orders page

**Note:** Currently, payments are simulated and will automatically succeed. Real payment processing requires API keys.

---

## Integration with Real Payment Gateways

### IMPORTANT: Choose ONE of the following:

## Option A: Using Paystack

### 1. Create Paystack Account
- Go to: https://paystack.com/signup
- Complete registration and email verification
- Add your business details
- Verify your phone number

### 2. Get Your API Keys
- Log in to Paystack Dashboard
- Go to: **Settings → API Keys & Webhooks**
- Copy your **Test Public Key** (starts with `pk_test_`)
- Save it somewhere - you'll use it next

### 3. Update checkout.js
Open `checkout.js` and find this line (around line 170):

```javascript
key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
```

Replace it with your Paystack test public key:
```javascript
key: 'pk_test_YOUR_KEY_HERE',  // Example: pk_test_bxwdjd8djd8d
```

### 4. Test Paystack Integration
Run through the checkout process again. This time, a real Paystack payment popup will appear.

**Test Card Numbers:**
- Visa: `4111 1111 1111 1111`
- Mastercard: `5399 8383 8383 8383`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `123456`

---

## Option B: Using Flutterwave

### 1. Create Flutterwave Account
- Go to: https://flutterwave.com/register
- Complete registration
- Verify your email
- Add business information

### 2. Get Your API Keys
- Log in to Flutterwave Dashboard
- Go to: **Settings → API**
- Copy your **Test Public Key** (starts with `FLWPUBK_TEST_`)
- Save it somewhere

### 3. Update checkout.js
Open `checkout.js` and find this line (around line 190):

```javascript
public_key: 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxx',
```

Replace it with your Flutterwave test public key:
```javascript
public_key: 'FLWPUBK_TEST-YOUR_KEY_HERE',  // Example: FLWPUBK_TEST_xxxxxxx
```

### 4. Test Flutterwave Integration
Run through the checkout process and select "Flutterwave". The payment popup will appear.

**Test Card Numbers:**
- Visa: `5531 8866 5725 4957`
- Mastercard: `5399 8383 8383 8383`
- Expiry: `09/32`
- CVV: `812`
- PIN: `1234`

---

## Using Both Payment Gateways Together

For complete demo, update both:

1. Update Paystack key in checkout.js (line ~170)
2. Update Flutterwave key in checkout.js (line ~190)
3. Customers can now choose either payment method at checkout

---

## How the System Works

### Order Flow:
```
Customer → Adds Items → Cart → Checkout → Payment → Verification → Orders Dashboard
```

### Data Storage:
- All orders are saved to browser's **localStorage**
- Persists even after refresh
- Verified orders appear in Orders Dashboard

### Verified Orders:
Once payment is verified, orders appear in:
- `localStorage.burgertown_verified_orders`
- Orders Dashboard (`orders.html`)

---

## Key Features Explanation

### 1. Cart System
- Add unlimited items
- Automatically combines duplicate items (increases quantity)
- Real-time subtotal calculation
- Delivery fee automation (₦500 for orders < ₦5,000)

### 2. Checkout Protection
- **Form Validation:** Ensures all required fields are present
- **Email Verification:** Checks valid email format
- **Phone Validation:** Ensures 10+ digit phone number
- **Address Required:** Only for delivery orders

### 3. Payment Verification
- **Simulation Mode:** No keys needed, auto-succeeds after 2s
- **Real Mode:** Connects to Paystack/Flutterwave APIs
- **Status Tracking:** Verified payments marked as "verified"

### 4. Order Management
- **Search:** Find by Order ID, Name, Phone, Email
- **Filter:** By status (Pending, Processing, Completed)
- **Details:** Full customer info, items, payment details
- **Refresh:** Auto-checks every 30 seconds for updates

---

## Troubleshooting

### Payment Modal Doesn't Appear
**Solution:** 
1. Check API key is correctly entered
2. Check browser console (F12) for errors
3. Ensure internet connection is active

### Orders Not Saving
**Solution:**
1. Check browser localStorage is enabled
2. Open DevTools → Application → localStorage
3. Look for `burgertown_verified_orders` entry

### Cart Empties After Payment
**This is normal!** The cart clears after successful payment and order is moved to verified orders.

---

## Moving to Production

### Before Going Live:

1. **Get Live API Keys**
   - Upgrade Paystack account to Live
   - Upgrade Flutterwave account to Live
   - Get live public and secret keys

2. **Update checkout.js**
   - Replace test keys with live keys
   - Change from `pk_test_` to `pk_live_`
   - Change from `FLWPUBK_TEST_` to `FLWPUBK_`

3. **Implement Backend Verification** (IMPORTANT!)
   ```javascript
   // Create these endpoints on your server:
   POST /api/verify-paystack
   POST /api/verify-flutterwave
   ```

4. **Enable Webhooks**
   - Set up webhook URLs in both Paystack and Flutterwave
   - Verify payment status from server-side
   - Never trust client-side verification alone

5. **Database Setup**
   - Replace localStorage with database
   - Store verified orders in your database
   - Implement admin order management interface

6. **Security**
   - Use HTTPS/SSL certificate
   - Store secret keys as environment variables
   - Never expose secret keys in client code
   - Implement proper authentication for admin

---

## Example Backend Verification (Node.js/Express)

```javascript
// Install: npm install axios
const axios = require('axios');

// Paystack Verification
app.post('/api/verify-paystack', async (req, res) => {
  const { reference } = req.body;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );
    
    if (response.data.data.status === 'success') {
      // Payment verified - save order to database
      res.json({ verified: true, data: response.data.data });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Flutterwave Verification
app.post('/api/verify-flutterwave', async (req, res) => {
  const { transactionId } = req.body;
  try {
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );
    
    if (response.data.status === 'success') {
      // Payment verified - save order to database
      res.json({ verified: true, data: response.data.data });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then uncomment in `checkout.js` to use real verification instead of simulation.

---

## Contact & Support

- **Paystack Support:** https://support.paystack.com
- **Flutterwave Support:** https://support.flutterwave.com
- **System Documentation:** See README.md

---

## Status Checklist

- [ ] Downloaded all files
- [ ] Tested system in demo mode
- [ ] Created Paystack account (if using)
- [ ] Created Flutterwave account (if using)
- [ ] Updated API keys in checkout.js
- [ ] Tested payment flow with test cards
- [ ] Verified orders appear in dashboard
- [ ] Customized for your business
- [ ] Ready for production!

**Remember:** Start with test/demo keys first. Only switch to live keys after thorough testing!

---

**Last Updated:** April 20, 2026
**System Version:** 1.0 Complete
