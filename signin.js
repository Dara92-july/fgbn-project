// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhAicyUZ7HR3OeQpvFpwvfbrapjFrk6tE",
  authDomain: "fgbn-bank.firebaseapp.com",
  projectId: "fgbn-bank",
  storageBucket: "fgbn-bank.firebasestorage.app",
  messagingSenderId: "1028097142454",
  appId: "1:1028097142454:web:fa7ad229c8605f1b1ec017",
  measurementId: "G-VYL14PLCQG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();

// Splash screen logic
window.addEventListener('load', () => {
  const splashDuration = 3000;

  setTimeout(() => {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
  }, splashDuration);
});

/**
 * Displays a centered pop-up message with an OK button.
 * @param {string} message - The message to display in the pop-up.
 */
function showPopup(message) {
  let popupContainer = document.getElementById("popupContainer");
  if (!popupContainer) {
    popupContainer = document.createElement("div");
    popupContainer.id = "popupContainer";
    popupContainer.style.position = "fixed";
    popupContainer.style.top = "0";
    popupContainer.style.left = "0";
    popupContainer.style.width = "100%";
    popupContainer.style.height = "100%";
    popupContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    popupContainer.style.display = "flex";
    popupContainer.style.justifyContent = "center";
    popupContainer.style.alignItems = "center";
    popupContainer.style.zIndex = "2000";
    document.body.appendChild(popupContainer);
  }
  
  const popupBox = document.createElement("div");
  popupBox.style.backgroundColor = "#fff";
  popupBox.style.padding = "20px";
  popupBox.style.borderRadius = "8px";
  popupBox.style.textAlign = "center";
  popupBox.style.minWidth = "300px";
  popupBox.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  popupBox.innerHTML = `<p>${message}</p><button id="popupOkButton">OK</button>`;
  
  popupContainer.innerHTML = "";
  popupContainer.appendChild(popupBox);
  
  document.getElementById("popupOkButton").addEventListener("click", () => {
    popupContainer.style.display = "none";
  });
  
  popupContainer.style.display = "flex";
}

// DOM element references
const signInButton = document.getElementById('signInButton');
const signInPage = document.getElementById('signInPage');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const cancelButton = document.getElementById('cancelButton');
const signInSubmit = document.getElementById('signInSubmit');
const eyeIcon = document.getElementById('eyeIcon');
const eyeSlashIcon = document.getElementById('eyeSlashIcon');

// --- Toggle Sign In Page ---
signInButton.addEventListener('click', () => {
  signInPage.classList.add('active');  // use "active" (matches CSS)
});

cancelButton.addEventListener('click', () => {
  signInPage.classList.remove('active');
});

// --- Toggle password visibility ---
togglePassword.addEventListener('click', () => {
  const isPasswordHidden = passwordInput.getAttribute('type') === 'password';

  if (isPasswordHidden) {
    passwordInput.setAttribute('type', 'text');
    eyeIcon.style.display = 'none';
    eyeSlashIcon.style.display = 'inline';
  } else {
    passwordInput.setAttribute('type', 'password');
    eyeIcon.style.display = 'inline';
    eyeSlashIcon.style.display = 'none';
  }
});

// --- Sign In with Firebase ---
signInSubmit.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showPopup("Please enter both email and password");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check Firestore for the user data
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Save the user data in session storage
      sessionStorage.setItem('userData', JSON.stringify(userData));

      window.location.href = './landing.html';
    } else {
      console.error('No such user in Firestore');
      showPopup('No user data found');
    }
  } catch (error) {
    console.error('Error signing in:', error);
    showPopup('Error signing in: ' + error.message);
  }
});
