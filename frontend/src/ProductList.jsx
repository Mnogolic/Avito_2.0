import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Badge, Card, CardMedia,
  CardContent, CardActions, TextField, InputAdornment, Grid, Avatar,
  Select, MenuItem, FormControl, InputLabel, Stack, Menu
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const { addToCart, isLoading, logout, user, cartItemsCount } = useAuth();
  const navigate = useNavigate();

  // dropdown state
  const [anchorEl, setAnchorEl] = useState(null);
  const dropdownOpen = Boolean(anchorEl);
  const handleDropdownClick = (event) => setAnchorEl(event.currentTarget);
  const handleDropdownClose = () => setAnchorEl(null);
  const handleDropdownNavigate = (path) => {
    navigate(path);
    handleDropdownClose();
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/products', { credentials: 'include' })
      .then(r => r.json())
      .then(setProducts);
  }, []);

  const handleAddToCart = async (productId) => {
    setProducts(products =>
      products.map(p =>
        p.id === productId ? { ...p, is_in_cart: true } : p
      )
    );
    try {
      await addToCart(productId);
    } catch (err) 
      
    {
      console.log(err)
      setProducts(products =>
        products.map(p =>
          p.id === productId ? { ...p, is_in_cart: false } : p
        )
      );
      alert('Ошибка при добавлении в корзину');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredProducts = products
    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={3}
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" mb={1}>
            Каталог товаров
          </Typography>
          {user && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar>
                <PersonIcon />
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {user.username}
              </Typography>
            </Stack>
          )}
        </Box>
        <Stack direction="row" spacing={2}>
          {/* Dropdown меню для UML и документации */}
          <Box>
            <Button
              variant="outlined"
              color="info"
              startIcon={<MenuBookIcon />}
              onClick={handleDropdownClick}
            >
              Материалы
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={dropdownOpen}
              onClose={handleDropdownClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <MenuItem onClick={() => handleDropdownNavigate('/uml')}>
                <MenuBookIcon sx={{ mr: 1 }} color="info" /> UML Диаграммы
              </MenuItem>
              <MenuItem onClick={() => handleDropdownNavigate('/doc')}>
                <InsertDriveFileIcon sx={{ mr: 1 }} color="action" /> Документация
              </MenuItem>
            </Menu>
          </Box>
          <Badge badgeContent={cartItemsCount} color="error">
            <Button
              variant="outlined"
              startIcon={<ShoppingCartIcon />}
              onClick={() => navigate('/cart')}
            >
              Корзина
            </Button>
          </Badge>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </Stack>
      </Stack>

      {/* Фильтры и поиск */}
      <Grid container spacing={2} mb={4} alignItems="center">
        <Grid
          item
          xs={12}
          md="auto"
          sx={{
            minWidth: 165,
            maxWidth: 165,
            flexBasis: 340,
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="sort-label">Сортировка</InputLabel>
            <Select
              labelId="sort-label"
              value={sortBy}
              label="Сортировка"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="">Без сортировки</MenuItem>
              <MenuItem value="price_asc">Цена (по возрастанию)</MenuItem>
              <MenuItem value="price_desc">Цена (по убыванию)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={9}>
          <TextField
            fullWidth
            placeholder="Поиск товаров..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      {/* Список товаров */}
      <Grid container spacing={5}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <Grid item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex', justifyContent: 'center' }} key={product.id}>
              <Card
                sx={{
                  width: 220,
                  height: 360,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 3,
                  wordBreak: 'break-word',
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={product.image || '/test.png'}
                  alt={product.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      whiteSpace: 'normal',
                      minHeight: '3.2em',
                      wordBreak: 'break-word',
                    }}
                  >
                    {product.title}
                  </Typography>
                  {product.rating && (
                    <Stack direction="row" spacing={0.3} mb={1}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          sx={{ color: i < product.rating ? '#fbc02d' : '#e0e0e0', fontSize: 20 }}
                        />
                      ))}
                    </Stack>
                  )}
                  <Typography variant="h6" color="text.primary" fontWeight={600} mb={2}>
                    {product.price.toLocaleString()} <Typography component="span" color="text.secondary">₽</Typography>
                  </Typography>
                </CardContent>
                <CardActions sx={{ mt: 'auto', p: 2 }}>
                  <Button
                    variant={product.is_in_cart ? "contained" : "outlined"}
                    color={product.is_in_cart ? "success" : "primary"}
                    fullWidth
                    startIcon={product.is_in_cart ? <CheckCircleIcon /> : <AddShoppingCartIcon />}
                    disabled={isLoading || product.is_in_cart}
                    onClick={() => handleAddToCart(product.id)}
                  >
                    {product.is_in_cart ? 'В корзине' : 'Добавить'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={8} color="text.secondary">
              <SearchIcon sx={{ fontSize: 60, opacity: 0.5 }} />
              <Typography variant="h5" mt={2}>Товары не найдены</Typography>
              <Typography variant="body1">Попробуйте изменить параметры поиска</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}