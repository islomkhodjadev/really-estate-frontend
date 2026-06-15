import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import PropertyDetail from "./pages/PropertyDetail";
import Favorites from "./pages/Favorites";
import CreateProperty from "./pages/CreateProperty";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import { PaymentSuccess, PaymentCancel } from "./pages/PaymentResult";
import Auctions from "./pages/Auctions";
import AuctionDetail from "./pages/AuctionDetail";
import CreateAuction from "./pages/CreateAuction";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./index.css";

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="auctions" element={<Auctions />} />
            <Route path="auction/new" element={<Protected><CreateAuction /></Protected>} />
            <Route path="auction/:id" element={<AuctionDetail />} />
            <Route path="property/:id" element={<PropertyDetail />} />
            <Route path="favorites" element={<Protected><Favorites /></Protected>} />
            <Route path="create" element={<Protected><CreateProperty /></Protected>} />
            <Route path="dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="profile" element={<Protected><Profile /></Protected>} />
            <Route path="payment/success" element={<Protected><PaymentSuccess /></Protected>} />
            <Route path="payment/cancel" element={<Protected><PaymentCancel /></Protected>} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
