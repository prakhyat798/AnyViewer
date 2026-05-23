<div align="center">

# 📄🔍 AnyViewer

**View Any Document. Scan Anything.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

*AnyViewer is a modern, responsive, and fully local web application that serves as a universal document viewer and camera-based document scanner. Built with React and designed with OxygenOS 16 "Liquid Glass" aesthetics, it provides a premium experience for managing and interacting with your files completely client-side in the browser.*

[Explore Features](#-features) • [Installation](#-running-locally) • [Privacy Guarantee](#-privacy--security)
</div>

<hr/>

## ✨ Features

### 📑 Universal Document Viewer
View a wide variety of file formats directly in your browser without any server-side processing:
*   **PDF Documents (`.pdf`):** Full-featured viewer with zoom, page-jump navigation, text selection, and keyboard shortcuts.
*   **Word Documents (`.doc`, `.docx`):** Beautifully rendered, styled document viewing engine powered by `mammoth`.
*   **Spreadsheets (`.xls`, `.xlsx`, `.csv`):** Interactive grid viewer with multi-sheet tab support via `xlsx`.
*   **Presentations (`.ppt`, `.pptx`):** Clean XML slide extractor displaying titles and formatted bulleted slide content.
*   **Images (JPG, PNG, WebP, SVG):** Feature-rich viewer with mouse/touch drag panning, scroll-wheel zoom, and 90° rotation controls.
*   **Text & Code (`.txt`, `.js`, `.json`, `.md`):** Syntax-highlighted text viewer with line numbers, copy-to-clipboard, and word wrap toggles.

### 📸 Camera Document Scanner
Turn your webcam or mobile camera into a powerful scanner app:
*   [x] **Live Camera Feed:** Switch between available cameras seamlessly.
*   [x] **Image Filters:** Apply Magic Color, Grayscale, or High Contrast Black & White thresholding to your captures instantly.
*   [x] **Multi-page Scanning:** Take multiple photos, reorder them in a gallery, and export them as a single native compiled PDF.

### 🎨 Premium UI & Theming
*   **Dynamic Themes:** Smoothly switch between beautiful Light and Dark modes.
*   **Layout Density:** Choose between Compact, Comfortable, or Spacious reading interfaces.
*   **Accessibility:** Configurable base font sizes right from the fluid settings page.

### 💾 Local Persistence
*   **Recent Files Tracker:** Automatically tracks your recent documents and uses IndexedDB to securely persist them offline across browser reloads.
*   **Fast Search:** Live-filtering search bar to instantly find recently opened files on the homepage.

---

## 🛠️ Technology Stack

| Core | Document Parsers | UI / UX |
| :--- | :--- | :--- |
| **React 18** (UI Library) | **`react-pdf`** (PDF.js Engine) | **Vanilla CSS Custom Vars** |
| **Vite** (Build Tool) | **`mammoth`** (DOCX Parsing) | **Framer Motion** (Spring Physics) |
| **IndexedDB** (Persistence) | **`xlsx`** (SheetJS) | **Lucide-React** (Iconography) |
| **JSZip** (Archiving) | **`jspdf`** (PDF Generation) | **Glassmorphism** (Design System) |

---

## 🚀 Running Locally

Because AnyViewer is entirely client-side, setup is incredibly fast with zero backend requirements.

### Quick Start:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prakhyat798/AnyViewer.git
   cd AnyViewer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser and enjoy!

---

## 🔒 Privacy & Security Guaranteed

🛡️ Let's be clear: **100% Local.** 
AnyViewer **never** uploads your files to a server. All document parsing, rendering, and camera scanning happens strictly within your browser's local memory. You can even run the app completely disconnected from the Internet!

---

<div align="center">
<i>Designed and engineered with precision.</i>
</div>
