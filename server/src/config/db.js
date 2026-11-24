const fs = require('fs');
const os = require('os');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const {
  INITIAL_CATEGORIES,
  INITIAL_TEAMS,
  INITIAL_TAGS,
  INITIAL_FIGURES
} = require('../seed/initialData');

// On Vercel serverless, /var/task is read-only; /tmp (os.tmpdir()) is writable
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'figureverse-data')
  : path.join(__dirname, '..', '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SCHEMA_FILE = path.join(__dirname, '..', '..', 'sql', 'schema.sql');

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

let usePostgres = false;
let pool = null;
let localState = null;
let initPromise = null;

function createDefaultState() {
  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
  const demoCustomerHash = bcrypt.hashSync('Customer@123', 10);

  return {
    users: [
      {
        id: 1,
        full_name: 'Figure Verse Admin',
        email: 'admin@figureverse.com',
        password_hash: adminPasswordHash,
        phone: '+91 9876543210',
        role: 'admin',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        full_name: 'Aarav Collector',
        email: 'collector@figureverse.com',
        password_hash: demoCustomerHash,
        phone: '+91 9123456780',
        role: 'customer',
        created_at: new Date().toISOString()
      }
    ],
    categories: JSON.parse(JSON.stringify(INITIAL_CATEGORIES)),
    teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
    tags: JSON.parse(JSON.stringify(INITIAL_TAGS)),
    figures: JSON.parse(JSON.stringify(INITIAL_FIGURES)).map((fig) => ({
      ...fig,
      created_at: new Date().toISOString()
    })),
    orders: [
      {
        id: 1,
        order_number: 'FV-100421',
        user_id: null,
        full_name: 'Rohan Sharma (Guest)',
        email: 'rohan.guest@example.com',
        phone: '+91 9826012345',
        address_line1: '42 MG Road, Palasia Square',
        address_line2: 'Near Treasure Island Mall',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postal_code: '452001',
        country: 'India',
        packaging_grade: 'collector',
        packaging_fee: 199,
        subtotal_amount: 7499,
        shipping_fee: 0,
        total_amount: 7698,
        payment_status: 'paid',
        order_status: 'confirmed',
        payment_gateway: 'razorpay',
        gateway_order_id: 'order_demo_100421',
        gateway_payment_id: 'pay_demo_998877',
        gateway_signature: 'verified_demo_signature',
        created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
        items: [
          {
            id: 1,
            order_id: 1,
            figure_id: 1,
            figure_title: 'MAFEX No.185 Spider-Man (Classic Comic Costume Ver.)',
            figure_image_url:
              'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=900&q=85',
            category_name: 'Mafex',
            unit_price: 7499,
            quantity: 1
          }
        ]
      }
    ]
  };
}

function saveLocalState() {
  if (!localState) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(localState, null, 2), 'utf8');
  } catch (_err) {
    // Allow in-memory state to continue if disk write is restricted
  }
}

function loadLocalState() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
      if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.figures)) {
        localState = parsed;
        return;
      }
    }
  } catch (_err) {
    // recreate state if corrupted or unreadable
  }
  localState = createDefaultState();
  saveLocalState();
}

function buildPostgresPoolConfig() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  if (connectionString) {
    const isLocal =
      connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    return {
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    };
  }
  const host = process.env.PGHOST || '127.0.0.1';
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  return {
    host,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'figure_verse_db',
    ssl:
      process.env.PGSSLMODE === 'require' || !isLocalHost
        ? { rejectUnauthorized: false }
        : false
  };
}

async function initDatabase() {
  const hasConnectionUrl = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  const flagEnabled = String(process.env.USE_POSTGRES || 'false').toLowerCase() === 'true';
  usePostgres = hasConnectionUrl || flagEnabled;

  if (usePostgres) {
    try {
      pool = new Pool(buildPostgresPoolConfig());
      await pool.query('SELECT 1');
      if (fs.existsSync(SCHEMA_FILE)) {
        const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
        await pool.query(schemaSql);
      }
      await seedPostgresIfEmpty();
      console.log('[DB] Connected to PostgreSQL database');
      return { mode: 'postgres' };
    } catch (err) {
      console.warn('[DB] PostgreSQL connection failed, falling back to local store:', err.message);
      usePostgres = false;
    }
  }
  loadLocalState();
  return { mode: 'local' };
}

async function ensureDatabase() {
  if (usePostgres && pool) return;
  if (!usePostgres && localState) return;
  if (!initPromise) {
    initPromise = initDatabase().finally(() => {
      initPromise = null;
    });
  }
  await initPromise;
}

