import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
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
const auth = getAuth();
const db = getFirestore();
const analytics = getAnalytics(app);

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader-container');
  
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
        
        // Array of random greetings
        const greetings = [
          'Hello',
          'Welcome back',
          'Good to see you',
          'Hi',
          'Great to have you here', 
          'Nice to see you again',
          'Let\'s get started',
          'It\'s great to have you back',
          'Hope you\'re doing well',
          'Hey'
        ];

        // Function to get a random greeting
        const getRandomGreeting = () => {
          const randomIndex = Math.floor(Math.random() * greetings.length);
          return greetings[randomIndex];
        };

        welcomeMessage.textContent = `${getRandomGreeting()}, ${userData.firstName} ${userData.lastName}`;
        accountTypeElement.textContent = userData.accountType;
        balanceElement.textContent = `NGN ${userData.balance}`;

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

        accountHolderName.addEventListener('click', () => {
          if (loader) {
            loader.style.display = 'flex';
          }
          setTimeout(() => {
            window.location.href = '../HTML/profile.html';
          }, 1000);
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

// Function to show a popup or toast message
function showPopup(message, isSuccess = true) {
  const popup = document.createElement('div');
  popup.className = 'popup-message';
  popup.textContent = message;

  // Apply success or error styling based on isSuccess flag
  popup.style.backgroundColor = isSuccess ? 'green' : 'red';
  popup.style.color = 'white';
  popup.style.padding = '10px';
  popup.style.position = 'fixed';
  popup.style.bottom = '20px';
  popup.style.left = '50%';
  popup.style.transform = 'translateX(-50%)';
  popup.style.borderRadius = '5px';
  popup.style.zIndex = '1000';

  document.body.appendChild(popup);
  setTimeout(() => {
    document.body.removeChild(popup);
  }, 3000);
}

depositSubmitBtn.addEventListener('click', async () => {
  let depositAmount = parseFloat(depositAmountInput.value);

  if (!isNaN(depositAmount) && depositAmount > 0) {
    try {
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

      loader.style.display = 'none';

      showPopup('Deposit successful! Redirecting...', true);

      depositModal.style.display = 'none';

      setTimeout(() => {
        window.location.href = './landing.html';
      }, 5000); 
    } catch (error) {
      loader.style.display = 'none';
      showPopup('Deposit failed: ' + error.message, false);
    }
  }
});

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
    window.location.href = "../settings/more.html";
  });
});
