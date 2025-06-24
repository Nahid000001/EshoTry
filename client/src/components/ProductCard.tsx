import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Heart, Star, Camera } from "lucide-react";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, isAddingToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      productId: product.id,
      quantity: 1,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleQuickTryOn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    alert("Quick Try-On feature coming soon! This will launch virtual try-on for this specific product.");
  };

  const currentPrice = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price);
  const originalPrice = parseFloat(product.price);
  const hasDiscount = product.salePrice && currentPrice < originalPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="relative">
          <img
            src={product.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"}
            alt={product.name}
            className="w-full h-64 object-cover product-hover-scale"
          />
          
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <Heart 
              className={`h-4 w-4 ${isWishlisted ? 'text-accent fill-current' : 'text-gray-600'}`} 
            />
          </Button>

          {/* Quick Try-On Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleQuickTryOn}
            className="absolute top-3 left-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Camera className="h-3 w-3 mr-1" />
            Quick Try-On
          </Button>

          {/* Discount Badge */}
          {hasDiscount && (
            <Badge
              variant="destructive"
              className="absolute top-3 left-3 bg-accent text-white text-xs font-medium"
            >
              {discountPercentage}% OFF
            </Badge>
          )}

          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="secondary" className="bg-white text-black">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
          {product.brand && (
            <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            {product.rating && parseFloat(product.rating) > 0 && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-600">
                  {parseFloat(product.rating).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            className="w-full bg-primary hover:bg-primary/90 text-white transition-colors duration-300"
          >
            {isAddingToCart ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
