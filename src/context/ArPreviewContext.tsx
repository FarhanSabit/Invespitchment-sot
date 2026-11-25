import React, { createContext, useContext, useState } from 'react';

export type ArModelPreset = 
  | 'fusion-core' 
  | 'spatial-twin' 
  | 'hardware-glasses' 
  | 'financial-waterfall' 
  | 'airgap-vault' 
  | 'global-orbit';

export interface ArPreviewPayload {
  sectionTitle: string;
  sectionId?: string;
  modelPreset?: ArModelPreset;
  subtitle?: string;
}

interface ArPreviewContextType {
  isOpen: boolean;
  payload: ArPreviewPayload | null;
  openArPreview: (payload: ArPreviewPayload) => void;
  closeArPreview: () => void;
}

const ArPreviewContext = createContext<ArPreviewContextType>({
  isOpen: false,
  payload: null,
  openArPreview: () => {},
  closeArPreview: () => {},
});

export const ArPreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<ArPreviewPayload | null>(null);

  const openArPreview = (newPayload: ArPreviewPayload) => {
    setPayload(newPayload);
    setIsOpen(true);
  };

  const closeArPreview = () => {
    setIsOpen(false);
  };

  return (
    <ArPreviewContext.Provider value={{ isOpen, payload, openArPreview, closeArPreview }}>
      {children}
    </ArPreviewContext.Provider>
  );
};

export const useArPreview = () => useContext(ArPreviewContext);
