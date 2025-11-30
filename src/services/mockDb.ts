import { Resource, ResourceType, Tutorial } from '../types';
import { resolvePath } from '../utils/pathUtils';

const RESOURCES_KEY = 'eduhub_resources';
const RESOURCES_VERSION_KEY = 'eduhub_resources_version';
const RESOURCES_VERSION = 'v5'; 
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
    id: '10',
    title: 'ESP32 I2S Sine Example Code (Zip)',
    description: 'Complete Arduino project for generating a sine wave on ESP32 using I2S and MAX98357A.',
    type: ResourceType.CODE,
    url: resolvePath('/media/ESP32_I2S_Sine.zip'),
    tags: ['ESP32', 'I2S', 'Audio', 'Arduino'],
    dateAdded: '2025-11-30',
    isFeatured: true
  },
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
    url: resolvePath('/media/electrosmith-daisy-seed-overview.pdf'),
    tags: ['Datasheet', 'Hardware', 'Daisy'],
    dateAdded: '2025-11-29',
    isFeatured: true
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
    id: '5',
    title: 'Hackaday: Sweet Sweet Oscillator Sounds',
    description: 'Hackaday project write-up with oscillator sounds and schematic reference.',
    type: ResourceType.LINK,
    url: 'https://hackaday.com/?s=Sweet+Sweet+Oscillator',
    tags: ['Oscillator', 'DIY', 'Hackaday'],
    dateAdded: '2025-11-29',
    isFeatured: false
  }
];

