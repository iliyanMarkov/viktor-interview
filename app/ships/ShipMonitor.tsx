'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  IconAnchor,
  IconNavigation,
  IconUsers,
  IconWind,
  IconX,
  IconMapPin,
  IconCalendar,
  IconBriefcase,
  IconGlobe,
  IconShip,
  IconCircleFilled,
  IconSatellite,
  IconWifi,
  IconCloudRain,
  IconLock,
} from '@tabler/icons-react';

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

/* ── Types ──────────────────────────────────────────────── */
interface CrewMember {
  name: string;
  role: string;
  nationality: string;
  exp: string;
  age: number;
  contact: string;
}

interface Ship {
  id: string;
  name: string;
  type: string;
  flag: string;
  lat: number;
  lon: number;
  status: 'underway' | 'anchored' | 'in-port';
  speed: number;
  heading: number;
  destination: string;
  eta: string;
  cargo: string;
  crew: CrewMember[];
}

/* ── Data ───────────────────────────────────────────────── */
const SHIPS: Ship[] = [
  {
    id: 'MV-AURORA-7', name: 'MV Aurora', type: 'Container Vessel', flag: 'Panama',
    lat: 35.6, lon: 139.6, status: 'underway', speed: 18.4, heading: 247,
    destination: 'Singapore', eta: '2026-05-22 14:30Z', cargo: 'Electronics / 4,200 TEU',
    crew: [
      { name: 'Captain Hiroshi Tanaka', role: 'Master', nationality: 'Japan', exp: '22 yrs', age: 54, contact: 'tanaka@mv-aurora.mar' },
      { name: 'Elena Vostrikova', role: 'Chief Officer', nationality: 'Russia', exp: '14 yrs', age: 41, contact: 'e.vostrikova@mv-aurora.mar' },
      { name: 'Marco Bianchi', role: 'Chief Engineer', nationality: 'Italy', exp: '18 yrs', age: 47, contact: 'm.bianchi@mv-aurora.mar' },
      { name: 'Priya Raman', role: 'Second Officer', nationality: 'India', exp: '8 yrs', age: 32, contact: 'p.raman@mv-aurora.mar' },
      { name: 'Kwame Asante', role: 'Bosun', nationality: 'Ghana', exp: '11 yrs', age: 38, contact: 'k.asante@mv-aurora.mar' },
    ],
  },
  {
    id: 'BC-NORTHWIND-3', name: 'BC Northwind', type: 'Bulk Carrier', flag: 'Norway',
    lat: 60.4, lon: 5.3, status: 'anchored', speed: 0.2, heading: 0,
    destination: 'Rotterdam', eta: '2026-05-20 09:00Z', cargo: 'Iron Ore / 82,000 DWT',
    crew: [
      { name: 'Captain Lars Eriksen', role: 'Master', nationality: 'Norway', exp: '26 yrs', age: 58, contact: 'l.eriksen@northwind.mar' },
      { name: 'Sofia Lindqvist', role: 'Chief Officer', nationality: 'Sweden', exp: '12 yrs', age: 39, contact: 's.lindqvist@northwind.mar' },
      { name: 'Diego Fernandez', role: 'Chief Engineer', nationality: 'Spain', exp: '20 yrs', age: 51, contact: 'd.fernandez@northwind.mar' },
      { name: 'Yuki Sato', role: 'Radio Officer', nationality: 'Japan', exp: '9 yrs', age: 34, contact: 'y.sato@northwind.mar' },
    ],
  },
  {
    id: 'TK-SEAHORSE-12', name: 'TK Seahorse', type: 'Oil Tanker', flag: 'Liberia',
    lat: 25.3, lon: 55.3, status: 'underway', speed: 14.1, heading: 102,
    destination: 'Mumbai', eta: '2026-05-21 22:15Z', cargo: 'Crude Oil / 320,000 DWT',
    crew: [
      { name: 'Captain Ahmed Al-Rashid', role: 'Master', nationality: 'UAE', exp: '24 yrs', age: 55, contact: 'a.alrashid@seahorse.mar' },
      { name: "James O'Connor", role: 'Chief Officer', nationality: 'Ireland', exp: '15 yrs', age: 42, contact: 'j.oconnor@seahorse.mar' },
      { name: 'Wei Zhang', role: 'Chief Engineer', nationality: 'China', exp: '19 yrs', age: 48, contact: 'w.zhang@seahorse.mar' },
      { name: 'Catalina Reyes', role: 'Second Officer', nationality: 'Philippines', exp: '7 yrs', age: 30, contact: 'c.reyes@seahorse.mar' },
      { name: 'Hassan Mwangi', role: 'Pumpman', nationality: 'Kenya', exp: '10 yrs', age: 36, contact: 'h.mwangi@seahorse.mar' },
      { name: 'Anders Holm', role: 'Third Officer', nationality: 'Denmark', exp: '5 yrs', age: 28, contact: 'a.holm@seahorse.mar' },
    ],
  },
  {
    id: 'CV-MERIDIAN-9', name: 'CV Meridian', type: 'Cruise Vessel', flag: 'Bahamas',
    lat: 25.7, lon: -80.2, status: 'in-port', speed: 0, heading: 0,
    destination: 'Cozumel', eta: '2026-05-19 07:00Z', cargo: '3,840 passengers',
    crew: [
      { name: 'Captain Marcus Thornton', role: 'Master', nationality: 'UK', exp: '28 yrs', age: 59, contact: 'm.thornton@meridian.mar' },
      { name: 'Isabella Costa', role: 'Staff Captain', nationality: 'Brazil', exp: '16 yrs', age: 44, contact: 'i.costa@meridian.mar' },
      { name: 'Henrik Pedersen', role: 'Chief Engineer', nationality: 'Denmark', exp: '21 yrs', age: 52, contact: 'h.pedersen@meridian.mar' },
      { name: 'Amélie Dubois', role: 'Hotel Director', nationality: 'France', exp: '13 yrs', age: 41, contact: 'a.dubois@meridian.mar' },
      { name: 'Olu Adebayo', role: 'Security Officer', nationality: 'Nigeria', exp: '11 yrs', age: 37, contact: 'o.adebayo@meridian.mar' },
    ],
  },
  {
    id: 'RV-POLARIS-2', name: 'RV Polaris', type: 'Research Vessel', flag: 'Iceland',
    lat: -54.8, lon: -68.3, status: 'underway', speed: 9.7, heading: 180,
    destination: 'Antarctic Peninsula', eta: '2026-05-23 16:45Z', cargo: 'Scientific Equipment',
    crew: [
      { name: 'Captain Gunnar Sigurdsson', role: 'Master', nationality: 'Iceland', exp: '19 yrs', age: 46, contact: 'g.sigurdsson@polaris.mar' },
      { name: 'Dr. Mei Lin Chen', role: 'Chief Scientist', nationality: 'Taiwan', exp: '15 yrs', age: 43, contact: 'm.chen@polaris.mar' },
      { name: 'Rafael Santos', role: 'Chief Engineer', nationality: 'Portugal', exp: '17 yrs', age: 45, contact: 'r.santos@polaris.mar' },
      { name: 'Ingrid Berg', role: 'Marine Biologist', nationality: 'Sweden', exp: '8 yrs', age: 33, contact: 'i.berg@polaris.mar' },
    ],
  },
  {
    id: 'FT-KESTREL-5', name: 'FT Kestrel', type: 'Fishing Trawler', flag: 'Iceland',
    lat: 64.1, lon: -21.9, status: 'underway', speed: 11.2, heading: 315,
    destination: 'Fishing Grounds', eta: '2026-05-19 04:00Z', cargo: 'Empty / Fishing Op',
    crew: [
      { name: 'Captain Bjørn Hansen', role: 'Master', nationality: 'Iceland', exp: '23 yrs', age: 51, contact: 'b.hansen@kestrel.mar' },
      { name: 'Pavel Novak', role: 'First Mate', nationality: 'Czech Rep.', exp: '12 yrs', age: 38, contact: 'p.novak@kestrel.mar' },
      { name: 'Mikhail Petrov', role: 'Engineer', nationality: 'Russia', exp: '14 yrs', age: 40, contact: 'm.petrov@kestrel.mar' },
    ],
  },
  {
    id: 'CV-LEVIATHAN-4', name: 'CV Leviathan', type: 'Container Vessel', flag: 'Germany',
    lat: -33.9, lon: 18.4, status: 'underway', speed: 21.3, heading: 78,
    destination: 'Hamburg', eta: '2026-05-30 11:20Z', cargo: 'Mixed / 18,000 TEU',
    crew: [
      { name: 'Captain Klaus Werner', role: 'Master', nationality: 'Germany', exp: '25 yrs', age: 56, contact: 'k.werner@leviathan.mar' },
      { name: 'Aisha Mbeki', role: 'Chief Officer', nationality: 'South Africa', exp: '13 yrs', age: 40, contact: 'a.mbeki@leviathan.mar' },
      { name: 'Lars Müller', role: 'Chief Engineer', nationality: 'Germany', exp: '22 yrs', age: 53, contact: 'l.muller@leviathan.mar' },
      { name: 'Carmen Vega', role: 'Second Officer', nationality: 'Mexico', exp: '9 yrs', age: 34, contact: 'c.vega@leviathan.mar' },
      { name: 'Daniel Okafor', role: 'Bosun', nationality: 'Nigeria', exp: '15 yrs', age: 42, contact: 'd.okafor@leviathan.mar' },
    ],
  },
  {
    id: 'OS-TRIDENT-8', name: 'OS Trident', type: 'Offshore Supply', flag: 'UK',
    lat: 56.5, lon: 3.2, status: 'anchored', speed: 0.5, heading: 0,
    destination: 'Aberdeen', eta: '2026-05-19 19:30Z', cargo: 'Drilling Supplies',
    crew: [
      { name: 'Captain William Hartley', role: 'Master', nationality: 'UK', exp: '20 yrs', age: 49, contact: 'w.hartley@trident.mar' },
      { name: "Niamh O'Sullivan", role: 'Chief Officer', nationality: 'Ireland', exp: '10 yrs', age: 35, contact: 'n.osullivan@trident.mar' },
      { name: 'Erik Johansson', role: 'Chief Engineer', nationality: 'Sweden', exp: '16 yrs', age: 44, contact: 'e.johansson@trident.mar' },
    ],
  },
];

