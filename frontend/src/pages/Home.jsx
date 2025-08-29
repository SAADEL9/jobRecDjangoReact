import React, { useEffect, useState } from "react";
import api from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import Offers from "./Offers";
import { Container, Typography, Box, Paper } from '@mui/material';

export default function Home() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();



  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          
          <Offers />
        </Paper>
      </Box>
    </Container>
  );
}