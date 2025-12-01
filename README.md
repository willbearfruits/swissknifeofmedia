# The Rabbit Hole

> "Stay curious. Follow the white rabbit."

**The Rabbit Hole** is a digital "Anarchist Cookbook" for the New Media underground. It is a unified archive for teachers, students, and synth-builders who are tired of hunting down scattered datasheets and broken calculators.

This is the repository of **Glitches**. I built this to be the single source of truth for the knowledge I've gathered—shared freely to arm the next generation of noise-makers.

## 🕳️ What's Inside?

### 1. The Workbench (Tools)
Your digital lab bench. No bloat, just the utilities you actually need when the soldering iron is hot.
*   **Filter Plotter:** visualize RC low-pass/high-pass curves instantly.
*   **Tone Generator:** A dual-oscillator synth + oscilloscope to test your audio chain.
*   **Component Decoders:** Resistor color codes and capacitor shorthand (104 = ?).
*   **Serial Monitor:** A WebSerial terminal to debug your Arduino/ESP32 projects directly from the browser.

### 2. The Library (Resources)
The "Cookbook." A curated collection of PDFs, schematics, and deep-dive articles on experimental music and electronics.

### 3. The Workshop (Tutorials)
Step-by-step guides on building circuits, flashing firmware, and writing code.

---

## 🛠️ Protocol: Local Setup

To run this locally, you need **Node.js 20+**.

1.  **Clone the archive:**
    ```bash
    git clone https://github.com/willbearfruits/the-rabbit-hole.git
    cd the-rabbit-hole
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure the Environment:**
    Copy `.env.example` to `.env.local`.
    
    *   **Firebase Auth:** This uses Firebase for secure access. Create a free Firebase project, enable "Email/Password" auth, and drop your config keys here.
    *   **Gemini AI (Optional):** If you want the AI assistant features, add your `VITE_GEMINI_API_KEY`. *Keep this secret.*
    *   **Classroom Mode:** If you can't be bothered with Firebase, set `VITE_STUDENT_PIN` and `VITE_ADMIN_PIN`. The app will fall back to a simple PIN gate.

4.  **Ignite:**
    ```bash
    npm run dev
    ```

## 🚀 Deployment

We deploy to the edge.

This project is configured for **GitHub Pages**.
1.  Push to `main`.
2.  The Action in `.github/workflows/deploy.yml` will build and ship the site.
3.  **Important:** Add your `.env` variables (like `VITE_FIREBASE_API_KEY`) to your GitHub Repository Secrets so the build server can see them.

## 🏴 Credits

Built for the creative tech community.
Share the wealth.

**— Glitches**