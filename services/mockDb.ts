import { Resource, ResourceType, Tutorial } from '../types';

const RESOURCES_KEY = 'eduhub_resources';
const parseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to parse localStorage payload', error);
    return fallback;
  }
};

const INITIAL_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Electro-Smith Daisy Pinout',
    description: 'Reference sheet for the Daisy Seed audio development board.',
    type: ResourceType.PDF,
    url: 'https://electro-smith.com/products/daisy-seed',
    tags: ['Audio', 'Synth', 'Hardware'],
    dateAdded: '2023-10-01',
    isFeatured: true
  },
  {
    id: '2',
    title: 'Pure Data (Pd) Vanilla',
    description: 'Visual programming language for multimedia and audio synthesis.',
    type: ResourceType.LINK,
    url: 'https://puredata.info/',
    tags: ['Software', 'Audio', 'Coding'],
    dateAdded: '2023-10-05',
    isFeatured: true
  },
  {
    id: '3',
    title: 'WLED Firmware',
    description: 'A fast and feature-rich implementation of an ESP8266/ESP32 webserver to control NeoPixel (WS2812B) LEDs.',
    type: ResourceType.CODE,
    url: 'https://kno.wled.ge/',
    tags: ['Light Art', 'ESP32', 'Firmware'],
    dateAdded: '2023-10-12',
    isFeatured: false
  }
];

const INITIAL_TUTORIALS: Tutorial[] = [
  {
    id: '101',
    title: 'Building Your First MIDI Controller',
    difficulty: 'Beginner',
    tags: ['MIDI', 'ESP32', 'Hardware'],
    isFeatured: true,
    content: `# Building Your First MIDI Controller\n\nLearn how to turn potentiometers and buttons into a USB MIDI device for Ableton Live or TouchDesigner.\n\n## Components Needed\n1. **ESP32** or **Teensy**\n2. **10k Linear Potentiometers** (B10K)\n3. **Arcade Buttons**\n\n## The Code\nWe will use the standard MIDI library. Connect the center pin of the pot to GPIO 34.`
  },
  {
    id: '102',
    title: 'Audio Synthesis on Daisy Seed',
    difficulty: 'Advanced',
    tags: ['C++', 'Audio', 'DSP'],
    isFeatured: true,
    content: `# Audio Synthesis on Daisy\n\nIntroduction to Digital Signal Processing (DSP) on the Daisy Seed platform.\n\n\`\`\`cpp\nvoid AudioCallback(AudioHandle::InputBuffer in, AudioHandle::OutputBuffer out, size_t size)\n{\n    for (size_t i = 0; i < size; i++)\n    {\n        out[0][i] = osc.Process();\n        out[1][i] = out[0][i];\n    }\n}\n\`\`\`\n`
  },
  {
    id: '103',
    title: 'TouchDesigner & Serial Comms',
    difficulty: 'Intermediate',
    tags: ['TouchDesigner', 'Interactive', 'Visuals'],
    isFeatured: false,
    content: `# Connecting Sensors to Visuals\n\nHow to read serial data from an Arduino/ESP32 inside TouchDesigner to control visual parameters in real-time.`
  }
];

// --- Resources ---

export const getResources = (): Resource[] => {
  const stored = localStorage.getItem(RESOURCES_KEY);
  const parsed = parseJSON<Resource[]>(stored, INITIAL_RESOURCES);
  if (!stored) {
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(parsed));
  }
  return parsed;
};

export const addResource = (resource: Resource): void => {
  const current = getResources();
  const updated = [resource, ...current];
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
};

export const deleteResource = (id: string): void => {
  const current = getResources();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
};

export const toggleFeaturedResource = (id: string): void => {
  const current = getResources();
  const updated = current.map(r => r.id === id ? { ...r, isFeatured: !r.isFeatured } : r);
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
};

// --- Tutorials ---
// For this mock, we aren't saving tutorials to local storage to keep it simple, 
// but we will allow reading.

export const getTutorials = (): Tutorial[] => {
  return INITIAL_TUTORIALS; 
};
