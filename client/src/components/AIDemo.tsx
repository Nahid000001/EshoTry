import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Camera, Target, TrendingUp } from 'lucide-react';
import { VirtualTryOn } from './VirtualTryOn';
import { ProductCard } from './ProductCard';
import type { Product } from '@shared/schema';

export function AIDemo() {
  const [activeDemo, setActiveDemo] = useState<'recommendations' | 'tryon' | 'sizing'>('recommendations');

  // Sample user photo for demo (placeholder)
  const sampleUserPhoto = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==";

  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ['/api/recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/recommendations?limit=6');
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    }
  });

  const { data: sizeRec, isLoading: loadingSize } = useQuery({
    queryKey: ['/api/size-recommendation', 1],
    queryFn: async () => {
      const response = await fetch('/api/size-recommendation/1');
      if (!response.ok) throw new Error('Failed to fetch size recommendation');
      return response.json();
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">AI Fashion Technology Demo</h1>
        <p className="text-xl text-gray-600">Experience the power of AI in fashion retail</p>
      </div>

      <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="tryon" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Virtual Try-On
          </TabsTrigger>
          <TabsTrigger value="sizing" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Smart Sizing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Personalized Product Recommendations
              </CardTitle>
              <CardDescription>
                Our AI analyzes your browsing behavior, purchase history, and preferences to curate products you'll love
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Collaborative Filtering</h4>
                  <p className="text-sm text-blue-700">Finds patterns among users with similar preferences</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900">Content Analysis</h4>
                  <p className="text-sm text-green-700">Analyzes product features like color, style, and brand</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Real-time Learning</h4>
                  <p className="text-sm text-purple-700">Continuously improves based on your interactions</p>
                </div>
              </div>

              {loadingRecs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
                      <div className="bg-gray-200 h-4 rounded mb-1"></div>
                      <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recommendations available. Browse some products to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tryon" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                Virtual Try-On Technology
              </CardTitle>
              <CardDescription>
                Advanced computer vision and AI to visualize how garments look on you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900">Body Detection</h4>
                  <p className="text-sm text-indigo-700">AI identifies body landmarks and measurements</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-cyan-900">Garment Mapping</h4>
                  <p className="text-sm text-cyan-700">Intelligent overlay positioning and scaling</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-900">Fit Analysis</h4>
                  <p className="text-sm text-pink-700">Real-time fit scoring and recommendations</p>
                </div>
              </div>

              <VirtualTryOn
                productId={1}
                productImage="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"
                garmentType="top"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                AI-Powered Size Recommendations
              </CardTitle>
              <CardDescription>
                Machine learning algorithms analyze your body measurements and fit preferences for perfect sizing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">How It Works</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">1</div>
                      <div>
                        <p className="font-medium">Body Analysis</p>
                        <p className="text-sm text-gray-600">Computer vision analyzes your photo for measurements</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">2</div>
                      <div>
                        <p className="font-medium">Historical Data</p>
                        <p className="text-sm text-gray-600">AI learns from your past purchases and returns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">3</div>
                      <div>
                        <p className="font-medium">Perfect Match</p>
                        <p className="text-sm text-gray-600">Recommends the ideal size with confidence score</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Sample Size Recommendation</h4>
                  {loadingSize ? (
                    <div className="animate-pulse space-y-3">
                      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                      <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                    </div>
                  ) : sizeRec ? (
                    <div className="bg-green-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Recommended Size:</span>
                        <Badge variant="default" className="text-lg px-3 py-1">{sizeRec.recommendedSize}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Confidence:</span>
                        <Badge variant="secondary">{Math.round(sizeRec.confidence * 100)}%</Badge>
                      </div>
                      <div>
                        <p className="font-medium mb-2">AI Reasoning:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {sizeRec.reasoning.map((reason: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-600">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Size recommendation not available</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            AI Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-blue-700">Recommendation Accuracy</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">89%</div>
              <div className="text-sm text-green-700">Size Prediction Accuracy</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">2.1s</div>
              <div className="text-sm text-purple-700">Avg. Try-On Process Time</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">87%</div>
              <div className="text-sm text-orange-700">Customer Satisfaction</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}