'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import ShipMonitorOverlay from '@/components/ships/ShipMonitorOverlay';
import { SHIPS, STATUS_COLORS, type Ship } from '@/lib/ships';

/* ── Geo helper ─────────────────────────────────────────── */
const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
};

/* ── Landmass polygons (simplified Natural Earth) ────────── */
const LANDMASSES: [number, number][][] = [
  [[-168,65.5],[-164,67],[-156,71],[-148,70.5],[-141,69.5],[-133,69.5],[-128,70],[-115,73],[-105,73],[-95,74],[-85,73],[-78,72],[-75,68],[-78,63],[-82,60],[-77,57],[-69,58],[-65,54],[-60,53],[-55,52],[-52,48],[-58,46],[-63,45],[-66,44],[-70,43],[-71,41],[-74,40],[-75,38],[-76,37],[-78,34],[-81,32],[-81,30],[-80,27],[-82,25],[-83,28],[-87,30],[-89,29],[-94,29],[-97,28],[-97,26],[-100,25],[-105,22],[-107,25],[-110,23],[-115,29],[-117,33],[-121,35],[-122,37],[-124,40],[-124,46],[-122,48],[-125,50],[-131,52],[-135,57],[-141,60],[-150,59],[-153,57],[-158,55],[-163,55],[-166,60],[-168,65.5]],
  [[-45,83],[-30,83],[-22,80],[-20,76],[-22,70],[-25,65],[-35,60],[-43,60],[-50,64],[-55,68],[-58,72],[-55,77],[-50,80],[-45,83]],
  [[-80,73],[-72,72],[-65,70],[-65,67],[-72,65],[-78,66],[-82,70],[-80,73]],
  [[-85,22],[-79,22],[-74,20],[-78,20],[-83,21],[-85,22]],
  [[-74,20],[-68,19],[-69,18],[-74,18],[-74,20]],
  [[-59,52],[-53,51],[-53,47],[-58,46],[-59,52]],
  [[-128,51],[-123,49],[-124,48],[-128,49],[-128,51]],
  [[-81,12],[-76,12],[-71,12],[-66,11],[-60,8],[-55,5],[-51,4],[-50,0],[-48,-2],[-44,-3],[-38,-5],[-35,-8],[-37,-12],[-39,-18],[-42,-23],[-48,-28],[-54,-34],[-57,-39],[-62,-40],[-65,-42],[-66,-45],[-68,-50],[-69,-53],[-72,-54],[-74,-50],[-74,-44],[-73,-37],[-72,-30],[-71,-25],[-70,-18],[-72,-14],[-77,-12],[-79,-8],[-81,-5],[-80,-2],[-78,1],[-77,4],[-78,8],[-81,12]],
  [[-10,36],[-6,36],[-2,36],[3,37],[8,38],[12,38],[15,40],[18,40],[22,40],[23,38],[26,38],[28,37],[30,37],[33,36],[36,36],[36,34],[35,32],[34,30],[32,31],[30,31],[27,31],[24,32],[20,32],[15,32],[11,33],[8,34],[2,35],[-2,35],[-6,35],[-9,33],[-10,36]],
  [[-10,36],[-9,43],[-5,44],[-2,44],[0,46],[2,49],[1,51],[4,52],[8,54],[12,54],[14,55],[15,57],[18,59],[22,60],[24,65],[26,68],[30,70],[35,71],[40,68],[45,66],[50,68],[55,71],[60,72],[68,72],[75,73],[80,73],[90,74],[100,75],[110,76],[120,73],[130,71],[140,72],[150,69],[160,69],[170,68],[178,68],[178,65],[170,64],[160,60],[155,57],[145,57],[140,55],[135,55],[133,52],[140,46],[143,45],[140,40],[135,38],[130,35],[126,35],[122,30],[120,25],[112,21],[108,18],[105,12],[107,10],[110,3],[113,1],[110,-5],[105,-5],[100,2],[97,5],[95,15],[90,22],[86,21],[82,21],[80,15],[77,8],[73,9],[70,21],[68,24],[66,25],[60,25],[57,25],[52,28],[48,30],[45,28],[42,15],[44,12],[51,12],[51,18],[55,22],[57,17],[55,12],[51,4],[48,11],[42,11],[40,5],[40,-2],[43,-12],[40,-15],[35,-20],[32,-26],[28,-33],[22,-34],[18,-34],[15,-30],[12,-20],[14,-15],[12,-10],[14,-5],[10,3],[8,5],[3,6],[-2,5],[-7,7],[-10,8],[-15,12],[-17,17],[-15,21],[-13,27],[-10,30],[-10,36]],
  [[-8,58],[-6,58],[-3,59],[-2,57],[0,55],[1,53],[-2,51],[-5,50],[-6,52],[-5,55],[-8,58]],
  [[-10,54],[-7,54],[-6,52],[-10,52],[-10,54]],
  [[-24,66],[-14,66],[-13,64],[-22,63],[-24,66]],
  [[131,34],[136,35],[140,36],[142,40],[141,42],[136,37],[133,35],[131,34]],
  [[140,42],[145,44],[144,45],[140,45],[140,42]],
  [[80,9],[82,8],[82,6],[80,7],[80,9]],
  [[109,1],[117,5],[119,1],[117,-3],[112,-3],[109,1]],
  [[95,5],[100,4],[105,-2],[103,-5],[97,-1],[95,5]],
  [[105,-6],[114,-7],[115,-8],[106,-8],[105,-6]],
  [[119,1],[125,1],[125,-5],[121,-5],[119,1]],
  [[131,-1],[141,-2],[151,-6],[150,-10],[141,-9],[134,-8],[131,-4],[131,-1]],
  [[120,14],[122,18],[122,14],[120,13],[120,14]],
  [[122,7],[126,9],[126,6],[123,6],[122,7]],
  [[120,22],[122,25],[122,22],[120,22]],
  [[142,46],[144,54],[143,46],[142,46]],
  [[-17,21],[-16,15],[-15,12],[-10,8],[-5,5],[3,6],[8,5],[10,3],[14,-5],[12,-10],[14,-15],[12,-20],[15,-30],[18,-34],[22,-34],[28,-33],[32,-26],[35,-20],[40,-15],[43,-12],[40,-2],[40,5],[42,11],[48,11],[51,4],[55,12],[57,17],[55,22],[51,18],[51,12],[44,12],[42,15],[37,18],[34,22],[30,24],[27,28],[24,31],[20,32],[15,32],[11,33],[8,34],[2,35],[-2,35],[-6,35],[-9,33],[-12,28],[-15,25],[-17,21]],
  [[43,-12],[50,-15],[50,-22],[46,-25],[43,-22],[43,-12]],
  [[114,-22],[122,-18],[129,-15],[136,-12],[140,-12],[143,-13],[145,-15],[147,-19],[150,-22],[153,-25],[153,-28],[150,-33],[149,-37],[146,-39],[141,-38],[136,-35],[132,-32],[127,-32],[120,-34],[115,-34],[113,-26],[114,-22]],
  [[144,-40],[148,-40],[148,-43],[145,-43],[144,-40]],
  [[173,-35],[178,-37],[177,-41],[173,-39],[173,-35]],
  [[166,-46],[174,-41],[174,-46],[168,-47],[166,-46]],
  [[-180,-65],[-150,-72],[-120,-73],[-90,-72],[-60,-65],[-30,-68],[0,-70],[30,-69],[60,-67],[90,-67],[120,-66],[150,-72],[180,-72],[180,-90],[-180,-90],[-180,-65]],
];

