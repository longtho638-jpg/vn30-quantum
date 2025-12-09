import { Canvas } from '@react-three/fiber';
import { Suspense, ReactNode } from 'react';

interface SceneContainerProps {
    children: ReactNode;
    className?: string;
    height?: string;
}

export default function SceneContainer({ children, className = '', height = '100vh' }: SceneContainerProps) {
    return (
        <div className={`w-full ${className}`} style={{ height }}>
            <Canvas
                camera={{ position: [0, 0, 10], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />

                <Suspense fallback={null}>
                    {children}
                </Suspense>
            </Canvas>
        </div>
    );
}
