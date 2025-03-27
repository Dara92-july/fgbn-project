// theme.js - Shared across all pages

// Function to apply the current theme
function applyTheme() {
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark-mode') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
    
    // Update toggle button text if it exists on this page
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.textContent = savedTheme === 'dark-mode' ? 'LIGHT MODE' : 'DARK MODE';
    }
}

// Function to toggle theme
function toggleTheme() {
    const body = document.body;
    
    if (body.classList.contains('dark-mode')) {
        localStorage.removeItem('theme');
    } else {
        localStorage.setItem('theme', 'dark-mode');
    }
    
    applyTheme(); // Apply the change immediately
}

// Initialize theme when page loads
document.addEventListener('DOMContentLoaded', applyTheme);

console.log('Theme initialized. Current theme:', localStorage.getItem('theme'));
console.log('Body has dark mode:', document.body.classList.contains('dark-mode'));

console.log('Body classes:', document.body.classList);