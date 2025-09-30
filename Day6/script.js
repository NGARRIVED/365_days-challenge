// === GLOBAL VARIABLES ===
let currentTheme = localStorage.getItem('markdownPreviewerTheme') || 'light';
let isResizing = false;
let currentFile = null;
let editorHistory = [];
let historyIndex = -1;
let autoSaveTimeout = null;

// === DOM ELEMENTS ===
const elements = {
    // Main sections
    editor: document.getElementById('markdownEditor'),
    preview: document.getElementById('previewContent'),
    mainContainer: document.querySelector('.main-container'),
    editorSection: document.querySelector('.editor-section'),
    previewSection: document.querySelector('.preview-section'),
    resizer: document.querySelector('.resizer'),
    
    // Navigation buttons
    newBtn: document.getElementById('newBtn'),
    openBtn: document.getElementById('openBtn'),
    saveBtn: document.getElementById('saveBtn'),
    exportBtn: document.getElementById('exportBtn'),
    exportHtmlBtn: document.getElementById('exportHtmlBtn'),
    exportPdfBtn: document.getElementById('exportPdfBtn'),
    exportDocxBtn: document.getElementById('exportDocxBtn'),
    exportDropdown: document.querySelector('.export-dropdown'),
    themeBtn: document.getElementById('themeBtn'),
    helpBtn: document.getElementById('helpBtn'),
    
    // Tool buttons
    boldBtn: document.getElementById('boldBtn'),
    italicBtn: document.getElementById('italicBtn'),
    linkBtn: document.getElementById('linkBtn'),
    fullscreenEditorBtn: document.getElementById('fullscreenEditor'),
    fullscreenPreviewBtn: document.getElementById('fullscreenPreview'),
    syncScrollBtn: document.getElementById('syncScroll'),
    
    // Modal elements
    helpModal: document.getElementById('helpModal'),
    closeModalBtn: document.querySelector('.close-btn'),
    
    // Tab elements
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Example buttons
    exampleBtns: document.querySelectorAll('.example-btn'),
    
    // File input
    fileInput: document.getElementById('fileInput'),
    
    // Status elements
    wordCount: document.getElementById('wordCount'),
    charCount: document.getElementById('charCount'),
    lineCount: document.getElementById('lineCount'),
    cursorPos: document.getElementById('cursorPos'),
    saveStatus: document.getElementById('saveStatus'),
    themeStatus: document.getElementById('themeStatus')
};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set initial theme
    setTheme(currentTheme);
    
    // Setup event listeners
    setupEventListeners();
    
    // Load sample content
    loadSampleContent();
    
    // Update preview initially
    updatePreview();
    
    // Update status bar
    updateStatusBar();
    
    // Setup auto-save
    setupAutoSave();
    
    console.log('Markdown Previewer initialized successfully!');
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    // Editor events
    elements.editor.addEventListener('input', handleEditorInput);
    elements.editor.addEventListener('scroll', handleEditorScroll);
    elements.editor.addEventListener('keydown', handleEditorKeydown);
    elements.editor.addEventListener('selectionchange', updateCursorPosition);
    
    // Navigation button events
    elements.newBtn.addEventListener('click', createNewFile);
    elements.openBtn.addEventListener('click', openFile);
    elements.saveBtn.addEventListener('click', saveFile);
    elements.exportBtn.addEventListener('click', toggleExportDropdown);
    elements.exportHtmlBtn.addEventListener('click', exportHtmlFile);
    elements.exportPdfBtn.addEventListener('click', exportPdfFile);
    elements.exportDocxBtn.addEventListener('click', exportDocxFile);
    elements.themeBtn.addEventListener('click', toggleTheme);
    elements.helpBtn.addEventListener('click', showHelpModal);
    
    // Tool button events
    elements.boldBtn.addEventListener('click', () => insertMarkdown('**', '**'));
    elements.italicBtn.addEventListener('click', () => insertMarkdown('*', '*'));
    elements.linkBtn.addEventListener('click', insertLink);
    elements.fullscreenEditorBtn.addEventListener('click', () => toggleFullscreen('editor'));
    elements.fullscreenPreviewBtn.addEventListener('click', () => toggleFullscreen('preview'));
    elements.syncScrollBtn.addEventListener('click', toggleSyncScroll);
    
    // Modal events
    elements.closeModalBtn.addEventListener('click', hideHelpModal);
    elements.helpModal.addEventListener('click', function(e) {
        if (e.target === elements.helpModal) {
            hideHelpModal();
        }
    });
    
    // Tab events
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Example button events
    elements.exampleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loadExample(this.dataset.example);
        });
    });
    
    // File input event
    elements.fileInput.addEventListener('change', handleFileUpload);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!elements.exportDropdown.contains(e.target)) {
            closeExportDropdown();
        }
    });
    
    // Resizer events
    elements.resizer.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeydown);
    
    // Window events
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('resize', handleWindowResize);
}

