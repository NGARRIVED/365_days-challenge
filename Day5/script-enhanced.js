const API_BASE = 'http://localhost:5002';
let chart = null;

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'analytics') {
        refreshAnalytics();
    } else if (tabName === 'manage') {
        loadUrlList();
    }
}

// URL Shortening
async function shortenUrl() {
    const urlInput = document.getElementById('urlInput');
    const customAliasInput = document.getElementById('customAlias');
    const expirationSelect = document.getElementById('expirationSelect');
    const longUrl = urlInput.value.trim();
    const customAlias = customAliasInput.value.trim();
    const expirationDays = expirationSelect.value;
    
    if (!longUrl) {
        showNotification('Please enter a URL', 'error');
        return;
    }
    
    if (!isValidUrl(longUrl)) {
        showNotification('Please enter a valid URL', 'error');
        return;
    }
    
    // Validate custom alias if provided
    if (customAlias) {
        if (customAlias.length < 3 || customAlias.length > 20) {
            showNotification('Custom alias must be between 3-20 characters', 'error');
            return;
        }
        
        if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
            showNotification('Custom alias can only contain letters, numbers, hyphens, and underscores', 'error');
            return;
        }
    }
    
    showLoading(true);
    
    try {
        const requestBody = { long_url: longUrl };
        if (customAlias) {
            requestBody.custom_code = customAlias;
        }
        if (expirationDays) {
            requestBody.expiration_days = parseInt(expirationDays);
        }
        
        const response = await fetch(`${API_BASE}/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayResult(data.short_url, longUrl);
            showNotification('URL shortened successfully!', 'success');
            urlInput.value = '';
            customAliasInput.value = '';
            expirationSelect.value = '';
        } else {
            showNotification(data.error || 'Failed to shorten URL', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function displayResult(shortUrl, longUrl) {
    document.getElementById('shortUrl').value = shortUrl;
    document.getElementById('createdDate').textContent = new Date().toLocaleString();
    document.getElementById('clickCount').textContent = '0';
    document.getElementById('result').style.display = 'block';
    
    // Get analytics for this URL
    const shortCode = shortUrl.split('/').pop();
    updateUrlStats(shortCode);
}

async function updateUrlStats(shortCode) {
    try {
        const response = await fetch(`${API_BASE}/analytics/${shortCode}`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('clickCount').textContent = data.click_count;
            if (data.created_at) {
                document.getElementById('createdDate').textContent = 
                    new Date(data.created_at).toLocaleString();
            }
        }
    } catch (error) {
        console.error('Error fetching URL stats:', error);
    }
}

// Copy URL
function copyUrl() {
    const shortUrlInput = document.getElementById('shortUrl');
    shortUrlInput.select();
    shortUrlInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showNotification('URL copied to clipboard!', 'success');
    } catch (error) {
        showNotification('Failed to copy URL', 'error');
    }
}

// Analytics
async function refreshAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/analytics`);
        if (!response.ok) {
            throw new Error('Failed to fetch analytics');
        }
        
        const urls = await response.json();
        updateAnalyticsDisplay(urls);
        updateChart(urls);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        showNotification('Failed to load analytics', 'error');
    }
}

function updateAnalyticsDisplay(urls) {
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.click_count, 0);
    const avgClicks = totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : 0;
    const topPerformer = urls.length > 0 ? 
        urls.reduce((max, url) => url.click_count > max.click_count ? url : max) : null;
    
    document.getElementById('totalUrls').textContent = totalUrls;
    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('avgClicks').textContent = avgClicks;
    document.getElementById('topPerformer').textContent = 
        topPerformer ? `${topPerformer.click_count} clicks` : '-';
}

