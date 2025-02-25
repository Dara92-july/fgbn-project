import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase config and initialization
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
const auth = getAuth();
const db = getFirestore();

// Check if the user is authenticated
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Update DOM with user data
      document.getElementById('firstName').textContent = userData.firstName;
      document.getElementById('lastName').textContent = userData.lastName;
      document.getElementById('email').textContent = userData.email;
      document.getElementById('dob').textContent = userData.dob;
      document.getElementById('phone').textContent = userData.phone;
      document.getElementById('accountType').textContent = userData.accountType;
      document.getElementById('accountNumber').textContent = userData.accountNumber;
      document.getElementById('balance').textContent = `NGN ${userData.balance}`;
      
      // If the user has previously updated their profile picture, display it
      if (userData.profilePicture) {
        document.getElementById('profilePicture').src = userData.profilePicture;
      }

      // Real-time Firestore listener for balance updates
      onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const updatedData = doc.data();
          document.getElementById('balance').textContent = `NGN ${updatedData.balance}`;
        }
      });

      // When the profile picture is clicked, trigger the file input
      document.getElementById('profilePicture').addEventListener('click', () => {
        document.getElementById('profilePicInput').click();
      });

      // When a new profile picture is selected
      document.getElementById('profilePicInput').addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async function(e) {
            // Replace the default icon with the new profile picture
            const profilePicture = document.getElementById('profilePicture');
            profilePicture.src = e.target.result;

            // Update Firestore with the new profile picture
            await setDoc(userDocRef, { profilePicture: e.target.result }, { merge: true });

            // Show a popup message confirming the update
            const popup = document.getElementById('updatePopup');
            popup.style.display = 'block';
            setTimeout(() => {
              popup.style.display = 'none';
            }, 5000); // Popup disappears after 5 seconds
          };
          reader.readAsDataURL(file);
        }
      });
    } else {
      console.log("No such user data!");
    }
  } else {
    window.location.href = 'createAccount.html';
  }
});
