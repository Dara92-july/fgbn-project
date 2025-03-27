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
const transactionList = document.getElementById("transaction-list");
const receiptModal = document.getElementById("receipt-modal");
const receiptDetails = document.getElementById("receipt-details");
const closeBtn = document.getElementById("close-btn");
const closePageBtn = document.getElementById("close-page-btn");
const printReceiptBtn = document.getElementById("print-receipt");
const loader = document.getElementById("loader");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter-btn");
const currentBalance = document.getElementById("current-balance");
const downloadReceiptBtn = document.getElementById("download-receipt");

closePageBtn.addEventListener("click", () => {
    window.location.href = "../landing.html";
});

document.addEventListener("DOMContentLoaded", () => {
    const downloadReceiptBtn = document.getElementById("download-receipt"); // Check if the element exists

    if (downloadReceiptBtn) {
        // Attach the event listener to the download button
        downloadReceiptBtn.addEventListener("click", downloadPDF);
    } else {
        console.error("Download receipt button not found.");
    }
});

// Fetch user balance
async function fetchBalance(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data().balance : 0;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}

async function fetchTransactions(userId) {
  try {
    // Fetch transfers (sent and received)
    const sentQuery = query(
      collection(db, "transactions"),
      where("senderId", "==", userId)
    );
    const receivedQuery = query(
      collection(db, "transactions"),
      where("recipientId", "==", userId)
    );

    // Fetch deposits
    const depositsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", userId), // Assuming deposits have a userId field
      where("type", "==", "deposit")
    );

    const [sentSnapshot, receivedSnapshot, depositsSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery),
      getDocs(depositsQuery)
    ]);

    const transactions = [];

    // Process transfers
    const processTransfer = (doc, type) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        type: type,
        amount: data.amount,
        date: data.timestamp.toDate(),
        status: data.status,
        senderAccount: data.senderAccount,
        recipientAccount: data.recipientAccount
      });
    };

    sentSnapshot.forEach(doc => processTransfer(doc, "sent"));
    receivedSnapshot.forEach(doc => processTransfer(doc, "received"));

    // deposits processing:
depositsSnapshot.forEach(doc => {
    const data = doc.data();
    transactions.push({
        id: doc.id,
        type: "deposit",
        amount: data.amount,
        date: data.date.toDate(), // Use Firestore timestamp conversion
        status: "completed",
        description: data.description
    });
});

    // Sort all transactions by date
    return transactions.sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

async function displayTransactions(userId, filter = "all") {
    loader.style.display = "block";
    emptyState.style.display = "none";
    transactionList.innerHTML = "";
  
    try {
        const transactions = await fetchTransactions(userId);
        const balance = await fetchBalance(userId);
        currentBalance.textContent = `₦${balance.toFixed(2)}`;
    
        const filtered = transactions.filter(transaction => {
            if (filter === "all") return true;
            return transaction.type === filter;
        });
    
        if (filtered.length === 0) {
            emptyState.style.display = "flex";
        } else {
            filtered.forEach(transaction => {
                const isDeposit = transaction.type === "deposit";
                const dateString = transaction.date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const transactionItem = document.createElement("div");
                transactionItem.className = `transaction-item ${transaction.type}`;
                transactionItem.dataset.id = transaction.id;  // Add this line
                transactionItem.innerHTML = `
                    <div class="details">
                        <div class="type">${transaction.type.toUpperCase()}</div>
                        <div class="date">${dateString}</div>
                        ${isDeposit ? `<div class="description">${transaction.description}</div>` : ''}
                        <div class="status">${transaction.status}</div>
                    </div>
                    <div class="amount-container">
                        <div class="amount ${transaction.type}">
                        ${transaction.type === 'sent' ? '-' : '+'}₦${transaction.amount.toFixed(2)}
                        </div>
                        ${!isDeposit ? `
                            <div class="counterparty">
                                ${transaction.type === 'sent' ? 'To' : 'From'}: 
                                ${transaction.type === 'sent' ? transaction.recipientAccount : transaction.senderAccount}
                            </div>
                        ` : ''}
                    </div>
                `;
                transactionList.appendChild(transactionItem);
            });
        }
    } catch (error) {
        console.error("Display error:", error);
        showToast("Failed to load transactions", false);
    } finally {
        loader.style.display = "none";
    }
}
// Show receipt modal
async function showReceipt(transactionId) {
  try {
    const docRef = doc(db, "transactions", transactionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const transaction = docSnap.data();
      receiptDetails.innerHTML = `
        <h3>Transaction Receipt</h3>
        <p><strong>Date:</strong> ${new Date(transaction.timestamp.seconds * 1000).toLocaleString()}</p>
        <p><strong>Type:</strong> ${transaction.type || (transaction.senderId === transaction.recipientId ? 'Deposit' : 'Transfer')}</p>
        <p><strong>Amount:</strong> ₦${transaction.amount.toFixed(2)}</p>
        <p><strong>Status:</strong> ${transaction.status}</p>
        <p><strong>Sender Account:</strong> ${transaction.senderAccount}</p>
        ${transaction.recipientAccount ? `<p><strong>Recipient Account:</strong> ${transaction.recipientAccount}</p>` : ''}
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
      `;
      receiptModal.style.display = "flex";
    }
  } catch (error) {
    console.error("Error fetching transaction:", error);
    showToast("Error loading receipt", false);
  }
}

// Initialize the page
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const balance = await fetchBalance(user.uid);
      currentBalance.textContent = `₦${balance.toFixed(2)}`;
      displayTransactions(user.uid);
    } catch (error) {
      console.error("Auth state error:", error);
    }
  } else {
    transactionList.innerHTML = "<p>Please login to view transactions</p>";
  }
});

// Event listeners
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    onAuthStateChanged(auth, (user) => user && displayTransactions(user.uid, filter));
  });
});

transactionList.addEventListener("click", (e) => {
  const transactionItem = e.target.closest(".transaction-item");
  if (transactionItem) showReceipt(transactionItem.dataset.id);
});

closeBtn.addEventListener("click", () => receiptModal.style.display = "none");
printReceiptBtn.addEventListener("click", () => window.print());

// Utility function
function showToast(message, isSuccess) {
  const toast = document.createElement("div");
  toast.className = `toast ${isSuccess ? "success" : "error"}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Use html2canvas to take a snapshot of the receiptDetails element
    html2canvas(receiptDetails).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // Full width for A4 page in jsPDF
      const pageHeight = 295; // Full height for A4 page in jsPDF
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
  
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
  
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
  
      doc.save(`receipt-${Date.now()}.pdf`);
    });
}