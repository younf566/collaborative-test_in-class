import { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen.jsx";
import NeighborhoodLab from "./components/NeighborhoodLab.jsx";
import { socket } from "./socket";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
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
  // Always show the 3D view with side panel

  useEffect(() => {
    // Generate or get session ID
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session') || Math.random().toString(36).substr(2, 9);
    setSessionId(id);
    
    // Update URL without refresh
    window.history.replaceState({}, '', `?session=${id}`);
    
    // Join session
    socket.emit('join-session', id);
    // Send current protocols so partner sees your house immediately
    socket.emit('update-protocols', {
      sessionId: id,
      protocols: userProtocols
    });
    
    // Listen for partner updates
    socket.on('partner-protocols', (protocols) => {
      setPartnerProtocols(protocols);
    });
    
    socket.on('partner-joined', () => {
      console.log('Partner joined the session');
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

  const updateProtocols = (newProtocols) => {
    setUserProtocols(newProtocols);
    socket.emit('update-protocols', { 
      sessionId, 
      protocols: newProtocols 
    });
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      )}
      
      {!isLoading && (
        <NeighborhoodLab 
          userProtocols={userProtocols}
          partnerProtocols={partnerProtocols}
          onUpdateProtocols={updateProtocols}
        />
      )}
    </>
  );
}
