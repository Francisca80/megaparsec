export interface MousePosition {
    x: number;
    y: number;
  }
  
  export interface Sphere3DProps {
    position: [number, number, number];
    scale: number;
    color: string;
    id: SphereId;
    onClick: (id: SphereId) => void;
  }
  
  export type SphereId = 'orange' | 'red' | 'yellow' | 'small-red';
  
  export interface PanelContent {
    code: string;
    text: string;
    code2?: string;
  }
  
  export interface PanelData {
    id: string;
    position: string;
    content: PanelContent;
  }
  
  export interface Scene3DProps {
    onSphereClick: (sphereId: SphereId) => void;
  }
  
  export interface UIOverlayProps {
    activePanel: SphereId | null;
    onShowPanel: (panelId: SphereId) => void;
    onHidePanel: () => void;
  }
  
  export interface InfoPanelProps {
    panel: PanelData;
    onClose: () => void;
  }
  
  export interface DiamondButtonProps {
    position: string;
    symbol: string;
    onClick: () => void;
  }
  
  export interface CameraControllerProps {
    mousePosition: MousePosition;
  }