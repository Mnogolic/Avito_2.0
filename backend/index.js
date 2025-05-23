const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

// CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'avito_db',
  password: '1032217607',
  port: 5432,
});

const JWT_SECRET = 'avito_secret_key_123!';

// Auth middleware
const authenticate = async (req) => {
  const token = req.cookies.token;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1', 
      [decoded.id]
    );
    return rows[0];
  } catch (err) {
    return null;
  }
};

// Routes
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, hashedPassword]
    );

    const token = jwt.sign({ id: rows[0].id }, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    }).status(201).json(rows[0]);

  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'User already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    }).json({
      id: user.id,
      username: user.username,
      email: user.email
    });

  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token').sendStatus(200);
});

app.get('/api/me', async (req, res) => {
  try {
    const user = await authenticate(req);
    if (!user) {
      console.log('[auth] user not found or not authenticated');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Показываем id пользователя
    console.log('[auth] authenticated user:', user);

    const cartRes = await pool.query(
      `SELECT p.id, p.title, p.price 
       FROM products p 
       JOIN user_cart uc ON p.id = uc.product_id
       WHERE uc.user_id = $1`,
      [user.id]
    );
    
    user.cart = cartRes.rows;
    res.json(user);
  } catch (err) {
    console.error('[api/me] Error:', err); // <-- покажет причину в консоли сервера!
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const user = await authenticate(req);
    const query = user 
      ? `SELECT p.*, EXISTS(SELECT 1 FROM user_cart WHERE user_id = ${user.id} AND product_id = p.id) AS is_in_cart FROM products p`
      : 'SELECT *, false AS is_in_cart FROM products';
    
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const user = await authenticate(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { productId } = req.body;
    await pool.query(
      `INSERT INTO user_cart (user_id, product_id) 
       VALUES ($1, $2) 
       ON CONFLICT DO NOTHING`,
      [user.id, productId]
    );
    
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

app.delete('/api/cart/:productId', async (req, res) => {
  try {
    const user = await authenticate(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { productId } = req.params;
    await pool.query(
      `DELETE FROM user_cart WHERE user_id = $1 AND product_id = $2`,
      [user.id, productId]
    );
    
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));