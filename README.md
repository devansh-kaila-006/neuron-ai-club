# NEURØN — Amrita AI Hub

A highly stylized, immersive, and interactive portal designed for the **NEURØN AI Club at Amrita Vishwa Vidyapeetham, Bengaluru Campus**. Inspired by high-contrast cybernetic, brutalist design aesthetics and utilizing smooth motion transitions, this full-stack portal acts as the digital nervous system for AI innovation, hackathons, academic summits, and student collaboration.

---

## 🚀 Key Architectural Upgrades

### 1. Unified Event Navigation & Gallery Core
- **Interactive Timeline**: Highlights primary flagship operations like the *AI for Atmanirbhar Bharat* Pre-Summit, *NEURØN Unbox Launch*, and *comAIcal Escape*.
- **Local Asset Binding**: Supports high-fidelity local image assets loaded directly from `/events` dynamically mapped inside interactive modal nodes.
- **Narrative Story Core Simulator**: A gamified, physics-aligned playground representing the mechanics of *comAIcal Escape* where students spin a virtual core to generate random, complex sci-fi AI comic book prompts.

### 2. High-Visibility Global Navigation
- **Expanded Nav Core**: Enabled absolute direct links to the **Mascot Core** and the **Neural Blog** within the header navbar and the main interactive footer links.
- **Micro-Transitions**: Integrated fluid `motion/react` layout animations, offering a physical feel to page loading and route switching.

---

## 📂 System Project Structure

```bash
├── events/                   # Main directory for event media assets (event1_1, etc.)
├── pages/                    # Responsive page nodes
│   ├── Home.tsx              # Landing deck, vision timeline, and interactive modules
│   ├── Departments.tsx       # Department divisions (ACE, ACROM, NSDC, JIDO, etc.)
│   ├── Events.tsx            # NEW: Timelines, gallery modals, and spin-wheel simulator
│   ├── Team.tsx              # Core Council, leadership profiles, and interactive cards
│   ├── Mascot.tsx            # Digital neural guardian & Mascot customizer
│   ├── Blog.tsx              # Neural Archive community publishing canvas
│   ├── JoinClub.tsx          # Dynamic recruitment node
│   └── Admin.tsx             # Operations dashboard for administrators
├── components/               # Shareable styled micro-components
│   ├── Navbar.tsx            # Global top navigation with adaptive blur
│   └── DecryptedText.tsx     # Cybernetic text decryption effect
├── services/                 # Database proxies and backend communication scripts
└── App.tsx                   # Central router, lazy hydration boundaries, and footer
```

---

## 🛠️ Local Development & Operations

### Installation
Ensure you have Node.js installed, then execute:
```bash
npm install
```

### Dev Launch Mode
Starts the high-speed local Vite dev server with Hot Module Replacement disabled (compliant with sandbox routing targets on port `3000`):
```bash
npm run dev
```

### Synthesis & Build
Validates strict type-safety boundaries, compiles assets, and bundles the application for production:
```bash
npm run build
```

### Lint Verification
Audits the codebase for structural errors, unused imports, or bad formatting rules:
```bash
npm run lint
```

---

## 🎨 Visual Identity Guidelines

* **Primary Contrast**: Cosmic dark canvas backed by deep metallic slate grays and infinite backdrops (`#050505`).
* **Interactive Highlights**: Neon Indigo for active system indicators, Cosmic Violet for structural highlights, and Neon Pink for gamified escapes.
* **Typography Pairings**: Sharp high-contrast display typography (using custom system fonts) paired with mono-spaced tracking for secondary status arrays.
