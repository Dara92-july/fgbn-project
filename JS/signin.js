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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();

// script.js

window.addEventListener('load', () => {
  // Set the duration of the splash screen (e.g., 3 seconds)
  const splashDuration = 3000;

  // Hide the splash screen and show the main content after the duration
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
  // Check if a popup container already exists; if not, create one.
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
    popupContainer.style.zIndex = "1000";
    document.body.appendChild(popupContainer);
  }
  
  // Create the pop-up box with the message and OK button.
  const popupBox = document.createElement("div");
  popupBox.style.backgroundColor = "#fff";
  popupBox.style.padding = "20px";
  popupBox.style.borderRadius = "8px";
  popupBox.style.textAlign = "center";
  popupBox.style.minWidth = "300px";
  popupBox.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  popupBox.innerHTML = `<p>${message}</p><button id="popupOkButton">OK</button>`;
  
  // Clear any previous content and display the new pop-up.
  popupContainer.innerHTML = "";
  popupContainer.appendChild(popupBox);
  
  // Attach an event listener to the OK button to hide the pop-up.
  document.getElementById("popupOkButton").addEventListener("click", () => {
    popupContainer.style.display = "none";
  });
  
  // Make sure the container is visible.
  popupContainer.style.display = "flex";
}

// DOM element references
const signInButton = document.getElementById('signInButton');
const signInPage = document.getElementById('signInPage');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const cancelButton = document.getElementById('cancelButton');
const signInSubmit = document.getElementById('signInSubmit');

// Show the sign-in form on button click
signInButton.addEventListener('click', () => {
  signInPage.classList.add('show');
});

// Hide the sign-in form on cancel (X) button click
cancelButton.addEventListener('click', () => {
  signInPage.classList.remove('show');
});

// Toggle password visibility
togglePassword.addEventListener('change', () => {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
});

// Sign in with Firebase Authentication and check Firestore for user profile
signInSubmit.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check Firestore for the user data
    const userDocRef = doc(db, "users", user.uid);  // Assuming your user data is stored in a collection named "users"
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Save the user data in session storage
      sessionStorage.setItem('userData', JSON.stringify(userData));

      // Redirect to the landing page after a successful login
      window.location.href = 'landing.html';
    } else {
      console.error('No such user in Firestore');
      showPopup('No user data found');
    }
  } catch (error) {
    console.error('Error signing in:', error);
    showPopup('Error signing in: ' + error.message);
  }
});
