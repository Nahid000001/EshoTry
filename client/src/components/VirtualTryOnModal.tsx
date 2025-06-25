import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VirtualTryOn } from './VirtualTryOn';
import { AvatarCreator } from './AvatarCreator';
import { Camera, User, Sparkles } from 'lucide-react';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: number;
  productImage?: string;
  garmentType?: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';
}

export function VirtualTryOnModal({ 
  isOpen, 
  onClose, 
  productId = 1, 
  productImage = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
  garmentType = "top"
}: VirtualTryOnModalProps) {
  const [activeTab, setActiveTab] = useState("photo");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI-Powered Virtual Try-On
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Experience Fashion with AI</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Choose your preferred method to try on this garment using our advanced AI technology.
              All processing is secure, private, and completed in under 2 seconds.
            </p>
          </div>

          {/* Try-On Options */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="photo" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photo Upload Try-On
              </TabsTrigger>
              <TabsTrigger value="avatar" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Avatar Try-On
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="mt-6">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Photo Upload Try-On
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Upload your photo to see how this garment looks on you. Your photo is automatically 
                    deleted after processing for maximum privacy.
                  </p>
                </div>
                
                <VirtualTryOn 
                  productId={productId}
                  productImage={productImage}
                  garmentType={garmentType}
                />
              </div>
            </TabsContent>

            <TabsContent value="avatar" className="mt-6">
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Privacy-Conscious Avatar Creation
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Create a virtual avatar based on your body measurements. No photos required - 
                    completely private and secure.
                  </p>
                </div>
                
                <AvatarCreator />
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Close
            </Button>
            <div className="flex-1" />
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              <span>Processing time: &lt;2 seconds • Privacy protected</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}