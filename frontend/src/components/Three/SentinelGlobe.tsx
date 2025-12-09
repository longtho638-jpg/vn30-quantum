'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

export default function SentinelGlobe() {
    const globeRef = useRef<THREE.Mesh>(null);
    const starsRef = useRef<THREE.Points>(null);

    // Generate random stars
    const stars = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 1500; i++) {
            const x = (Math.random() - 0.5) * 80;
            const y = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            temp.push(x, y, z);
        }
        return new Float32Array(temp);
    }, []);

    // Generate connection lines (mock VN30 data flow)
    const lines = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 20; i++) {
            const theta1 = Math.random() * Math.PI * 2;
            const phi1 = Math.acos((Math.random() * 2) - 1);
            const theta2 = Math.random() * Math.PI * 2;
            const phi2 = Math.acos((Math.random() * 2) - 1);

            const r = 4.2; // Slightly above globe surface

            const x1 = r * Math.sin(phi1) * Math.cos(theta1);
            const y1 = r * Math.sin(phi1) * Math.sin(theta1);
            const z1 = r * Math.cos(phi1);

            const x2 = r * Math.sin(phi2) * Math.cos(theta2);
            const y2 = r * Math.sin(phi2) * Math.sin(theta2);
            const z2 = r * Math.cos(phi2);

            // Calculate control point for curve (higher than surface)
            const midX = (x1 + x2) / 2 * 1.5;
            const midY = (y1 + y2) / 2 * 1.5;
            const midZ = (z1 + z2) / 2 * 1.5;

            // Quadratic Bezier curve
            const curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(x1, y1, z1),
                new THREE.Vector3(midX, midY, midZ),
                new THREE.Vector3(x2, y2, z2)
            );

            temp.push(curve);
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (globeRef.current) {
            globeRef.current.rotation.y += 0.002;
        }
        if (starsRef.current) {
            starsRef.current.rotation.y -= 0.0005;
        }
    });

    return (
        <group position={[0, -1, 0]}>
            {/* Stars Background */}
            <points ref={starsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={stars.length / 3}
                        array={stars}
                        itemSize={3}
                        args={[stars, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.05} color="#8b5cf6" transparent opacity={0.6} />
            </points>

            {/* Main Globe */}
            <Sphere ref={globeRef} args={[4, 64, 64]}>
                <meshPhongMaterial
                    color="#0f172a"
                    emissive="#3b82f6"
                    emissiveIntensity={0.2}
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </Sphere>

            {/* Inner Core */}
            <Sphere args={[3.8, 32, 32]}>
                <meshBasicMaterial color="#000000" />
            </Sphere>

            {/* Data Flow Lines */}
            {lines.map((curve, i) => (
                <Line
                    key={i}
                    points={curve.getPoints(50)}
                    color={i % 2 === 0 ? '#10b981' : '#ec4899'} // Green and Pink lines
                    lineWidth={1}
                    transparent
                    opacity={0.4}
                />
            ))}

            {/* Glowing Atmosphere */}
            <Sphere args={[4.2, 32, 32]}>
                <meshBasicMaterial
                    color="#3b82f6"
                    transparent
                    opacity={0.05}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </Sphere>
        </group>
    );
}
