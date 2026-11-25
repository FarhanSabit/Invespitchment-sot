import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ArModelPreset } from '../context/ArPreviewContext';
import { 
  RotateCw, 
  Layers, 
  Scan, 
  Sliders, 
  Camera,
  RefreshCw,
  Box,
  Glasses,
  BarChart3,
  Shield,
  Globe
} from 'lucide-react';

interface ArSpatialViewerProps {
  modelPreset?: ArModelPreset;
  onPresetChange?: (preset: ArModelPreset) => void;
}

export const ArSpatialViewer: React.FC<ArSpatialViewerProps> = ({
  modelPreset = 'fusion-core',
  onPresetChange
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<ArModelPreset>(modelPreset);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isArPassthrough, setIsArPassthrough] = useState<boolean>(false);
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [isBottomDockCollapsed, setIsBottomDockCollapsed] = useState<boolean>(false);
  const [polyCount, setPolyCount] = useState<number>(0);

  // References for Three.js scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const dynamicPartsRef = useRef<{ mesh: THREE.Object3D; originalY: number; explodeVector: THREE.Vector3 }[]>([]);
  const animationFrameIdRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 6.2,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  // Sync external preset changes
  useEffect(() => {
    if (modelPreset && modelPreset !== activePreset) {
      setActivePreset(modelPreset);
    }
  }, [modelPreset]);

  // Model builder
  const buildModel = useCallback((preset: ArModelPreset, scene: THREE.Scene) => {
    // Clear previous model
    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      modelGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    const group = new THREE.Group();
    modelGroupRef.current = group;
    dynamicPartsRef.current = [];
    scene.add(group);

    let totalTriangles = 0;

    if (preset === 'fusion-core') {
      // 1. COMPOSABLE 6-LAYER FUSION ARCHITECTURE MODEL
      const layerColors = [0xf43f5e, 0xf59e0b, 0x10b981, 0x06b6d4, 0x6366f1, 0xa855f7];

      for (let i = 0; i < 6; i++) {
        const yOffset = (i - 2.5) * 0.48;
        const layerGroup = new THREE.Group();
        layerGroup.position.y = yOffset;

        // Hexagonal slab
        const hexRadius = 1.6 - Math.abs(i - 2.5) * 0.08;
        const hexGeo = new THREE.CylinderGeometry(hexRadius, hexRadius, 0.12, 6);
        const hexMat = new THREE.MeshPhysicalMaterial({
          color: layerColors[i],
          metalness: 0.85,
          roughness: 0.2,
          transparent: true,
          opacity: 0.85,
          wireframe: isWireframe,
        });
        const hexMesh = new THREE.Mesh(hexGeo, hexMat);
        layerGroup.add(hexMesh);
        totalTriangles += 12;

        // Glowing outer neon edge ring
        const ringGeo = new THREE.TorusGeometry(hexRadius * 1.04, 0.02, 8, 6);
        const ringMat = new THREE.MeshBasicMaterial({ color: layerColors[i], wireframe: isWireframe });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        layerGroup.add(ringMesh);

        // Core data cylinder
        const coreGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.9,
          roughness: 0.1,
          wireframe: isWireframe,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        layerGroup.add(coreMesh);

        group.add(layerGroup);
        dynamicPartsRef.current.push({
          mesh: layerGroup,
          originalY: yOffset,
          explodeVector: new THREE.Vector3(0, (i - 2.5) * 1.2, 0),
        });
      }

      // Central rotating neural gyro
      const gyroGeo = new THREE.IcosahedronGeometry(0.55, 1);
      const gyroMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        wireframe: true,
      });
      const gyroMesh = new THREE.Mesh(gyroGeo, gyroMat);
      gyroMesh.position.y = 0;
      group.add(gyroMesh);

      // Orbiting particles ring
      const particleCount = 120;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let p = 0; p < particleCount; p++) {
        const angle = (p / particleCount) * Math.PI * 2;
        const radius = 2.1 + (Math.random() - 0.5) * 0.4;
        positions[p * 3] = Math.cos(angle) * radius;
        positions[p * 3 + 1] = (Math.random() - 0.5) * 1.5;
        positions[p * 3 + 2] = Math.sin(angle) * radius;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x22d3ee,
        size: 0.05,
        transparent: true,
        opacity: 0.8,
      });
      const particleSystem = new THREE.Points(particleGeo, particleMat);
      group.add(particleSystem);
      totalTriangles += 240;
    } else if (preset === 'spatial-twin') {
      // 2. FACILITY & CLEANROOM DIGITAL TWIN MODEL
      // Main facility slab
      const slabGeo = new THREE.BoxGeometry(3.6, 0.15, 3.6);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.7,
        roughness: 0.3,
        wireframe: isWireframe,
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.y = -0.8;
      group.add(slabMesh);

      // Floor grid overlay
      const gridHelper = new THREE.GridHelper(3.6, 12, 0x06b6d4, 0x1e293b);
      gridHelper.position.y = -0.71;
      group.add(gridHelper);

      // 4 Cleanroom module blocks
      const moduleSpecs = [
        { x: -0.9, z: -0.9, w: 1.3, h: 1.2, d: 1.3, color: 0x0ea5e9 },
        { x: 0.9, z: -0.9, w: 1.1, h: 0.85, d: 1.2, color: 0x10b981 },
        { x: -0.9, z: 0.9, w: 1.2, h: 0.7, d: 1.1, color: 0xa855f7 },
        { x: 0.9, z: 0.9, w: 1.3, h: 1.4, d: 1.3, color: 0x38bdf8 },
      ];

      moduleSpecs.forEach((spec, idx) => {
        const modGroup = new THREE.Group();
        modGroup.position.set(spec.x, -0.72 + spec.h / 2, spec.z);

        // Glass room envelope
        const roomGeo = new THREE.BoxGeometry(spec.w, spec.h, spec.d);
        const roomMat = new THREE.MeshPhysicalMaterial({
          color: spec.color,
          metalness: 0.3,
          roughness: 0.1,
          transparent: true,
          opacity: 0.45,
          wireframe: isWireframe,
        });
        const roomMesh = new THREE.Mesh(roomGeo, roomMat);
        modGroup.add(roomMesh);

        // Inner equipment core
        const equipGeo = new THREE.CylinderGeometry(0.2, 0.2, spec.h * 0.7, 8);
        const equipMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.9,
          roughness: 0.2,
          wireframe: isWireframe,
        });
        const equipMesh = new THREE.Mesh(equipGeo, equipMat);
        modGroup.add(equipMesh);

        // Beacon node on roof
        const beaconGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.y = spec.h / 2 + 0.08;
        modGroup.add(beaconMesh);

        group.add(modGroup);
        dynamicPartsRef.current.push({
          mesh: modGroup,
          originalY: -0.72 + spec.h / 2,
          explodeVector: new THREE.Vector3(spec.x * 0.8, idx * 0.4, spec.z * 0.8),
        });
      });

      // Spatial scanner laser ring
      const scanTorus = new THREE.TorusGeometry(1.9, 0.02, 8, 32);
      const scanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
      const scanMesh = new THREE.Mesh(scanTorus, scanMat);
      scanMesh.rotation.x = Math.PI / 2;
      scanMesh.position.y = 0.4;
      group.add(scanMesh);
      totalTriangles += 180;
    } else if (preset === 'hardware-glasses') {
      // 3. ENTERPRISE AR SMART GLASSES & WAVEGUIDE DISPLAY
      const glassesGroup = new THREE.Group();
      group.add(glassesGroup);

      // Frame bridge
      const bridgeGeo = new THREE.BoxGeometry(0.5, 0.08, 0.1);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.95,
        roughness: 0.15,
        wireframe: isWireframe,
      });
      const bridge = new THREE.Mesh(bridgeGeo, frameMat);
      glassesGroup.add(bridge);

      // Left & Right Lenses (Waveguide display glass)
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.75,
        transmission: 0.85,
        ior: 1.6,
        wireframe: isWireframe,
      });

      [-0.85, 0.85].forEach((xSide) => {
        const lensGroup = new THREE.Group();
        lensGroup.position.set(xSide, -0.2, 0);

        // Lens cylinder
        const lensGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.06, 24);
        lensGeo.rotateX(Math.PI / 2);
        const lensMesh = new THREE.Mesh(lensGeo, lensMat);
        lensGroup.add(lensMesh);

        // Outer frame rim
        const rimGeo = new THREE.TorusGeometry(0.68, 0.05, 8, 24);
        const rimMesh = new THREE.Mesh(rimGeo, frameMat);
        lensGroup.add(rimMesh);

        // Temple arm extending back
        const templeGeo = new THREE.BoxGeometry(0.08, 0.12, 1.9);
        const templeMesh = new THREE.Mesh(templeGeo, frameMat);
        templeMesh.position.set(xSide > 0 ? 0.68 : -0.68, 0.15, -0.95);
        lensGroup.add(templeMesh);

        // Micro-camera sensor node
        const camGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12);
        camGeo.rotateX(Math.PI / 2);
        const camMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.1 });
        const camMesh = new THREE.Mesh(camGeo, camMat);
        camMesh.position.set(xSide > 0 ? 0.72 : -0.72, 0.22, 0.06);
        lensGroup.add(camMesh);

        // Holographic HUD display projection plane
        const hudGeo = new THREE.PlaneGeometry(0.8, 0.5);
        const hudMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          wireframe: true,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        const hudMesh = new THREE.Mesh(hudGeo, hudMat);
        hudMesh.position.set(0, 0, 0.6);
        lensGroup.add(hudMesh);

        glassesGroup.add(lensGroup);
        dynamicPartsRef.current.push({
          mesh: lensGroup,
          originalY: -0.2,
          explodeVector: new THREE.Vector3(xSide * 0.7, 0, 0.4),
        });
      });
      totalTriangles += 260;
    } else if (preset === 'financial-waterfall') {
      // 4. 9-TIER UNIT ECONOMICS 3D LATTICE
      const tierCount = 9;
      const tierColors = [
        0x38bdf8, 0x0284c7, 0x0369a1, // Model A: Micro ($800–$5k)
        0x818cf8, 0x6366f1, 0x4f46e5, // Model B: Mid-Market ($5k–$30k)
        0x34d399, 0x10b981, 0x059669, // Model C: Enterprise ($40k–$100k)
      ];

      for (let t = 0; t < tierCount; t++) {
        const tierGroup = new THREE.Group();
        const angle = (t / tierCount) * Math.PI * 2;
        const radius = 1.4;
        const height = 0.5 + t * 0.22;
        const xPos = Math.cos(angle) * radius;
        const zPos = Math.sin(angle) * radius;
        const yPos = -0.8 + height / 2;

        tierGroup.position.set(xPos, yPos, zPos);

        // Bar pillar
        const barGeo = new THREE.BoxGeometry(0.42, height, 0.42);
        const barMat = new THREE.MeshStandardMaterial({
          color: tierColors[t],
          metalness: 0.8,
          roughness: 0.2,
          wireframe: isWireframe,
        });
        const barMesh = new THREE.Mesh(barGeo, barMat);
        tierGroup.add(barMesh);

        // Glowing cap
        const capGeo = new THREE.BoxGeometry(0.44, 0.04, 0.44);
        const capMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.y = height / 2 + 0.02;
        tierGroup.add(capMesh);

        group.add(tierGroup);
        dynamicPartsRef.current.push({
          mesh: tierGroup,
          originalY: yPos,
          explodeVector: new THREE.Vector3(xPos * 0.9, t * 0.18, zPos * 0.9),
        });
      }

      // Base pedestal
      const baseGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.15, 24);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.88;
      group.add(baseMesh);
      totalTriangles += 150;
    } else if (preset === 'airgap-vault') {
      // 5. AIR-GAPPED ON-PREMISE NEURAL VAULT
      // Outer vault cylinder
      const vaultGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.6, 24);
      const vaultMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.95,
        roughness: 0.15,
        wireframe: isWireframe,
      });
      const vaultMesh = new THREE.Mesh(vaultGeo, vaultMat);
      group.add(vaultMesh);

      // 3 Concentric rotating security dials
      [0.95, 0.65, 0.35].forEach((radius, idx) => {
        const dialGroup = new THREE.Group();
        dialGroup.position.set(0, 0.32 + idx * 0.08, 0);

        const dialGeo = new THREE.TorusGeometry(radius, 0.05, 8, 24);
        const dialMat = new THREE.MeshStandardMaterial({
          color: idx === 0 ? 0x06b6d4 : idx === 1 ? 0x10b981 : 0xf59e0b,
          metalness: 0.9,
          roughness: 0.1,
          wireframe: isWireframe,
        });
        const dialMesh = new THREE.Mesh(dialGeo, dialMat);
        dialMesh.rotation.x = Math.PI / 2;
        dialGroup.add(dialMesh);

        // Security teeth
        for (let tooth = 0; tooth < 8; tooth++) {
          const tAngle = (tooth / 8) * Math.PI * 2;
          const toothGeo = new THREE.BoxGeometry(0.08, 0.06, 0.16);
          const toothMesh = new THREE.Mesh(toothGeo, dialMat);
          toothMesh.position.set(Math.cos(tAngle) * radius, 0, Math.sin(tAngle) * radius);
          dialGroup.add(toothMesh);
        }

        group.add(dialGroup);
        dynamicPartsRef.current.push({
          mesh: dialGroup,
          originalY: 0.32 + idx * 0.08,
          explodeVector: new THREE.Vector3(0, (idx + 1) * 0.7, 0),
        });
      });

      // Air-gap holographic lock beam
      const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.4, 16);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      group.add(beamMesh);
      totalTriangles += 320;
    } else {
      // 6. GLOBAL DUAL-SHORE ORBITAL MODEL
      // Wireframe Earth globe
      const globeGeo = new THREE.SphereGeometry(1.4, 24, 24);
      const globeMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        wireframe: true,
        metalness: 0.8,
        roughness: 0.2,
      });
      const globeMesh = new THREE.Mesh(globeGeo, globeMat);
      group.add(globeMesh);

      // Atmosphere outer glow
      const atmoGeo = new THREE.SphereGeometry(1.48, 16, 16);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.15,
        wireframe: true,
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      group.add(atmoMesh);

      // San Jose Hub Beacon (North America)
      const sjGroup = new THREE.Group();
      sjGroup.position.set(-0.8, 0.7, 0.9);
      const sjPin = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 8), new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
      sjPin.rotation.x = Math.PI;
      sjGroup.add(sjPin);
      group.add(sjGroup);

      // Dhaka Hub Beacon (South Asia)
      const dhkGroup = new THREE.Group();
      dhkGroup.position.set(0.9, 0.5, -0.7);
      const dhkPin = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      dhkPin.rotation.x = Math.PI;
      dhkGroup.add(dhkPin);
      group.add(dhkGroup);

      // Dual-Shore Orbital Arc
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.8, 0.7, 0.9),
        new THREE.Vector3(0.1, 2.2, 0.1),
        new THREE.Vector3(0.9, 0.5, -0.7)
      );
      const points = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      group.add(arcLine);

      dynamicPartsRef.current.push({
        mesh: sjGroup,
        originalY: 0.7,
        explodeVector: new THREE.Vector3(-0.4, 0.5, 0.4),
      });
      dynamicPartsRef.current.push({
        mesh: dhkGroup,
        originalY: 0.5,
        explodeVector: new THREE.Vector3(0.4, 0.5, -0.4),
      });
      totalTriangles += 420;
    }

    setPolyCount(totalTriangles);
  }, [isWireframe]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition(camera);

    // 3. Renderer with high-fidelity color pipeline & PMREM studio reflections
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const fillLightCyan = new THREE.PointLight(0x06b6d4, 3.5, 30);
    fillLightCyan.position.set(-6, 3, 5);
    scene.add(fillLightCyan);

    const rimLightPurple = new THREE.PointLight(0xa855f7, 2.8, 25);
    rimLightPurple.position.set(0, -4, -6);
    scene.add(rimLightPurple);

    // Build the initial 3D model
    buildModel(activePreset, scene);

    // 5. Continuous animation loop with smooth rotation & explosion
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      if (modelGroupRef.current) {
        if (isAutoRotating) {
          modelGroupRef.current.rotation.y += 0.007;
        }

        // Apply exploded view interpolation
        dynamicPartsRef.current.forEach((item) => {
          const targetY = item.originalY + item.explodeVector.y * (explodedFactor / 100);
          item.mesh.position.y = THREE.MathUtils.lerp(item.mesh.position.y, targetY, 0.15);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      envTarget.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [activePreset, buildModel, isAutoRotating]);

  // Update exploded view positions dynamically
  useEffect(() => {
    dynamicPartsRef.current.forEach((item) => {
      const targetY = item.originalY + item.explodeVector.y * (explodedFactor / 100);
      item.mesh.position.y = targetY;
    });
  }, [explodedFactor]);

  // Helper to sync spherical coordinates to camera position
  const updateCameraPosition = (cam: THREE.PerspectiveCamera) => {
    const { radius, theta, phi } = cameraSphericalRef.current;
    cam.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cam.position.y = radius * Math.cos(phi);
    cam.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cam.lookAt(0, 0, 0);
  };

  // Pointer Interaction Handlers for Custom Orbit Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    pointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !cameraRef.current) return;
    const dx = e.clientX - pointerPosRef.current.x;
    const dy = e.clientY - pointerPosRef.current.y;
    pointerPosRef.current = { x: e.clientX, y: e.clientY };

    cameraSphericalRef.current.theta -= dx * 0.008;
    cameraSphericalRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI - 0.1, cameraSphericalRef.current.phi - dy * 0.008)
    );

    updateCameraPosition(cameraRef.current);
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    e.preventDefault();
    cameraSphericalRef.current.radius = Math.max(
      2.5,
      Math.min(12.0, cameraSphericalRef.current.radius + e.deltaY * 0.005)
    );
    updateCameraPosition(cameraRef.current);
  };

  const handleResetCamera = () => {
    cameraSphericalRef.current = { radius: 6.2, theta: Math.PI / 4, phi: Math.PI / 3 };
    if (cameraRef.current) {
      updateCameraPosition(cameraRef.current);
    }
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.set(0, 0, 0);
    }
    setExplodedFactor(0);
  };

  const handlePresetSelect = (preset: ArModelPreset) => {
    setActivePreset(preset);
    if (onPresetChange) {
      onPresetChange(preset);
    }
  };

  const PRESETS_LIST: { id: ArModelPreset; name: string; icon: any; tag: string }[] = [
    { id: 'fusion-core', name: '6-Layer Fusion', icon: Layers, tag: 'Architecture' },
    { id: 'spatial-twin', name: 'Digital Twin', icon: Box, tag: 'Facility SCADA' },
    { id: 'hardware-glasses', name: 'Smart Glasses', icon: Glasses, tag: 'Hardware Influx' },
    { id: 'financial-waterfall', name: 'Unit Economics', icon: BarChart3, tag: '9-Tier Waterfall' },
    { id: 'airgap-vault', name: 'Neural Air-Gap', icon: Shield, tag: 'Zero Egress' },
    { id: 'global-orbit', name: 'Dual-Shore Sync', icon: Globe, tag: 'San Jose ↔ Dhaka' },
  ];

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] bg-[#02050A] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none flex flex-col justify-between">
      
      {/* Background Mode: Simulated AR Passthrough Camera or Cyber Dark Void */}
      {isArPassthrough ? (
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-slate-950/90 overflow-hidden">
          {/* Simulated AR Camera Reticle & Alignment Crosshairs */}
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-400/30 rounded-full animate-ping pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-cyan-400 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-16 bg-cyan-400/60 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-px bg-cyan-400/60 pointer-events-none" />
          
          {/* AR Surface Detection Plane Grid */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 h-16 border-b-2 border-cyan-500/60 rounded-xl bg-cyan-500/5 flex items-center justify-center text-[10px] font-mono text-cyan-300">
            [ WebXR Surface Anchor: Locked (0.00, -0.80, 0.00) ]
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-[#03060E] to-[#010307]" />
      )}

      {/* Top HUD Metadata Bar (Minimalist, non-occluding) */}
      <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800">
          <Scan className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <span>SPENTA 3D SPATIAL RUNTIME</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                {isArPassthrough ? 'AR Passthrough Active' : 'WebXR 60 FPS'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {PRESETS_LIST.find((p) => p.id === activePreset)?.name} • {polyCount} Polygons
            </div>
          </div>
        </div>

        {/* Top-Right Quick Toggles */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Simulated AR Mode Toggle */}
          <button
            onClick={() => setIsArPassthrough(!isArPassthrough)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
              isArPassthrough
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/25 ring-2 ring-cyan-400/50'
                : 'bg-slate-950/80 text-cyan-300 border-cyan-500/30 hover:bg-slate-900'
            }`}
            title="Toggle Simulated AR Passthrough Camera"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isArPassthrough ? 'Exit AR Mode' : 'Simulate AR'}</span>
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isWireframe
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-900'
            }`}
            title="Toggle Wireframe Shading"
          >
            <Box className="w-4 h-4" />
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isAutoRotating
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-900'
            }`}
            title="Toggle Auto-Rotation"
          >
            <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'text-cyan-400' : ''}`} />
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
            title="Reset 3D View"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Central 3D Canvas Mount (100% unobstructed, drag to orbit) */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
        title="Click and drag to rotate in 3D. Scroll to zoom."
      />

      {/* Ergonomic Bottom Control Dock (Consolidated, Zero Center Occlusion) */}
      <div className="relative z-10 p-4 max-w-4xl mx-auto w-full pointer-events-none">
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl space-y-3 hud-corner">
          
          {/* Collapse/Expand Toggle Header */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>SPATIAL INSPECTION CONTROLS</span>
            </span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Drag to Rotate • Scroll to Zoom
              </span>
              <button
                onClick={() => setIsBottomDockCollapsed(!isBottomDockCollapsed)}
                className="text-slate-400 hover:text-white text-[10px] font-mono underline cursor-pointer"
              >
                {isBottomDockCollapsed ? 'Show Controls' : 'Hide Controls'}
              </button>
            </div>
          </div>

          {!isBottomDockCollapsed && (
            <div className="space-y-3 pt-1">
              {/* Model Preset Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
                {PRESETS_LIST.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950' : 'text-cyan-400'}`} />
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono truncate">{preset.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Exploded View Separation Slider */}
              <div className="flex items-center gap-4 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 shrink-0">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Exploded Architecture:</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={explodedFactor}
                  onChange={(e) => setExplodedFactor(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                <span className="text-xs font-mono font-bold text-cyan-300 w-12 text-right shrink-0">
                  {explodedFactor}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
