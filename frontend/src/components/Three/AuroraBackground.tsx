'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
varying vec2 vUv;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  st.x *= uResolution.x / uResolution.y;
  
  float time = uTime * 0.2;
  
  // Auroras
  vec3 color = vec3(0.0);
  
  // Deep space base
  color = vec3(0.05, 0.08, 0.15);
  
  // Layer 1: Purple Flow
  float n1 = snoise(st * 3.0 + vec2(time * 0.1, time * 0.2));
  color += vec3(0.4, 0.1, 0.6) * smoothstep(0.2, 0.8, n1) * 0.6;
  
  // Layer 2: Cyan Ribbons
  float n2 = snoise(st * 6.0 - vec2(time * 0.15, time * 0.1));
  color += vec3(0.0, 0.8, 0.8) * smoothstep(0.4, 0.9, n2) * 0.4;
  
  // Layer 3: Pink Highlights
  float n3 = snoise(st * 4.0 + vec2(time * 0.2, -time * 0.1));
  color += vec3(0.8, 0.2, 0.5) * smoothstep(0.3, 0.7, n3) * 0.3;
  
  // Vignette
  float dist = distance(vUv, vec2(0.5));
  color *= 1.2 - dist * 0.8;
  
  gl_FragColor = vec4(color, 1.0);
}
`;

export default function AuroraBackground() {
    const mesh = useRef<THREE.Mesh>(null);
    const { size, mouse } = useThree();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
            uMouse: { value: new THREE.Vector2(0, 0) },
        }),
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );

    useFrame((state) => {
        const { clock } = state;
        if (mesh.current) {
            const material = mesh.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = clock.getElapsedTime();
            material.uniforms.uMouse.value = new THREE.Vector2(mouse.x, mouse.y);
        }
    });

    return (
        <mesh ref={mesh} scale={[20, 10, 1]}> {/* Scale to cover screen */}
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}
