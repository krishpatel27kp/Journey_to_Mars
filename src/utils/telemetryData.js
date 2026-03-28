/**
 * Telemetry data constants used across the mission HUD.
 */

export const MISSION_DATA = {
  name: 'ARES-1',
  crew: 6,
  destination: 'MARS',
  distanceKm: 225000000,
  transitDays: 253,
  launchSite: 'Kennedy Space Center, FL',
  launchCoords: '28.5°N, 80.6°W',
  vehicle: 'SpaceX Starship',
  signalDelay: '12 min 32 sec',
  solLength: '24h 39m 35s',
  marsGravity: '3.72 m/s²',
  marsGravityPercent: '38% of Earth',
  avgTemp: '−63°C',
};

export const SECTION_NAMES = [
  { id: 1, code: '01', name: 'T-MINUS ZERO', sol: '000' },
  { id: 2, code: '02', name: 'THE VOID', sol: '000' },
  { id: 3, code: '03', name: 'RED HORIZON', sol: '253' },
  { id: 4, code: '04', name: '7 MIN OF TERROR', sol: '253' },
  { id: 5, code: '05', name: 'SOL 1', sol: '254' },
];

export const TELEMETRY_ITEMS = [
  { label: 'MISSION', value: 'ARES-1' },
  { label: 'CREW', value: '6' },
  { label: 'DESTINATION', value: 'MARS' },
  { label: 'DISTANCE', value: '225M KM' },
  { label: 'VEHICLE', value: 'STARSHIP' },
  { label: 'TRANSIT', value: '253 DAYS' },
  { label: 'LAUNCH WINDOW', value: 'T-MINUS 00:00:03' },
  { label: 'LAUNCH SITE', value: 'KSC, FL' },
  { label: 'SIGNAL DELAY', value: '12M 32S' },
];

export const LANDING_ZONES = [
  {
    name: 'Jezero Crater',
    coords: '18.4°N, 77.7°E',
    position: { top: '38%', left: '58%' },
    facts: [
      'Ancient river delta — once held a lake billions of years ago.',
      'Primary landing zone for ARES-1 mission due to accessible terrain.',
      'Rich in carbonate minerals — potential biosignature repository.',
    ],
  },
  {
    name: 'Hellas Planitia',
    coords: '42.4°S, 70.5°E',
    position: { top: '62%', left: '65%' },
    facts: [
      'Deepest known impact basin on Mars — 7,152m below datum.',
      'Atmospheric pressure 89% higher than Mars average at floor.',
      'Contains seasonal water-ice clouds and dust devil tracks.',
    ],
  },
  {
    name: 'Olympus Mons',
    coords: '18.65°N, 226.2°E',
    position: { top: '35%', left: '42%' },
    facts: [
      'Tallest volcano in the solar system at 21,900 meters.',
      'Shield volcano spanning 624 km diameter — size of Arizona.',
      'Last erupted approximately 25 million years ago.',
    ],
  },
];

export const BASE_MODULES = [
  {
    name: 'Habitat',
    position: { top: '55%', left: '30%' },
    specs: [
      { label: 'Capacity', value: '6 crew' },
      { label: 'Pressurized Vol', value: '150 m³' },
      { label: 'Radiation Shield', value: 'Regolith + HDPE' },
      { label: 'Life Support', value: 'ISRU O₂ generation' },
    ],
  },
  {
    name: 'Power Array',
    position: { top: '45%', left: '50%' },
    specs: [
      { label: 'Type', value: 'Solar + RTG hybrid' },
      { label: 'Output', value: '40 kW peak' },
      { label: 'Battery Bank', value: '200 kWh Li-ion' },
      { label: 'Dust Mitigation', value: 'Electrostatic cleaning' },
    ],
  },
  {
    name: 'Greenhouse',
    position: { top: '60%', left: '60%' },
    specs: [
      { label: 'Growing Area', value: '80 m²' },
      { label: 'Crops', value: 'Potatoes, Lettuce, Soy' },
      { label: 'Water Source', value: 'Recycled + ice mining' },
      { label: 'Light Cycle', value: '16h grow / 8h rest' },
    ],
  },
  {
    name: 'Comms Tower',
    position: { top: '40%', left: '70%' },
    specs: [
      { label: 'Dish Diameter', value: '3.5 m HGA' },
      { label: 'Frequency', value: 'X-band + Ka-band' },
      { label: 'Data Rate', value: '2 Mbps to Earth' },
      { label: 'Signal Delay', value: '3–22 min (variable)' },
    ],
  },
];

