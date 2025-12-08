import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import ProtocolStoplight from './ProtocolStoplight';
import ProtocolBench from './ProtocolBench';
import DynamicBuilding from './DynamicBuilding';
import ProtocolWeather from './ProtocolWeather';
import * as THREE from 'three';

export default function Neighborhood({ userProtocols, partnerProtocols }) {
  
  // Calculate overall friction level from protocols
  const frictionLevel = useMemo(() => {
    if (!userProtocols || !partnerProtocols) return 0;
    
    const factors = [
      Math.abs(userProtocols.energyLevel - partnerProtocols.energyLevel) / 10,
      userProtocols.communicationMode === partnerProtocols.communicationMode ? 0 : 0.4,
      userProtocols.interruptibility === partnerProtocols.interruptibility ? 0 : 0.3,
      Math.abs(userProtocols.socialBattery - partnerProtocols.socialBattery) / 10
    ];
    
    return Math.min(1, factors.reduce((a, b) => a + b, 0));
  }, [userProtocols, partnerProtocols]);
  
  // Single user energy affects environment differently  
  const userEnergy = userProtocols ? userProtocols.energyLevel / 10 : 0.5;
  
  return (
    <group>
      
      {/* Protocol Weather System - sky changes based on social friction */}
      <ProtocolWeather frictionLevel={frictionLevel} userEnergy={userEnergy} />
      
      {/* Dynamic Low-Poly Ground - morphs based on protocols */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[30, 30, 15, 15]} />
        <meshStandardMaterial 
          color={frictionLevel > 0.5 ? '#d4b8a3' : '#e8f0e8'} // Warmer when friction
          wireframe={false}
        />
      </mesh>
      
      {/* Dynamic Buildings - change based on protocol states */}
      <DynamicBuilding 
        position={[6, 0, 6]}
        protocols={userProtocols}
        frictionLevel={frictionLevel}
        buildingType="social"
      />
      
      <DynamicBuilding 
        position={[-6, 0, 6]}
        protocols={userProtocols}
        frictionLevel={frictionLevel}
        buildingType="work"
      />
      
      <DynamicBuilding 
        position={[6, 0, -6]}
        protocols={partnerProtocols || userProtocols}
        frictionLevel={frictionLevel}
        buildingType="quiet"
      />
      
      <DynamicBuilding 
        position={[-6, 0, -6]}
        protocols={partnerProtocols || userProtocols}
        frictionLevel={frictionLevel}
        buildingType="hybrid"
      />
      
      {/* Friction-Responsive Street Network */}
      <group>
        {/* Main streets that get more jagged with friction */}
        {Array.from({length: 3}).map((_, i) => {
          const offset = (i - 1) * 8;
          return (
            <mesh key={`street-h-${i}`} position={[0, 0.01, offset]}>
              <boxGeometry args={[20, 0.02, 1 + frictionLevel]} />
              <meshStandardMaterial 
                color={frictionLevel > 0.6 ? '#cc6666' : '#888888'}
              />
            </mesh>
          );
        })}
        
        {Array.from({length: 3}).map((_, i) => {
          const offset = (i - 1) * 8;
          return (
            <mesh key={`street-v-${i}`} position={[offset, 0.01, 0]} rotation={[0, Math.PI/2, 0]}>
              <boxGeometry args={[20, 0.02, 1 + frictionLevel]} />
              <meshStandardMaterial 
                color={frictionLevel > 0.6 ? '#cc6666' : '#888888'}
              />
            </mesh>
          );
        })}
      </group>
      
      {/* Protocol-Aware Interactive Objects */}
      <ProtocolBench 
        position={[3, 0, 2]} 
        rotation={[0, Math.PI/4, 0]} 
        benchId="social-bench-1"
        frictionLevel={frictionLevel}
      />
      
      <ProtocolBench 
        position={[-2, 0, 4]} 
        rotation={[0, -Math.PI/3, 0]}
        benchId="quiet-bench-1" 
        frictionLevel={frictionLevel}
      />
      
      <ProtocolStoplight 
        position={[4, 0, 0]} 
        frictionLevel={frictionLevel}
      />
      
      <ProtocolStoplight 
        position={[-4, 0, 0]} 
        frictionLevel={frictionLevel}
      />
      
      {/* Dynamic Protocol Zones that shift with energy */}
      <group>
        {/* Energy-responsive social zones */}
        <mesh position={[2, 0.01, 3]} rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[1.5 + userEnergy, 8]} />
          <meshStandardMaterial 
            color={userEnergy > 0.7 ? '#ffee88' : '#88eeaa'}
            transparent 
            opacity={0.3 + userEnergy * 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        <mesh position={[-2, 0.01, -3]} rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[1.2 + (1 - userEnergy), 6]} />
          <meshStandardMaterial 
            color={userEnergy < 0.3 ? '#aaccff' : '#ccaaff'}
            transparent 
            opacity={0.4 - userEnergy * 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      
      {/* Friction Visualization - barriers appear when protocols clash */}
      {frictionLevel > 0.4 && (
        <group>
          {Array.from({length: Math.floor(frictionLevel * 6)}).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 3 + frictionLevel * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return (
              <mesh key={`friction-${i}`} position={[x, 0.5, z]}>
                <boxGeometry args={[0.2, frictionLevel * 2, 0.2]} />
                <meshStandardMaterial 
                  color="#ff4444"
                  transparent
                  opacity={frictionLevel}
                />
              </mesh>
            );
          })}
        </group>
      )}
      
    </group>
  );
}