// === EDITOR FUNCTIONALITY ===
function handleEditorInput() {
    // Update preview
    updatePreview();
    
    // Update status bar
    updateStatusBar();
    
    // Save to history
    saveToHistory();
    
    // Auto-save
    scheduleAutoSave();
    
    // Update save status
    updateSaveStatus('unsaved');
}

function handleEditorScroll() {
    if (document.body.dataset.syncScroll === 'true') {
        syncPreviewScroll();
    }
}

function handleEditorKeydown(e) {
    // Tab handling
    if (e.key === 'Tab') {
        e.preventDefault();
        insertText('  '); // 2 spaces for tab
    }
    
    // Enter handling for lists
    if (e.key === 'Enter') {
        handleEnterKey(e);
    }
}

function updateCursorPosition() {
    const cursor = elements.editor.selectionStart;
    const text = elements.editor.value;
    const lines = text.substring(0, cursor).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    if (elements.cursorPos) {
        elements.cursorPos.textContent = `Ln ${line}, Col ${column}`;
    }
}

// === MARKDOWN PROCESSING ===
function updatePreview() {
    const markdownText = elements.editor.value;
    
    // Use marked.js to convert markdown to HTML
    const htmlContent = marked.parse(markdownText, {
        breaks: true,
        gfm: true,
        sanitize: false
    });
    
    // Update preview content
    elements.preview.innerHTML = htmlContent;
    
    // Highlight code blocks with Prism.js
    Prism.highlightAllUnder(elements.preview);
    
    // Add classes for better styling
    addPreviewClasses();
}

function addPreviewClasses() {
    // Add responsive table wrapper
    const tables = elements.preview.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('table-wrapper');
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
    
    // Add copy buttons to code blocks
    const codeBlocks = elements.preview.querySelectorAll('pre code');
    codeBlocks.forEach(addCopyButton);
}

function addCopyButton(codeBlock) {
    const pre = codeBlock.parentElement;
    if (pre.querySelector('.copy-btn')) return; // Already has copy button
    
    const copyBtn = document.createElement('button');
    copyBtn.classList.add('copy-btn');
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.title = 'Copy code';
    
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
            showNotification('Code copied to clipboard!');
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
    });
    
    pre.style.position = 'relative';
    pre.appendChild(copyBtn);
}

// === TEXT MANIPULATION ===
function insertMarkdown(before, after = '') {
    const start = elements.editor.selectionStart;
    const end = elements.editor.selectionEnd;
    const selectedText = elements.editor.value.substring(start, end);
    const replacement = before + selectedText + after;
    
    insertText(replacement, start, end);
    
    // Set cursor position
    if (selectedText) {
        elements.editor.setSelectionRange(start, start + replacement.length);
    } else {
        elements.editor.setSelectionRange(start + before.length, start + before.length);
    }
}

function insertText(text, start = null, end = null) {
    if (start === null) start = elements.editor.selectionStart;
    if (end === null) end = elements.editor.selectionEnd;
    
    const before = elements.editor.value.substring(0, start);
    const after = elements.editor.value.substring(end);
    
    elements.editor.value = before + text + after;
    elements.editor.focus();
    
    // Trigger input event
    elements.editor.dispatchEvent(new Event('input'));
}

function insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
        const text = prompt('Enter link text:', url);
        insertMarkdown(`[${text || url}](`, `${url})`);
    }
}

function handleEnterKey(e) {
    const cursorPos = elements.editor.selectionStart;
    const text = elements.editor.value;
    const lines = text.substring(0, cursorPos).split('\n');
    const currentLine = lines[lines.length - 1];
    
    // Check for list continuation
    const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s/);
    if (listMatch) {
        e.preventDefault();
        const indent = listMatch[1];
        const listMarker = listMatch[2];
        
        if (currentLine.trim() === listMarker) {
            // Empty list item, remove it
            const lineStart = cursorPos - currentLine.length;
            elements.editor.setSelectionRange(lineStart, cursorPos);
            insertText('\n');
        } else {
            // Continue list
            const nextMarker = listMarker.match(/\d+/) ? 
                (parseInt(listMarker) + 1) + '.' : listMarker;
            insertText(`\n${indent}${nextMarker} `);
        }
    }
}

// === FILE OPERATIONS ===
function createNewFile() {
    if (hasUnsavedChanges()) {
        if (!confirm('You have unsaved changes. Are you sure you want to create a new file?')) {
            return;
        }
    }
    
    elements.editor.value = '';
    currentFile = null;
    updatePreview();
    updateStatusBar();
    updateSaveStatus('saved');
    clearHistory();
    showNotification('New file created');
}

function openFile() {
    elements.fileInput.click();
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        elements.editor.value = e.target.result;
        currentFile = file.name;
        updatePreview();
        updateStatusBar();
        updateSaveStatus('saved');
        clearHistory();
        showNotification(`File "${file.name}" loaded successfully`);
    };
    reader.readAsText(file);
}

function saveFile() {
    const content = elements.editor.value;
    const filename = currentFile || 'markdown-document.md';
    
    downloadFile(content, filename, 'text/markdown');
    updateSaveStatus('saved');
    showNotification('File saved successfully');
}

// === EXPORT DROPDOWN ===
function toggleExportDropdown() {
    elements.exportDropdown.classList.toggle('active');
}

function closeExportDropdown() {
    elements.exportDropdown.classList.remove('active');
}

function exportHtmlFile() {
    const htmlContent = generateExportHTML();
    const filename = (currentFile || 'markdown-document').replace(/\.md$/, '') + '.html';
    
    downloadFile(htmlContent, filename, 'text/html');
    showNotification('File exported as HTML');
    closeExportDropdown();
}