export const MILESTONES = [
  { day: 1, title: 'Launch & TMI Burn', log: 'Trans-Mars injection nominal. Crew vitals stable. Solar arrays deployed.' },
  { day: 47, title: 'Solar Panel Realignment', log: 'Solar panel realignment complete. Crew morale: nominal. First deep space EVA drill.' },
  { day: 130, title: 'Halfway Point', log: 'Midcourse correction burn: 4.2 m/s delta-v. Communication delay now 8 minutes.' },
  { day: 210, title: 'Mars Visual Contact', log: 'Mars visible as disc from navigation cameras. Crew begins landing simulations.' },
  { day: 253, title: 'Mars Orbit Insertion', log: 'MOI burn successful. Orbital period: 1.88 hours. Landing site survey begins.' },
];

export const EDL_PHASES = [
  {
    title: 'Atmospheric Entry',
    stats: 'Entry velocity: 19,000 km/h · Temp: 2,100°C',
    description: 'The spacecraft hits the Martian atmosphere at Mach 25. The heatshield absorbs temperatures that would melt steel. For four minutes, we are a falling meteor.',
    backSpecs: [
      'Heatshield material: PICA-X ablative',
      'G-force: 10-12g for 90 seconds',
      'Blackout duration: 90 seconds',
      'Altitude at entry: 125 km',
    ],
  },
  {
    title: 'Parachute Deploy',
    stats: 'Chute diameter: 21.5m · Speed: 1600→320 km/h',
    description: 'At Mach 1.7, the supersonic parachute deploys — the largest ever sent to another planet. The craft decelerates violently. The heatshield jettisons.',
    backSpecs: [
      'Chute type: Disk-Gap-Band supersonic',
      'Deployment altitude: 11 km',
      'Opening shock: 60,000 lbf',
      'Descent time on chute: 120 seconds',
    ],
  },
  {
    title: 'Powered Descent',
    stats: '8 retrorockets · Final approach at 2.7 m/s',
    description: 'The backshell separates. Eight throttleable engines ignite. Terrain-relative navigation identifies safe ground. We are committed.',
    backSpecs: [
      'Engine type: SuperDraco throttleable',
      'Fuel: MMH / NTO hypergolic',
      'Radar altitude: active below 3.7 km',
      'Hover time: 0 seconds (continuous descent)',
    ],
  },
  {
    title: 'Sky Crane',
    stats: 'Rover mass: 1,025 kg · Nylon bridles: 6.4m',
    description: 'Twenty meters above the surface, the sky crane releases. The rover descends on nylon bridles while the jetpack flies away to crash-land safely.',
    backSpecs: [
      'Bridle count: 3 nylon cords',
      'Descent rate: 0.75 m/s',
      'Flyaway distance: 500m from landing',
      'Touchdown confirmation: UHF relay via orbiter',
    ],
  },
];

export const NARRATIVE_TEXT = {
  section1: 'The air smells of kerosene and ambition. Six humans stand at the threshold of the longest journey in history. In 253 days, if the math holds, we will breathe the thin cold air of another world.',
  section2: 'There is nothing out here. No sound. No resistance. The Sun is just a slightly brighter star. We sleep in shifts and dream of red deserts.',
  section3: 'There it is. Rust and silence. From orbit it looks patient, like it has been waiting. The atmosphere is thin — 1% of Earth\'s. But it is enough.',
  section4: 'Seven minutes. That is all the time we have to go from orbital velocity to a soft landing. Mission control will know if we succeeded or failed 12 minutes after it happens. We land alone.',
  section5: 'Sol 1. The sun rises in the east, smaller than home, cold and pale. The ground crunches underfoot. This is where we start.',
};

export const MISSION_BRIEFING = 'MISSION BRIEFING — ARES-1\n\nYou have been selected for humanity\'s first crewed mission to Mars. The Starship vehicle will depart Kennedy Space Center carrying six astronauts on a 253-day transit to the Red Planet. Your mission: land at Jezero Crater, establish a forward operating base, and begin the search for evidence of ancient microbial life. Mars gravity is 38% of Earth\'s. Average temperature: minus 63 degrees Celsius. Atmospheric pressure: less than 1% of sea level. You will be farther from home than any human being has ever been. Signal delay to Earth: 12 minutes and 32 seconds. For those 12 minutes, every decision is yours alone. Good luck, crew.';
