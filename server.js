import express from "express";
import http from "http";
import { Server } from "socket.io";

// Use the port Render provides, or default to 3000 for local dev
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Enable CORS so your GH Pages or React app can connect
const io = new Server(server, {
  cors: {
    origin: "*",             // you can restrict this later
    methods: ["GET", "POST"]
  }
});

app.use(express.static("docs"));

// Store active protocol sessions
const protocolSessions = new Map();

io.on("connection", (socket) => {
  console.log("🟢 New user connected to Protocol Labs:", socket.id);
  
  // Handle joining a protocol session
  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);
    socket.sessionId = sessionId;
    
    // Initialize session if it doesn't exist
    if (!protocolSessions.has(sessionId)) {
      protocolSessions.set(sessionId, {
        users: new Set(),
        protocols: new Map()
      });
    }
    
    const session = protocolSessions.get(sessionId);
    session.users.add(socket.id);
    
    console.log(`User ${socket.id} joined protocol session: ${sessionId}`);
    console.log(`Session ${sessionId} now has ${session.users.size} users`);
    
    // Notify others in the session
    socket.to(sessionId).emit("partner-joined", {
      userId: socket.id,
      userCount: session.users.size
    });
    
    // Send existing partner protocols if any
    for (const [userId, protocols] of session.protocols) {
      if (userId !== socket.id) {
        socket.emit("partner-protocols", protocols);
        break; // Only send one partner's protocols (2-user limit)
      }
    }
  });
  
  // Handle protocol updates
  socket.on("update-protocols", (data) => {
    const { sessionId, protocols } = data;
    
    if (protocolSessions.has(sessionId)) {
      const session = protocolSessions.get(sessionId);
      session.protocols.set(socket.id, protocols);
      
      // Broadcast to partner in the session (not to self)
      socket.to(sessionId).emit("partner-protocols", protocols);
      
      console.log(`Updated protocols for user ${socket.id} in session ${sessionId}`);
    }
  });
  
  // Handle negotiation states
  socket.on("update-negotiation", (data) => {
    const { sessionId, state, proposal } = data;
    socket.to(sessionId).emit("negotiation-update", {
      state,
      proposal,
      fromUser: socket.id
    });
  });
  
  // Handle protocol proposals
  socket.on("propose-protocol", (data) => {
    const { sessionId, field, value, rationale } = data;
    socket.to(sessionId).emit("protocol-proposal", {
      field,
      value,
      rationale,
      fromUser: socket.id
    });
  });
  
  // Handle protocol acceptance/rejection
  socket.on("respond-to-proposal", (data) => {
    const { sessionId, accepted, response } = data;
    socket.to(sessionId).emit("proposal-response", {
      accepted,
      response,
      fromUser: socket.id
    });
  });

  // Legacy drawing support (keeping for backward compatibility)
  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data);
  });

  socket.on("clear", () => {
    socket.broadcast.emit("clear");
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    
    // Clean up protocol session
    if (socket.sessionId && protocolSessions.has(socket.sessionId)) {
      const session = protocolSessions.get(socket.sessionId);
      session.users.delete(socket.id);
      session.protocols.delete(socket.id);
      
      // Notify remaining users
      socket.to(socket.sessionId).emit("partner-left", {
        userId: socket.id,
        userCount: session.users.size
      });
      
      // Clean up empty sessions
      if (session.users.size === 0) {
        protocolSessions.delete(socket.sessionId);
        console.log(`Cleaned up empty session: ${socket.sessionId}`);
      }
    }
  });
});

server.listen(PORT, "0.0.0.0", () => console.log(`Protocol Labs server running on port ${PORT}`));