async function seedPostgresIfEmpty() {
  const { rows: userRows } = await pool.query('SELECT COUNT(*)::int AS cnt FROM users');
  if (userRows[0].cnt === 0) {
    const adminHash = bcrypt.hashSync('Admin@123', 10);
    const customerHash = bcrypt.hashSync('Customer@123', 10);
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, 'admin'), ($5, $6, $7, $8, 'customer')`,
      [
        'Figure Verse Admin',
        'admin@figureverse.com',
        adminHash,
        '+91 9876543210',
        'Aarav Collector',
        'collector@figureverse.com',
        customerHash,
        '+91 9123456780'
      ]
    );
  }

  const { rows: catRows } = await pool.query('SELECT COUNT(*)::int AS cnt FROM categories');
  if (catRows[0].cnt === 0) {
    for (const c of INITIAL_CATEGORIES) {
      await pool.query(
        `INSERT INTO categories (name, slug, tagline, accent_color, banner_image_url, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [c.name, c.slug, c.tagline, c.accent_color, c.banner_image_url, c.display_order]
      );
    }
  }

  const { rows: teamRows } = await pool.query('SELECT COUNT(*)::int AS cnt FROM teams');
  if (teamRows[0].cnt === 0) {
    for (const t of INITIAL_TEAMS) {
      await pool.query(
        `INSERT INTO teams (name, slug, franchise, description, badge_color)
         VALUES ($1, $2, $3, $4, $5)`,
        [t.name, t.slug, t.franchise, t.description, t.badge_color]
      );
    }
  }

  const { rows: tagRows } = await pool.query('SELECT COUNT(*)::int AS cnt FROM tags');
  if (tagRows[0].cnt === 0) {
    for (const tg of INITIAL_TAGS) {
      await pool.query(
        `INSERT INTO tags (name, slug, color) VALUES ($1, $2, $3)`,
        [tg.name, tg.slug, tg.color]
      );
    }
  }

  const { rows: figRows } = await pool.query('SELECT COUNT(*)::int AS cnt FROM figures');
  if (figRows[0].cnt === 0) {
    for (const f of INITIAL_FIGURES) {
      await pool.query(
        `INSERT INTO figures (
          title, slug, sku, character_name, franchise, category_id, team_id, tag_ids,
          manufacturer, scale, height_cm, material, box_contents, description,
          price, original_price, stock, badge, rating, review_count,
          image_url, gallery_urls, is_featured, is_new_arrival, is_active
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8::jsonb,
          $9,$10,$11,$12,$13,$14,
          $15,$16,$17,$18,$19,$20,
          $21,$22::jsonb,$23,$24,$25
        )`,
        [
          f.title,
          f.slug,
          f.sku,
          f.character_name,
          f.franchise,
          f.category_id,
          f.team_id,
          JSON.stringify(f.tag_ids || []),
          f.manufacturer,
          f.scale,
          f.height_cm,
          f.material,
          f.box_contents,
          f.description,
          f.price,
          f.original_price,
          f.stock,
          f.badge,
          f.rating,
          f.review_count,
          f.image_url,
          JSON.stringify(f.gallery_urls || []),
          f.is_featured,
          f.is_new_arrival,
          f.is_active
        ]
      );
    }
  }
}

function hydrateFigure(fig, categories, teams, tags) {
  const category = categories.find((c) => Number(c.id) === Number(fig.category_id)) || null;
  const team = teams.find((t) => Number(t.id) === Number(fig.team_id)) || null;
  const tagIds = Array.isArray(fig.tag_ids) ? fig.tag_ids.map(Number) : [];
  const resolvedTags = tags.filter((tg) => tagIds.includes(Number(tg.id)));
  const price = Number(fig.price);
  const original_price = fig.original_price ? Number(fig.original_price) : null;
  const discount_percent =
    original_price && original_price > price
      ? Math.round(((original_price - price) / original_price) * 100)
      : 0;

  return {
    ...fig,
    id: Number(fig.id),
    category_id: fig.category_id ? Number(fig.category_id) : null,
    team_id: fig.team_id ? Number(fig.team_id) : null,
    tag_ids: tagIds,
    price,
    original_price,
    discount_percent,
    height_cm: Number(fig.height_cm || 16),
    stock: Number(fig.stock || 0),
    rating: Number(fig.rating || 4.8),
    review_count: Number(fig.review_count || 10),
    category_name: category ? category.name : 'Uncategorized',
    category_slug: category ? category.slug : 'uncategorized',
    category_color: category ? category.accent_color : '#e11d48',
    team_name: team ? team.name : null,
    team_slug: team ? team.slug : null,
    team_color: team ? team.badge_color : null,
    tags: resolvedTags
  };
}

