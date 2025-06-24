import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "wouter";

export function CartSidebar() {
  const { 
    cartItems, 
    cartTotal, 
    cartCount, 
    updateQuantity, 
    removeFromCart,
    isLoading 
  } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Please log in to view your cart</p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Log In
            </Button>
          </div>
        </div>
      </SheetContent>
    );
  }

  if (isLoading) {
    return (
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 py-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    );
  }

  return (
    <SheetContent className="w-96 flex flex-col">
      <SheetHeader>
        <SheetTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </div>
          <Badge variant="secondary">{cartCount} items</Badge>
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-6">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <img
                src={item.product.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">
                  {item.product.name}
                </h4>
                
                {(item.size || item.color) && (
                  <div className="text-xs text-gray-600 mb-2 space-x-2">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SheetFooter className="border-t pt-6">
        <div className="w-full space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-xl">${cartTotal.toFixed(2)}</span>
          </div>
          
          <Link href="/checkout" className="block w-full">
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </SheetFooter>
    </SheetContent>
  );
}
