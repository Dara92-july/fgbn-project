import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js"; 
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js"; 
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";

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

// Helper: Display a custom popup message with an OK button
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
  });
  
  popupContainer.style.display = "flex";
}

// Get DOM element references
const createAccountForm = document.getElementById('createAccountForm');
const backButton = document.getElementById('backButton');
const loader = document.getElementById('loader');

// Navigate back to sign-in page when the back button is clicked
backButton.addEventListener('click', () => {
  window.location.href = 'signin.html';
});

createAccountForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Show loader while processing the account creation
  loader.style.display = 'block';

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const dob = document.getElementById('dob').value;
  const phone = document.getElementById('phone').value.trim();
  const accountType = document.getElementById('accountType').value;

  try {
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Generate a random account number
    const accountNumber = 'ACCT-' + (Math.floor(Math.random() * 90000) + 10000);

    // Save user details in Firestore (including uid)
    await setDoc(doc(db, 'users', user.uid), {
      firstName,
      lastName,
      email,
      dob,
      phone,
      accountType,
      accountNumber,
      balance: 0,
      uid: user.uid
    });

    // Create a newUserData object and store it in sessionStorage
    const newUserData = { 
      firstName, 
      lastName, 
      email, 
      dob, 
      phone, 
      accountType, 
      accountNumber, 
      balance: 0, 
      uid: user.uid 
    };
    sessionStorage.setItem('userData', JSON.stringify(newUserData));

    // Simulate a short delay (optional) for the loader to be visible
    setTimeout(() => {
      window.location.href = 'landing.html';
    }, 1500); // 1.5 seconds delay
  } catch (error) {
    console.error('Error creating account:', error);
    showPopup('Error creating account: ' + error.message);
    loader.style.display = 'none';
  }
});

// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const passwordField = document.getElementById('password');

togglePassword.addEventListener('change', () => {
  passwordField.type = togglePassword.checked ? 'text' : 'password';
});
