document.addEventListener('DOMContentLoaded', () => {
    const newMessageInput = document.createElement('input'); // Create input element
    newMessageInput.type = 'text';
    newMessageInput.classList.add('new-message-input');
    newMessageInput.placeholder = 'Type a message...';

    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.classList.add('send-button');

    const messageInputContainer = document.createElement('div');
    messageInputContainer.classList.add('message-input-container');
    messageInputContainer.appendChild(newMessageInput);
    messageInputContainer.appendChild(sendButton);

    document.querySelector('.content').appendChild(messageInputContainer); // Append input container to .content

    sendButton.addEventListener('click', () => {
        const messageContent = newMessageInput.value.trim();

        if (messageContent !== '') {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                // Redirect to login page if not authenticated
                window.location.href = "index.html";
                return;
            }

            const recipient = document.querySelector('.recipient-info').textContent.split(' ').pop();

            const payload = {
                recipient: recipient,
                content: messageContent
            };

            fetch('http://68.183.112.242/api/message/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                       // Handle other HTTP error statuses
                        if (response.status === 401) {
                            // Unauthorized: Redirect to login or handle token refresh
                            console.error("Unauthorized: Please log in again.");
                            window.location.href = "index.html";
                        } else {
                            // Other errors: Display a generic error message
                            console.error("Error sending message:", response.status);
                            alert("An error occurred while sending the message.");
                        }
                    }
                })
                .then(data => {
                    console.log('Message sent:', data);
                    // Update the conversation UI with the new message (optional)
                    newMessageInput.value = ''; // Clear the input field
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                    // Handle error appropriately (e.g., display an error message)

                    // Display a specific error message based on the type of error
                    if (error.name === 'SyntaxError') {
                        alert('Error: Invalid JSON response from the server.');
                    } else {
                        alert('Error sending message. Please try again later.');
                    }

                });
        }
    });
});
