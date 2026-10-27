import * as THREE from 'three';

export interface SurfaceHit {
  elevation: number;
  surfaceType: 'runway' | 'taxiway' | 'road' | 'helipad' | 'rooftop' | 'terrain' | 'water';
  isHelipad: boolean;
  friction: number;
}

export interface BuildingCollider {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  height: number;
  hasHelipad: boolean;
  helipadRadius: number;
}

export class CollisionSystem {
  private buildings: BuildingCollider[] = [];

  constructor() {
    this.initWorldColliders();
  }

  private initWorldColliders() {
    // City buildings from City.tsx
    const bDefs = [
      { x: 450, z: -300, w: 60, d: 60, h: 220, hasHelipad: true },
      { x: 550, z: -320, w: 50, d: 50, h: 280, hasHelipad: false },
      { x: 380, z: -380, w: 55, d: 45, h: 170, hasHelipad: false },
      { x: 480, z: -420, w: 65, d: 55, h: 240, hasHelipad: true },
      { x: 580, z: -440, w: 45, d: 60, h: 190, hasHelipad: false },
      { x: 360, z: -220, w: 45, d: 40, h: 120, hasHelipad: false },
      { x: 440, z: -200, w: 50, d: 45, h: 140, hasHelipad: false },
      { x: 530, z: -210, w: 45, d: 50, h: 110, hasHelipad: true },
      { x: 620, z: -230, w: 40, d: 45, h: 90, hasHelipad: false },
      { x: 320, z: -500, w: 45, d: 50, h: 130, hasHelipad: false },
      { x: 410, z: -520, w: 50, d: 55, h: 160, hasHelipad: false },
      { x: 500, z: -530, w: 60, d: 45, h: 200, hasHelipad: true },
      { x: 600, z: -520, w: 45, d: 50, h: 150, hasHelipad: false },
      { x: 400, z: -80, w: 40, d: 40, h: 80, hasHelipad: false },
      { x: 470, z: -90, w: 45, d: 50, h: 100, hasHelipad: false },
      { x: 560, z: -80, w: 40, d: 40, h: 75, hasHelipad: false },
      { x: -500, z: -700, w: 50, d: 50, h: 140, hasHelipad: true }
    ];

    bDefs.forEach((b, i) => {
      this.buildings.push({
        id: `city_bldg_${i}`,
        minX: b.x - b.w / 2,
        maxX: b.x + b.w / 2,
        minZ: b.z - b.d / 2,
        maxZ: b.z + b.d / 2,
        height: b.h,
        hasHelipad: b.hasHelipad,
        helipadRadius: 14
      });
    });

    // Airport Hangars
    [-250, -100, 50].forEach((z, i) => {
      this.buildings.push({
        id: `hangar_${i}`,
        minX: 160 - 32.5,
        maxX: 160 + 32.5,
        minZ: z - 27.5,
        maxZ: z + 27.5,
        height: 20,
        hasHelipad: false,
        helipadRadius: 0
      });
    });

    // Airport Control Tower
    this.buildings.push({
      id: 'control_tower',
      minX: 145 - 12,
      maxX: 145 + 12,
      minZ: -50 - 12,
      maxZ: -50 + 12,
      height: 57,
      hasHelipad: false,
      helipadRadius: 0
    });
  }

  // Mountain definitions for height calculation
  private mountains = [
    { x: -700, z: -1100, radius: 320, height: 280 },
    { x: -300, z: -1250, radius: 380, height: 360 },
    { x: 150, z: -1300, radius: 340, height: 310 },
    { x: 600, z: -1150, radius: 300, height: 250 },
    { x: -950, z: -600, radius: 280, height: 220 },
    { x: -1050, z: -150, radius: 310, height: 260 },
    { x: -900, z: 350, radius: 270, height: 210 },
    { x: -800, z: 750, radius: 250, height: 180 },
    { x: 900, z: -800, radius: 280, height: 240 },
    { x: 1050, z: -300, radius: 320, height: 290 },
    { x: 950, z: 200, radius: 260, height: 200 }
  ];

  public getSurfaceAt(x: number, z: number, currentY: number): SurfaceHit {
    // 1. Check Rooftops & Rooftop Helipads
    for (let i = 0; i < this.buildings.length; i++) {
      const b = this.buildings[i];
      if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
        // If current altitude is above or near the roof height (within 4m drop margin)
        if (currentY >= b.height - 3.5) {
          const centerX = (b.minX + b.maxX) / 2;
          const centerZ = (b.minZ + b.maxZ) / 2;
          const distFromCenter = Math.hypot(x - centerX, z - centerZ);
          const isPadded = b.hasHelipad && distFromCenter <= b.helipadRadius;

          return {
            elevation: b.height + 0.1,
            surfaceType: isPadded ? 'helipad' : 'rooftop',
            isHelipad: isPadded,
            friction: 0.94
          };
        }
      }
    }

    // 2. Ground Helipad on Apron (x: 140, z: 200, r: 14)
    const distGroundHelipad = Math.hypot(x - 140, z - 200);
    if (distGroundHelipad <= 14) {
      return {
        elevation: 0.08,
        surfaceType: 'helipad',
        isHelipad: true,
        friction: 0.96
      };
    }

    // 3. Main Runway 09/27 (x: [-32.5, 32.5], z: [-700, 700])
    if (Math.abs(x) <= 32.5 && Math.abs(z) <= 700) {
      return {
        elevation: 0.05,
        surfaceType: 'runway',
        isHelipad: false,
        friction: 0.997 // Ultra-low rolling friction for takeoff run
      };
    }

