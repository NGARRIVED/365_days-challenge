const API_URL = 'http://127.0.0.1:5002';

// DOM elements
const longUrlInput = document.getElementById('long-url');
const shortenBtn = document.getElementById('shorten-btn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const shortUrlInput = document.getElementById('short-url');
const copyBtn = document.getElementById('copy-btn');
const visitBtn = document.getElementById('visit-btn');
const newBtn = document.getElementById('new-btn');
const error = document.getElementById('error');
const errorMessage = document.getElementById('error-message');

// Event listeners
shortenBtn.addEventListener('click', shortenUrl);
longUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        shortenUrl();
    }
});
copyBtn.addEventListener('click', copyToClipboard);
visitBtn.addEventListener('click', visitUrl);
newBtn.addEventListener('click', resetForm);

// Main function to shorten URL
async function shortenUrl() {
    const longUrl = longUrlInput.value.trim();
    
    if (!longUrl) {
        showError('Please enter a URL to shorten');
        return;
    }
    
    if (!isValidUrl(longUrl)) {
        showError('Please enter a valid URL (include http:// or https://)');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ long_url: longUrl })
        });
        
        const data = await response.json();
        
        hideLoading();
        
        if (response.ok) {
            showResult(data.short_url);
        } else {
            showError(data.error || 'Failed to shorten URL');
        }
    } catch (err) {
        hideLoading();
        showError('Network error. Please check if the backend server is running.');
    }
}

// Validate URL format
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Copy short URL to clipboard
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(shortUrlInput.value);
        
        // Visual feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#28a745';
        }, 2000);
    } catch (err) {
        // Fallback for browsers that don't support clipboard API
        shortUrlInput.select();
        document.execCommand('copy');
    }
}

// Visit the short URL
function visitUrl() {
    window.open(shortUrlInput.value, '_blank');
}

// Reset form for new URL
function resetForm() {
    longUrlInput.value = '';
    hideResult();
    hideError();
    longUrlInput.focus();
}

// UI helper functions
function showLoading() {
    hideError();
    hideResult();
    loading.style.display = 'block';
    shortenBtn.disabled = true;
}

function hideLoading() {
    loading.style.display = 'none';
    shortenBtn.disabled = false;
}

function showResult(shortUrl) {
    shortUrlInput.value = shortUrl;
    result.style.display = 'block';
}

function hideResult() {
    result.style.display = 'none';
}

function showError(message) {
    hideResult();
    hideLoading();
    errorMessage.textContent = message;
    error.style.display = 'flex';
}

function hideError() {
    error.style.display = 'none';
}

// Focus on input when page loads
window.addEventListener('load', () => {
    longUrlInput.focus();
});