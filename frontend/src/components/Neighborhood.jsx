import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import ProtocolStoplight from './ProtocolStoplight';
import ProtocolBench from './ProtocolBench';
import * as THREE from 'three';

export default function Neighborhood() {
  
  return (
    <group>
      
      {/* Ground Plane */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Street Grid */}
      <group>
        {/* Main Street (horizontal) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[20, 0.02, 2]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
        
        {/* Cross Street (vertical) */}
        <mesh position={[0, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <boxGeometry args={[20, 0.02, 2]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
        
        {/* Crosswalk Stripes */}
        {Array.from({length: 6}).map((_, i) => (
          <mesh key={i} position={[-2.5 + i, 0.01, 0]}>
            <boxGeometry args={[0.3, 0.01, 2]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>
      
      {/* Protocol-Aware Stoplights */}
      <ProtocolStoplight position={[3, 0, 3]} />
      <ProtocolStoplight position={[-3, 0, -3]} />
      
      {/* Protocol-Aware Benches */}
      <ProtocolBench position={[5, 0, 1]} />
      <ProtocolBench position={[-5, 0, -1]} />
      
      {/* Simple Building Blocks */}
      <group>
        {/* Building 1 */}
        <mesh position={[8, 2, 8]} castShadow>
          <boxGeometry args={[3, 4, 3]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
        
        {/* Building 2 */}
        <mesh position={[-8, 1.5, 8]} castShadow>
          <boxGeometry args={[4, 3, 2]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>
        
        {/* Building 3 */}
        <mesh position={[8, 1, -8]} castShadow>
          <boxGeometry args={[2, 2, 4]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>
        
        {/* Building 4 */}
        <mesh position={[-8, 2.5, -8]} castShadow>
          <boxGeometry args={[3, 5, 3]} />
          <meshStandardMaterial color="#b0b0b0" />
        </mesh>
      </group>
      
      {/* Trees/Green Spaces */}
      <group>
        {Array.from({length: 8}).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 12;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <group key={i} position={[x, 0, z]}>
              {/* Tree trunk */}
              <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 2]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              
              {/* Tree canopy */}
              <mesh position={[0, 2.5, 0]}>
                <sphereGeometry args={[1.2, 8, 6]} />
                <meshStandardMaterial color="#228B22" />
              </mesh>
            </group>
          );
        })}
      </group>
      
      {/* Quiet Zones */}
      <group>
        <mesh position={[6, 0.01, -2]}>
          <circleGeometry args={[2, 16]} />
          <meshStandardMaterial 
            color="#e8f5e8" 
            transparent 
            opacity={0.6}
          />
        </mesh>
        
        <mesh position={[-6, 0.01, 2]}>
          <circleGeometry args={[2, 16]} />
          <meshStandardMaterial 
            color="#e8f5e8" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      </group>
      
      {/* Social Zones */}
      <group>
        <mesh position={[2, 0.01, 6]}>
          <circleGeometry args={[2.5, 16]} />
          <meshStandardMaterial 
            color="#fff5e6" 
            transparent 
            opacity={0.6}
          />
        </mesh>
        
        <mesh position={[-2, 0.01, -6]}>
          <circleGeometry args={[2.5, 16]} />
          <meshStandardMaterial 
            color="#fff5e6" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      </group>
      
    </group>
  );
}