async function exportPdfFile() {
    try {
        showNotification('Generating PDF...', 'info');
        
        // Get the preview content
        const previewElement = elements.preview;
        
        // Use html2canvas to render the preview as canvas
        const canvas = await html2canvas(previewElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: previewElement.scrollWidth,
            height: previewElement.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF with jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if content is long
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        const filename = (currentFile || 'markdown-document').replace(/\.md$/, '') + '.pdf';
        pdf.save(filename);
        
        showNotification('PDF exported successfully');
        closeExportDropdown();
    } catch (error) {
        console.error('PDF export failed:', error);
        showNotification('Failed to export PDF', 'error');
        closeExportDropdown();
    }
}

async function exportDocxFile() {
    try {
        showNotification('Generating Word document...', 'info');
        
        // Create a simple RTF document that Word can open
        const markdownContent = elements.editor.value;
        const rtfContent = convertMarkdownToRTF(markdownContent);
        
        // Create blob and download
        const blob = new Blob([rtfContent], { type: 'application/rtf' });
        const filename = (currentFile || 'markdown-document').replace(/\.md$/, '') + '.rtf';
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Word document (RTF) exported successfully');
        closeExportDropdown();
    } catch (error) {
        console.error('DOCX export failed:', error);
        showNotification('Failed to export Word document', 'error');
        closeExportDropdown();
    }
}

function convertMarkdownToRTF(markdown) {
    // RTF header
    let rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';
    
    const lines = markdown.split('\n');
    
    for (const line of lines) {
        if (line.trim() === '') {
            rtf += '\\par ';
            continue;
        }
        
        // Headers
        if (line.startsWith('# ')) {
            rtf += `\\fs32\\b ${escapeRTF(line.substring(2))}\\b0\\fs24\\par `;
        } else if (line.startsWith('## ')) {
            rtf += `\\fs28\\b ${escapeRTF(line.substring(3))}\\b0\\fs24\\par `;
        } else if (line.startsWith('### ')) {
            rtf += `\\fs26\\b ${escapeRTF(line.substring(4))}\\b0\\fs24\\par `;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            rtf += `\\bullet\\tab ${escapeRTF(line.substring(2))}\\par `;
        } else if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^\d+\.\s(.+)/);
            if (match) {
                rtf += `\\tab ${escapeRTF(match[1])}\\par `;
            }
        } else {
            // Regular paragraph with basic formatting
            let processedLine = line;
            
            // Bold text
            processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '\\b $1\\b0 ');
            
            // Italic text
            processedLine = processedLine.replace(/\*(.*?)\*/g, '\\i $1\\i0 ');
            
            // Code
            processedLine = processedLine.replace(/`(.*?)`/g, '\\f1 $1\\f0 ');
            
            rtf += `${escapeRTF(processedLine)}\\par `;
        }
    }
    
    rtf += '}';
    return rtf;
}

function escapeRTF(text) {
    return text.replace(/\\/g, '\\\\')
               .replace(/\{/g, '\\{')
               .replace(/\}/g, '\\}');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateExportHTML() {
    const content = elements.preview.innerHTML;
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentFile || 'Markdown Document'}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
        pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
        code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
}

// === THEME MANAGEMENT ===
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('markdownPreviewerTheme', theme);
    
    // Update theme button icon
    const themeIcon = elements.themeBtn.querySelector('i');
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    
    // Update status
    if (elements.themeStatus) {
        elements.themeStatus.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    }
    
    showNotification(`Switched to ${theme} theme`);
}

// === FULLSCREEN MODES ===
function toggleFullscreen(mode) {
    const isActive = elements.mainContainer.classList.contains(`fullscreen-${mode}`);
    
    // Remove all fullscreen classes
    elements.mainContainer.classList.remove('fullscreen-editor', 'fullscreen-preview');
    
    if (!isActive) {
        elements.mainContainer.classList.add(`fullscreen-${mode}`);
        showNotification(`${mode.charAt(0).toUpperCase() + mode.slice(1)} fullscreen enabled`);
    } else {
        showNotification('Fullscreen disabled');
    }
}

// === SCROLL SYNCHRONIZATION ===
function toggleSyncScroll() {
    const isEnabled = document.body.dataset.syncScroll === 'true';
    document.body.dataset.syncScroll = !isEnabled;
    
    const syncBtn = elements.syncScrollBtn;
    syncBtn.classList.toggle('active', !isEnabled);
    
    showNotification(`Scroll sync ${!isEnabled ? 'enabled' : 'disabled'}`);
}

function syncPreviewScroll() {
    const editorScrollTop = elements.editor.scrollTop;
    const editorScrollHeight = elements.editor.scrollHeight - elements.editor.clientHeight;
    const scrollPercentage = editorScrollTop / editorScrollHeight;
    
    const previewContainer = elements.preview.parentElement;
    const previewScrollHeight = previewContainer.scrollHeight - previewContainer.clientHeight;
    
    previewContainer.scrollTop = scrollPercentage * previewScrollHeight;
}

// === RESIZING ===
function startResize(e) {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
}

function handleResize(e) {
    if (!isResizing) return;
    
    const containerRect = elements.mainContainer.getBoundingClientRect();
    const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 20% and 80%
    const constrainedPercentage = Math.max(20, Math.min(80, percentage));
    
    elements.editorSection.style.width = `${constrainedPercentage}%`;
    elements.previewSection.style.width = `${100 - constrainedPercentage}%`;
}

