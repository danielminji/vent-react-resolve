import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@readyplayerme/visage';

interface BossAvatarProps {
  modelUrl: string | null;
  expression: 'neutral' | 'confused' | 'anxious' | 'afraid';
  audioLevel: number;
}

const ARKIT_BLENDSHAPES = {
  eyeBlinkLeft: "eyeBlinkLeft",
  eyeBlinkRight: "eyeBlinkRight",
  jawOpen: "jawOpen",
  mouthSmileLeft: "mouthSmileLeft",
  mouthSmileRight: "mouthSmileRight",
  mouthFrownLeft: "mouthFrownLeft",
  mouthFrownRight: "mouthFrownRight",
  browInnerUp: "browInnerUp",
  browDownLeft: "browDownLeft",
  browDownRight: "browDownRight",
  eyeWideLeft: "eyeWideLeft",
  eyeWideRight: "eyeWideRight",
  mouthFunnel: "mouthFunnel",
  cheekPuff: "cheekPuff",
  // Consider adding: mouthShrugUpper, mouthPressLeft, mouthPressRight, noseSneerLeft, noseSneerRight
};

const getBlendshapeValues = (
  expression: 'neutral' | 'confused' | 'anxious' | 'afraid',
  audioLevel: number
): Record<string, number> => {
  const base: Record<string, number> = Object.values(ARKIT_BLENDSHAPES).reduce((acc, shapeName) => {
    acc[shapeName] = 0;
    return acc;
  }, {} as Record<string, number>);

  const intensity = Math.min(audioLevel * 1.5, 1.0); // Modulate intensity, cap at 1.0

  switch (expression) {
    case 'confused':
      return {
        ...base,
        [ARKIT_BLENDSHAPES.browInnerUp]: 0.5 + intensity * 0.3,
        [ARKIT_BLENDSHAPES.browDownLeft]: 0.4 + intensity * 0.2,
        [ARKIT_BLENDSHAPES.mouthFrownLeft]: 0.3,
        [ARKIT_BLENDSHAPES.jawOpen]: 0.05 + intensity * 0.05, // Slight jaw open for confusion
      };
    case 'anxious':
      return {
        ...base,
        [ARKIT_BLENDSHAPES.eyeWideLeft]: 0.2 + intensity * 0.3,
        [ARKIT_BLENDSHAPES.eyeWideRight]: 0.2 + intensity * 0.3,
        [ARKIT_BLENDSHAPES.browInnerUp]: 0.3 + intensity * 0.2,
        [ARKIT_BLENDSHAPES.mouthFrownLeft]: 0.2 + intensity * 0.1,
        [ARKIT_BLENDSHAPES.mouthFrownRight]: 0.2 + intensity * 0.1,
        [ARKIT_BLENDSHAPES.jawOpen]: 0.1 + intensity * 0.1,
      };
    case 'afraid':
      return {
        ...base,
        [ARKIT_BLENDSHAPES.eyeWideLeft]: Math.min(0.6 + intensity * 0.4, 1.0),
        [ARKIT_BLENDSHAPES.eyeWideRight]: Math.min(0.6 + intensity * 0.4, 1.0),
        [ARKIT_BLENDSHAPES.browInnerUp]: Math.min(0.7 + intensity * 0.3, 1.0),
        [ARKIT_BLENDSHAPES.jawOpen]: Math.min(0.3 + intensity * 0.3, 0.7), // Adjusted max for jawOpen
        [ARKIT_BLENDSHAPES.mouthFunnel]: Math.min(0.4 + intensity * 0.3, 0.7), // mouthFunnel for fear
      };
    case 'neutral':
    default:
      // Subtle blink for neutral, driven by a slow sine wave or random timer for more natural feel
      // This example is a static blink for simplicity, real implementation might need useEffect for timer
      const blink = (Date.now() % 5000 > 4800) ? 1 : 0; // Blink every 5 seconds for 200ms
      return {
        ...base,
        [ARKIT_BLENDSHAPES.eyeBlinkLeft]: blink,
        [ARKIT_BLENDSHAPES.eyeBlinkRight]: blink,
        // Could add very subtle jawOpen based on low audioLevel if desired for 'talking' appearance
        [ARKIT_BLENDSHAPES.jawOpen]: Math.min(intensity * 0.2, 0.1), // Minimal movement for neutral speech
      };
  }
};

export const BossAvatar: React.FC<BossAvatarProps> = ({ modelUrl, expression, audioLevel }) => {
  console.log('BossAvatar props - modelUrl:', modelUrl, 'expression:', expression, 'audioLevel:', audioLevel);

  const blendshapes = getBlendshapeValues(expression, audioLevel);

  // getExpressionEmoji is no longer needed as we are using 3D expressions.
  // const getExpressionEmoji = () => { ... };

  if (!modelUrl) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <h3 className="text-xl font-semibold mb-6">Boss Avatar</h3>
        <div className="w-64 h-64 mx-auto rounded-full border-4 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <span className="text-6xl">⏳</span>
        </div>
        <p className="mt-4 text-gray-500">3D Avatar loading or not yet created.</p>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 relative"> {/* Added relative for positioning text */}
      <h3 className="text-xl font-semibold mb-6">Boss Avatar (3D)</h3>
      <div className="w-64 h-64 mx-auto rounded-full border-4 overflow-hidden">
        <Avatar
          modelSrc={modelUrl}
          style={{ width: '100%', height: '100%', display: 'block' }}
          cameraInitialDistance={1.5}
          cameraTargetHeight={1.6}
          ambientLightIntensity={0.8} // Slightly increased ambient light
          directionalLightIntensity={2.0} // Slightly decreased direct light
          blendshapes={blendshapes}
          headMovement={true} // Enable head movement based on expression/audio
          animationSrc={expression === 'neutral' ? undefined : undefined} // Placeholder for specific animation files
        />
      </div>
      
      {/* Removed 2D emoji overlay */}

      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium capitalize text-gray-700">
          Current State: {expression}
        </div>
        {audioLevel > 0.1 && ( // Lowered threshold for showing text
          <div className="text-xs text-gray-500 animate-fade-in">
            {expression === 'afraid' && "Visualizing high intensity..."}
            {expression === 'anxious' && "Visualizing some concern..."}
            {expression === 'confused' && "Visualizing contemplation..."}
            {expression === 'neutral' && audioLevel > 0.1 && "Processing speech..."}
          </div>
        )}
      </div>
    </Card>
  );
};
