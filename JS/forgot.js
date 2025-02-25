// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
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

// Attach the event listener after the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("resetPasswordButton").addEventListener("click", resetPassword);
});

// Function to handle the password reset
function resetPassword() {
  // Get the email input element (assumes an element with id "email")
  const emailInput = document.getElementById("email");
  const email = emailInput.value.trim();

  // Basic validation to ensure an email is entered
  if (!email) {
    showPopup("Please enter your registered email address.");
    return;
  }

  // Send the password reset email using Firebase Auth
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Inform the user that the email has been sent
      showPopup("Password reset email sent! Please check your inbox.");
    })
    .catch((error) => {
      // Handle errors here (e.g., invalid email, user not found)
      console.error("Error sending password reset email:", error);
      showPopup(`Error: ${error.message}`);
    });
}