function createShipMarker(color: THREE.Color): THREE.Group {
  const group = new THREE.Group();

  const hullShape = new THREE.Shape();
  hullShape.moveTo(0, 0.048);
  hullShape.lineTo(0.020, 0.022);
  hullShape.lineTo(0.020, -0.036);
  hullShape.lineTo(-0.020, -0.036);
  hullShape.lineTo(-0.020, 0.022);
  hullShape.closePath();

  const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
    depth: 0.014,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 1,
  });
  const hull = new THREE.Mesh(
    hullGeo,
    new THREE.MeshPhongMaterial({ color, shininess: 60, specular: 0x222222 }),
  );
  group.add(hull);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(0.026, 0.028, 0.012),
    new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 40 }),
  );
  cabin.position.set(0, -0.008, 0.014 + 0.006);
  group.add(cabin);

  const stack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0035, 0.0035, 0.014, 8),
    new THREE.MeshPhongMaterial({ color, shininess: 40 }),
  );
  stack.rotation.x = Math.PI / 2;
  stack.position.set(0, -0.010, 0.014 + 0.012 + 0.007);
  group.add(stack);

  return group;
}

function orientOnGlobe(obj: THREE.Object3D, position: THREE.Vector3, headingDeg: number) {
  const normal = position.clone().normalize();
  const worldUp = new THREE.Vector3(0, 1, 0);
  const east = new THREE.Vector3().crossVectors(worldUp, normal);
  if (east.lengthSq() < 1e-6) east.set(1, 0, 0);
  east.normalize();
  const north = new THREE.Vector3().crossVectors(normal, east).normalize();

  const basis = new THREE.Matrix4().makeBasis(east, north, normal);
  obj.quaternion.setFromRotationMatrix(basis);
  obj.rotateZ(-headingDeg * Math.PI / 180);
}

