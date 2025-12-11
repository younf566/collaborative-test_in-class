import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import Neighborhood from './Neighborhood';
import ProtocolBuilder from './ProtocolBuilder.jsx';
import { socket } from '../socket';

export default function NeighborhoodLab({ userProtocols, partnerProtocols, onUpdateProtocols }) {
  const [panelVisible, setPanelVisible] = useState(true);
  const [panelMounted, setPanelMounted] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handlePartnerProtocols = (protocols) => {
      setConnected(true);
    };
    const handlePartnerLeft = () => setConnected(false);
    socket.on('partner-protocols', handlePartnerProtocols);
    socket.on('partner-left', handlePartnerLeft);
    return () => {
      socket.off('partner-protocols', handlePartnerProtocols);
      socket.off('partner-left', handlePartnerLeft);
    };
  }, []);

  const bg = `#f6f7fb`;

  useEffect(()=>{ setPanelMounted(true); },[]);
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: bg,
      transition: 'background 200ms ease',
      position: 'relative'
    }}>
      <button
        onClick={() => setPanelVisible(v => !v)}
        style={{
          position: 'absolute',
          left: panelVisible ? '750px' : '24px',
          top: '24px',
          zIndex: 11,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.7)',
          color: '#000',
          border: '1px solid #000',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        {panelVisible ? 'Hide Protocols' : 'Show Protocols'}
      </button>

      {panelVisible && (
        <div style={{
          position: 'absolute',
          left: panelMounted ? '24px' : '-40px',
          top: '24px',
          width: '720px',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(3px)',
          border: '1px solid #000',
          borderRadius: '12px',
          boxShadow: 'none',
          zIndex: 10
        , transition: 'all 400ms ease', opacity: panelMounted ? 1 : 0 }}>
          <div style={{ padding: '16px' }}>
            <ProtocolBuilder
              userProtocols={userProtocols}
              partnerProtocols={connected ? partnerProtocols : null}
              onUpdateProtocols={onUpdateProtocols}
              negotiationState={'designing'}
              setNegotiationState={()=>{}}
            />
          </div>
        </div>
      )}
      <Canvas
        camera={{ 
          position: [0, 2, 14], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        shadows
      >
        <OrbitControls 
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          minPolarAngle={Math.PI * 0.35}
          maxPolarAngle={Math.PI * 0.65}
          target={[0, 0, 0]}
        />
        <Suspense fallback={null}>
          <Neighborhood 
            userProtocols={userProtocols}
            partnerProtocols={connected ? partnerProtocols : null}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}