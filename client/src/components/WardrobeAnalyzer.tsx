import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  ShoppingBag,
  Palette,
  Calendar
} from 'lucide-react';
import { Product } from '@shared/schema';

interface WardrobeGap {
  category: string;
  severity: number;
  reason: string;
  suggestedItems: Product[];
}

interface WardrobeAnalysis {
  gaps: WardrobeGap[];
  recommendations: Product[];
  versatilityScore: number;
  seasonalBalance: number;
  colorHarmony: number;
  totalItems: number;
  categoryBreakdown: { [key: string]: number };
}

interface WardrobeItem {
  id: number;
  name: string;
  category: string;
  color: string;
  season: string;
  wearFrequency: 'high' | 'medium' | 'low';
  lastWorn?: Date;
  purchaseDate: Date;
  price: number;
}

export function WardrobeAnalyzer() {
  const [analysis, setAnalysis] = useState<WardrobeAnalysis | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadWardrobeData();
    }
  }, [user]);

  const loadWardrobeData = async () => {
    try {
      // Simulate loading wardrobe data from purchase history
      const mockWardrobeItems: WardrobeItem[] = [
        {
          id: 1,
          name: "Classic White Button-Down",
          category: "tops",
          color: "white",
          season: "all",
          wearFrequency: "high",
          lastWorn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          purchaseDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          price: 89
        },
        {
          id: 2,
          name: "Dark Wash Jeans",
          category: "bottoms",
          color: "indigo",
          season: "all",
          wearFrequency: "high",
          lastWorn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          purchaseDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          price: 125
        },
        {
          id: 3,
          name: "Black Blazer",
          category: "outerwear",
          color: "black",
          season: "fall",
          wearFrequency: "medium",
          lastWorn: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          purchaseDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
          price: 180
        },
        {
          id: 4,
          name: "Floral Summer Dress",
          category: "dresses",
          color: "floral",
          season: "summer",
          wearFrequency: "low",
          lastWorn: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          price: 95
        },
        {
          id: 5,
          name: "Leather Ankle Boots",
          category: "shoes",
          color: "brown",
          season: "fall",
          wearFrequency: "medium",
          lastWorn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          purchaseDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          price: 220
        }
      ];
      
      setWardrobeItems(mockWardrobeItems);
    } catch (error) {
      console.error('Failed to load wardrobe data:', error);
      toast({
        title: "Failed to load wardrobe",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const analyzeWardrobe = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to analyze your wardrobe",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis: WardrobeAnalysis = {
        gaps: [
          {
            category: "winter_outerwear",
            severity: 4,
            reason: "Limited winter-appropriate clothing",
            suggestedItems: []
          },
          {
            category: "formal_shoes",
            severity: 3,
            reason: "Missing formal footwear options",
            suggestedItems: []
          },
          {
            category: "summer_tops",
            severity: 2,
            reason: "Could use more variety in summer clothing",
            suggestedItems: []
          }
        ],
        recommendations: [],
        versatilityScore: 0.75,
        seasonalBalance: 0.65,
        colorHarmony: 0.80,
        totalItems: wardrobeItems.length,
        categoryBreakdown: {
          tops: 1,
          bottoms: 1,
          outerwear: 1,
          dresses: 1,
          shoes: 1,
          accessories: 0
        }
      };
      
      setAnalysis(mockAnalysis);
      
      toast({
        title: "Wardrobe analysis complete",
        description: "Your personalized insights are ready",
      });
      
    } catch (error) {
      console.error('Wardrobe analysis failed:', error);
      toast({
        title: "Analysis failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    return 'Needs Improvement';
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'destructive';
    if (severity >= 3) return 'secondary';
    return 'outline';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getWearFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Wardrobe Analyzer</h1>
          <p className="text-gray-600 mt-2">
            Get personalized insights about your wardrobe and smart recommendations
          </p>
        </div>
        <Button 
          onClick={analyzeWardrobe}
          disabled={isAnalyzing || !user}
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Wardrobe
            </>
          )}
        </Button>
      </div>

      {/* Wardrobe Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{wardrobeItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(wardrobeItems.reduce((sum, item) => sum + item.price, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg. Age</p>
                <p className="text-2xl font-bold">
                  {Math.round(wardrobeItems.reduce((sum, item) => {
                    const ageInDays = (Date.now() - item.purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
                    return sum + ageInDays;
                  }, 0) / wardrobeItems.length)} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">
                  {new Set(wardrobeItems.map(item => item.category)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gaps">Gaps Analysis</TabsTrigger>
            <TabsTrigger value="items">Wardrobe Items</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Versatility Score</span>
                    <span className={`text-lg ${getScoreColor(analysis.versatilityScore)}`}>
                      {getScoreLabel(analysis.versatilityScore)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={analysis.versatilityScore * 100} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    How well your pieces work together across different occasions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Seasonal Balance</span>
                    <span className={`text-lg ${getScoreColor(analysis.seasonalBalance)}`}>
                      {getScoreLabel(analysis.seasonalBalance)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={analysis.seasonalBalance * 100} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    Coverage across all seasons and weather conditions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Color Harmony</span>
                    <span className={`text-lg ${getScoreColor(analysis.colorHarmony)}`}>
                      {getScoreLabel(analysis.colorHarmony)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={analysis.colorHarmony * 100} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    How well your colors work together for cohesive outfits
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(analysis.categoryBreakdown).map(([category, count]) => (
                    <div key={category} className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{count}</div>
                      <div className="text-sm text-gray-600 capitalize">{category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps" className="space-y-4">
            {analysis.gaps.map((gap, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <h3 className="font-semibold capitalize">
                          {gap.category.replace('_', ' ')}
                        </h3>
                        <Badge variant={getSeverityColor(gap.severity)}>
                          Priority {gap.severity}/5
                        </Badge>
                      </div>
                      <p className="text-gray-600">{gap.reason}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Shop Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wardrobeItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge className={getWearFrequencyColor(item.wearFrequency)}>
                          {item.wearFrequency} use
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-1 capitalize">{item.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Color:</span>
                          <span className="ml-1">{item.color}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Season:</span>
                          <span className="ml-1">{item.season}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-1">{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                      
                      {item.lastWorn && (
                        <div className="text-xs text-gray-500">
                          Last worn: {Math.floor((Date.now() - item.lastWorn.getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI-Powered Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Smart Recommendations Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Our AI is analyzing your wardrobe gaps and style preferences to suggest the perfect additions to your collection.
                  </p>
                  <Button onClick={analyzeWardrobe}>
                    Generate Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Call to Action */}
      {!analysis && !isAnalyzing && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Discover Your Wardrobe Potential</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our AI analyzes your existing wardrobe to identify gaps, suggest new pieces that complement your style, 
              and help you build a more versatile and cohesive collection.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Style Analysis</h3>
                <p className="text-sm text-gray-600">Understand your wardrobe composition</p>
              </div>
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold">Gap Identification</h3>
                <p className="text-sm text-gray-600">Find missing pieces in your collection</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Smart Recommendations</h3>
                <p className="text-sm text-gray-600">Get AI-powered shopping suggestions</p>
              </div>
            </div>
            <Button size="lg" onClick={analyzeWardrobe} disabled={!user}>
              {!user ? "Login to Analyze Wardrobe" : "Start Analysis"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}