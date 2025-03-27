// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-storage.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBhAicyUZ7HR3OeQpvFpwvfbrapjFrk6tE",
  authDomain: "fgbn-bank.firebaseapp.com",
  projectId: "fgbn-bank",
  storageBucket: "fgbn-bank.appspot.com",
  messagingSenderId: "1028097142454",
  appId: "1:1028097142454:web:fa7ad229c8605f1b1ec017",
  measurementId: "G-VYL14PLCQG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// Check if the user is authenticated
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Update user info in the DOM
      document.getElementById('firstName').textContent = userData.firstName || "N/A";
      document.getElementById('lastName').textContent = userData.lastName || "N/A";
      document.getElementById('email').textContent = userData.email || "N/A";
      document.getElementById('dob').textContent = userData.dob || "N/A";
      document.getElementById('phone').textContent = userData.phone || "N/A";
      document.getElementById('accountType').textContent = userData.accountType || "N/A";
      document.getElementById('accountNumber').textContent = userData.accountNumber || "N/A";
      document.getElementById('balance').textContent = `NGN ${userData.balance.toFixed(2)}`;

      // Update profile picture
      if (userData.profilePicture) {
        document.getElementById('profilePicture').src = userData.profilePicture;
      }

      // Real-time Firestore listener for balance updates
      onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const updatedData = doc.data();
          document.getElementById('balance').textContent = `NGN ${updatedData.balance.toFixed(2)}`;
        }
      });

      // Profile picture upload
      document.getElementById('profilePicture').addEventListener('click', () => {
        document.getElementById('profilePicInput').click();
      });

      document.getElementById('profilePicInput').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
          const storageRef = ref(storage, `profile_pictures/${user.uid}.png`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);

          // Update Firestore
          await setDoc(userDocRef, { profilePicture: downloadURL }, { merge: true });

          // Update UI
          document.getElementById('profilePicture').src = downloadURL;
        }
      });

    } else {
      console.log("No user data found!");
    }
  } else {
    window.location.href = 'createAccount.html';
  }
});

// Toggle dropdown menu
const profilePicture = document.getElementById('profilePicture');
const dropdownMenu = document.getElementById('profileDropdown');
const uploadOption = document.getElementById('uploadPicture');
const viewOption = document.getElementById('viewPicture');
const fileInput = document.getElementById('profilePicInput');

profilePicture.addEventListener('click', () => {
  dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
  if (!profilePicture.contains(event.target) && !dropdownMenu.contains(event.target)) {
    dropdownMenu.style.display = 'none';
  }
});

// Upload Picture
uploadOption.addEventListener('click', () => {
  fileInput.click();
  dropdownMenu.style.display = 'none';
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      profilePicture.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// View Picture option
viewOption.addEventListener('click', () => {
  const fullImageView = document.createElement('div');
  fullImageView.classList.add('full-image-view');
  fullImageView.innerHTML = `
    <div class='overlay'></div>
    <img src='${profilePicture.src}' class='full-image'>
    <button class='close-full'>X</button>
  `;
  document.body.appendChild(fullImageView);

  document.querySelector('.close-full').addEventListener('click', () => {
    fullImageView.remove();
  });
});

// Camera capture functionality
document.getElementById('cameraButton').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    document.body.appendChild(videoElement);

    const captureButton = document.createElement('button');
    captureButton.textContent = "Capture";
    document.body.appendChild(captureButton);

    captureButton.addEventListener('click', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/png');
      document.getElementById('profilePicture').src = imageData;

      // Stop camera stream
      stream.getTracks().forEach(track => track.stop());
      videoElement.remove();
      captureButton.remove();

      // Upload to Firebase
      const user = auth.currentUser;
      if (user) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}.png`);
        const response = await fetch(imageData);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        // Update Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { profilePicture: downloadURL }, { merge: true });

        // Update UI
        document.getElementById('profilePicture').src = downloadURL;
      }
    });
  } catch (error) {
    console.error("Error accessing camera:", error);
    alert("Camera permission is required.");
  }
});

// Close button to go back to the Landing page
document.getElementById('closeButton').addEventListener('click', () => {
  window.location.href = 'landing.html';
});

  



