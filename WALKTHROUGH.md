# AEROVERSE — 3D Open-World Vehicle Simulator

A complete, playable, browser-based 3D vehicle simulation engine built with **React**, **Three.js**, **React Three Fiber**, **Zustand**, and **Tailwind CSS**.

---

## 🌟 Overview of Features

### 1. Futuristic Aviation Dashboard & 3D Showroom
- **3D Real-time Vehicle Turntable**: Interactive 3D showroom with studio lighting, metallic reflections, and orbit controls.
- **8 Core Dashboard Options**:
  1. `ENTER WORLD` — Quick launch into the open sandbox world.
  2. `VEHICLE GARAGE` — Switch vehicles, inspect specs, and customize paint & finishes.
  3. `FREE FLIGHT` — Spawn airborne in supersonic fighters or helicopters.
  4. `FREE DRIVE` — Spawn on the asphalt test track in high-performance supercars.
  5. `MISSIONS & TRIALS` — Guided challenges with checkpoints, timers, and gold/silver medals.
  6. `SETTINGS` — Audio volume sliders, graphics presets, camera FOV, speed units, and assists.
  7. `CONTROLS` — Interactive key rebinding with duplicate detection.
  8. `PLAYER PROFILE` — Career log of completed trials, best times, and medals.

---

### 2. Vehicle Classes & Procedural 3D Rigs
- **Fighter Jets**:
  - `F-22 Raptor` (Air Dominance Multirole, Mach 2.25)
  - `F-35A Lightning II` (5th Gen Stealth)
  - `Su-57 Felon` (Super-Maneuverable Interceptor)
  - `SR-91 Aurora` (Hypersonic Scramjet)
  - *Features*: Delta wings, twin canards, canopy glass, cockpit pilot seat & HUD plate, twin afterburner flame cones with dynamic lighting, retractable tricycle landing gear (`G`).
- **Helicopters**:
  - `AH-64D Guardian` (Tandem Cockpit Attack Gunship)
  - `UH-60M Valkyrie` (Tactical Utility Transport)
  - `CH-47F Titan` (Heavy Tandem Rotor Transport)
  - *Features*: Animated spinning 4-blade main rotor, high-speed tail rotor, sensor turret, weapon pylons, tubular landing skids, ground effect cushion, and hover assist (`H`).
- **Cars & Supercars**:
  - `Apex Venom GT` (1244 HP Twin-Turbo Hypercar)
  - `Nebula GT3 Track` (525 HP Track Weapon)
  - `Dakar Apex 4x4` (600 HP All-Terrain Trophy Truck)
  - *Features*: Carbon-fiber front splitter, 4 independently rotating and steering alloy wheels with brake calipers, LED headlights with projected beams, red taillight bar, rear diffuser, active GT wing, and neon underglow.

---

### 3. Distinct Physics Engines
- **Flight Aerodynamics (`FlightPhysics.ts`)**:
  - 6-DOF simulation with Euler/Quaternion integration.
  - Airspeed and dynamic pressure ($q = \frac{1}{2} \rho v^2$).
  - Angle of Attack ($AoA$) lift curve with realistic high-$AoA$ stall drop-off and buffet alerts.
  - Afterburner boost (`Space`) and gear drag modeling.
  - Speed-dependent control surface authority.
- **Helicopter Aerodynamics (`HelicopterPhysics.ts`)**:
  - Main rotor collective thrust (`Shift`/`Ctrl`).
  - Cyclic pitch (tilt forward/back `W`/`S`) and cyclic roll (bank `A`/`D`).
  - Anti-torque tail rotor yaw (`Q`/`E`).
  - Ground effect lift increase when operating $< 8$m above the ground.
  - Hover-Assist auto-stabilization.
- **Car Drivetrain & Dynamics (`CarPhysics.ts`)**:
  - 6-speed automatic transmission with realistic RPM curve (idle 900 RPM to 8500 RPM redline).
  - High-speed steering attenuation for smooth control.
  - Handbrake drift mechanics (`Space`) breaking rear tire lateral grip.
  - Traction Control System (TCS) and Anti-lock Braking (ABS).

