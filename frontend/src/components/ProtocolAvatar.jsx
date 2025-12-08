import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProtocolAvatar({ position, protocols, isUser = false }) {
  const avatarRef = useRef();
  const boundaryRef = useRef();
  const glowRef = useRef();
  
  // Calculate visual properties from protocols
  const visualProps = useMemo(() => {
    const energy = protocols.energyLevel / 10; // 0-1
    const socialBattery = protocols.socialBattery / 10; // 0-1
    const overwhelmed = energy < 0.3 || socialBattery < 0.3;
    
    return {
      // Core color based on communication style and energy
      coreColor: protocols.communicationMode === 'async' 
        ? new THREE.Color(0.2, 0.6, 0.9) // Blue for async
        : new THREE.Color(0.9, 0.5, 0.2), // Orange for sync
      
      // Boundary ring size based on interruptibility and energy
      boundaryRadius: overwhelmed ? 2.5 : 
                     protocols.interruptibility === 'scheduled' ? 2.0 : 1.5,
      
      // Glow intensity based on openness to interaction
      glowIntensity: socialBattery * energy,
      
      // Animation speed based on energy level
      animationSpeed: energy * 0.5,
      
      // Core size based on focus state
      coreSize: protocols.focusState === 'deep-work' ? 0.6 : 0.8,
      
      // Boundary visibility
      boundaryOpacity: overwhelmed ? 0.8 : 0.3,
      
      // Special states
      isOverwhelmed: overwhelmed,
      isFocused: protocols.focusState === 'deep-work',
      isOpen: socialBattery > 0.6 && energy > 0.6
    };
  }, [protocols]);

  // Animation loop
  useFrame((state) => {
    if (!avatarRef.current || !boundaryRef.current) return;
    
    const time = state.clock.elapsedTime;
    const speed = visualProps.animationSpeed;
    
    // Core avatar gentle floating
    avatarRef.current.position.y = Math.sin(time * speed) * 0.1;
    
    // Boundary ring pulsing
    const pulse = Math.sin(time * speed * 2) * 0.05 + 1;
    boundaryRef.current.scale.setScalar(pulse);
    
    // Overwhelmed state: tighter, faster pulse
    if (visualProps.isOverwhelmed) {
      const stressPulse = Math.sin(time * 4) * 0.1 + 0.9;
      avatarRef.current.scale.setScalar(stressPulse);
    }
    
    // Focused state: stable, directional
    if (visualProps.isFocused) {
      avatarRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
    }
  });

  return (
    <group position={position}>
      
      {/* Boundary Ring */}
      <mesh ref={boundaryRef} position={[0, 0.1, 0]}>
        <torusGeometry args={[visualProps.boundaryRadius, 0.05, 8, 32]} />
        <meshBasicMaterial 
          color={visualProps.coreColor}
          transparent 
          opacity={visualProps.boundaryOpacity}
          wireframe={visualProps.isOverwhelmed}
        />
      </mesh>
      
      {/* Core Avatar */}
      <mesh ref={avatarRef} position={[0, 1, 0]} castShadow>
        <octahedronGeometry args={[visualProps.coreSize, 1]} />
        <meshStandardMaterial 
          color={visualProps.coreColor}
          metalness={0.2}
          roughness={0.8}
          emissive={visualProps.coreColor}
          emissiveIntensity={visualProps.glowIntensity * 0.3}
        />
      </mesh>
      
      {/* Glow Effect */}
      {visualProps.glowIntensity > 0.3 && (
        <mesh ref={glowRef} position={[0, 1, 0]}>
          <sphereGeometry args={[visualProps.coreSize * 1.5, 16, 16]} />
          <meshBasicMaterial 
            color={visualProps.coreColor}
            transparent 
            opacity={visualProps.glowIntensity * 0.2}
          />
        </mesh>
      )}
      
      {/* User/Partner Label */}
      <group position={[0, 2.5, 0]}>
        <mesh>
          <planeGeometry args={[1.5, 0.3]} />
          <meshBasicMaterial 
            color={isUser ? "#000000" : "#666666"} 
            transparent 
            opacity={0.8}
          />
        </mesh>
      </group>
      
      {/* Protocol State Indicators */}
      {visualProps.isOverwhelmed && (
        <mesh position={[0, 2, 0]}>
          <coneGeometry args={[0.1, 0.3, 6]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}
      
      {visualProps.isFocused && (
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[0.2, 0.05, 0.2]} />
          <meshBasicMaterial color="purple" />
        </mesh>
      )}
      
    </group>
  );
}