const db = {
  resetForTests() {
    usePostgres = false;
    localState = createDefaultState();
    saveLocalState();
  },

  getMode() {
    return usePostgres ? 'postgresql' : 'postgresql-ready-local';
  },

  async getCategories() {
    if (usePostgres) {
      const { rows: cats } = await pool.query(
        'SELECT * FROM categories ORDER BY display_order ASC, id ASC'
      );
      const { rows: figs } = await pool.query(
        'SELECT category_id FROM figures WHERE is_active = TRUE'
      );
      return cats.map((c) => ({
        ...c,
        figure_count: figs.filter((f) => Number(f.category_id) === Number(c.id)).length
      }));
    }
    const cats = [...localState.categories].sort(
      (a, b) => (a.display_order || 1) - (b.display_order || 1) || a.id - b.id
    );
    return cats.map((c) => ({
      ...c,
      figure_count: localState.figures.filter(
        (f) => f.is_active !== false && Number(f.category_id) === Number(c.id)
      ).length
    }));
  },

  async createCategory(data) {
    const name = String(data.name || '').trim();
    const slug = slugify(data.slug || name);
    const tagline = String(data.tagline || '').trim();
    const accent_color = String(data.accent_color || '#e11d48').trim();
    const banner_image_url = String(
      data.banner_image_url ||
        'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=1200&q=85'
    ).trim();
    const display_order = Number(data.display_order || 99);

    if (usePostgres) {
      const { rows } = await pool.query(
        `INSERT INTO categories (name, slug, tagline, accent_color, banner_image_url, display_order)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, slug, tagline, accent_color, banner_image_url, display_order]
      );
      return { ...rows[0], figure_count: 0 };
    }
    if (
      localState.categories.some(
        (c) => c.slug === slug || c.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      throw new Error('Category with this name or slug already exists');
    }
    const nextId = localState.categories.reduce((max, c) => Math.max(max, Number(c.id)), 0) + 1;
    const created = {
      id: nextId,
      name,
      slug,
      tagline,
      accent_color,
      banner_image_url,
      display_order,
      figure_count: 0
    };
    localState.categories.push(created);
    saveLocalState();
    return created;
  },

  async updateCategory(id, data) {
    const numId = Number(id);
    if (usePostgres) {
      const { rows: existingRows } = await pool.query('SELECT * FROM categories WHERE id = $1', [
        numId
      ]);
      if (!existingRows[0]) return null;
      const cur = existingRows[0];
      const name = data.name !== undefined ? String(data.name).trim() : cur.name;
      const slug =
        data.slug !== undefined ? slugify(data.slug) : data.name ? slugify(name) : cur.slug;
      const tagline = data.tagline !== undefined ? String(data.tagline).trim() : cur.tagline;
      const accent_color =
        data.accent_color !== undefined ? String(data.accent_color).trim() : cur.accent_color;
      const banner_image_url =
        data.banner_image_url !== undefined
          ? String(data.banner_image_url).trim()
          : cur.banner_image_url;
      const display_order =
        data.display_order !== undefined ? Number(data.display_order) : cur.display_order;

      const { rows } = await pool.query(
        `UPDATE categories SET name=$1, slug=$2, tagline=$3, accent_color=$4, banner_image_url=$5, display_order=$6
         WHERE id=$7 RETURNING *`,
        [name, slug, tagline, accent_color, banner_image_url, display_order, numId]
      );
      return rows[0];
    }
    const idx = localState.categories.findIndex((c) => Number(c.id) === numId);
    if (idx === -1) return null;
    const cur = localState.categories[idx];
    const name = data.name !== undefined ? String(data.name).trim() : cur.name;
    const slug =
      data.slug !== undefined ? slugify(data.slug) : data.name ? slugify(name) : cur.slug;
    const updated = {
      ...cur,
      name,
      slug,
      tagline: data.tagline !== undefined ? String(data.tagline).trim() : cur.tagline,
      accent_color:
        data.accent_color !== undefined ? String(data.accent_color).trim() : cur.accent_color,
      banner_image_url:
        data.banner_image_url !== undefined
          ? String(data.banner_image_url).trim()
          : cur.banner_image_url,
      display_order:
        data.display_order !== undefined ? Number(data.display_order) : cur.display_order
    };
    localState.categories[idx] = updated;
    saveLocalState();
    return updated;
  },

  async deleteCategory(id) {
    const numId = Number(id);
    if (usePostgres) {
      await pool.query('UPDATE figures SET category_id = NULL WHERE category_id = $1', [numId]);
      const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [numId]);
      return rowCount > 0;
    }
    const before = localState.categories.length;
    localState.categories = localState.categories.filter((c) => Number(c.id) !== numId);
    localState.figures.forEach((f) => {
      if (Number(f.category_id) === numId) f.category_id = null;
    });
    saveLocalState();
    return localState.categories.length < before;
  },

  async getTeams() {
    if (usePostgres) {
      const { rows: teams } = await pool.query('SELECT * FROM teams ORDER BY id ASC');
      const { rows: figs } = await pool.query('SELECT team_id FROM figures WHERE is_active = TRUE');
      return teams.map((t) => ({
        ...t,
        figure_count: figs.filter((f) => Number(f.team_id) === Number(t.id)).length
      }));
    }
    return localState.teams.map((t) => ({
      ...t,
      figure_count: localState.figures.filter(
        (f) => f.is_active !== false && Number(f.team_id) === Number(t.id)
      ).length
    }));
  },

  async createTeam(data) {
    const name = String(data.name || '').trim();
    const slug = slugify(data.slug || name);
    const franchise = String(data.franchise || '').trim();
    const description = String(data.description || '').trim();
    const badge_color = String(data.badge_color || '#f59e0b').trim();

    if (usePostgres) {
      const { rows } = await pool.query(
        `INSERT INTO teams (name, slug, franchise, description, badge_color)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, slug, franchise, description, badge_color]
      );
      return { ...rows[0], figure_count: 0 };
    }
    if (
      localState.teams.some((t) => t.slug === slug || t.name.toLowerCase() === name.toLowerCase())
    ) {
      throw new Error('Team with this name or slug already exists');
    }
    const nextId = localState.teams.reduce((max, t) => Math.max(max, Number(t.id)), 0) + 1;
    const created = {
      id: nextId,
      name,
      slug,
      franchise,
      description,
      badge_color,
      figure_count: 0
    };
    localState.teams.push(created);
    saveLocalState();
    return created;
  },

  async updateTeam(id, data) {
    const numId = Number(id);
    if (usePostgres) {
      const { rows: existingRows } = await pool.query('SELECT * FROM teams WHERE id = $1', [numId]);
      if (!existingRows[0]) return null;
      const cur = existingRows[0];
      const name = data.name !== undefined ? String(data.name).trim() : cur.name;
      const slug =
        data.slug !== undefined ? slugify(data.slug) : data.name ? slugify(name) : cur.slug;
      const franchise = data.franchise !== undefined ? String(data.franchise).trim() : cur.franchise;
      const description =
        data.description !== undefined ? String(data.description).trim() : cur.description;
      const badge_color =
        data.badge_color !== undefined ? String(data.badge_color).trim() : cur.badge_color;

      const { rows } = await pool.query(
        `UPDATE teams SET name=$1, slug=$2, franchise=$3, description=$4, badge_color=$5 WHERE id=$6 RETURNING *`,
        [name, slug, franchise, description, badge_color, numId]
      );
      return rows[0];
    }
    const idx = localState.teams.findIndex((t) => Number(t.id) === numId);
    if (idx === -1) return null;
    const cur = localState.teams[idx];
    const name = data.name !== undefined ? String(data.name).trim() : cur.name;
    const slug =
      data.slug !== undefined ? slugify(data.slug) : data.name ? slugify(name) : cur.slug;
    const updated = {
      ...cur,
      name,
      slug,
      franchise: data.franchise !== undefined ? String(data.franchise).trim() : cur.franchise,
      description:
        data.description !== undefined ? String(data.description).trim() : cur.description,
      badge_color: data.badge_color !== undefined ? String(data.badge_color).trim() : cur.badge_color
    };
    localState.teams[idx] = updated;
    saveLocalState();
    return updated;
  },

  async deleteTeam(id) {
    const numId = Number(id);
    if (usePostgres) {
      await pool.query('UPDATE figures SET team_id = NULL WHERE team_id = $1', [numId]);
      const { rowCount } = await pool.query('DELETE FROM teams WHERE id = $1', [numId]);
      return rowCount > 0;
    }
    const before = localState.teams.length;
    localState.teams = localState.teams.filter((t) => Number(t.id) !== numId);
    localState.figures.forEach((f) => {
      if (Number(f.team_id) === numId) f.team_id = null;
    });
    saveLocalState();
    return localState.teams.length < before;
  },

  async getTags() {
    if (usePostgres) {
      const { rows: tags } = await pool.query('SELECT * FROM tags ORDER BY id ASC');
      const { rows: figs } = await pool.query('SELECT tag_ids FROM figures WHERE is_active = TRUE');
      return tags.map((tg) => ({
        ...tg,
        figure_count: figs.filter(
          (f) => Array.isArray(f.tag_ids) && f.tag_ids.map(Number).includes(Number(tg.id))
        ).length
      }));
    }
    return localState.tags.map((tg) => ({
      ...tg,
      figure_count: localState.figures.filter(
        (f) =>
          f.is_active !== false &&
          Array.isArray(f.tag_ids) &&
          f.tag_ids.map(Number).includes(Number(tg.id))
      ).length
    }));
  },

  async createTag(data) {
    const name = String(data.name || '').trim();
    const slug = slugify(data.slug || name);
    const color = String(data.color || '#38bdf8').trim();

    if (usePostgres) {
      const { rows } = await pool.query(
        `INSERT INTO tags (name, slug, color) VALUES ($1, $2, $3) RETURNING *`,
        [name, slug, color]
      );
      return { ...rows[0], figure_count: 0 };
    }
    if (
      localState.tags.some((t) => t.slug === slug || t.name.toLowerCase() === name.toLowerCase())
    ) {
      throw new Error('Tag with this name or slug already exists');
    }
    const nextId = localState.tags.reduce((max, t) => Math.max(max, Number(t.id)), 0) + 1;
    const created = { id: nextId, name, slug, color, figure_count: 0 };
    localState.tags.push(created);
    saveLocalState();
    return created;
  },

  async updateTag(id, data) {
    const numId = Number(id);
    if (usePostgres) {
      const { rows: existingRows } = await pool.query('SELECT * FROM tags WHERE id = $1', [numId]);
      if (!existingRows[0]) return null;
      const cur = existingRows[0];
      const name = data.name !== undefined ? String(data.name).trim() : cur.name;
      const slug =
        data.slug !== undefined ? slugify(data.slug) : data.name ? slugify(name) : cur.slug;
      const color = data.color !== undefined ? String(data.color).trim() : cur.color;

      const { rows } = await pool.query(
        `UPDATE tags SET name=$1, slug=$2, color=$3 WHERE id=$4 RETURNING *`,
        [name, slug, color, numId]
      );
      return rows[0];
    }
    const idx = localState.tags.findIndex((t) => Number(t.id) === numId);
    if (idx === -1) return null;
    const cur = localState.tags[idx];
    const name = data.name !== undefined ? String(data.name).trim() : cur.name;
    const slug =
      data.slug !== undefined ? slugify(data.slug) : data.name ? slugify(name) : cur.slug;
    const updated = {
      ...cur,
      name,
      slug,
      color: data.color !== undefined ? String(data.color).trim() : cur.color
    };
    localState.tags[idx] = updated;
    saveLocalState();
    return updated;
  },

  async deleteTag(id) {
    const numId = Number(id);
    if (usePostgres) {
      const { rows: figs } = await pool.query('SELECT id, tag_ids FROM figures');
      for (const f of figs) {
        if (Array.isArray(f.tag_ids) && f.tag_ids.map(Number).includes(numId)) {
          const filtered = f.tag_ids.map(Number).filter((tid) => tid !== numId);
          await pool.query('UPDATE figures SET tag_ids = $1::jsonb WHERE id = $2', [
            JSON.stringify(filtered),
            f.id
          ]);
        }
      }
      const { rowCount } = await pool.query('DELETE FROM tags WHERE id = $1', [numId]);
      return rowCount > 0;
    }
    const before = localState.tags.length;
    localState.tags = localState.tags.filter((t) => Number(t.id) !== numId);
    localState.figures.forEach((f) => {
      if (Array.isArray(f.tag_ids)) {
        f.tag_ids = f.tag_ids.map(Number).filter((tid) => tid !== numId);
      }
    });
    saveLocalState();
    return localState.tags.length < before;
  },

  async getFigures({ includeInactive = false } = {}) {
    const [categories, teams, tags] = await Promise.all([
      this.getCategories(),
      this.getTeams(),
      this.getTags()
    ]);

    let rawFigures = [];
    if (usePostgres) {
      const query = includeInactive
        ? 'SELECT * FROM figures ORDER BY id DESC'
        : 'SELECT * FROM figures WHERE is_active = TRUE ORDER BY id DESC';
      const { rows } = await pool.query(query);
      rawFigures = rows;
    } else {
      rawFigures = localState.figures.filter((f) => includeInactive || f.is_active !== false);
    }

    return rawFigures.map((fig) => hydrateFigure(fig, categories, teams, tags));
  },

  async getFigureBySlugOrId(identifier) {
    const all = await this.getFigures({ includeInactive: true });
    const numId = Number(identifier);
    return (
      all.find(
        (f) => f.slug === String(identifier) || (!Number.isNaN(numId) && Number(f.id) === numId)
      ) || null
    );
  },

  async createFigure(data) {
    const title = String(data.title || '').trim();
    const baseSlug = slugify(data.slug || title);
    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    const sku = String(data.sku || `FV-${Date.now().toString().slice(-6)}`)
      .trim()
      .toUpperCase();
    const character_name = String(data.character_name || title).trim();
    const franchise = String(data.franchise || '').trim();
    const category_id = data.category_id ? Number(data.category_id) : null;
    const team_id = data.team_id ? Number(data.team_id) : null;
    const tag_ids = Array.isArray(data.tag_ids) ? data.tag_ids.map(Number) : [];
    const manufacturer = String(data.manufacturer || 'Collector Studio').trim();
    const scale = String(data.scale || '1/12').trim();
    const height_cm = Number(data.height_cm || 16);
    const material = String(data.material || 'ABS & PVC').trim();
    const box_contents = String(
      data.box_contents || 'Main figure, alternate hands, display base'
    ).trim();
    const description = String(data.description || '').trim();
    const price = Number(data.price || 0);
    const original_price = data.original_price ? Number(data.original_price) : null;
    const stock = Number(data.stock !== undefined ? data.stock : 10);
    const badge = String(data.badge || 'in_stock');
    const image_url = String(
      data.image_url ||
        'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=900&q=85'
    ).trim();
    const gallery_urls =
      Array.isArray(data.gallery_urls) && data.gallery_urls.length > 0
        ? data.gallery_urls
        : [image_url];
    const is_featured = Boolean(data.is_featured);
    const is_new_arrival = data.is_new_arrival !== undefined ? Boolean(data.is_new_arrival) : true;
    const is_active = data.is_active !== undefined ? Boolean(data.is_active) : true;

    if (usePostgres) {
      const { rows } = await pool.query(
        `INSERT INTO figures (
          title, slug, sku, character_name, franchise, category_id, team_id, tag_ids,
          manufacturer, scale, height_cm, material, box_contents, description,
          price, original_price, stock, badge, image_url, gallery_urls,
          is_featured, is_new_arrival, is_active
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8::jsonb,
          $9,$10,$11,$12,$13,$14,
          $15,$16,$17,$18,$19,$20::jsonb,
          $21,$22,$23
        ) RETURNING id`,
        [
          title,
          slug,
          sku,
          character_name,
          franchise,
          category_id,
          team_id,
          JSON.stringify(tag_ids),
          manufacturer,
          scale,
          height_cm,
          material,
          box_contents,
          description,
          price,
          original_price,
          stock,
          badge,
          image_url,
          JSON.stringify(gallery_urls),
          is_featured,
          is_new_arrival,
          is_active
        ]
      );
      return this.getFigureBySlugOrId(rows[0].id);
    }

    const nextId = localState.figures.reduce((max, f) => Math.max(max, Number(f.id)), 0) + 1;
    const created = {
      id: nextId,
      title,
      slug,
      sku,
      character_name,
      franchise,
      category_id,
      team_id,
      tag_ids,
      manufacturer,
      scale,
      height_cm,
      material,
      box_contents,
      description,
      price,
      original_price,
      stock,
      badge,
      rating: 4.9,
      review_count: 1,
      image_url,
      gallery_urls,
      is_featured,
      is_new_arrival,
      is_active,
      created_at: new Date().toISOString()
    };
    localState.figures.push(created);
    saveLocalState();
    return this.getFigureBySlugOrId(nextId);
  },

  async updateFigure(id, data) {
    const numId = Number(id);
    const existing = await this.getFigureBySlugOrId(numId);
    if (!existing) return null;

    const updatedFields = {
      title: data.title !== undefined ? String(data.title).trim() : existing.title,
      sku: data.sku !== undefined ? String(data.sku).trim() : existing.sku,
      character_name:
        data.character_name !== undefined
          ? String(data.character_name).trim()
          : existing.character_name,
      franchise: data.franchise !== undefined ? String(data.franchise).trim() : existing.franchise,
      category_id:
        data.category_id !== undefined
          ? data.category_id
            ? Number(data.category_id)
            : null
          : existing.category_id,
      team_id:
        data.team_id !== undefined
          ? data.team_id
            ? Number(data.team_id)
            : null
          : existing.team_id,
      tag_ids:
        data.tag_ids !== undefined
          ? Array.isArray(data.tag_ids)
            ? data.tag_ids.map(Number)
            : []
          : existing.tag_ids,
      manufacturer:
        data.manufacturer !== undefined ? String(data.manufacturer).trim() : existing.manufacturer,
      scale: data.scale !== undefined ? String(data.scale).trim() : existing.scale,
      height_cm: data.height_cm !== undefined ? Number(data.height_cm) : existing.height_cm,
      material: data.material !== undefined ? String(data.material).trim() : existing.material,
      box_contents:
        data.box_contents !== undefined ? String(data.box_contents).trim() : existing.box_contents,
      description:
        data.description !== undefined ? String(data.description).trim() : existing.description,
      price: data.price !== undefined ? Number(data.price) : existing.price,
      original_price:
        data.original_price !== undefined
          ? data.original_price === '' || data.original_price === null
            ? null
            : Number(data.original_price)
          : existing.original_price,
      stock: data.stock !== undefined ? Number(data.stock) : existing.stock,
      badge: data.badge !== undefined ? String(data.badge) : existing.badge,
      image_url: data.image_url !== undefined ? String(data.image_url).trim() : existing.image_url,
      gallery_urls: data.gallery_urls !== undefined ? data.gallery_urls : existing.gallery_urls,
      is_featured: data.is_featured !== undefined ? Boolean(data.is_featured) : existing.is_featured,
      is_new_arrival:
        data.is_new_arrival !== undefined ? Boolean(data.is_new_arrival) : existing.is_new_arrival,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : existing.is_active
    };

    if (usePostgres) {
      await pool.query(
        `UPDATE figures SET
          title=$1, sku=$2, character_name=$3, franchise=$4, category_id=$5, team_id=$6, tag_ids=$7::jsonb,
          manufacturer=$8, scale=$9, height_cm=$10, material=$11, box_contents=$12, description=$13,
          price=$14, original_price=$15, stock=$16, badge=$17, image_url=$18, gallery_urls=$19::jsonb,
          is_featured=$20, is_new_arrival=$21, is_active=$22
         WHERE id=$23`,
        [
          updatedFields.title,
          updatedFields.sku,
          updatedFields.character_name,
          updatedFields.franchise,
          updatedFields.category_id,
          updatedFields.team_id,
          JSON.stringify(updatedFields.tag_ids),
          updatedFields.manufacturer,
          updatedFields.scale,
          updatedFields.height_cm,
          updatedFields.material,
          updatedFields.box_contents,
          updatedFields.description,
          updatedFields.price,
          updatedFields.original_price,
          updatedFields.stock,
          updatedFields.badge,
          updatedFields.image_url,
          JSON.stringify(updatedFields.gallery_urls),
          updatedFields.is_featured,
          updatedFields.is_new_arrival,
          updatedFields.is_active,
          numId
        ]
      );
      return this.getFigureBySlugOrId(numId);
    }

    const idx = localState.figures.findIndex((f) => Number(f.id) === numId);
    if (idx === -1) return null;
    localState.figures[idx] = {
      ...localState.figures[idx],
      ...updatedFields
    };
    saveLocalState();
    return this.getFigureBySlugOrId(numId);
  },

  async deleteFigure(id) {
    const numId = Number(id);
    if (usePostgres) {
      const { rowCount } = await pool.query('DELETE FROM figures WHERE id = $1', [numId]);
      return rowCount > 0;
    }
    const before = localState.figures.length;
    localState.figures = localState.figures.filter((f) => Number(f.id) !== numId);
    saveLocalState();
    return localState.figures.length < before;
  },

  async findUserByEmail(email) {
    const clean = String(email || '').trim().toLowerCase();
    if (usePostgres) {
      const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [clean]);
      return rows[0] || null;
    }
    return localState.users.find((u) => u.email.toLowerCase() === clean) || null;
  },

  async findUserById(id) {
    const numId = Number(id);
    if (usePostgres) {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [numId]);
      return rows[0] || null;
    }
    return localState.users.find((u) => Number(u.id) === numId) || null;
  },

  async createUser({ full_name, email, password_hash, phone = '', role = 'customer' }) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (usePostgres) {
      const { rows } = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, phone, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [full_name, cleanEmail, password_hash, phone, role]
      );
      return rows[0];
    }
    const nextId = localState.users.reduce((max, u) => Math.max(max, Number(u.id)), 0) + 1;
    const user = {
      id: nextId,
      full_name,
      email: cleanEmail,
      password_hash,
      phone,
      role,
      created_at: new Date().toISOString()
    };
    localState.users.push(user);
    saveLocalState();
    return user;
  },

  async createOrder(orderPayload) {
    if (usePostgres) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows: orderRows } = await client.query(
          `INSERT INTO orders (
            order_number, user_id, full_name, email, phone,
            address_line1, address_line2, city, state, postal_code, country,
            packaging_grade, packaging_fee, subtotal_amount, shipping_fee, total_amount,
            payment_status, order_status, payment_gateway, gateway_order_id
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
          ) RETURNING *`,
          [
            orderPayload.order_number,
            orderPayload.user_id,
            orderPayload.full_name,
            orderPayload.email,
            orderPayload.phone,
            orderPayload.address_line1,
            orderPayload.address_line2 || '',
            orderPayload.city,
            orderPayload.state,
            orderPayload.postal_code,
            orderPayload.country || 'India',
            orderPayload.packaging_grade || 'standard',
            orderPayload.packaging_fee || 0,
            orderPayload.subtotal_amount,
            orderPayload.shipping_fee || 0,
            orderPayload.total_amount,
            orderPayload.payment_status || 'pending',
            orderPayload.order_status || 'processing',
            orderPayload.payment_gateway || 'razorpay',
            orderPayload.gateway_order_id || ''
          ]
        );
        const order = orderRows[0];
        const insertedItems = [];
        for (const item of orderPayload.items) {
          const { rows: itemRows } = await client.query(
            `INSERT INTO order_items (order_id, figure_id, figure_title, figure_image_url, category_name, unit_price, quantity)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [
              order.id,
              item.figure_id,
              item.figure_title,
              item.figure_image_url,
              item.category_name,
              item.unit_price,
              item.quantity
            ]
          );
          insertedItems.push(itemRows[0]);
        }
        await client.query('COMMIT');
        return { ...order, items: insertedItems };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    const nextId = localState.orders.reduce((max, o) => Math.max(max, Number(o.id)), 0) + 1;
    const newOrder = {
      id: nextId,
      order_number: orderPayload.order_number,
      user_id: orderPayload.user_id || null,
      full_name: orderPayload.full_name,
      email: orderPayload.email,
      phone: orderPayload.phone,
      address_line1: orderPayload.address_line1,
      address_line2: orderPayload.address_line2 || '',
      city: orderPayload.city,
      state: orderPayload.state,
      postal_code: orderPayload.postal_code,
      country: orderPayload.country || 'India',
      packaging_grade: orderPayload.packaging_grade || 'standard',
      packaging_fee: Number(orderPayload.packaging_fee || 0),
      subtotal_amount: Number(orderPayload.subtotal_amount),
      shipping_fee: Number(orderPayload.shipping_fee || 0),
      total_amount: Number(orderPayload.total_amount),
      payment_status: orderPayload.payment_status || 'pending',
      order_status: orderPayload.order_status || 'processing',
      payment_gateway: orderPayload.payment_gateway || 'razorpay',
      gateway_order_id: orderPayload.gateway_order_id || '',
      gateway_payment_id: '',
      gateway_signature: '',
      created_at: new Date().toISOString(),
      items: orderPayload.items.map((item, idx) => ({
        id: idx + 1,
        order_id: nextId,
        ...item
      }))
    };
    localState.orders.unshift(newOrder);
    saveLocalState();
    return newOrder;
  },

  async getOrderByNumber(orderNumber) {
    const clean = String(orderNumber || '').trim().toUpperCase();
    if (usePostgres) {
      const { rows } = await pool.query('SELECT * FROM orders WHERE UPPER(order_number) = $1', [
        clean
      ]);
      if (!rows[0]) return null;
      const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [
        rows[0].id
      ]);
      return { ...rows[0], items };
    }
    return localState.orders.find((o) => o.order_number.toUpperCase() === clean) || null;
  },

  async markOrderPaid(orderNumber, { gateway_payment_id, gateway_signature }) {
    const order = await this.getOrderByNumber(orderNumber);
    if (!order) return null;

    if (usePostgres) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        if (order.payment_status !== 'paid') {
          for (const item of order.items) {
            if (item.figure_id) {
              await client.query(
                'UPDATE figures SET stock = GREATEST(0, stock - $1) WHERE id = $2',
                [item.quantity, item.figure_id]
              );
            }
          }
        }
        await client.query(
          `UPDATE orders
           SET payment_status = 'paid', order_status = 'confirmed',
               gateway_payment_id = $1, gateway_signature = $2
           WHERE id = $3`,
          [gateway_payment_id, gateway_signature, order.id]
        );
        await client.query('COMMIT');
        return this.getOrderByNumber(orderNumber);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    const idx = localState.orders.findIndex(
      (o) => o.order_number.toUpperCase() === order.order_number.toUpperCase()
    );
    if (idx === -1) return null;
    if (localState.orders[idx].payment_status !== 'paid') {
      for (const item of localState.orders[idx].items) {
        const fig = localState.figures.find((f) => Number(f.id) === Number(item.figure_id));
        if (fig) {
          fig.stock = Math.max(0, Number(fig.stock) - Number(item.quantity));
        }
      }
    }
    localState.orders[idx].payment_status = 'paid';
    localState.orders[idx].order_status = 'confirmed';
    localState.orders[idx].gateway_payment_id = gateway_payment_id;
    localState.orders[idx].gateway_signature = gateway_signature;
    saveLocalState();
    return localState.orders[idx];
  },

  async getOrdersForUser(userId, userEmail) {
    const cleanEmail = String(userEmail || '').trim().toLowerCase();
    if (usePostgres) {
      const { rows } = await pool.query(
        'SELECT * FROM orders WHERE user_id = $1 OR LOWER(email) = $2 ORDER BY created_at DESC',
        [Number(userId), cleanEmail]
      );
      const results = [];
      for (const ord of rows) {
        const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [
          ord.id
        ]);
        results.push({ ...ord, items });
      }
      return results;
    }
    return localState.orders.filter(
      (o) => Number(o.user_id) === Number(userId) || o.email.toLowerCase() === cleanEmail
    );
  },

  async getAllOrders() {
    if (usePostgres) {
      const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      const results = [];
      for (const ord of rows) {
        const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [
          ord.id
        ]);
        results.push({ ...ord, items });
      }
      return results;
    }
    return localState.orders;
  },

  async updateOrderStatus(orderNumber, { order_status, payment_status }) {
    const order = await this.getOrderByNumber(orderNumber);
    if (!order) return null;
    const nextOrderStatus = order_status || order.order_status;
    const nextPaymentStatus = payment_status || order.payment_status;

    if (usePostgres) {
      await pool.query(
        'UPDATE orders SET order_status = $1, payment_status = $2 WHERE id = $3',
        [nextOrderStatus, nextPaymentStatus, order.id]
      );
      return this.getOrderByNumber(orderNumber);
    }

    const idx = localState.orders.findIndex(
      (o) => o.order_number.toUpperCase() === order.order_number.toUpperCase()
    );
    if (idx === -1) return null;
    localState.orders[idx].order_status = nextOrderStatus;
    localState.orders[idx].payment_status = nextPaymentStatus;
    saveLocalState();
    return localState.orders[idx];
  }
};

module.exports = { db, initDatabase, ensureDatabase, slugify };
