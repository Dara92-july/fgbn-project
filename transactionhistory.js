import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const transactionList = document.getElementById("transaction-list");
const receiptModal = document.getElementById("receipt-modal");
const receiptDetails = document.getElementById("receipt-details");
const closeBtn = document.getElementById("close-btn");
const closePageBtn = document.getElementById("close-page-btn");
const loader = document.getElementById("loader");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter-btn");
const currentBalance = document.getElementById("current-balance");
const downloadReceiptBtn = document.getElementById("download-receipt");
const refreshBtn = document.getElementById("refresh-btn");
const userGreeting = document.getElementById("user-greeting");

// Close page button
closePageBtn.addEventListener("click", () => {
  window.location.href = "./landing.html";
});

// Refresh button
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (user) {
      const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
      displayTransactions(user.uid, activeFilter);
    }
  });
}

// Fetch user data including name
async function fetchUserData(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No user data found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    showToast("Error loading user data", false);
    return null;
  }
}

// Fetch recipient/sender name
async function fetchUserName(userId) {
  if (!userId || userId === "N/A") return "Unknown User";
  
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data().name || "Unknown User" : "Unknown User";
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "Unknown User";
  }
}

// Enhanced transaction fetching with better error handling and retry logic
async function fetchTransactions(userId) {
  try {
    console.log(`[DEBUG] Starting to fetch transactions for user: ${userId}`);
    // Query for sent transactions with error handling
    let sentTransactions = [];
    try {
      const sentQuery = query(
        collection(db, "transactions"),
        where("senderId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const sentSnapshot = await getDocs(sentQuery);
      for (const doc of sentSnapshot.docs) {
        const data = doc.data();
        sentTransactions.push({
          id: doc.id,
          type: "sent",
          amount: data.amount || 0,
          date: data.timestamp?.toDate() || new Date(),
          status: data.status || "completed",
          senderAccount: data.senderAccount || "N/A",
          recipientAccount: data.recipientAccount || "N/A",
          recipientName: await fetchUserName(data.recipientId),
          senderName: "You",
          description: data.description || "Money Transfer"
        });
      }
    } catch (sentError) {
      console.error("Error fetching sent transactions:", sentError);
      // If it's an index error, try without the orderBy
      if (sentError.code === 'failed-precondition') {
        console.log("Trying sent query without ordering...");
        const sentQuerySimple = query(
          collection(db, "transactions"),
          where("senderId", "==", userId)
        );
        const sentSnapshotSimple = await getDocs(sentQuerySimple);
        for (const doc of sentSnapshotSimple.docs) {
          const data = doc.data();
          sentTransactions.push({
            id: doc.id,
            type: "sent",
            amount: data.amount || 0,
            date: data.timestamp?.toDate() || new Date(),
            status: data.status || "completed",
            senderAccount: data.senderAccount || "N/A",
            recipientAccount: data.recipientAccount || "N/A",
            recipientName: await fetchUserName(data.recipientId),
            senderName: "You",
            description: data.description || "Money Transfer"
          });
        }
        // Sort manually if needed
        sentTransactions.sort((a, b) => b.date - a.date);
      }
    }

    // Query for received transactions with error handling
    let receivedTransactions = [];
    try {
      const receivedQuery = query(
        collection(db, "transactions"),
        where("recipientId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const receivedSnapshot = await getDocs(receivedQuery);
      for (const doc of receivedSnapshot.docs) {
        const data = doc.data();
        receivedTransactions.push({
          id: doc.id,
          type: "received",
          amount: data.amount || 0,
          date: data.timestamp?.toDate() || new Date(),
          status: data.status || "completed",
          senderAccount: data.senderAccount || "N/A",
          recipientAccount: data.recipientAccount || "N/A",
          senderName: await fetchUserName(data.senderId),
          recipientName: "You",
          description: data.description || "Money Received"
        });
      }
    } catch (receivedError) {
      console.error("Error fetching received transactions:", receivedError);
      // If it's an index error, try without the orderBy
      if (receivedError.code === 'failed-precondition') {
        console.log("Trying received query without ordering...");
        const receivedQuerySimple = query(
          collection(db, "transactions"),
          where("recipientId", "==", userId)
        );
        const receivedSnapshotSimple = await getDocs(receivedQuerySimple);
        for (const doc of receivedSnapshotSimple.docs) {
          const data = doc.data();
          receivedTransactions.push({
            id: doc.id,
            type: "received",
            amount: data.amount || 0,
            date: data.timestamp?.toDate() || new Date(),
            status: data.status || "completed",
            senderAccount: data.senderAccount || "N/A",
            recipientAccount: data.recipientAccount || "N/A",
            senderName: await fetchUserName(data.senderId),
            recipientName: "You",
            description: data.description || "Money Received"
          });
        }
        // Sort manually if needed
        receivedTransactions.sort((a, b) => b.date - a.date);
      }
    }

    // Query for deposits - simplified to just check one collection
    let deposits = [];
    try {
      const depositsQuery = query(
        collection(db, "deposits"),
        where("userId", "==", userId),
        orderBy("date", "desc")
      );
      const depositsSnapshot = await getDocs(depositsQuery);
      for (const doc of depositsSnapshot.docs) {
        const data = doc.data();
        deposits.push({
          id: doc.id,
          type: "deposit",
          amount: data.amount || 0,
          date: data.date?.toDate() || new Date(),
          status: "completed",
          description: data.description || "Deposit"
        });
      }
    } catch (depositError) {
      console.error("Error fetching deposits:", depositError);
      // Fallback to simple query if ordering fails
      if (depositError.code === 'failed-precondition') {
        const depositsQuerySimple = query(
          collection(db, "deposits"),
          where("userId", "==", userId)
        );
        const depositsSnapshotSimple = await getDocs(depositsQuerySimple);
        for (const doc of depositsSnapshotSimple.docs) {
          const data = doc.data();
          deposits.push({
            id: doc.id,
            type: "deposit",
            amount: data.amount || 0,
            date: data.date?.toDate() || new Date(),
            status: "completed",
            description: data.description || "Deposit"
          });
        }
        // Sort manually if needed
        deposits.sort((a, b) => b.date - a.date);
      }
    }

    // Combine all transactions
    const allTransactions = [...sentTransactions, ...receivedTransactions, ...deposits];
    
    // Final sort by date (most recent first)
    allTransactions.sort((a, b) => b.date - a.date);
    
    return allTransactions;
  } catch (error) {
    console.error("Error in fetchTransactions:", error);
    showToast("Error loading transactions", false);
    return [];
  }
}

// Display transactions with better error handling
async function displayTransactions(userId, filter = "all") {
  // Show loading state
  loader.style.display = "flex";
  emptyState.style.display = "none";
  transactionList.innerHTML = "";

  try {
    const [transactions, userData] = await Promise.all([
      fetchTransactions(userId),
      fetchUserData(userId)
    ]);

    // Update user info
    if (userData) {
      currentBalance.textContent = `₦${(userData.balance || 0).toFixed(2)}`;
      if (userGreeting && userData.name) {
        const names = userData.name.split(' ');
        userGreeting.textContent = Hello, `${names[0]} ${names.length > 1 ? names[names.length - 1] : ''}`;
      }
    }

    // Filter transactions
    const filtered = transactions.filter(t => filter === "all" || t.type === filter);
    
    if (filtered.length === 0) {
      emptyState.style.display = "flex";
    } else {
      filtered.forEach((transaction, index) => {
        const transactionItem = createTransactionElement(transaction, index);
        transactionList.appendChild(transactionItem);
      });
    }
  } catch (error) {
    console.error("Error displaying transactions:", error);
    showToast("Failed to load transactions", false);
    emptyState.style.display = "flex";
  } finally {
    loader.style.display = "none";
  }
}

// Helper function to create transaction DOM element
function createTransactionElement(transaction, index) {
  const dateStr = transaction.date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Set icon based on type
  const icons = {
    sent: "fa-arrow-up",
    received: "fa-arrow-down",
    deposit: "fa-plus-circle"
  };

  // Set status class
  const statusClass = `status-${transaction.status.toLowerCase()}`;

  const transactionItem = document.createElement("div");
  transactionItem.className = `transaction-item ${transaction.type}`;
  transactionItem.dataset.id = transaction.id;
  transactionItem.style.animationDelay = `${index * 0.1}s`;
  
  transactionItem.innerHTML = `
    <div class="transaction-details">
      <div class="transaction-type">
        <i class="fas ${icons[transaction.type] || 'fa-exchange-alt'}"></i>
        ${transaction.type.toUpperCase()}
      </div>
      <div class="transaction-date">${dateStr}</div>
      ${transaction.type === 'deposit' ? `
        <div class="transaction-description">${transaction.description}</div>
      ` : `
        <div class="transaction-counterparty">
          ${transaction.type === 'sent' ? 'To:' : 'From:'}
          ${transaction.type === 'sent' ? transaction.recipientName : transaction.senderName}
          (${transaction.type === 'sent' ? transaction.recipientAccount : transaction.senderAccount})
        </div>
      `}
      <div class="transaction-status ${statusClass}">
        ${transaction.status.toUpperCase()}
      </div>
    </div>
    <div class="amount-container">
      <div class="transaction-amount ${transaction.type}">
        ${transaction.type === 'sent' ? '-' : '+'}₦${transaction.amount.toFixed(2)}
      </div>
    </div>
  `;
  
  return transactionItem;
}

// Show receipt modal
async function showReceipt(transactionId) {
  try {
    const docRef = doc(db, "transactions", transactionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const transaction = docSnap.data();
      const date = transaction.timestamp?.toDate() || transaction.date?.toDate() || new Date();
      
      receiptDetails.innerHTML = `
        <div class="receipt-item">
          <span>Transaction ID:</span>
          <span>${transactionId.slice(0, 8)}</span>
        </div>
        <div class="receipt-item">
          <span>Date:</span>
          <span>${date.toLocaleString()}</span>
        </div>
        <div class="receipt-item">
          <span>Type:</span>
          <span>${(transaction.type || 'transfer').toUpperCase()}</span>
        </div>
        <div class="receipt-item">
          <span>Amount:</span>
          <span class="amount-${transaction.type || 'transfer'}">
            ${transaction.type === 'sent' ? '-' : '+'}₦${transaction.amount?.toFixed(2) || '0.00'}
          </span>
        </div>
        ${transaction.senderAccount ? `
          <div class="receipt-item">
            <span>Sender:</span>
            <span>${transaction.senderId === auth.currentUser?.uid ? 'You' : await fetchUserName(transaction.senderId)} 
            (${transaction.senderAccount})</span>
          </div>
        ` : ''}
        ${transaction.recipientAccount ? `
          <div class="receipt-item">
            <span>Recipient:</span>
            <span>${transaction.recipientId === auth.currentUser?.uid ? 'You' : await fetchUserName(transaction.recipientId)} 
            (${transaction.recipientAccount})</span>
          </div>
        ` : ''}
        ${transaction.description ? `
          <div class="receipt-item">
            <span>Description:</span>
            <span>${transaction.description}</span>
          </div>
        ` : ''}
      `;
      
      receiptModal.style.display = "flex";
    } else {
      showToast("Transaction not found", false);
    }
  } catch (error) {
    console.error("Error showing receipt:", error);
    showToast("Error loading receipt", false);
  }
}

// Event listeners
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    const user = auth.currentUser;
    if (user) displayTransactions(user.uid, button.dataset.filter);
  });
});

