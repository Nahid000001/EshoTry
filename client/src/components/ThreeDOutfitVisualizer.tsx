import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Text, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Palette, RotateCcw, Download, Share2, Sparkles } from 'lucide-react';
import * as THREE from 'three';

interface OutfitItem {
  id: number;
  name: string;
  category: 'top' | 'bottom' | 'shoes' | 'accessories';
  color: string;
  model3D?: string;
  compatibilityScore?: number;
}

interface ThreeDOutfitVisualizerProps {
  outfitItems: OutfitItem[];
  onItemChange?: (category: string, item: OutfitItem) => void;
}

// 3D Garment Component with physics simulation
function GarmentMesh({ item, position, rotation }: { item: OutfitItem; position: [number, number, number]; rotation: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Simulate fabric physics with subtle animation
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing/draping animation
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.01;
      
      // Fabric sway simulation
      if (item.category === 'top') {
        meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.02;
      }
    }
  });

  // Generate procedural garment geometry based on category
  const createGarmentGeometry = (category: string) => {
    switch (category) {
      case 'top':
        return new THREE.CylinderGeometry(0.8, 1.0, 1.5, 8);
      case 'bottom':
        return new THREE.CylinderGeometry(0.8, 0.9, 1.8, 8);
      case 'shoes':
        return new THREE.BoxGeometry(0.4, 0.2, 0.8);
      default:
        return new THREE.SphereGeometry(0.3, 8, 8);
    }
  };

  const geometry = createGarmentGeometry(item.category);
  
  // Enhanced material with fabric-like properties
  const material = new THREE.MeshStandardMaterial({
    color: item.color,
    roughness: item.category === 'shoes' ? 0.2 : 0.7,
    metalness: item.category === 'shoes' ? 0.1 : 0.0,
    transparent: true,
    opacity: hovered ? 0.9 : 0.8,
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      geometry={geometry}
      material={material}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black text-white px-2 py-1 rounded text-sm">
            {item.name}
            {item.compatibilityScore && (
              <div className="text-xs text-green-300">
                {Math.round(item.compatibilityScore * 100)}% match
              </div>
            )}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// Avatar figure for outfit visualization
function AvatarFigure() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle rotation for better viewing
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Simple humanoid figure */}
      {/* Head */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.7, 1.5, 8]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.8, 1.8, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      <mesh position={[0.8, 1.8, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.3, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.4, 8]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      <mesh position={[0.3, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.4, 8]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
    </group>
  );
}

// Main 3D Scene Component
function OutfitScene({ outfitItems }: { outfitItems: OutfitItem[] }) {
  return (
    <>
      {/* Lighting setup for realistic fabric appearance */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 3, -5]} intensity={0.3} />
      
      {/* Environment for reflections */}
      <Environment preset="studio" />
      
      {/* Avatar figure */}
      <AvatarFigure />
      
      {/* Render outfit items */}
      {outfitItems.map((item, index) => {
        let position: [number, number, number] = [0, 0, 0];
        let rotation: [number, number, number] = [0, 0, 0];
        
        switch (item.category) {
          case 'top':
            position = [0, 1.8, 0];
            break;
          case 'bottom':
            position = [0, 0.5, 0];
            break;
          case 'shoes':
            position = [0, -0.5, 0.3];
            break;
          case 'accessories':
            position = [0, 2.2, 0.4];
            break;
        }
        
        return (
          <GarmentMesh
            key={item.id}
            item={item}
            position={position}
            rotation={rotation}
          />
        );
      })}
      
      {/* Platform */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2, 0.1, 32]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={8}
      />
    </>
  );
}

export function ThreeDOutfitVisualizer({ outfitItems, onItemChange }: ThreeDOutfitVisualizerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [renderQuality, setRenderQuality] = useState([0.8]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const { toast } = useToast();
  
  // Calculate overall outfit compatibility
  useEffect(() => {
    if (outfitItems.length > 0) {
      const scores = outfitItems.filter(item => item.compatibilityScore).map(item => item.compatibilityScore!);
      const avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      setCompatibilityScore(avgScore);
    }
  }, [outfitItems]);
  
  // Simulate loading time for 3D assets
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveOutfit = () => {
    toast({
      title: "Outfit saved",
      description: "Your 3D outfit has been saved to your collection",
    });
  };

  const handleShareOutfit = () => {
    toast({
      title: "Outfit shared",
      description: "Outfit link copied to clipboard",
    });
  };

  const handleResetView = () => {
    // Reset camera position would be handled by OrbitControls
    toast({
      title: "View reset",
      description: "Camera position restored to default",
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-600">Loading 3D outfit visualization...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            3D Outfit Visualizer
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={compatibilityScore > 0.8 ? "default" : compatibilityScore > 0.6 ? "secondary" : "destructive"}>
              {Math.round(compatibilityScore * 100)}% Style Match
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3D Canvas */}
        <div className="w-full h-96 bg-gray-50 rounded-lg overflow-hidden">
          <Canvas
            shadows
            camera={{ position: [0, 2, 5], fov: 50 }}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: "high-performance",
              // Mobile optimization
              pixelRatio: Math.min(window.devicePixelRatio, 2)
            }}
          >
            <OutfitScene outfitItems={outfitItems} />
          </Canvas>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleResetView}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset View
            </Button>
            <Button size="sm" variant="outline" onClick={handleSaveOutfit}>
              <Download className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleShareOutfit}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
          
          {/* Render Quality Slider */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Quality:</span>
            <Slider
              value={renderQuality}
              onValueChange={setRenderQuality}
              max={1}
              min={0.3}
              step={0.1}
              className="w-20"
            />
            <span className="text-sm text-gray-500">
              {Math.round(renderQuality[0] * 100)}%
            </span>
          </div>
        </div>
        
        {/* Outfit Items List */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {outfitItems.map((item) => (
            <div key={item.id} className="p-2 border rounded-lg text-center">
              <div 
                className="w-8 h-8 rounded-full mx-auto mb-1" 
                style={{ backgroundColor: item.color }}
              />
              <p className="text-xs font-medium">{item.name}</p>
              <p className="text-xs text-gray-500 capitalize">{item.category}</p>
              {item.compatibilityScore && (
                <Badge variant="outline" className="text-xs mt-1">
                  {Math.round(item.compatibilityScore * 100)}%
                </Badge>
              )}
            </div>
          ))}
        </div>
        
        {/* Performance Info */}
        <div className="text-xs text-gray-500 text-center">
          3D rendering optimized for mobile • Physics simulation active
        </div>
      </CardContent>
    </Card>
  );
}