    // 4. Parallel Taxiway (x: [57.5, 92.5], z: [-600, 600]) & Apron (x: [90, 190], z: [-100, 300])
    if (x >= 57.5 && x <= 92.5 && Math.abs(z) <= 600) {
      return {
        elevation: 0.04,
        surfaceType: 'taxiway',
        isHelipad: false,
        friction: 0.995
      };
    }
    if (x >= 90 && x <= 190 && z >= -100 && z <= 300) {
      return {
        elevation: 0.03,
        surfaceType: 'taxiway',
        isHelipad: false,
        friction: 0.995
      };
    }

    // 5. Mountain Airstrip (center [-800, 35, -900], length 750, width 45, rotation 0.4)
    const dx = x - (-800);
    const dz = z - (-900);
    const cosAngle = Math.cos(-0.4);
    const sinAngle = Math.sin(-0.4);
    const localX = dx * cosAngle - dz * sinAngle;
    const localZ = dx * sinAngle + dz * cosAngle;
    if (Math.abs(localX) <= 22.5 && Math.abs(localZ) <= 375) {
      return {
        elevation: 35.05,
        surfaceType: 'runway',
        isHelipad: false,
        friction: 0.996
      };
    }

    // 6. Roads & Apex Circuit
    // Highway
    if (x >= 15 && x <= 465 && Math.abs(z - (-150)) <= 12) {
      return { elevation: 0.05, surfaceType: 'road', isHelipad: false, friction: 0.992 };
    }
    if (Math.abs(x - 500) <= 11 && Math.abs(z) <= 300) {
      return { elevation: 0.05, surfaceType: 'road', isHelipad: false, friction: 0.992 };
    }
    // Apex Track Main straight
    if (x >= -400 && x <= -100 && Math.abs(z - 300) <= 11) {
      return { elevation: 0.05, surfaceType: 'road', isHelipad: false, friction: 0.994 };
    }
    if (Math.abs(x - (-100)) <= 11 && z >= -100 && z <= 300) {
      return { elevation: 0.05, surfaceType: 'road', isHelipad: false, friction: 0.994 };
    }
    if (x >= -410 && x <= -90 && Math.abs(z - (-200)) <= 11) {
      return { elevation: 0.05, surfaceType: 'road', isHelipad: false, friction: 0.994 };
    }
    if (Math.abs(x - (-400)) <= 11 && z >= -210 && z <= 10) {
      return { elevation: 0.05, surfaceType: 'road', isHelipad: false, friction: 0.994 };
    }

    // 7. Mountain Terrain Elevation
    let terrainElev = 0;
    for (let i = 0; i < this.mountains.length; i++) {
      const m = this.mountains[i];
      const dist = Math.hypot(x - m.x, z - m.z);
      if (dist < m.radius) {
        const h = m.height * (1.0 - dist / m.radius);
        if (h > terrainElev) terrainElev = h;
      }
    }

    if (terrainElev > 0.1) {
      return {
        elevation: terrainElev,
        surfaceType: 'terrain',
        isHelipad: false,
        friction: 0.96
      };
    }

    // 8. Ocean & Flat Ground Base
    if (Math.abs(x) > 2250 || Math.abs(z) > 2250) {
      return {
        elevation: -0.6,
        surfaceType: 'water',
        isHelipad: false,
        friction: 0.8
      };
    }

    return {
      elevation: 0.0,
      surfaceType: 'terrain',
      isHelipad: false,
      friction: 0.985
    };
  }

  /**
   * Resolves horizontal AABB collisions with buildings.
   * If penetrating a solid building below its roof, pushes position out and attenuates velocity.
   */
  public resolveBuildingCollision(pos: THREE.Vector3, vel: THREE.Vector3, radius: number): boolean {
    let collided = false;
    for (let i = 0; i < this.buildings.length; i++) {
      const b = this.buildings[i];
      // Only collide laterally if below roof height
      if (pos.y < b.height - 0.5 && pos.y + radius >= 0) {
        const expandedMinX = b.minX - radius;
        const expandedMaxX = b.maxX + radius;
        const expandedMinZ = b.minZ - radius;
        const expandedMaxZ = b.maxZ + radius;

        if (pos.x >= expandedMinX && pos.x <= expandedMaxX && pos.z >= expandedMinZ && pos.z <= expandedMaxZ) {
          // Inside expanded bounding box: find shortest exit penetration
          const dLeft = pos.x - expandedMinX;
          const dRight = expandedMaxX - pos.x;
          const dBack = pos.z - expandedMinZ;
          const dFront = expandedMaxZ - pos.z;
          const minPen = Math.min(dLeft, dRight, dBack, dFront);

          if (minPen === dLeft) {
            pos.x = expandedMinX;
            if (vel.x > 0) vel.x = -vel.x * 0.2;
          } else if (minPen === dRight) {
            pos.x = expandedMaxX;
            if (vel.x < 0) vel.x = -vel.x * 0.2;
          } else if (minPen === dBack) {
            pos.z = expandedMinZ;
            if (vel.z > 0) vel.z = -vel.z * 0.2;
          } else {
            pos.z = expandedMaxZ;
            if (vel.z < 0) vel.z = -vel.z * 0.2;
          }
          collided = true;
        }
      }
    }
    return collided;
  }
}

export const collisionSystem = new CollisionSystem();
