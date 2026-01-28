import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Droplets, Zap, Check, AlertCircle } from "lucide-react";
import { useCart } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const { product, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (product) {
      setIsLoading(false);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product && product.is_available && product.stock > 0) {
      addToCart(product, quantity);
      setQuantity(1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="w-12 h-12 border-4 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="product-not-found">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Product not found</h2>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isUnavailable = !product.is_available;

  return (
    <main className="min-h-screen pt-20" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" data-testid="hero-section">
        {/* Background Text */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <motion.span
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hero-text-bg"
          >
            STRAWBERRY PUNCH
          </motion.span>
        </div>

        <div className="container-main relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center order-1 lg:order-2"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-[#FF4500] rounded-full blur-[100px] opacity-20" />
                <motion.img
                  src={product.image_url}
                  alt={product.name}
                  className="relative z-10 w-full max-w-md product-glow animate-float"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                  data-testid="product-image"
                />
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-2 lg:order-1 text-center lg:text-left"
            >
              <Badge 
                className="mb-4 bg-[#FF4500]/20 text-[#FF4500] border-0 px-4 py-1"
                data-testid="product-badge"
              >
                Premium Vape
              </Badge>
              
              <h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 uppercase tracking-wide"
                data-testid="product-name"
              >
                {product.name}
              </h1>
              
              <p 
                className="text-[#A1A1AA] text-lg mb-8 max-w-lg mx-auto lg:mx-0"
                data-testid="product-description"
              >
                {product.description}
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="card-surface p-4 text-center"
                  data-testid="feature-flavor"
                >
                  <Droplets className="w-6 h-6 text-[#FF4500] mx-auto mb-2" />
                  <p className="text-xs text-[#A1A1AA] mb-1">Flavor</p>
                  <p className="font-semibold text-sm">{product.flavor}</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="card-surface p-4 text-center"
                  data-testid="feature-nicotine"
                >
                  <Zap className="w-6 h-6 text-[#FF4500] mx-auto mb-2" />
                  <p className="text-xs text-[#A1A1AA] mb-1">Nicotine</p>
                  <p className="font-semibold text-sm">{product.nicotine_strength}</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="card-surface p-4 text-center"
                  data-testid="feature-stock"
                >
                  <Package className="w-6 h-6 text-[#FF4500] mx-auto mb-2" />
                  <p className="text-xs text-[#A1A1AA] mb-1">Stock</p>
                  <p className={`font-semibold text-sm ${isOutOfStock ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                    {isOutOfStock ? 'Out of Stock' : `${product.stock} Available`}
                  </p>
                </motion.div>
              </div>

              {/* Price & Add to Cart */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-[#A1A1AA]">Price</p>
                  <p className="text-4xl font-bold text-[#FF4500]" data-testid="product-price">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                {!isUnavailable && !isOutOfStock && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#121212] rounded-full p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full bg-[#0A0A0A] hover:bg-[#262626] flex items-center justify-center transition-colors"
                        data-testid="quantity-decrease-btn"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-semibold" data-testid="quantity-display">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 rounded-full bg-[#0A0A0A] hover:bg-[#262626] flex items-center justify-center transition-colors"
                        data-testid="quantity-increase-btn"
                      >
                        +
                      </button>
                    </div>
                    
                    <Button
                      onClick={handleAddToCart}
                      className="btn-primary px-8 py-6 rounded-full font-semibold text-lg flex items-center gap-2"
                      data-testid="add-to-cart-btn"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </Button>
                  </div>
                )}

                {(isUnavailable || isOutOfStock) && (
                  <Badge 
                    variant="destructive" 
                    className="px-6 py-3 text-base"
                    data-testid="unavailable-badge"
                  >
                    {isUnavailable ? 'Currently Unavailable' : 'Out of Stock'}
                  </Badge>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Details Section */}
      <section className="py-20 bg-[#0A0A0A]" data-testid="details-section">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Product Details</h2>
            <p className="text-[#A1A1AA] max-w-2xl mx-auto">
              Experience the refreshing taste of our premium Strawberry Punch vape
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Check, title: "Premium Quality", desc: "Made with high-grade ingredients" },
              { icon: Droplets, title: "Rich Flavor", desc: "Authentic strawberry punch taste" },
              { icon: Package, title: "Easy to Use", desc: "Ready to use out of the box" },
              { icon: Zap, title: "Long Lasting", desc: "Extended battery life" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="card-surface p-6 text-center"
                data-testid={`detail-card-${index}`}
              >
                <feature.icon className="w-10 h-10 text-[#FF4500] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#A1A1AA] text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Age Disclaimer */}
      <section className="py-8 bg-[#050505] border-t border-[#262626]" data-testid="disclaimer-section">
        <div className="container-main text-center">
          <p className="text-[#A1A1AA] text-sm">
            This product is intended for adults 18 years of age or older.
            Please vape responsibly.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Home;
