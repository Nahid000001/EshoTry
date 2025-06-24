import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Ruler, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BodyMeasurements {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  armLength: number;
  inseam: number;
}

export function AvatarCreator() {
  const [measurements, setMeasurements] = useState<BodyMeasurements>({
    height: 170,
    weight: 70,
    chest: 90,
    waist: 75,
    hips: 95,
    shoulders: 40,
    armLength: 60,
    inseam: 80
  });
  const [bodyType, setBodyType] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleMeasurementChange = (key: keyof BodyMeasurements, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const createAvatar = async () => {
    setIsCreating(true);
    try {
      // Simulate avatar creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Avatar Created Successfully",
        description: "Your personal avatar is ready for virtual try-ons!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Create Your Personal Avatar
        </CardTitle>
        <CardDescription>
          Create a digital avatar using only body measurements - no photos required for privacy-conscious users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="measurements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="measurements">Body Measurements</TabsTrigger>
            <TabsTrigger value="preferences">Style Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
          </TabsList>

          <TabsContent value="measurements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Basic Measurements
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={measurements.height}
                      onChange={(e) => handleMeasurementChange('height', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={measurements.weight}
                      onChange={(e) => handleMeasurementChange('weight', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chest">Chest (cm)</Label>
                    <Input
                      id="chest"
                      type="number"
                      value={measurements.chest}
                      onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="waist">Waist (cm)</Label>
                    <Input
                      id="waist"
                      type="number"
                      value={measurements.waist}
                      onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hips">Hips (cm)</Label>
                    <Input
                      id="hips"
                      type="number"
                      value={measurements.hips}
                      onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shoulders">Shoulders (cm)</Label>
                    <Input
                      id="shoulders"
                      type="number"
                      value={measurements.shoulders}
                      onChange={(e) => handleMeasurementChange('shoulders', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="armLength">Arm Length (cm)</Label>
                    <Input
                      id="armLength"
                      type="number"
                      value={measurements.armLength}
                      onChange={(e) => handleMeasurementChange('armLength', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inseam">Inseam (cm)</Label>
                    <Input
                      id="inseam"
                      type="number"
                      value={measurements.inseam}
                      onChange={(e) => handleMeasurementChange('inseam', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Body Type</h3>
                <Select value={bodyType} onValueChange={setBodyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pear">Pear</SelectItem>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="hourglass">Hourglass</SelectItem>
                    <SelectItem value="rectangle">Rectangle</SelectItem>
                    <SelectItem value="inverted-triangle">Inverted Triangle</SelectItem>
                  </SelectContent>
                </Select>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Measurement Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Measure without clothing for accuracy</li>
                    <li>• Keep measuring tape parallel to the floor</li>
                    <li>• Don't pull the tape too tight</li>
                    <li>• Measure at the fullest part of chest/hips</li>
                    <li>• Stand naturally without sucking in</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Style Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Preferred Fit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fit preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight/Fitted</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="loose">Loose/Relaxed</SelectItem>
                      <SelectItem value="oversized">Oversized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Comfort Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select comfort level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-fitted">Very Fitted</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="roomy">Roomy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                Privacy & Data Security
              </h3>
              
              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-green-900">Your Data is Protected</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• No photos are stored on our servers</li>
                  <li>• Measurements are encrypted and anonymized</li>
                  <li>• Data is only used for size recommendations</li>
                  <li>• You can delete your avatar anytime</li>
                  <li>• No data is shared with third parties</li>
                </ul>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">I agree to the Terms of Service</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">I consent to data processing for size recommendations</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">I want to receive size improvement notifications</span>
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={createAvatar} 
            disabled={isCreating}
            size="lg"
            className="min-w-32"
          >
            {isCreating ? 'Creating Avatar...' : 'Create Avatar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}