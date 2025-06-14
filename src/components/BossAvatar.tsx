// src/components/BossAvatar.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@readyplayerme/visage';

interface BossAvatarProps {
  modelUrl: string | null;
  expression: 'neutral' | 'confused' | 'anxious' | 'afraid'; // Kept for future use
  audioLevel: number; // Kept for future use
}

// ARKIT_BLENDSHAPES and getBlendshapeValues definitions should remain here
// as they don't cause harm if not used by the <Avatar> component's props.
const ARKIT_BLENDSHAPES = {
  eyeBlinkLeft: 'eyeBlinkLeft',
  eyeBlinkRight: 'eyeBlinkRight',
  jawOpen: 'jawOpen',
  mouthSmileLeft: 'mouthSmileLeft',
  mouthSmileRight: 'mouthSmileRight',
  mouthFrownLeft: 'mouthFrownLeft',
  mouthFrownRight: 'mouthFrownRight',
  browInnerUp: 'browInnerUp',
  browDownLeft: 'browDownLeft',
  browDownRight: 'browDownRight',
  eyeWideLeft: 'eyeWideLeft',
  eyeWideRight: 'eyeWideRight',
  mouthFunnel: 'mouthFunnel',
  cheekPuff: 'cheekPuff',
};

const getBlendshapeValues = (
  expression: 'neutral' | 'confused' | 'anxious' | 'afraid',
  audioLevel: number
): Record<string, number> => {
  const base = Object.values(ARKIT_BLENDSHAPES).reduce((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {} as Record<string, number>);

  const intensity = Math.min(audioLevel * 1.5, 1.0);

  switch (expression) {
    case 'confused':
      return {
        ...base,
        [ARKIT_BLENDSHAPES.browInnerUp]: 0.5 + intensity * 0.3,
        [ARKIT_BLENDSHAPES.browDownLeft]: 0.4 + intensity * 0.2,
        [ARKIT_BLENDSHAPES.mouthFrownLeft]: 0.3,
        [ARKIT_BLENDSHAPES.jawOpen]: 0.05 + intensity * 0.05,
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
        [ARKIT_BLENDSHAPES.jawOpen]: Math.min(0.3 + intensity * 0.3, 0.7),
        [ARKIT_BLENDSHAPES.mouthFunnel]: Math.min(0.4 + intensity * 0.3, 0.7),
      };
    case 'neutral':
    default:
      const blink = Date.now() % 5000 > 4800 ? 1 : 0;
      return {
        ...base,
        [ARKIT_BLENDSHAPES.eyeBlinkLeft]: blink,
        [ARKIT_BLENDSHAPES.eyeBlinkRight]: blink,
        [ARKIT_BLENDSHAPES.jawOpen]: Math.min(intensity * 0.2, 0.1),
      };
  }
};


export const BossAvatar: React.FC<BossAvatarProps> = ({
  modelUrl,
  expression,
  audioLevel,
}) => {
  // const blendshapes = getBlendshapeValues(expression, audioLevel); // Ensure this is commented out

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
    <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 relative">
      <h3 className="text-xl font-semibold mb-6">Boss Avatar (3D)</h3>
      <div className="w-64 h-64 mx-auto rounded-full border-4 overflow-hidden">
        <Avatar
          key={modelUrl} // Added key prop
          modelSrc={modelUrl}
          style={{ width: '100%', height: '100%', display: 'block' }}
          cameraInitialDistance={1.5}
          cameraTargetHeight={1.6}
          ambientLightIntensity={0.8}
          directionalLightIntensity={2.0}
          // blendshapes={blendshapes} // Ensure this is commented out
          headMovement={true}
          animationSrc={undefined}
          custom={{}} // Ensure this is present
        />
      </div>
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium capitalize text-gray-700">
          Displaying 3D Model (Expressions Currently Disabled for Test)
        </div>
         <div className="text-xs text-gray-500">Expression state: {expression}, Audio: {audioLevel.toFixed(2)}</div>
      </div>
    </Card>
  );
};
