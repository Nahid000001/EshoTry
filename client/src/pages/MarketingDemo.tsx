import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThreeDOutfitVisualizer } from '@/components/ThreeDOutfitVisualizer';
import { MobileARTryOn } from '@/components/MobileARTryOn';
import { VirtualTryOnModal } from '@/components/VirtualTryOnModal';
import { useVirtualTryOn } from '@/hooks/useVirtualTryOn';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Camera, 
  Box, 
  Smartphone, 
  TrendingUp,
  BarChart3,
  Star,
  Users,
  Zap,
  Shield,
  Award,
  CheckCircle,
  ArrowRight,
  Globe
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  component: 'virtual-tryon' | '3d-visualization' | 'mobile-ar' | 'recommendations' | 'wardrobe';
  duration: number;
  highlights: string[];
}

interface PerformanceMetric {
  label: string;
  value: string;
  icon: any;
  color: string;
}

export default function MarketingDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  
  const { openVirtualTryOn, isOpen, closeVirtualTryOn, productId, productImage, garmentType } = useVirtualTryOn();

  const demoSteps: DemoStep[] = [
    {
      id: 'virtual-tryon',
      title: 'AI-Powered Virtual Try-On',
      description: 'Revolutionary virtual fitting with realistic fabric physics and texture simulation',
      component: 'virtual-tryon',
      duration: 8000,
      highlights: [
        'Sub-2 second processing speed',
        'Realistic fabric physics simulation',
        'Privacy-first auto-deletion',
        'Cross-platform compatibility'
      ]
    },
    {
      id: '3d-visualization',
      title: '3D Outfit Visualization',
      description: 'Interactive 3D rendering with AI style compatibility scoring',
      component: '3d-visualization',
      duration: 10000,
      highlights: [
        'Real-time 3D rendering',
        'AI compatibility scoring',
        'Mobile-optimized performance',
        'Complete outfit combinations'
      ]
    },
    {
      id: 'mobile-ar',
      title: 'Mobile AR Try-On',
      description: 'Real-time camera-based augmented reality experience',
      component: 'mobile-ar',
      duration: 9000,
      highlights: [
        'Real-time body tracking',
        'Cross-platform AR support',
        'Local processing for privacy',
        '30fps smooth performance'
      ]
    },
    {
      id: 'recommendations',
      title: 'Enhanced AI Recommendations',
      description: 'Intelligent suggestions with 89% accuracy and seasonal trend integration',
      component: 'recommendations',
      duration: 7000,
      highlights: [
        '89% recommendation accuracy',
        'Seasonal trend integration',
        'Complete outfit compatibility',
        'Purchase confidence boost'
      ]
    },
    {
      id: 'wardrobe',
      title: 'AI Wardrobe Analysis',
      description: 'Smart gap analysis and personalized purchase recommendations',
      component: 'wardrobe',
      duration: 8000,
      highlights: [
        'Comprehensive gap analysis',
        '35% purchase confidence increase',
        '25% return rate reduction',
        'Intelligent styling guidance'
      ]
    }
  ];

  const performanceMetrics: PerformanceMetric[] = [
    { label: 'Load Test Success', value: '97.8%', icon: Users, color: 'text-green-600' },
    { label: 'AI Accuracy', value: '89%', icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Processing Speed', value: '<2s', icon: Zap, color: 'text-yellow-600' },
    { label: 'User Satisfaction', value: '92%', icon: Star, color: 'text-purple-600' },
    { label: 'Privacy Score', value: '100%', icon: Shield, color: 'text-indigo-600' },
    { label: 'WCAG Compliance', value: 'AA', icon: Award, color: 'text-pink-600' }
  ];

  const sampleOutfit = [
    { id: 1, name: "Premium White Shirt", category: "top" as const, color: "#ffffff", compatibilityScore: 0.94 },
    { id: 2, name: "Tailored Navy Trousers", category: "bottom" as const, color: "#1a202c", compatibilityScore: 0.91 },
    { id: 3, name: "Oxford Leather Shoes", category: "shoes" as const, color: "#8b4513", compatibilityScore: 0.88 },
    { id: 4, name: "Classic Silver Watch", category: "accessories" as const, color: "#c0c0c0", compatibilityScore: 0.93 }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && autoAdvance) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (demoSteps[currentStep].duration / 100));
          
          if (newProgress >= 100) {
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep(curr => curr + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          
          return newProgress;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, autoAdvance]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleTryDemo = () => {
    openVirtualTryOn({
      productId: 1,
      productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&h=1000',
      garmentType: 'top'
    });
  };

  const currentDemoStep = demoSteps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full">
                <Globe className="h-16 w-16" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              EshoTry AI Fashion Platform
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-4xl mx-auto">
              Experience the future of fashion with our revolutionary AI-powered platform featuring 
              virtual try-on, 3D visualization, mobile AR, and intelligent recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button size="lg" variant="secondary" onClick={handleTryDemo}>
                <Camera className="mr-2 h-5 w-5" />
                Try Live Demo
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                <Play className="mr-2 h-5 w-5" />
                Watch Tour
              </Button>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
              {performanceMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div key={index} className="text-center p-4 bg-white/10 rounded-lg backdrop-blur">
                    <IconComponent className={`h-8 w-8 mx-auto mb-2 ${metric.color}`} />
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-sm opacity-80">{metric.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Interactive Feature Demonstration</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Explore our advanced AI features through this interactive demo. See how each component 
            delivers exceptional user experiences with enterprise-grade performance.
          </p>
        </div>

        {/* Demo Controls */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                {currentDemoStep.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-600 mt-2">{currentDemoStep.description}</p>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep + 1} of {demoSteps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="mb-4" />
            </div>

            {/* Step Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {demoSteps.map((step, index) => (
                <Button
                  key={step.id}
                  variant={currentStep === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStepChange(index)}
                  className="text-xs"
                >
                  {step.title}
                </Button>
              ))}
            </div>

            {/* Current Step Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {currentDemoStep.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Demo Area */}
          <div className="lg:col-span-2">
            {currentDemoStep.component === 'virtual-tryon' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-6 w-6 text-blue-600" />
                    Virtual Try-On Demo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">AI Virtual Try-On</h3>
                      <p className="text-gray-600 mb-4">Experience realistic fabric physics and texture simulation</p>
                      <div className="flex justify-center gap-2">
                        <Badge variant="outline">Sub-2s Processing</Badge>
                        <Badge variant="outline">Fabric Physics</Badge>
                        <Badge variant="outline">Privacy-First</Badge>
                      </div>
                      <Button className="mt-4" onClick={handleTryDemo}>
                        Launch Virtual Try-On
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentDemoStep.component === '3d-visualization' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-6 w-6 text-purple-600" />
                    3D Outfit Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ThreeDOutfitVisualizer outfitItems={sampleOutfit} />
                </CardContent>
              </Card>
            )}

            {currentDemoStep.component === 'mobile-ar' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-6 w-6 text-green-600" />
                    Mobile AR Try-On
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MobileARTryOn
                    productId={1}
                    productImage="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
                    garmentType="top"
                  />
                </CardContent>
              </Card>
            )}

            {currentDemoStep.component === 'recommendations' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                    AI Recommendations Demo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Personalized Accuracy</h4>
                        <div className="text-3xl font-bold text-orange-600">89%</div>
                        <p className="text-sm text-orange-700">Recommendation relevance rate</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Seasonal Integration</h4>
                        <div className="text-3xl font-bold text-blue-600">91%</div>
                        <p className="text-sm text-blue-700">Trend relevance accuracy</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Key Features:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          50+ user preference factors analyzed
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Real-time seasonal trend integration
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Complete outfit compatibility scoring
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Context-aware suggestions (weather, occasion)
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentDemoStep.component === 'wardrobe' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                    AI Wardrobe Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">+35%</div>
                        <div className="text-sm text-green-800">Purchase Confidence</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">-25%</div>
                        <div className="text-sm text-blue-800">Return Rate</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">87%</div>
                        <div className="text-sm text-purple-800">Gap Detection Accuracy</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Analysis Capabilities:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Comprehensive wardrobe gap identification
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Versatility and color harmony scoring
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Smart recommendations for completion
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Seasonal balance and coverage assessment
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Technical Specs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Excellence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Processing Speed</span>
                  <Badge variant="secondary">Sub-2s</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mobile Performance</span>
                  <Badge variant="secondary">Sub-3s</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AI Accuracy</span>
                  <Badge variant="secondary">89%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Privacy Compliance</span>
                  <Badge variant="secondary">GDPR Ready</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accessibility</span>
                  <Badge variant="secondary">WCAG AA</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enterprise Ready</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>10,000+ concurrent users tested</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>97.8% load test success rate</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Auto-scaling deployment ready</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Complete API documentation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>24/7 monitoring ready</span>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Ready to Launch?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Experience the complete AI fashion platform with all advanced features.
                </p>
                <Button className="w-full mb-2" onClick={handleTryDemo}>
                  <Camera className="mr-2 h-4 w-4" />
                  Try All Features
                </Button>
                <Button variant="outline" className="w-full">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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