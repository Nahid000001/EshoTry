import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { 
  Camera, 
  Brain, 
  Shirt, 
  Star, 
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react";

export default function Landing() {
  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true, limit: 4 }],
    queryFn: async () => {
      const res = await fetch("/api/products?featured=true&limit=4");
      if (!res.ok) throw new Error("Failed to fetch featured products");
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const handleVirtualTryOn = () => {
    alert("Virtual Try-On feature coming soon! This will launch our AI-powered try-on experience.");
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Newsletter signup coming soon!");
  };

  useEffect(() => {
    document.title = "EshoTry - AI-Powered Fashion Platform | Virtual Try-On Technology";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Experience the future of online fashion shopping with EshoTry\'s AI-powered virtual try-on technology, personalized recommendations, and perfect fit guarantee.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Experience the future of online fashion shopping with EshoTry\'s AI-powered virtual try-on technology, personalized recommendations, and perfect fit guarantee.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative">
        <div className="h-96 md:h-[500px] hero-bg">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow">
                Experience Fashion with AI
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 text-shadow">
                Virtual try-on, personalized recommendations, perfect fit guaranteed
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleVirtualTryOn}
                  className="bg-secondary hover:bg-secondary/90 text-black font-semibold"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Start Virtual Try-On
                </Button>
                <Link href="/products">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="glass-effect text-white border-white hover:bg-white/20"
                  >
                    Explore Collection
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Banner */}
      <section className="bg-gradient-to-r from-primary to-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Brain className="h-8 w-8 text-secondary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">AI Recommendations</h3>
              <p className="text-sm opacity-90">Personalized suggestions based on your style</p>
            </div>
            <div className="text-center">
              <Camera className="h-8 w-8 text-secondary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Virtual Try-On</h3>
              <p className="text-sm opacity-90">See how clothes look before you buy</p>
            </div>
            <div className="text-center">
              <Shirt className="h-8 w-8 text-secondary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Perfect Fit</h3>
              <p className="text-sm opacity-90">Size recommendations using your measurements</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <div className="group cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={category.imageUrl || `https://images.unsplash.com/photo-${category.id % 2 === 0 ? '1594633312681-425c7b97ccd1' : '1507003211169-0a1dd7228f2d'}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800`}
                      alt={category.name}
                      className="w-full h-full object-cover product-hover-scale"
                    />
                  </div>
                  <h3 className="font-semibold text-center">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary">Trending Now</h2>
            <Link href="/products">
              <Button variant="ghost" className="text-secondary hover:text-secondary/80">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Try-On CTA */}
      <section className="py-16 bg-gradient-to-r from-secondary to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
              alt="Virtual Try-On Technology"
              className="mx-auto rounded-lg shadow-lg max-w-md"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-shadow">
            Try Before You Buy
          </h2>
          <p className="text-xl text-white opacity-90 mb-8 text-shadow">
            Experience our revolutionary AI-powered virtual try-on technology
          </p>
          <Button
            size="lg"
            onClick={handleVirtualTryOn}
            className="bg-white text-secondary hover:bg-gray-100 font-semibold"
          >
            <Camera className="mr-2 h-5 w-5" />
            Launch Virtual Try-On
          </Button>
        </div>
      </section>

      {/* Newsletter & Social */}
      <section className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-gray-300 mb-6">
                Get the latest fashion trends and exclusive offers delivered to your inbox
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 text-gray-900 rounded-r-none"
                  required
                />
                <Button
                  type="submit"
                  className="bg-secondary hover:bg-secondary/90 text-black font-semibold rounded-l-none"
                >
                  Subscribe
                </Button>
              </form>
            </div>
            <div className="text-center md:text-right">
              <h4 className="text-xl font-semibold mb-4">Follow Us</h4>
              <div className="flex justify-center md:justify-end space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:text-secondary">
                  <Instagram className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:text-secondary">
                  <Facebook className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:text-secondary">
                  <Twitter className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:text-secondary">
                  <Linkedin className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                EshoTry
                <Badge variant="secondary" className="ml-2 text-xs bg-secondary text-black">
                  AI
                </Badge>
              </h3>
              <p className="text-gray-400 mb-4">
                AI-powered fashion platform revolutionizing online shopping with virtual try-on technology.
              </p>
              <div className="flex space-x-3">
                <Badge className="bg-secondary text-black">AI-Powered</Badge>
                <Badge className="bg-accent text-white">Virtual Try-On</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products?category=women" className="hover:text-white transition-colors">Women</Link></li>
                <li><Link href="/products?category=men" className="hover:text-white transition-colors">Men</Link></li>
                <li><Link href="/products?category=kids" className="hover:text-white transition-colors">Kids</Link></li>
                <li><Link href="/products?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
                <li><Link href="/products?sale=true" className="hover:text-white transition-colors">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Virtual Try-On</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Recommendations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Size Technology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EshoTry. All rights reserved. Powered by AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