function stopResize() {
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
}

// === HISTORY MANAGEMENT ===
function saveToHistory() {
    const content = elements.editor.value;
    
    // Remove future history if we're not at the end
    if (historyIndex < editorHistory.length - 1) {
        editorHistory = editorHistory.slice(0, historyIndex + 1);
    }
    
    // Add to history
    editorHistory.push(content);
    historyIndex = editorHistory.length - 1;
    
    // Limit history size
    if (editorHistory.length > 50) {
        editorHistory.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        elements.editor.value = editorHistory[historyIndex];
        updatePreview();
        updateStatusBar();
        showNotification('Undo');
    }
}

function redo() {
    if (historyIndex < editorHistory.length - 1) {
        historyIndex++;
        elements.editor.value = editorHistory[historyIndex];
        updatePreview();
        updateStatusBar();
        showNotification('Redo');
    }
}

function clearHistory() {
    editorHistory = [elements.editor.value];
    historyIndex = 0;
}

// === AUTO-SAVE ===
function setupAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
        if (hasUnsavedChanges()) {
            localStorage.setItem('markdownPreviewerAutoSave', elements.editor.value);
            localStorage.setItem('markdownPreviewerAutoSaveTime', Date.now().toString());
            updateSaveStatus('auto-saved');
        }
    }, 30000);
    
    // Restore auto-saved content on load
    const autoSaved = localStorage.getItem('markdownPreviewerAutoSave');
    const autoSaveTime = localStorage.getItem('markdownPreviewerAutoSaveTime');
    
    if (autoSaved && autoSaveTime) {
        const timeDiff = Date.now() - parseInt(autoSaveTime);
        if (timeDiff < 24 * 60 * 60 * 1000) { // Within 24 hours
            if (confirm('Auto-saved content found. Would you like to restore it?')) {
                elements.editor.value = autoSaved;
                updatePreview();
                updateStatusBar();
                showNotification('Auto-saved content restored');
            }
        }
    }
}

function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        localStorage.setItem('markdownPreviewerAutoSave', elements.editor.value);
        localStorage.setItem('markdownPreviewerAutoSaveTime', Date.now().toString());
    }, 5000); // Save after 5 seconds of inactivity
}

// === STATUS BAR ===
function updateStatusBar() {
    const content = elements.editor.value;
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = content.length;
    const lines = content.split('\n').length;
    
    if (elements.wordCount) elements.wordCount.textContent = words;
    if (elements.charCount) elements.charCount.textContent = chars;
    if (elements.lineCount) elements.lineCount.textContent = lines;
    
    updateCursorPosition();
}

function updateSaveStatus(status) {
    if (!elements.saveStatus) return;
    
    const statusMap = {
        'saved': { text: 'Saved', icon: 'fas fa-check', class: 'saved' },
        'unsaved': { text: 'Unsaved', icon: 'fas fa-circle', class: 'unsaved' },
        'auto-saved': { text: 'Auto-saved', icon: 'fas fa-clock', class: 'auto-saved' }
    };
    
    const statusInfo = statusMap[status] || statusMap['saved'];
    elements.saveStatus.innerHTML = `<i class="${statusInfo.icon}"></i> ${statusInfo.text}`;
    elements.saveStatus.className = `save-status ${statusInfo.class}`;
}

function hasUnsavedChanges() {
    const autoSaved = localStorage.getItem('markdownPreviewerAutoSave');
    return elements.editor.value !== (autoSaved || '');
}

