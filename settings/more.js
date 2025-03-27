// DOM Elements
const sss = document.querySelector('.sss');
const more = document.querySelector('.more');
const set = document.querySelector('.set');
const div = document.querySelector('.div');
const body = document.body;
const img = document.getElementById('img');
const th = document.querySelector('.th');
const bu = document.querySelector('.bu');
const se = document.querySelector('.set');
const arrowIcon = document.querySelector('.th img'); 
const log = document.getElementById('log');
const out = document.querySelector('.out');
const homeDiv = document.querySelector('.home');
const moreDiv = document.querySelector('.more2');
const loader = document.querySelector('.loader-container');
const socket = document.querySelector('.socket');
const themeToggle = document.getElementById('theme-toggle');

// Loader timeout
window.addEventListener('load', () => {
    setTimeout(() => {
        if (loader) loader.style.display = 'none';
    }, 1000);
});

// Theme functionality
function updateButtonText(theme) {
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark-mode' ? 'LIGHT MODE' : 'DARK MODE';
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark-mode') {
        body.classList.add('dark-mode');
        updateButtonText('dark-mode');
    } else {
        updateButtonText('light-mode');
    }
}

if (themeToggle) {
    themeToggle.style.display = 'none';
    
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        
        if (isDarkMode) {
            localStorage.setItem('theme', 'dark-mode');
        } else {
            localStorage.removeItem('theme');
        }
        updateButtonText(isDarkMode ? 'dark-mode' : 'light-mode');
    });
}

// Navigation functionality
if (sss) {
    sss.addEventListener('click', () => {
        if (div) div.style.display = 'none';
        if (set) set.style.display = 'block';
        if (homeDiv) homeDiv.style.display = 'none';
        if (moreDiv) moreDiv.style.display = 'none';
    });
}

if (th) {
    th.addEventListener('click', () => {
        if (se) se.style.display = 'none';
        if (bu) bu.style.display = 'block';
        if (themeToggle) themeToggle.style.display = 'block';
        if (arrowIcon) arrowIcon.style.display = 'none';
    });
}

if (img) {
    img.addEventListener('click', () => {
        if (themeToggle) themeToggle.style.display = 'none';
        if (div) div.style.display = 'block';
        if (sss) sss.style.display = 'block';
        if (homeDiv) homeDiv.style.display = 'block';
        if (moreDiv) moreDiv.style.display = 'block';
        if (bu) bu.style.display = 'none';
    });
}

// Footer navigation
const clearActive = () => {
    if (homeDiv) homeDiv.style.color = 'black';
    if (moreDiv) moreDiv.style.color = 'black';
};

const activateHome = () => {
    clearActive();
    if (homeDiv) homeDiv.style.color = 'red';
};

const activateMore2 = () => {
    clearActive();
    if (moreDiv) moreDiv.style.color = 'red';
};

if (moreDiv) {
    activateMore2();
}

if (homeDiv) {
    homeDiv.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = "../landing.html";
    });
}

// Initialize theme on page load
initializeTheme();
document.querySelector('.sss').addEventListener('click', () => {
    console.log('SSS clicked!');
});