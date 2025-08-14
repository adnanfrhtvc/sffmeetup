// DOM Elements
const searchInput = document.getElementById('searchInput');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const resultContainer = document.getElementById('resultContainer');
const attendeeName = document.getElementById('attendeeName');
const statusBadge = document.getElementById('statusBadge');
const actionMessage = document.getElementById('actionMessage');
const backButton = document.getElementById('backButton');
const historyContainer = document.getElementById('historyContainer');

// Load data from JSON file
let attendees = [];

fetch('data/attendees.json')
    .then(response => response.json())
    .then(data => {
        attendees = data;
        // Initialize after data load
        loadHistory();
    })
    .catch(error => console.error('Error loading attendees:', error));

// Load history from localStorage
let checkHistory = [];

function loadHistory() {
    checkHistory = JSON.parse(localStorage.getItem('checkHistory')) || [];
    renderHistory();
}

// Event Listeners
searchInput.addEventListener('input', handleSearch);
backButton.addEventListener('click', () => {
    resultContainer.classList.add('d-none');
    searchInput.value = '';
    searchInput.focus();
});

// Search handler
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    suggestionsContainer.innerHTML = '';
    
    if (searchTerm.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    const filtered = attendees.filter(attendee => 
        attendee.name.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length > 0) {
        filtered.forEach(attendee => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                ${attendee.name} 
                <span class="badge ${attendee.confirmed ? 'bg-success' : 'bg-danger'} float-end">
                    ${attendee.confirmed ? 'Confirmed' : 'Not Confirmed'}
                </span>
            `;
            div.addEventListener('click', () => selectAttendee(attendee));
            suggestionsContainer.appendChild(div);
        });
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

// Attendee selection handler
function selectAttendee(attendee) {
    // Hide suggestions and clear search
    suggestionsContainer.style.display = 'none';
    searchInput.value = '';
    
    // Show result container
    resultContainer.classList.remove('d-none');
    
    // Display attendee info
    attendeeName.textContent = attendee.name;
    
    if (attendee.confirmed) {
        statusBadge.className = 'status-badge bg-success text-white';
        statusBadge.textContent = 'Payment Confirmed';
        actionMessage.textContent = 'Access Granted - Please admit attendee';
        actionMessage.className = 'text-success fw-bold';
    } else {
        statusBadge.className = 'status-badge bg-danger text-white';
        statusBadge.textContent = 'Payment Not Confirmed';
        actionMessage.textContent = 'Please direct to payment station';
        actionMessage.className = 'text-danger fw-bold';
    }
    
    // Add to history
    addToHistory(attendee);
}

// History functions
function addToHistory(attendee) {
    // Add to beginning of history
    checkHistory.unshift({
        id: attendee.id,
        name: attendee.name,
        confirmed: attendee.confirmed,
        timestamp: new Date().toLocaleTimeString()
    });
    
    // Keep only last x amount of entries
    if (checkHistory.length > 30) {
        checkHistory.pop();
    }
    
    // Save to localStorage and render
    localStorage.setItem('checkHistory', JSON.stringify(checkHistory));
    renderHistory();
}

function renderHistory() {
    if (checkHistory.length === 0) {
        historyContainer.innerHTML = '<div class="text-center text-muted py-3">No check-ins yet</div>';
        return;
    }
    
    historyContainer.innerHTML = '';
    checkHistory.forEach(entry => {
        const item = document.createElement('div');
        item.className = `history-item ${entry.confirmed ? 'checked-in' : ''}`;
        item.innerHTML = `
            <div class="d-flex justify-content-between">
                <strong>${entry.name}</strong>
                <span class="text-muted small">${entry.timestamp}</span>
            </div>
            <div>
                Status: 
                <span class="badge ${entry.confirmed ? 'bg-success' : 'bg-danger'}">
                    ${entry.confirmed ? 'Confirmed' : 'Not Confirmed'}
                </span>
            </div>
        `;
        historyContainer.appendChild(item);
    });
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.style.display = 'none';
    }
});

// Focus search input on page load
window.addEventListener('DOMContentLoaded', () => {
    searchInput.focus();
});