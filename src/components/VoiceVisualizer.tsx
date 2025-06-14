
import React from 'react';
import { Card } from '@/components/ui/card';

interface VoiceVisualizerProps {
  audioLevel: number;
  isRecording: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ audioLevel, isRecording }) => {
  const bars = Array.from({ length: 20 }, (_, i) => {
    const height = Math.max(0.1, audioLevel * (1 + Math.sin(Date.now() * 0.01 + i) * 0.3));
    return height;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center h-32 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
        <div className="flex items-end space-x-1 h-20">
          {bars.map((height, index) => (
            <div
              key={index}
              className={`w-2 rounded-t transition-all duration-100 ${
                isRecording 
                  ? 'bg-gradient-to-t from-orange-500 to-red-500' 
                  : 'bg-gray-300'
              }`}
              style={{ 
                height: `${height * 100}%`,
                minHeight: '8px'
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isRecording 
            ? 'bg-red-100 text-red-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span>{isRecording ? 'Recording...' : 'Ready to listen'}</span>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-600">
        Audio Level: {Math.round(audioLevel * 100)}%
      </div>
    </div>
  );
};
