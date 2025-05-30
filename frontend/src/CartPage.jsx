import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, IconButton, Card, CardContent, CardMedia,
  Grid, Stack, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CartPage() {
  const { user, removeFromCart, isLoading } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const cart = user.cart || [];
  // Исправленный подсчет суммы (price гарантированно число)
  const total = cart.reduce((acc, product) => acc + (Number(product.price) || 0), 0);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton color="primary" onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Корзина
        </Typography>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      {cart.length === 0 ? (
        <Box textAlign="center" py={8} color="text.secondary">
          <Typography variant="h5" fontWeight="medium" mb={1}>
            Корзина пуста
          </Typography>
          <Typography variant="body1">
            Добавьте товары из каталога.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/')}
          >
            Перейти к покупкам
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {cart.map(product => (
              <Grid item xs={12} sm={6} md={4} key={product.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    width: 414,
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: 3,
                    p: 1,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={product.image || '/test.png'}
                    alt={product.title}
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 2,
                      mr: 2,
                    }}
                  />
                  <CardContent sx={{ flex: 1, minWidth: 0, p: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        mb: 1,
                        fontSize: 17,
                      }}
                    >
                      {product.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {(Number(product.price) || 0).toLocaleString()} ₽
                    </Typography>
                  </CardContent>
                  <IconButton
                    color="error"
                    disabled={isLoading}
                    onClick={() => removeFromCart(product.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Итого:
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {total.toLocaleString()} ₽
            </Typography>
          </Stack>
          <Button
            variant="contained"
            color="success"
            size="large"
            fullWidth
            sx={{ mt: 3 }}
            disabled={cart.length === 0}
            // onClick={handleCheckout}
          >
            Оформить заказ
          </Button>
        </>
      )}
    </Container>
  );
}