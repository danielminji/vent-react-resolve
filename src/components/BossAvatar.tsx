import React, { Suspense, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface BossAvatarProps {
  avatarImage: string | null; // For the 2D image
  modelUrl: string | null;    // For the 3D model
  expression: 'neutral' | 'confused' | 'anxious' | 'afraid';
  audioLevel: number;
}

const get2DImageStyle = (
  expression: BossAvatarProps['expression'],
  audioLevel: number
): React.CSSProperties => {
  const intensity = Math.min(audioLevel * 1.5, 1.0);
  switch (expression) {
    case 'afraid':
      return {
        transform: `scale(${0.9 - intensity * 0.1}) perspective(500px) translateZ(${intensity * 20}px)`,
        filter: 'brightness(0.8) saturate(1.2)',
        borderColor: '#ef4444', borderWidth: '3px', borderStyle: 'solid',
        boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)',
        transition: 'all 0.2s ease-in-out',
      };
    case 'anxious':
      return {
        transform: `scale(${0.95 - intensity * 0.05}) rotate3d(${intensity * 0.1}, ${intensity * 0.2}, 0, ${intensity * 5}deg)`,
        filter: 'brightness(0.9) contrast(1.1)',
        borderColor: '#f59e0b', borderWidth: '3px', borderStyle: 'solid',
        transition: 'all 0.2s ease-in-out',
      };
    case 'confused':
      return {
        transform: `skew(${(Math.sin(Date.now() * 0.001 + audioLevel) * intensity * 5)}deg, ${(Math.cos(Date.now() * 0.0008 + audioLevel) * intensity * 3)}deg)`,
        filter: 'brightness(0.95)',
        borderColor: '#3b82f6', borderWidth: '3px', borderStyle: 'solid',
        transition: 'all 0.1s ease-in-out', // Faster for wobble
      };
    case 'neutral':
    default:
      return {
        transform: `scale(${1 + intensity * 0.02})`,
        borderColor: '#d1d5db', borderWidth: '2px', borderStyle: 'solid',
        transition: 'all 0.2s ease-in-out',
      };
  }
};

// ARKIT_BLENDSHAPES and getBlendshapeValues definitions (kept from previous step)
const ARKIT_BLENDSHAPES = {
  eyeBlinkLeft: 'eyeBlinkLeft', eyeBlinkRight: 'eyeBlinkRight', jawOpen: 'jawOpen',
  mouthSmileLeft: 'mouthSmileLeft', mouthSmileRight: 'mouthSmileRight',
  mouthFrownLeft: 'mouthFrownLeft', mouthFrownRight: 'mouthFrownRight',
  browInnerUp: 'browInnerUp', browDownLeft: 'browDownLeft', browDownRight: 'browDownRight',
  eyeWideLeft: 'eyeWideLeft', eyeWideRight: 'eyeWideRight',
  mouthFunnel: 'mouthFunnel', cheekPuff: 'cheekPuff',
};

const getBlendshapeValues = (
  expression: BossAvatarProps['expression'], audioLevel: number
): Record<string, number> => {
  const base = Object.values(ARKIT_BLENDSHAPES).reduce((acc, name) => ({ ...acc, [name]: 0 }), {} as Record<string, number>);
  const intensity = Math.min(audioLevel * 1.5, 1.0);
  switch (expression) {
    case 'confused': return { ...base, [ARKIT_BLENDSHAPES.browInnerUp]: 0.5 + intensity * 0.3, [ARKIT_BLENDSHAPES.browDownLeft]: 0.4 + intensity * 0.2, [ARKIT_BLENDSHAPES.mouthFrownLeft]: 0.3, [ARKIT_BLENDSHAPES.jawOpen]: 0.05 + intensity * 0.05, };
    case 'anxious': return { ...base, [ARKIT_BLENDSHAPES.eyeWideLeft]: 0.2 + intensity * 0.3, [ARKIT_BLENDSHAPES.eyeWideRight]: 0.2 + intensity * 0.3, [ARKIT_BLENDSHAPES.browInnerUp]: 0.3 + intensity * 0.2, [ARKIT_BLENDSHAPES.mouthFrownLeft]: 0.2 + intensity * 0.1, [ARKIT_BLENDSHAPES.mouthFrownRight]: 0.2 + intensity * 0.1, [ARKIT_BLENDSHAPES.jawOpen]: 0.1 + intensity * 0.1, };
    case 'afraid': return { ...base, [ARKIT_BLENDSHAPES.eyeWideLeft]: Math.min(0.6 + intensity * 0.4, 1.0), [ARKIT_BLENDSHAPES.eyeWideRight]: Math.min(0.6 + intensity * 0.4, 1.0), [ARKIT_BLENDSHAPES.browInnerUp]: Math.min(0.7 + intensity * 0.3, 1.0), [ARKIT_BLENDSHAPES.jawOpen]: Math.min(0.3 + intensity * 0.3, 0.7), [ARKIT_BLENDSHAPES.mouthFunnel]: Math.min(0.4 + intensity * 0.3, 0.7), };
    default: const blink = Date.now() % 5000 > 4800 ? 1 : 0; return { ...base, [ARKIT_BLENDSHAPES.eyeBlinkLeft]: blink, [ARKIT_BLENDSHAPES.eyeBlinkRight]: blink, [ARKIT_BLENDSHAPES.jawOpen]: Math.min(intensity * 0.2, 0.1), };
  }
};

