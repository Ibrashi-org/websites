import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Pages
import Home from "@/pages/Home";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Contact from "@/pages/Contact";
import ProductDetail from "@/pages/ProductDetail";

// Components
import AgeVerification from "@/components/AgeVerification";
import Header from "@/components/Header";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Cart Context
export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

// Auth Context
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

function AppContent() {
  const [cart, setCart] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("admin_token") || null);
  const [product, setProduct] = useState(null);
  const location = useLocation();

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/product`);
      setProduct(response.data);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

  const addToCart = (productData, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === productData.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === productData.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: productData.id,
          product_name: productData.name,
          price: productData.price,
          quantity,
          image_url: productData.image_url,
        },
      ];
    });
    toast.success("Added to cart!", {
      description: `${productData.name} x${quantity}`,
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
    toast.info("Removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("admin_token", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("admin_token");
  };

  const isAdminRoute = location.pathname.startsWith("/admin");
  
  // Skip age verification for admin routes
  const showAgeVerification = !isAgeVerified && !isAdminRoute;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      <CartContext.Provider
        value={{
          cart,
          addToCart,
          updateCartQuantity,
          removeFromCart,
          clearCart,
          cartTotal,
          cartCount,
          product,
          fetchProduct,
        }}
      >
        {showAgeVerification && <AgeVerification onVerify={handleAgeVerify} />}
        <div className={`App ${showAgeVerification ? "blur-lg pointer-events-none" : ""}`}>
          <div className="smoke-bg" />
          <div className="noise-overlay" />
          {!isAdminRoute && <Header />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
        <Toaster position="top-right" theme="dark" richColors />
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
