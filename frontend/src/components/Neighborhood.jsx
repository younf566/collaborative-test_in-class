import { useRef, useMemo, useState, useEffect, Suspense, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
// cozy neighbors, minimal fuss

function NeighborhoodComponent({ userProtocols, partnerProtocols }) {
  const sceneGroupRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  // local protocol state
  const [userProto, setUserProto] = useState({});
  const [partnerProto, setPartnerProto] = useState({});

  // sync incoming props
  useEffect(() => {
    if (userProtocols) {
      setUserProto({
        emotional: userProtocols.emotional ?? 0.6,
        material: userProtocols.material ?? 0.4,
        energyLevel: userProtocols.energyLevel ?? userProtocols.energy ?? 0.5,
        socialBattery: userProtocols.socialBattery ?? 0.5,
        mental: userProtocols.mental ?? 0.5,
        physical: userProtocols.physical ?? 0.5,
        boundaryStrictness: userProtocols.boundaries?.notifications !== undefined ? (userProtocols.boundaryStrictness ?? 0.4) : (userProtocols.boundaryStrictness ?? 0.4),
        focusState: userProtocols.focusState ?? userProtocols.focus ?? 'maintenance'
      });
    }
  }, [userProtocols]);

  useEffect(() => {
    if (partnerProtocols) {
      setPartnerProto({
        emotional: partnerProtocols.emotional ?? 0.4,
        material: partnerProtocols.material ?? 0.6,
        energyLevel: partnerProtocols.energyLevel ?? partnerProtocols.energy ?? 0.5,
        socialBattery: partnerProtocols.socialBattery ?? 0.5,
        mental: partnerProtocols.mental ?? 0.6,
        physical: partnerProtocols.physical ?? 0.5,
        boundaryStrictness: partnerProtocols.boundaryStrictness ?? 0.6,
        focusState: partnerProtocols.focusState ?? partnerProtocols.focus ?? 'maintenance'
      });
    } else {
      setPartnerProto(null);
    }
  }, [partnerProtocols]);

  // group entrance
  useFrame((state) => {
    if (!sceneGroupRef.current) return;
    const targetScale = modelLoaded ? 1 : 0.92;
    const s = sceneGroupRef.current.scale;
    const lerp = THREE.MathUtils.lerp;
    s.x = lerp(s.x || 0.92, targetScale, 0.08);
    s.y = lerp(s.y || 0.92, targetScale, 0.08);
    s.z = lerp(s.z || 0.92, targetScale, 0.08);
  });
  // retired bits
  
  // tiny helper from a previous idea
  const createBoundaryFurniture = (protocols) => {
    if (!protocols) return new THREE.SphereGeometry(2, 64, 64);
    
    // Determine boundary state from protocols
    const energy = protocols.energyLevel || 5;
    const social = protocols.socialBattery || 5;
    const focus = protocols.focusState === 'deep-work' ? 10 : 5;
    
    // Calculate morphing factors (0-1 range for each boundary type)
    const openness = energy / 10; // How open/accessible
    const comfort = social / 10; // How comfortable/inviting
    const protection = focus / 10; // How protected/enclosed
    
    const geometry = new THREE.BoxGeometry(3, 3, 3, 32, 32, 32);
    const positions = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i);
      
      const x = vertex.x;
      const y = vertex.y;
      const z = vertex.z;
      
      // MORPHING STATES based on boundaries:
      
      // 1. EMOTIONAL BOUNDARY (base/seat comfort)
      // Low energy = compress into tight chair
      // High energy = expand into open lounge
      const seatMorph = THREE.MathUtils.lerp(
        Math.max(0, 1.5 - Math.abs(y + 0.8)), // tight chair seat
        Math.max(0, 1.8 - Math.abs(y)), // wide lounge cushion
        openness
      );
      
      // 2. MATERIAL BOUNDARY (sides/arms)
      // Low social = high walls/cocoon
      // High social = open sides/bench
      const armMorph = THREE.MathUtils.lerp(
        Math.max(0, 2.5 - Math.sqrt(x*x + z*z)), // enclosed cocoon
        Math.max(0, 0.3 - Math.abs(x)), // open bench with minimal arms
        comfort
      );
      
      // 3. ENERGY BOUNDARY (back support)
      // Low focus = reclined/relaxed
      // High focus = upright/alert
      const backMorph = THREE.MathUtils.lerp(
        z > 0 ? Math.max(0, 2.0 - Math.abs(z - 1.2)) : 0, // reclined back
        z > 0 ? Math.max(0, 2.5 - Math.abs(z - 0.8)) : 0, // upright back
        protection
      );
      
      // 4. MENTAL BOUNDARY (overall density)
      // Creates soft organic bulges for comfort
      const mentalTexture = Math.sin(x * 3) * Math.cos(z * 2) * 0.15 * comfort;
      
      // 5. PHYSICAL BOUNDARY (outer shell)
      // Protective barrier when overwhelmed
      const shellThickness = protection > 0.7 ? 0.3 : 0;
      
      // Combine all morphing factors
      let morphFactor = seatMorph + armMorph + backMorph + mentalTexture + shellThickness;
      
      // Apply smooth organic deformation
      const warp = Math.sin(x * 2 + y * 1.5) * Math.cos(z * 2.5) * 0.08;
      
      vertex.normalize().multiplyScalar(Math.max(0.5, morphFactor + warp + 1.0));
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  };
  
  // Remove legacy morphing animations
  
  return (
    <group ref={sceneGroupRef}>
      {/* Small world(s): render one if no partner, two if connected */}
      {partnerProtocols ? (
        <group>
          {/* Move houses further apart along X so sides sit next to each other */}
          <House position={[-6.0, 0, 0]} protocol={userProto} />
          <House position={[6.0, 0, 0]} protocol={partnerProto} />
        </group>
      ) : (
        <group>
          <House position={[0, 0, 0]} protocol={userProto} />
        </group>
      )}

      {/* Atmospheric lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 6]} intensity={isDaytime(userProto, partnerProto) ? 0.9 : 0.4} castShadow />
      <hemisphereLight skyColor={'#cfe7ff'} groundColor={'#f0f0f0'} intensity={0.4} />
    </group>
  );
}

const Neighborhood = memo(NeighborhoodComponent);
export default Neighborhood;

// House component with protocol-driven states: weather, lights, fence
 function House({ position=[0,0,0], protocol }) {
  const [modelLoaded, setModelLoaded] = useState(false);
  const initOnceRef = useRef(false);
  const entranceRef = useRef({ scale: 0.92, opacity: 0.0 });
  const houseRef = useRef();
  const lightRef = useRef();
  const windowLeftRef = useRef();
  const windowRightRef = useRef();
  const gltfWindowMaterialsRef = useRef([]);
  const gltfBodyMaterialsRef = useRef([]);
  const doorRef = useRef();
  const shutterRef = useRef();
  const mailPostMaterialRef = useRef();
  const metalRoofMaterialRef = useRef();
  const fenceGroupRef = useRef();
  const rainGroup = useRef();

  const isRainy = (protocol?.emotional ?? 0.4) < 0.45 || (protocol?.energyLevel ?? 0.5) < 0.5;
  const lightsOn = (protocol?.mental ?? 0.5) > 0.6 || (protocol?.focusState ? protocol.focusState !== 'rest' : (protocol?.focus ?? 0.5) > 0.6);
     // When GLB loads, collect window-like materials to drive emissive
    const onModelReady = (scene) => {
       const winMats = [];
       scene.traverse((obj) => {
         if (obj.isMesh && obj.material) {
           const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
           mats.forEach((m) => {
             const name = (m.name || '').toLowerCase();
             const meshName = (obj.name || '').toLowerCase();
             if (name.includes('window') || meshName.includes('window') || name.includes('glass') || meshName.includes('glass')) {
               m.emissive = new THREE.Color('#ffd9a3');
               m.emissiveIntensity = 0.0;
               winMats.push(m);
             } else {
               // collect non-glass body materials for theme tinting, EXCLUDING metal roof
               const isMetal = name.includes('metal') || meshName.includes('roof');
               if (!isMetal) {
                 gltfBodyMaterialsRef.current.push(m);
               }
             }
           });
         }
       });
       gltfWindowMaterialsRef.current = winMats;
      // Prepare entrance fade for GLB materials only once
      if (!initOnceRef.current) {
        scene.traverse((obj) => {
          if (obj.isMesh && obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => {
              m.transparent = true;
              if (typeof m.opacity !== 'number') m.opacity = 1.0;
              m.opacity = 0.0; // start hidden on first load
            });
          }
        });
        initOnceRef.current = true;
        entranceRef.current.scale = 0.92;
        entranceRef.current.opacity = 0.0;
      }

      // Target specific meshes/materials per your asset naming
      scene.traverse((obj) => {
        const originalName = obj.name || '';
        const meshName = originalName.toLowerCase();
        // Mail post named exactly 'Mail_post' with material 'Yellow'
        if (originalName === 'Mail_post') {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          const yellowMat = mats.find((m)=> (m?.name||'').toLowerCase() === 'yellow') || mats[0];
          if (yellowMat) {
            mailPostMaterialRef.current = yellowMat;
            yellowMat.color = new THREE.Color('#ffffff');
            yellowMat.emissive = new THREE.Color('#ffd166');
            yellowMat.emissiveIntensity = 0.2;
            yellowMat.transparent = true;
            if (typeof yellowMat.opacity !== 'number') yellowMat.opacity = 1.0;
          }
        }
        // Shutter is part of Wall 3, named 'Shutter' in 'Cube.003'
        if (meshName.includes('cube.003') || meshName.includes('shutter')) {
          shutterRef.current = obj;
        }
        // Metal roof plane: capture material named 'Metal' or mesh name containing 'roof'
        if (obj.isMesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          const metalMat = mats.find((m)=> (m?.name||'').toLowerCase().includes('metal'));
          if (metalMat || meshName.includes('roof')) {
            metalRoofMaterialRef.current = metalMat || mats[0];
            // initialize to neutral gray
            metalRoofMaterialRef.current.color = new THREE.Color('#b0b3b8');
          }
        }
      });
     };
  const physicalLevel = protocol?.physical ?? protocol?.physicalTouch ?? 0.5; // 0..1
  const fenceTargetHeight = THREE.MathUtils.clamp(physicalLevel, 0, 1); // map directly to height scale
  const commMode = (protocol?.communicationMode || '').toLowerCase();
  const boundaryStrict = (protocol?.boundaryStrictness ?? 0.5) >= 0.7;
  const showFence = modelLoaded && (commMode === 'async') && boundaryStrict;

  const rain = useMemo(() => {
    const count = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count*3);
    for (let i=0;i<count;i++){
      positions[i*3] = (Math.random()-0.5)*3.5;
      positions[i*3+1] = Math.random()*3 + 1.5;
      positions[i*3+2] = (Math.random()-0.5)*3.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    const mat = new THREE.PointsMaterial({ color:'#8fb3ff', size:0.02, transparent:true, opacity:0.8 });
    return new THREE.Points(geo, mat);
  }, []);

  useMemo(() => {
    if (rainGroup.current) rainGroup.current.add(rain);
  }, [rain]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (houseRef.current) {
      // Entrance scale/opacity tweens only once after load; keep orientation consistent
      const s = houseRef.current.scale;
      s.x = THREE.MathUtils.lerp(s.x || entranceRef.current.scale, 1.0, 0.08);
      s.y = THREE.MathUtils.lerp(s.y || entranceRef.current.scale, 1.0, 0.08);
      s.z = THREE.MathUtils.lerp(s.z || entranceRef.current.scale, 1.0, 0.08);
      // lock Y rotation so houses face the same direction
      houseRef.current.rotation.y = 0;
      houseRef.current.position.y = position[1] + Math.sin(t*0.2)*0.005;
    }
    if (rainGroup.current && isRainy) {
      const pos = rain.geometry.attributes.position;
      for (let i=0;i<pos.count;i++){
        let y = pos.getY(i) - 0.05 - Math.random()*0.02;
        if (y < 0) y = Math.random()*3 + 1.5;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, lightsOn ? 1.1 : 0.0, 0.08);
    }

    // Door: asset has no explicit door mesh; skip door animation

    // Shutter (garage door) raise based on social interaction openness
    const social = protocol?.socialBattery ?? 0.5; // supports 0..10 or 0..1 inputs
    const socialNorm = THREE.MathUtils.clamp((typeof social === 'number' ? social : 0) / 10, 0, 1) || THREE.MathUtils.clamp(social, 0, 1);
    if (shutterRef.current) {
      const targetY = socialNorm * 0.6; // raise up to 0.6 units
      shutterRef.current.position.y = THREE.MathUtils.lerp(shutterRef.current.position.y || 0, targetY, 0.08);
    }

    // Metal roof color shifts with social battery: higher = more vibrant color
    if (metalRoofMaterialRef.current) {
      const low = new THREE.Color('#b0b3b8'); // neutral gray
      const high = new THREE.Color('#57c7ff'); // vibrant cyan
      const mix = THREE.MathUtils.clamp(socialNorm, 0, 1);
      const target = new THREE.Color().lerpColors(low, high, mix);
      const current = new THREE.Color(metalRoofMaterialRef.current.color.getHex());
      metalRoofMaterialRef.current.color.setRGB(
        THREE.MathUtils.lerp(current.r, target.r, 0.12),
        THREE.MathUtils.lerp(current.g, target.g, 0.12),
        THREE.MathUtils.lerp(current.b, target.b, 0.12)
      );
      // keep metal surface slightly glossier than body
      if (typeof metalRoofMaterialRef.current.roughness === 'number') {
        metalRoofMaterialRef.current.roughness = THREE.MathUtils.lerp(metalRoofMaterialRef.current.roughness, 0.4, 0.08);
      }
      if (typeof metalRoofMaterialRef.current.metalness === 'number') {
        metalRoofMaterialRef.current.metalness = THREE.MathUtils.lerp(metalRoofMaterialRef.current.metalness, 0.6, 0.08);
      }
    }

    // Mail post yellow intensity based on openness to receiving messages
    const comm = protocol?.communicationMode || 'scheduled';
    const openToMessages = comm === 'open' || comm === 'async' || comm === 'sync';
    if (mailPostMaterialRef.current) {
      const targetEmissive = openToMessages ? 1.2 : 0.2;
      // Lerp emissiveIntensity for a smooth change
      const current = mailPostMaterialRef.current.emissiveIntensity || 0;
      mailPostMaterialRef.current.emissive = new THREE.Color('#ffd166'); // warm yellow
      mailPostMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(current, targetEmissive, 0.08);
      // Slight color saturation boost by lerping color toward yellow when open
      const baseColor = new THREE.Color('#ffffff');
      const yellow = new THREE.Color('#ffd166');
      const mix = openToMessages ? 0.5 : 0.1;
      const r = THREE.MathUtils.lerp(baseColor.r, yellow.r, mix);
      const g = THREE.MathUtils.lerp(baseColor.g, yellow.g, mix);
      const b = THREE.MathUtils.lerp(baseColor.b, yellow.b, mix);
      mailPostMaterialRef.current.color.setRGB(r, g, b);
    }

    // Emissive window brightness based on energy level
    const energy = protocol?.energyLevel ?? 0.5;
    const emissiveIntensity = THREE.MathUtils.clamp(energy, 0, 10) / 10; // 0..1
    if (windowLeftRef.current && windowLeftRef.current.material) {
      windowLeftRef.current.material.emissiveIntensity = emissiveIntensity * 1.5;
    }
    if (windowRightRef.current && windowRightRef.current.material) {
      windowRightRef.current.material.emissiveIntensity = emissiveIntensity * 1.5;
    }
    // Drive GLB window materials if detected with smooth lerp
    if (gltfWindowMaterialsRef.current && gltfWindowMaterialsRef.current.length) {
      const target = emissiveIntensity * 1.5;
      gltfWindowMaterialsRef.current.forEach((m) => {
        const current = m.emissiveIntensity ?? 0;
        m.emissiveIntensity = THREE.MathUtils.lerp(current, target, 0.12);
      });
    }

    // Fade in GLB materials once loaded (do not reset on slider changes)
    if (modelLoaded && houseRef.current) {
      houseRef.current.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];

      // Theme color by focus state: tint all non-glass materials
      const fstate = (protocol?.focusState || '').toLowerCase();
      // Pastel, muted palette
      const themeMap = {
        'maintenance': '#c7c9ce',
        'deep-work': '#a8c5f0',
        'rest': '#bfe3ce',
        'social': '#f6d7a6',
        'creative': '#d9c5f7'
      };
      const themeHex = themeMap[fstate] || '#b0b3b8';
      const targetTheme = new THREE.Color(themeHex);
      if (gltfBodyMaterialsRef.current.length) {
        gltfBodyMaterialsRef.current.forEach((m) => {
          const current = new THREE.Color(m.color.getHex());
          // Blend further toward gray to keep muted
          const gray = new THREE.Color('#e9eaee');
          const pastelTarget = new THREE.Color().lerpColors(targetTheme, gray, 0.35);
          m.color.setRGB(
            THREE.MathUtils.lerp(current.r, pastelTarget.r, 0.06),
            THREE.MathUtils.lerp(current.g, pastelTarget.g, 0.06),
            THREE.MathUtils.lerp(current.b, pastelTarget.b, 0.06)
          );
          // Slightly increase roughness, reduce metalness for softness
          if (typeof m.roughness === 'number') m.roughness = THREE.MathUtils.lerp(m.roughness, 0.75, 0.04);
          if (typeof m.metalness === 'number') m.metalness = THREE.MathUtils.lerp(m.metalness, 0.05, 0.04);
        });
      }
          mats.forEach((m) => {
            const current = typeof m.opacity === 'number' ? m.opacity : 1.0;
            m.transparent = true;
            m.opacity = THREE.MathUtils.lerp(current, 1.0, 0.06);
          });
        }
      });
    }

    // Animate fence build: grow vertical scale towards target
    if (fenceGroupRef.current) {
      const current = fenceGroupRef.current.scale.y;
      fenceGroupRef.current.scale.y = THREE.MathUtils.lerp(current || 0.001, fenceTargetHeight > 0 ? 1 : 0.001, 0.08);
    }
  });

  // Load low_poly_house.glb from public; if missing, render nothing
  let gltf = null;
  try {
    gltf = useGLTF('/low_poly_house.glb');
  } catch (e) {
    gltf = null;
  }

  return (
    <group position={position}>
      {gltf && (
        <Suspense fallback={null}>
          <HouseModel gltf={gltf} houseRef={houseRef} onReady={(scene)=>{ onModelReady(scene); setModelLoaded(true); }} />
        </Suspense>
      )}
      {/* Windows come from GLB (glass); no overlay quads needed */}

      {/* Porch/front light */}
      <pointLight ref={lightRef} position={[0.6, 1.1, 0.6]} color={'#ffd9a3'} intensity={0.0} distance={6} decay={2} />
      {/* External perimeter fence around the house, adjustable; render after model loads */}
      {showFence && (
      <group ref={fenceGroupRef} position={[0,0,0]}>
        {/* Rectangle fence posts around ~8x8 area */}
        {[-4,-3,-2,-1,0,1,2,3,4].map((i)=> (
          <mesh key={`front-${i}`} position={[i*1.2, 0.4, 4.0]}>
            <boxGeometry args={[0.1, THREE.MathUtils.lerp(0.6, 1.8, fenceTargetHeight), 0.08]} />
            <meshStandardMaterial color={'#b0b3b8'} metalness={0.15} roughness={0.7} />
          </mesh>
        ))}
        {[-4,-3,-2,-1,0,1,2,3,4].map((i)=> (
          <mesh key={`back-${i}`} position={[i*1.2, 0.4, -4.0]}>
            <boxGeometry args={[0.1, THREE.MathUtils.lerp(0.6, 1.8, fenceTargetHeight), 0.08]} />
            <meshStandardMaterial color={'#b0b3b8'} metalness={0.15} roughness={0.7} />
          </mesh>
        ))}
        {[-4,-3,-2,-1,0,1,2,3,4].map((i)=> (
          <mesh key={`left-${i}`} position={[-4.0, 0.4, i*1.2]}>
            <boxGeometry args={[0.1, THREE.MathUtils.lerp(0.6, 1.8, fenceTargetHeight), 0.08]} />
            <meshStandardMaterial color={'#b0b3b8'} metalness={0.15} roughness={0.7} />
          </mesh>
        ))}
        {[-4,-3,-2,-1,0,1,2,3,4].map((i)=> (
          <mesh key={`right-${i}`} position={[4.0, 0.4, i*1.2]}>
            <boxGeometry args={[0.1, THREE.MathUtils.lerp(0.6, 1.8, fenceTargetHeight), 0.08]} />
            <meshStandardMaterial color={'#b0b3b8'} metalness={0.15} roughness={0.7} />
          </mesh>
        ))}
        {/* Top rails */}
        <mesh position={[0, THREE.MathUtils.lerp(0.6, 1.8, fenceTargetHeight), 4.0]}>
          <boxGeometry args={[9.6, 0.08, 0.08]} />
          <meshStandardMaterial color={'#b0b3b8'} metalness={0.15} roughness={0.7} />
        </mesh>
        <mesh position={[0, THREE.MathUtils.lerp(0.6, 1.8, fenceTargetHeight), -4.0]}>
          <boxGeometry args={[9.6, 0.08, 0.08]} />
          <meshStandardMaterial color={'#b0b3b8'} metalness={0.15} roughness={0.7} />
        </mesh>
        <mesh position={[-4.0, THREE.MathUtils.lerp(0.6, 1.8, fenceTargetHeight), 0]}>
          <boxGeometry args={[0.08, 0.08, 9.6]} />
          <meshStandardMaterial color={'#b0b3b8'} metalness={0.15} roughness={0.7} />
        </mesh>
        <mesh position={[4.0, THREE.MathUtils.lerp(0.6, 1.8, fenceTargetHeight), 0]}>
          <boxGeometry args={[0.08, 0.08, 9.6]} />
          <meshStandardMaterial color={'#b0b3b8'} metalness={0.15} roughness={0.7} />
        </mesh>
      </group>
      )}
      {/* Weather: rain particles */}
      {isRainy && (
        <group ref={rainGroup} position={[0,0,0]} />
      )}
    </group>
  );
}
const HouseModel = memo(function HouseModel({ gltf, houseRef, onReady }) {
  // Ensure materials look white and non-blue
  const scene = useMemo(() => gltf.scene.clone(), [gltf]);
  // Center model to origin so placement aligns side-by-side in depth
  const bbox = new THREE.Box3().setFromObject(scene);
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  scene.position.sub(center);
  scene.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        const name = (m.name || '').toLowerCase();
        const meshName = (obj.name || '').toLowerCase();
        const isGlass = name.includes('glass') || meshName.includes('glass') || name.includes('window') || meshName.includes('window');
        if (isGlass) {
          // Glass windows: keep base color, add emissive for glow, keep low metalness
          m.emissive = new THREE.Color('#ffd9a3');
          m.emissiveIntensity = 0.0;
          m.metalness = 0.0;
          m.roughness = 0.2;
          m.transparent = true;
          m.opacity = typeof m.opacity === 'number' ? m.opacity : 0.7;
        } else {
          // House body: neutral white
          m.color = new THREE.Color('#ffffff');
          m.emissive = new THREE.Color('#000000');
          m.roughness = 0.6;
          m.metalness = 0.0;
        }
      });
      obj.castShadow = true;
      obj.receiveShadow = true;
      const meshName = (obj.name || '').toLowerCase();
      // Shutter: match explicit names like 'Cube.003' or containing 'Shutter'
      if (meshName.includes('cube.003') || meshName.includes('shutter')) {
        shutterRef && (shutterRef.current = obj);
      }
      // Mail post: prefer material named 'Yellow' on mesh named 'Mail_post'
      if ((obj.name || '') === 'Mail_post') {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        const yellowMat = mats.find((m)=> (m?.name||'').toLowerCase() === 'yellow') || mats[0];
        if (yellowMat) {
          mailPostMaterialRef.current = yellowMat;
          yellowMat.color = new THREE.Color('#ffffff');
          yellowMat.emissive = new THREE.Color('#ffd166');
          yellowMat.emissiveIntensity = 0.2;
        }
      }
    }
  });
   if (typeof onReady === 'function') onReady(scene);
  return <primitive object={scene} ref={houseRef} scale={0.8} />;
});

function isDaytime(userProtocols, partnerProtocols){
  const energyAvg = ((userProtocols?.energy ?? 0.5) + (partnerProtocols?.energy ?? 0.5))/2;
  return energyAvg >= 0.5;
}


