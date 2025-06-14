
import React from 'react';
import { Card } from '@/components/ui/card';

interface BossAvatarProps {
  imageUrl: string | null;
  expression: 'neutral' | 'confused' | 'anxious' | 'afraid';
  audioLevel: number;
}

export const BossAvatar: React.FC<BossAvatarProps> = ({ imageUrl, expression, audioLevel }) => {
  console.log('BossAvatar props - expression:', expression, 'audioLevel:', audioLevel);
  const getExpressionStyle = () => {
    const intensity = audioLevel;
    
    switch (expression) {
      case 'afraid':
        return {
          transform: `scale(${0.9 - intensity * 0.1}) translateY(${intensity * 10}px)`,
          filter: 'brightness(0.8)',
          borderColor: '#ef4444'
        };
      case 'anxious':
        return {
          transform: `scale(${0.95 - intensity * 0.05}) rotate(${intensity * 2}deg)`,
          filter: 'brightness(0.9)',
          borderColor: '#f59e0b'
        };
      case 'confused':
        return {
          transform: `scale(${0.98}) rotate(${Math.sin(Date.now() * 0.01) * intensity * 5}deg)`,
          filter: 'brightness(0.95)',
          borderColor: '#3b82f6'
        };
      default:
        return {
          transform: 'scale(1)',
          filter: 'brightness(1)',
          borderColor: '#d1d5db'
        };
    }
  };

  const getExpressionEmoji = () => {
    switch (expression) {
      case 'afraid': return '😰';
      case 'anxious': return '😟';
      case 'confused': return '🤔';
      default: return '😐';
    }
  };

  const style = getExpressionStyle();

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <h3 className="text-xl font-semibold mb-6">Boss Avatar</h3>
      
      <div className="relative">
        <div 
          className="w-64 h-64 mx-auto rounded-full border-4 overflow-hidden transition-all duration-300 ease-out"
          style={style}
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Boss Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-6xl">{getExpressionEmoji()}</span>
            </div>
          )}
        </div>
        
        {/* Expression overlay */}
        <div className="absolute top-2 right-2 text-4xl">
          {getExpressionEmoji()}
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium capitalize text-gray-700">
          Expression: {expression}
        </div>
        
        {audioLevel > 0.3 && (
          <div className="text-xs text-gray-500 animate-fade-in">
            {expression === 'afraid' && "I hear you're really upset..."}
            {expression === 'anxious' && "This seems to be bothering you..."}
            {expression === 'confused' && "I'm listening to understand..."}
          </div>
        )}
      </div>
    </Card>
  );
};
