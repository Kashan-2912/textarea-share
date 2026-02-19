# Share Pad

![Share Pad Preview](public/logo.svg)

> A modern, ephemeral, and URL-based collaborative notepad. No database, no login, just pure state sharing via compressed URLs.

## ✨ Features

- **Persist via URL**: All content is compressed using LZ-String and stored directly in the URL hash. Share the link, share the note.
- **Read-Only Mode**: Generate secure, non-editable links for sharing content without risk of modification.
- **Rich Text Editing**: Powered by [Slate.js](https://docs.slatejs.org/), supporting bold, italic, code blocks, and more.
- **Export Options**: Download your notes instantly as `.txt`, `.md`, or `.html`.
- **Premium UI**:
  - **Electric Border**: Dynamic, animated glow effects powered by HTML5 Canvas.
  - **Custom Cursor**: Interactive cursor with magnetic snap-to-target animations (GSAP).
  - **Liquid Metal Logo**: A unique metallic fluid simulation for the brand mark.
  - **Dark Mode First**: A sleek, high-contrast dark theme with `#a8e524` lime accents.
- **Fully Responsive**: Optimized for mobile and desktop, with a dedicated mobile sharing sheet.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [GSAP 3](https://greensock.com/gsap/) (Cursor & Effects)
- **Editor**: [Slate.js](https://docs.slatejs.org/)
- **Compression**: [lz-string](https://github.com/pieroxy/lz-string)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/share-pad.git
    cd share-pad
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🎨 Design Philosophy

Share Pad is built with a focus on **visual impact** and **simplicity**.
- **The "Electric" aesthetic**: High-voltage borders and neon accents give life to the static text editor.
- **Micro-interactions**: Every hover, click, and movement is rewarded with subtle animations.
- **No Friction**: Open the app, type, copy the URL. No sign-up walls.

## 📄 License

MIT © 2024 Share Pad
