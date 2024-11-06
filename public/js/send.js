document.addEventListener('DOMContentLoaded', () => {
    const newMessageInput = document.createElement('input'); 
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

    document.querySelector('.content').appendChild(messageInputContainer); 

    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!accessToken || !userId || !userRole) {
        window.location.href = "index.html";
        return;
    }

    // Establish WebSocket connection
    const socket = io('http://localhost:4000', {
        auth: { token: accessToken }
    });

    socket.on('connect', () => {
        console.log(`Connected to WebSocket server with socket ID: ${socket.id}`);
        
        // Join room based on user's ID and role
        socket.emit('joinRoom', { userId, role: userRole });
    });

    sendButton.addEventListener('click', () => {
        const messageContent = newMessageInput.value.trim();
        const recipientInfo = document.querySelector('.recipient-info');
        if (!recipientInfo) {
            alert("Please select a conversation before sending a message.");
            return;
        }
        const recipient = recipientInfo.textContent.split(' ').pop();

        if (messageContent) {
            const payload = {
                sender: userId,
                receiver: recipient,
                content: messageContent,
                userId: userId,
                deviceId: "device_id_placeholder" // Replace with actual device ID
            };

            socket.emit('message', payload);
            console.log('Sent message:', payload);

            newMessageInput.value = ''; 
        }
    });

    // Listen for message status updates
    socket.on('messageStatusUpdate', (statusUpdate) => {
        console.log('Message status update:', statusUpdate);
        updateMessageStatus(statusUpdate); // Optional function to handle UI updates
    });

    // Optional: Function to update UI based on message status
    function updateMessageStatus(statusUpdate) {
        const { messageId, status } = statusUpdate;
        const messageElements = document.querySelectorAll('.message');
        
        messageElements.forEach((element) => {
            if (element.dataset.messageId === messageId) {
                element.classList.add(status); // Add status class to message element
                console.log(`Message ${messageId} status updated to ${status}`);
            }
        });
    }

    // Handle disconnect and errors
    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
    });
});