function updateChart(urls) {
    const ctx = document.getElementById('clicksChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    // Prepare data for chart
    const sortedUrls = urls.sort((a, b) => b.click_count - a.click_count).slice(0, 10);
    const labels = sortedUrls.map(url => url.short_code);
    const data = sortedUrls.map(url => url.click_count);
    
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Clicks',
                data: data,
                backgroundColor: 'rgba(79, 172, 254, 0.8)',
                borderColor: 'rgba(79, 172, 254, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top 10 URLs by Clicks',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// URL Management
async function loadUrlList() {
    const urlListContainer = document.getElementById('urlList');
    urlListContainer.innerHTML = '<div class="loading-urls"><i class="fas fa-spinner fa-spin"></i> Loading URLs...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/analytics`);
        if (!response.ok) {
            throw new Error('Failed to fetch URLs');
        }
        
        const urls = await response.json();
        displayUrlList(urls);
    } catch (error) {
        console.error('Error fetching URLs:', error);
        urlListContainer.innerHTML = '<div class="loading-urls"><i class="fas fa-exclamation-triangle"></i> Failed to load URLs</div>';
    }
}

function displayUrlList(urls) {
    const urlListContainer = document.getElementById('urlList');
    
    if (urls.length === 0) {
        urlListContainer.innerHTML = '<div class="loading-urls"><i class="fas fa-info-circle"></i> No URLs created yet</div>';
        return;
    }
    
    // Sort URLs by creation date (newest first)
    const sortedUrls = urls.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const urlListHTML = sortedUrls.map(url => {
        const isExpired = url.is_expired;
        const expirationInfo = url.expires_at ? 
            `<span class="${isExpired ? 'expired' : ''}"><i class="fas fa-clock"></i> ${isExpired ? 'Expired' : 'Expires'}: ${formatDate(url.expires_at)}</span>` : 
            '<span><i class="fas fa-infinity"></i> Never expires</span>';
        
        return `
        <div class="url-item ${isExpired ? 'expired-url' : ''}">
            <div class="url-info">
                <h4>/${url.short_code} ${isExpired ? '(EXPIRED)' : ''}</h4>
                <p>${truncateUrl(url.long_url, 60)}</p>
                <div class="url-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(url.created_at)}</span>
                    <span><i class="fas fa-eye"></i> ${url.click_count} clicks</span>
                    ${url.last_accessed ? `<span><i class="fas fa-clock"></i> Last: ${formatDate(url.last_accessed)}</span>` : ''}
                    ${expirationInfo}
                </div>
            </div>
            <div class="url-actions">
                <button class="btn-copy" onclick="copyToClipboard('${window.location.origin}/${url.short_code}')" ${isExpired ? 'disabled' : ''}>
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="btn-qr" onclick="showQRCodeModal('${url.short_code}')" ${isExpired ? 'disabled' : ''}>
                    <i class="fas fa-qrcode"></i> QR
                </button>
                <button class="btn-delete" onclick="deleteUrl('${url.short_code}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    }).join('');
    
    urlListContainer.innerHTML = urlListHTML;
}

function truncateUrl(url, maxLength) {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('URL copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy URL', 'error');
    });
}

function deleteUrl(shortCode) {
    if (confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
        // Note: You would need to implement a delete endpoint in the backend
        showNotification('Delete functionality coming soon!', 'error');
    }
}

// Utility Functions
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    
    if (show) {
        loading.style.display = 'block';
        result.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Enter key support for URL input
    document.getElementById('urlInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            shortenUrl();
        }
    });
    
    // Enter key support for custom alias input
    document.getElementById('customAlias').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            shortenUrl();
        }
    });
    
    // Load initial analytics if on analytics tab
    if (document.getElementById('analytics-tab').classList.contains('active')) {
        refreshAnalytics();
    }
});

// Auto-refresh analytics every 30 seconds if on analytics tab
setInterval(() => {
    if (document.getElementById('analytics-tab').classList.contains('active')) {
        refreshAnalytics();
    }
}, 30000);

// Bulk Processing Functions
let csvData = [];

function switchBulkMethod(method) {
    // Update method cards
    document.querySelectorAll('.method-card').forEach(card => {
        card.classList.remove('active');
    });
    document.getElementById(`${method}-method`).classList.add('active');
    
    // Show/hide sections
    if (method === 'text') {
        document.getElementById('text-input-section').style.display = 'block';
        document.getElementById('csv-input-section').style.display = 'none';
    } else {
        document.getElementById('text-input-section').style.display = 'none';
        document.getElementById('csv-input-section').style.display = 'block';
    }
}

async function processBulkUrls() {
    const textarea = document.getElementById('bulkUrls');
    const urls = textarea.value.split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);
    
    if (urls.length === 0) {
        showNotification('Please enter at least one URL', 'error');
        return;
    }
    
    await processBulkUrlsList(urls);
}

function handleCsvFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        csvData = parseCsv(csv);
        
        if (csvData.length > 0) {
            document.getElementById('processCsvBtn').style.display = 'block';
            showNotification(`Loaded ${csvData.length} URLs from CSV`, 'success');
        } else {
            showNotification('No valid URLs found in CSV file', 'error');
        }
    };
    reader.readAsText(file);
}

function parseCsv(csv) {
    const lines = csv.split('\n');
    const urls = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            // Take the first column (URL)
            const columns = line.split(',');
            const url = columns[0].trim().replace(/"/g, '');
            if (isValidUrl(url)) {
                urls.push(url);
            }
        }
    }
    
    return urls;
}

async function processCsvUrls() {
    if (csvData.length === 0) {
        showNotification('No CSV data to process', 'error');
        return;
    }
    
    await processBulkUrlsList(csvData);
}

async function processBulkUrlsList(urls) {
    // Show results section
    document.getElementById('bulk-results').style.display = 'block';
    
    // Reset progress
    updateProgress(0, urls.length);
    updateBulkStatus('processing', `Processing ${urls.length} URLs...`);
    
    const results = [];
    const outputDiv = document.getElementById('bulk-output');
    outputDiv.innerHTML = '';
    
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        
        try {
            const response = await fetch(`${API_BASE}/shorten`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ long_url: url })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                const result = {
                    original: url,
                    shortened: data.short_url,
                    status: 'success'
                };
                results.push(result);
                
                const resultItem = document.createElement('div');
                resultItem.className = 'url-result-item success';
                resultItem.innerHTML = `✓ ${url} → ${data.short_url}`;
                outputDiv.appendChild(resultItem);
            } else {
                const result = {
                    original: url,
                    error: data.error || 'Unknown error',
                    status: 'error'
                };
                results.push(result);
                
                const resultItem = document.createElement('div');
                resultItem.className = 'url-result-item error';
                resultItem.innerHTML = `✗ ${url} → Error: ${data.error}`;
                outputDiv.appendChild(resultItem);
            }
        } catch (error) {
            const result = {
                original: url,
                error: 'Network error',
                status: 'error'
            };
            results.push(result);
            
            const resultItem = document.createElement('div');
            resultItem.className = 'url-result-item error';
            resultItem.innerHTML = `✗ ${url} → Network error`;
            outputDiv.appendChild(resultItem);
        }
        
        // Update progress
        updateProgress(i + 1, urls.length);
        
        // Scroll to bottom of output
        outputDiv.scrollTop = outputDiv.scrollHeight;
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Processing complete
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    
    updateBulkStatus('completed', `Processing complete! ${successful} successful, ${failed} failed`);
    
    // Store results for download
    window.bulkResults = results;
    document.getElementById('downloadBtn').style.display = 'block';
    
    showNotification(`Bulk processing complete! ${successful}/${urls.length} URLs processed successfully`, 'success');
}

function updateProgress(current, total) {
    const percentage = Math.round((current / total) * 100);
    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${percentage}%`;
}

function updateBulkStatus(type, message) {
    const statusDiv = document.getElementById('bulk-status');
    statusDiv.className = `bulk-status ${type}`;
    statusDiv.textContent = message;
}

function downloadSampleCsv() {
    const csvContent = `URL,Description
https://example.com,Example Website
https://google.com,Google Search
https://github.com,GitHub Repository`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-urls.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function downloadResults() {
    if (!window.bulkResults || window.bulkResults.length === 0) {
        showNotification('No results to download', 'error');
        return;
    }
    
    const csvHeaders = 'Original URL,Shortened URL,Status,Error\n';
    const csvRows = window.bulkResults.map(result => {
        return `"${result.original}","${result.shortened || ''}","${result.status}","${result.error || ''}"`;
    }).join('\n');
    
    const csvContent = csvHeaders + csvRows;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-shortening-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Results downloaded successfully!', 'success');
}

// QR Code Functions
async function generateQRCode() {
    const shortUrlInput = document.getElementById('shortUrl');
    const shortUrl = shortUrlInput.value;
    
    if (!shortUrl) {
        showNotification('No URL to generate QR code for', 'error');
        return;
    }
    
    const shortCode = shortUrl.split('/').pop();
    
    try {
        const response = await fetch(`${API_BASE}/qr/${shortCode}`);
        if (!response.ok) {
            throw new Error('Failed to generate QR code');
        }
        
        const data = await response.json();
        
        // Display QR code
        document.getElementById('qrCodeImage').src = data.qr_code;
        document.getElementById('qr-container').style.display = 'block';
        
        // Store QR data for download
        window.currentQRData = data.qr_code;
        window.currentShortCode = shortCode;
        
        showNotification('QR code generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating QR code:', error);
        showNotification('Failed to generate QR code', 'error');
    }
}

function downloadQRCode() {
    if (!window.currentQRData) {
        showNotification('No QR code to download', 'error');
        return;
    }
    
    // Convert base64 to blob and download
    const base64Data = window.currentQRData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-code-${window.currentShortCode}.png`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('QR code downloaded successfully!', 'success');
}

async function shareQRCode() {
    if (!window.currentQRData) {
        showNotification('No QR code to share', 'error');
        return;
    }
    
    // Check if Web Share API is supported
    if (navigator.share) {
        try {
            // Convert base64 to blob for sharing
            const base64Data = window.currentQRData.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            
            const file = new File([blob], `qr-code-${window.currentShortCode}.png`, { type: 'image/png' });
            
            await navigator.share({
                title: 'QR Code for Short URL',
                text: `QR code for ${document.getElementById('shortUrl').value}`,
                files: [file]
            });
            
            showNotification('QR code shared successfully!', 'success');
        } catch (error) {
            console.error('Error sharing:', error);
            showNotification('Failed to share QR code', 'error');
        }
    } else {
        // Fallback: Copy QR code image to clipboard
        try {
            const img = document.getElementById('qrCodeImage');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    showNotification('QR code copied to clipboard!', 'success');
                } catch (error) {
                    showNotification('Copy to clipboard not supported', 'error');
                }
            });
        } catch (error) {
            showNotification('Share not supported on this device', 'error');
        }
    }
}

async function showQRCodeModal(shortCode) {
    try {
        const response = await fetch(`${API_BASE}/qr/${shortCode}`);
        if (!response.ok) {
            throw new Error('Failed to generate QR code');
        }
        
        const data = await response.json();
        
        // Create modal for QR code display
        const modal = document.createElement('div');
        modal.className = 'qr-modal';
        modal.innerHTML = `
            <div class="qr-modal-content">
                <div class="qr-modal-header">
                    <h3>QR Code for /${shortCode}</h3>
                    <button onclick="closeQRModal()" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="qr-modal-body">
                    <img src="${data.qr_code}" alt="QR Code">
                    <p>${data.short_url}</p>
                    <div class="qr-modal-actions">
                        <button onclick="downloadQRFromModal('${data.qr_code}', '${shortCode}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button onclick="copyToClipboard('${data.short_url}')">
                            <i class="fas fa-copy"></i> Copy URL
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeQRModal();
            }
        });
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        showNotification('Failed to generate QR code', 'error');
    }
}

function closeQRModal() {
    const modal = document.querySelector('.qr-modal');
    if (modal) {
        modal.remove();
    }
}

function downloadQRFromModal(qrData, shortCode) {
    // Convert base64 to blob and download
    const base64Data = qrData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-code-${shortCode}.png`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('QR code downloaded successfully!', 'success');
}