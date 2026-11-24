const express = require('express');
const { db } = require('../config/db');

const router = express.Router();

router.get('/catalog-meta', async (_req, res) => {
  try {
    const [categories, teams, tags] = await Promise.all([
      db.getCategories(),
      db.getTeams(),
      db.getTags()
    ]);
    return res.json({
      categories,
      teams,
      tags,
      database_mode: db.getMode()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    const categories = await db.getCategories();
    return res.json({ categories });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/teams', async (_req, res) => {
  try {
    const teams = await db.getTeams();
    return res.json({ teams });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/tags', async (_req, res) => {
  try {
    const tags = await db.getTags();
    return res.json({ tags });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/figures', async (req, res) => {
  try {
    const {
      category,
      team,
      tag,
      badge,
      scale,
      featured,
      newArrival,
      minPrice,
      maxPrice,
      search,
      sort = 'popular'
    } = req.query;

    let figures = await db.getFigures({ includeInactive: false });

    if (category && category !== 'all') {
      const catSlug = String(category).toLowerCase();
      figures = figures.filter(
        (f) => f.category_slug === catSlug || String(f.category_id) === catSlug
      );
    }

    if (team && team !== 'all') {
      const teamSlug = String(team).toLowerCase();
      figures = figures.filter(
        (f) => f.team_slug === teamSlug || String(f.team_id) === teamSlug
      );
    }

    if (tag && tag !== 'all') {
      const tagSlug = String(tag).toLowerCase();
      figures = figures.filter(
        (f) =>
          Array.isArray(f.tags) &&
          f.tags.some((t) => t.slug === tagSlug || String(t.id) === tagSlug)
      );
    }

    if (badge && badge !== 'all') {
      figures = figures.filter((f) => f.badge === badge);
    }

    if (scale && scale !== 'all') {
      figures = figures.filter((f) => f.scale === scale);
    }

    if (featured === 'true') {
      figures = figures.filter((f) => f.is_featured);
    }

    if (newArrival === 'true') {
      figures = figures.filter((f) => f.is_new_arrival);
    }

    if (minPrice !== undefined && minPrice !== '') {
      figures = figures.filter((f) => f.price >= Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      figures = figures.filter((f) => f.price <= Number(maxPrice));
    }

    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      figures = figures.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.character_name.toLowerCase().includes(q) ||
          (f.franchise && f.franchise.toLowerCase().includes(q)) ||
          (f.category_name && f.category_name.toLowerCase().includes(q)) ||
          (f.team_name && f.team_name.toLowerCase().includes(q)) ||
          (f.manufacturer && f.manufacturer.toLowerCase().includes(q)) ||
          (f.sku && f.sku.toLowerCase().includes(q))
      );
    }

    if (sort === 'price_asc') {
      figures.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      figures.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      figures.sort((a, b) => b.id - a.id);
    } else if (sort === 'discount') {
      figures.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
    } else {
      figures.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.review_count - a.review_count);
    }

    return res.json({ figures, total: figures.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/figures/:slug', async (req, res) => {
  try {
    const figure = await db.getFigureBySlugOrId(req.params.slug);
    if (!figure || figure.is_active === false) {
      return res.status(404).json({ error: 'Figure not found' });
    }
    const allFigures = await db.getFigures({ includeInactive: false });
    const related = allFigures
      .filter(
        (f) =>
          f.id !== figure.id &&
          (f.category_id === figure.category_id || (figure.team_id && f.team_id === figure.team_id))
      )
      .slice(0, 4);

    return res.json({ figure, related });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
