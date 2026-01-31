import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  MessageSquare,
  LogOut,
  DollarSign,
  Edit2,
  Save,
  X,
  Eye,
  RefreshCw,
  Loader2,
  Home,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

const AdminDashboard = () => {
  const { token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    flavor: "",
    nicotine_strength: "5%",
    price: 29.99,
    stock: 100,
    is_available: true,
    image_url: "",
    description: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchOrders(), fetchMessages()]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      if (error.response?.status === 401) {
        logout();
        navigate("/admin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (error.response?.status === 401) {
        logout();
        navigate("/admin");
        toast.error("Session expired. Please login again.");
      }
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      if (error.response?.status === 401) {
        logout();
        navigate("/admin");
      }
    }
  };

  const handleProductUpdate = async (productId) => {
    setSavingProduct(true);
    try {
      const response = await axios.put(`${API}/product/${productId}`, productForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? response.data : p))
      );
      setEditingProduct(null);
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProductForm.name || !newProductForm.price) {
      toast.error("Please fill in product name and price");
      return;
    }
    setSavingProduct(true);
    try {
      const response = await axios.post(`${API}/product`, newProductForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => [...prev, response.data]);
      setShowAddProduct(false);
      setNewProductForm({
        name: "",
        flavor: "",
        nicotine_strength: "5%",
        price: 29.99,
        stock: 100,
        is_available: true,
        image_url: "",
        description: "",
      });
      toast.success("Product added successfully");
    } catch (error) {
      toast.error("Failed to add product");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await axios.delete(`${API}/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      if (error.response?.status === 401) {
        logout();
        navigate("/admin");
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to update order status");
      }
    }
  };

  const handleMarkMessageRead = async (messageId) => {
    try {
      await axios.put(`${API}/contact/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
    toast.info("Logged out successfully");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "badge-pending";
      case "Confirmed":
        return "badge-confirmed";
      case "Completed":
        return "badge-completed";
      case "Cancelled":
        return "badge-cancelled";
      default:
        return "";
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Stats
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const unreadMessages = messages.filter((m) => !m.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="admin-loading">
        <Loader2 className="w-12 h-12 text-[#FF4500] animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505]" data-testid="admin-dashboard">
      <div className="smoke-bg" />
      <div className="noise-overlay" />

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-[#262626]">
        <div className="container-main flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src="https://customer-assets.emergentagent.com/job_mooki-single-vape/artifacts/yq4n0bz1_logo.jpg"
              alt="MOOKI"
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-[#FF4500]">MOOKI</h1>
              <p className="text-xs text-[#A1A1AA]">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-[#A1A1AA] hover:text-white">
                <Home className="w-4 h-4 mr-2" />
                View Store
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-[#A1A1AA] hover:text-[#EF4444]"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container-main py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-surface p-6"
            data-testid="stat-revenue"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#10B981]/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-surface p-6"
            data-testid="stat-orders"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FF4500]/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-[#FF4500]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-surface p-6"
            data-testid="stat-pending"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EAB308]/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-[#EAB308]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-surface p-6"
            data-testid="stat-messages"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-sm text-[#A1A1AA]">Unread Messages</p>
                <p className="text-2xl font-bold">{unreadMessages}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="product" className="space-y-6">
          <TabsList className="bg-[#0A0A0A] border border-[#262626] p-1">
            <TabsTrigger value="product" className="data-[state=active]:bg-[#FF4500]" data-testid="tab-product">
              <Package className="w-4 h-4 mr-2" />
              Product
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#FF4500]" data-testid="tab-orders">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-[#FF4500]" data-testid="tab-messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Product Tab */}
          <TabsContent value="product">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-surface p-6"
              data-testid="product-management"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Product Management ({products.length})</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={fetchProducts}
                    className="text-[#A1A1AA]"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={() => setShowAddProduct(true)}
                    className="btn-primary rounded-full"
                    data-testid="add-product-btn"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 text-[#A1A1AA]">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No products yet. Add your first product!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-[#0A0A0A] rounded-xl p-4 border border-[#262626] hover:border-[#FF4500]/50 transition-colors"
                      data-testid={`product-card-${product.id}`}
                    >
                      <img
                        src={product.image_url || "https://via.placeholder.com/200"}
                        alt={product.name}
                        className="w-full h-48 object-contain rounded-lg mb-4 bg-[#121212]"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">{product.name}</h3>
                          <Badge className={product.is_available ? "badge-completed" : "badge-cancelled"}>
                            {product.is_available ? "Active" : "Hidden"}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#A1A1AA]">{product.flavor}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-[#FF4500]">${product.price?.toFixed(2)}</p>
                          <p className="text-sm text-[#A1A1AA]">Stock: {product.stock}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#262626]"
                            onClick={() => {
                              setEditingProduct(product.id);
                              setProductForm(product);
                            }}
                            data-testid={`edit-product-${product.id}`}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#EF4444]/50 text-[#EF4444] hover:bg-[#EF4444]/10"
                            onClick={() => handleDeleteProduct(product.id)}
                            data-testid={`delete-product-${product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-surface p-6"
              data-testid="orders-management"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Orders ({orders.length})</h2>
                <Button
                  variant="ghost"
                  onClick={fetchOrders}
                  className="text-[#A1A1AA]"
                  data-testid="refresh-orders-btn"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-[#A1A1AA]">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#262626]">
                        <TableHead className="text-[#A1A1AA]">Order ID</TableHead>
                        <TableHead className="text-[#A1A1AA]">Customer</TableHead>
                        <TableHead className="text-[#A1A1AA]">Total</TableHead>
                        <TableHead className="text-[#A1A1AA]">Status</TableHead>
                        <TableHead className="text-[#A1A1AA]">Date</TableHead>
                        <TableHead className="text-[#A1A1AA]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="border-[#262626] hover:bg-[#0A0A0A]"
                          data-testid={`order-row-${order.id}`}
                        >
                          <TableCell className="font-mono text-sm">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell className="font-semibold text-[#FF4500]">
                            ${order.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, "Pending")}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                  order.status === "Pending" 
                                    ? "bg-yellow-500/30 text-yellow-400 font-bold" 
                                    : "bg-[#1a1a1a] text-[#666] hover:bg-yellow-500/20 hover:text-yellow-400"
                                }`}
                                data-testid={`status-pending-${order.id}`}
                              >
                                Pending
                              </button>
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, "Confirmed")}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                  order.status === "Confirmed" 
                                    ? "bg-blue-500/30 text-blue-400 font-bold" 
                                    : "bg-[#1a1a1a] text-[#666] hover:bg-blue-500/20 hover:text-blue-400"
                                }`}
                                data-testid={`status-confirmed-${order.id}`}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, "Completed")}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                  order.status === "Completed" 
                                    ? "bg-green-500/30 text-green-400 font-bold" 
                                    : "bg-[#1a1a1a] text-[#666] hover:bg-green-500/20 hover:text-green-400"
                                }`}
                                data-testid={`status-completed-${order.id}`}
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, "Cancelled")}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                  order.status === "Cancelled" 
                                    ? "bg-red-500/30 text-red-400 font-bold" 
                                    : "bg-[#1a1a1a] text-[#666] hover:bg-red-500/20 hover:text-red-400"
                                }`}
                                data-testid={`status-cancelled-${order.id}`}
                              >
                                Cancel
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#A1A1AA] text-sm">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              data-testid={`view-order-${order.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-surface p-6"
              data-testid="messages-management"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Contact Messages ({messages.length})</h2>
                <Button
                  variant="ghost"
                  onClick={fetchMessages}
                  className="text-[#A1A1AA]"
                  data-testid="refresh-messages-btn"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-12 text-[#A1A1AA]">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-xl cursor-pointer transition-colors ${
                        message.is_read
                          ? "bg-[#0A0A0A]"
                          : "bg-[#FF4500]/10 border border-[#FF4500]/30"
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.is_read) {
                          handleMarkMessageRead(message.id);
                        }
                      }}
                      data-testid={`message-${message.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{message.name}</p>
                            {!message.is_read && (
                              <Badge className="bg-[#FF4500] text-white text-xs">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#A1A1AA] mb-2">{message.email}</p>
                          <p className="text-[#A1A1AA] line-clamp-2">{message.message}</p>
                        </div>
                        <p className="text-xs text-[#A1A1AA]">
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
          data-testid="order-detail-modal"
        >
          <div className="absolute inset-0 bg-black/80" />
          <div 
            className="relative bg-[#0A0A0A] border border-[#262626] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
              </h2>
              <div className="flex items-center gap-3">
                <Badge className={getStatusBadgeClass(selectedOrder.status)}>
                  {selectedOrder.status}
                </Badge>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-[#A1A1AA] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2 mb-4">
              <h4 className="font-semibold text-sm text-[#A1A1AA]">Customer</h4>
              <div className="p-4 bg-[#121212] rounded-lg space-y-2">
                <p className="font-semibold">{selectedOrder.customer_name}</p>
                <p className="text-sm text-[#A1A1AA] flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {selectedOrder.phone}
                </p>
                {selectedOrder.email && (
                  <p className="text-sm text-[#A1A1AA] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedOrder.email}
                  </p>
                )}
                <p className="text-sm text-[#A1A1AA] flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  {selectedOrder.address}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2 mb-4">
              <h4 className="font-semibold text-sm text-[#A1A1AA]">Items</h4>
              {selectedOrder.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between p-4 bg-[#121212] rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-[#A1A1AA]">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Payment & Total */}
            <div className="flex justify-between items-center p-4 bg-[#121212] rounded-lg mb-4">
              <div>
                <p className="text-sm text-[#A1A1AA]">Payment Method</p>
                <p className="font-medium">{selectedOrder.payment_method}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#A1A1AA]">Total</p>
                <p className="text-2xl font-bold text-[#FF4500]">
                  ${selectedOrder.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Status Update Buttons */}
            <div className="flex flex-wrap gap-2">
              {["Pending", "Confirmed", "Completed", "Cancelled"].map((status) => (
                <Button
                  key={status}
                  variant={selectedOrder.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleOrderStatusUpdate(selectedOrder.id, status)}
                  className={
                    selectedOrder.status === status
                      ? "bg-[#FF4500]"
                      : "border-[#262626]"
                  }
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div 
            className="relative bg-[#0A0A0A] border border-[#262626] rounded-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Message from {selectedMessage.name}</h2>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="text-[#A1A1AA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-[#A1A1AA] flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {selectedMessage.email}
              </p>
              {selectedMessage.phone && (
                <p className="text-sm text-[#A1A1AA] flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {selectedMessage.phone}
                </p>
              )}
            </div>
            <div className="p-4 bg-[#121212] rounded-lg mb-4">
              <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Received: {formatDate(selectedMessage.created_at)}
            </p>
          </div>
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="bg-[#0A0A0A] border-[#262626] max-w-lg max-h-[90vh] overflow-y-auto" data-testid="add-product-dialog">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription className="sr-only">
              Add a new product to your store
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-[#A1A1AA] mb-2 block">Product Name *</Label>
              <Input
                value={newProductForm.name}
                onChange={(e) =>
                  setNewProductForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Strawberry Punch"
                className="bg-[#121212] border-[#262626]"
                data-testid="new-product-name"
              />
            </div>

            <div>
              <Label className="text-[#A1A1AA] mb-2 block">Flavor</Label>
              <Input
                value={newProductForm.flavor}
                onChange={(e) =>
                  setNewProductForm((prev) => ({ ...prev, flavor: e.target.value }))
                }
                placeholder="e.g., Strawberry Punch"
                className="bg-[#121212] border-[#262626]"
                data-testid="new-product-flavor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#A1A1AA] mb-2 block">Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newProductForm.price}
                  onChange={(e) =>
                    setNewProductForm((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="bg-[#121212] border-[#262626]"
                  data-testid="new-product-price"
                />
              </div>

              <div>
                <Label className="text-[#A1A1AA] mb-2 block">Stock</Label>
                <Input
                  type="number"
                  value={newProductForm.stock}
                  onChange={(e) =>
                    setNewProductForm((prev) => ({
                      ...prev,
                      stock: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="bg-[#121212] border-[#262626]"
                  data-testid="new-product-stock"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#A1A1AA] mb-2 block">Nicotine Strength</Label>
              <Input
                value={newProductForm.nicotine_strength}
                onChange={(e) =>
                  setNewProductForm((prev) => ({ ...prev, nicotine_strength: e.target.value }))
                }
                placeholder="e.g., 5%"
                className="bg-[#121212] border-[#262626]"
                data-testid="new-product-nicotine"
              />
            </div>

            <div>
              <Label className="text-[#A1A1AA] mb-2 block">Image URL</Label>
              <Input
                value={newProductForm.image_url}
                onChange={(e) =>
                  setNewProductForm((prev) => ({ ...prev, image_url: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
                className="bg-[#121212] border-[#262626]"
                data-testid="new-product-image"
              />
            </div>

            <div>
              <Label className="text-[#A1A1AA] mb-2 block">Description</Label>
              <Input
                value={newProductForm.description}
                onChange={(e) =>
                  setNewProductForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Product description..."
                className="bg-[#121212] border-[#262626]"
                data-testid="new-product-description"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#121212] rounded-xl">
              <div>
                <Label className="text-[#A1A1AA]">Available for Sale</Label>
              </div>
              <Switch
                checked={newProductForm.is_available}
                onCheckedChange={(checked) =>
                  setNewProductForm((prev) => ({ ...prev, is_available: checked }))
                }
                className="data-[state=checked]:bg-[#FF4500]"
                data-testid="new-product-available"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-[#262626]"
                onClick={() => setShowAddProduct(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProduct}
                disabled={savingProduct}
                className="flex-1 btn-primary"
                data-testid="save-new-product-btn"
              >
                {savingProduct ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="bg-[#0A0A0A] border-[#262626] max-w-lg max-h-[90vh] overflow-y-auto" data-testid="edit-product-dialog">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription className="sr-only">
              Edit product details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-[#A1A1AA] mb-2 block">Product Name</Label>
              <Input
                value={productForm.name || ""}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="bg-[#121212] border-[#262626]"
                data-testid="edit-product-name"
              />
            </div>

            <div>
              <Label className="text-[#A1A1AA] mb-2 block">Flavor</Label>
              <Input
                value={productForm.flavor || ""}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, flavor: e.target.value }))
                }
                className="bg-[#121212] border-[#262626]"
                data-testid="edit-product-flavor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#A1A1AA] mb-2 block">Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.price || ""}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="bg-[#121212] border-[#262626]"
                  data-testid="edit-product-price"
                />
              </div>

              <div>
                <Label className="text-[#A1A1AA] mb-2 block">Stock</Label>
                <Input
                  type="number"
                  value={productForm.stock || ""}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      stock: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="bg-[#121212] border-[#262626]"
                  data-testid="edit-product-stock"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#A1A1AA] mb-2 block">Nicotine Strength</Label>
              <Input
                value={productForm.nicotine_strength || ""}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, nicotine_strength: e.target.value }))
                }
                className="bg-[#121212] border-[#262626]"
                data-testid="edit-product-nicotine"
              />
            </div>

            <div>
              <Label className="text-[#A1A1AA] mb-2 block">Image URL</Label>
              <Input
                value={productForm.image_url || ""}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, image_url: e.target.value }))
                }
                className="bg-[#121212] border-[#262626]"
                data-testid="edit-product-image"
              />
            </div>

            <div>
              <Label className="text-[#A1A1AA] mb-2 block">Description</Label>
              <Input
                value={productForm.description || ""}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="bg-[#121212] border-[#262626]"
                data-testid="edit-product-description"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#121212] rounded-xl">
              <div>
                <Label className="text-[#A1A1AA]">Available for Sale</Label>
              </div>
              <Switch
                checked={productForm.is_available || false}
                onCheckedChange={(checked) =>
                  setProductForm((prev) => ({ ...prev, is_available: checked }))
                }
                className="data-[state=checked]:bg-[#FF4500]"
                data-testid="edit-product-available"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-[#262626]"
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleProductUpdate(editingProduct)}
                disabled={savingProduct}
                className="flex-1 btn-primary"
                data-testid="save-edit-product-btn"
              >
                {savingProduct ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AdminDashboard;
