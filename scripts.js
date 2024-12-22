// Predefined admins (hardcoded)
const admins = {
    "admin1": "password1", // Admin1 credentials
    "admin2": "password2"  // Admin2 credentials
};

let borrowers = JSON.parse(localStorage.getItem("borrowers")) || {}; // Fetch data from localStorage if available
let currentUser = localStorage.getItem("currentUser");

// Handle registration form display
function showRegisterForm() {
    if (currentUser && (currentUser === 'admin1' || currentUser === 'admin2')) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('register-form-container').style.display = 'block';
    } else {
        alert("Only admins can register new users.");
    }
}

function hideRegisterForm() {
    document.getElementById('register-form-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
}

// Register a new user (only accessible to admins)
document.getElementById('register-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;

    if (localStorage.getItem(newUsername)) {
        alert("Username already exists.");
        return;
    }

    localStorage.setItem(newUsername, newPassword);
    alert("Registration successful! You can now log in.");
    hideRegisterForm();
});

// Handle login functionality
document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if username and password are valid
    if (admins[username] === password) {
        currentUser = username;
        localStorage.setItem("currentUser", username); // Store user in localStorage
        alert("Login successful.");
        showBorrowerForm();
    } else if (localStorage.getItem(username) === password) {
        currentUser = username;
        localStorage.setItem("currentUser", username); // Store user in localStorage
        alert("Login successful.");
        showBorrowerForm();
    } else {
        alert("Invalid username or password.");
    }
});

// Show borrower form and list based on user role
function showBorrowerForm() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('table-container').style.display = 'block';
    document.getElementById('search-container').style.display = 'block';

    if (currentUser === 'admin1' || currentUser === 'admin2') {
        document.getElementById('form-container').style.display = 'block';
        document.getElementById('back-button-container').style.display = 'none';
    } else {
        document.getElementById('form-container').style.display = 'none';
        document.getElementById('back-button-container').style.display = 'block';
    }

    populateBorrowerTable();
}

// Populate the borrower table
function populateBorrowerTable() {
    const tableBody = document.querySelector('#borrowers-table tbody');
    tableBody.innerHTML = ''; // Clear existing table data

    Object.values(borrowers).forEach(borrower => {
        addBorrowerToTable(borrower);
    });
}

// Handle Back Button (return to login screen)
function goBackToLogin() {
    document.getElementById('back-button-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
    localStorage.removeItem("currentUser"); // Log out the user
}

// Function to add borrower data to the table
function addBorrowerToTable(borrower) {
    const tableBody = document.querySelector('#borrowers-table tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td data-label="Name">${borrower.name}</td>
        <td data-label="Amount Borrowed">$${borrower.borrowedAmount.toFixed(2)}</td>
        <td data-label="Remaining Amount">$${borrower.remainingAmount.toFixed(2)}</td>
        <td data-label="Borrowed Date">${new Date(borrower.borrowedDate).toLocaleDateString()}</td>
        <td data-label="Due Date">${new Date(borrower.dueDate).toLocaleDateString()}</td>
        <td data-label="Time Remaining">${getTimeRemaining(borrower.dueDate)}</td>
        <td data-label="Aadhaar Number">${borrower.aadhaarNumber}</td>
        <td data-label="Actions">
            ${currentUser === 'admin1' || currentUser === 'admin2' ? 
            `<button class="mark-paid" onclick="markAsPaid('${borrower.aadhaarNumber}')">Mark as Paid</button>
             <button onclick="deleteBorrower('${borrower.aadhaarNumber}')">Delete</button>` : '' }
        </td>
    `;

    tableBody.appendChild(row);
}

// Function to calculate time remaining
function getTimeRemaining(dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due - now;

    if (diff <= 0) {
        return 'Due Date Passed';
    }

    const daysRemaining = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${daysRemaining} Days Left`;
}

// Function to delete a borrower from the table
function deleteBorrower(aadhaarNumber) {
    delete borrowers[aadhaarNumber];
    localStorage.setItem("borrowers", JSON.stringify(borrowers));

    const rows = document.querySelectorAll('#borrowers-table tbody tr');
    rows.forEach(row => {
        if (row.cells[6].innerText === aadhaarNumber) {
            row.remove();
        }
    });
}

// Function to mark a borrower as paid and remove them from the table
function markAsPaid(aadhaarNumber) {
    delete borrowers[aadhaarNumber];
    localStorage.setItem("borrowers", JSON.stringify(borrowers));

    const rows = document.querySelectorAll('#borrowers-table tbody tr');
    rows.forEach(row => {
        if (row.cells[6].innerText === aadhaarNumber) {
            row.remove();
        }
    });
}

// Add borrower data (from form) to the borrowers object and update the table
document.getElementById('borrower-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const borrower = {
        name: document.getElementById('borrower-name').value,
        borrowedAmount: parseFloat(document.getElementById('borrowed-amount').value),
        borrowedDate: document.getElementById('borrowed-date').value,
        dueDate: document.getElementById('due-date').value,
        remainingAmount: parseFloat(document.getElementById('remaining-amount').value),
        aadhaarNumber: document.getElementById('aadhaar-number').value
    };

    // Store the borrower in the localStorage
    borrowers[borrower.aadhaarNumber] = borrower;
    localStorage.setItem("borrowers", JSON.stringify(borrowers));

    populateBorrowerTable(); // Update the table with the new borrower
    alert("Borrower added successfully!");
});