const INITIAL_TUTORIALS: Tutorial[] = [
  {
    id: '105',
    title: 'ESP32 I2S Audio: Sine Wave Generator',
    difficulty: 'Intermediate',
    tags: ['ESP32', 'Audio', 'I2S', 'Code'],
    isFeatured: true,
    content: '# ESP32 I2S Sine Wave (MAX98357A)\\n\\nSimple ESP32 DevKit example that outputs a **440 Hz sine wave** over I2S\\nto a MAX98357A I2S DAC/amp module.\\n\\n## Wiring\\n\\n**ESP32 DevKit ↔ MAX98357A**\\n\\n- `GPIO26` → `BCLK` (or `BCK`)\\n- `GPIO25` → `LRC` / `LRCLK` / `WS`\\n- `GPIO22` → `DIN`\\n- `5V`     → `VIN`\\n- `GND`    → `GND`\\n\\nSpeaker:\\n\\n- `SPK+` → speaker +\\n- `SPK-` → speaker −\\n\\nUse a 4–8 Ω speaker; *do not* connect either speaker terminal to GND.\\n\\n## How to use\\n\\n1. Open `ESP32_I2S_Sine.ino` in Arduino IDE (folder name must match).\\n2. Select your ESP32 board (e.g. **ESP32 Dev Module**).\\n3. Flash the sketch.\\n4. You should hear a 440 Hz continuous tone.\\n\\n## Code snippets\\n\\n### I2S pin config\\n\\n```cpp\\n#define I2S_BCLK    26\\n#define I2S_LRCLK   25\\n#define I2S_DOUT    22\\n\\ni2s_pin_config_t pin_config = {\\n  .bck_io_num   = I2S_BCLK,\\n  .ws_io_num    = I2S_LRCLK,\\n  .data_out_num = I2S_DOUT,\\n  .data_in_num  = I2S_PIN_NO_CHANGE\\n};\\n```\\n\\n### Sine table generation\\n\\n```cpp\\n#define TABLE_SIZE 256\\nint16_t sineTable[TABLE_SIZE];\\n\\nvoid buildSineTable() {\\n  for (int i = 0; i < TABLE_SIZE; i++) {\\n    float phase = (2.0f * PI * i) / TABLE_SIZE;\\n    float s = sinf(phase);\\n    sineTable[i] = (int16_t)(s * 28000.0f);\\n  }\\n}\\n```\\n\\n### Streaming the sine wave\\n\\n```cpp\\nconst int frames = 128;\\nint16_t buffer[frames * 2];\\nstatic float phaseIndex = 0.0f;\\n\\nvoid loop() {\\n  float phaseIncrement = (TABLE_SIZE * TONE_FREQUENCY) / (float)SAMPLE_RATE;\\n\\n  for (int i = 0; i < frames; i++) {\\n    if (phaseIndex >= TABLE_SIZE) phaseIndex -= TABLE_SIZE;\\n    int idx = (int)phaseIndex;\\n    int16_t sample = sineTable[idx];\\n    buffer[i * 2 + 0] = sample; // L\\n    buffer[i * 2 + 1] = sample; // R\\n    phaseIndex += phaseIncrement;\\n  }\\n\\n  size_t bytesWritten;\\n  i2s_write(I2S_PORT, buffer, sizeof(buffer), &bytesWritten, portMAX_DELAY);\\n}\\n```\\n\\n## Tweaks\\n\\n- Change `TONE_FREQUENCY` for different notes.\\n- Lower the multiplier in `sineTable[i] = (int16_t)(s * 28000.0f);`\\n  if the output is too loud or clips.\\n'
  },
  {
    id: '101',
    title: 'Building Your First MIDI Controller',
    difficulty: 'Beginner',
    tags: ['MIDI', 'ESP32', 'Hardware'],
    isFeatured: true,
    videoUrl: 'https://www.youtube.com/embed/wL5F9y_bL3o',
    content: '# Building Your First MIDI Controller\n\nLearn how to turn potentiometers and buttons into a USB MIDI device.\n\n## Components\n- ESP32\n- 10k Potentiometers\n- Buttons\n\n## Wiring\n- Pot Center -> GPIO 34\n- Pot Left -> GND\n- Pot Right -> 3.3V\n- Button -> GPIO 14 & GND (Internal Pullup)\n'
  },
  {
    id: '102',
    title: 'Audio Synthesis on Daisy Seed',
    difficulty: 'Advanced',
    tags: ['C++', 'Audio', 'DSP'],
    isFeatured: true,
    videoUrl: 'https://www.youtube.com/embed/GzK-4048Qn4',
    content: '# Audio Synthesis on Daisy\n\nIntroduction to Digital Signal Processing (DSP) on the Daisy Seed platform.\n\n```cpp\nvoid AudioCallback(AudioHandle::InputBuffer in, AudioHandle::OutputBuffer out, size_t size)\n{\n    for (size_t i = 0; i < size; i++)\n    {\n        out[0][i] = osc.Process();\n        out[1][i] = out[0][i];\n    }\n}\n```\n'
  },
  {
    id: '104',
    title: 'ESP32 I2S Audio: Sine & Sequencer',
    difficulty: 'Intermediate',
    tags: ['ESP32', 'Audio', 'I2S', 'C++'],
    isFeatured: true,
    videoUrl: 'https://www.youtube.com/embed/p570_UuL_uM',
    content: '# ESP32 I2S Audio\n\nUsing MAX98357A or PCM5102 DACs.\n\n## Wiring\n- BCLK: GPIO 26\n- LRCK: GPIO 25\n- DIN: GPIO 22\n'
  },
  {
    id: '201',
    title: 'Hardware Basics: Potentiometer & Button',
    difficulty: 'Beginner',
    tags: ['ESP32', 'Hardware', 'Basics'],
    isFeatured: false,
    content: '# Potentiometer & Button\n\n## Reading a Potentiometer\nESP32 ADCs are 12-bit (0-4095).\n\n```cpp\nvoid setup() {\n  Serial.begin(115200);\n}\nvoid loop() {\n  int val = analogRead(34);\n  Serial.println(val);\n  delay(10);\n}\n```\n\n## Reading a Button\nUse internal pullups to avoid external resistors.\n\n```cpp\nvoid setup() {\n  pinMode(14, INPUT_PULLUP);\n}\nvoid loop() {\n  if (digitalRead(14) == LOW) {\n    Serial.println("Pressed!");\n  }\n}\n```\n'
  },
  {
    id: '202',
    title: 'Using Rotary Encoders (EC11)',
    difficulty: 'Intermediate',
    tags: ['ESP32', 'Hardware', 'Encoder'],
    isFeatured: false,
    content: '# Rotary Encoders\n\nEncoders allow infinite rotation. Use the ESP32Encoder library for best performance.\n\n## Wiring\n- CLK -> GPIO 25\n- DT -> GPIO 26\n- SW -> GPIO 27\n\n## Code Example\n```cpp\n#include <ESP32Encoder.h>\nESP32Encoder encoder;\nvoid setup() {\n  encoder.attachHalfQuad(26, 25);\n  encoder.setCount(0);\n}\nvoid loop() {\n  Serial.println(encoder.getCount());\n}\n```\n'
  },
  {
    id: '203',
    title: 'OLED Display (SSD1306)',
    difficulty: 'Intermediate',
    tags: ['ESP32', 'Display', 'I2C'],
    isFeatured: false,
    content: '# 0.96" OLED Display (I2C)\n\nCommonly found as 4-pin modules (VCC, GND, SDA, SCL).\n\n## Wiring\n- SDA -> GPIO 21\n- SCL -> GPIO 22\n- VCC -> 3.3V\n\n## Library\nUse **Adafruit SSD1306** and **Adafruit GFX**.\n\n```cpp\n#include <Adafruit_SSD1306.h>\nAdafruit_SSD1306 display(128, 64, &Wire, -1);\nvoid setup() {\n  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n  display.clearDisplay();\n  display.setTextSize(1);\n  display.setTextColor(WHITE);\n  display.setCursor(0,0);\n  display.println("Hello World");\n  display.display();\n}\n```\n'
  },
  {
    id: '204',
    title: 'ESP32 WiFi & Web Server',
    difficulty: 'Intermediate',
    tags: ['ESP32', 'WiFi', 'IoT'],
    isFeatured: false,
    content: '# ESP32 WiFi Station\n\nConnect your ESP32 to the internet.\n\n```cpp\n#include <WiFi.h>\nconst char* ssid = "NetworkName";\nconst char* password = "Password";\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(ssid, password);\n  while (WiFi.status() != WL_CONNECTED) {\n    delay(500);\n    Serial.print(".");\n  }\n  Serial.println(WiFi.localIP());\n}\n```\n'
  },
  {
    id: '205',
    title: 'Bluetooth (Classic & BLE)',
    difficulty: 'Advanced',
    tags: ['ESP32', 'Bluetooth', 'Wireless'],
    isFeatured: false,
    content: '# Bluetooth Serial\n\nThe easiest way to talk to a phone/PC wirelessly.\n\n```cpp\n#include "BluetoothSerial.h"\nBluetoothSerial SerialBT;\n\nvoid setup() {\n  SerialBT.begin("ESP32_Device");\n}\n\nvoid loop() {\n  if (SerialBT.available()) {\n    Serial.write(SerialBT.read());\n  }\n}\n```\n'
  }
];

