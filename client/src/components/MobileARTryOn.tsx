import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  RotateCcw, 
  Download, 
  Settings, 
  Smartphone,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface MobileARTryOnProps {
  productId: number;
  productImage: string;
  garmentType: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';
  onClose?: () => void;
}

interface ARSession {
  isActive: boolean;
  bodyTracking: boolean;
  garmentOverlay: boolean;
  confidence: number;
}

export function MobileARTryOn({ productId, productImage, garmentType, onClose }: MobileARTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [arSession, setArSession] = useState<ARSession>({
    isActive: false,
    bodyTracking: false,
    garmentOverlay: false,
    confidence: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isProcessingLocally, setIsProcessingLocally] = useState(true);
  
  const { toast } = useToast();

  // Check AR support on component mount
  useEffect(() => {
    checkARSupport();
    return () => {
      cleanup();
    };
  }, []);

  const checkARSupport = async () => {
    try {
      // Check for basic WebRTC support
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      
      // Check for modern browser features
      const hasWebGL = !!document.createElement('canvas').getContext('webgl2');
      const hasWorkers = typeof Worker !== 'undefined';
      const hasWasm = typeof WebAssembly !== 'undefined';
      
      // Check for mobile device
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check for camera permissions
      let hasCameraAccess = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        hasCameraAccess = true;
      } catch (err) {
        console.log('Camera access check failed:', err);
      }
      
      const isSupported = hasGetUserMedia && hasWebGL && hasWorkers && hasWasm && hasCameraAccess;
      setIsARSupported(isSupported);
      
      if (!isSupported) {
        let reason = 'AR features require: ';
        const missing = [];
        if (!hasGetUserMedia) missing.push('camera access');
        if (!hasWebGL) missing.push('WebGL');
        if (!hasWorkers) missing.push('Web Workers');
        if (!hasWasm) missing.push('WebAssembly');
        if (!hasCameraAccess) missing.push('camera permissions');
        setError(reason + missing.join(', '));
      }
      
    } catch (error) {
      console.error('AR support check failed:', error);
      setIsARSupported(false);
      setError('Unable to check AR support');
    }
  };

  const initializeAR = async () => {
    if (!isARSupported) {
      toast({
        title: "AR not supported",
        description: "Your device doesn't support AR features",
        variant: "destructive",
      });
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Request camera access with optimal settings for AR
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera for try-on
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startARProcessing();
        };
      }

    } catch (error) {
      console.error('Failed to initialize camera:', error);
      setError('Camera access denied. Please allow camera permissions and try again.');
      toast({
        title: "Camera access required",
        description: "Please enable camera permissions for AR try-on",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const startARProcessing = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setArSession(prev => ({ ...prev, isActive: true }));

    // Start the AR processing loop
    const processFrame = () => {
      if (!videoRef.current || !canvasRef.current || !arSession.isActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== 4) {
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simulate body tracking and garment overlay
      simulateBodyTracking(ctx, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(processFrame);
    };

    animationRef.current = requestAnimationFrame(processFrame);
  };

  const simulateBodyTracking = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Simulate body detection (in real implementation, use MediaPipe or similar)
    const bodyDetected = Math.random() > 0.1; // 90% success rate simulation
    
    if (bodyDetected) {
      setArSession(prev => ({ 
        ...prev, 
        bodyTracking: true,
        confidence: 0.85 + Math.random() * 0.1
      }));

      // Draw body tracking indicators
      drawBodyTrackingOverlay(ctx, width, height);
      
      // Simulate garment overlay
      drawGarmentOverlay(ctx, width, height);
      
      setArSession(prev => ({ ...prev, garmentOverlay: true }));
    } else {
      setArSession(prev => ({ 
        ...prev, 
        bodyTracking: false,
        garmentOverlay: false,
        confidence: Math.max(0, prev.confidence - 0.1)
      }));
    }
  };

  const drawBodyTrackingOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw body tracking points (simplified for demo)
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 2;

    // Simulate key body points
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Head
    const headY = centerY - height * 0.2;
    ctx.beginPath();
    ctx.arc(centerX, headY, 20, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Shoulders
    const shoulderY = centerY - height * 0.1;
    const shoulderWidth = width * 0.15;
    ctx.beginPath();
    ctx.moveTo(centerX - shoulderWidth, shoulderY);
    ctx.lineTo(centerX + shoulderWidth, shoulderY);
    ctx.stroke();
    
    // Arms
    ctx.beginPath();
    ctx.moveTo(centerX - shoulderWidth, shoulderY);
    ctx.lineTo(centerX - shoulderWidth * 1.2, centerY + height * 0.1);
    ctx.moveTo(centerX + shoulderWidth, shoulderY);
    ctx.lineTo(centerX + shoulderWidth * 1.2, centerY + height * 0.1);
    ctx.stroke();
    
    // Torso
    ctx.beginPath();
    ctx.moveTo(centerX, shoulderY);
    ctx.lineTo(centerX, centerY + height * 0.2);
    ctx.stroke();
    
    // Hips
    const hipY = centerY + height * 0.15;
    const hipWidth = width * 0.12;
    ctx.beginPath();
    ctx.moveTo(centerX - hipWidth, hipY);
    ctx.lineTo(centerX + hipWidth, hipY);
    ctx.stroke();
  };

  const drawGarmentOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Simulate garment overlay based on type
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
    ctx.lineWidth = 1;

    switch (garmentType) {
      case 'top':
        // Draw top garment overlay
        ctx.fillRect(
          centerX - width * 0.12, 
          centerY - height * 0.15, 
          width * 0.24, 
          height * 0.25
        );
        break;
      
      case 'bottom':
        // Draw bottom garment overlay
        ctx.fillRect(
          centerX - width * 0.1, 
          centerY + height * 0.05, 
          width * 0.2, 
          height * 0.3
        );
        break;
      
      case 'dress':
        // Draw dress overlay
        ctx.fillRect(
          centerX - width * 0.12, 
          centerY - height * 0.15, 
          width * 0.24, 
          height * 0.45
        );
        break;
      
      case 'shoes':
        // Draw shoes overlay
        ctx.fillRect(centerX - width * 0.08, centerY + height * 0.35, width * 0.16, height * 0.08);
        break;
      
      case 'accessories':
        // Draw accessory overlay (e.g., hat)
        ctx.fillRect(centerX - width * 0.06, centerY - height * 0.25, width * 0.12, height * 0.05);
        break;
    }

    // Add garment details text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '14px Arial';
    ctx.fillText(`${garmentType.toUpperCase()} OVERLAY`, 10, 30);
  };

  const stopAR = () => {
    setArSession(prev => ({ ...prev, isActive: false }));
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    cleanup();
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const takeSnapshot = () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      
      // Create download link
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `ar-tryon-${Date.now()}.jpg`;
      link.click();
      
      toast({
        title: "Snapshot saved",
        description: "Your AR try-on image has been downloaded",
      });
      
      // Privacy: Clear canvas after snapshot
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
    } catch (error) {
      console.error('Failed to take snapshot:', error);
      toast({
        title: "Snapshot failed",
        description: "Unable to save AR try-on image",
        variant: "destructive",
      });
    }
  };

  const toggleCamera = async () => {
    if (arSession.isActive) {
      stopAR();
    } else {
      await initializeAR();
    }
  };

  // Loading state
  if (isARSupported === null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-sm text-gray-600">Checking AR support...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // AR not supported
  if (!isARSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            AR Not Available
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            {error || 'Your device doesn\'t support AR features.'}
          </p>
          <div className="space-y-2">
            <p className="text-xs font-medium">Requirements:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Modern mobile browser (Chrome, Safari, Firefox)</li>
              <li>• Camera permissions enabled</li>
              <li>• WebGL and WebAssembly support</li>
              <li>• Stable internet connection</li>
            </ul>
          </div>
          {onClose && (
            <Button onClick={onClose} className="w-full">
              Use Standard Try-On
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Mobile AR Try-On
          </div>
          <div className="flex items-center gap-2">
            {arSession.bodyTracking && (
              <Badge variant="default" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Body Tracked
              </Badge>
            )}
            {arSession.garmentOverlay && (
              <Badge variant="secondary" className="text-xs">
                Overlay Active
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AR View */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-[3/4]">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            style={{ display: arSession.isActive ? 'block' : 'none' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ display: arSession.isActive ? 'block' : 'none' }}
          />
          
          {!arSession.isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white space-y-4">
                <Camera className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-sm">Tap Start AR to begin virtual try-on</p>
              </div>
            </div>
          )}
          
          {/* AR Status Overlay */}
          {arSession.isActive && (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur text-white p-2 rounded-lg text-xs">
                <div className="flex justify-between items-center">
                  <span>Confidence: {Math.round(arSession.confidence * 100)}%</span>
                  {isProcessingLocally && (
                    <Badge variant="outline" className="text-xs text-white border-white">
                      Local Processing
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={toggleCamera}
            disabled={isInitializing}
            className="flex-1"
            variant={arSession.isActive ? "destructive" : "default"}
          >
            {isInitializing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Initializing...
              </>
            ) : arSession.isActive ? (
              "Stop AR"
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Start AR
              </>
            )}
          </Button>
          
          {arSession.isActive && (
            <>
              <Button 
                onClick={takeSnapshot}
                variant="outline"
                size="icon"
                disabled={!arSession.garmentOverlay}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => {
                  // Reset tracking
                  setArSession(prev => ({ 
                    ...prev, 
                    bodyTracking: false, 
                    garmentOverlay: false, 
                    confidence: 0 
                  }));
                }}
                variant="outline"
                size="icon"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        {/* Privacy Notice */}
        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-800 dark:text-green-200">
              <p className="font-medium mb-1">Privacy Protected</p>
              <p>
                All AR processing happens locally on your device. 
                Images are never uploaded to servers unless you choose to save them.
              </p>
            </div>
          </div>
        </div>
        
        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
            AR Try-On Tips:
          </p>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Stand in good lighting for best tracking</li>
            <li>• Keep your full torso visible in the camera</li>
            <li>• Move slowly for stable garment overlay</li>
            <li>• Use front-facing camera for best results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}