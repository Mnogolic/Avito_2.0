const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

// Важные настройки CORS (должно быть перед другими middleware)
app.use(cors({
  origin: 'http://localhost:5173', // Укажите ваш фронтенд-адрес
  credentials: true // Разрешаем передачу кук
}));

app.use(express.json());
app.use(cookieParser());

// Подключение к PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'avito_db',
  password: '1032217607', // Замените на реальный пароль!
  port: 5432,
});

// Секретный ключ для JWT (рекомендуется вынести в переменные окружения)
const JWT_SECRET = 'avito_secret_key_123!';

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Сервер работает! Проверьте <a href="/api/products">/api/products</a>');
});

// Маршрут для товаров
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// Маршрут регистрации
// В backend/index.js
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Простая валидация
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email`,
      [username, email, hashedPassword]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Ошибка уникальности в PostgreSQL
      res.status(400).json({ error: 'Пользователь уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

// Маршрут входа (обновлен для безопасности)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );
    
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const user = rows[0];
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    }).json({ 
      id: user.id, 
      username: user.username,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Маршрут выхода
app.post('/api/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }).sendStatus(200);
});

app.get('/api/me', async (req, res) => {
  const token = req.cookies.token;
  console.log('Токен из куков:', token); // [!code ++]
  
  if (!token) {
    console.log('Токен отсутствует'); // [!code ++]
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Декодированный токен:', decoded); // [!code ++]
    
    const { rows } = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1', 
      [decoded.id]
    );
    
    if (rows.length === 0) {
      console.log('Пользователь не найден в БД'); // [!code ++]
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    console.log('Отправляем данные пользователя:', rows[0]); // [!code ++]
    res.json(rows[0]);
  } catch (err) {
    console.log('Ошибка проверки токена:', err); // [!code ++]
    res.status(401).json({ error: 'Неверный токен' });
  }
});

// Удаление из корзины
app.delete('/api/cart/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    await pool.query(
      `DELETE FROM user_cart 
       WHERE user_id = $1 AND product_id = $2`,
      [decoded.id, productId]
    );
    
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавление в корзину
app.post('/api/cart', async (req, res) => {
  try {
    const { productId } = req.body;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    await pool.query(
      `INSERT INTO user_cart (user_id, product_id) 
       VALUES ($1, $2) 
       ON CONFLICT DO NOTHING`,
      [decoded.id, productId]
    );
    
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.listen(5000, () => console.log('Сервер запущен на http://localhost:5000'));