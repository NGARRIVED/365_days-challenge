# Day 6 - Markdown Previewer

## 📝 Project Overview
A real-time Markdown editor and previewer application that allows users to write Markdown text and see the rendered HTML output instantly. Perfect for bloggers, developers, and writers who work with Markdown regularly.

## ✨ Features
- **📝 Live Editor**: Real-time markdown editing with syntax highlighting
- **👁️ Instant Preview**: HTML output updates as you type
- **📱 Split View**: Side-by-side editor and preview layout
- **🎨 Syntax Highlighting**: Code blocks with language-specific highlighting
- **💾 Save/Load**: Download markdown files or load existing ones
- **📋 Export Options**: Export preview as HTML
- **🌓 Theme Toggle**: Switch between light and dark modes
- **📖 Markdown Guide**: Built-in cheatsheet and examples
- **📐 Resizable Panes**: Adjust editor/preview split ratio
- **⚡ Auto-save**: Automatically save work to localStorage

## 🛠️ Tech Stack
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: Real-time parsing and DOM manipulation
- **marked.js**: Markdown to HTML conversion
- **Prism.js**: Syntax highlighting for code blocks
- **Font Awesome**: Icons for UI elements

## 📁 Project Structure
```
Day6/
├── README.md
├── index.html              # Main application
├── style.css              # Styles and themes
├── script.js              # Application logic
├── assets/
│   ├── markdown-guide.md   # Markdown syntax guide
│   └── sample.md          # Sample markdown content
└── examples/
    ├── basic-example.md    # Basic markdown examples
    └── advanced-example.md # Advanced features demo
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start writing Markdown!

### Usage
1. **Writing**: Type Markdown syntax in the left editor pane
2. **Preview**: See the rendered HTML output in the right pane
3. **Save**: Click the save button to download your markdown file
4. **Load**: Use the load button to import existing markdown files
5. **Export**: Export the preview as an HTML file
6. **Themes**: Toggle between light and dark modes
7. **Guide**: Click the help button for markdown syntax reference

## 📚 Markdown Features Supported
- **Headers** (H1-H6)
- **Text Formatting** (bold, italic, strikethrough)
- **Lists** (ordered and unordered)
- **Links and Images**
- **Code Blocks** with syntax highlighting
- **Tables**
- **Blockquotes**
- **Horizontal Rules**
- **Line Breaks**
- **Escape Characters**

## 💡 Learning Objectives
- Understanding Markdown syntax and parsing
- Real-time text processing and DOM manipulation
- File handling in web browsers (FileReader API)
- CSS Grid and Flexbox layouts
- Theme switching implementation
- Local storage for data persistence
- Third-party library integration

## 🔧 Future Enhancements
- **Live Scroll Sync**: Synchronized scrolling between editor and preview
- **Custom CSS**: Allow users to add custom CSS for preview styling
- **Table Editor**: Visual table creation and editing
- **Math Support**: LaTeX math equation rendering
- **Diagram Support**: Mermaid diagram integration
- **Multi-file Support**: Tab-based multiple document editing
- **Export to PDF**: Generate PDF from markdown content
- **GitHub Flavored Markdown**: Extended syntax support

## 🎯 Key Development Skills
- **Frontend Development**: Advanced HTML, CSS, and JavaScript
- **API Integration**: Working with external libraries
- **File Operations**: Browser-based file handling
- **State Management**: Managing application state
- **Responsive Design**: Mobile-friendly layouts
- **User Experience**: Intuitive interface design

---

**Day 6 of the 365 Days Challenge** 
*Building practical web applications with real-world utility*