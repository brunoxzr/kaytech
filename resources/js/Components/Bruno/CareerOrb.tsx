import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import { LucideIcon } from 'lucide-react';

interface CareerOrbProps {
    color: string;
    icon: LucideIcon;
    active: boolean;
}

/** A real WebGL card — beveled glass/metal box, lit and shadowed, tilting toward the
 * pointer — showing the milestone's icon. This replaces the earlier abstract distorted
 * sphere with something that reads as an actual rendered product surface. */
const Card3D: React.FC<{ color: string; icon: LucideIcon; active: boolean }> = ({ color, icon: Icon, active }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { pointer } = useThree();

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        const targetX = pointer.y * 0.25;
        const targetY = pointer.x * 0.35;
        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * Math.min(1, delta * 4);
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * Math.min(1, delta * 4);
    });

    return (
        <group ref={groupRef}>
            <RoundedBox args={[1.6, 1.6, 0.22]} radius={0.16} smoothness={6}>
                <meshPhysicalMaterial
                    color={color}
                    metalness={0.35}
                    roughness={0.25}
                    clearcoat={1}
                    clearcoatRoughness={0.15}
                    emissive={color}
                    emissiveIntensity={active ? 0.25 : 0.08}
                />
            </RoundedBox>
            <Html center transform occlude distanceFactor={2.6} position={[0, 0, 0.13]}>
                <Icon className="w-9 h-9 text-white drop-shadow" strokeWidth={1.75} />
            </Html>
        </group>
    );
};

export const CareerOrb: React.FC<CareerOrbProps> = ({ color, icon, active }) => {
    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 3.4], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[3, 4, 5]} intensity={1.4} color="#ffffff" />
                <pointLight position={[-2, -2, 2]} intensity={0.5} color={color} />
                <pointLight position={[2, -1, 3]} intensity={0.6} color="#ffffff" />
                <Suspense fallback={null}>
                    <Card3D color={color} icon={icon} active={active} />
                </Suspense>
            </Canvas>
        </div>
    );
};
