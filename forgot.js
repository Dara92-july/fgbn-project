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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();

/**
 * Displays a centered pop-up message with an OK button.
 * @param {string} message - The message to display in the pop-up.
 */
function showPopup(message, callback = null) {
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
    if (callback) {
      callback();  // Call the provided callback function after closing the popup (used for redirection)
    }
  });

  popupContainer.style.display = "flex";
}

// Attach the event listener after the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("resetPasswordButton").addEventListener("click", resetPassword);
  document.getElementById("closeButton").addEventListener("click", () => {
    window.location.href = "./index.html"; 
  });
});

function resetPassword() {
  const emailInput = document.getElementById("email");
  const email = emailInput.value.trim();

  if (!email) {
    showPopup("Please enter your registered email address.");
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Show success message and redirect to sign-in page
      showPopup("Password reset email sent! Please check your inbox.", () => {
        window.location.href = "./index.html"; 
      });
    })
    .catch((error) => {
      console.error("Error sending password reset email:", error);
      showPopup(`Error: ${error.message}`);
    });
}
