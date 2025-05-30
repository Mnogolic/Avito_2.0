import React from 'react';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useNavigate } from 'react-router-dom';

export default function Doc() {
  const docUrl = "/doc/TZ_UML_Kasianov.pdf";
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Документация
        </Typography>
        <Button variant="outlined" color="primary" onClick={() => navigate('/')}>
          На главную
        </Button>
      </Stack>
      <Box textAlign="center" my={5}>
        <InsertDriveFileIcon sx={{ fontSize: 80, color: "grey.400" }} />
        <Typography variant="h6" mb={2}>
          Открыть документацию в формате PDF
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="large"
        >
          Открыть PDF
        </Button>
      </Box>
    </Container>
  );
}