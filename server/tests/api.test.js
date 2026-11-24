const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createApp } = require('../src/app');
const { db } = require('../src/config/db');

let server;
let baseUrl;
let adminToken = '';

async function apiRequest(method, path, body = null, token = '') {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { status: res.status, data };
}

test.before(async () => {
  db.resetForTests();
  const app = createApp();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('1. Catalog returns all 8 signature categories, teams, tags, and seeded figures', async () => {
  const { status, data } = await apiRequest('GET', '/api/catalog-meta');
  assert.equal(status, 200);
  const categoryNames = data.categories.map((c) => c.name);
  for (const expected of ['Marvel', 'DC', 'Fondjoy', 'CT Toys', 'ZD Toys', 'Anime', 'Mafex', 'Gaming Figures']) {
    assert.ok(categoryNames.includes(expected), `Missing category: ${expected}`);
  }
  assert.ok(data.teams.length >= 8);
  assert.ok(data.tags.length >= 7);

  const figRes = await apiRequest('GET', '/api/figures?category=mafex');
  assert.equal(figRes.status, 200);
  assert.ok(figRes.data.figures.length >= 2);
  assert.equal(figRes.data.figures[0].category_slug, 'mafex');
});

test('2. Guest Checkout works without registration and verifies Razorpay online payment', async () => {
  const checkoutRes = await apiRequest('POST', '/api/orders/checkout', {
    full_name: 'Vikram Guest Buyer',
    email: 'vikram.guest@example.com',
    phone: '+91 9811122233',
    address_line1: '101 Vijay Nagar',
    city: 'Indore',
    state: 'Madhya Pradesh',
    postal_code: '452010',
    packaging_grade: 'collector',
    items: [{ figure_id: 1, quantity: 1 }]
  });

  assert.equal(checkoutRes.status, 201);
  assert.equal(checkoutRes.data.is_guest_order, true);
  assert.equal(checkoutRes.data.order.user_id, null);
  assert.equal(checkoutRes.data.order.payment_status, 'pending');

  const orderNum = checkoutRes.data.order.order_number;

  // Verify online payment
  const verifyRes = await apiRequest('POST', `/api/orders/${orderNum}/verify-payment`, {
    razorpay_order_id: checkoutRes.data.order.gateway_order_id,
    razorpay_payment_id: 'pay_test_guest_001',
    sandbox_approved: true
  });
  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.data.order.payment_status, 'paid');
  assert.equal(verifyRes.data.order.order_status, 'confirmed');

  // Track order as guest without login
  const trackRes = await apiRequest('POST', '/api/orders/track', {
    order_number: orderNum,
    email: 'vikram.guest@example.com'
  });
  assert.equal(trackRes.status, 200);
  assert.equal(trackRes.data.order.order_number, orderNum);
});

test('3. Admin Login and Custom Admin CRUD for Categories, Tags, Teams, and Figure Pricing', async () => {
  const loginRes = await apiRequest('POST', '/api/auth/login', {
    email: 'admin@figureverse.com',
    password: 'Admin@123'
  });
  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.data.user.role, 'admin');
  adminToken = loginRes.data.token;

  // Category CRUD: Add -> Update -> Remove
  const addCat = await apiRequest(
    'POST',
    '/api/admin/categories',
    { name: 'Hot Toys 1/6', tagline: 'Sixth Scale Movie Masterpiece', accent_color: '#eab308' },
    adminToken
  );
  assert.equal(addCat.status, 201);
  const catId = addCat.data.category.id;

  const updCat = await apiRequest(
    'PUT',
    `/api/admin/categories/${catId}`,
    { name: 'Hot Toys Masterpiece', tagline: 'Updated 1/6 Scale Line' },
    adminToken
  );
  assert.equal(updCat.status, 200);
  assert.equal(updCat.data.category.name, 'Hot Toys Masterpiece');

  const delCat = await apiRequest('DELETE', `/api/admin/categories/${catId}`, null, adminToken);
  assert.equal(delCat.status, 200);

  // Team CRUD: Add -> Update -> Remove
  const addTeam = await apiRequest(
    'POST',
    '/api/admin/teams',
    { name: 'Fantastic Four', franchise: 'Marvel First Family', badge_color: '#38bdf8' },
    adminToken
  );
  assert.equal(addTeam.status, 201);
  const teamId = addTeam.data.team.id;

  const updTeam = await apiRequest(
    'PUT',
    `/api/admin/teams/${teamId}`,
    { name: 'Fantastic Four Deluxe', franchise: 'Marvel Future Foundation' },
    adminToken
  );
  assert.equal(updTeam.status, 200);
  assert.equal(updTeam.data.team.name, 'Fantastic Four Deluxe');

  const delTeam = await apiRequest('DELETE', `/api/admin/teams/${teamId}`, null, adminToken);
  assert.equal(delTeam.status, 200);

  // Tag CRUD: Add -> Update -> Remove
  const addTag = await apiRequest(
    'POST',
    '/api/admin/tags',
    { name: 'Glow In The Dark', color: '#22c55e' },
    adminToken
  );
  assert.equal(addTag.status, 201);
  const tagId = addTag.data.tag.id;

  const updTag = await apiRequest(
    'PUT',
    `/api/admin/tags/${tagId}`,
    { name: 'UV Reactive Glow', color: '#16a34a' },
    adminToken
  );
  assert.equal(updTag.status, 200);
  assert.equal(updTag.data.tag.name, 'UV Reactive Glow');

  const delTag = await apiRequest('DELETE', `/api/admin/tags/${tagId}`, null, adminToken);
  assert.equal(delTag.status, 200);

  // Figure & Price CRUD: Add -> Quick Update Price -> Full Update -> Remove
  const addFig = await apiRequest(
    'POST',
    '/api/admin/figures',
    {
      title: 'MAFEX Daredevil Comic Ver.',
      character_name: 'Matt Murdock',
      category_id: 7,
      team_id: 1,
      tag_ids: [4, 5],
      price: 6999,
      original_price: 8499,
      stock: 10,
      description: 'Man Without Fear 1/12 collector figure.'
    },
    adminToken
  );
  assert.equal(addFig.status, 201);
  const figId = addFig.data.figure.id;

  const quickPrice = await apiRequest(
    'PATCH',
    `/api/admin/figures/${figId}/quick-update`,
    { price: 6499, original_price: 7999, stock: 15 },
    adminToken
  );
  assert.equal(quickPrice.status, 200);
  assert.equal(quickPrice.data.figure.price, 6499);
  assert.equal(quickPrice.data.figure.original_price, 7999);
  assert.equal(quickPrice.data.figure.stock, 15);

  const delFig = await apiRequest('DELETE', `/api/admin/figures/${figId}`, null, adminToken);
  assert.equal(delFig.status, 200);
});
