import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProtocolBench({ position }) {
  const benchRef = useRef();
  const auraRef = useRef();
  const [occupancyState, setOccupancyState] = useState('empty'); // empty, compatible, incompatible, full
  const [socialHeat, setSocialHeat] = useState(0);
  
  useFrame((state) => {
    // Simulate protocol-based occupancy changes
    const time = state.clock.elapsedTime;
    
    // TODO: In full implementation, this would:
    // 1. Detect avatars within sitting range
    // 2. Check protocol compatibility of nearby users  
    // 3. Display warnings for mismatched protocols
    // 4. Show availability based on social preferences
    
    // For now, simulate some occupancy patterns
    const occupancyPattern = Math.sin(time * 0.2) * 0.5 + 0.5;
    setSocialHeat(occupancyPattern);
    
    // Animate aura based on social heat
    if (auraRef.current) {
      auraRef.current.scale.setScalar(1 + socialHeat * 0.3);
    }
  });
  
  const getAuraColor = () => {
    // Green = welcoming, Yellow = neutral, Red = avoid
    if (socialHeat < 0.3) return '#44ff88'; // Welcome
    if (socialHeat < 0.7) return '#ffff44'; // Neutral  
    return '#ff8844'; // Crowded/incompatible
  };
  
  const getAuraOpacity = () => {
    return 0.2 + socialHeat * 0.3;
  };
  
  return (
    <group position={position}>
      
      {/* Bench Base */}
      <group ref={benchRef}>
        {/* Bench Legs */}
        <mesh position={[-0.8, 0.2, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0.8, 0.2, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[-0.8, 0.2, 0.4]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0.8, 0.2, 0.4]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        
        {/* Bench Seat */}
        <mesh position={[0, 0.45, 0.2]} castShadow>
          <boxGeometry args={[1.8, 0.1, 0.4]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Bench Back */}
        <mesh position={[0, 0.8, 0.4]} castShadow>
          <boxGeometry args={[1.8, 0.7, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>
      
      {/* Protocol Compatibility Aura */}
      <mesh ref={auraRef} position={[0, 0.1, 0.2]}>
        <cylinderGeometry args={[2, 2, 0.05, 16]} />
        <meshBasicMaterial 
          color={getAuraColor()}
          transparent
          opacity={getAuraOpacity()}
        />
      </mesh>
      
      {/* Social Heat Indicators */}
      {socialHeat > 0.7 && (
        <group position={[0, 1.2, 0.2]}>
          {/* Warning icon for high social density */}
          <mesh>
            <octahedronGeometry args={[0.1, 0]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
        </group>
      )}
      
      {socialHeat < 0.3 && (
        <group position={[0, 1.2, 0.2]}>
          {/* Welcome icon for low social density */}
          <mesh>
            <sphereGeometry args={[0.08, 8, 6]} />
            <meshBasicMaterial color="#44ff88" />
          </mesh>
        </group>
      )}
      
      {/* Invisible Interaction Zone */}
      <mesh position={[0, 0.5, 0]} visible={false}>
        <boxGeometry args={[3, 1, 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
    </group>
  );
}