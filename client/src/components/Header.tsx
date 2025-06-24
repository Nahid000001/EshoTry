import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  Camera, 
  User, 
  ShoppingBag, 
  Menu,
  LogIn,
  LogOut
} from "lucide-react";
import { CartSidebar } from "./CartSidebar";

export function Header() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, isLoading } = useAuth();
  const { cartCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVirtualTryOn = () => {
    // For now, show a placeholder message
    alert("Virtual Try-On feature coming soon! This will launch our AI-powered try-on experience.");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">EshoTry</h1>
            <Badge variant="secondary" className="ml-2 text-xs bg-secondary text-black">
              AI
            </Badge>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="search"
                placeholder="Search for clothing, brands, styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVirtualTryOn}
              className="p-2 text-gray-600 hover:text-secondary transition-colors"
            >
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Try-On</span>
            </Button>

            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-gray-600 hover:text-secondary transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Profile</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                  className="p-2 text-gray-600 hover:text-secondary transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/login"}
                className="p-2 text-gray-600 hover:text-secondary transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Login</span>
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-600 hover:text-secondary transition-colors relative"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {cartCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-accent"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <CartSidebar />
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden border-t border-gray-200 p-4">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </form>
      </div>
    </header>
  );
}
