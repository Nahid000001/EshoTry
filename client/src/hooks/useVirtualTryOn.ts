import { useState } from 'react';

interface VirtualTryOnState {
  isOpen: boolean;
  productId?: number;
  productImage?: string;
  garmentType?: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';
}

export function useVirtualTryOn() {
  const [state, setState] = useState<VirtualTryOnState>({
    isOpen: false,
  });

  const openVirtualTryOn = (options?: {
    productId?: number;
    productImage?: string;
    garmentType?: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';
  }) => {
    setState({
      isOpen: true,
      productId: options?.productId,
      productImage: options?.productImage,
      garmentType: options?.garmentType,
    });
  };

  const closeVirtualTryOn = () => {
    setState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    isOpen: state.isOpen,
    productId: state.productId,
    productImage: state.productImage,
    garmentType: state.garmentType,
    openVirtualTryOn,
    closeVirtualTryOn,
  };
}