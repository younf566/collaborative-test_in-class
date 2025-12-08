# Protocol Labs - Collaborative Boundary Design

A speculative design system exploring how interpersonal etiquette could become machine-readable, reducing social friction through explicit boundary protocols.

## Concept

Through futures frameworks and behavioral research, this project examines how invisible social norms create friction across culture, neurotype, and relationship contexts. Drawing from Goffman's *Presentation of Self*, Brown & Levinson's *Politeness Theory*, and Tsing's work on *Friction*, I reframe boundaries as an infrastructural UX challenge rather than a soft social issue.

The system operates in two connected layers:
1. **Protocol Builder** - Collaborative web app for designing personal interaction protocols
2. **3D Neighborhood** - Spatial simulation where protocols become visually legible in everyday scenarios

## Theoretical Framework

**Goffman** → People constantly manage social impressions through micro-boundaries → protocols externalize this emotional labor  
**Brown & Levinson** → Politeness rules are implicit and culturally variable → protocols make them explicit and negotiable  
**Tsing** → Mismatched norms create friction in social systems → protocols act as translators between different interaction styles

## Architecture

### Backend (Node.js + Socket.io)
- **File**: `server.js`
- **Dependencies**: Express, Socket.io, OpenAI API
- **Features**: Real-time collaboration, protocol storage, AI-generated compatibility strategies

### Frontend (React + Vite + Three.js)
- **Protocol Builder**: Collaborative interface for designing personal boundaries
- **3D Neighborhood**: Spatial visualization where protocols affect environmental interactions
- **Dependencies**: React, Three.js/React-Three-Fiber, Socket.io-client

## Live URLs
- **Frontend**: https://younf566.github.io/collaborative-test_in-class
- **Backend**: https://collaborative-test-in-class-np6q.onrender.com

## Current Features
- Real-time collaborative protocol editing
- Energy & communication preference management
- Sensory threshold configuration  
- Relationship tier permissions
- Compatibility scoring with AI-generated strategies
- Modern minimalist UI inspired by Apple's design principles

## Planned Features (3D Neighborhood)
- Geometric avatar system encoding personal protocols
- Environment objects that adapt to collective protocol states
- Visual negotiation interfaces for approach distance and communication pace
- Stoplight/crosswalk systems that respond to social overstimulation
- Ambient environmental feedback reflecting group emotional states