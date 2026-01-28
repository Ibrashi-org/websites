import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminLogin = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Please enter username and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      login(response.data.access_token);
      toast.success("Welcome back, Admin!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4" data-testid="admin-login-page">
      <div className="smoke-bg" />
      <div className="noise-overlay" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card-surface p-8" data-testid="admin-login-card">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="https://customer-assets.emergentagent.com/job_mooki-single-vape/artifacts/yq4n0bz1_logo.jpg"
              alt="MOOKI STORE"
              className="w-16 h-16 rounded-xl mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-[#FF4500]">MOOKI</h1>
            <p className="text-[#A1A1AA] mt-2">Admin Portal</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 mb-6 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444]"
              data-testid="login-error"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="admin-login-form">
            <div>
              <Label htmlFor="username" className="text-[#A1A1AA] mb-2 block">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA]" />
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  className="pl-12 bg-[#0A0A0A] border-[#262626] focus:border-[#FF4500]"
                  data-testid="input-username"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-[#A1A1AA] mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA]" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="pl-12 bg-[#0A0A0A] border-[#262626] focus:border-[#FF4500]"
                  data-testid="input-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 rounded-full font-semibold flex items-center justify-center gap-2"
              data-testid="login-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Default Credentials Hint */}
          <div className="mt-6 p-4 bg-[#121212] rounded-lg text-center">
            <p className="text-xs text-[#A1A1AA]">
              Default: <span className="text-white">admin</span> / <span className="text-white">admin123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default AdminLogin;
