import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/App";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, product } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-12" data-testid="cart-page-empty">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <ShoppingBag className="w-20 h-20 text-[#262626] mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-[#A1A1AA] mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/">
              <Button className="btn-primary px-8 py-3 rounded-full font-semibold" data-testid="continue-shopping-btn">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12" data-testid="cart-page">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8" data-testid="cart-title">Your Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <motion.div
                  key={item.product_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-surface p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 mx-auto sm:mx-0">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="text-lg font-semibold mb-1" data-testid="cart-item-name">
                      {item.product_name}
                    </h3>
                    <p className="text-[#FF4500] font-bold text-xl" data-testid="cart-item-price">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 bg-[#121212] rounded-full p-1">
                      <button
                        onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-[#0A0A0A] hover:bg-[#262626] flex items-center justify-center transition-colors"
                        data-testid="cart-item-decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold" data-testid="cart-item-quantity">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          const maxStock = product?.stock || 999;
                          if (item.quantity < maxStock) {
                            updateCartQuantity(item.product_id, item.quantity + 1);
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-[#0A0A0A] hover:bg-[#262626] flex items-center justify-center transition-colors"
                        data-testid="cart-item-increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="w-10 h-10 rounded-full bg-[#EF4444]/10 hover:bg-[#EF4444]/20 flex items-center justify-center transition-colors text-[#EF4444]"
                      data-testid="cart-item-remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-center sm:text-right min-w-[100px]">
                    <p className="text-xs text-[#A1A1AA] mb-1">Subtotal</p>
                    <p className="text-xl font-bold" data-testid="cart-item-subtotal">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="card-surface p-6 sticky top-24" data-testid="order-summary">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-[#A1A1AA]">
                    <span>Subtotal</span>
                    <span data-testid="summary-subtotal">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#A1A1AA]">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-[#262626] pt-4 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-[#FF4500]" data-testid="summary-total">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/checkout")}
                  className="w-full btn-primary py-4 rounded-full font-semibold flex items-center justify-center gap-2"
                  data-testid="checkout-btn"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-xs text-[#A1A1AA] text-center mt-4">
                  Cash on Delivery / Pay in Store available
                </p>
              </div>
            </motion.div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 text-center lg:text-left">
            <Link to="/" className="text-[#A1A1AA] hover:text-[#FF4500] transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Cart;
