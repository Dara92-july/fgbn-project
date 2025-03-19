// Select elements
const sss = document.querySelector('.sss');
const more = document.querySelector('.more');
const set = document.querySelector('.set');
const div = document.querySelector('.div');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const img = document.getElementById('img');
const th = document.querySelector('.th');
const bu = document.querySelector('.bu');
const se = document.querySelector('.set');
const arrowIcon = document.querySelector('.th img'); 
const log = document.getElementById('log');
const out = document.querySelector('.out');

log.addEventListener('click',()=> {
    // let confirmExit = confirm ('are you sure you wanna leave ?');
    // if (confirmExit){
    //     log.style.display = 'none'
    // }else{
    //     log.style.display = 'block'
    // }
})

themeToggle.style.display = 'none';

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
    updateButtonText(savedTheme);
}

function updateButtonText(theme) {
    themeToggle.textContent = theme === 'dark-mode' ? 'LIGHT MODE' : 'DARK MODE';
    // toggleMoreTheme()
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const newTheme = body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', newTheme);
    updateButtonText(newTheme);
});

window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
    return 'Are you sure you want to leave? Your changes may not be saved.';
});


sss.addEventListener('click', () => {
    sss.style.display = 'none';
    div.style.display = 'none';
    set.style.display = 'block';
});

th.addEventListener('click', () => {
    se.style.display = 'none';
    bu.style.display = 'block';
    themeToggle.style.display = 'block';
    arrowIcon.style.display = 'none';
});

img.addEventListener('click', () => {
    themeToggle.style.display = 'none'; 
    img.style.display = 'block';
    div.style.display = 'block';
    sss.style.display = 'block';
    bu.style.display = 'none'; 
    arrowIcon.style.display = 'none';
});