/* ── Status theme — aligned with project palette ─────────── */
const STATUS_THEME = {
  underway: { dot: '#22c55e', bg: '#dcfce7', text: '#166534', label: 'Underway',  globe: 0x22c55e },
  anchored: { dot: '#f59e0b', bg: '#fef3c7', text: '#92400e', label: 'Anchored',  globe: 0xf59e0b },
  'in-port':{ dot: '#3b82f6', bg: '#dbeafe', text: '#1e40af', label: 'In Port',   globe: 0x3b82f6 },
} as const;

/* Globe marker colors (THREE hex) keyed by status */
const STATUS_COLORS: Record<Ship['status'], number> = {
  underway:  STATUS_THEME.underway.globe,
  anchored:  STATUS_THEME.anchored.globe,
  'in-port': STATUS_THEME['in-port'].globe,
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

/* ── Small reusable pieces ──────────────────────────────── */
function StatCard({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(15,52,96,0.08)',
      borderRadius: 10,
      padding: '14px 16px',
      boxShadow: '0 1px 2px rgba(15,52,96,0.04)',
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? '#0a2540', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StatusPill({ status }: { status: Ship['status'] }) {
  const t = STATUS_THEME[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 500,
      padding: '2px 8px', borderRadius: 20,
      background: t.bg, color: t.text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, display: 'inline-block' }} />
      {t.label}
    </span>
  );
}

/* ── 3D ship marker ─────────────────────────────────────── */
// Builds a tiny boat: tapered hull (extruded shape), white cabin, and a stack.
// Local axes: +Y = bow / forward, +X = starboard, +Z = up (away from globe).
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

// Orient a marker so its local +Z faces outward from globe center and its local +Y
// points along the ship's heading (0° = north, 90° = east, clockwise from above).
function orientOnGlobe(obj: THREE.Object3D, position: THREE.Vector3, headingDeg: number) {
  const normal = position.clone().normalize();
  const worldUp = new THREE.Vector3(0, 1, 0);
  const east = new THREE.Vector3().crossVectors(worldUp, normal);
  if (east.lengthSq() < 1e-6) east.set(1, 0, 0); // pole fallback
  east.normalize();
  const north = new THREE.Vector3().crossVectors(normal, east).normalize();

  const basis = new THREE.Matrix4().makeBasis(east, north, normal);
  obj.quaternion.setFromRotationMatrix(basis);
  obj.rotateZ(-headingDeg * Math.PI / 180);
}

/* ── Main component ─────────────────────────────────────── */
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
  const [time, setTime] = useState<Date | null>(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function onResize() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) { setLeftOpen(false); setRightOpen(false); }
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  /* ── Three.js setup ─────────────────────────────────── */
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

    /* Canvas texture */
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgb(96,197,238)';
    ctx.fillRect(0, 0, 2048, 1024);

    /* Grid lines */
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

    /* Landmasses — light grey/white on light blue ocean */
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

    /* Markers */
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
      // Tag every sub-mesh so recursive raycasting resolves to the parent ship.
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


    /* Pointer handlers */
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

    // Minimum camera Z to keep the globe fully in view for a given aspect ratio.
    // Three.js uses a vertical FOV (45°), so on portrait/narrow viewports the globe
    // clips horizontally. Formula: minZ = globeRadius * padding / (tan(FOV/2) * aspect)
    // which simplifies to ~5 / aspect, floored at 5 so landscape never zooms too close.
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

    /* Animation loop */
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
      // Push camera back on narrow viewports so globe stays fully visible
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

  const stats = useMemo(() => ({
    total: SHIPS.length,
    underway: SHIPS.filter(s => s.status === 'underway').length,
    anchored: SHIPS.filter(s => s.status === 'anchored').length,
    inPort: SHIPS.filter(s => s.status === 'in-port').length,
    totalCrew: SHIPS.reduce((acc, s) => acc + s.crew.length, 0),
  }), []);

  const hoveredShipData = hoveredShip ? SHIPS.find(s => s.id === hoveredShip) : null;
  const utcTime = time ? time.toISOString().split('T')[1].split('.')[0] + ' UTC' : null;

  /* ── Render ─────────────────────────────────────────── */
  return (
    <>
      <style>{`
        .sm-ship-item:hover { background: #f8fafc !important; }
        .sm-crew-card:hover  { background: #f8fafc !important; }
        .sm-toggle-btn:hover { color: #0a2540 !important; background: #fff !important; box-shadow: 0 2px 8px rgba(15,52,96,0.12) !important; }
        @keyframes sm-live { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes sm-fadein { from{opacity:0} to{opacity:1} }
        @keyframes sm-slideup { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      {/* Globe fills the entire space; panels float on top */}
      <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>

        {/* Globe canvas */}
        <div ref={mountRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />

   

        {/* Hover tooltip */}
        {hoveredShipData && (
          <div style={{
            position: 'absolute', top: '50%', left: leftOpen ? 280 : 16, transform: 'translateY(-50%)',
            background: '#fff', border: '1px solid rgba(15,52,96,0.12)', borderRadius: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: '10px 14px',
            pointerEvents: 'none', animation: 'sm-fadein 0.15s ease', minWidth: 160,
            transition: 'left 0.25s ease',
          }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2, letterSpacing: '0.04em' }}>{hoveredShipData.id}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0a2540', marginBottom: 4 }}>{hoveredShipData.name}</div>
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 8 }}>{hoveredShipData.type}</div>
            <StatusPill status={hoveredShipData.status} />
            <div style={{ fontSize: 10, color: '#2e7cc4', marginTop: 8, fontWeight: 500 }}>Click to inspect →</div>
          </div>
        )}

        {/* ── Backdrops (mobile only) ── */}
        {isMobile && leftOpen && (
          <div onClick={() => setLeftOpen(false)} style={{ position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', zIndex: 39 }} />
        )}
        {isMobile && rightOpen && (
          <div onClick={() => setRightOpen(false)} style={{ position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', zIndex: 39 }} />
        )}

        {/* ── Toggle buttons ── */}
        <button
          className="sm-toggle-btn"
          onClick={() => { setLeftOpen(v => !v); setRightOpen(false); }}
          style={{
            position: 'absolute', top: 16,
            left: !isMobile && leftOpen ? 272 : 16,
            transition: 'left 0.25s ease',
            display: 'flex', alignItems: 'center', gap: 6,
            background: leftOpen ? '#0a2540' : 'rgba(255,255,255,0.92)',
            color: leftOpen ? '#fff' : '#0a2540',
            border: '1px solid rgba(15,52,96,0.12)',
            borderRadius: 8, padding: '7px 12px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(15,52,96,0.10)',
            backdropFilter: 'blur(6px)',
            zIndex: 20,
          }}
        >
          <IconAnchor size={13} />
          Fleet Overview
        </button>

        <button
          className="sm-toggle-btn"
          onClick={() => { setRightOpen(v => !v); setLeftOpen(false); }}
          style={{
            position: 'absolute', top: 16,
            right: !isMobile && rightOpen ? 312 : 16,
            transition: 'right 0.25s ease',
            display: 'flex', alignItems: 'center', gap: 6,
            background: rightOpen ? '#0a2540' : 'rgba(255,255,255,0.92)',
            color: rightOpen ? '#fff' : '#0a2540',
            border: '1px solid rgba(15,52,96,0.12)',
            borderRadius: 8, padding: '7px 12px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(15,52,96,0.10)',
            backdropFilter: 'blur(6px)',
            zIndex: 20,
          }}
        >
          <IconShip size={13} />
          Active Vessels
        </button>

        {/* ── LEFT panel — Fleet Overview ── */}
        <aside style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? 56 : 0, left: 0, bottom: 0,
          width: isMobile ? '100vw' : 264,
          transform: leftOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          background: '#fff',
          borderRight: isMobile ? 'none' : '1px solid rgba(15,52,96,0.10)',
          boxShadow: '4px 0 20px rgba(15,52,96,0.08)',
          display: 'flex', flexDirection: 'column',
          zIndex: isMobile ? 40 : 20,
        }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(15,52,96,0.06)', flexShrink: 0 }}>
           
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0a2540' }}>Fleet Overview</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#64748b' }}>{utcTime ?? '––:––:––'}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 500, background: '#dcfce7', color: '#166534',
                  padding: '2px 7px', borderRadius: 20,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'sm-live 2s infinite' }} />
                  Live
                </span>
                {isMobile && <button onClick={() => setLeftOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 10, display: 'flex', marginLeft: 'auto' }}>
                    <IconX size={18} />
                </button>}
              </div>
            </div>
            
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <StatCard value={stats.total}    label="Vessels"  />
              <StatCard value={stats.underway}  label="Underway" color="#16a34a" />
              <StatCard value={stats.anchored}  label="Anchored" color="#d97706" />
              <StatCard value={stats.inPort}    label="In Port"  color="#2563eb" />
            </div>
            <StatCard value={stats.totalCrew} label="Total crew aboard" />

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>System Status</p>
              <div style={{ background: '#fff', border: '1px solid rgba(15,52,96,0.08)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,52,96,0.04)' }}>
                {[
                  { icon: IconSatellite, label: 'Satellite',    status: 'Online'  },
                  { icon: IconWifi,      label: 'AIS Uplink',   status: 'Active'  },
                  { icon: IconCloudRain, label: 'Weather Feed', status: 'Synced'  },
                  { icon: IconLock,      label: 'Encryption',   status: 'AES-256' },
                ].map(({ icon: Icon, label, status }, i, arr) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 13px',
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(15,52,96,0.06)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Icon size={13} style={{ color: '#64748b' }} />
                      <span style={{ fontSize: 12, color: '#334155' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#16a34a' }}>{status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Vessel Status</p>
              <div style={{ background: '#fff', border: '1px solid rgba(15,52,96,0.08)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,52,96,0.04)' }}>
                {(Object.entries(STATUS_THEME) as [Ship['status'], typeof STATUS_THEME[Ship['status']]][]).map(([key, t], i, arr) => (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px',
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(15,52,96,0.06)' : 'none',
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#334155' }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT panel — Active Vessels ── */}
        <aside style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? 56 : 0, right: 0, bottom: 0,
          width: isMobile ? '100vw' : 296,
          transform: rightOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          background: '#fff',
          borderLeft: isMobile ? 'none' : '1px solid rgba(15,52,96,0.10)',
          boxShadow: '-4px 0 20px rgba(15,52,96,0.08)',
          display: 'flex', flexDirection: 'column',
          zIndex: isMobile ? 40 : 20,
        }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(15,52,96,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <IconShip size={15} style={{ color: '#2e7cc4' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0a2540' }}>Active Vessels</span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 500,
                background: '#eff6ff', color: '#1d4ed8',
                padding: '1px 7px', borderRadius: 20,
              }}>{SHIPS.length}</span>
              {isMobile && <button onClick={() => setRightOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, display: 'flex',  }}>
                <IconX size={18} />
            </button>}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
          
            {SHIPS.map(ship => {
              const isHovered = hoveredShip === ship.id;
              return (
                <div
                  key={ship.id}
                  className="sm-ship-item"
                  onClick={() => setSelectedShip(ship)}
                  style={{
                    padding: '10px 12px', borderRadius: 8,
                    border: `1px solid ${isHovered ? '#bfdbfe' : 'rgba(15,52,96,0.08)'}`,
                    background: isHovered ? '#eff6ff' : '#fff',
                    marginBottom: 6, cursor: 'pointer',
                    transition: 'background 0.12s, border-color 0.12s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '0.04em' }}>{ship.id}</span>
                    <StatusPill status={ship.status} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0a2540' }}>{ship.name}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{ship.type} · {ship.flag}</div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* ── Ship Detail Modal ── */}
      {selectedShip && (
        <div
          onClick={() => setSelectedShip(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(10, 37, 64, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            animation: 'sm-fadein 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              border: '1px solid rgba(15,52,96,0.10)',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              width: '100%', maxWidth: 900, maxHeight: '90vh',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              animation: 'sm-slideup 0.25s ease',
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(15,52,96,0.08)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, letterSpacing: '0.04em' }}>{selectedShip.id}</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0a2540', margin: 0, lineHeight: 1.2 }}>{selectedShip.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: '#475569' }}>{selectedShip.type}</span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>Flag: {selectedShip.flag}</span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <StatusPill status={selectedShip.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedShip(null)}
                style={{
                  background: 'none', border: '1px solid rgba(15,52,96,0.12)',
                  borderRadius: 8, cursor: 'pointer', padding: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748b', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px 24px' }}>

              {/* Voyage stats */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, justifyContent: 'space-between' }}>
                {[
                  { icon: IconNavigation, label: 'Speed',       value: `${selectedShip.speed} kts` },
                  { icon: IconWind,       label: 'Heading',     value: `${String(selectedShip.heading).padStart(3,'0')}°` },
                  { icon: IconMapPin,     label: 'Destination', value: selectedShip.destination },
                  { icon: IconCalendar,   label: 'ETA',         value: selectedShip.eta },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{
                    background: '#f8fafc', border: '1px solid rgba(15,52,96,0.08)',
                    borderRadius: 10, padding: '12px 14px',
                    flex: 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Icon size={13} style={{ color: '#2e7cc4' }} />
                      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0a2540' }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24, justifyContent: 'space-between' }}>
                {[
                  { icon: IconGlobe,    label: 'Coordinates',   value: `${Math.abs(selectedShip.lat).toFixed(2)}° ${selectedShip.lat>=0?'N':'S'} · ${Math.abs(selectedShip.lon).toFixed(2)}° ${selectedShip.lon>=0?'E':'W'}` },
                  { icon: IconBriefcase,label: 'Cargo Manifest', value: selectedShip.cargo },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{
                    background: '#f8fafc', border: '1px solid rgba(15,52,96,0.08)',
                    borderRadius: 10, padding: '12px 14px',
                    flex: 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Icon size={13} style={{ color: '#2e7cc4' }} />
                      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0a2540' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Crew roster */}
              <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconUsers size={15} style={{ color: '#2e7cc4' }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0a2540', margin: 0 }}>Crew Roster</h3>
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  background: '#eff6ff', color: '#1d4ed8',
                  padding: '1px 7px', borderRadius: 20,
                }}>{selectedShip.crew.length} personnel</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(15,52,96,0.08)' }} />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
                {selectedShip.crew.map((member, idx) => {
                  const initials = member.name
                    .split(' ')
                    .filter(p => !['Captain', 'Dr.'].includes(p) && !p.includes('.'))
                    .slice(0, 2)
                    .map(p => p[0])
                    .join('');
                  return (
                    <div
                      key={idx}
                      className="sm-crew-card"
                      style={{
                        background: '#fff',
                        border: '1px solid rgba(15,52,96,0.08)',
                        borderRadius: 10,
                        padding: 14,
                        transition: 'background 0.12s',
                        flex: 1,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #144272 0%, #2e7cc4 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 600, color: '#fff',
                        }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0a2540', lineHeight: 1.3 }}>{member.name}</div>
                          <div style={{ fontSize: 11, color: '#2e7cc4', marginTop: 2, fontWeight: 500 }}>{member.role}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[
                          ['Nationality', member.nationality],
                          ['Age',         String(member.age)],
                          ['Experience',  member.exp],
                          ['Contact',     member.contact],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', gap: 6, fontSize: 11 }}>
                            <span style={{ color: '#94a3b8', minWidth: 72, flexShrink: 0 }}>{k}</span>
                            <span style={{ color: '#334155', wordBreak: 'break-all' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
