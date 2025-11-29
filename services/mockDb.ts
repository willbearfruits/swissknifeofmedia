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
    id: '4',
    title: 'Electro-Smith Daisy Seed – Technical Overview (PDF)',
    description: 'Hardware overview, pin maps, power domains, and peripheral specs for Daisy Seed.',
    type: ResourceType.PDF,
    url: 'media/electrosmith-daisy-seed-overview.pdf',
    tags: ['Datasheet', 'Hardware', 'Daisy'],
    dateAdded: '2025-11-29',
    isFeatured: true
  },
  {
    id: '5',
    title: 'Hackaday: Sweet Sweet Oscillator Sounds',
    description: 'Hackaday project write-up with oscillator sounds and schematic reference.',
    type: ResourceType.LINK,
    url: 'https://hackaday.com/?s=Sweet+Sweet+Oscillator',
    tags: ['Oscillator', 'DIY', 'Hackaday'],
    dateAdded: '2025-11-29',
    isFeatured: false
  },
  {
    id: '6',
    title: 'Home-Wrecker Bazz Fuss Schematic',
    description: 'Classic single-transistor fuzz circuit notes and layout.',
    type: ResourceType.LINK,
    url: 'http://home-wrecker.com/bazz.html',
    tags: ['Fuzz', 'Guitar', 'Schematic'],
    dateAdded: '2025-11-29',
    isFeatured: false
  },
  {
    id: '7',
    title: 'Electrosmash Big Muff Analysis',
    description: 'In-depth analysis of the Big Muff Pi: schematic, stages, frequency plots.',
    type: ResourceType.LINK,
    url: 'https://www.electrosmash.com/big-muff-pi-analysis',
    tags: ['Fuzz', 'Analysis', 'Schematic'],
    dateAdded: '2025-11-29',
    isFeatured: true
  },
  {
    id: '8',
    title: 'LPB-1/LPB-2 Booster Reference',
    description: 'Simple booster schematic and walkthrough.',
    type: ResourceType.LINK,
    url: 'https://www.electrosmash.com/lpb1',
    tags: ['Booster', 'Guitar', 'Schematic'],
    dateAdded: '2025-11-29',
    isFeatured: false
  },
  {
    id: '9',
    title: 'Daisy Kalimba Web Flasher',
    description: 'Web flasher for Daisy (UD/artifacts) used in the Kalimba project.',
    type: ResourceType.LINK,
    url: 'https://willbearfruits.github.io/KarplusStrongMachine/web-flasher/index.html',
    tags: ['Daisy', 'WebUSB', 'Flasher'],
    dateAdded: '2025-11-29',
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
  },
  {
    id: '104',
    title: 'ESP32 WROOM + I2S Audio: Sine, Sequencer, and Drums',
    difficulty: 'Intermediate',
    tags: ['ESP32', 'Audio', 'I2S', 'C++'],
    isFeatured: true,
    content: `# ESP32 WROOM + I2S Audio

Wire the ESP32 to an I2S DAC (e.g., MAX98357A):
- BCLK: GPIO 26 → DAC BCLK
- LRCK/WS: GPIO 25 → DAC L/RCLK
- DIN: GPIO 22 → DAC DIN
- GND → GND, VIN per module (3.3V/5V as allowed)

## Sine Wave (44.1 kHz)
\`\`\`cpp
#include <Arduino.h>
#include "driver/i2s.h"

constexpr int I2S_BCK = 26;
constexpr int I2S_WS  = 25;
constexpr int I2S_DIN = 22;
constexpr float SAMPLE_RATE = 44100.0f;

void setupI2S() {
  i2s_config_t cfg = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = (int)SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
    .communication_format = I2S_COMM_FORMAT_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = 256,
    .use_apll = false,
    .tx_desc_auto_clear = true
  };
  i2s_pin_config_t pins = {
    .bck_io_num = I2S_BCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_DIN,
    .data_in_num = I2S_PIN_NO_CHANGE
  };
  i2s_driver_install(I2S_NUM_0, &cfg, 0, nullptr);
  i2s_set_pin(I2S_NUM_0, &pins);
  i2s_set_sample_rates(I2S_NUM_0, SAMPLE_RATE);
}

void writeStereo(int16_t sample) {
  uint32_t frame = (uint16_t)sample | ((uint32_t)(uint16_t)sample << 16);
  size_t bytes_written;
  i2s_write(I2S_NUM_0, &frame, sizeof(frame), &bytes_written, portMAX_DELAY);
}

void setup() { setupI2S(); }

void loop() {
  static float phase = 0.0f;
  constexpr float freq = 440.0f;
  float inc = 2.0f * PI * freq / SAMPLE_RATE;
  int16_t s = (int16_t)(sin(phase) * 3000);
  writeStereo(s);
  phase += inc;
  if (phase > 2 * PI) phase -= 2 * PI;
}
\`\`\`

## 8-Step Sequencer (frequencies array)
\`\`\`cpp
void loop() {
  static uint8_t step = 0;
  static float phase = 0.0f;
  constexpr float freqs[8] = {220, 247, 262, 294, 330, 349, 392, 440};
  static unsigned long lastStep = 0;
  const unsigned long stepMs = 200; // ~120 BPM

  if (millis() - lastStep > stepMs) { step = (step + 1) % 8; lastStep = millis(); }
  float inc = 2.0f * PI * freqs[step] / SAMPLE_RATE;
  int16_t s = (int16_t)(sin(phase) * 4000);
  writeStereo(s);
  phase += inc;
  if (phase > 2 * PI) phase -= 2 * PI;
}
\`\`\`

## Simple Drums (kick + snare noise burst)
\`\`\`cpp
int16_t noiseSample() { return (int16_t)((esp_random() & 0xFFFF) - 32768) / 8; }

void loop() {
  static unsigned long lastKick = 0, lastSnare = 0;
  const unsigned kickPeriod = 500, snarePeriod = 250;

  if (millis() - lastKick > kickPeriod) lastKick = millis();
  if (millis() - lastSnare > snarePeriod) lastSnare = millis();

  float kickPhase = (millis() - lastKick) / 1000.0f;
  float kickEnv = expf(-kickPhase * 8.0f);
  float kick = sinf(2 * PI * 60 * kickPhase) * kickEnv * 6000;

  float snarePhase = (millis() - lastSnare) / 1000.0f;
  float snareEnv = expf(-snarePhase * 20.0f);
  float snare = noiseSample() * snareEnv;

  int16_t mixed = (int16_t)std::clamp(kick + snare, -30000.0f, 30000.0f);
  writeStereo(mixed);
}
\`\`\`

## Notes
- Use Chrome for Web Serial/USB tools.
- If audio is distorted, lower amplitude or sample rate.
- Provide .bin files for students and flash via WebSerial tools if they don’t have toolchains.
 - Provide .bin files for students and flash via WebSerial tools if they don’t have toolchains.
`
  },
  {
    id: '105',
    title: 'Hackaday Sweet Sweet Oscillator',
    difficulty: 'Beginner',
    tags: ['Oscillator', 'DIY', 'Audio'],
    isFeatured: false,
    content: `# Sweet Sweet Oscillator (Hackaday)

Reference: https://hackaday.com/?s=Sweet+Sweet+Oscillator

What to build:
- Simple audio-rate oscillator; breadboard-friendly.
- Review the Hackaday schematic and parts list; swap values to tune pitch range.
- Add output resistor/cap to tame amplitude for line-level inputs.

Try:
- Add a rate knob (potentiometer) inline with the timing resistor.
- Put two in detuned parallel for richer tone.
- Run through a fuzz (Bazz Fuss or Big Muff style) and then into a filter.`
  },
  {
    id: '106',
    title: 'Bazz Fuss (Home-Wrecker)',
    difficulty: 'Beginner',
    tags: ['Fuzz', 'Guitar', 'DIY'],
    isFeatured: false,
    content: `# Bazz Fuss

Reference: http://home-wrecker.com/bazz.html

Build notes:
- One-transistor fuzz; great starter circuit.
- Use a 100k log pot on output for volume; 10uF output cap to block DC.
- Try different transistors (2N5088, 2N3904) and clipping diodes (LED vs 1N4148).
- Keep leads short; mind polarity on electrolytics.`
  },
  {
    id: '107',
    title: 'Big Muff Analysis (Electrosmash)',
    difficulty: 'Intermediate',
    tags: ['Fuzz', 'Analysis', 'Guitar'],
    isFeatured: true,
    content: `# Big Muff Pi

Reference: https://www.electrosmash.com/big-muff-pi-analysis

Highlights:
- Four gain stages with diode clipping, then a passive tone stack.
- Swap clipping diodes for asymmetry; tweak the tone stack to shift mid scoop.
- Keep input/output caps to taste: larger = more bass.
- Socket parts for quick A/B while listening.`
  },
  {
    id: '108',
    title: 'LPB-1/LPB-2 Booster',
    difficulty: 'Beginner',
    tags: ['Booster', 'Guitar', 'DIY'],
    isFeatured: false,
    content: `# LPB-1/LPB-2 Booster

Reference: https://www.electrosmash.com/lpb1

Build notes:
- Single-transistor booster; great to push amps or pedals.
- Use a 100k log pot at output for level; 1uF–4.7uF output cap to taste.
- Ensure correct transistor pinout; bias near half the supply for headroom.
- Add input pulldown (1M) to reduce pops.`
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
