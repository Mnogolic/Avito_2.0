import React from 'react';
import { Container, Typography, Grid, Card, CardMedia, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const diagrams = [
  "Activity Diagram.png",
  "Communication Diagram.png",
  "Composite_Structure_Diagram.png",
  "Interaction Overview Diagram.png",
  "Kasianov_classes.png",
  "Kasianov_components.png",
  "Kasianov_uml_deployment.png",
  "Object Diagram.png",
  "Package Diagram.png",
  "Sequence Diagram.png",
  "State Diagram.png",
  "Timing Diagram.png",
];

export default function UML() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" flexGrow={1}>
          UML Диаграммы
        </Typography>
        <Button variant="outlined" color="primary" onClick={() => navigate('/')}>
          На главную
        </Button>
      </Box>
      <Grid container spacing={3}>
        {diagrams.map((file) => (
          <Grid item xs={12} key={file}>
            <Card sx={{ p: 1 }}>
              <a href={`/img/uml/${file}`} target="_blank" rel="noopener noreferrer">
                <CardMedia
                  component="img"
                  image={`/img/uml/${file}`}
                  alt={file}
                  sx={{
                    width: '100%',
                    height: 320,
                    objectFit: 'contain',
                    borderRadius: 2,
                  }}
                />
              </a>
              <Typography variant="body2" align="center" mt={1}>
                {file}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}