export default function ShipMonitor() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const markerGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const rotationRef = useRef({ x: 0.1, y: 0 });
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);

  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [hoveredShip, setHoveredShip] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    const globeRadius = 1.8;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 96, 96);

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgb(96,197,238)';
    ctx.fillRect(0, 0, 2048, 1024);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    for (let lon = -180; lon <= 180; lon += 15) {
      const x = ((lon + 180) / 360) * 2048;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
    }
    for (let lat = -90; lat <= 90; lat += 15) {
      const y = ((90 - lat) / 180) * 1024;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2048, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, 512); ctx.lineTo(2048, 512); ctx.stroke();

    const project = (lon: number, lat: number): [number, number] => [
      ((lon + 180) / 360) * 2048,
      ((90 - lat) / 180) * 1024,
    ];

    LANDMASSES.forEach(polygon => {
      ctx.beginPath();
      polygon.forEach(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgb(159,200,106)';
      ctx.fill();
      ctx.strokeStyle = 'rgb(159,200,106)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = 8;

    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      emissive: 0x000000,
      emissiveIntensity: 0,
      shininess: 10,
      specular: '#fff',
    });

    const globe = new THREE.Mesh(globeGeo, globeMat);
    globeRef.current = globe;
    scene.add(globe);

    const wireGeo = new THREE.SphereGeometry(globeRadius * 1.002, 32, 16);
    globe.add(new THREE.Mesh(wireGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.08 })));

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const markerGroup = new THREE.Group();
    markerGroupRef.current = markerGroup;
    globe.add(markerGroup);

    SHIPS.forEach((ship, idx) => {
      const pos = latLonToVector3(ship.lat, ship.lon, globeRadius * 1.015);
      const color = new THREE.Color(STATUS_COLORS[ship.status]);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.04, 0.07, 24),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
      );
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      ring.userData = { isMarker: true, shipId: ship.id, type: 'ring', baseOpacity: 0.45, phase: idx * 0.7 };
      markerGroup.add(ring);

      const shipMesh = createShipMarker(color);
      shipMesh.position.copy(pos);
      orientOnGlobe(shipMesh, pos, ship.heading);
      shipMesh.traverse(child => {
        child.userData = { isMarker: true, shipId: ship.id, type: 'ship' };
      });
      markerGroup.add(shipMesh);

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.25, 6),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45 }),
      );
      beam.position.copy(latLonToVector3(ship.lat, ship.lon, globeRadius * 1.14));
      beam.lookAt(0, 0, 0);
      beam.rotateX(Math.PI / 2);
      beam.userData = { isMarker: true, shipId: ship.id, type: 'beam' };
      markerGroup.add(beam);
    });

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e: PointerEvent) => {
      const { clientX, clientY } = e;
      if (isDraggingRef.current) {
        const dx = clientX - previousMouseRef.current.x;
        const dy = clientY - previousMouseRef.current.y;
        rotationRef.current.y += dx * 0.005;
        rotationRef.current.x += dy * 0.005;
        rotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationRef.current.x));
        previousMouseRef.current = { x: clientX, y: clientY };
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(markerGroup.children, true);
      const hit = intersects.find(i => i.object.userData.isMarker);
      if (hit) {
        setHoveredShip(hit.object.userData.shipId as string);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredShip(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      renderer.domElement.releasePointerCapture(e.pointerId);
      renderer.domElement.style.cursor = 'grab';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(markerGroup.children, true);
      const hit = intersects.find(i => i.object.userData.isMarker);
      if (hit) {
        const ship = SHIPS.find(s => s.id === hit.object.userData.shipId);
        if (ship) setSelectedShip(ship);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('click', handleClick);

    const getMinZ = (aspect: number) => Math.max(5, 5 / aspect);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const aspect = mountRef.current
        ? mountRef.current.clientWidth / mountRef.current.clientHeight
        : 1;
      camera.position.z += e.deltaY * 0.003;
      camera.position.z = Math.max(getMinZ(aspect), Math.min(10, camera.position.z));
    };
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    let frameId: number;
    const timer = new THREE.Timer();
    const animate = () => {
      timer.update();
      const t = timer.getElapsed();
      if (autoRotateRef.current) rotationRef.current.y += 0.0015;
      globe.rotation.y = rotationRef.current.y;
      globe.rotation.x = rotationRef.current.x;
      markerGroup.children.forEach(m => {
        if (m.userData.type === 'ring') {
          const pulse = (Math.sin(t * 2 + m.userData.phase) + 1) / 2;
          m.scale.setScalar(1 + pulse * 0.4);
          (m as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>).material.opacity =
            m.userData.baseOpacity * (1 - pulse * 0.5);
        }
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      const aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      const minZ = getMinZ(aspect);
      if (camera.position.z < minZ) camera.position.z = minZ;
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);
    renderer.domElement.style.cursor = 'grab';

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />
      <ShipMonitorOverlay
        selectedShip={selectedShip}
        setSelectedShip={setSelectedShip}
        hoveredShip={hoveredShip}
        setHoveredShip={setHoveredShip}
      />
    </div>
  );
}
