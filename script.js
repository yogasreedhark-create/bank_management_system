// ========================================================
// MULTI USER SYSTEM (FIXED)
// ========================================================

// Load all users
function loadAllUsers() {
    return JSON.parse(localStorage.getItem("bankUsers")) || {};
}

// Save all users
function saveAllUsers(users) {
    localStorage.setItem("bankUsers", JSON.stringify(users));
}

// Save currently logged user
function setCurrentUser(username) {
    localStorage.setItem("currentUser", username);
}

// Get currently logged user
function getCurrentUser() {
    return localStorage.getItem("currentUser");
}

let allUsers = loadAllUsers();
let currentUser = getCurrentUser();


// ========================================================
// LOGIN SYSTEM
// ========================================================
function loginUser() {
    let username = document.getElementById("login-username").value.trim();

    if (username === "") {
        alert("Enter username!");
        return;
    }

    // If new user → create entry
    if (!allUsers[username]) {
        allUsers[username] = {
            otp: "",
            balance: 1000,
            transactions: []
        };
    }

    // Generate OTP
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    allUsers[username].otp = otp;

    saveAllUsers(allUsers);
    setCurrentUser(username);

    window.location.href = "otp.html";
}


// ========================================================
// OTP PAGE LOAD
// ========================================================
if (window.location.pathname.includes("otp.html")) {
    document.addEventListener("DOMContentLoaded", () => {
        let username = getCurrentUser();
        let otpBox = document.getElementById("show-otp");

        if (username && otpBox) {
            otpBox.innerText = allUsers[username].otp;
        }
    });
}


// ========================================================
// VERIFY OTP
// ========================================================
function verifyOtp() {
    let username = getCurrentUser();
    let enteredOtp = document.getElementById("otp-input").value.trim();

    if (enteredOtp === allUsers[username].otp) {
        alert("OTP Verified!");
        window.location.href = "dashboard.html";
    } else {
        alert("Incorrect OTP!");
    }
}


// ========================================================
// DASHBOARD LOAD
// ========================================================
if (window.location.pathname.includes("dashboard.html")) {
    document.addEventListener("DOMContentLoaded", () => {
        let username = getCurrentUser();

        document.getElementById("user-name").innerText = username;
        document.getElementById("balance").innerText = allUsers[username].balance;
    });
}


// ========================================================
// ADD MONEY
// ========================================================
function addMoney() {
    let username = getCurrentUser();
    let amt = Number(document.getElementById("add-amt").value);

    if (amt <= 0) return alert("Invalid amount!");

    allUsers[username].balance += amt;
    allUsers[username].transactions.push({
        type: "Deposit",
        amount: amt,
        time: new Date().toLocaleString()
    });

    saveAllUsers(allUsers);

    alert("Money Added!");
    window.location.href = "dashboard.html";
}


// ========================================================
// WITHDRAW MONEY
// ========================================================
function withdrawMoney() {
    let username = getCurrentUser();
    let amt = Number(document.getElementById("withdraw-amt").value);

    if (amt <= 0 || amt > allUsers[username].balance) {
        return alert("Invalid withdraw amount!");
    }

    allUsers[username].balance -= amt;
    allUsers[username].transactions.push({
        type: "Withdraw",
        amount: amt,
        time: new Date().toLocaleString()
    });

    saveAllUsers(allUsers);

    alert("Withdraw Successful!");
    window.location.href = "dashboard.html";
}


// ========================================================
// TRANSFER MONEY
// ========================================================
function transferMoney() {
    let sender = getCurrentUser();
    let receiver = document.getElementById("transfer-user").value.trim();
    let amt = Number(document.getElementById("transfer-amt").value);

    if (!receiver || amt <= 0 || amt > allUsers[sender].balance) {
        return alert("Invalid transfer details!");
    }

    // If receiver does not exist → create account automatically
    if (!allUsers[receiver]) {
        allUsers[receiver] = {
            balance: 1000,
            transactions: []
        };
    }

    // Deduct sender
    allUsers[sender].balance -= amt;
    allUsers[sender].transactions.push({
        type: "Transfer to " + receiver,
        amount: amt,
        time: new Date().toLocaleString()
    });

    // Add to receiver
    allUsers[receiver].balance += amt;
    allUsers[receiver].transactions.push({
        type: "Received from " + sender,
        amount: amt,
        time: new Date().toLocaleString()
    });

    saveAllUsers(allUsers);

    alert("Transfer Successful!");
    window.location.href = "dashboard.html";
}


// ========================================================
// TRANSACTION HISTORY PAGE
// ========================================================
if (window.location.pathname.includes("transactions.html")) {
    document.addEventListener("DOMContentLoaded", () => {
        let username = getCurrentUser();
        let list = document.getElementById("txn-list");

        allUsers[username].transactions.forEach(t => {
            let li = document.createElement("li");
            li.innerHTML = `
                <strong>${t.type}</strong><br>
                Amount: ₹${t.amount}<br>
                <small>${t.time}</small>
            `;
            list.appendChild(li);
        });
    });
}


// ========================================================
// CHATBOT (Improved Fuzzy Search)
// ========================================================
const faqs = [
    { question: "how to open an account", answer: "Go to Accounts > Open New Account." },
    { question: "check balance", answer: "Open Dashboard to view your balance." },
    { question: "transfer money", answer: "Go to Transfer page and follow the steps." },
    { question: "withdraw money", answer: "Open Withdraw section and enter the amount." },
    { question: "add money", answer: "Open Add Money and confirm the payment." },
    { question: "transaction history", answer: "Open Transactions page." },
];

function getBestAnswer(userQ) {
    userQ = userQ.toLowerCase().trim();
    let bestScore = 0;
    let best = "Sorry, I didn't understand.";

    faqs.forEach(faq => {
        let score = 0;
        faq.question.split(" ").forEach(qw => {
            if (userQ.includes(qw)) score++;
        });
        if (score > bestScore) {
            bestScore = score;
            best = faq.answer;
        }
    });

    return best;
}

function askBot() {
    let input = document.getElementById("chat-input").value.trim();
    if (!input) return;

    let chatBox = document.getElementById("chat-box");

    chatBox.innerHTML += `<div class="user-msg">${input}</div>`;
    chatBox.innerHTML += `<div class="bot-msg">${getBestAnswer(input)}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    document.getElementById("chat-input").value = "";
}


// ========================================================
// LOGOUT
// ========================================================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}
