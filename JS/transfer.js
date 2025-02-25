
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const transferForm = document.getElementById("transferForm");
const recipientInput = document.getElementById("recipient");
const amountInput = document.getElementById("amount");
const toastContainer = document.getElementById("toast-container");

// Function to show toast messages
function showToast(message, isSuccess) {
  const toast = document.createElement("div");
  toast.className = `toast ${isSuccess ? "success" : "error"}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Handle form submission
transferForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const recipientAccountNumber = recipientInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());

  // Validate input
  if (!recipientAccountNumber || isNaN(amount) || amount <= 0) {
    showToast("Invalid input. Please check the recipient account number and amount.", false);
    return;
  }

  // Get the current logged-in user
  const user = auth.currentUser;

  if (!user) {
    showToast("You must be logged in to perform a transfer.", false);
    return;
  }

  const senderUserId = user.uid; // Dynamically fetch the sender's user ID

  try {
    // Fetch sender's data from Firestore
    const senderRef = doc(db, "users", senderUserId);
    const senderSnapshot = await getDoc(senderRef);

    if (!senderSnapshot.exists()) {
      showToast("Sender account not found.", false);
      return;
    }

    const senderData = senderSnapshot.data();

    // Fetch recipient's data from Firestore using account number
    const recipientQuery = query(
      collection(db, "users"),
      where("accountNumber", "==", recipientAccountNumber)
    );
    const recipientSnapshot = await getDocs(recipientQuery);

    if (recipientSnapshot.empty) {
      showToast("Recipient account not found.", false);
      return;
    }

    const recipientData = recipientSnapshot.docs[0].data();
    const recipientUserId = recipientSnapshot.docs[0].id;

    // Check if sender has sufficient balance
    if (senderData.balance < amount) {
      showToast("Insufficient balance.", false);
      return;
    }

    // Perform the transfer
    const newSenderBalance = senderData.balance - amount;
    const newRecipientBalance = recipientData.balance + amount;

    // Update sender's balance
    await updateDoc(senderRef, { balance: newSenderBalance });

    // Update recipient's balance
    const recipientRef = doc(db, "users", recipientUserId);
    await updateDoc(recipientRef, { balance: newRecipientBalance });

    showToast("Transfer successful!", true);

    // Clear form
    transferForm.reset();
  } catch (error) {
    console.error("Error during transfer:", error);
    showToast("An error occurred. Please try again.", false);
  }
});

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user.uid);
  } else {
    console.log("No user is logged in.");
    // Redirect to login page or show a login prompt
  }
});