transactionList.addEventListener("click", (e) => {
  const item = e.target.closest(".transaction-item");
  if (item) showReceipt(item.dataset.id);
});

closeBtn.addEventListener("click", () => {
  receiptModal.style.display = "none";
});

if (downloadReceiptBtn) {
  downloadReceiptBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text("Transaction Receipt", 105, 20, { align: 'center' });
    doc.text(new Date().toLocaleDateString(), 105, 30, { align: 'center' });
    
    const items = receiptDetails.querySelectorAll('.receipt-item');
    let y = 50;
    
    items.forEach(item => {
      const [label, value] = item.querySelectorAll('span');
      doc.setFont('helvetica', 'bold');
      doc.text(`${label.textContent}:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value.textContent, 80, y);
      y += 10;
    });
    
    doc.save(`receipt-${Date.now()}.pdf`);
  });
}

// Utility function
function showToast(message, isSuccess) {
  const toast = document.createElement("div");
  toast.className = `toast ${isSuccess ? "success" : "error"}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Initialize the page
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      console.log("[DEBUG] User authenticated:", user.uid);
      await displayTransactions(user.uid);
    } catch (error) {
      console.error("Initialization error:", error);
      showToast("Error loading account data", false);
    }
  } else {
    window.location.href = "./signin.html";
  }
});