import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, Upload, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface VirtualTryOnProps {
  productId: number;
  productImage: string;
  garmentType: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';
}

export function VirtualTryOn({ productId, productImage, garmentType }: VirtualTryOnProps) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processVirtualTryOn = async () => {
    if (!userImage) {
      toast({
        title: "Image Required",
        description: "Please upload your photo first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiRequest('/api/virtual-tryon', {
        method: 'POST',
        body: JSON.stringify({
          userImage,
          garmentImage: productImage,
          garmentType,
          autoDelete: true // Auto-delete user image after processing
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const resultData = await response.json();
      setResult(resultData);
      
      // Clear user image from memory for privacy
      setUserImage(null);
      
      toast({
        title: "Try-On Complete!",
        description: "Your virtual try-on has been processed successfully. Your photo was automatically deleted for privacy."
      });
    } catch (error) {
      console.error('Virtual try-on failed:', error);
      toast({
        title: "Try-On Failed",
        description: "Unable to process virtual try-on. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Virtual Try-On
        </CardTitle>
        <CardDescription>
          See how this {garmentType} looks on you with our AI-powered virtual try-on technology
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Image Upload Section */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Upload Your Photo</h4>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {userImage ? (
                  <img 
                    src={userImage} 
                    alt="User upload" 
                    className="max-h-32 sm:max-h-48 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-gray-400" />
                    <p className="text-xs sm:text-sm text-gray-600">
                      Click to upload your photo
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      For best results, use a clear, well-lit photo
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Product</h4>
              <div className="border rounded-lg p-4">
                <img 
                  src={productImage} 
                  alt="Product" 
                  className="max-h-32 sm:max-h-48 mx-auto rounded-lg"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={processVirtualTryOn}
            disabled={!userImage || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Processing Virtual Try-On...</span>
                <span className="sm:hidden">Processing...</span>
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Try It On
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-4 border-t pt-4 sm:pt-6">
            <h4 className="font-medium text-sm sm:text-base">Try-On Result</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <img 
                  src={result.resultImage} 
                  alt="Try-on result" 
                  className="w-full rounded-lg border max-h-64 sm:max-h-none object-cover"
                />
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </Badge>
                  <Badge variant={result.metadata.garmentFitScore > 0.7 ? 'default' : 'secondary'} className="text-xs">
                    Fit Score: {Math.round(result.metadata.garmentFitScore * 100)}%
                  </Badge>
                </div>

                <div>
                  <h5 className="font-medium mb-2 text-sm sm:text-base">AI Recommendations</h5>
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                    {result.metadata.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">•</span>
                        <span className="flex-1">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs text-gray-500">
                  Processing time: {result.processingTime}ms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice & Tips */}
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Privacy Protection
            </h5>
            <p className="text-sm text-green-800 dark:text-green-200">
              Your photos are automatically deleted after processing and never stored on our servers. 
              All processing happens securely and privately.
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Tips for Best Results
            </h5>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use a well-lit photo with good contrast</li>
              <li>• Stand straight facing the camera</li>
              <li>• Wear fitted clothing for accurate body detection</li>
              <li>• Ensure your full torso is visible in the photo</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}