import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProtocolNegotiation({ 
  userProtocols, 
  partnerProtocols, 
  userPosition, 
  partnerPosition 
}) {
  const bridgeRef = useRef();
  const particlesRef = useRef();
  
  // Calculate compatibility and visual properties
  const negotiationData = useMemo(() => {
    if (!userProtocols || !partnerProtocols) return null;
    
    // Calculate distance between avatars
    const userPos = new THREE.Vector3(...userPosition);
    const partnerPos = new THREE.Vector3(...partnerPosition);
    const distance = userPos.distanceTo(partnerPos);
    const midpoint = userPos.clone().lerp(partnerPos, 0.5);
    
    // Calculate compatibility factors (same as in ProtocolBuilder)
    const factors = [
      Math.abs(userProtocols.energyLevel - partnerProtocols.energyLevel) / 10,
      userProtocols.communicationMode === partnerProtocols.communicationMode ? 0 : 0.3,
      userProtocols.interruptibility === partnerProtocols.interruptibility ? 0 : 0.2,
      Math.abs(userProtocols.socialBattery - partnerProtocols.socialBattery) / 10
    ];
    
    const compatibility = Math.max(0, 1 - factors.reduce((a, b) => a + b, 0));
    
    // Visual properties based on compatibility
    const bridgeColor = compatibility > 0.7 
      ? new THREE.Color(0.2, 0.8, 0.3) // Green - high compatibility
      : compatibility > 0.4
      ? new THREE.Color(0.9, 0.7, 0.2) // Yellow - medium compatibility  
      : new THREE.Color(0.9, 0.3, 0.2); // Red - low compatibility
    
    return {
      distance,
      midpoint,
      compatibility,
      bridgeColor,
      bridgeOpacity: Math.max(0.3, compatibility),
      particleCount: Math.floor(compatibility * 20),
      frictionPoints: factors.map((factor, index) => ({
        intensity: factor,
        type: ['energy', 'communication', 'interruptibility', 'social'][index]
      }))
    };
  }, [userProtocols, partnerProtocols, userPosition, partnerPosition]);
  
  useFrame((state) => {
    if (!negotiationData || !bridgeRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Animate bridge based on compatibility
    const pulse = Math.sin(time * negotiationData.compatibility * 2) * 0.1 + 1;
    bridgeRef.current.scale.y = pulse;
    
    // Animate particles if they exist
    if (particlesRef.current && negotiationData.particleCount > 0) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < negotiationData.particleCount * 3; i += 3) {
        // Create flowing particles between avatars
        const progress = (time * 0.5 + i * 0.1) % 1;
        const x = THREE.MathUtils.lerp(userPosition[0], partnerPosition[0], progress);
        const z = THREE.MathUtils.lerp(userPosition[2], partnerPosition[2], progress);
        const y = 1 + Math.sin(progress * Math.PI) * 0.5; // Arc
        
        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  if (!negotiationData) return null;
  
  // Only show negotiation visuals when avatars are close enough
  if (negotiationData.distance > 6) return null;
  
  return (
    <group>
      
      {/* Compatibility Bridge */}
      <mesh 
        ref={bridgeRef}
        position={[negotiationData.midpoint.x, 1.2, negotiationData.midpoint.z]}
        rotation={[0, Math.atan2(partnerPosition[2] - userPosition[2], partnerPosition[0] - userPosition[0]), 0]}
      >
        <boxGeometry args={[negotiationData.distance * 0.8, 0.05, 0.2]} />
        <meshStandardMaterial 
          color={negotiationData.bridgeColor}
          emissive={negotiationData.bridgeColor}
          emissiveIntensity={0.3}
          transparent
          opacity={negotiationData.bridgeOpacity}
        />
      </mesh>
      
      {/* Compatibility Score Display */}
      <group position={[negotiationData.midpoint.x, 2, negotiationData.midpoint.z]}>
        <mesh>
          <planeGeometry args={[1, 0.3]} />
          <meshBasicMaterial 
            color="#000000"
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* TODO: Add text showing compatibility percentage */}
      </group>
      
      {/* Friction Point Indicators */}
      {negotiationData.frictionPoints.map((friction, index) => {
        if (friction.intensity < 0.1) return null; // Don't show minor friction
        
        const angle = (index / negotiationData.frictionPoints.length) * Math.PI * 2;
        const radius = 1;
        const x = negotiationData.midpoint.x + Math.cos(angle) * radius;
        const z = negotiationData.midpoint.z + Math.sin(angle) * radius;
        
        return (
          <mesh key={index} position={[x, 1.5, z]}>
            <octahedronGeometry args={[0.1 * friction.intensity, 0]} />
            <meshBasicMaterial 
              color={friction.intensity > 0.5 ? "#ff4444" : "#ffaa44"}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
      
      {/* Flow Particles (when compatible) */}
      {negotiationData.compatibility > 0.5 && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={negotiationData.particleCount}
              array={new Float32Array(negotiationData.particleCount * 3)}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial 
            color={negotiationData.bridgeColor}
            size={0.05}
            transparent
            opacity={0.6}
          />
        </points>
      )}
      
    </group>
  );
}