// === MODAL MANAGEMENT ===
function showHelpModal() {
    elements.helpModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideHelpModal() {
    elements.helpModal.classList.remove('active');
    document.body.style.overflow = '';
}

function switchTab(tabName) {
    // Update buttons
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update content
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
}

// === EXAMPLES ===
function loadExample(exampleName) {
    const examples = {
        basic: `# Welcome to Markdown Previewer

This is a **basic example** of Markdown formatting.

## Features

- Real-time preview
- Syntax highlighting
- Theme switching
- File operations

### Code Example

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

> This is a blockquote example.

[Learn more about Markdown](https://www.markdownguide.org/)`,

        advanced: `# Advanced Markdown Features

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Tables | ✅ | Fully supported |
| Code | ✅ | Syntax highlighting |
| Math | ❌ | Coming soon |

## Task Lists

- [x] Basic formatting
- [x] Code blocks
- [ ] Math equations
- [ ] Diagrams

## Code with Language

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

## Horizontal Rule

---

## Images

![Placeholder](https://via.placeholder.com/400x200?text=Sample+Image)

## Nested Lists

1. First item
   - Nested item
   - Another nested item
2. Second item
   1. Numbered nested
   2. Another numbered`,

        readme: `# Project Name

> A brief description of your project

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`javascript
const project = require('project-name');
project.doSomething();
\`\`\`

## API Reference

### \`doSomething()\`

Does something useful.

**Parameters:**
- \`param1\` (string) - Description of parameter

**Returns:**
- \`result\` (object) - Description of return value

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.`
    };
    
    if (examples[exampleName]) {
        elements.editor.value = examples[exampleName];
        updatePreview();
        updateStatusBar();
        hideHelpModal();
        showNotification(`Loaded ${exampleName} example`);
        clearHistory();
    }
}

// === KEYBOARD SHORTCUTS ===
function handleGlobalKeydown(e) {
    // Ctrl/Cmd shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                createNewFile();
                break;
            case 'o':
                e.preventDefault();
                openFile();
                break;
            case 's':
                e.preventDefault();
                saveFile();
                break;
            case 'e':
                e.preventDefault();
                toggleExportDropdown();
                break;
            case 'b':
                e.preventDefault();
                insertMarkdown('**', '**');
                break;
            case 'i':
                e.preventDefault();
                insertMarkdown('*', '*');
                break;
            case 'k':
                e.preventDefault();
                insertLink();
                break;
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                break;
            case '1':
                e.preventDefault();
                toggleFullscreen('editor');
                break;
            case '2':
                e.preventDefault();
                toggleFullscreen('preview');
                break;
            case '/':
                e.preventDefault();
                showHelpModal();
                break;
        }
    }
    
    // Escape key
    if (e.key === 'Escape') {
        if (elements.helpModal.classList.contains('active')) {
            hideHelpModal();
        }
    }
    
    // F11 for fullscreen
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen('editor');
    }
}

// === UTILITY FUNCTIONS ===
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function handleBeforeUnload(e) {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
    }
}

function handleWindowResize() {
    // Ensure proper layout on resize
    if (window.innerWidth <= 768) {
        elements.mainContainer.classList.remove('fullscreen-editor', 'fullscreen-preview');
    }
}

function loadSampleContent() {
    const sampleContent = `# Welcome to Markdown Previewer

A powerful, real-time Markdown editor with live preview.

## ✨ Features

- **Real-time preview** - See changes instantly
- **Syntax highlighting** - Beautiful code blocks
- **Theme switching** - Light and dark modes
- **File operations** - Open, save, and export
- **Keyboard shortcuts** - Efficient editing

## 🚀 Quick Start

1. Start typing in the editor
2. Watch the preview update in real-time
3. Use the toolbar for common formatting
4. Press \`Ctrl+/\` for help and shortcuts

## 📝 Markdown Syntax

### Text Formatting

Make text **bold** or *italic*. You can also use ~~strikethrough~~.

### Code

Inline \`code\` or code blocks:

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

### Lists

- Item 1
- Item 2
  - Nested item
  - Another nested item

1. Numbered item
2. Another numbered item

### Quotes

> "The best way to predict the future is to create it."
> 
> — Peter Drucker

### Links and Images

[Markdown Guide](https://www.markdownguide.org/)

---

Happy writing! 🎉`;

    elements.editor.value = sampleContent;
}