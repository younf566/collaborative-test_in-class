import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProtocolStoplight({ position }) {
  const lightRef = useRef();
  const [currentState, setCurrentState] = useState('green'); // green, yellow, red
  const [timer, setTimer] = useState(0);
  const [adaptiveDelay, setAdaptiveDelay] = useState(0);
  
  // Base timing for traffic light cycles
  const baseTiming = {
    green: 8,
    yellow: 2, 
    red: 6
  };
  
  useFrame((state, delta) => {
    // Update timer
    setTimer(prev => prev + delta);
    
    // Simple traffic light cycle with protocol adaptation
    const totalCycle = baseTiming.green + baseTiming.yellow + baseTiming.red + adaptiveDelay;
    const cycleTime = timer % totalCycle;
    
    let newState = 'green';
    if (cycleTime < baseTiming.green + adaptiveDelay) {
      newState = 'green';
    } else if (cycleTime < baseTiming.green + adaptiveDelay + baseTiming.yellow) {
      newState = 'yellow'; 
    } else {
      newState = 'red';
    }
    
    if (newState !== currentState) {
      setCurrentState(newState);
    }
    
    // TODO: In full implementation, this would:
    // 1. Detect nearby avatars within radius
    // 2. Check their protocol states (overwhelmed, energy levels)
    // 3. Adjust timing accordingly (slower for overwhelmed users)
    // 4. Change light color intensity based on collective stress
    
    // For now, simulate some adaptive behavior
    const stress = Math.sin(state.clock.elapsedTime * 0.3) * 0.5 + 0.5;
    setAdaptiveDelay(stress * 2); // Add up to 2 seconds for "stressed" periods
  });
  
  const getLightColor = (lightType) => {
    const colors = {
      red: currentState === 'red' ? '#ff4444' : '#441111',
      yellow: currentState === 'yellow' ? '#ffff44' : '#444411', 
      green: currentState === 'green' ? '#44ff44' : '#114411'
    };
    return colors[lightType];
  };
  
  const getLightIntensity = (lightType) => {
    return currentState === lightType ? 0.8 : 0.1;
  };
  
  return (
    <group position={position}>
      
      {/* Stoplight Pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Light Housing */}
      <mesh position={[0, 3.5, 0]} ref={lightRef}>
        <boxGeometry args={[0.4, 1.2, 0.2]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      
      {/* Red Light */}
      <mesh position={[0, 3.9, 0.11]}>
        <circleGeometry args={[0.12, 8]} />
        <meshStandardMaterial 
          color={getLightColor('red')}
          emissive={getLightColor('red')}
          emissiveIntensity={getLightIntensity('red')}
        />
      </mesh>
      
      {/* Yellow Light */}
      <mesh position={[0, 3.5, 0.11]}>
        <circleGeometry args={[0.12, 8]} />
        <meshStandardMaterial 
          color={getLightColor('yellow')}
          emissive={getLightColor('yellow')}
          emissiveIntensity={getLightIntensity('yellow')}
        />
      </mesh>
      
      {/* Green Light */}
      <mesh position={[0, 3.1, 0.11]}>
        <circleGeometry args={[0.12, 8]} />
        <meshStandardMaterial 
          color={getLightColor('green')}
          emissive={getLightColor('green')}
          emissiveIntensity={getLightIntensity('green')}
        />
      </mesh>
      
      {/* Protocol Adaptation Indicator */}
      <mesh position={[0, 2.5, 0]}>
        <torusGeometry args={[0.2, 0.02, 8, 16]} />
        <meshStandardMaterial 
          color={adaptiveDelay > 1 ? '#ff9999' : '#99ff99'}
          emissive={adaptiveDelay > 1 ? '#ff9999' : '#99ff99'}
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
      
    </group>
  );
}