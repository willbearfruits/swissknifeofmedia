# ESP32 I2S Sine Generator

> "In the beginning, there was the Wave."

This is the "Hello World" of digital audio. Before you build granular synths or spectral delays, you need to prove you can make a sound.

This sketch turns an **ESP32** into a raw audio source, pumping a pure **440 Hz sine wave** over I2S to a **MAX98357A** DAC/Amp.

## ⚡ The Wiring

Connect your ESP32 to the MAX98357A. Don't cross the streams.

| ESP32 Pin | MAX98357A Pin | Description |
|-----------|---------------|-------------|
| **GPIO 26** | **BCLK** | Bit Clock |
| **GPIO 25** | **LRC** / WS | Word Select (L/R Clock) |
| **GPIO 22** | **DIN** | Data In |
| **5V / VIN** | **VIN** | Power |
| **GND** | **GND** | Ground |

**Speaker Output:**
Connect a 4Ω or 8Ω speaker to the block terminal. **DO NOT** connect these to Ground. They are a differential pair.

## 🔧 Execution

1.  Open `ESP32_I2S_Sine.ino` in the Arduino IDE.
2.  Select **ESP32 Dev Module**.
3.  Flash it.
4.  Enjoy the annoying beep. It means it's working.

## 📜 The Source

### Pin Configuration
We tell the ESP32 which pins control the data stream.

```cpp
i2s_pin_config_t pin_config = {
  .bck_io_num   = 26,  // BCLK
  .ws_io_num    = 25,  // LRC
  .data_out_num = 22,  // DIN
  .data_in_num  = I2S_PIN_NO_CHANGE
};
```

### The Math (Sine Table)
We generate a lookup table (LUT) at startup. Why? because `sin()` is slow, and lookups are fast.

```cpp
void buildSineTable() {
  for (int i = 0; i < TABLE_SIZE; i++) {
    // 2π * i / size
    float phase = (2.0f * PI * i) / TABLE_SIZE;
    // Scale to 16-bit signed integer (leaving some headroom)
    sineTable[i] = (int16_t)(sinf(phase) * 28000.0f);
  }
}
```

## 🏴 Hacking It

*   **Change Pitch:** Modify `TONE_FREQUENCY`.
*   **Distortion:** Crank the `28000.0f` multiplier up to `32767` (max 16-bit). It will clip. It will sound angry.
*   **Modulation:** Try changing `phaseIncrement` dynamically in the loop. Congratulations, you just invented FM synthesis.

-- **Glitches**