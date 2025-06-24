import { useQuery } from '@tanstack/react-query';
import { ProductCard } from './ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shirt, Package, Watch, Sparkles } from 'lucide-react';
import type { Product } from '@shared/schema';

interface OutfitRecommendationsProps {
  baseProductId?: number;
  userId?: string;
}

interface OutfitSuggestion {
  id: string;
  name: string;
  products: {
    top?: Product;
    bottom?: Product;
    shoes?: Product;
    accessories?: Product[];
  };
  compatibility: number;
  occasion: string;
  style: string;
}

export function OutfitRecommendations({ baseProductId, userId }: OutfitRecommendationsProps) {
  const { data: outfits, isLoading } = useQuery({
    queryKey: ['/api/outfit-recommendations', baseProductId, userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (baseProductId) params.append('productId', baseProductId.toString());
      if (userId) params.append('userId', userId);
      
      const response = await fetch(`/api/outfit-recommendations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch outfit recommendations');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            Complete Outfit Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-6 rounded mb-4 w-1/3"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="bg-gray-200 aspect-square rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!outfits || outfits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            Complete Outfit Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No outfit suggestions available yet</p>
            <p className="text-sm text-gray-400">Browse more products to get personalized outfit recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-purple-600" />
          Complete Outfit Suggestions
        </CardTitle>
        <p className="text-sm text-gray-600">
          AI-curated outfits that perfectly complement your style
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {outfits.map((outfit: OutfitSuggestion) => (
            <div key={outfit.id} className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{outfit.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{outfit.occasion}</Badge>
                    <Badge variant="outline">{outfit.style}</Badge>
                    <Badge variant="default" className="bg-purple-100 text-purple-800">
                      {Math.round(outfit.compatibility * 100)}% Match
                    </Badge>
                  </div>
                </div>
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Top */}
                {outfit.products.top && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Shirt className="h-4 w-4" />
                      Top
                    </div>
                    <ProductCard product={outfit.products.top} compact />
                  </div>
                )}

                {/* Bottom */}
                {outfit.products.bottom && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Package className="h-4 w-4" />
                      Bottom
                    </div>
                    <ProductCard product={outfit.products.bottom} compact />
                  </div>
                )}

                {/* Shoes */}
                {outfit.products.shoes && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Package className="h-4 w-4" />
                      Shoes
                    </div>
                    <ProductCard product={outfit.products.shoes} compact />
                  </div>
                )}

                {/* Accessories */}
                {outfit.products.accessories && outfit.products.accessories.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Watch className="h-4 w-4" />
                      Accessories
                    </div>
                    <div className="space-y-2">
                      {outfit.products.accessories.slice(0, 2).map((accessory) => (
                        <ProductCard key={accessory.id} product={accessory} compact />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Total: ${(
                    (outfit.products.top?.price ? parseFloat(outfit.products.top.salePrice || outfit.products.top.price) : 0) +
                    (outfit.products.bottom?.price ? parseFloat(outfit.products.bottom.salePrice || outfit.products.bottom.price) : 0) +
                    (outfit.products.shoes?.price ? parseFloat(outfit.products.shoes.salePrice || outfit.products.shoes.price) : 0) +
                    (outfit.products.accessories?.reduce((sum, acc) => sum + parseFloat(acc.salePrice || acc.price), 0) || 0)
                  ).toFixed(2)}
                </div>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  Add Complete Outfit to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}