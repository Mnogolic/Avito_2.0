const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

// CORS middleware (должен быть ПЕРВЫМ)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Вспомогательная функция для аутентификации
const authenticate = async (req) => {
  const token = req.cookies.token;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1', 
      [decoded.id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error('Authentication error:', err);
    return null;
  }
};

// Маршрут входа (ИСПРАВЛЕННЫЙ)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    
    // Важная проверка формата хеша
    if (!user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
      console.error('Invalid hash format:', user.password_hash);
      return res.status(500).json({ error: 'Invalid password format in DB' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // Исправленные настройки куки
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // false для localhost
      sameSite: 'lax',
      maxAge: 3600000,
      domain: 'localhost'
    }).json({
      id: user.id,
      username: user.username,
      email: user.email
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Маршрут регистрации (ИСПРАВЛЕННЫЙ)
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

    const user = rows[0];
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000,
      domain: 'localhost'
    }).status(201).json(user);

  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'User already exists' });
    } else {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Остальные маршруты (products, me, cart и т.д.) остаются как у вас

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
  // Проверка подключения к БД
  pool.query('SELECT NOW()', (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Database connected successfully');
  });
});