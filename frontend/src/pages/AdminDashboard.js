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
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminDashboard = () => {
  const { token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [editingProduct, setEditingProduct] = useState(false);
  const [productForm, setProductForm] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

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
      await Promise.all([fetchProduct(), fetchOrders(), fetchMessages()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/product`);
      setProduct(response.data);
      setProductForm(response.data);
    } catch (error) {
      console.error("Failed to fetch product:", error);
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
    }
  };

  const handleProductUpdate = async () => {
    setSavingProduct(true);
    try {
      const response = await axios.put(`${API}/product`, productForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduct(response.data);
      setEditingProduct(false);
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setSavingProduct(false);
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
      toast.error("Failed to update order status");
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
                <h2 className="text-xl font-bold">Product Management</h2>
                <div className="flex gap-2">
                  {editingProduct ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingProduct(false);
                          setProductForm(product);
                        }}
                        data-testid="cancel-edit-btn"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleProductUpdate}
                        disabled={savingProduct}
                        className="btn-primary rounded-full"
                        data-testid="save-product-btn"
                      >
                        {savingProduct ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setEditingProduct(true)}
                      className="border-[#262626]"
                      data-testid="edit-product-btn"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Product
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="flex flex-col items-center">
                  <img
                    src={productForm.image_url}
                    alt={productForm.name}
                    className="w-full max-w-sm rounded-xl mb-4"
                    data-testid="product-image-preview"
                  />
                  {editingProduct && (
                    <div className="w-full max-w-sm">
                      <Label className="text-[#A1A1AA] mb-2 block">Image URL</Label>
                      <Input
                        value={productForm.image_url || ""}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, image_url: e.target.value }))
                        }
                        className="bg-[#0A0A0A] border-[#262626]"
                        data-testid="input-image-url"
                      />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#A1A1AA] mb-2 block">Product Name</Label>
                    {editingProduct ? (
                      <Input
                        value={productForm.name || ""}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="bg-[#0A0A0A] border-[#262626]"
                        data-testid="input-product-name"
                      />
                    ) : (
                      <p className="text-lg font-semibold">{product?.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#A1A1AA] mb-2 block">Price ($)</Label>
                      {editingProduct ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={productForm.price || ""}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              price: parseFloat(e.target.value),
                            }))
                          }
                          className="bg-[#0A0A0A] border-[#262626]"
                          data-testid="input-price"
                        />
                      ) : (
                        <p className="text-2xl font-bold text-[#FF4500]">
                          ${product?.price?.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-[#A1A1AA] mb-2 block">Stock</Label>
                      {editingProduct ? (
                        <Input
                          type="number"
                          value={productForm.stock || ""}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              stock: parseInt(e.target.value),
                            }))
                          }
                          className="bg-[#0A0A0A] border-[#262626]"
                          data-testid="input-stock"
                        />
                      ) : (
                        <p className="text-2xl font-bold">{product?.stock}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#A1A1AA] mb-2 block">Flavor</Label>
                      {editingProduct ? (
                        <Input
                          value={productForm.flavor || ""}
                          onChange={(e) =>
                            setProductForm((prev) => ({ ...prev, flavor: e.target.value }))
                          }
                          className="bg-[#0A0A0A] border-[#262626]"
                          data-testid="input-flavor"
                        />
                      ) : (
                        <p className="font-medium">{product?.flavor}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-[#A1A1AA] mb-2 block">Nicotine</Label>
                      {editingProduct ? (
                        <Input
                          value={productForm.nicotine_strength || ""}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              nicotine_strength: e.target.value,
                            }))
                          }
                          className="bg-[#0A0A0A] border-[#262626]"
                          data-testid="input-nicotine"
                        />
                      ) : (
                        <p className="font-medium">{product?.nicotine_strength}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl">
                    <div>
                      <Label className="text-[#A1A1AA]">Product Availability</Label>
                      <p className="text-sm text-[#A1A1AA]">
                        {productForm.is_available ? "Visible to customers" : "Hidden from store"}
                      </p>
                    </div>
                    <Switch
                      checked={productForm.is_available}
                      onCheckedChange={(checked) =>
                        setProductForm((prev) => ({ ...prev, is_available: checked }))
                      }
                      disabled={!editingProduct}
                      className="data-[state=checked]:bg-[#FF4500]"
                      data-testid="toggle-availability"
                    />
                  </div>
                </div>
              </div>
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
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleOrderStatusUpdate(order.id, value)}
                            >
                              <SelectTrigger className="w-32 bg-transparent border-0" data-testid={`status-select-${order.id}`}>
                                <Badge className={getStatusBadgeClass(order.status)}>
                                  {order.status}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent className="bg-[#0A0A0A] border-[#262626]">
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
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

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-[#0A0A0A] border-[#262626] max-w-lg" data-testid="order-detail-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
              <Badge className={getStatusBadgeClass(selectedOrder?.status)}>
                {selectedOrder?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="flex justify-between items-center p-4 bg-[#121212] rounded-lg">
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

              {/* Status Update */}
              <div className="flex gap-2">
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
                    data-testid={`status-btn-${status.toLowerCase()}`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="bg-[#0A0A0A] border-[#262626] max-w-lg" data-testid="message-detail-dialog">
          <DialogHeader>
            <DialogTitle>Message from {selectedMessage?.name}</DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="space-y-2">
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
              <div className="p-4 bg-[#121212] rounded-lg">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Received: {formatDate(selectedMessage.created_at)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AdminDashboard;