export const getResources = (): Resource[] => {
  const stored = localStorage.getItem(RESOURCES_KEY);
  const storedVersion = localStorage.getItem(RESOURCES_VERSION_KEY);
  const needsReset = !stored || storedVersion !== RESOURCES_VERSION;
  if (needsReset) {
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(INITIAL_RESOURCES));
    localStorage.setItem(RESOURCES_VERSION_KEY, RESOURCES_VERSION);
    return INITIAL_RESOURCES;
  }
  return parseJSON<Resource[]>(stored, INITIAL_RESOURCES);
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

export const updateResource = (id: string, updates: Partial<Resource>): void => {
  const current = getResources();
  const updated = current.map(r => (r.id === id ? { ...r, ...updates } : r));
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
};

export const toggleFeaturedResource = (id: string): void => {
  const current = getResources();
  const updated = current.map(r => r.id === id ? { ...r, isFeatured: !r.isFeatured } : r);
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
};

const TUTORIALS_KEY = 'eduhub_tutorials';
const TUTORIALS_VERSION_KEY = 'eduhub_tutorials_version';
const TUTORIALS_VERSION = 'v2';

export const getTutorials = (): Tutorial[] => {
  const stored = localStorage.getItem(TUTORIALS_KEY);
  const storedVersion = localStorage.getItem(TUTORIALS_VERSION_KEY);
  const needsReset = !stored || storedVersion !== TUTORIALS_VERSION;

  if (needsReset) {
    localStorage.setItem(TUTORIALS_KEY, JSON.stringify(INITIAL_TUTORIALS));
    localStorage.setItem(TUTORIALS_VERSION_KEY, TUTORIALS_VERSION);
    return INITIAL_TUTORIALS;
  }
  
  return parseJSON<Tutorial[]>(stored, INITIAL_TUTORIALS);
};

export const addTutorial = (tutorial: Tutorial): void => {
  const current = getTutorials();
  const updated = [tutorial, ...current];
  localStorage.setItem(TUTORIALS_KEY, JSON.stringify(updated));
};

export const updateTutorial = (id: string, updates: Partial<Tutorial>): void => {
  const current = getTutorials();
  const updated = current.map(t => (t.id === id ? { ...t, ...updates } : t));
  localStorage.setItem(TUTORIALS_KEY, JSON.stringify(updated));
};

export const deleteTutorial = (id: string): void => {
  const current = getTutorials();
  const updated = current.filter(t => t.id !== id);
  localStorage.setItem(TUTORIALS_KEY, JSON.stringify(updated));
};

export const toggleFeaturedTutorial = (id: string): void => {
  const current = getTutorials();
  const updated = current.map(t => t.id === id ? { ...t, isFeatured: !t.isFeatured } : t);
  localStorage.setItem(TUTORIALS_KEY, JSON.stringify(updated));
};