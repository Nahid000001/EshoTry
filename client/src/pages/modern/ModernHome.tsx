import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedVirtualTryOn } from "@/components/modern/EnhancedVirtualTryOn";
import { useVirtualTryOn } from "@/hooks/useVirtualTryOn";
import { 
  Camera, 
  Heart, 
  ShoppingBag, 
  Star,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Smartphone,
  BarChart3,
  Box,
  Zap,
  Shield,
  Users,
  Globe,
  Award,
  Play,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ModernHome() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Auto-advance hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.title = "EshoTry - Your Personal Fashion Dashboard";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover personalized fashion recommendations, explore trending styles, and experience virtual try-on technology on your EshoTry dashboard.');
    }
  }, []);

  const heroSlides = [
    {
      title: "AI-Powered Virtual Try-On",
      subtitle: "See how clothes look on you before you buy",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
      cta: "Try It Now",
      action: handleVirtualTryOn
    },
    {
      title: "Personalized Recommendations",
      subtitle: "Discover styles that match your unique taste",
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop",
      cta: "Explore Styles",
      action: () => window.location.href = '/products'
    },
    {
      title: "Advanced AR Experience",
      subtitle: "Try clothes in real-time with your camera",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop",
      cta: "Experience AR",
      action: () => window.location.href = '/advanced-features'
    }
  ];

  const features = [
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Virtual Try-On",
      description: "AI-powered virtual fitting with 89% accuracy",
      color: "text-blue-600"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Smart Recommendations",
      description: "Personalized suggestions with 94% relevance",
      color: "text-purple-600"
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "AR Experience",
      description: "Real-time camera-based augmented reality",
      color: "text-green-600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Privacy First",
      description: "Auto-deletion of photos, GDPR compliant",
      color: "text-red-600"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: <Users className="h-5 w-5" /> },
    { label: "Countries", value: "25+", icon: <Globe className="h-5 w-5" /> },
    { label: "Accuracy Rate", value: "94%", icon: <Award className="h-5 w-5" /> },
    { label: "Processing Speed", value: "<2s", icon: <Zap className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold">EshoTry</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              {heroSlides[currentSlide].title}
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto">
              {heroSlides[currentSlide].subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                onClick={heroSlides[currentSlide].action}
                size="lg"
                className="px-8 py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700"
              >
                {heroSlides[currentSlide].cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Link href="/products">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold border-white text-white hover:bg-white hover:text-gray-900"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Slide Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Slide Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-6"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'Fashion Lover'}! 👋
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover your personalized fashion recommendations and trending styles with our AI-powered platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button onClick={handleVirtualTryOn} className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
                <Camera className="mr-2 h-5 w-5" />
                Try Virtual Fit
              </Button>
              <Link href="/products">
                <Button variant="outline" className="text-lg px-8 py-3">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Browse All
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Revolutionary AI Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of fashion shopping with our cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white">
                  <CardContent className="p-6 text-center">
                    <div className={`${feature.color} mb-4 flex justify-center`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center text-white"
              >
                <div className="flex justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-purple-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Recommended for You
            </h2>
            <p className="text-xl text-gray-600">
              Curated selections based on your style preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.slice(0, 4).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Experience AI Try-On
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See our enhanced virtual try-on technology in action with real-time processing and AI-powered recommendations
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <EnhancedVirtualTryOn
              productId={recommendedProducts[0]?.id || 1}
              productImage={recommendedProducts[0]?.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"}
              garmentType="top"
              productName={recommendedProducts[0]?.name || "Premium T-Shirt"}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold">
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className="text-xl text-purple-100">
              Join thousands of users who are already experiencing the future of fashion
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                onClick={handleVirtualTryOn}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
              >
                <Camera className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              
              <Link href="/products">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-3"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