interface ModelProps {
  modelUrl: string;
  expression: BossAvatarProps['expression'];
  audioLevel: number;
}

function Model({ modelUrl, expression, audioLevel }: ModelProps) {
  const { scene } = useGLTF(modelUrl);
  const group = useRef<THREE.Group>(null);
  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null);
  const teethMeshRef = useRef<THREE.SkinnedMesh | null>(null);

  useEffect(() => {
    if (scene) {
      headMeshRef.current = null; teethMeshRef.current = null;
      scene.traverse(object => {
        if (object instanceof THREE.SkinnedMesh) {
          if (object.name === "Wolf3D_Head") headMeshRef.current = object;
          else if (object.name === "Wolf3D_Teeth") teethMeshRef.current = object;
        }
      });
    }
  }, [scene]);

  useEffect(() => {
    const meshes = [headMeshRef.current, teethMeshRef.current].filter(Boolean) as THREE.SkinnedMesh[];
    if (meshes.length > 0) {
      const blendValues = getBlendshapeValues(expression, audioLevel);
      meshes.forEach(mesh => {
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          Object.keys(blendValues).forEach(key => {
            const index = mesh.morphTargetDictionary![key];
            if (index !== undefined) {
              const current = mesh.morphTargetInfluences![index] || 0;
              mesh.morphTargetInfluences![index] = THREE.MathUtils.lerp(current, blendValues[key], 0.6);
            }
          });
        }
      });
    }
  }, [expression, audioLevel, scene]);

  return <primitive object={scene} ref={group} scale={1.8} position={[0, -1.75, 0]} />;
}

export const BossAvatar: React.FC<BossAvatarProps> = ({
  avatarImage,
  modelUrl,
  expression,
  audioLevel,
}) => {
  const imageStyle = get2DImageStyle(expression, audioLevel);

  if (!avatarImage) {
    return (
      <Card className="p-6 text-center flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
        <span className="text-4xl">🖼️</span>
        <p className="mt-2 text-gray-500">No boss image uploaded.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 relative">
      <h3 className="text-xl font-semibold mb-4">
        {modelUrl ? "Boss Avatar (3D & 2D)" : "Boss Avatar (2D)"}
      </h3>

      {modelUrl ? (
        // Dual Display: 2D and 3D, same size
        <div className="w-full flex flex-col items-center space-y-4">
          {/* 2D Image Frame */}
          <div
            className="w-full max-w-xs h-64 rounded-lg border-2 overflow-hidden shadow-md"
            style={{ ...imageStyle, borderColor: imageStyle.borderColor || '#ccc' }}
          >
            <img src={avatarImage} alt="Boss 2D Preview" className="w-full h-full object-cover" />
          </div>
          {/* 3D Model Frame */}
          <div className="w-full max-w-xs h-64 rounded-lg border-2 overflow-hidden bg-gray-300 shadow-md">
            <Canvas camera={{ position: [0, 0.1, 1.8], fov: 40 }}> {/* Values from example */}
              <ambientLight intensity={1.2} /> {/* Value from example */}
              <directionalLight position={[3, 3, 5]} intensity={2.8} /> {/* Value from example */}
              <Environment preset="apartment" /> {/* Value from example */}
              <Suspense fallback={null}>
                <Model modelUrl={modelUrl} expression={expression} audioLevel={audioLevel} />
              </Suspense>
              <OrbitControls target={[0, -0.2, 0]} /> {/* Value from example */}
            </Canvas>
          </div>
        </div>
      ) : (
        // 2D Only Display
        <div className="w-full flex flex-col items-center">
          <div
            className="w-full max-w-xs h-64 rounded-lg border-2 overflow-hidden shadow-md" // Consistent size
            style={{ ...imageStyle, borderColor: imageStyle.borderColor || '#ccc' }}
          >
            <img src={avatarImage} alt="Boss 2D Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <div className="mt-4 space-y-1">
        <div className="text-sm font-medium capitalize text-gray-700">
          Current State: {expression}
        </div>
        <div className="text-xs text-gray-500">Audio Level: {audioLevel.toFixed(2)}</div>
      </div>
    </Card>
  );
};
