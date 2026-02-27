import type { BiomeId } from "./biomes/types";

export interface CollectibleDef {
  name: string;
  offsetX: number;
  offsetY: number;
  render: (color: string) => React.ReactNode;
}

export const WORLD_COLLECTIBLES: Record<BiomeId, CollectibleDef[]> = {
  ember: [
    {
      name: "Warm Ember", offsetX: 32, offsetY: 20,
      render: (c) => (<><circle r={7} fill={c} opacity={0.35} /><circle r={3} fill={c} /></>),
    },
    {
      name: "Flickering Log", offsetX: 130, offsetY: 12,
      render: (c) => (
        <><rect x={-10} y={-2} width={20} height={4} rx={2} fill={c} transform="rotate(-12)" />
        <rect x={-8} y={0} width={16} height={3.5} rx={1.5} fill={c} transform="rotate(18)" opacity={0.7} /></>
      ),
    },
    {
      name: "Roasted Marshmallow", offsetX: 228, offsetY: 22,
      render: (c) => (<><line x1={0} y1={-2} x2={0} y2={10} stroke={c} strokeWidth={1.5} /><circle cy={-5} r={4} fill={c} /></>),
    },
    {
      name: "Fire Spirit", offsetX: 15, offsetY: 95,
      render: (c) => <path d="M0-10C4-6 7 0 4 6 2 10-2 10-4 6-7 0-4-6 0-10Z" fill={c} />,
    },
    {
      name: "Charcoal Heart", offsetX: 245, offsetY: 100,
      render: (c) => <path d="M0-3C0-7 6-7 6-3 6 0 0 6 0 6S-6 0-6-3C-6-7 0-7 0-3Z" fill={c} />,
    },
    {
      name: "Phoenix Feather", offsetX: 20, offsetY: 168,
      render: (c) => (
        <><ellipse rx={3} ry={10} fill={c} opacity={0.8} transform="rotate(15)" />
        <line x1={0} y1={-10} x2={0} y2={10} stroke={c} strokeWidth={0.8} opacity={0.5} transform="rotate(15)" /></>
      ),
    },
    {
      name: "Kindling Crown", offsetX: 240, offsetY: 175,
      render: (c) => <polygon points="-8,4 -4,-4 0,2 4,-4 8,4" fill={c} />,
    },
    {
      name: "Ash Rose", offsetX: 60, offsetY: 202,
      render: (c) => (
        <><circle cx={-3} cy={-2} r={3.5} fill={c} opacity={0.6} />
        <circle cx={3} cy={-2} r={3.5} fill={c} opacity={0.6} />
        <circle cy={2} r={3.5} fill={c} opacity={0.6} /></>
      ),
    },
    {
      name: "Lava Lamp", offsetX: 130, offsetY: 198,
      render: (c) => (
        <><rect x={-4} y={-8} width={8} height={16} rx={4} fill={c} opacity={0.4} />
        <circle cy={-2} r={2.5} fill={c} />
        <circle cy={4} r={2} fill={c} opacity={0.8} /></>
      ),
    },
    {
      name: "Bonfire Badge", offsetX: 200, offsetY: 205,
      render: (c) => <polygon points="0,-8 2,-3 8,-3 3,1 5,7 0,3 -5,7 -3,1 -8,-3 -2,-3" fill={c} />,
    },
  ],

  fathom: [
    {
      name: "Lantern Fish", offsetX: 38, offsetY: 18,
      render: (c) => (
        <><ellipse rx={7} ry={4} fill={c} />
        <polygon points="7,-3 12,0 7,3" fill={c} opacity={0.7} />
        <circle cx={-3} cy={-1} r={1.2} fill="#0d0d1a" /></>
      ),
    },
    {
      name: "Pearl Clam", offsetX: 135, offsetY: 15,
      render: (c) => (
        <><path d="M-7,0 A7,7 0 0,1 7,0" fill={c} opacity={0.6} />
        <path d="M-7,0 A7,5 0 0,0 7,0" fill={c} opacity={0.4} />
        <circle cy={-2} r={2.5} fill={c} /></>
      ),
    },
    {
      name: "Coral Fragment", offsetX: 222, offsetY: 25,
      render: (c) => (
        <><line x1={0} y1={6} x2={0} y2={-4} stroke={c} strokeWidth={2} strokeLinecap="round" />
        <line x1={0} y1={-1} x2={5} y2={-6} stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        <line x1={0} y1={1} x2={-4} y2={-4} stroke={c} strokeWidth={1.5} strokeLinecap="round" /></>
      ),
    },
    {
      name: "Abyssal Jellyfish", offsetX: 12, offsetY: 100,
      render: (c) => (
        <><path d="M-6,0 A6,5 0 0,1 6,0" fill={c} opacity={0.7} />
        <line x1={-4} y1={0} x2={-5} y2={8} stroke={c} strokeWidth={1} opacity={0.5} />
        <line x1={0} y1={0} x2={0} y2={9} stroke={c} strokeWidth={1} opacity={0.5} />
        <line x1={4} y1={0} x2={5} y2={8} stroke={c} strokeWidth={1} opacity={0.5} /></>
      ),
    },
    {
      name: "Sunken Compass", offsetX: 248, offsetY: 92,
      render: (c) => (
        <><circle r={7} fill="none" stroke={c} strokeWidth={1.5} />
        <line x1={0} y1={-5} x2={0} y2={5} stroke={c} strokeWidth={1} />
        <line x1={-5} y1={0} x2={5} y2={0} stroke={c} strokeWidth={1} />
        <circle r={1.5} fill={c} /></>
      ),
    },
    {
      name: "Bioluminescent Orb", offsetX: 25, offsetY: 175,
      render: (c) => (<><circle r={8} fill={c} opacity={0.2} /><circle r={4} fill={c} opacity={0.6} /></>),
    },
    {
      name: "Trench Map", offsetX: 235, offsetY: 180,
      render: (c) => (
        <><rect x={-7} y={-5} width={14} height={10} rx={1} fill={c} opacity={0.4} />
        <path d="M-4,-2 C-1,2 1,-2 4,1" fill="none" stroke={c} strokeWidth={1.2} /></>
      ),
    },
    {
      name: "Sea Sapphire", offsetX: 68, offsetY: 200,
      render: (c) => <polygon points="0,-7 6,0 0,7 -6,0" fill={c} />,
    },
    {
      name: "Nautilus Shell", offsetX: 130, offsetY: 208,
      render: (c) => <path d="M0,0 C0,-4 4,-6 6,-3 C8,0 6,5 2,5 C-3,5 -6,2 -6,-2 C-6,-7 -2,-9 3,-9" fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" />,
    },
    {
      name: "Deep Current", offsetX: 195, offsetY: 198,
      render: (c) => (
        <><path d="M-8,-3 C-4,-6 4,-1 8,-3" fill="none" stroke={c} strokeWidth={1.3} />
        <path d="M-8,0 C-4,-3 4,2 8,0" fill="none" stroke={c} strokeWidth={1.3} opacity={0.7} />
        <path d="M-8,3 C-4,0 4,5 8,3" fill="none" stroke={c} strokeWidth={1.3} opacity={0.4} /></>
      ),
    },
  ],

  forge: [
    {
      name: "Iron Ingot", offsetX: 30, offsetY: 22,
      render: (c) => <polygon points="-8,4 -5,-4 5,-4 8,4" fill={c} />,
    },
    {
      name: "Bronze Hammer", offsetX: 128, offsetY: 10,
      render: (c) => (
        <><rect x={-1} y={-2} width={2} height={14} rx={0.5} fill={c} opacity={0.7} />
        <rect x={-5} y={-5} width={10} height={5} rx={1} fill={c} /></>
      ),
    },
    {
      name: "Tempered Blade", offsetX: 230, offsetY: 24,
      render: (c) => <polygon points="0,-12 3,4 0,2 -3,4" fill={c} />,
    },
    {
      name: "Spark Shard", offsetX: 18, offsetY: 98,
      render: (c) => <polygon points="0,-6 4,0 0,6 -4,0" fill={c} />,
    },
    {
      name: "Anvil Mark", offsetX: 242, offsetY: 102,
      render: (c) => (
        <><rect x={-8} y={-2} width={16} height={4} rx={0.5} fill={c} />
        <rect x={-5} y={-6} width={10} height={4} rx={0.5} fill={c} opacity={0.8} /></>
      ),
    },
    {
      name: "Molten Ring", offsetX: 22, offsetY: 172,
      render: (c) => <circle r={6} fill="none" stroke={c} strokeWidth={2.5} />,
    },
    {
      name: "Steel Gauntlet", offsetX: 238, offsetY: 178,
      render: (c) => (
        <><rect x={-5} y={-3} width={10} height={10} rx={2} fill={c} opacity={0.8} />
        <rect x={-5} y={-6} width={3} height={5} rx={1} fill={c} opacity={0.6} />
        <rect x={-1} y={-7} width={3} height={5} rx={1} fill={c} opacity={0.6} />
        <rect x={3} y={-6} width={3} height={5} rx={1} fill={c} opacity={0.6} /></>
      ),
    },
    {
      name: "Ember Tongs", offsetX: 58, offsetY: 204,
      render: (c) => (
        <><line x1={-2} y1={-8} x2={-5} y2={6} stroke={c} strokeWidth={2} strokeLinecap="round" />
        <line x1={2} y1={-8} x2={5} y2={6} stroke={c} strokeWidth={2} strokeLinecap="round" /></>
      ),
    },
    {
      name: "Forged Crest", offsetX: 132, offsetY: 200,
      render: (c) => <path d="M0,-8 L7,-3 L6,5 L0,8 L-6,5 L-7,-3 Z" fill={c} opacity={0.8} />,
    },
    {
      name: "Master Key", offsetX: 198, offsetY: 206,
      render: (c) => (
        <><circle cy={-5} r={4} fill="none" stroke={c} strokeWidth={2} />
        <rect x={-1} y={-2} width={2} height={10} rx={0.5} fill={c} />
        <rect x={1} y={5} width={3} height={1.5} fill={c} /></>
      ),
    },
  ],

  flux: [
    {
      name: "Aurora Wisp", offsetX: 34, offsetY: 24,
      render: (c) => <path d="M-8,4 C-4,-4 4,4 8,-4" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" />,
    },
    {
      name: "Polar Ray", offsetX: 132, offsetY: 10,
      render: (c) => (
        <><line x1={0} y1={-8} x2={0} y2={8} stroke={c} strokeWidth={1.5} />
        <circle cy={-8} r={2} fill={c} opacity={0.7} />
        <circle cy={8} r={1.5} fill={c} opacity={0.5} /></>
      ),
    },
    {
      name: "Northern Ribbon", offsetX: 226, offsetY: 20,
      render: (c) => <path d="M-8,-6 C0,-2 0,2 8,6" fill="none" stroke={c} strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />,
    },
    {
      name: "Cosmic Dust", offsetX: 16, offsetY: 102,
      render: (c) => (
        <><circle cx={-4} cy={-3} r={1.5} fill={c} />
        <circle cx={3} cy={-5} r={1} fill={c} opacity={0.8} />
        <circle cx={5} cy={2} r={1.5} fill={c} opacity={0.6} />
        <circle cx={-2} cy={4} r={1} fill={c} opacity={0.7} />
        <circle cx={0} cy={0} r={1.2} fill={c} opacity={0.9} /></>
      ),
    },
    {
      name: "Magnetosphere", offsetX: 244, offsetY: 96,
      render: (c) => (
        <><path d="M-6,-4 A8,6 0 0,1 6,-4" fill="none" stroke={c} strokeWidth={1.5} />
        <path d="M-8,-2 A10,8 0 0,1 8,-2" fill="none" stroke={c} strokeWidth={1.2} opacity={0.5} /></>
      ),
    },
    {
      name: "Solar Wind", offsetX: 18, offsetY: 170,
      render: (c) => (
        <><line x1={-8} y1={-3} x2={8} y2={-3} stroke={c} strokeWidth={1.2} opacity={0.5} />
        <line x1={-6} y1={0} x2={8} y2={0} stroke={c} strokeWidth={1.5} />
        <line x1={-8} y1={3} x2={6} y2={3} stroke={c} strokeWidth={1.2} opacity={0.5} /></>
      ),
    },
    {
      name: "Photon Shard", offsetX: 242, offsetY: 176,
      render: (c) => <polygon points="0,-7 3,0 0,7 -3,0" fill={c} opacity={0.9} />,
    },
    {
      name: "Spectrum Veil", offsetX: 62, offsetY: 200,
      render: (c) => <path d="M-8,4 A10,10 0 0,1 8,4" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" />,
    },
    {
      name: "Ion Trail", offsetX: 130, offsetY: 196,
      render: (c) => (
        <><circle cx={-6} r={1} fill={c} />
        <circle cx={-2} cy={-1} r={1.2} fill={c} opacity={0.8} />
        <circle cx={2} cy={1} r={1.4} fill={c} opacity={0.6} />
        <circle cx={6} r={1.6} fill={c} opacity={0.4} /></>
      ),
    },
    {
      name: "Sky Crown", offsetX: 196, offsetY: 204,
      render: (c) => <polygon points="-8,3 -4,-5 0,0 4,-5 8,3" fill={c} />,
    },
  ],

  prism: [
    {
      name: "Quartz Shard", offsetX: 36, offsetY: 20,
      render: (c) => <polygon points="0,-9 4,-2 3,6 -3,6 -4,-2" fill={c} opacity={0.85} />,
    },
    {
      name: "Rainbow Prism", offsetX: 128, offsetY: 14,
      render: (c) => <polygon points="0,-8 8,6 -8,6" fill={c} opacity={0.75} />,
    },
    {
      name: "Amethyst Cluster", offsetX: 224, offsetY: 22,
      render: (c) => (
        <><polygon points="-4,-2 -2,-8 0,-2" fill={c} opacity={0.9} />
        <polygon points="0,0 2,-7 4,0" fill={c} opacity={0.7} />
        <polygon points="-6,1 -5,-4 -3,1" fill={c} opacity={0.55} /></>
      ),
    },
    {
      name: "Light Fractal", offsetX: 14, offsetY: 105,
      render: (c) => (
        <><line x1={0} y1={6} x2={0} y2={-3} stroke={c} strokeWidth={1.5} />
        <line x1={0} y1={-3} x2={-5} y2={-8} stroke={c} strokeWidth={1.2} />
        <line x1={0} y1={-3} x2={5} y2={-7} stroke={c} strokeWidth={1.2} />
        <line x1={0} y1={1} x2={-4} y2={-2} stroke={c} strokeWidth={1} opacity={0.6} /></>
      ),
    },
    {
      name: "Crystal Seed", offsetX: 246, offsetY: 98,
      render: (c) => <polygon points="0,-6 5,-3 5,3 0,6 -5,3 -5,-3" fill={c} opacity={0.8} />,
    },
    {
      name: "Diamond Dust", offsetX: 20, offsetY: 174,
      render: (c) => (
        <><polygon points="-5,-4 -3,-7 -1,-4 -3,-1" fill={c} opacity={0.8} />
        <polygon points="3,-2 5,-5 7,-2 5,1" fill={c} opacity={0.6} />
        <polygon points="-1,3 1,0 3,3 1,6" fill={c} opacity={0.7} />
        <polygon points="5,4 7,1 9,4 7,7" fill={c} opacity={0.5} /></>
      ),
    },
    {
      name: "Geode Heart", offsetX: 240, offsetY: 180,
      render: (c) => (
        <><circle r={7} fill="none" stroke={c} strokeWidth={1.5} opacity={0.5} />
        <polygon points="0,-3 2,0 0,4 -2,0" fill={c} />
        <polygon points="-3,-1 -1,-3 1,-1" fill={c} opacity={0.6} /></>
      ),
    },
    {
      name: "Refracted Beam", offsetX: 64, offsetY: 202,
      render: (c) => (
        <><line x1={0} y1={6} x2={-6} y2={-6} stroke={c} strokeWidth={1.3} />
        <line x1={0} y1={6} x2={0} y2={-8} stroke={c} strokeWidth={1.3} opacity={0.7} />
        <line x1={0} y1={6} x2={6} y2={-6} stroke={c} strokeWidth={1.3} opacity={0.5} /></>
      ),
    },
    {
      name: "Stalactite Drop", offsetX: 130, offsetY: 200,
      render: (c) => (
        <><polygon points="0,-9 3,-2 -3,-2" fill={c} opacity={0.8} />
        <ellipse cy={3} rx={2.5} ry={3} fill={c} opacity={0.6} /></>
      ),
    },
    {
      name: "Cave Echo", offsetX: 196, offsetY: 206,
      render: (c) => (
        <><path d="M-3,0 A3,3 0 0,1 3,0" fill="none" stroke={c} strokeWidth={1.5} />
        <path d="M-6,0 A6,5 0 0,1 6,0" fill="none" stroke={c} strokeWidth={1.2} opacity={0.6} />
        <path d="M-9,0 A9,7 0 0,1 9,0" fill="none" stroke={c} strokeWidth={1} opacity={0.3} /></>
      ),
    },
  ],

  signal: [
    {
      name: "Radio Pulse", offsetX: 34, offsetY: 22,
      render: (c) => (
        <><path d="M-2,0 A4,4 0 0,1 2,0" fill="none" stroke={c} strokeWidth={1.5} />
        <path d="M-5,2 A7,6 0 0,1 5,2" fill="none" stroke={c} strokeWidth={1.3} opacity={0.6} />
        <path d="M-8,4 A10,8 0 0,1 8,4" fill="none" stroke={c} strokeWidth={1} opacity={0.3} /></>
      ),
    },
    {
      name: "Star Frequency", offsetX: 130, offsetY: 12,
      render: (c) => (
        <><polygon points="0,-6 1.5,-2 6,-2 2.5,1 4,5 0,2.5 -4,5 -2.5,1 -6,-2 -1.5,-2" fill={c} opacity={0.7} />
        <path d="M6,0 C7,-2 9,2 10,0" fill="none" stroke={c} strokeWidth={1} /></>
      ),
    },
    {
      name: "Antenna Spark", offsetX: 226, offsetY: 24,
      render: (c) => (
        <><line x1={0} y1={-8} x2={0} y2={6} stroke={c} strokeWidth={1.5} />
        <line x1={-5} y1={-4} x2={0} y2={-8} stroke={c} strokeWidth={1.2} />
        <line x1={5} y1={-4} x2={0} y2={-8} stroke={c} strokeWidth={1.2} />
        <circle cy={-8} r={1.5} fill={c} /></>
      ),
    },
    {
      name: "Deep Space Echo", offsetX: 16, offsetY: 100,
      render: (c) => (
        <><circle r={3} fill="none" stroke={c} strokeWidth={1.5} />
        <circle r={6} fill="none" stroke={c} strokeWidth={1.2} opacity={0.5} />
        <circle r={9} fill="none" stroke={c} strokeWidth={0.8} opacity={0.25} /></>
      ),
    },
    {
      name: "Binary Message", offsetX: 244, offsetY: 98,
      render: (c) => (
        <><rect x={-7} y={-4} width={3} height={3} fill={c} opacity={0.9} />
        <rect x={-3} y={-4} width={3} height={3} fill={c} opacity={0.4} />
        <rect x={1} y={-4} width={3} height={3} fill={c} opacity={0.9} />
        <rect x={-5} y={0} width={3} height={3} fill={c} opacity={0.4} />
        <rect x={-1} y={0} width={3} height={3} fill={c} opacity={0.9} />
        <rect x={3} y={0} width={3} height={3} fill={c} opacity={0.9} /></>
      ),
    },
    {
      name: "Satellite Ping", offsetX: 22, offsetY: 172,
      render: (c) => (
        <><polygon points="0,-4 6,2 -6,2" fill={c} opacity={0.7} />
        <line x1={-4} y1={2} x2={-6} y2={7} stroke={c} strokeWidth={1} />
        <line x1={4} y1={2} x2={6} y2={7} stroke={c} strokeWidth={1} /></>
      ),
    },
    {
      name: "Nebula Signal", offsetX: 238, offsetY: 178,
      render: (c) => (
        <><circle cx={-2} cy={-1} r={4} fill={c} opacity={0.3} />
        <circle cx={2} cy={1} r={3.5} fill={c} opacity={0.25} />
        <circle r={2} fill={c} opacity={0.5} /></>
      ),
    },
    {
      name: "Cosmic Beacon", offsetX: 60, offsetY: 204,
      render: (c) => (
        <><rect x={-1.5} y={-2} width={3} height={10} fill={c} opacity={0.7} />
        <polygon points="0,-8 -5,-2 5,-2" fill={c} opacity={0.5} /></>
      ),
    },
    {
      name: "Waveform Crystal", offsetX: 130, offsetY: 198,
      render: (c) => <path d="M-8,0 L-5,-5 L-2,3 L1,-6 L4,4 L7,-3 L9,0" fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" />,
    },
    {
      name: "First Contact", offsetX: 198, offsetY: 206,
      render: (c) => (
        <><ellipse rx={8} ry={4} fill="none" stroke={c} strokeWidth={1.5} />
        <circle r={2.5} fill={c} /></>
      ),
    },
  ],
};
