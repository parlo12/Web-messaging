document.addEventListener('DOMContentLoaded', () => {
    const conversationList = document.querySelector('.conversation-list');
    const conversationDetails = document.querySelector('.conversation-details');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const accessToken = localStorage.getItem('accessToken');

    if (!userId || !userRole || !accessToken) {
        window.location.href = "index.html";
        return;
    }

    // Establish WebSocket connection
    const socket = io('http://localhost:4000', {
        auth: { token: accessToken }
    });

    socket.on('connect', () => {
        console.log(`Connected to WebSocket server with socket ID: ${socket.id}`);
        
        // Join user's room to receive relevant messages
        socket.emit('joinRoom', { userId, role: userRole });
        console.log(`User ${userId} with role ${userRole} joined room`);
        
        // Request all conversations initially
        fetchConversations();
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
    });

    // Use `allMessages` event to receive and display messages
    socket.on('allMessages', (messages) => {
        console.log('All messages:', messages);

        // Display all received messages in the UI
        const groupedConversations = groupConversationsByPhoneNumber(messages);
        displayConversationItems(groupedConversations);
    });

    // Request all messages from the server
    function fetchConversations() {
        socket.emit('getAllMessages', { userId, role: userRole });
    }

    // Group conversations by phone number
    function groupConversationsByPhoneNumber(conversations) {
        const grouped = {};
        conversations.forEach(conversation => {
            const phoneNumber = normalizePhoneNumber(conversation.recipient);
            if (!grouped[phoneNumber]) {
                grouped[phoneNumber] = [];
            }
            grouped[phoneNumber].push(conversation);
        });
        return grouped;
    }

    // Display conversation items in the sidebar
    function displayConversationItems(groupedConversations) {
        conversationList.innerHTML = ''; // Clear the list
        for (const phoneNumber in groupedConversations) {
            const conversations = groupedConversations[phoneNumber];
            const latestConversation = conversations[conversations.length - 1];
            
            const conversationItem = document.createElement('div');
            conversationItem.classList.add('conversation-item');
            conversationItem.innerHTML = `
                <div class="avatar">
                    <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar">
                </div>
                <div class="info">
                    <div class="name">${latestConversation.receiver || 'Unknown'}</div>
                    <div class="preview">${latestConversation.content}</div>
                    <div class="timestamp">${latestConversation.createdAt}</div>
                </div>
            `;
            conversationItem.dataset.phoneNumber = phoneNumber;
            conversationItem.addEventListener('click', () => {
                setActiveConversation(conversationItem);
                displayConversationDetails(phoneNumber, groupedConversations[phoneNumber]);
            });

            conversationList.appendChild(conversationItem); 
        }
    }

    // Set active conversation in the UI
    function setActiveConversation(conversationItem) {
        const allConversationItems = conversationList.querySelectorAll('.conversation-item');
        allConversationItems.forEach(item => item.classList.remove('active'));
        conversationItem.classList.add('active');
    }

    // Display conversation details in the main view
    function displayConversationDetails(phoneNumber, conversations) {
        conversationDetails.innerHTML = '';

        const recipientInfo = document.createElement('div');
        recipientInfo.classList.add('recipient-info');
        recipientInfo.textContent = `Phone Number: ${phoneNumber}`;
        conversationDetails.appendChild(recipientInfo);

        conversations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        conversations.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', message.status);
            messageElement.textContent = message.content;
            conversationDetails.appendChild(messageElement);
        });
    }

    // Normalize phone number to ensure consistency
    function normalizePhoneNumber(phoneNumber) {
        if (!phoneNumber) return 'Unknown';  // Handle undefined or null phone numbers
        phoneNumber = phoneNumber.replace(/\D/g, '');
        if (phoneNumber.length > 10) {
            phoneNumber = phoneNumber.slice(-10);
        }
        return phoneNumber;
    }

    // Redirect to campaign page
    const campaignButton = document.getElementById('campaignButton');
    campaignButton.addEventListener('click', () => {
        window.location.href = 'campaign.html';
    });

    // Periodically fetch all messages every 5 seconds
    setInterval(fetchConversations, 5000);
});