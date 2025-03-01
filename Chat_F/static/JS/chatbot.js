document.addEventListener('DOMContentLoaded', function () {
    // Chatbot elements
    const chatHistory = document.getElementById('chatbox');
    const chatInput = document.getElementById('chat-input');
    const sendMessageButton = document.getElementById('send-chat-btn');
    const deleteChatButton = document.getElementById('delete-chat');
    const logoutButton = document.getElementById('logout-button');
    const messageSpace = document.querySelector('.message-space');

    // Login elements
    const loginModal = document.getElementById('login-modal');
    const loginSubmitButton = document.getElementById('login-submit');
    const houseNumberInput = document.getElementById('house-number');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');

    // Feedback elements
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackName = document.getElementById('feedback-name');
    const feedbackEmail = document.getElementById('feedback-email');
    const feedbackHouseNumber = document.getElementById('feedback-house-number');
    const feedbackMessage = document.getElementById('feedback-message');
    const feedbackRating = document.getElementById('feedback-rating');
    const submitFeedbackButton = document.getElementById('cf-submit');

    // Open login modal when Syndicate page is accessed
    document.querySelector('a[href="#syndicate"]').addEventListener('click', function (event) {
        event.preventDefault();
        loginModal.style.display = 'flex'; // Use flex to center the modal
    });

    // Handle login form submission on Enter key press
    loginModal.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            loginSubmitButton.click(); // Trigger the login button click
        }
    });

    // Handle login form submission
    loginSubmitButton.addEventListener('click', function (event) {
        event.preventDefault();
        const houseNumber = houseNumberInput.value.trim();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();

        // Validate all fields
        if (!houseNumber || !username || !email) {
            alert('Please fill out all fields. 📝');
            return;
        }

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                house_number: houseNumber,
                username: username,
                email: email
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Login successful! Welcome! 😊');
                loginModal.style.display = 'none'; // Hide the modal
                document.querySelector('.chat-container').style.display = 'block'; // Show the chatbot
            } else {
                alert('Login failed. Please check your credentials. ❌');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again. ❌');
        });
    });

    // Handle forgot password
    document.getElementById('forgot-password').addEventListener('click', function (event) {
        event.preventDefault();
        alert('If you forgot your password, please send an email to lamrinidouae70@gmail.com.');
    });

    // Handle logout
    logoutButton.addEventListener('click', function () {
        const houseNumber = houseNumberInput.value.trim();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();

        // Debug: Log the values to the console
        console.log("House Number:", houseNumber);
        console.log("Username:", username);
        console.log("Email:", email);

        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                house_number: houseNumber,
                username: username,
                email: email
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Logout successful! 👋');
                document.querySelector('.chat-container').style.display = 'none'; // Hide the chatbot
                window.location.href = '/'; // Redirect to the home page
            } else {
                alert('Logout failed. Please try again. ❌');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again. ❌');
        });
    });
// Handle sending messages
const sendMessage = () => {
    const message = chatInput.value.trim();
    if (message !== '') {
        const houseNumber = houseNumberInput.value.trim();
        const username = usernameInput.value.trim();

        // Add user message to chat history
        const userMessage = document.createElement('li');
        userMessage.classList.add('outgoing');
        userMessage.innerHTML = `<p>${message}</p>`;
        chatHistory.appendChild(userMessage);

        // Clear the input
        chatInput.value = '';

        // Scroll to the bottom after user message
        scrollToBottom();

        // Send message to the chatbot
        fetch('/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                house_number: houseNumber,
                username: username,
                message: message
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Chatbot Response:", data.response); 

            // Add chatbot response to chat history
            const botMessage = document.createElement('li');
            botMessage.classList.add('incoming');
            botMessage.innerHTML = `<p>${data.response}</p>`;
            chatHistory.appendChild(botMessage);

            // Scroll to the bottom after bot message
            scrollToBottom();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to send message. Please try again. ❌');
        });
    }
};

// Function to scroll chat to the bottom
function scrollToBottom() {
    const messageSpace = document.querySelector('.message-space');
    messageSpace.scrollTop = messageSpace.scrollHeight;
}


    // Send message on button click
    sendMessageButton.addEventListener('click', sendMessage);

    // Send message on Enter key press
    chatInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            sendMessage();
        }
    });

    // Handle delete chat
    deleteChatButton.addEventListener('click', function () {
        chatHistory.innerHTML = ''; // Clear the chat history
    });

    // Handle feedback form submission on Enter key press
    feedbackForm.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            submitFeedbackButton.click(); // Trigger the feedback submit button click
        }
    });

    // Handle feedback form submission
    feedbackForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const name = feedbackName.value.trim();
        const email = feedbackEmail.value.trim();
        const houseNumber = feedbackHouseNumber.value.trim();
        const message = feedbackMessage.value.trim();
        const rating = feedbackRating.value;

        if (!name || !email || !houseNumber || !message || !rating) {
            alert('Please fill out all fields. 📝');
            return;
        }

        fetch('/submit-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                house_number: houseNumber,
                message: message,
                rating: rating
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Thank you for your feedback! 😊');
                window.location.href = '/'; // Redirect to the home page
            } else {
                alert('Failed to submit feedback. Please try again. ❌');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again. ❌');
        });
    });
});