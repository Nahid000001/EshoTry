import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Heart, 
  Camera, 
  ShoppingBag, 
  Share2,
  ArrowLeft,
  Truck,
  RotateCcw,
  Shield,
  Plus,
  Minus
} from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const productId = parseInt(params.id || '0');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const { addToCart, isAddingToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
    enabled: !!productId,
  });

  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { categoryId: product?.categoryId, limit: 4 }],
    queryFn: async () => {
      if (!product?.categoryId) return [];
      const res = await fetch(`/api/products?categoryId=${product.categoryId}&limit=4`);
      if (!res.ok) return [];
      const products = await res.json();
      return products.filter((p: Product) => p.id !== productId);
    },
    enabled: !!product?.categoryId,
  });

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - EshoTry | ${product.brand || 'Fashion'}`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      const description = `Shop ${product.name} by ${product.brand || 'EshoTry'} for $${product.price}. ${product.description || 'Premium quality fashion with virtual try-on technology.'}`;
      
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Size required",
        description: "Please select a size before adding to cart",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      productId: product.id,
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted 
        ? "Item has been removed from your wishlist" 
        : "Item has been added to your wishlist",
    });
  };

  const handleVirtualTryOn = () => {
    alert("Virtual Try-On feature coming soon! This will launch virtual try-on for this specific product.");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on EshoTry!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link has been copied to clipboard",
      });
    }
  };

  const currentPrice = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price);
  const originalPrice = parseFloat(product.price);
  const hasDiscount = product.salePrice && currentPrice < originalPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white">
              <img
                src={productImages[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-square rounded overflow-hidden border-2 ${
                      activeImageIndex === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-primary">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleWishlistToggle}>
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {product.brand && (
                <p className="text-lg text-gray-600 mb-2">{product.brand}</p>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-primary">
                    ${currentPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                      <Badge variant="destructive" className="bg-accent">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>

                {product.rating && parseFloat(product.rating) > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{parseFloat(product.rating).toFixed(1)}</span>
                    {product.reviewCount && (
                      <span className="text-sm text-gray-600">({product.reviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>

              {product.stock !== undefined && (
                <div className="mb-4">
                  {product.stock === 0 ? (
                    <Badge variant="destructive">Out of Stock</Badge>
                  ) : product.stock < 10 ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Only {product.stock} left!
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      In Stock
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock !== undefined && quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleVirtualTryOn}
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold"
              >
                <Camera className="mr-2 h-5 w-5" />
                Try Virtual Fit
              </Button>
              
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {isAddingToCart ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>

            {/* Product Features */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="h-4 w-4" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw className="h-4 w-4" />
                <span>30-day returns & exchanges</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Secure payment & data protection</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-primary mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group cursor-pointer">
                  <Link href={`/products/${relatedProduct.id}`}>
                    <CardContent className="p-0">
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={relatedProduct.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover product-hover-scale"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium line-clamp-2 mb-2">{relatedProduct.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
                            ${relatedProduct.salePrice || relatedProduct.price}
                          </span>
                          {relatedProduct.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs">{parseFloat(relatedProduct.rating).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Virtual Try-On Section */}
      {showVirtualTryOn && isAuthenticated && (
        <div className="mt-8">
          <VirtualTryOn
            productId={product.id}
            productImage={product.imageUrl || ''}
            garmentType={getGarmentType(product.categoryId)}
          />
        </div>
      )}

      {/* AI Recommendations */}
      <div className="mt-8">
        <RecommendationSection
          type="similar"
          productId={product.id}
          title="You Might Also Like"
          limit={4}
        />
      </div>
    </div>
  );
}

function getGarmentType(categoryId: number | null): 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories' {
  switch (categoryId) {
    case 1: return 'top';      // Tops
    case 2: return 'bottom';   // Bottoms
    case 3: return 'dress';    // Dresses
    case 4: return 'top';      // Outerwear (treated as top)
    case 5: return 'accessories'; // Accessories
    default: return 'top';
  }
}
