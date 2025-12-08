import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import ProtocolAvatar from './ProtocolAvatar';
import Neighborhood from './Neighborhood';
import ProtocolNegotiation from './ProtocolNegotiation';

export default function NeighborhoodLab({ 
  userProtocols, 
  partnerProtocols, 
  sessionId 
}) {
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#f8f9fa',
      position: 'relative' 
    }}>
      
      {/* UI Overlay */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 100,
        background: 'rgba(255,255,255,0.9)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #000',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        fontWeight: '200'
      }}>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
          Protocol Neighborhood
        </div>
        <div>Session: {sessionId}</div>
        <div>Partner: {partnerProtocols ? "Connected" : "Solo"}</div>
      </div>

      {/* Exit Button */}
      <button
        onClick={() => window.history.back()}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100,
          background: '#000',
          color: '#fff',
          border: 'none',
          padding: '12px 20px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: '200',
          cursor: 'pointer'
        }}
      >
        ← Back to Protocols
      </button>

      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: [8, 8, 8], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
        style={{ background: '#f0f4f8' }}
      >
        <Suspense fallback={null}>
          
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Environment */}
          <Environment preset="city" />
          
          {/* Camera Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={8}
            maxDistance={40}
          />
          
          {/* Neighborhood Environment */}
          <Neighborhood />
          
          {/* User Avatar - positioned at a key location in your neighborhood */}
          <ProtocolAvatar
            position={[2, 0, 1]}
            protocols={userProtocols}
            isUser={true}
          />
          
          {/* Partner Avatar (if connected) - positioned nearby but with space for interaction */}
          {partnerProtocols && (
            <ProtocolAvatar
              position={[-1, 0, 3]}
              protocols={partnerProtocols}
              isUser={false}
            />
          )}
          
          {/* Protocol Negotiation Visualization - connects the two avatars */}
          {partnerProtocols && (
            <ProtocolNegotiation
              userProtocols={userProtocols}
              partnerProtocols={partnerProtocols}
              userPosition={[2, 0, 1]}
              partnerPosition={[-1, 0, 3]}
            />
          )}
          
          {/* Development Stats */}
          <Stats />
          
        </Suspense>
      </Canvas>
    </div>
  );
}