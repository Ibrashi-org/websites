import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Truck, Store, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useCart, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    payment_method: "Cash on Delivery",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.phone || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address,
        payment_method: formData.payment_method,
        items: cart.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: cartTotal,
      };

      const response = await axios.post(`${API}/orders`, orderData);
      
      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order-confirmation/${response.data.id}`);
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.detail || "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-12" data-testid="checkout-empty">
        <div className="container-main text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <Link to="/">
            <Button className="btn-primary px-8 py-3 rounded-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12" data-testid="checkout-page">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>

          <h1 className="text-4xl font-bold mb-8" data-testid="checkout-title">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
                {/* Contact Information */}
                <div className="card-surface p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#FF4500]" />
                    Contact Information
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_name" className="text-[#A1A1AA] mb-2 block">
                        Full Name *
                      </Label>
                      <Input
                        id="customer_name"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                        className="bg-[#0A0A0A] border-[#262626] focus:border-[#FF4500]"
                        data-testid="input-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-[#A1A1AA] mb-2 block">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 8900"
                        required
                        className="bg-[#0A0A0A] border-[#262626] focus:border-[#FF4500]"
                        data-testid="input-phone"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="email" className="text-[#A1A1AA] mb-2 block">
                        Email (optional - for order confirmation)
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="bg-[#0A0A0A] border-[#262626] focus:border-[#FF4500]"
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="card-surface p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#FF4500]" />
                    Delivery Address
                  </h2>

                  <div>
                    <Label htmlFor="address" className="text-[#A1A1AA] mb-2 block">
                      Full Address *
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address, City, State, ZIP Code"
                      required
                      rows={3}
                      className="bg-[#0A0A0A] border-[#262626] focus:border-[#FF4500] resize-none"
                      data-testid="input-address"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="card-surface p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#FF4500]" />
                    Payment Method
                  </h2>

                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, payment_method: value }))
                    }
                    className="space-y-3"
                    data-testid="payment-methods"
                  >
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-[#0A0A0A] border border-[#262626] hover:border-[#FF4500] transition-colors cursor-pointer">
                      <RadioGroupItem
                        value="Cash on Delivery"
                        id="cod"
                        className="border-[#FF4500] text-[#FF4500]"
                        data-testid="payment-cod"
                      />
                      <Label htmlFor="cod" className="flex-grow cursor-pointer">
                        <span className="font-semibold">Cash on Delivery</span>
                        <p className="text-sm text-[#A1A1AA]">Pay when you receive</p>
                      </Label>
                      <Truck className="w-5 h-5 text-[#A1A1AA]" />
                    </div>

                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-[#0A0A0A] border border-[#262626] hover:border-[#FF4500] transition-colors cursor-pointer">
                      <RadioGroupItem
                        value="Pay in Store"
                        id="store"
                        className="border-[#FF4500] text-[#FF4500]"
                        data-testid="payment-store"
                      />
                      <Label htmlFor="store" className="flex-grow cursor-pointer">
                        <span className="font-semibold">Pay in Store</span>
                        <p className="text-sm text-[#A1A1AA]">Pick up and pay at our store</p>
                      </Label>
                      <Store className="w-5 h-5 text-[#A1A1AA]" />
                    </div>
                  </RadioGroup>
                </div>

                {/* Submit Button - Mobile */}
                <div className="lg:hidden">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-4 rounded-full font-semibold"
                    data-testid="place-order-btn-mobile"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Place Order - ${cartTotal.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="card-surface p-6 sticky top-24" data-testid="checkout-summary">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex gap-4"
                      data-testid={`checkout-item-${item.product_id}`}
                    >
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-16 h-16 object-contain rounded-lg bg-[#121212]"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-sm">{item.product_name}</h3>
                        <p className="text-[#A1A1AA] text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#262626] pt-4 space-y-3">
                  <div className="flex justify-between text-[#A1A1AA]">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#A1A1AA]">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-[#262626] pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-[#FF4500]" data-testid="checkout-total">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Submit Button - Desktop */}
                <Button
                  type="submit"
                  form="checkout-form"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="hidden lg:flex w-full btn-primary py-4 rounded-full font-semibold mt-6 items-center justify-center gap-2"
                  data-testid="place-order-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Place Order
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Checkout;
