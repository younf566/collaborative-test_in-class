import { useState } from "react";
import { socket } from "../socket";
import Slider from "./Slider.jsx";

export default function ProtocolBuilder({ 
  userProtocols, 
  partnerProtocols, 
  onUpdateProtocols,
  negotiationState,
  setNegotiationState 
}) {
  const [activeSection, setActiveSection] = useState("energy");
  
  const sections = {
    energy: { icon: "⚡", label: "Energy & Focus" },
    communication: { icon: "💬", label: "Communication" },
    boundaries: { icon: "🛡️", label: "Boundaries" },
    timeline: { icon: "🔮", label: "Future Scenarios" }
  };

  const updateField = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onUpdateProtocols({
        ...userProtocols,
        [parent]: {
          ...userProtocols[parent],
          [child]: value
        }
      });
    } else {
      onUpdateProtocols({
        ...userProtocols,
        [field]: value
      });
    }
  };

  const getCompatibilityScore = () => {
    if (!partnerProtocols) return null;
    
    const factors = [
      Math.abs(userProtocols.energyLevel - partnerProtocols.energyLevel) / 10,
      userProtocols.communicationMode === partnerProtocols.communicationMode ? 0 : 0.3,
      userProtocols.interruptibility === partnerProtocols.interruptibility ? 0 : 0.2,
      Math.abs(userProtocols.socialBattery - partnerProtocols.socialBattery) / 10
    ];
    
    return Math.max(0, 1 - factors.reduce((a, b) => a + b, 0));
  };

  const compatibility = getCompatibilityScore();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "40px" }}>
      
      {/* Navigation */}
      <nav style={{
        background: "#ffffff",
        padding: "24px",
        height: "fit-content",
        border: "1px solid #000000"
      }}>
        <h3 style={{ marginBottom: "24px", fontSize: "12px", color: "#666666", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "200" }}>Sections</h3>
        {Object.entries(sections).map(([key, section]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            style={{
              display: "block",
              width: "100%",
              padding: "12px 0",
              background: "transparent",
              border: "none",
              borderBottom: activeSection === key 
                ? "2px solid #000000"
                : "2px solid transparent",
              color: activeSection === key ? "#000000" : "#666666",
              textAlign: "left",
              cursor: "pointer",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: activeSection === key ? "300" : "200",
              transition: "all 0.15s ease"
            }}
          >
            {section.label}
          </button>
        ))}
        
        {/* Compatibility Score */}
        {compatibility !== null && (
          <div style={{
            marginTop: "40px",
            padding: "20px",
            background: "#ffffff",
            border: "1px solid #000000"
          }}>
            <div style={{ fontSize: "12px", color: "#666666", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "200" }}>
              Compatibility
            </div>
            <div style={{ 
              fontSize: "24px", 
              fontWeight: "100",
              color: "#000000"
            }}>
              {Math.round(compatibility * 100)}%
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main style={{
        background: "#ffffff",
        padding: "40px",
        border: "1px solid #000000"
      }}>
        
        {/* Two-column layout for user and partner */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: partnerProtocols ? "1fr 1px 1fr" : "1fr",
          gap: partnerProtocols ? "40px" : "0"
        }}>
          
          {/* User Column */}
          <div>
            <h3 style={{ 
              marginBottom: "32px", 
              color: "#000000",
              fontSize: "18px",
              fontWeight: "200"
            }}>
              Your Protocols
            </h3>
            
            {activeSection === "energy" && (
              <EnergySection protocols={userProtocols} onUpdate={updateField} />
            )}
            
            {activeSection === "communication" && (
              <CommunicationSection protocols={userProtocols} onUpdate={updateField} />
            )}
            
            {activeSection === "boundaries" && (
              <BoundariesSection protocols={userProtocols} onUpdate={updateField} />
            )}
            
            {activeSection === "timeline" && (
              <TimelineSection protocols={userProtocols} />
            )}
          </div>

          {/* Divider */}
          {partnerProtocols && (
            <div style={{ background: "#000000", width: "1px" }} />
          )}

          {/* Partner Column */}
          {partnerProtocols && (
            <div>
              <h3 style={{ 
                marginBottom: "32px", 
                color: "#666666",
                fontSize: "18px",
                fontWeight: "200"
              }}>
                Partner's Protocols
              </h3>
              
              {activeSection === "energy" && (
                <EnergySection protocols={partnerProtocols} onUpdate={() => {}} readOnly />
              )}
              
              {activeSection === "communication" && (
                <CommunicationSection protocols={partnerProtocols} onUpdate={() => {}} readOnly />
              )}
              
              {activeSection === "boundaries" && (
                <BoundariesSection protocols={partnerProtocols} onUpdate={() => {}} readOnly />
              )}
              
              {activeSection === "timeline" && (
                <TimelineSection protocols={partnerProtocols} />
              )}
            </div>
          )}
        </div>

        {!partnerProtocols && (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "#888888"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "24px", fontWeight: "300" }}>○</div>
            <p style={{ fontSize: "16px", marginBottom: "8px" }}>Waiting for collaborator</p>
            <p style={{ fontSize: "14px" }}>
              Share this URL to start designing protocols together
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Energy & Focus Section
function EnergySection({ protocols, onUpdate, readOnly }) {
  return (
    <div style={{ space: "20px" }}>
      
      <ProtocolField
        label="Energy Level"
        value={protocols.energyLevel}
        onChange={(v) => onUpdate('energyLevel', v)}
        type="slider"
        min={1}
        max={10}
        readOnly={readOnly}
        description="Current energy available for interactions"
      />
      
      <ProtocolField
        label="Social Battery"
        value={protocols.socialBattery}
        onChange={(v) => onUpdate('socialBattery', v)}
        type="slider"
        min={1}
        max={10}
        readOnly={readOnly}
        description="Capacity for social engagement"
      />
      
      <ProtocolField
        label="Focus State"
        value={protocols.focusState}
        onChange={(v) => onUpdate('focusState', v)}
        type="select"
        options={[
          { value: "deep-work", label: "Deep Work" },
          { value: "collaborative", label: "Collaborative" },
          { value: "creative", label: "Creative Flow" },
          { value: "maintenance", label: "Maintenance Tasks" },
          { value: "rest", label: "Rest Mode" }
        ]}
        readOnly={readOnly}
        description="Current cognitive mode and availability"
      />
      
    </div>
  );
}

// Communication Section
function CommunicationSection({ protocols, onUpdate, readOnly }) {
  return (
    <div>
      
      <ProtocolField
        label="Communication Mode"
        value={protocols.communicationMode}
        onChange={(v) => onUpdate('communicationMode', v)}
        type="select"
        options={[
          { value: "async", label: "Asynchronous" },
          { value: "sync", label: "Synchronous" },
          { value: "scheduled", label: "Scheduled Only" },
          { value: "minimal", label: "Minimal Contact" }
        ]}
        readOnly={readOnly}
        description="Preferred communication timing"
      />
      
      <ProtocolField
        label="Interruptibility"
        value={protocols.interruptibility}
        onChange={(v) => onUpdate('interruptibility', v)}
        type="select"
        options={[
          { value: "open", label: "Open (Anytime)" },
          { value: "scheduled", label: "Scheduled Breaks" },
          { value: "urgent-only", label: "Urgent Only" },
          { value: "unavailable", label: "Unavailable" }
        ]}
        readOnly={readOnly}
        description="When interruptions are acceptable"
      />
      
    </div>
  );
}

// Boundaries Section  
function BoundariesSection({ protocols, onUpdate, readOnly }) {
  const boundaries = protocols.boundaries || {};
  
  return (
    <div>
      <div style={{ marginBottom: "24px", color: "#888888", fontSize: "14px" }}>
        Configure your current boundary preferences
      </div>
      
      {Object.entries({
        notifications: "Push Notifications",
        meetings: "Spontaneous Meetings", 
        smallTalk: "Small Talk & Check-ins",
        feedback: "Feedback & Suggestions"
      }).map(([key, label]) => (
        <ProtocolField
          key={key}
          label={label}
          value={boundaries[key]}
          onChange={(v) => onUpdate(`boundaries.${key}`, v)}
          type="boolean"
          readOnly={readOnly}
        />
      ))}
      
    </div>
  );
}

// Timeline/Future Scenarios Section
function TimelineSection({ protocols }) {
  const scenarios = [
    {
      timeframe: "This Week",
      description: "These protocols help us navigate our current collaboration without friction",
      impact: "Immediate comfort and clarity"
    },
    {
      timeframe: "Next Month", 
      description: "As we iterate on these preferences, we develop a shared language for boundaries",
      impact: "Reduced emotional labor and miscommunication"
    },
    {
      timeframe: "Next Year",
      description: "Our refined protocols become templates others can adapt for their relationships",
      impact: "Normalized boundary-setting in professional contexts"
    },
    {
      timeframe: "Future World",
      description: "Interpersonal protocols become as standard as accessibility features - embedded in our tools and recognized as essential infrastructure",
      impact: "Boundaries become supportive technology rather than social burden"
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: "40px" }}>
        <h4 style={{ color: "#000000", marginBottom: "12px", fontSize: "16px", fontWeight: "200" }}>Futures Cone: Protocol Evolution</h4>
        <p style={{ color: "#666666", fontSize: "14px", lineHeight: 1.5, fontWeight: "200" }}>
          How today's boundary negotiations could evolve into tomorrow's social infrastructure
        </p>
      </div>
      
      {scenarios.map((scenario, index) => (
        <div key={index} style={{
          padding: "24px",
          background: "#ffffff",
          border: "1px solid #000000",
          marginBottom: "16px",
          position: "relative",
          borderLeft: "3px solid #000000"
        }}>
          
          <h5 style={{ 
            color: "#000000", 
            margin: "0 0 12px 0",
            fontSize: "14px",
            fontWeight: "300"
          }}>
            {scenario.timeframe}
          </h5>
          <p style={{ 
            margin: "0 0 12px 0", 
            lineHeight: 1.5,
            fontSize: "14px",
            color: "#000000",
            fontWeight: "200"
          }}>
            {scenario.description}
          </p>
          <div style={{ 
            color: "#666666", 
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontWeight: "200"
          }}>
            Impact: {scenario.impact}
          </div>
        </div>
      ))}
    </div>
  );
}

