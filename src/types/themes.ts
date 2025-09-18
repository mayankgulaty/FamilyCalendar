export interface Theme {
  id: string;
  name: string;
  description: string;
  background: {
    type: 'gradient' | 'solid';
    colors: string[];
    direction?: string;
  };
  accent: string;
  text: {
    primary: string;
    secondary: string;
  };
  widget: {
    background: string;
    border: string;
    shadow: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'sunset',
    name: 'Sunset Dreams',
    description: 'Warm orange and pink gradients',
    background: {
      type: 'gradient',
      colors: ['#FF6B6B', '#FF8E53', '#FF6B9D', '#C44569'],
      direction: '135deg'
    },
    accent: '#FF6B6B',
    text: {
      primary: '#FFFFFF',
      secondary: '#FFE0E0'
    },
    widget: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.1)'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Deep blue and teal waves',
    background: {
      type: 'gradient',
      colors: ['#667eea', '#764ba2', '#4facfe', '#00f2fe'],
      direction: '45deg'
    },
    accent: '#4facfe',
    text: {
      primary: '#FFFFFF',
      secondary: '#E0F7FF'
    },
    widget: {
      background: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.18)',
      shadow: 'rgba(0, 0, 0, 0.15)'
    }
  },
  {
    id: 'forest',
    name: 'Forest Sanctuary',
    description: 'Rich greens and earth tones',
    background: {
      type: 'gradient',
      colors: ['#134e5e', '#71b280', '#56ab2f', '#a8e6cf'],
      direction: '90deg'
    },
    accent: '#56ab2f',
    text: {
      primary: '#FFFFFF',
      secondary: '#E8F5E8'
    },
    widget: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.15)',
      shadow: 'rgba(0, 0, 0, 0.2)'
    }
  },
  {
    id: 'cosmic',
    name: 'Cosmic Night',
    description: 'Deep purple and starry blues',
    background: {
      type: 'gradient',
      colors: ['#2C3E50', '#4A6741', '#667eea', '#764ba2'],
      direction: '180deg'
    },
    accent: '#667eea',
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E7FF'
    },
    widget: {
      background: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.12)',
      shadow: 'rgba(0, 0, 0, 0.25)'
    }
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Mystical greens and purples',
    background: {
      type: 'gradient',
      colors: ['#0F2027', '#203A43', '#2C5364', '#11998e'],
      direction: '225deg'
    },
    accent: '#11998e',
    text: {
      primary: '#FFFFFF',
      secondary: '#E0F7F4'
    },
    widget: {
      background: 'rgba(255, 255, 255, 0.06)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.3)'
    }
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    description: 'Elegant pinks and soft purples',
    background: {
      type: 'gradient',
      colors: ['#ff9a9e', '#fecfef', '#fecfef', '#fad0c4'],
      direction: '315deg'
    },
    accent: '#ff9a9e',
    text: {
      primary: '#4A4A4A',
      secondary: '#666666'
    },
    widget: {
      background: 'rgba(255, 255, 255, 0.25)',
      border: 'rgba(255, 255, 255, 0.3)',
      shadow: 'rgba(0, 0, 0, 0.08)'
    }
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    description: 'Warm golds and amber tones',
    background: {
      type: 'gradient',
      colors: ['#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
      direction: '270deg'
    },
    accent: '#f093fb',
    text: {
      primary: '#FFFFFF',
      secondary: '#FFF8E1'
    },
    widget: {
      background: 'rgba(255, 255, 255, 0.18)',
      border: 'rgba(255, 255, 255, 0.25)',
      shadow: 'rgba(0, 0, 0, 0.12)'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal Elegance',
    description: 'Clean whites and subtle grays',
    background: {
      type: 'gradient',
      colors: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da'],
      direction: '180deg'
    },
    accent: '#6366f1',
    text: {
      primary: '#212529',
      secondary: '#6c757d'
    },
    widget: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(0, 0, 0, 0.08)',
      shadow: 'rgba(0, 0, 0, 0.05)'
    }
  }
];
