const express = require('express');
const { db } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Protect all /api/admin/* endpoints with Admin JWT verification
router.use(requireAdmin);

// 1. Admin Dashboard Overview & KPIs
router.get('/dashboard', async (_req, res) => {
  try {
    const [figures, categories, teams, tags, orders] = await Promise.all([
      db.getFigures({ includeInactive: true }),
      db.getCategories(),
      db.getTeams(),
      db.getTags(),
      db.getAllOrders()
    ]);

    const paidOrders = orders.filter((o) => o.payment_status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const pendingOrdersCount = orders.filter((o) => o.order_status === 'processing' || o.payment_status === 'pending').length;
    const guestOrdersCount = orders.filter((o) => !o.user_id).length;
    const lowStockFigures = figures.filter((f) => f.stock <= 8);

    return res.json({
      stats: {
        total_revenue: totalRevenue,
        total_orders: orders.length,
        paid_orders: paidOrders.length,
        pending_orders: pendingOrdersCount,
        guest_orders: guestOrdersCount,
        total_figures: figures.length,
        total_categories: categories.length,
        total_teams: teams.length,
        total_tags: tags.length,
        low_stock_count: lowStockFigures.length
      },
      low_stock_figures: lowStockFigures.slice(0, 6),
      recent_orders: orders.slice(0, 8),
      categories
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Figures & Pricing CRUD
router.get('/figures', async (_req, res) => {
  try {
    const figures = await db.getFigures({ includeInactive: true });
    return res.json({ figures });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/figures', async (req, res) => {
  try {
    const { title, price } = req.body || {};
    if (!title || price === undefined || price === '') {
      return res.status(400).json({ error: 'Figure title and selling price are required.' });
    }
    const created = await db.createFigure(req.body);
    return res.status(201).json({ figure: created });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/figures/:id', async (req, res) => {
  try {
    const updated = await db.updateFigure(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Figure not found.' });
    }
    return res.json({ figure: updated });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Inline Quick-Edit for Price, Original MRP Price, Stock, Badge, or Featured flag
router.patch('/figures/:id/quick-update', async (req, res) => {
  try {
    const updated = await db.updateFigure(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Figure not found.' });
    }
    return res.json({ figure: updated });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/figures/:id', async (req, res) => {
  try {
    const deleted = await db.deleteFigure(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Figure not found.' });
    }
    return res.json({ deleted: true, id: Number(req.params.id) });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 3. Categories CRUD (Add, Update, Remove)
router.get('/categories', async (_req, res) => {
  try {
    const categories = await db.getCategories();
    return res.json({ categories });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    if (!req.body || !req.body.name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }
    const category = await db.createCategory(req.body);
    return res.status(201).json({ category });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await db.updateCategory(req.params.id, req.body);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    return res.json({ category });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const deleted = await db.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    return res.json({ deleted: true, id: Number(req.params.id) });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 4. Teams CRUD (Add, Update, Remove)
router.get('/teams', async (_req, res) => {
  try {
    const teams = await db.getTeams();
    return res.json({ teams });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/teams', async (req, res) => {
  try {
    if (!req.body || !req.body.name) {
      return res.status(400).json({ error: 'Team name is required.' });
    }
    const team = await db.createTeam(req.body);
    return res.status(201).json({ team });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/teams/:id', async (req, res) => {
  try {
    const team = await db.updateTeam(req.params.id, req.body);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }
    return res.json({ team });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/teams/:id', async (req, res) => {
  try {
    const deleted = await db.deleteTeam(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Team not found.' });
    }
    return res.json({ deleted: true, id: Number(req.params.id) });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 5. Tags CRUD (Add, Update, Remove)
router.get('/tags', async (_req, res) => {
  try {
    const tags = await db.getTags();
    return res.json({ tags });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/tags', async (req, res) => {
  try {
    if (!req.body || !req.body.name) {
      return res.status(400).json({ error: 'Tag name is required.' });
    }
    const tag = await db.createTag(req.body);
    return res.status(201).json({ tag });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/tags/:id', async (req, res) => {
  try {
    const tag = await db.updateTag(req.params.id, req.body);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found.' });
    }
    return res.json({ tag });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/tags/:id', async (req, res) => {
  try {
    const deleted = await db.deleteTag(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tag not found.' });
    }
    return res.json({ deleted: true, id: Number(req.params.id) });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 6. Orders & Fulfillment Management
router.get('/orders', async (_req, res) => {
  try {
    const orders = await db.getAllOrders();
    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/orders/:orderNumber/status', async (req, res) => {
  try {
    const { order_status, payment_status } = req.body || {};
    const updated = await db.updateOrderStatus(req.params.orderNumber, {
      order_status,
      payment_status
    });
    if (!updated) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.json({ order: updated });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