// Reusable Protocol Field Component
function ProtocolField({ label, value, onChange, type, options, min, max, readOnly, description }) {
  const fieldStyle = {
    marginBottom: "32px"
  };
  
  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "300",
    color: "#000000"
  };
  
  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: readOnly ? "#f5f5f5" : "#ffffff",
    border: `1px solid ${readOnly ? "#cccccc" : "#000000"}`,
    color: "#000000",
    fontSize: "14px",
    fontWeight: "200"
  };

  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      {description && (
        <div style={{ fontSize: "12px", color: "#666666", marginBottom: "8px", fontWeight: "200" }}>
          {description}
        </div>
      )}
      
      {type === "slider" && (
        <div>
          <Slider
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={readOnly}
            style={{ width: "100%", margin: "8px 0" }}
          />
          <div style={{ textAlign: "right", marginTop: "8px", fontSize: "12px", color: "#666666", fontWeight: "200" }}>
            {value}/{max}
          </div>
        </div>
      )}
      
      {type === "select" && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          style={inputStyle}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      
      {type === "boolean" && (
        <label style={{ display: "flex", alignItems: "center", cursor: readOnly ? "default" : "pointer" }}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={readOnly}
            style={{ marginRight: "10px", transform: "scale(1.2)" }}
          />
          <span style={{ opacity: value ? 1 : 0.6 }}>
            {value ? "Enabled" : "Disabled"}
          </span>
        </label>
      )}
    </div>
  );
}