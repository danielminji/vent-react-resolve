import React, { Suspense, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Canvas } from '@react-three/fiber'; // useFrame removed as it's not used in this step
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'; // useAnimations removed
import * as THREE from 'three';

interface BossAvatarProps {
  modelUrl: string | null;
  expression: 'neutral' | 'confused' | 'anxious' | 'afraid';
  audioLevel: number;
}

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
      // For neutral, simple blink based on time. A proper useFrame solution would be smoother.
      const blink = Date.now() % 5000 > 4800 ? 1 : 0;
      return {
        ...base,
        [ARKIT_BLENDSHAPES.eyeBlinkLeft]: blink,
        [ARKIT_BLENDSHAPES.eyeBlinkRight]: blink,
        [ARKIT_BLENDSHAPES.jawOpen]: Math.min(intensity * 0.2, 0.1), // Minimal movement for neutral speech
      };
  }
};

interface ModelProps {
  modelUrl: string;
  expression: 'neutral' | 'confused' | 'anxious' | 'afraid';
  audioLevel: number;
}

function Model({ modelUrl, expression, audioLevel }: ModelProps) {
  const { scene } = useGLTF(modelUrl);
  const group = useRef<THREE.Group>(null);

  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null);
  const teethMeshRef = useRef<THREE.SkinnedMesh | null>(null);
  // Optional refs for eyes if needed, but often head blendshapes control them.
  // const eyeLeftMeshRef = useRef<THREE.SkinnedMesh | null>(null);
  // const eyeRightMeshRef = useRef<THREE.SkinnedMesh | null>(null);

  useEffect(() => {
    if (scene) {
      headMeshRef.current = null;
      teethMeshRef.current = null;
      // eyeLeftMeshRef.current = null;
      // eyeRightMeshRef.current = null;

      scene.traverse(object => {
        if (object instanceof THREE.SkinnedMesh) {
          if (object.name === "Wolf3D_Head") {
            headMeshRef.current = object;
          } else if (object.name === "Wolf3D_Teeth") {
            teethMeshRef.current = object;
          }
          // else if (object.name === "EyeLeft") { eyeLeftMeshRef.current = object; }
          // else if (object.name === "EyeRight") { eyeRightMeshRef.current = object; }
        }
      });
      // console.log("Head mesh:", headMeshRef.current);
      // console.log("Teeth mesh:", teethMeshRef.current);
    }
  }, [scene]);

  useEffect(() => {
    const meshesToAnimate = [headMeshRef.current, teethMeshRef.current].filter(Boolean) as THREE.SkinnedMesh[];

    if (meshesToAnimate.length > 0) {
      const blendValues = getBlendshapeValues(expression, audioLevel);
      // console.log("Applying blendshapes: ", JSON.stringify(blendValues)); // For debugging

      meshesToAnimate.forEach(mesh => {
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          Object.keys(blendValues).forEach(key => {
            const index = mesh.morphTargetDictionary![key];
            if (index !== undefined) {
              const currentValue = mesh.morphTargetInfluences![index] || 0;
              // Using a slightly higher lerp factor for quicker response, adjust as needed
              mesh.morphTargetInfluences![index] = THREE.MathUtils.lerp(currentValue, blendValues[key], 0.6);
            }
          });
        }
      });
    }
  }, [expression, audioLevel, scene]); // scene dependency helps ensure meshes are found

  // Ensure scale and position are appropriate for typical RPM avatars
  return <primitive object={scene} ref={group} scale={1.8} position={[0, -1.75, 0]} />; // Adjusted scale & position
}

export const BossAvatar: React.FC<BossAvatarProps> = ({
  modelUrl,
  expression,
  audioLevel,
}) => {
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
      <div className="w-full h-80 mx-auto rounded-lg border-2 overflow-hidden bg-gray-300">
        <Canvas camera={{ position: [0, -0.2, 2.0], fov: 45 }}> {/* Adjusted camera y and z */}
          <ambientLight intensity={0.9} />
          <directionalLight
            position={[3, 4, 2.5]} // Adjusted light position
            intensity={2.2}
          />
           <Environment preset="sunset" /> {/* Changed preset back to sunset for warmer lighting */}
          <Suspense fallback={null}>
            <Model modelUrl={modelUrl} expression={expression} audioLevel={audioLevel} />
          </Suspense>
          <OrbitControls
            target={[0, -0.7, 0]} // Adjusted target further down
            enablePan={true}
            enableZoom={true}
          />
        </Canvas>
      </div>
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium capitalize text-gray-700">
          Current State: {expression}
        </div>
        <div className="text-xs text-gray-500">Audio: {audioLevel.toFixed(2)}</div>
      </div>
    </Card>
  );
};
