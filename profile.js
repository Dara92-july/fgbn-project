import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let unsubscribeAuth = null;

// Authentication state handler
unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  
  // DOM ready check with fallback
  const domReadyHandler = () => {
    if (checkRequiredElements()) {
      initializeProfilePage();
      loadUserData();
    } else {
      console.error("Some elements are missing in the DOM");
      alert("Critical components missing - please refresh the page");
    }
  };

  if (document.readyState === 'complete') {
    domReadyHandler();
  } else {
    document.addEventListener('DOMContentLoaded', domReadyHandler);
  }
});

function checkRequiredElements() {
  const requiredIds = [
    'profilePicture', 'profileDropdown', 'uploadPicture',
    'viewPicture', 'profilePicInput', 'cameraButton',
    'cameraModal', 'videoElement', 'captureButton',
    'closeModal', 'fullImageView', 'fullImage', 'closeFullImage',
    'firstName', 'lastName', 'email', 'dob', 'phone',
    'accountType', 'accountNumber', 'balance'
  ];

  return requiredIds.every(id => {
    const element = document.getElementById(id);
    if (!element) console.error(`Missing element with ID: ${id}`);
    return !!element;
  });
}

function initializeProfilePage() {
  // DOM elements
  const elements = {
    profilePicture: document.getElementById("profilePicture"),
    profileDropdown: document.getElementById("profileDropdown"),
    uploadPicture: document.getElementById("uploadPicture"),
    viewPicture: document.getElementById("viewPicture"),
    profilePicInput: document.getElementById("profilePicInput"),
    cameraButton: document.getElementById("cameraButton"),
    cameraModal: document.getElementById("cameraModal"),
    videoElement: document.getElementById("videoElement"),
    captureButton: document.getElementById("captureButton"),
    closeModal: document.getElementById("closeModal"),
    fullImageView: document.getElementById("fullImageView"),
    fullImage: document.getElementById("fullImage"),
    closeFullImage: document.getElementById("closeFullImage")
  };

  // Event listeners
  elements.profilePicture.addEventListener("click", () => {
    elements.profileDropdown.classList.toggle("show");
  });

  elements.uploadPicture.addEventListener("click", () => elements.profilePicInput.click());
  
  elements.profilePicInput.addEventListener("change", handleFileUpload);
  elements.viewPicture.addEventListener("click", showFullImage);
  elements.closeFullImage.addEventListener("click", hideFullImage);
  elements.cameraButton.addEventListener("click", openCamera);
  elements.closeModal.addEventListener("click", closeCamera);
  elements.captureButton.addEventListener("click", capturePhoto);

  // Window click handler
  window.addEventListener('click', (e) => {
    if (!e.target.closest('#profilePicture') && elements.profileDropdown.classList.contains('show')) {
      elements.profileDropdown.classList.remove('show');
    }
  });
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      await updateProfilePicture(e.target.result);
      showUpdateNotification();
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Upload error:", error);
    alert("Error uploading image");
  }
}

async function loadUserData() {
  showLoader();
  
  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();
    updateProfileFields(userData);
    
    if (userData.profilePicture) {
      document.getElementById('profilePicture').src = userData.profilePicture;
    }

  } catch (error) {
    console.error("Data load error:", error);
    alert("Error loading profile data");
  } finally {
    hideLoader();
  }
}

function updateProfileFields(data) {
  const fields = {
    'firstName': data.firstName || 'Not set',
    'lastName': data.lastName || 'Not set',
    'email': data.email || 'No email',
    'dob': data.dob || 'Not set',
    'phone': data.phone || 'Not provided',
    'accountType': data.accountType || 'Standard',
    'accountNumber': data.accountNumber || 'N/A',
    'balance': `NGN ${data.balance?.toFixed(2) || '0.00'}`
  };

  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

async function updateProfilePicture(imageData) {
  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, { profilePicture: imageData }, { merge: true });
    document.getElementById('profilePicture').src = imageData;
  } catch (error) {
    console.error("Update error:", error);
    throw error;
  }
}

// Camera functions
async function openCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById('cameraModal').style.display = "block";
    document.getElementById('videoElement').srcObject = stream;
  } catch (error) {
    console.error("Camera error:", error);
    alert("Camera access denied");
  }
}

function closeCamera() {
  const video = document.getElementById('videoElement');
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  document.getElementById('cameraModal').style.display = "none";
}

async function capturePhoto() {
  try {
    const video = document.getElementById('videoElement');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/png');
    
    await updateProfilePicture(imageData);
    closeCamera();
    showUpdateNotification();
  } catch (error) {
    console.error("Capture error:", error);
    alert("Error capturing photo");
  }
}

// UI Helpers
function showFullImage() {
  document.getElementById('fullImage').src = document.getElementById('profilePicture').src;
  document.getElementById('fullImageView').style.display = "block";
}

function hideFullImage() {
  document.getElementById('fullImageView').style.display = "none";
}

function showUpdateNotification() {
  const popup = document.getElementById('updatePopup');
  if (popup) {
    popup.style.display = 'block';
    setTimeout(() => popup.style.display = 'none', 3000);
  }
}

function showLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'flex';
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
}

// Cleanup
window.addEventListener('beforeunload', () => {
  if (unsubscribeAuth) unsubscribeAuth();
  closeCamera();
});