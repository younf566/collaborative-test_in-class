import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DynamicBuilding({ 
  position, 
  protocols, 
  frictionLevel = 0, 
  buildingType = "social" 
}) {
  const buildingRef = useRef();
  const detailsRef = useRef();
  
  // Calculate building properties from protocols
  const buildingProps = useMemo(() => {
    if (!protocols) return { height: 2, color: '#cccccc', complexity: 1 };
    
    const energy = protocols.energyLevel / 10;
    const socialBattery = protocols.socialBattery / 10;
    const isAsync = protocols.communicationMode === 'async';
    const needsSpace = protocols.interruptibility === 'scheduled';
    
    // Different building types respond differently
    const typeMultipliers = {
      social: { height: 1 + energy, color: energy > 0.6 ? '#ff9966' : '#99ccff' },
      work: { height: 1 + (needsSpace ? 0.8 : 0.2), color: isAsync ? '#6699ff' : '#99ff66' },
      quiet: { height: 1 + (1 - socialBattery), color: socialBattery < 0.4 ? '#99ff99' : '#ffaa99' },
      hybrid: { height: 1 + energy * socialBattery, color: '#cc99ff' }
    };
    
    const type = typeMultipliers[buildingType] || typeMultipliers.social;
    
    return {
      height: Math.max(0.5, type.height * (2 + frictionLevel)),
      color: type.color,
      complexity: 1 + energy + frictionLevel,
      shouldTwist: frictionLevel > 0.5,
      shouldGlow: energy > 0.7 || frictionLevel > 0.6
    };
  }, [protocols, frictionLevel, buildingType]);
  
  useFrame((state) => {
    if (!buildingRef.current || !detailsRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Breathing animation based on energy
    const breathe = Math.sin(time * 2) * 0.1 + 1;
    buildingRef.current.scale.y = breathe * (0.8 + buildingProps.height * 0.2);
    
    // Twist when there's friction
    if (buildingProps.shouldTwist) {
      buildingRef.current.rotation.y = Math.sin(time * frictionLevel) * 0.2;
    }
    
    // Pulse details when high energy
    if (buildingProps.shouldGlow) {
      const pulse = Math.sin(time * 4) * 0.3 + 0.7;
      detailsRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <group position={position}>
      
      {/* Main Building Mass */}
      <mesh ref={buildingRef} position={[0, buildingProps.height / 2, 0]} castShadow>
        <boxGeometry args={[2, buildingProps.height, 2]} />
        <meshStandardMaterial 
          color={buildingProps.color}
          emissive={buildingProps.shouldGlow ? buildingProps.color : '#000000'}
          emissiveIntensity={buildingProps.shouldGlow ? 0.2 : 0}
        />
      </mesh>
      
      {/* Building Details - complexity increases with energy/friction */}
      <group ref={detailsRef}>
        {Array.from({length: Math.floor(buildingProps.complexity)}).map((_, i) => {
          const y = 0.3 + (i * 0.4);
          const size = 0.8 - (i * 0.1);
          
          return (
            <mesh key={`detail-${i}`} position={[0, y, 1.1]} castShadow>
              <boxGeometry args={[size, 0.2, 0.2]} />
              <meshStandardMaterial 
                color={frictionLevel > 0.5 ? '#ff6666' : '#ffffff'}
              />
            </mesh>
          );
        })}
        
        {/* Roof elements that change with social battery */}
        {protocols && protocols.socialBattery > 5 && (
          <mesh position={[0, buildingProps.height + 0.2, 0]}>
            <coneGeometry args={[0.5, 0.4, 6]} />
            <meshStandardMaterial 
              color={protocols.socialBattery > 8 ? '#ffff66' : '#66ffff'}
            />
          </mesh>
        )}
        
        {/* Antenna/spikes when overwhelmed */}
        {protocols && protocols.energyLevel < 3 && (
          <mesh position={[0, buildingProps.height + 0.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1]} />
            <meshStandardMaterial color="#ff4444" />
          </mesh>
        )}
      </group>
      
      {/* Foundation that spreads with boundary needs */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[
          protocols?.interruptibility === 'scheduled' ? 1.5 : 1, 
          1.2, 
          0.2, 
          8
        ]} />
        <meshStandardMaterial 
          color="#888888"
          transparent
          opacity={0.6}
        />
      </mesh>
      
    </group>
  );
}