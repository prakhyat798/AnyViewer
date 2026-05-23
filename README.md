# AnyViewer 📄🔍

**View Any Document. Scan Anything.**

AnyViewer is a modern, responsive, and fully local web application that serves as a universal document viewer and camera-based document scanner. Built with React and designed with OxygenOS 16 "Liquid Glass" aesthetics, it provides a premium experience for managing and interacting with your files completely client-side in the browser.

---

## ✨ Features

### 📑 Universal Document Viewer
View a wide variety of file formats directly in your browser without any server-side processing:
- **PDF Documents (.pdf):** Full-featured viewer with zoom, page-jump navigation, text selection, and keyboard shortcuts.
- **Word Documents (.doc, .docx):** Beautifully rendered, styled document viewing.
- **Spreadsheets (.xls, .xlsx, .csv):** Interactive grid viewer with multi-sheet tab support.
- **Presentations (.ppt, .pptx):** Clean XML slide extractor displaying titles and bulleted slide content.
- **Images (jpg, png, webp, svg):** Feature-rich viewer with mouse/touch drag panning, scroll-wheel zoom, and 90° rotation.
- **Text & Code (.txt, .js, .json, .md, etc.):** Syntax-highlighted text viewer with line numbers, copy-to-clipboard, and word wrap toggles.

### 📸 Camera Document Scanner
Turn your webcam or mobile camera into a powerful scanner app:
- **Live Camera Feed:** Switch between available cameras seamlessly.
- **Image Filters:** Apply Magic Color, Grayscale, or High Contrast Black & White thresholding to your captures.
- **Multi-page Scanning:** Take multiple photos, reorder them in a gallery, and export them as a single PDF.

### 🎨 Premium UI & Theming
- **Dynamic Themes:** Smoothly switch between beautiful Light and Dark modes.
- **Layout Density:** Choose between Compact, Comfortable, or Spacious reading interfaces.
- **Accessibility:** Configurable base font sizes right from the settings.

### 💾 Local Persistence
- **Recent Files:** Automatically tracks your recent documents and uses IndexedDB to securely persist them offline across browser reloads.
- **Fast Search:** Live-filtering search bar to instantly find recently opened files.

---

## 🛠️ Tech Stack

- **Framework:** React 18 & Vite
- **Styling:** Vanilla CSS Custom Variables (Zero Tailwind dependencies)
- **Animations:** Framer Motion (spring physics)
- **Document Rendering:**
  - `react-pdf` (PDF.js)
  - `mammoth` (DOCX parsing)
  - `xlsx` (SheetJS)
  - `jszip` (PPTX unzipping)
- **Icons:** Lucide React

---

## 🚀 Running Locally

Because AnyViewer is entirely client-side, setup is incredibly fast.

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

4. Open `http://localhost:5173` in your browser.

---

## 🔒 Privacy & Security

**100% Local.** AnyViewer never uploads your files to a server. All document parsing, rendering, and camera scanning happens strictly within your browser's local memory.

---

*Designed and engineered with precision.*
