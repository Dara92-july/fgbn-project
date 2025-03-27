import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { 
  getAnalytics 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";

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
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');
const eyeSlashIcon = document.getElementById('eyeSlashIcon');
const loaderContainer = document.getElementById("loader-container");
const toggleSecurityCode = document.getElementById('toggleSecurityCode');
const securityCodeInput = document.getElementById('securityCode');
const eyeIconSecurityCode = document.getElementById('eyeIconSecurityCode');
const eyeSlashIconSecurityCode = document.getElementById('eyeSlashIconSecurityCode');


backButton.addEventListener('click', () => {
  window.location.href = 'signin.html';
});

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

  console.log('Password input type:', passwordInput.getAttribute('type'));
  console.log(isPasswordHidden ? 'Password is hidden, showing eye icon' : 'Password is visible, showing eye-slash icon');
});

toggleSecurityCode.addEventListener('click', () => {
  const isSecurityCodeHidden = securityCodeInput.getAttribute('type') === 'password';

  if (isSecurityCodeHidden) {
    securityCodeInput.setAttribute('type', 'text');
    eyeIconSecurityCode.style.display = 'none';
    eyeSlashIconSecurityCode.style.display = 'inline';
  } else {
    securityCodeInput.setAttribute('type', 'password');
    eyeIconSecurityCode.style.display = 'inline';
    eyeSlashIconSecurityCode.style.display = 'none';
  }

  console.log('Security code input type:', securityCodeInput.getAttribute('type'));
  console.log(isSecurityCodeHidden ? 'Security code is hidden, showing eye icon' : 'Security code is visible, showing eye-slash icon');
});

createAccountForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loaderContainer.style.display = 'block';

  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    dob: document.getElementById('dob').value,
    phone: document.getElementById('phone').value.trim(),
    accountType: document.getElementById('accountType').value,
    securityCode: document.getElementById('securityCode').value.trim()  // Collect security code
  };

  // Validate the security code (must be exactly 4 digits)
  if (!/^\d{4}$/.test(formData.securityCode)) {
    loaderContainer.style.display = 'none';
    showPopup('Security code must be exactly 4 digits.');
    return;
  }

  try {
    // Create user and send verification email
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    await sendEmailVerification(user);

    showPopup('Verification email sent. Please check your inbox.');

    // Start verification polling
    const verificationCheckInterval = setInterval(async () => {
      try {
        console.log("Checking email verification status...");
        await user.reload();
        console.log("Current verification status:", user.emailVerified);

        if (user.emailVerified) {
          clearInterval(verificationCheckInterval);
          console.log("Email verified! Saving user data...");

          // Save to Firestore including the security code
          await setDoc(doc(db, 'users', user.uid), {
            ...formData,
            accountNumber: 'ACCT-' + (Math.floor(Math.random() * 90000) + 10000),
            balance: 0,
            uid: user.uid
          });

          // Update UI and redirect
          loaderContainer.style.display = 'none';
          sessionStorage.setItem('userData', JSON.stringify({ ...formData, uid: user.uid }));
          window.location.href = '../landing.html';
        }
      } catch (error) {
        console.error("Verification check failed:", error);
        clearInterval(verificationCheckInterval);
        loaderContainer.style.display = 'none';
        showPopup(`Error: ${error.message}`);
      }
    }, 5000);

  } catch (error) {
    console.error("Account creation failed:", error);
    loaderContainer.style.display = 'none';
    showPopup(`Error: ${error.message}`);
  }
});
