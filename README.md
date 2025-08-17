# MetaPresent - PowerPoint Editor Application

A modern, web-based presentation editor built with Next.js 15, TypeScript, and HTML5 Canvas API. Create, edit, and manage presentations with an intuitive drag-and-drop interface.

## 🚀 Live Hosted Link

**Live Application**: https://meta-present.vercel.app


## 📦 Setup & Installation Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd meta-present
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure & Decisions

### Directory Structure
```
src/
├── app/                    # Next.js App Router (layout, pages, global styles)
├── components/            # React components (Canvas, Toolbar, SlidePanel, PropertiesPanel)
├── lib/                   # Redux store, hooks, and utility functions
```

### Key Architectural Decisions

- **Next.js 15 App Router**: Modern file-based routing for better performance and developer experience
- **HTML5 Canvas API**: Native browser canvas for custom drawing and element manipulation instead of external libraries
- **Redux Toolkit**: Centralized state management for complex presentation data (slides, elements, selections)
- **TypeScript**: Strict type safety to prevent runtime errors and improve code quality
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and consistent design

### Core Components

- **PresentationEditor**: Main application layout and coordination
- **Canvas**: HTML5 Canvas-based drawing surface for presentation elements
- **Toolbar**: Drawing tools and element creation controls
- **SlidePanel**: Slide management and navigation
- **PropertiesPanel**: Element property editing interface

## 🎯 Features

- **Slide Management**: Add and delete the slides
- **Drawing Tools**: Rectangle, circle, triangle, star, line, and text elements
- **Image Support**: Upload and place images on slides
- **Save/Load**: Export presentations as JSON and import existing ones

## 🧪 Testing the Load Feature

Use the included `presentation-2025-08-17-4.json` file to test the "Load Presentation" functionality. This example file contains 4 slides with various elements to demonstrate the application's capabilities.

## 📝 License

This project is created for the MetaUpSpace Full Stack Developer hiring task.
