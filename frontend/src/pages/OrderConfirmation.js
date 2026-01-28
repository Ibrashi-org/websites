import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, MapPin, Phone, Mail, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      setError("Order not found");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 pb-12 flex items-center justify-center" data-testid="order-loading">
        <Loader2 className="w-12 h-12 text-[#FF4500] animate-spin" />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen pt-24 pb-12" data-testid="order-error">
        <div className="container-main text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-[#A1A1AA] mb-8">{error}</p>
          <Link to="/">
            <Button className="btn-primary px-8 py-3 rounded-full">
              Return to Shop
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12" data-testid="order-confirmation-page">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-[#10B981]/20 rounded-full mb-6"
            >
              <CheckCircle className="w-10 h-10 text-[#10B981]" />
            </motion.div>

            <h1 className="text-4xl font-bold mb-2" data-testid="order-success-title">
              Order Confirmed!
            </h1>
            <p className="text-[#A1A1AA]">
              Thank you for your order. We'll contact you soon.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="card-surface p-6 mb-6" data-testid="order-details-card">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#262626]">
              <div>
                <p className="text-sm text-[#A1A1AA] mb-1">Order ID</p>
                <p className="font-mono font-semibold" data-testid="order-id">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <Badge
                className={`px-4 py-1 ${
                  order.status === "Pending"
                    ? "badge-pending"
                    : order.status === "Confirmed"
                    ? "badge-confirmed"
                    : order.status === "Completed"
                    ? "badge-completed"
                    : "badge-cancelled"
                }`}
                data-testid="order-status"
              >
                {order.status}
              </Badge>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-[#FF4500]" />
                Order Items
              </h3>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-[#0A0A0A] rounded-lg"
                  data-testid={`order-item-${index}`}
                >
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-[#A1A1AA]">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Delivery Info */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF4500]" />
                Delivery Details
              </h3>
              <div className="p-4 bg-[#0A0A0A] rounded-lg space-y-2">
                <p className="font-semibold" data-testid="order-customer-name">
                  {order.customer_name}
                </p>
                <p className="text-[#A1A1AA] flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {order.phone}
                </p>
                {order.email && (
                  <p className="text-[#A1A1AA] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {order.email}
                  </p>
                )}
                <p className="text-[#A1A1AA]">{order.address}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold">Payment Method</h3>
              <div className="p-4 bg-[#0A0A0A] rounded-lg">
                <p className="text-[#A1A1AA]" data-testid="order-payment-method">
                  {order.payment_method}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-[#262626] pt-4 flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-[#FF4500]" data-testid="order-total">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button
                className="btn-primary px-8 py-3 rounded-full font-semibold flex items-center gap-2"
                data-testid="continue-shopping-btn"
              >
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                className="px-8 py-3 rounded-full font-semibold border-[#262626] hover:border-[#FF4500]"
                data-testid="contact-us-btn"
              >
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Age Disclaimer */}
          <p className="text-xs text-[#A1A1AA] text-center mt-8">
            This product is intended for adults 18 years of age or older.
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
