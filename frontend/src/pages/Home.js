import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Droplets, Zap, Check, AlertCircle, Truck, Globe, Star } from "lucide-react";
import { useCart, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "sonner";

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProduct, setFeaturedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      const availableProducts = response.data.filter(p => p.is_available);
      setProducts(availableProducts);
      if (availableProducts.length > 0) {
        setFeaturedProduct(availableProducts[0]);
        // Initialize quantities for all products
        const initialQuantities = {};
        availableProducts.forEach(p => {
          initialQuantities[p.id] = 1;
        });
        setQuantities(initialQuantities);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    if (product && product.is_available && product.stock > 0) {
      addToCart(product, qty);
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    }
  };

  const updateQuantity = (productId, delta, maxStock) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [productId]: newQty };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="w-12 h-12 border-4 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20" data-testid="no-products">
        <div className="text-center">
          <Package className="w-16 h-16 text-[#A1A1AA] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Products Available</h2>
          <p className="text-[#A1A1AA]">Check back soon for new products!</p>
        </div>
      </div>
    );
  }

  const isOutOfStock = (product) => product.stock <= 0;

  return (
    <main className="min-h-screen pt-20" data-testid="home-page">
      {/* Hero Section - Marketing Banner */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden" data-testid="hero-section">
        {/* Background Text */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <motion.span
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hero-text-bg"
          >
            PREMIUM VAPES
          </motion.span>
        </div>

        <div className="container-main relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Marketing Image */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center order-1 lg:order-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#FF4500] rounded-full blur-[100px] opacity-20" />
                <motion.img
                  src="https://customer-assets.emergentagent.com/job_mooki-single-vape/artifacts/534ct6rv_shisha.jpg"
                  alt="Premium Vapes"
                  className="relative z-10 w-full max-w-md product-glow animate-float"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                  data-testid="hero-image"
                />
              </div>
            </motion.div>

            {/* Marketing Text */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-2 lg:order-1 text-center lg:text-left"
            >
              <Badge 
                className="mb-4 bg-[#FF4500]/20 text-[#FF4500] border-0 px-4 py-1"
              >
                MOOKI STORE
              </Badge>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 uppercase tracking-wide">
                PREMIUM<br />
                <span className="text-[#FF4500]">VAPES</span>
              </h1>
              
              <p className="text-[#A1A1AA] text-lg mb-8 max-w-lg mx-auto lg:mx-0">
                Discover our collection of high-quality vape products. Premium flavors, exceptional quality, delivered to your door.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="card-surface p-4 text-center"
                >
                  <Star className="w-6 h-6 text-[#FF4500] mx-auto mb-2" />
                  <p className="text-xs text-[#A1A1AA] mb-1">Quality</p>
                  <p className="font-semibold text-sm">Premium</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="card-surface p-4 text-center"
                >
                  <Truck className="w-6 h-6 text-[#FF4500] mx-auto mb-2" />
                  <p className="text-xs text-[#A1A1AA] mb-1">Shipping</p>
                  <p className="font-semibold text-sm">Fast Delivery</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="card-surface p-4 text-center"
                >
                  <Globe className="w-6 h-6 text-[#FF4500] mx-auto mb-2" />
                  <p className="text-xs text-[#A1A1AA] mb-1">Coverage</p>
                  <p className="font-semibold text-sm">All Europe</p>
                </motion.div>
              </div>

              {/* CTA Button - Scroll to Products */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <Button
                  onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary px-8 py-6 rounded-full font-semibold text-lg flex items-center gap-2"
                  data-testid="shop-now-btn"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Shop Now
                </Button>
                <p className="text-[#A1A1AA] text-sm">
                  {products.length} Products Available
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Store Info Banner */}
      <section className="py-12 bg-gradient-to-r from-[#FF4500]/10 via-[#0A0A0A] to-[#FF4500]/10 border-y border-[#262626]" data-testid="store-info-section">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-[#FF4500]">PUNCH</h2>
            <div className="flex items-center justify-center gap-2 text-[#10B981]">
              <Star className="w-5 h-5 fill-current" />
              <p className="text-lg font-medium">Produkte me cilësi të lartë</p>
              <Star className="w-5 h-5 fill-current" />
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card-surface p-5 text-center"
            >
              <div className="w-12 h-12 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-6 h-6 text-[#10B981]" />
              </div>
              <p className="font-semibold text-[#10B981]">🟢 Online Shopping</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card-surface p-5 text-center"
            >
              <div className="w-12 h-12 bg-[#FF4500]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-[#FF4500]" />
              </div>
              <p className="font-semibold mb-2">🟢 Posta</p>
              <div className="text-sm text-[#A1A1AA] space-y-1">
                <p>🇽🇰 Kosovë: <span className="text-white font-semibold">2€</span></p>
                <p>🇲🇰 Maqedoni: <span className="text-white font-semibold">5€</span></p>
                <p>🇦🇱 Shqipëri: <span className="text-white font-semibold">5€</span></p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="card-surface p-5 text-center"
            >
              <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <p className="font-semibold text-[#3B82F6]">🟢 Transport gjithë Europën</p>
              <p className="text-sm text-[#A1A1AA] mt-1">🚚📦</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="card-surface p-5 text-center"
            >
              <div className="w-12 h-12 bg-[#EAB308]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-[#EAB308]" />
              </div>
              <p className="font-semibold text-[#EAB308]">🔛 Cilësi e Garantuar</p>
              <p className="text-sm text-[#A1A1AA] mt-1">Premium Quality</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* All Products Section */}
      <section id="products-section" className="py-20 bg-[#0A0A0A]" data-testid="all-products-section">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Products</h2>
            <p className="text-[#A1A1AA] max-w-2xl mx-auto">
              Explore our complete collection of premium vape products
            </p>
          </motion.div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-[#A1A1AA]">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No products available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="card-surface p-5 flex flex-col cursor-pointer group"
                  data-testid={`product-card-${product.id}`}
                >
                  {/* Product Image - Clickable */}
                  <div 
                    className="relative mb-4 bg-[#121212] rounded-xl p-6 flex items-center justify-center h-64 group-hover:bg-[#1a1a1a] transition-colors"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img
                      src={product.image_url || "https://via.placeholder.com/300"}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform"
                    />
                    {isOutOfStock(product) && (
                      <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                    {/* View Details Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <span className="bg-[#FF4500] text-white px-4 py-2 rounded-full text-sm font-semibold">
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Product Info - Clickable */}
                  <div 
                    className="flex-grow cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <h3 className="text-lg font-bold mb-1 group-hover:text-[#FF4500] transition-colors">{product.name}</h3>
                    <p className="text-sm text-[#A1A1AA] mb-2">{product.flavor}</p>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-bold text-[#FF4500]">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-[#A1A1AA]">
                        {product.nicotine_strength} • {product.stock} in stock
                      </p>
                    </div>
                  </div>

                  {/* Add to Cart */}
                  {!isOutOfStock(product) ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-[#121212] rounded-full p-1">
                        <button
                          onClick={() => updateQuantity(product.id, -1, product.stock)}
                          className="w-8 h-8 rounded-full bg-[#0A0A0A] hover:bg-[#262626] flex items-center justify-center transition-colors text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">
                          {quantities[product.id] || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1, product.stock)}
                          className="w-8 h-8 rounded-full bg-[#0A0A0A] hover:bg-[#262626] flex items-center justify-center transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 btn-primary rounded-full font-semibold flex items-center justify-center gap-2"
                        data-testid={`add-to-cart-${product.id}`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  ) : (
                    <Button disabled className="w-full rounded-full" variant="secondary">
                      Out of Stock
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Details Section */}
      <section className="py-20 bg-[#050505]" data-testid="details-section">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-[#A1A1AA] max-w-2xl mx-auto">
              Experience the best quality vape products
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Check, title: "Premium Quality", desc: "Made with high-grade ingredients" },
              { icon: Droplets, title: "Rich Flavor", desc: "Authentic taste experience" },
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
