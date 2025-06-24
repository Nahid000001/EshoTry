import { useQuery } from '@tanstack/react-query';
import { ProductCard } from './ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp } from 'lucide-react';
import type { Product } from '@shared/schema';

interface RecommendationSectionProps {
  title?: string;
  productId?: number;
  type: 'personalized' | 'similar';
  limit?: number;
}

export function RecommendationSection({ 
  title, 
  productId, 
  type, 
  limit = 4 
}: RecommendationSectionProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: type === 'similar' 
      ? ['/api/products', productId, 'similar'] 
      : ['/api/recommendations'],
    queryFn: async () => {
      const endpoint = type === 'similar' 
        ? `/api/products/${productId}/similar?limit=${limit}`
        : `/api/recommendations?limit=${limit}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
    enabled: type === 'personalized' || (type === 'similar' && !!productId)
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {type === 'personalized' ? (
              <Sparkles className="h-5 w-5 text-purple-600" />
            ) : (
              <TrendingUp className="h-5 w-5 text-blue-600" />
            )}
            {title || (type === 'personalized' ? 'Recommended for You' : 'Similar Products')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-2"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-1"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'personalized' ? (
            <Sparkles className="h-5 w-5 text-purple-600" />
          ) : (
            <TrendingUp className="h-5 w-5 text-blue-600" />
          )}
          {title || (type === 'personalized' ? 'Recommended for You' : 'Similar Products')}
        </CardTitle>
        {type === 'personalized' && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Curated by AI based on your preferences and browsing history
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}