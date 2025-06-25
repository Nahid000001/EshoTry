import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, ShoppingCart, Heart, Sparkles, X } from 'lucide-react';

interface MoodTheme {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  colors: string[];
}

interface OutfitSuggestion {
  id: string;
  name: string;
  description: string;
  products: Array<{
    category: string;
    product: {
      id: number;
      name: string;
      price: string;
      imageUrl?: string;
    };
    reasoning: string;
  }>;
  colorPalette: string[];
  totalPrice: number;
}

interface MoodBoardData {
  theme: MoodTheme;
  outfits: OutfitSuggestion[];
  colorPalette: string[];
  styleInsights: string[];
}

interface MoodBoardWidgetProps {
  onClose: () => void;
  language?: string;
}

export function MoodBoardWidget({ onClose, language = 'en' }: MoodBoardWidgetProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [moodBoardData, setMoodBoardData] = useState<MoodBoardData | null>(null);
  const [availableThemes, setAvailableThemes] = useState<MoodTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const predefinedThemes: MoodTheme[] = [
    {
      id: 'streetwear',
      name: language === 'bn' ? 'আরবান স্ট্রিটওয়্যার' : 'Urban Streetwear',
      description: language === 'bn' ? 'এজি, ক্যাজুয়াল স্ট্রিট-অনুপ্রাণিত ফ্যাশন' : 'Edgy, casual street-inspired fashion',
      keywords: ['urban', 'casual', 'edgy'],
      colors: ['black', 'white', 'gray']
    },
    {
      id: 'minimalist',
      name: language === 'bn' ? 'মিনিমালিস্ট শিক' : 'Minimalist Chic',
      description: language === 'bn' ? 'পরিষ্কার, সহজ লাইন এবং নিরপেক্ষ টোন' : 'Clean, simple lines with neutral tones',
      keywords: ['clean', 'simple', 'neutral'],
      colors: ['white', 'black', 'beige']
    },
    {
      id: 'boho',
      name: language === 'bn' ? 'বোহেমিয়ান স্পিরিট' : 'Bohemian Spirit',
      description: language === 'bn' ? 'মুক্ত-চেতনা, শৈল্পিক স্টাইল' : 'Free-spirited, artistic style',
      keywords: ['bohemian', 'artistic', 'flowing'],
      colors: ['earth tones', 'brown', 'rust']
    },
    {
      id: 'formal',
      name: language === 'bn' ? 'প্রফেশনাল পাওয়ার' : 'Professional Power',
      description: language === 'bn' ? 'তীক্ষ্ণ, পরিশীলিত লুক' : 'Sharp, sophisticated looks',
      keywords: ['professional', 'sophisticated'],
      colors: ['navy', 'black', 'charcoal']
    },
    {
      id: 'summer-casual',
      name: language === 'bn' ? 'গ্রীষ্মের এসেনশিয়াল' : 'Summer Essentials',
      description: language === 'bn' ? 'হালকা, বাতাসময় পিস' : 'Light, breezy pieces',
      keywords: ['light', 'breezy', 'comfortable'],
      colors: ['white', 'light blue', 'coral']
    },
    {
      id: 'date-night',
      name: language === 'bn' ? 'ডেট নাইট গ্ল্যাম' : 'Date Night Glam',
      description: language === 'bn' ? 'রোমান্টিক সন্ধ্যার জন্য' : 'For romantic evenings',
      keywords: ['romantic', 'sophisticated'],
      colors: ['black', 'red', 'gold']
    }
  ];

  const handleThemeSelect = async (themeId: string) => {
    setIsLoading(true);
    setSelectedTheme(themeId);

    try {
      const response = await fetch('/api/chatbot/mood-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ themeId }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMoodBoardData(data);
      } else {
        console.error('Failed to generate mood board');
      }
    } catch (error) {
      console.error('Error generating mood board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getColorStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      'black': '#000000',
      'white': '#ffffff',
      'gray': '#808080',
      'navy': '#000080',
      'beige': '#f5f5dc',
      'brown': '#a52a2a',
      'rust': '#b7410e',
      'red': '#ff0000',
      'gold': '#ffd700',
      'light blue': '#add8e6',
      'coral': '#ff7f50',
      'earth tones': '#8b4513'
    };
    
    return {
      backgroundColor: colorMap[color.toLowerCase()] || color,
      border: color === 'white' ? '1px solid #ccc' : 'none'
    };
  };

  if (!selectedTheme) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {language === 'bn' ? 'মুড বোর্ড থিম নির্বাচন করুন' : 'Choose Your Mood Board Theme'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedThemes.map((theme) => (
              <Card
                key={theme.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                onClick={() => handleThemeSelect(theme.id)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{theme.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {theme.keywords.slice(0, 3).map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-1">
                    {theme.colors.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full"
                        style={getColorStyle(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">
            {language === 'bn' ? 'আপনার মুড বোর্ড তৈরি করা হচ্ছে...' : 'Creating your mood board...'}
          </h3>
          <p className="text-gray-600">
            {language === 'bn' ? 'এআই আপনার জন্য নিখুঁত আউটফিট কিউরেট করছে' : 'AI is curating perfect outfits for you'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (moodBoardData) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {moodBoardData.theme.name} {language === 'bn' ? 'মুড বোর্ড' : 'Mood Board'}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTheme(null)}>
                {language === 'bn' ? 'থিম পরিবর্তন' : 'Change Theme'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-gray-600">{moodBoardData.theme.description}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Color Palette */}
          <div>
            <h3 className="font-semibold mb-3">
              {language === 'bn' ? 'রং প্যালেট' : 'Color Palette'}
            </h3>
            <div className="flex gap-2">
              {moodBoardData.colorPalette.map((color, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-12 h-12 rounded-lg shadow-sm"
                    style={getColorStyle(color)}
                  />
                  <p className="text-xs mt-1 capitalize">{color}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Outfit Suggestions */}
          <div>
            <h3 className="font-semibold mb-3">
              {language === 'bn' ? 'আউটফিট সুপারিশ' : 'Outfit Suggestions'}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {moodBoardData.outfits.map((outfit) => (
                <Card key={outfit.id} className="border">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">{outfit.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{outfit.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {outfit.products.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="font-medium capitalize">{item.category}:</span>
                          <span className="text-right">
                            {item.product.name}
                            <br />
                            <span className="text-green-600">${item.product.price}</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">
                        {language === 'bn' ? 'মোট:' : 'Total:'} ${outfit.totalPrice.toFixed(0)}
                      </span>
                      <div className="flex gap-1">
                        {outfit.colorPalette.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full"
                            style={getColorStyle(color)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {language === 'bn' ? 'কার্টে যোগ' : 'Add to Cart'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Style Insights */}
          {moodBoardData.styleInsights.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">
                {language === 'bn' ? 'স্টাইল অন্তর্দৃষ্টি' : 'Style Insights'}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-1">
                  {moodBoardData.styleInsights.map((insight, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}