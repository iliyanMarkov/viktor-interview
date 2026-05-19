'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Anchor, Navigation, Radio, Users, Wind, Activity, Signal, X,
  MapPin, Calendar, Briefcase, Phone, Globe2,
} from 'lucide-react';

const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
};

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

const STATUS_COLORS: Record<Ship['status'], string> = {
  underway: '#5eead4',
  anchored: '#fbbf24',
  'in-port': '#f472b6',
};

const STATUS_LABELS: Record<Ship['status'], string> = {
  underway: 'UNDERWAY',
  anchored: 'ANCHORED',
  'in-port': 'IN PORT',
};

const LANDMASSES: [number, number][][] = [
  // North America
  [[-168,65.5],[-164,67],[-156,71],[-148,70.5],[-141,69.5],[-133,69.5],[-128,70],[-115,73],[-105,73],[-95,74],[-85,73],[-78,72],[-75,68],[-78,63],[-82,60],[-77,57],[-69,58],[-65,54],[-60,53],[-55,52],[-52,48],[-58,46],[-63,45],[-66,44],[-70,43],[-71,41],[-74,40],[-75,38],[-76,37],[-78,34],[-81,32],[-81,30],[-80,27],[-82,25],[-83,28],[-87,30],[-89,29],[-94,29],[-97,28],[-97,26],[-100,25],[-105,22],[-107,25],[-110,23],[-115,29],[-117,33],[-121,35],[-122,37],[-124,40],[-124,46],[-122,48],[-125,50],[-131,52],[-135,57],[-141,60],[-150,59],[-153,57],[-158,55],[-163,55],[-166,60],[-168,65.5]],
  // Greenland
  [[-45,83],[-30,83],[-22,80],[-20,76],[-22,70],[-25,65],[-35,60],[-43,60],[-50,64],[-55,68],[-58,72],[-55,77],[-50,80],[-45,83]],
  // Baffin Island
  [[-80,73],[-72,72],[-65,70],[-65,67],[-72,65],[-78,66],[-82,70],[-80,73]],
  // Cuba
  [[-85,22],[-79,22],[-74,20],[-78,20],[-83,21],[-85,22]],
  // Hispaniola
  [[-74,20],[-68,19],[-69,18],[-74,18],[-74,20]],
  // Newfoundland
  [[-59,52],[-53,51],[-53,47],[-58,46],[-59,52]],
  // Vancouver Island
  [[-128,51],[-123,49],[-124,48],[-128,49],[-128,51]],
  // South America
  [[-81,12],[-76,12],[-71,12],[-66,11],[-60,8],[-55,5],[-51,4],[-50,0],[-48,-2],[-44,-3],[-38,-5],[-35,-8],[-37,-12],[-39,-18],[-42,-23],[-48,-28],[-54,-34],[-57,-39],[-62,-40],[-65,-42],[-66,-45],[-68,-50],[-69,-53],[-72,-54],[-74,-50],[-74,-44],[-73,-37],[-72,-30],[-71,-25],[-70,-18],[-72,-14],[-77,-12],[-79,-8],[-81,-5],[-80,-2],[-78,1],[-77,4],[-78,8],[-81,12]],
  // Europe / West Asia coastline (Mediterranean)
  [[-10,36],[-6,36],[-2,36],[3,37],[8,38],[12,38],[15,40],[18,40],[22,40],[23,38],[26,38],[28,37],[30,37],[33,36],[36,36],[36,34],[35,32],[34,30],[32,31],[30,31],[27,31],[24,32],[20,32],[15,32],[11,33],[8,34],[2,35],[-2,35],[-6,35],[-9,33],[-10,36]],
  // Eurasia main
  [[-10,36],[-9,43],[-5,44],[-2,44],[0,46],[2,49],[1,51],[4,52],[8,54],[12,54],[14,55],[15,57],[18,59],[22,60],[24,65],[26,68],[30,70],[35,71],[40,68],[45,66],[50,68],[55,71],[60,72],[68,72],[75,73],[80,73],[90,74],[100,75],[110,76],[120,73],[130,71],[140,72],[150,69],[160,69],[170,68],[178,68],[178,65],[170,64],[160,60],[155,57],[145,57],[140,55],[135,55],[133,52],[140,46],[143,45],[140,40],[135,38],[130,35],[126,35],[122,30],[120,25],[112,21],[108,18],[105,12],[107,10],[110,3],[113,1],[110,-5],[105,-5],[100,2],[97,5],[95,15],[90,22],[86,21],[82,21],[80,15],[77,8],[73,9],[70,21],[68,24],[66,25],[60,25],[57,25],[52,28],[48,30],[45,28],[42,15],[44,12],[51,12],[51,18],[55,22],[57,17],[55,12],[51,4],[48,11],[42,11],[40,5],[40,-2],[43,-12],[40,-15],[35,-20],[32,-26],[28,-33],[22,-34],[18,-34],[15,-30],[12,-20],[14,-15],[12,-10],[14,-5],[10,3],[8,5],[3,6],[-2,5],[-7,7],[-10,8],[-15,12],[-17,17],[-15,21],[-13,27],[-10,30],[-10,36]],
  // British Isles
  [[-8,58],[-6,58],[-3,59],[-2,57],[0,55],[1,53],[-2,51],[-5,50],[-6,52],[-5,55],[-8,58]],
  // Ireland
  [[-10,54],[-7,54],[-6,52],[-10,52],[-10,54]],
  // Iceland
  [[-24,66],[-14,66],[-13,64],[-22,63],[-24,66]],
  // Japan (Honshu)
  [[131,34],[136,35],[140,36],[142,40],[141,42],[136,37],[133,35],[131,34]],
  // Japan (Hokkaido)
  [[140,42],[145,44],[144,45],[140,45],[140,42]],
  // Sri Lanka
  [[80,9],[82,8],[82,6],[80,7],[80,9]],
  // Borneo
  [[109,1],[117,5],[119,1],[117,-3],[112,-3],[109,1]],
  // Sumatra
  [[95,5],[100,4],[105,-2],[103,-5],[97,-1],[95,5]],
  // Java
  [[105,-6],[114,-7],[115,-8],[106,-8],[105,-6]],
  // Sulawesi
  [[119,1],[125,1],[125,-5],[121,-5],[119,1]],
  // New Guinea
  [[131,-1],[141,-2],[151,-6],[150,-10],[141,-9],[134,-8],[131,-4],[131,-1]],
  // Philippines (Luzon)
  [[120,14],[122,18],[122,14],[120,13],[120,14]],
  // Philippines (Mindanao)
  [[122,7],[126,9],[126,6],[123,6],[122,7]],
  // Taiwan
  [[120,22],[122,25],[122,22],[120,22]],
  // Sakhalin
  [[142,46],[144,54],[143,46],[142,46]],
  // Africa
  [[-17,21],[-16,15],[-15,12],[-10,8],[-5,5],[3,6],[8,5],[10,3],[14,-5],[12,-10],[14,-15],[12,-20],[15,-30],[18,-34],[22,-34],[28,-33],[32,-26],[35,-20],[40,-15],[43,-12],[40,-2],[40,5],[42,11],[48,11],[51,4],[55,12],[57,17],[55,22],[51,18],[51,12],[44,12],[42,15],[37,18],[34,22],[30,24],[27,28],[24,31],[20,32],[15,32],[11,33],[8,34],[2,35],[-2,35],[-6,35],[-9,33],[-12,28],[-15,25],[-17,21]],
  // Madagascar
  [[43,-12],[50,-15],[50,-22],[46,-25],[43,-22],[43,-12]],
  // Australia
  [[114,-22],[122,-18],[129,-15],[136,-12],[140,-12],[143,-13],[145,-15],[147,-19],[150,-22],[153,-25],[153,-28],[150,-33],[149,-37],[146,-39],[141,-38],[136,-35],[132,-32],[127,-32],[120,-34],[115,-34],[113,-26],[114,-22]],
  // Tasmania
  [[144,-40],[148,-40],[148,-43],[145,-43],[144,-40]],
  // New Zealand (North)
  [[173,-35],[178,-37],[177,-41],[173,-39],[173,-35]],
  // New Zealand (South)
  [[166,-46],[174,-41],[174,-46],[168,-47],[166,-46]],
  // Antarctica
  [[-180,-65],[-150,-72],[-120,-73],[-90,-72],[-60,-65],[-30,-68],[0,-70],[30,-69],[60,-67],[90,-67],[120,-66],[150,-72],[180,-72],[180,-90],[-180,-90],[-180,-65]],
];

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
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

    ctx.fillStyle = '#0a1f33';
    ctx.fillRect(0, 0, 2048, 1024);

    const oceanGrad = ctx.createRadialGradient(1024, 512, 0, 1024, 512, 1024);
    oceanGrad.addColorStop(0, 'rgba(20, 50, 75, 0.4)');
    oceanGrad.addColorStop(1, 'rgba(5, 13, 24, 0.3)');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    ctx.strokeStyle = 'rgba(94, 234, 212, 0.06)';
    ctx.lineWidth = 1;
    for (let lon = -180; lon <= 180; lon += 15) {
      const x = ((lon + 180) / 360) * 2048;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
    }
    for (let lat = -90; lat <= 90; lat += 15) {
      const y = ((90 - lat) / 180) * 1024;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2048, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(94, 234, 212, 0.18)';
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
      ctx.fillStyle = '#1e5560'; ctx.fill();
      ctx.strokeStyle = '#5eead4'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(125, 211, 192, 0.4)'; ctx.lineWidth = 4; ctx.stroke();
    });

    LANDMASSES.forEach(polygon => {
      ctx.save();
      ctx.beginPath();
      polygon.forEach(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.clip();
      for (let i = 0; i < 600; i++) {
        ctx.fillStyle = `rgba(94, 234, 212, ${0.05 + Math.random() * 0.1})`;
        ctx.fillRect(Math.random() * 2048, Math.random() * 1024, 1.5, 1.5);
      }
      ctx.restore();
    });

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = 8;

    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      emissive: 0x0a1929,
      emissiveIntensity: 0.4,
      shininess: 12,
      specular: 0x1a4a5a,
    });

    const globe = new THREE.Mesh(globeGeo, globeMat);
    globeRef.current = globe;
    scene.add(globe);

    const glowGeo = new THREE.SphereGeometry(globeRadius * 1.08, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: { glowColor: { value: new THREE.Color(0x5eead4) } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity * 0.6;
        }
      `,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    const wireGeo = new THREE.SphereGeometry(globeRadius * 1.002, 32, 16);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, wireframe: true, transparent: true, opacity: 0.06 });
    globe.add(new THREE.Mesh(wireGeo, wireMat));

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xfef3c7, 0.8);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x5eead4, 0.4);
    rimLight.position.set(-5, 0, -3);
    scene.add(rimLight);

    const markerGroup = new THREE.Group();
    markerGroupRef.current = markerGroup;
    globe.add(markerGroup);

    SHIPS.forEach((ship, idx) => {
      const pos = latLonToVector3(ship.lat, ship.lon, globeRadius * 1.015);
      const color = new THREE.Color(STATUS_COLORS[ship.status]);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.04, 0.07, 24),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide }),
      );
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      ring.userData = { isMarker: true, shipId: ship.id, type: 'ring', baseOpacity: 0.4, phase: idx * 0.7 };
      markerGroup.add(ring);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 16, 16),
        new THREE.MeshBasicMaterial({ color }),
      );
      dot.position.copy(pos);
      dot.userData = { isMarker: true, shipId: ship.id, type: 'dot' };
      markerGroup.add(dot);

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.25, 6),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }),
      );
      beam.position.copy(latLonToVector3(ship.lat, ship.lon, globeRadius * 1.14));
      beam.lookAt(0, 0, 0);
      beam.rotateX(Math.PI / 2);
      beam.userData = { isMarker: true, shipId: ship.id, type: 'beam' };
      markerGroup.add(beam);
    });

    const starsGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 30 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 }));
    scene.add(stars);

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
      const intersects = raycasterRef.current.intersectObjects(markerGroup.children, false);
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
      const intersects = raycasterRef.current.intersectObjects(markerGroup.children, false);
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

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.003;
      camera.position.z = Math.max(3.2, Math.min(8, camera.position.z));
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
      stars.rotation.y += 0.0001;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    renderer.domElement.style.cursor = 'grab';

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
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
  const utcTime = time.toISOString().split('T')[1].split('.')[0];

  return (
    <div className="ship-monitor">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Oswald:wght@300;400;500;600&display=swap');

        .ship-monitor {
          font-family: 'JetBrains Mono', monospace;
          background: radial-gradient(ellipse at top, #0d2438 0%, #050d18 50%, #020509 100%);
          color: #cbd5e1;
          height: 100%;
          width: 100%;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .ship-monitor::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(94, 234, 212, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(94, 234, 212, 0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 1;
        }

        .ship-monitor::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
          z-index: 2;
        }

        .sm-header {
          position: relative;
          z-index: 10;
          padding: 14px 32px;
          border-bottom: 1px solid rgba(94, 234, 212, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(5, 13, 24, 0.6);
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }

        .sm-brand { display: flex; align-items: center; gap: 14px; }

        .sm-brand-logo {
          width: 36px; height: 36px;
          border: 1px solid #5eead4;
          display: flex; align-items: center; justify-content: center;
          color: #5eead4; position: relative;
        }

        .sm-brand-logo::before {
          content: '';
          position: absolute; inset: -3px;
          border: 1px solid rgba(94, 234, 212, 0.3);
        }

        .sm-brand-text h2 {
          font-family: 'Oswald', sans-serif;
          font-size: 18px; font-weight: 500;
          letter-spacing: 4px; color: #f1f5f9; line-height: 1;
        }

        .sm-brand-text p {
          font-size: 9px; letter-spacing: 3px; color: #5eead4;
          margin-top: 3px; text-transform: uppercase;
        }

        .sm-header-right { display: flex; gap: 28px; align-items: center; }

        .sm-header-stat { text-align: right; }
        .sm-header-stat .label { font-size: 9px; letter-spacing: 2px; color: #64748b; text-transform: uppercase; }
        .sm-header-stat .value {
          font-family: 'Oswald', sans-serif;
          font-size: 16px; color: #f1f5f9; letter-spacing: 1px; margin-top: 2px;
        }
        .sm-header-stat .value.live {
          color: #5eead4; display: flex; align-items: center; gap: 8px; justify-content: flex-end;
        }

        .sm-live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #5eead4; box-shadow: 0 0 8px #5eead4;
          animation: sm-pulse 2s infinite;
        }

        @keyframes sm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .sm-main {
          position: relative; z-index: 5;
          display: grid;
          grid-template-columns: 260px 1fr 300px;
          flex: 1; min-height: 0;
        }

        @media (max-width: 1100px) {
          .sm-main { grid-template-columns: 1fr; }
          .sm-side { display: none; }
        }

        .sm-side {
          background: rgba(5, 13, 24, 0.5);
          backdrop-filter: blur(8px);
          border-right: 1px solid rgba(94, 234, 212, 0.1);
          padding: 20px; overflow-y: auto;
        }

        .sm-side.right { border-right: none; border-left: 1px solid rgba(94, 234, 212, 0.1); }

        .sm-panel-title {
          font-family: 'Oswald', sans-serif;
          font-size: 11px; letter-spacing: 3px; color: #5eead4;
          text-transform: uppercase;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(94, 234, 212, 0.15);
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }

        .sm-panel-title .corner {
          width: 8px; height: 8px;
          border-left: 1px solid #5eead4; border-top: 1px solid #5eead4;
        }

        .sm-stat-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 8px; margin-bottom: 20px;
        }

        .sm-stat-card {
          padding: 12px 10px;
          background: rgba(94, 234, 212, 0.04);
          border: 1px solid rgba(94, 234, 212, 0.12);
          position: relative;
        }

        .sm-stat-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 6px; height: 6px;
          border-top: 1px solid #5eead4; border-left: 1px solid #5eead4;
        }

        .sm-stat-card .num {
          font-family: 'Oswald', sans-serif;
          font-size: 24px; color: #f1f5f9; line-height: 1;
        }

        .sm-stat-card .lbl {
          font-size: 8px; letter-spacing: 2px; color: #64748b;
          margin-top: 5px; text-transform: uppercase;
        }

        .sm-stat-card.full { grid-column: span 2; }
        .sm-stat-card.full .num { font-size: 20px; }

        .sm-ship-item {
          padding: 10px;
          background: rgba(94, 234, 212, 0.02);
          border: 1px solid rgba(94, 234, 212, 0.08);
          margin-bottom: 6px; cursor: pointer;
          transition: all 0.2s; position: relative;
        }

        .sm-ship-item:hover {
          background: rgba(94, 234, 212, 0.08);
          border-color: rgba(94, 234, 212, 0.3);
          transform: translateX(2px);
        }

        .sm-ship-item.active {
          background: rgba(94, 234, 212, 0.1);
          border-color: #5eead4;
        }

        .sm-ship-item .id-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 4px;
        }

        .sm-ship-item .ship-id { font-size: 9px; letter-spacing: 1.5px; color: #64748b; }

        .sm-status-pill {
          font-size: 8px; letter-spacing: 1.5px;
          padding: 2px 5px; border: 1px solid;
        }

        .sm-ship-item .ship-name {
          font-family: 'Oswald', sans-serif;
          font-size: 14px; color: #f1f5f9; letter-spacing: 1px;
        }

        .sm-ship-item .ship-type { font-size: 9px; color: #94a3b8; margin-top: 2px; }

        .sm-globe-area { position: relative; overflow: hidden; }

        .sm-globe-canvas { width: 100%; height: 100%; touch-action: none; }

        .sm-overlay-tl, .sm-overlay-tr, .sm-overlay-bl, .sm-overlay-br {
          position: absolute;
          font-size: 9px; letter-spacing: 2px;
          color: rgba(94, 234, 212, 0.6);
          pointer-events: none; z-index: 4;
        }

        .sm-overlay-tl { top: 16px; left: 16px; }
        .sm-overlay-tr { top: 16px; right: 16px; text-align: right; }
        .sm-overlay-bl { bottom: 16px; left: 16px; }
        .sm-overlay-br { bottom: 16px; right: 16px; text-align: right; }

        .sm-corner { position: absolute; width: 12px; height: 12px; border: 1px solid rgba(94, 234, 212, 0.5); z-index: 4; pointer-events: none; }
        .sm-corner.tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
        .sm-corner.tr { top: 10px; right: 10px; border-left: none; border-bottom: none; }
        .sm-corner.bl { bottom: 10px; left: 10px; border-right: none; border-top: none; }
        .sm-corner.br { bottom: 10px; right: 10px; border-left: none; border-top: none; }

        .sm-tooltip {
          position: absolute; top: 50%; left: 26px;
          background: rgba(5, 13, 24, 0.95);
          border: 1px solid #5eead4;
          padding: 10px 14px; font-size: 11px; color: #f1f5f9;
          z-index: 5; pointer-events: none; transform: translateY(-50%);
        }

        .sm-tooltip .h-name { font-family: 'Oswald', sans-serif; font-size: 14px; letter-spacing: 1px; color: #5eead4; margin-bottom: 3px; }
        .sm-tooltip .h-id { font-size: 9px; color: #64748b; letter-spacing: 1.5px; }

        .sm-legend {
          position: absolute; top: 50px; right: 16px;
          background: rgba(5, 13, 24, 0.7);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(94, 234, 212, 0.15);
          padding: 10px 12px; z-index: 4;
        }

        .sm-legend-title { font-size: 9px; letter-spacing: 2px; color: #5eead4; margin-bottom: 8px; }

        .sm-legend-item { display: flex; align-items: center; gap: 7px; font-size: 10px; color: #cbd5e1; margin-bottom: 5px; }
        .sm-legend-item:last-child { margin-bottom: 0; }
        .sm-legend-dot { width: 7px; height: 7px; border-radius: 50%; }

        .sm-instructions {
          position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
          font-size: 9px; letter-spacing: 2px; color: rgba(203, 213, 225, 0.5);
          text-transform: uppercase; z-index: 4; pointer-events: none; text-align: center;
          white-space: nowrap;
        }

        /* Modal */
        .sm-backdrop {
          position: fixed; inset: 0;
          background: rgba(2, 5, 9, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: sm-fadeIn 0.2s ease;
        }

        @keyframes sm-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sm-slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .sm-modal {
          background: linear-gradient(180deg, #0a1929 0%, #050d18 100%);
          border: 1px solid #5eead4;
          width: 100%; max-width: 920px; max-height: 90vh;
          overflow-y: auto; position: relative;
          animation: sm-slideUp 0.3s ease;
          box-shadow: 0 0 60px rgba(94, 234, 212, 0.15);
        }

        .sm-modal::before, .sm-modal::after {
          content: ''; position: absolute; width: 22px; height: 22px;
        }
        .sm-modal::before { top: -1px; left: -1px; border-top: 2px solid #5eead4; border-left: 2px solid #5eead4; }
        .sm-modal::after { bottom: -1px; right: -1px; border-bottom: 2px solid #5eead4; border-right: 2px solid #5eead4; }

        .sm-modal-header {
          padding: 22px 28px;
          border-bottom: 1px solid rgba(94, 234, 212, 0.15);
          display: flex; justify-content: space-between; align-items: flex-start;
        }

        .sm-modal-title .vessel-id { font-size: 10px; letter-spacing: 3px; color: #5eead4; margin-bottom: 5px; }
        .sm-modal-title h2 { font-family: 'Oswald', sans-serif; font-size: 28px; font-weight: 500; letter-spacing: 2px; color: #f1f5f9; line-height: 1; }
        .sm-modal-title .vessel-type { font-size: 11px; color: #94a3b8; margin-top: 5px; letter-spacing: 1px; }

        .sm-close-btn {
          background: transparent; border: 1px solid rgba(94, 234, 212, 0.4);
          color: #cbd5e1; padding: 7px; cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .sm-close-btn:hover { border-color: #f472b6; color: #f472b6; }

        .sm-modal-body { padding: 24px 28px; }

        .sm-vessel-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 12px; margin-bottom: 28px;
        }

        @media (max-width: 700px) { .sm-vessel-stats { grid-template-columns: repeat(2, 1fr); } }

        .sm-vessel-stat {
          padding: 12px;
          background: rgba(94, 234, 212, 0.03);
          border: 1px solid rgba(94, 234, 212, 0.1);
          position: relative;
        }

        .sm-vessel-stat .icon { color: #5eead4; margin-bottom: 7px; }
        .sm-vessel-stat .label { font-size: 9px; letter-spacing: 2px; color: #64748b; margin-bottom: 3px; text-transform: uppercase; }
        .sm-vessel-stat .value { font-family: 'Oswald', sans-serif; font-size: 17px; color: #f1f5f9; letter-spacing: 1px; }

        .sm-section-heading {
          font-family: 'Oswald', sans-serif;
          font-size: 13px; letter-spacing: 3px; color: #5eead4;
          text-transform: uppercase;
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 14px; padding-bottom: 9px;
          border-bottom: 1px solid rgba(94, 234, 212, 0.15);
        }

        .sm-section-heading .line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(94, 234, 212, 0.3), transparent); }
        .sm-section-heading .count { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8; letter-spacing: 1px; }

        .sm-crew-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }

        .sm-crew-card {
          background: rgba(94, 234, 212, 0.025);
          border: 1px solid rgba(94, 234, 212, 0.12);
          padding: 14px; position: relative; transition: all 0.2s;
        }

        .sm-crew-card:hover { background: rgba(94, 234, 212, 0.06); border-color: rgba(94, 234, 212, 0.3); }

        .sm-crew-card::before {
          content: ''; position: absolute; top: -1px; left: -1px;
          width: 9px; height: 9px;
          border-top: 1px solid #5eead4; border-left: 1px solid #5eead4;
        }

        .sm-crew-header { display: flex; gap: 10px; margin-bottom: 10px; }

        .sm-crew-avatar {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, rgba(94, 234, 212, 0.2), rgba(94, 234, 212, 0.05));
          border: 1px solid rgba(94, 234, 212, 0.3);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Oswald', sans-serif; font-size: 14px; color: #5eead4;
          letter-spacing: 1px; flex-shrink: 0;
        }

        .sm-crew-info { flex: 1; min-width: 0; }
        .sm-crew-name { font-family: 'Oswald', sans-serif; font-size: 13px; letter-spacing: 1px; color: #f1f5f9; line-height: 1.2; margin-bottom: 3px; }
        .sm-crew-role { font-size: 10px; color: #5eead4; letter-spacing: 1.5px; text-transform: uppercase; }

        .sm-crew-details { display: flex; flex-direction: column; gap: 5px; }
        .sm-crew-detail { display: flex; align-items: center; gap: 7px; font-size: 10px; color: #94a3b8; }
        .sm-crew-detail .key { color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-size: 9px; min-width: 55px; }
        .sm-crew-detail .val { color: #cbd5e1; font-size: 10px; word-break: break-all; }

        .sm-sys-status { font-size: 10px; line-height: 2; color: #94a3b8; }
        .sm-sys-row { display: flex; justify-content: space-between; }
      `}</style>

      {/* Inner header with nautical status info */}
      <header className="sm-header">
        <div className="sm-brand">
          <div className="sm-brand-logo">
            <Anchor size={18} strokeWidth={1.5} />
          </div>
          <div className="sm-brand-text">
            <h2>MARITIME COMMAND</h2>
            <p>Fleet Tracking System · v4.2.1</p>
          </div>
        </div>
        <div className="sm-header-right">
          <div className="sm-header-stat">
            <div className="label">UTC TIME</div>
            <div className="value">{utcTime}</div>
          </div>
          <div className="sm-header-stat">
            <div className="label">SIGNAL STATUS</div>
            <div className="value live"><span className="sm-live-dot" /><span>LIVE</span></div>
          </div>
        </div>
      </header>

      <div className="sm-main">
        {/* LEFT PANEL */}
        <aside className="sm-side">
          <div className="sm-panel-title"><span className="corner" />FLEET OVERVIEW</div>
          <div className="sm-stat-grid">
            <div className="sm-stat-card">
              <div className="num">{stats.total}</div>
              <div className="lbl">VESSELS</div>
            </div>
            <div className="sm-stat-card">
              <div className="num" style={{ color: '#5eead4' }}>{stats.underway}</div>
              <div className="lbl">UNDERWAY</div>
            </div>
            <div className="sm-stat-card">
              <div className="num" style={{ color: '#fbbf24' }}>{stats.anchored}</div>
              <div className="lbl">ANCHORED</div>
            </div>
            <div className="sm-stat-card">
              <div className="num" style={{ color: '#f472b6' }}>{stats.inPort}</div>
              <div className="lbl">IN PORT</div>
            </div>
            <div className="sm-stat-card full">
              <div className="num">{stats.totalCrew}</div>
              <div className="lbl">TOTAL CREW</div>
            </div>
          </div>

          <div className="sm-panel-title"><span className="corner" />SYSTEM STATUS</div>
          <div className="sm-sys-status">
            {[['SATELLITE', 'ONLINE'], ['AIS UPLINK', 'ACTIVE'], ['WEATHER FEED', 'SYNCED'], ['ENCRYPTION', 'AES-256']].map(([k, v]) => (
              <div key={k} className="sm-sys-row">
                <span>{k}</span><span style={{ color: '#5eead4' }}>● {v}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* GLOBE */}
        <div className="sm-globe-area">
          <div className="sm-corner tl" />
          <div className="sm-corner tr" />
          <div className="sm-corner bl" />
          <div className="sm-corner br" />

          <div ref={mountRef} className="sm-globe-canvas" />

          <div className="sm-overlay-tl">
            <div>SECTOR / GLOBAL</div>
            <div style={{ color: '#f1f5f9', fontSize: '11px', marginTop: '4px' }}>LIVE FEED</div>
          </div>
          <div className="sm-overlay-tr">
            <div>RESOLUTION / 4K</div>
            <div style={{ color: '#f1f5f9', fontSize: '11px', marginTop: '4px' }}>STEREOSCOPIC</div>
          </div>
          <div className="sm-overlay-bl">
            <div>PROJ / ORTHOGRAPHIC</div>
            <div style={{ color: '#f1f5f9', fontSize: '11px', marginTop: '4px' }}>WGS-84 DATUM</div>
          </div>
          <div className="sm-overlay-br">
            <div>ZOOM / AUTO</div>
            <div style={{ color: '#f1f5f9', fontSize: '11px', marginTop: '4px' }}>{SHIPS.length} CONTACTS</div>
          </div>

          <div className="sm-legend">
            <div className="sm-legend-title">VESSEL STATUS</div>
            <div className="sm-legend-item">
              <span className="sm-legend-dot" style={{ background: '#5eead4', boxShadow: '0 0 6px #5eead4' }} />
              UNDERWAY
            </div>
            <div className="sm-legend-item">
              <span className="sm-legend-dot" style={{ background: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }} />
              ANCHORED
            </div>
            <div className="sm-legend-item">
              <span className="sm-legend-dot" style={{ background: '#f472b6', boxShadow: '0 0 6px #f472b6' }} />
              IN PORT
            </div>
          </div>

          {hoveredShipData && (
            <div className="sm-tooltip">
              <div className="h-id">{hoveredShipData.id}</div>
              <div className="h-name">{hoveredShipData.name}</div>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>{hoveredShipData.type}</div>
              <div style={{ fontSize: '9px', color: '#5eead4', marginTop: '6px', letterSpacing: '1.5px' }}>▸ CLICK TO INSPECT</div>
            </div>
          )}

          <div className="sm-instructions">DRAG TO ROTATE · SCROLL TO ZOOM · CLICK MARKER FOR DETAILS</div>
        </div>

        {/* RIGHT PANEL */}
        <aside className="sm-side right">
          <div className="sm-panel-title"><span className="corner" />ACTIVE VESSELS</div>
          {SHIPS.map(ship => (
            <div
              key={ship.id}
              className={`sm-ship-item${hoveredShip === ship.id ? ' active' : ''}`}
              onClick={() => setSelectedShip(ship)}
            >
              <div className="id-row">
                <span className="ship-id">{ship.id}</span>
                <span className="sm-status-pill" style={{ color: STATUS_COLORS[ship.status], borderColor: STATUS_COLORS[ship.status] }}>
                  {STATUS_LABELS[ship.status]}
                </span>
              </div>
              <div className="ship-name">{ship.name}</div>
              <div className="ship-type">{ship.type} · {ship.flag}</div>
            </div>
          ))}
        </aside>
      </div>

      {/* SHIP DETAIL MODAL */}
      {selectedShip && (
        <div className="sm-backdrop" onClick={() => setSelectedShip(null)}>
          <div className="sm-modal" onClick={e => e.stopPropagation()}>
            <div className="sm-modal-header">
              <div className="sm-modal-title">
                <div className="vessel-id">▸ VESSEL ID · {selectedShip.id}</div>
                <h2>{selectedShip.name}</h2>
                <div className="vessel-type">
                  {selectedShip.type} · FLAG: {selectedShip.flag} · STATUS:{' '}
                  <span style={{ color: STATUS_COLORS[selectedShip.status] }}>
                    {STATUS_LABELS[selectedShip.status]}
                  </span>
                </div>
              </div>
              <button className="sm-close-btn" onClick={() => setSelectedShip(null)}>
                <X size={15} />
              </button>
            </div>

            <div className="sm-modal-body">
              <div className="sm-vessel-stats">
                <div className="sm-vessel-stat">
                  <div className="icon"><Navigation size={13} /></div>
                  <div className="label">SPEED</div>
                  <div className="value">{selectedShip.speed} <span style={{ fontSize: '10px', color: '#64748b' }}>KTS</span></div>
                </div>
                <div className="sm-vessel-stat">
                  <div className="icon"><Wind size={13} /></div>
                  <div className="label">HEADING</div>
                  <div className="value">{String(selectedShip.heading).padStart(3, '0')}°</div>
                </div>
                <div className="sm-vessel-stat">
                  <div className="icon"><MapPin size={13} /></div>
                  <div className="label">DESTINATION</div>
                  <div className="value" style={{ fontSize: '13px' }}>{selectedShip.destination}</div>
                </div>
                <div className="sm-vessel-stat">
                  <div className="icon"><Calendar size={13} /></div>
                  <div className="label">ETA</div>
                  <div className="value" style={{ fontSize: '11px' }}>{selectedShip.eta}</div>
                </div>
              </div>

              <div className="sm-vessel-stats" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '28px' }}>
                <div className="sm-vessel-stat">
                  <div className="icon"><Globe2 size={13} /></div>
                  <div className="label">COORDINATES</div>
                  <div className="value" style={{ fontSize: '13px' }}>
                    {Math.abs(selectedShip.lat).toFixed(2)}°{selectedShip.lat >= 0 ? 'N' : 'S'} ·{' '}
                    {Math.abs(selectedShip.lon).toFixed(2)}°{selectedShip.lon >= 0 ? 'E' : 'W'}
                  </div>
                </div>
                <div className="sm-vessel-stat">
                  <div className="icon"><Briefcase size={13} /></div>
                  <div className="label">CARGO MANIFEST</div>
                  <div className="value" style={{ fontSize: '13px' }}>{selectedShip.cargo}</div>
                </div>
              </div>

              <div className="sm-section-heading">
                <Users size={15} />
                <span>CREW ROSTER</span>
                <span className="line" />
                <span className="count">{selectedShip.crew.length} PERSONNEL</span>
              </div>

              <div className="sm-crew-grid">
                {selectedShip.crew.map((member, idx) => (
                  <div key={idx} className="sm-crew-card">
                    <div className="sm-crew-header">
                      <div className="sm-crew-avatar">
                        {member.name
                          .split(' ')
                          .filter(p => !p.includes('.') && !['Captain', 'Dr.'].includes(p))
                          .slice(0, 2)
                          .map(p => p[0])
                          .join('')}
                      </div>
                      <div className="sm-crew-info">
                        <div className="sm-crew-name">{member.name}</div>
                        <div className="sm-crew-role">{member.role}</div>
                      </div>
                    </div>
                    <div className="sm-crew-details">
                      <div className="sm-crew-detail"><span className="key">NATION</span><span className="val">{member.nationality}</span></div>
                      <div className="sm-crew-detail"><span className="key">AGE</span><span className="val">{member.age}</span></div>
                      <div className="sm-crew-detail"><span className="key">EXP</span><span className="val">{member.exp}</span></div>
                      <div className="sm-crew-detail"><span className="key">CONTACT</span><span className="val">{member.contact}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
