import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Droplets, Zap, ArrowLeft, Check, Truck, Shield, Loader2 } from "lucide-react";
import axios from "axios";
import { useCart, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/product/${productId}`);
      setProduct(response.data);
    } catch (err) {
      setError("Product not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && product.is_available && product.stock > 0) {
      addToCart(product, quantity);
      setQuantity(1);
    }
  };

  const updateQuantity = (delta) => {
    const newQty = Math.max(1, Math.min(product?.stock || 1, quantity + delta));
    setQuantity(newQty);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20" data-testid="product-loading">
        <Loader2 className="w-12 h-12 text-[#FF4500] animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20" data-testid="product-error">
        <div className="text-center">
          <Package className="w-16 h-16 text-[#A1A1AA] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link to="/">
            <Button className="btn-primary rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <main className="min-h-screen pt-24 pb-12" data-testid="product-detail-page">
      <div className="container-main">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-white mb-8 transition-colors"
          data-testid="back-to-shop"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="sticky top-24">
              {/* Main Image */}
              <div className="relative bg-[#0A0A0A] rounded-2xl p-8 border border-[#262626]">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#FF4500] rounded-2xl blur-[100px] opacity-10" />
                
                <motion.img
                  src={product.image_url || "https://via.placeholder.com/500"}
                  alt={product.name}
                  className="relative z-10 w-full max-h-[500px] object-contain mx-auto drop-shadow-2xl"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  data-testid="product-detail-image"
                />

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center z-20">
                    <Badge variant="destructive" className="text-lg px-6 py-2">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Badge */}
            <Badge className="mb-4 bg-[#FF4500]/20 text-[#FF4500] border-0 px-4 py-1">
              Premium Vape
            </Badge>

            {/* Product Name */}
            <h1 
              className="text-4xl sm:text-5xl font-bold mb-4 uppercase tracking-wide"
              data-testid="product-detail-name"
            >
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-[#A1A1AA] text-lg mb-6" data-testid="product-detail-description">
              {product.description || "Premium quality vape with exceptional flavor and long-lasting performance."}
            </p>

            {/* Price */}
            <div className="mb-8">
              <p className="text-sm text-[#A1A1AA] mb-1">Price</p>
              <p className="text-5xl font-bold text-[#FF4500]" data-testid="product-detail-price">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Product Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="card-surface p-4 text-center">
                <Droplets className="w-6 h-6 text-[#FF4500] mx-auto mb-2" />
                <p className="text-xs text-[#A1A1AA] mb-1">Flavor</p>
                <p className="font-semibold text-sm" data-testid="product-detail-flavor">{product.flavor}</p>
              </div>
              
              <div className="card-surface p-4 text-center">
                <Zap className="w-6 h-6 text-[#FF4500] mx-auto mb-2" />
                <p className="text-xs text-[#A1A1AA] mb-1">Nicotine</p>
                <p className="font-semibold text-sm" data-testid="product-detail-nicotine">{product.nicotine_strength}</p>
              </div>
              
              <div className="card-surface p-4 text-center">
                <Package className="w-6 h-6 text-[#FF4500] mx-auto mb-2" />
                <p className="text-xs text-[#A1A1AA] mb-1">Stock</p>
                <p className={`font-semibold text-sm ${isOutOfStock ? 'text-[#EF4444]' : 'text-[#10B981]'}`} data-testid="product-detail-stock">
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} Available`}
                </p>
              </div>
              
              <div className="card-surface p-4 text-center">
                <Check className="w-6 h-6 text-[#FF4500] mx-auto mb-2" />
                <p className="text-xs text-[#A1A1AA] mb-1">Status</p>
                <p className="font-semibold text-sm text-[#10B981]">
                  {product.is_available ? 'Available' : 'Unavailable'}
                </p>
              </div>
            </div>

            {/* Add to Cart Section */}
            {!isOutOfStock && product.is_available && (
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                {/* Quantity Selector */}
                <div className="flex items-center gap-3 bg-[#121212] rounded-full p-2">
                  <button
                    onClick={() => updateQuantity(-1)}
                    className="w-12 h-12 rounded-full bg-[#0A0A0A] hover:bg-[#262626] flex items-center justify-center transition-colors text-xl font-semibold"
                    data-testid="product-detail-qty-decrease"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-xl" data-testid="product-detail-qty">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(1)}
                    className="w-12 h-12 rounded-full bg-[#0A0A0A] hover:bg-[#262626] flex items-center justify-center transition-colors text-xl font-semibold"
                    data-testid="product-detail-qty-increase"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 sm:flex-none btn-primary px-10 py-6 rounded-full font-semibold text-lg flex items-center justify-center gap-3"
                  data-testid="product-detail-add-to-cart"
                >
                  <ShoppingCart className="w-6 h-6" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
              </div>
            )}

            {/* Out of Stock Message */}
            {(isOutOfStock || !product.is_available) && (
              <div className="mb-8 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-center">
                <p className="text-[#EF4444] font-semibold">
                  This product is currently unavailable
                </p>
                <p className="text-sm text-[#A1A1AA] mt-1">
                  Please check back later or contact us for more information
                </p>
              </div>
            )}

            {/* Features */}
            <div className="border-t border-[#262626] pt-8">
              <h3 className="text-lg font-bold mb-4">Why Choose This Product</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FF4500]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-[#FF4500]" />
                  </div>
                  <div>
                    <p className="font-semibold">Premium Quality</p>
                    <p className="text-sm text-[#A1A1AA]">Made with high-grade ingredients for the best experience</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FF4500]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-[#FF4500]" />
                  </div>
                  <div>
                    <p className="font-semibold">Fast Delivery</p>
                    <p className="text-sm text-[#A1A1AA]">Quick shipping across Kosovo, Albania, Macedonia & Europe</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FF4500]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#FF4500]" />
                  </div>
                  <div>
                    <p className="font-semibold">Guaranteed Authentic</p>
                    <p className="text-sm text-[#A1A1AA]">100% genuine products with quality assurance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="mt-8 p-4 bg-[#121212] rounded-xl">
              <p className="text-sm text-[#A1A1AA] mb-2">Shipping Rates:</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>🇽🇰 Kosovë: <strong className="text-white">2€</strong></span>
                <span>🇲🇰 Maqedoni: <strong className="text-white">5€</strong></span>
                <span>🇦🇱 Shqipëri: <strong className="text-white">5€</strong></span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Age Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#A1A1AA]">
            This product is intended for adults 18 years of age or older. Please vape responsibly.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
