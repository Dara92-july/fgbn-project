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
  addDoc
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
const loaderContainer = document.getElementById("loader-container");
const recipientDetails = document.getElementById("recipientDetails");
const recipientProfilePic = document.getElementById("recipientProfilePic");
const recipientName = document.getElementById("recipientName");


// Function to show toast messages
function showToast(message, isSuccess) {
  const toast = document.createElement("div");
  toast.className = `toast ${isSuccess ? "success" : "error"}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    if (isSuccess) {
      // Redirect to landing page after successful transfer
      window.location.href = "../landing.html";
    }
  }, 3000);
}

// Fetch recipient details when account number changes
recipientInput.addEventListener("blur", async () => {
  const accountNumber = recipientInput.value.trim();
  if (!accountNumber) {
    recipientDetails.style.display = "none";
    return;
  }

  loaderContainer.style.display = "flex";
  try {
    const recipientQuery = query(
      collection(db, "users"),
      where("accountNumber", "==", accountNumber)
    );
    const recipientSnapshot = await getDocs(recipientQuery);

    if (recipientSnapshot.empty) {
      showToast("Recipient not found", false);
      recipientDetails.style.display = "none";
      return;
    }

    const recipientData = recipientSnapshot.docs[0].data();
    recipientName.textContent = `${recipientData.firstName} ${recipientData.lastName}`;
    recipientProfilePic.src = recipientData.profilePicture || "default-avatar.jpg";
    recipientDetails.style.display = "flex";
  } catch (error) {
    console.error("Recipient fetch error:", error);
    showToast("Error fetching recipient details", false);
  } finally {
    loaderContainer.style.display = "none";
  }
});

// Clear recipient details when input changes
recipientInput.addEventListener("input", () => {
  recipientDetails.style.display = "none";
});
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

  // Show loader
  loaderContainer.style.display = "flex";

  // Get the current logged-in user
  const user = auth.currentUser;

  if (!user) {
    showToast("You must be logged in to perform a transfer.", false);
    loaderContainer.style.display = "none"; // Hide loader
    return;
  }

  const senderUserId = user.uid; // Dynamically fetch the sender's user ID

  try {
    // Fetch sender's data from Firestore
    const senderRef = doc(db, "users", senderUserId);
    const senderSnapshot = await getDoc(senderRef);

    if (!senderSnapshot.exists()) {
      showToast("Sender account not found.", false);
      loaderContainer.style.display = "none"; // Hide loader
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
      loaderContainer.style.display = "none"; // Hide loader
      return;
    }

    const recipientData = recipientSnapshot.docs[0].data();
    const recipientUserId = recipientSnapshot.docs[0].id;

    // Check if sender has sufficient balance
    if (senderData.balance < amount) {
      showToast("Insufficient balance.", false);
      loaderContainer.style.display = "none"; // Hide loader
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

    const transactionData = {
      senderId: senderUserId,
      recipientId: recipientUserId,
      amount: amount,
      timestamp: new Date(),
      senderAccount: senderData.accountNumber,
      recipientAccount: recipientAccountNumber,
      status: "completed"
    };
    
    await addDoc(collection(db, "transactions"), transactionData);

    // Hide loader and show success toast
    loaderContainer.style.display = "none";
    showToast("Transfer successful!", true);

    // Clear form
    transferForm.reset();
  } catch (error) {
    console.error("Error during transfer:", error);
    loaderContainer.style.display = "none"; // Hide loader
    showToast("An error occurred. Please try again.", false);
  }
});
