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

    const socket = io('http://165.22.179.230:4000', {
        auth: { token: accessToken }
    });

    socket.on('connect', () => {
        console.log(`Connected to WebSocket server with socket ID: ${socket.id}`);
        socket.emit('joinRoom', { userId, role: userRole });
    });

    sendButton.addEventListener('click', () => {
        const messageContent = newMessageInput.value.trim();

        // Retrieve original sender and receiver from localStorage
        const originalSender = localStorage.getItem('currentSender');
        const originalReceiver = localStorage.getItem('currentReceiver');

        if (!originalReceiver) {
            alert("Please select a conversation before sending a message.");
            return;
        }

        if (messageContent) {
            const payload = {
                sender: originalReceiver,     // Switch sender to be the original receiver
                receiver: originalSender || userId,  // Switch receiver to be the original sender (or use userId as fallback)
                content: messageContent,
                userId: userId,
                deviceId: "device_id_placeholder", // Replace with actual device ID if needed
                origin: "CRM"   // Set origin to "CRM" to indicate it is from CRM
            };

            // Log the payload for debugging
            console.log('Sending payload:', payload);

            socket.emit('message', payload);
            console.log('Sent message:', payload);

            newMessageInput.value = '';
        }
    });

    socket.on('messageStatusUpdate', (statusUpdate) => {
        console.log('Message status update:', statusUpdate);
        updateMessageStatus(statusUpdate); 
    });

    function updateMessageStatus(statusUpdate) {
        const { messageId, status } = statusUpdate;
        const messageElements = document.querySelectorAll('.message');
        
        messageElements.forEach((element) => {
            if (element.dataset.messageId === messageId) {
                element.classList.add(status);
                console.log(`Message ${messageId} status updated to ${status}`);
            }
        });
    }

    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
    });
});