export interface ThunderBoss {
  id: number;
  name: string;
  codename: string;
  level: number;
  threatLevel: 'ALPHA' | 'OMEGA' | 'TITAN' | 'NEXUS';
  environment: string;
  weakness: string;
  signatureAttack: string;
  description: string;
  armorRating: string;
  scoreValue: number;
}

export interface ThunderShip {
  id: string;
  name: string;
  role: string;
  speed: number; // 1-100
  armor: number; // 1-100
  firepower: number; // 1-100
  special: string;
  unlockedAt: string;
  description: string;
}

export interface ThunderWeapon {
  id: string;
  name: string;
  type: string;
  dps: string;
  ammo: string;
  description: string;
}

export const THUNDER_SHIPS: ThunderShip[] = [
  {
    id: 'apex-phantom',
    name: 'Apex Phantom 3000',
    role: 'Precision Interceptor',
    speed: 96,
    armor: 72,
    firepower: 88,
    special: 'Chronos Phase Shift',
    unlockedAt: 'Default Starter',
    description: 'Ultra-agile stealth interceptor built with carbon composite chassis and dual plasma vulcan cannons.',
  },
  {
    id: 'titan-dreadnought',
    name: 'Titan Dreadnought VII',
    role: 'Heavy Assault Battleship',
    speed: 64,
    armor: 98,
    firepower: 99,
    special: 'Orbital Ion Cascade',
    unlockedAt: 'Level 10 Clear',
    description: 'Heavily armored siege weapon capable of absorbing extreme kinetic damage while deploying cluster particle beams.',
  },
  {
    id: 'vortex-wraith',
    name: 'Vortex Wraith X',
    role: 'Electronic Warfare & Speed',
    speed: 100,
    armor: 60,
    firepower: 85,
    special: 'EMP Shockwave & Gravity Well',
    unlockedAt: 'Level 18 Clear',
    description: 'Experimental hyper-drive craft utilizing quantum oscillation to teleport through enemy bullet barrages.',
  },
];

export const THUNDER_WEAPONS: ThunderWeapon[] = [
  {
    id: 'molten-vulcan',
    name: 'Molten Vulcan 4-Barrels',
    type: 'Kinetic Ballistic',
    dps: '1,450 DPS',
    ammo: 'Continuous Battery',
    description: 'High rate of fire rotary cannon firing super-heated tungsten slugs.',
  },
  {
    id: 'plasma-laser',
    name: 'Apex Tachyon Beam',
    type: 'Focused Directed Energy',
    dps: '2,200 DPS',
    ammo: 'Thermal Charge',
    description: 'Continuous piercing beam that melts through multiple enemy waves simultaneously.',
  },
  {
    id: 'seeker-swarm',
    name: 'Hydra Micro-Missiles',
    type: 'Guided Smart Munitions',
    dps: '3,100 Burst',
    ammo: 'Salvo Reload',
    description: 'Launches 16 homing micro-projectiles that lock onto boss weak points with 100% accuracy.',
  },
];

export const THUNDER_BOSSES: ThunderBoss[] = [
  {
    id: 1,
    name: 'Vanguard Sentinel',
    codename: 'IRON-01',
    level: 1,
    threatLevel: 'ALPHA',
    environment: 'Orbital Station Alpha',
    weakness: 'Vented Core Reactor',
    signatureAttack: 'Rotary Vulcan Sweep',
    description: 'First line of planetary defense equipped with kinetic pulse cannons and rotating magnetic shields.',
    armorRating: 'MK-I Titanium',
    scoreValue: 15000,
  },
  {
    id: 2,
    name: 'Pyroclast Titan',
    codename: 'MAGMA-02',
    level: 2,
    threatLevel: 'ALPHA',
    environment: 'Volcanic Ash Caldera',
    weakness: 'Cooling Exhaust Ducts',
    signatureAttack: 'Molten Core Eruption',
    description: 'Thermal-powered siege tank floating above lava oceans, launching magma bombs in spiraling patterns.',
    armorRating: 'Obsidian Plating',
    scoreValue: 25000,
  },
  {
    id: 3,
    name: 'Cybernetic Leviathan',
    codename: 'SERPENT-03',
    level: 3,
    threatLevel: 'ALPHA',
    environment: 'Sub-Zero Cloud Ocean',
    weakness: 'Segmented Spinal Joints',
    signatureAttack: 'Frost Beam Constriction',
    description: 'Serpentine bio-mechanical juggernaut weaving between storm clouds at Mach 4.',
    armorRating: 'Cryo-Steel',
    scoreValue: 35000,
  },
  {
    id: 4,
    name: 'Goliath Dread-Mech',
    codename: 'COLOSSUS-04',
    level: 4,
    threatLevel: 'OMEGA',
    environment: 'Neon Megacity Spire',
    weakness: 'Knee Actuators & Shoulder Pods',
    signatureAttack: 'Hyper-Density Railgun',
    description: 'Towering walker striding between skyscraper roofs firing devastating railgun blasts.',
    armorRating: 'Reinforced Composite',
    scoreValue: 50000,
  },
  {
    id: 5,
    name: 'Void Harvester',
    codename: 'NULL-05',
    level: 5,
    threatLevel: 'OMEGA',
    environment: 'Asteroid Graveyard',
    weakness: 'Central Singularity Chamber',
    signatureAttack: 'Graviton Vortex Collapse',
    description: 'Massive mining vessel repurposed for cosmic annihilation, bending light and bullets toward its maw.',
    armorRating: 'Dark Matter Weave',
    scoreValue: 65000,
  },
  {
    id: 6,
    name: 'Tempest Dread-Wing',
    codename: 'STORM-06',
    level: 6,
    threatLevel: 'OMEGA',
    environment: 'Jupiter Atmospheric Trench',
    weakness: 'Wingtip Turbines',
    signatureAttack: 'Chain Lightning Barrage',
    description: 'Supersonic flying fortress that generates its own hurricane force electric storms.',
    armorRating: 'Conductive Gold Alloy',
    scoreValue: 80000,
  },
  {
    id: 7,
    name: 'Apex Overlord 3000',
    codename: 'NEXUS-24',
    level: 24,
    threatLevel: 'NEXUS',
    environment: 'The Dimensional Core',
    weakness: 'Chronos Resonance Matrix',
    signatureAttack: 'Omni-Dimensional Oblivion',
    description: 'The supreme artificial consciousness governing the Thunder Dome. Transcends physical matter with four shifting combat phases.',
    armorRating: 'Quantum Singularity Lattice',
    scoreValue: 500000,
  },
];
