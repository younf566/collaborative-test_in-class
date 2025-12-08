import { useState, useEffect } from "react";
import ProtocolBuilder from "./components/ProtocolBuilder.jsx";
import NeighborhoodLab from "./components/NeighborhoodLab.jsx";
import ThreeJSErrorBoundary from "./components/ThreeJSErrorBoundary.jsx";
import { socket } from "./socket";

export default function App() {
  const [userProtocols, setUserProtocols] = useState({
    energyLevel: 7,
    communicationMode: "async",
    interruptibility: "scheduled",
    socialBattery: 8,
    focusState: "deep-work",
    boundaries: {
      notifications: false,
      meetings: false,
      smallTalk: true,
      feedback: true
    }
  });
  
  const [partnerProtocols, setPartnerProtocols] = useState(null);
  const [negotiationState, setNegotiationState] = useState("designing"); // designing, negotiating, agreed
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Generate or get session ID
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session') || Math.random().toString(36).substr(2, 9);
    const isLab = urlParams.get('lab') === 'true';
    setSessionId(id);
    
    // If in lab mode, skip URL update to preserve lab parameter
    if (!isLab) {
      // Update URL without refresh
      window.history.replaceState({}, '', `?session=${id}`);
    }
    
    // Join session
    socket.emit('join-session', id);
    
    // Listen for partner updates
    socket.on('partner-protocols', (protocols) => {
      setPartnerProtocols(protocols);
    });
    
    socket.on('partner-joined', (data) => {
      // Partner joined - they will send their protocols automatically
    });
    
    socket.on('partner-left', () => {
      setPartnerProtocols(null);
    });
    
    return () => {
      socket.off('partner-protocols');
      socket.off('partner-joined');
      socket.off('partner-left');
    };
  }, []);

  // Send initial protocols when sessionId is established
  useEffect(() => {
    if (sessionId) {
      socket.emit('update-protocols', { 
        sessionId, 
        protocols: userProtocols 
      });
    }
  }, [sessionId]);

  const updateProtocols = (newProtocols) => {
    setUserProtocols(newProtocols);
    socket.emit('update-protocols', { 
      sessionId, 
      protocols: newProtocols 
    });
  };

  // Check if we should render the 3D lab
  const urlParams = new URLSearchParams(window.location.search);
  const isLab = urlParams.get('lab') === 'true';
  
  if (isLab) {
    return (
      <ThreeJSErrorBoundary>
        <NeighborhoodLab 
          userProtocols={userProtocols}
          partnerProtocols={partnerProtocols}
          sessionId={sessionId}
        />
      </ThreeJSErrorBoundary>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "#ffffff",
      color: "#000000"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* Header */}
        <header style={{ textAlign: "left", marginBottom: "60px" }}>
          <h1 style={{ 
            fontSize: "3rem", 
            fontWeight: "100",
            color: "#000000",
            marginBottom: "16px",
            letterSpacing: "-0.02em"
          }}>
            PROTOCOL LABS
          </h1>
        
          
          {sessionId && (
            <div style={{
              marginTop: "24px",
              padding: "16px 24px",
              background: "#ffffff",
              border: "1px solid #000000",
              display: "inline-block",
              fontSize: "14px",
              fontWeight: "200"
            }}>
              <span style={{ color: "#666666" }}>Session ID: </span>
              <strong style={{ color: "#000000", fontFamily: "monospace" }}>{sessionId}</strong>
              {partnerProtocols && (
                <span style={{ marginLeft: "24px", color: "#000000" }}>
                  ● Partner Connected
                </span>
              )}
            </div>
          )}
          
          <div style={{ marginTop: "32px" }}>
            <button
              onClick={() => window.location.href = '?lab=true&session=' + sessionId}
              style={{
                background: "#000000",
                color: "#ffffff", 
                border: "none",
                padding: "16px 32px",
                fontSize: "14px",
                fontWeight: "200",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                marginRight: "16px"
              }}
            >
              Enter 3D Neighborhood →
            </button>
            
            <span style={{ 
              fontSize: "12px", 
              color: "#666666", 
              fontWeight: "200" 
            }}>
              Visualize protocols in spatial context
            </span>
          </div>
        </header>

        <ProtocolBuilder 
          userProtocols={userProtocols}
          partnerProtocols={partnerProtocols}
          onUpdateProtocols={updateProtocols}
          negotiationState={negotiationState}
          setNegotiationState={setNegotiationState}
        />
        
      </div>
    </div>
  );
}
