export interface IconAnimation {
  name: string;
  className: string;
  description: string;
  preview?: boolean;
}

export const ICON_ANIMATIONS: IconAnimation[] = [
  { 
    name: 'None', 
    className: '',
    description: 'No animation' 
  },
  { 
    name: 'Spin', 
    className: 'animate-spin',
    description: 'Continuous rotation',
    preview: true
  },
  { 
    name: 'Pulse', 
    className: 'animate-pulse',
    description: 'Fade in and out',
    preview: true
  },
  { 
    name: 'Bounce', 
    className: 'animate-bounce',
    description: 'Up and down movement',
    preview: true
  },
  { 
    name: 'Wiggle', 
    className: 'animate-wiggle',
    description: 'Side to side rotation',
    preview: true
  },
  { 
    name: 'Heartbeat', 
    className: 'animate-heartbeat',
    description: 'Scale pulsing like a heartbeat',
    preview: true
  },
  { 
    name: 'Float', 
    className: 'animate-float',
    description: 'Gentle up and down floating',
    preview: true
  },
  { 
    name: 'Shake', 
    className: 'animate-shake',
    description: 'Horizontal shaking',
    preview: true
  }
];

export function getAnimationByName(name: string): IconAnimation | undefined {
  return ICON_ANIMATIONS.find(animation => animation.name === name);
}

export function getAnimationClassName(name: string): string {
  const animation = getAnimationByName(name);
  return animation?.className || '';
}
