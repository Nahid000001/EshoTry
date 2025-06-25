import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VirtualTryOnModal } from "@/components/VirtualTryOnModal";
import { useVirtualTryOn } from "@/hooks/useVirtualTryOn";
import { 
  Camera, 
  Heart, 
  ShoppingBag, 
  Star,
  TrendingUp,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const { data: recommendedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true, limit: 8 }],
    queryFn: async () => {
      const res = await fetch("/api/products?featured=true&limit=8");
      if (!res.ok) throw new Error("Failed to fetch recommended products");
      return res.json();
    },
  });

  const { data: recentProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { limit: 4 }],
    queryFn: async () => {
      const res = await fetch("/api/products?limit=4");
      if (!res.ok) throw new Error("Failed to fetch recent products");
      return res.json();
    },
  });

  const { 
    isOpen, 
    productId, 
    productImage, 
    garmentType, 
    openVirtualTryOn, 
    closeVirtualTryOn 
  } = useVirtualTryOn();

  const handleVirtualTryOn = () => {
    openVirtualTryOn({
      productId: recommendedProducts[0]?.id || 1,
      productImage: recommendedProducts[0]?.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      garmentType: "top"
    });
  };

  useEffect(() => {
    document.title = "EshoTry - Your Personal Fashion Dashboard";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover personalized fashion recommendations, explore trending styles, and experience virtual try-on technology on your EshoTry dashboard.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Welcome back, {user?.firstName || 'Fashion Lover'}! 👋
              </h1>
              <p className="text-gray-600">
                Discover your personalized fashion recommendations and trending styles
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-4">
              <Button onClick={handleVirtualTryOn} className="bg-secondary hover:bg-secondary/90 text-black">
                <Camera className="mr-2 h-4 w-4" />
                Try Virtual Fit
              </Button>
              <Link href="/products">
                <Button variant="outline">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse All
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Style Score</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  AI style matching accuracy
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Items saved for later
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Try-On Sessions</CardTitle>
                <Camera className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Virtual fittings this month
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-primary">Recommended for You</h2>
              <Badge variant="secondary" className="bg-secondary text-black">
                AI Powered
              </Badge>
            </div>
            <Link href="/products?recommended=true">
              <Button variant="ghost" className="text-secondary hover:text-secondary/80">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-primary">Trending Now</h2>
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <Link href="/products?trending=true">
              <Button variant="ghost" className="text-secondary hover:text-secondary/80">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Style Categories */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Shop by Style</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Casual", image: "photo-1507003211169-0a1dd7228f2d", href: "/products?style=casual" },
              { name: "Formal", image: "photo-1594633312681-425c7b97ccd1", href: "/products?style=formal" },
              { name: "Sporty", image: "photo-1571019613454-1cb2f99b2d8b", href: "/products?style=sporty" },
              { name: "Trendy", image: "photo-1469334031218-e382a71b716b", href: "/products?style=trendy" },
            ].map((style) => (
              <Link key={style.name} href={style.href}>
                <div className="group cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={`https://images.unsplash.com/${style.image}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400`}
                      alt={style.name}
                      className="w-full h-full object-cover product-hover-scale"
                    />
                  </div>
                  <h3 className="font-semibold text-center">{style.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Showcase */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Next-Generation Fashion AI</h2>
            <p className="text-xl opacity-90 mb-8">
              Experience the future with 3D visualization, realistic fabric physics, mobile AR, and intelligent recommendations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur">
              <Box className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">3D Visualization</h3>
              <p className="text-sm opacity-80">Interactive outfit combinations with AI compatibility scoring</p>
            </div>
            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur">
              <Sparkles className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Fabric Physics</h3>
              <p className="text-sm opacity-80">Realistic drape, stretch, and texture simulation</p>
            </div>
            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur">
              <Smartphone className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Mobile AR</h3>
              <p className="text-sm opacity-80">Real-time camera-based augmented reality try-on</p>
            </div>
            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-sm opacity-80">85%+ accuracy with seasonal trends and wardrobe analysis</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={handleVirtualTryOn}
              className="bg-secondary hover:bg-secondary/90 text-black font-semibold"
            >
              <Camera className="mr-2 h-5 w-5" />
              Try Virtual Fitting
            </Button>
            <Link href="/advanced">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                <Sparkles className="mr-2 h-5 w-5" />
                Explore AI Features
              </Button>
            </Link>
            <Link href="/wardrobe">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                <BarChart3 className="mr-2 h-5 w-5" />
                Analyze Wardrobe
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Virtual Try-On Modal */}
      <VirtualTryOnModal
        isOpen={isOpen}
        onClose={closeVirtualTryOn}
        productId={productId}
        productImage={productImage}
        garmentType={garmentType}
      />
    </div>
  );
}
