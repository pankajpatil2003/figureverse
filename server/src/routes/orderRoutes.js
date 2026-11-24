const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { db } = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

function getRazorpayConfig() {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_figureverse_demo';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'figureverse_razorpay_demo_secret';
  const isDemoMode =
    !process.env.RAZORPAY_KEY_ID ||
    key_id === 'rzp_test_figureverse_demo' ||
    key_id.includes('your_key');
  return { key_id, key_secret, isDemoMode };
}

// Guest OR Registered User Checkout
router.post('/checkout', optionalAuth, async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      address_line1,
      address_line2 = '',
      city,
      state,
      postal_code,
      country = 'India',
      packaging_grade = 'standard',
      items
    } = req.body || {};

    if (!full_name || !email || !phone || !address_line1 || !city || !state || !postal_code) {
      return res.status(400).json({ error: 'Please complete all required shipping and contact fields.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    let subtotal_amount = 0;
    const validatedItems = [];

    for (const cartItem of items) {
      const figureId = cartItem.figure_id || cartItem.id;
      const qty = Math.max(1, Number(cartItem.quantity || 1));
      const fig = await db.getFigureBySlugOrId(figureId);

      if (!fig || fig.is_active === false) {
        return res.status(400).json({ error: `Figure not available: ${cartItem.title || figureId}` });
      }
      if (fig.stock < qty) {
        return res.status(400).json({
          error: `Only ${fig.stock} unit(s) left for "${fig.title}".`
        });
      }

      const linePrice = Number(fig.price);
      subtotal_amount += linePrice * qty;
      validatedItems.push({
        figure_id: fig.id,
        figure_title: fig.title,
        figure_image_url: fig.image_url,
        category_name: fig.category_name,
        unit_price: linePrice,
        quantity: qty
      });
    }

    const packaging_fee = packaging_grade === 'collector' ? 199 : 0;
    const shipping_fee = subtotal_amount >= 1999 ? 0 : 149;
    const total_amount = subtotal_amount + packaging_fee + shipping_fee;
    const order_number = `FV-${Math.floor(100000 + Math.random() * 900000)}`;

    const { key_id, key_secret, isDemoMode } = getRazorpayConfig();
    let gateway_order_id = `order_sandbox_${Date.now()}`;

    if (!isDemoMode) {
      try {
        const instance = new Razorpay({ key_id, key_secret });
        const rzpOrder = await instance.orders.create({
          amount: Math.round(total_amount * 100),
          currency: 'INR',
          receipt: order_number
        });
        gateway_order_id = rzpOrder.id;
      } catch (_err) {
        gateway_order_id = `order_sandbox_${Date.now()}`;
      }
    }

    const order = await db.createOrder({
      order_number,
      user_id: req.user ? req.user.id : null, // NULL for Guest Checkout!
      full_name: String(full_name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      address_line1: String(address_line1).trim(),
      address_line2: String(address_line2).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      postal_code: String(postal_code).trim(),
      country: String(country).trim(),
      packaging_grade,
      packaging_fee,
      subtotal_amount,
      shipping_fee,
      total_amount,
      payment_status: 'pending',
      order_status: 'processing',
      payment_gateway: 'razorpay',
      gateway_order_id,
      items: validatedItems
    });

    return res.status(201).json({
      order,
      is_guest_order: !req.user,
      razorpay: {
        key_id,
        order_id: gateway_order_id,
        amount: Math.round(total_amount * 100),
        currency: 'INR',
        is_demo_mode: isDemoMode
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Checkout failed' });
  }
});

// Verify Razorpay Online Payment
router.post('/:orderNumber/verify-payment', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      sandbox_approved
    } = req.body || {};

    const order = await db.getOrderByNumber(orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const { key_secret, isDemoMode } = getRazorpayConfig();
    let paymentId = razorpay_payment_id || `pay_fv_${Date.now()}`;
    let signature = razorpay_signature || '';

    if (!isDemoMode && !sandbox_approved) {
      const expectedSig = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id || order.gateway_order_id}|${paymentId}`)
        .digest('hex');

      if (expectedSig !== signature) {
        return res.status(400).json({ error: 'Invalid payment signature verification.' });
      }
    } else {
      signature = crypto
        .createHmac('sha256', key_secret)
        .update(`${order.gateway_order_id}|${paymentId}`)
        .digest('hex');
    }

    const updatedOrder = await db.markOrderPaid(orderNumber, {
      gateway_payment_id: paymentId,
      gateway_signature: signature
    });

    return res.json({
      message: 'Payment verified and order confirmed!',
      order: updatedOrder
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
});

// Guest Order Tracker (Order Number + Email, no login required)
router.post('/track', async (req, res) => {
  try {
    const { order_number, email } = req.body || {};
    if (!order_number || !email) {
      return res.status(400).json({ error: 'Please enter both your Order Number and Email Address.' });
    }
    const order = await db.getOrderByNumber(order_number);
    if (!order || order.email.toLowerCase() !== String(email).trim().toLowerCase()) {
      return res.status(404).json({
        error: 'No matching order found for that Order Number and Email combination.'
      });
    }
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:orderNumber', async (req, res) => {
  try {
    const order = await db.getOrderByNumber(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
