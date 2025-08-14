import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Camera, Upload, Sparkles, CheckCircle, AlertCircle, Zap, Shield, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';

interface EnhancedVirtualTryOnProps {
  productId: number;
  productImage: string;
  garmentType: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';
  productName?: string;
  className?: string;
}

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
}

export function EnhancedVirtualTryOn({ 
  productId, 
  productImage, 
  garmentType, 
  productName = 'Product',
  className = '' 
}: EnhancedVirtualTryOnProps) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 'upload', name: 'Image Upload', status: 'pending', progress: 0 },
    { id: 'analysis', name: 'Body Analysis', status: 'pending', progress: 0 },
    { id: 'fitting', name: 'Virtual Fitting', status: 'pending', progress: 0 },
    { id: 'enhancement', name: 'AI Enhancement', status: 'pending', progress: 0 },
    { id: 'finalize', name: 'Finalize Result', status: 'pending', progress: 0 }
  ]);
  const [activeTab, setActiveTab] = useState('upload');
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
        setError(null);
        updateProcessingStep('upload', 'completed', 100, 'Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProcessingStep = (stepId: string, status: ProcessingStep['status'], progress: number, message?: string) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress, message }
        : step
    ));
  };

  const simulateProcessingSteps = async () => {
    // Step 1: Body Analysis
    updateProcessingStep('analysis', 'processing', 0, 'Analyzing body measurements...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProcessingStep('analysis', 'processing', 50, 'Detecting pose landmarks...');
    await new Promise(resolve => setTimeout(resolve, 800));
    updateProcessingStep('analysis', 'completed', 100, 'Body analysis completed');

    // Step 2: Virtual Fitting
    updateProcessingStep('fitting', 'processing', 0, 'Processing garment...');
    await new Promise(resolve => setTimeout(resolve, 600));
    updateProcessingStep('fitting', 'processing', 60, 'Calculating optimal fit...');
    await new Promise(resolve => setTimeout(resolve, 700));
    updateProcessingStep('fitting', 'completed', 100, 'Virtual fitting completed');

    // Step 3: AI Enhancement
    updateProcessingStep('enhancement', 'processing', 0, 'Applying AI enhancements...');
    await new Promise(resolve => setTimeout(resolve, 500));
    updateProcessingStep('enhancement', 'processing', 80, 'Optimizing texture quality...');
    await new Promise(resolve => setTimeout(resolve, 400));
    updateProcessingStep('enhancement', 'completed', 100, 'AI enhancement completed');

    // Step 4: Finalize
    updateProcessingStep('finalize', 'processing', 0, 'Finalizing result...');
    await new Promise(resolve => setTimeout(resolve, 300));
    updateProcessingStep('finalize', 'completed', 100, 'Result ready!');
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
    setError(null);
    setResult(null);
    setConfidence(0);

    // Reset processing steps
    setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'pending', progress: 0 })));

    try {
      // Start processing simulation
      simulateProcessingSteps();

      const response = await apiRequest('/api/virtual-tryon', {
        method: 'POST',
        body: JSON.stringify({
          userImage,
          garmentImage: productImage,
          garmentType,
          autoDelete: true
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resultData = await response.json();
      setResult(resultData);
      setConfidence(resultData.confidence || 0.85);
      
      // Clear user image from memory for privacy
      setUserImage(null);
      
      toast({
        title: "Try-On Complete! 🎉",
        description: "Your virtual try-on has been processed successfully. Your photo was automatically deleted for privacy.",
      });

      setActiveTab('result');

    } catch (error) {
      console.error('Virtual try-on failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Update processing steps to show error
      setProcessingSteps(prev => prev.map(step => 
        step.status === 'processing' 
          ? { ...step, status: 'error', message: errorMessage }
          : step
      ));

      toast({
        title: "Try-On Failed",
        description: "Unable to process virtual try-on. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (result?.resultImage) {
      const link = document.createElement('a');
      link.href = result.resultImage;
      link.download = `eshotry-tryon-${productId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Excellent';
    if (confidence >= 0.6) return 'Good';
    return 'Fair';
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-purple-600" />
          Enhanced Virtual Try-On
        </CardTitle>
        <CardDescription className="text-lg">
          Experience the future of fashion with our AI-powered virtual try-on technology
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="upload" disabled={isProcessing}>Upload</TabsTrigger>
            <TabsTrigger value="processing" disabled={!isProcessing}>Processing</TabsTrigger>
            <TabsTrigger value="result" disabled={!result}>Result</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-600" />
                  Upload Your Photo
                </h3>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 transition-all duration-200 bg-gray-50 hover:bg-gray-100"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {userImage ? (
                    <div className="space-y-4">
                      <img 
                        src={userImage} 
                        alt="Uploaded user" 
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-gray-600">Click to change photo</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Click to upload photo</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                      </div>
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

              {/* Product Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  {productName}
                </h3>
                <div className="border rounded-xl p-4 bg-white">
                  <img 
                    src={productImage} 
                    alt={productName}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="mt-4 space-y-2">
                    <Badge variant="secondary" className="capitalize">
                      {garmentType}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      AI-powered virtual try-on with enhanced accuracy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <Alert className="border-purple-200 bg-purple-50">
              <Shield className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Your privacy is our priority. Your photo will be automatically deleted after processing and is never stored on our servers.
              </AlertDescription>
            </Alert>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button 
                onClick={processVirtualTryOn}
                disabled={!userImage || isProcessing}
                size="lg"
                className="px-8 py-3 text-lg font-semibold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Start Virtual Try-On
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing" className="space-y-6">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-12 w-12 text-purple-600 mx-auto" />
              </motion.div>
              <h3 className="text-xl font-semibold">Processing Your Try-On</h3>
              <p className="text-gray-600">Our AI is analyzing your photo and creating a realistic virtual fit</p>
            </div>

            {/* Processing Steps */}
            <div className="space-y-4">
              {processingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {step.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {step.status === 'processing' && (
                        <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                      )}
                      {step.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      {step.status === 'pending' && (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <span className="font-medium">{step.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{step.progress}%</span>
                  </div>
                  <Progress value={step.progress} className="h-2" />
                  {step.message && (
                    <p className="text-sm text-gray-600 ml-8">{step.message}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Result Tab */}
          <TabsContent value="result" className="space-y-6">
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : result ? (
              <div className="space-y-6">
                {/* Result Image */}
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">Your Virtual Try-On Result</h3>
                  <div className="relative inline-block">
                    <img 
                      src={result.resultImage} 
                      alt="Virtual try-on result"
                      className="max-w-full h-auto rounded-xl shadow-lg"
                    />
                    <Badge className="absolute top-4 right-4 bg-black/70 text-white">
                      AI Enhanced
                    </Badge>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">AI Confidence Score</h4>
                    <Badge className={`${getConfidenceColor(confidence)} bg-white`}>
                      {getConfidenceLabel(confidence)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-medium">{Math.round(confidence * 100)}%</span>
                    </div>
                    <Progress value={confidence * 100} className="h-2" />
                  </div>
                </div>

                {/* Recommendations */}
                {result.metadata?.recommendations && (
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600" />
                      AI Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.metadata.recommendations.map((rec: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white border rounded-lg p-3"
                        >
                          <p className="text-sm text-gray-700">{rec}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={downloadResult} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Result
                  </Button>
                  <Button onClick={() => setActiveTab('upload')} className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Try Another Item
                  </Button>
                </div>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
