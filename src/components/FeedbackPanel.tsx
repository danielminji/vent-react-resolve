
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FeedbackPanelProps {
  feedback: string;
  avatarImage: string | null;
  onRestart: () => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, avatarImage, onRestart }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in the feedback
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Avatar in calm state */}
      <div className="text-center">
        <div className="w-32 h-32 mx-auto rounded-full border-4 border-green-200 overflow-hidden mb-4 animate-scale-in">
          {avatarImage ? (
            <img 
              src={avatarImage} 
              alt="Calm Boss Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
              <span className="text-4xl">😌</span>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Let's talk about this...</h2>
        <p className="text-gray-600">Here's some constructive feedback</p>
      </div>

      {/* Feedback Card */}
      <Card className={`p-8 bg-gradient-to-br from-blue-50 to-green-50 border-l-4 border-blue-400 transition-all duration-1000 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      }`}>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">Constructive Suggestion</h3>
              <p className="text-gray-700 leading-relaxed">{feedback}</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Remember:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Take time to cool down before taking action</li>
              <li>• Focus on specific behaviors, not personality</li>
              <li>• Approach conversations with curiosity, not accusation</li>
              <li>• Consider their perspective too</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={onRestart}
          size="lg"
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          Start Over
        </Button>
        <Button 
          variant="outline"
          size="lg"
          onClick={() => window.print()}
        >
          Save Feedback
        </Button>
      </div>

      {/* Mood Tracker Hint */}
      <div className="text-center text-sm text-gray-500">
        <p>Feeling better? Regular venting can help process workplace stress constructively.</p>
      </div>
    </div>
  );
};
