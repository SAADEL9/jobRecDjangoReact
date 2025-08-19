import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Main Components/Pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import RegisterForm from "./pages/RegisterForm";
import Navbar from "./components/navbar";
import Profile from "./pages/profile";
import CreateOffer from "./pages/CreateOffer";
import Offers from "./pages/Offers";
import OfferDetail from "./pages/OfferDetail";
import EditOffer from "./pages/EditOffer";
import MyApplications from "./pages/MyApplications";

// A dummy component for a not found page (optional)
const NotFoundPage = () => <h1>404: Not Found</h1>;

// Define a simple theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f4f6f8', paper: '#ffffff' }
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
  }
});

// A component that handles login status and renders the correct pages
const AppContent = () => {
  const [authenticated, setAuthenticated] = React.useState(
    !!localStorage.getItem("token")
  );

  // A simple function to handle login success
  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />
      <Route path="/register" element={<RegisterForm />} />

      {/* Authenticated Routes */}
      <Route
        path="/"
        element={authenticated ? <Home /> : <Navigate to="/login" />}
      />
      
      {/* All other routes */}
      <Route
        path="/offers"
        element={authenticated ? <Offers /> : <Navigate to="/login" />}
      />
      <Route
        path="/offers/:id"
        element={authenticated ? <OfferDetail /> : <Navigate to="/login" />}
      />
      <Route
        path="/offers/:id/edit"
        element={authenticated ? <EditOffer /> : <Navigate to="/login" />}
      />
      <Route
        path="/offers/create"
        element={authenticated ? <CreateOffer /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={authenticated ? <Profile /> : <Navigate to="/login" />}
      />
      <Route
        path="/applications"
        element={authenticated ? <MyApplications /> : <Navigate to="/login" />}
      />

      {/* Catch-all for 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// The main App component with the theme and router
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;