import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";

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
const analytics = getAnalytics(app);

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader-container');
  
  // Show loader while loading user details
  if (loader) {
    loader.style.display = 'flex';
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // DOM element references
        const welcomeMessage = document.getElementById('welcomeMessage');
        const accountHolderName = document.getElementById('accountHolderName');
        const accountTypeElement = document.getElementById('accountType');
        const balanceElement = document.getElementById('balance');
        const toggleBalanceBtn = document.getElementById('toggleBalance');
        const toggleBalanceIcon = document.getElementById('toggleBalanceIcon');
        

        // Update UI with user data
        welcomeMessage.textContent = `Hello, ${userData.firstName} ${userData.lastName}`;
        accountTypeElement.textContent = userData.accountType;
        balanceElement.textContent = `NGN ${userData.balance}`;

        // Track balance visibility
        let balanceVisible = true;
        toggleBalanceBtn.addEventListener('click', () => {
          balanceVisible = !balanceVisible;
          if (balanceVisible) {
            balanceElement.textContent = `NGN ${userData.balance}`;
            toggleBalanceIcon.src = './iconimages/iconamoon--eye-thin.svg';
            toggleBalanceIcon.alt = 'Hide Balance';
          } else {
            balanceElement.textContent = 'NGN ***';
            toggleBalanceIcon.src = './iconimages/mynaui--eye-slash.svg';
            toggleBalanceIcon.alt = 'Show Balance';
          }
        });

        // Real-time listener for balance updates
        onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const updatedData = docSnap.data();
            balanceElement.textContent = `NGN ${updatedData.balance}`;
            userData.balance = updatedData.balance;
          }
        });

        // When the profile icon is clicked, show loader then redirect to profile page
        accountHolderName.addEventListener('click', () => {
          if (loader) {
            loader.style.display = 'flex';
          }
          setTimeout(() => {
            window.location.href = '../HTML/profile.html';
          }, 1000); // 1 second delay
        });

        // Deposit functionality
        const addMoneyDiv = document.querySelector('.add-money');
        const depositModal = document.getElementById('depositModal');
        const depositAmountInput = document.getElementById('depositAmount');
        const depositSubmitBtn = document.getElementById('depositSubmit');
        const depositCancelBtn = document.getElementById('depositCancel');
        const depositModalCloseBtn = document.getElementById('modalClose');


        if (addMoneyDiv) {
          addMoneyDiv.addEventListener('click', () => {
            depositModal.style.display = 'flex';
          });
        }
      // Update the deposit submit handler
depositSubmitBtn.addEventListener('click', async () => {
  let depositAmount = parseFloat(depositAmountInput.value);
  if (!isNaN(depositAmount) && depositAmount > 0) {
    try {
      // Show loader
      loader.style.display = 'flex';
      
      const newBalance = userData.balance + depositAmount;
      const transactionsCol = collection(db, 'users', user.uid, 'transactions');
      const transactionRef = doc(transactionsCol);

      await Promise.all([
        setDoc(userDocRef, { balance: newBalance }, { merge: true }),
        setDoc(transactionRef, {
          type: 'deposit',
          amount: depositAmount,
          date: new Date().toISOString(),
          balanceAfter: newBalance,
          description: 'Account deposit'
        })
      ]);

      // Hide loader
      loader.style.display = 'none';
      
      // Show success message
      showPopup('Deposit successful! Redirecting...', true);

      // Close modal and redirect after 2 seconds
      setTimeout(() => {
        depositModal.style.display = 'none';
        window.location.reload(); // Refresh to update balance
      }, 2000);

    } catch (error) {
      loader.style.display = 'none';
      showPopup('Deposit failed: ' + error.message);
    }
  }
});

// Update showPopup function to support auto-close
function showPopup(message, autoClose = false) {
  let popupContainer = document.getElementById("popupContainer");
  // ... existing popup creation code ...

  if (autoClose) {
    setTimeout(() => {
      popupContainer.style.display = "none";
    }, 5000);
  }
}
        depositCancelBtn.addEventListener('click', () => {
          depositModal.style.display = 'none';
        });
        depositModalCloseBtn.addEventListener('click', () => {
          depositModal.style.display = 'none';
        });
      } else {
        console.log("No such user data!");
      }
    } else {
      window.location.href = '../HTML/signin.html';
    }
    
    // Hide the loader after processing
    if (loader) {
      loader.style.display = 'none';
    }
  });

  // Navigation for Home/More, etc.
  const homeDiv = document.querySelector('.home');
  const moreDiv = document.querySelector('.more');
  
  const clearActive = () => {
    homeDiv.style.color = 'black';
    moreDiv.style.color = 'black';
  };

  const activateHome = () => {
    clearActive();
    homeDiv.style.color = 'red';
  };

  const activateMore = () => {
    clearActive();
    moreDiv.style.color = 'red';
  };

  activateHome();

  homeDiv.addEventListener('click', (e) => {
    e.preventDefault();
    activateHome();
  });

  moreDiv.addEventListener('click', (e) => {
    e.preventDefault();
    activateMore();
    window.location.href = 'anotherPage.html';
  });
});
