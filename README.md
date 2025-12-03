# The Rabbit Hole

> "Stay curious. Follow the white rabbit."

**The Rabbit Hole** is a digital "Anarchist Cookbook" for the New Media underground. It is a unified archive for teachers, students, and synth-builders who are tired of hunting down scattered datasheets and broken calculators. This platform provides essential tools, curated resources, and an expanding archive of influential artists and concepts.

This is the repository of **Glitches**. I built this to be the single source of truth for the knowledge I've gathered—shared freely to arm the next generation of noise-makers.

## 🕳️ What's Inside?

### 1. The Workbench (Tools)
Your digital lab bench. No bloat, just the utilities you actually need when the soldering iron is hot.
*   **Filter Plotter:** Visualize RC low-pass/high-pass curves instantly.
*   **Tone Generator:** A dual-oscillator synth + oscilloscope to test your audio chain.
*   **Component Decoders:** Resistor color codes and capacitor shorthand (104 = ?).
*   **Serial Monitor:** A WebSerial terminal to debug your Arduino/ESP32 projects directly from the browser.

### 2. The Library (Resources)
The "Cookbook." A curated collection of PDFs, schematics, and deep-dive articles on experimental music and electronics.

### 3. The Workshop (Tutorials)
Step-by-step guides on building circuits, flashing firmware, and writing code. The workshops now feature an overhauled, cleaner card-based layout with a dedicated reading view.

### 4. The Archive (Artists)
A dedicated space exploring pioneers of Glitch, Noise, Performance, Media Art, and other experimental fields. This expanding collection features 90+ artists, sortable by category and searchable.

### 5. Musrara Toolkit
A specialized portal for New Media students, designed to foster creative destruction and exploration.
*   **Pixel Sorter:** Browser-based image destruction tool for immediate glitch art.
*   **AI Command Line Tools:** Quick reference and installation commands for Gemini CLI, Claude Code, and GitHub Copilot CLI.
*   **Generative Synthesis Links:** Curated links to leading AI image (Midjourney, ImageFX, DALL-E Mini), video (RunwayML, Pika), and text (ChatGPT, Claude, Gemini, Ollama) generation platforms.
*   **Essential Software:** Links to critical desktop applications like Avidemux, Hex Editors, Audacity, and GIMP.

### 6. Secret Doom Page
A fully localized, browser-based DOOM (1993) player for when you need a break or some retro inspiration. Access via a hidden path!

---

## 💻 Technical Stack

This project is built using:
*   **React 19:** Modern JavaScript library for building user interfaces.
*   **Vite:** Next-generation frontend tooling for fast development.
*   **TypeScript:** Type-safe JavaScript for robust codebases.
*   **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
*   **React Router:** For declarative navigation.
*   **Firebase:** Authentication for secure access and admin features.
*   **Google Gemini API:** Integrated for AI teaching assistant functionalities.
*   **GitHub Pages:** For seamless deployment.
*   **JS-DOS:** For local emulation of DOS games like DOOM.

---

## 🛠️ Protocol: Local Setup

To run this locally, you need **Node.js 20+**.

1.  **Clone the archive:**
    ```bash
    git clone https://github.com/willbearfruits/swissknifeofmedia.git
    cd swissknifeofmedia
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
4.  **Browser Router:** This project uses `BrowserRouter`. If deploying to a sub-path like `https://<username>.github.io/<repo-name>/`, ensure your `vite.config.ts` `base` path and the `BrowserRouter` `basename` are correctly set to `/<repo-name>/`. Also, ensure `public/404.html` is present for proper routing.

## 🏴 Credits

Built for the creative tech community.
Share the wealth.

**— Glitches**