---

### 4. Interactive In-Game HUDs
- **Fighter Jet HUD**: Military aviation symbology, artificial horizon & pitch ladder, airspeed tape, altitude tape, heading compass ribbon, G-force meter, throttle/afterburner indicators, stall warning flasher, and gear status.
- **Helicopter HUD**: Tactical crosshair, collective %, rotor RPM %, ground speed, radar altimeter (AGL), vertical speed indicator (VSI), hover assist status.
- **Supercar HUD**: Digital speedometer, curved tachometer with redline indicator, current gear (`P`, `R`, `N`, `1-6`), drift angle readout, G-force ball meter, and TCS status.
- **Navigation Minimap**: Real-time rotating circular radar displaying vehicle heading, runway orientation, and target mission checkpoint blips.

---

### 5. Open-World 3D Map
- **International Airport**: 1.4 km illuminated runway (Runway 09/27) with threshold markings, centerline lights, high-speed taxiways, apron, helipads, control tower with rotating radar dome, and aircraft hangars.
- **City Skyline**: Dense financial district with skyscrapers up to 280m, reflective glass, illuminated windows, and rooftop helipads.
- **Apex Test Track & Highway**: Dedicated looped road circuit with red-and-white apex curbs for sports cars, connected to city highways and overpasses with streetlights.
- **Terrain & Water**: Mountain peaks, canyon corridors, and ocean water body with specular reflections.
- **Atmospheric Lighting**: Dynamic day, sunset, and night cycles with atmospheric fog.

---

### 6. Procedural Web Audio Synthesizer
- 100% client-side synthesized audio with Web Audio API (no external file dependencies).
- Jet turbine whine with variable resonant filter + afterburner rumble.
- Helicopter blade slap ("whop-whop") using an LFO-modulated noise generator.
- Multi-oscillator car engine revving tied to RPM + tire skid screech.
- Futuristic UI clicks, checkpoint chimes, and mission fanfares.

---

### 7. Controls Summary

| Vehicle Class | Controls | Action |
| :--- | :--- | :--- |
| **Common** | `C` | Cycle Camera Mode (Cockpit, Chase, Close, Cinematic, Orbit) |
| | `R` | Reset Vehicle to Spawn |
| | `Escape` | Pause / In-Game Menu |
| **Fighter Jet** | `W` / `S` | Pitch Nose Down / Up |
| | `A` / `D` | Roll Bank Left / Right |
| | `Q` / `E` | Rudder Yaw Left / Right |
| | `Shift` / `Ctrl` | Increase / Decrease Throttle |
| | `Space` | Afterburner Boost |
| | `G` | Toggle Landing Gear |
| **Helicopter** | `W` / `S` | Cyclic Pitch Forward / Back |
| | `A` / `D` | Cyclic Roll Left / Right |
| | `Q` / `E` | Anti-Torque Yaw Left / Right |
| | `Shift` / `Ctrl` | Collective Up (Climb) / Down (Descend) |
| | `H` | Toggle Hover Assist |
| **Cars** | `W` / `S` | Accelerate / Brake & Reverse |
| | `A` / `D` | Steer Left / Right |
| | `Space` | Handbrake Drift |
| | `Shift` | Boost / Nitrous |

---

### 🛫 Jet Takeoff Guide
1. **Spool Up Engine**: Hold `Shift` (or press `W` / hold `Space` for Afterburner) to accelerate down Runway 09.
2. **Rotate at Speed**: As airspeed passes **140–160 KM/H**, pull back on the stick by holding **`S`** (Pitch Nose Up).
3. **Climb**: The wings generate aerodynamic lift, unweighting the wheels and climbing smoothly into the sky.
4. **Gear Retract**: Press **`G`** to retract the landing gear for maximum airspeed and minimum aerodynamic drag.
