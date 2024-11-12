document.addEventListener('DOMContentLoaded', () => {
    const conversationList = document.querySelector('.conversation-list');
    const conversationDetails = document.querySelector('.conversation-details');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const accessToken = localStorage.getItem('accessToken');
    let groupedConversations = {};
    let lastMessageTimestamp = new Date(0); // Tracks the latest message time
    const messagesPerLoad = 11; // Number of messages to load per scroll
    let currentConversation = []; // Stores messages of the active conversation
    let loadedMessages = 0; // Tracks number of loaded messages in the current conversation

    if (!userId || !userRole || !accessToken) {
        window.location.href = "index.html";
        return;
    }

    // Establish WebSocket connection
    const socket = io('http://165.22.179.230:4000', {
        auth: { token: accessToken }
    });

    socket.on('connect', () => {
        console.log(`Connected to WebSocket server with socket ID: ${socket.id}`);
        socket.emit('joinRoom', { userId, role: userRole });
        fetchConversations();
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
    });

    socket.on('allMessages', (messages) => {
        console.log('All messages:', messages);
        updateConversations(messages);
    });

    // Poll for new messages every 3 seconds
    setInterval(fetchConversations, 3000);

    function fetchConversations() {
        socket.emit('getAllMessages', { userId, role: userRole });
    }

    function updateConversations(messages) {
        const newGroupedConversations = groupConversationsByPhoneNumber(messages);
        
        // Check for new messages in each conversation
        for (const phoneNumber in newGroupedConversations) {
            const newMessages = newGroupedConversations[phoneNumber].filter(msg => 
                new Date(msg.createdAt) > lastMessageTimestamp
            );
            
            // Append new messages to conversationDetails if this conversation is active
            if (newMessages.length > 0 && isActiveConversation(phoneNumber)) {
                newMessages.forEach(msg => {
                    const messageElement = createMessageElement(msg, true);
                    conversationDetails.appendChild(messageElement);
                });
            }
        }

        groupedConversations = newGroupedConversations;
        displayConversationItems(groupedConversations);

        // Update the timestamp to the latest message
        const latestMessage = messages[messages.length - 1];
        if (latestMessage) lastMessageTimestamp = new Date(latestMessage.createdAt);
    }

    function isActiveConversation(phoneNumber) {
        const activeItem = conversationList.querySelector('.conversation-item.active');
        return activeItem && activeItem.dataset.phoneNumber === phoneNumber;
    }

    function groupConversationsByPhoneNumber(conversations) {
        const grouped = {};
        conversations.forEach(conversation => {
            const phoneNumber = normalizePhoneNumber(conversation.sender || conversation.receiver);
            if (!grouped[phoneNumber]) {
                grouped[phoneNumber] = [];
            }
            grouped[phoneNumber].push(conversation);
        });
        return grouped;
    }

    function displayConversationItems(groupedConversations) {
        conversationList.innerHTML = '';
    
        // Sort the conversations based on the timestamp of the latest message in each conversation
        const sortedConversations = Object.keys(groupedConversations).sort((a, b) => {
            const latestMessageA = groupedConversations[a][groupedConversations[a].length - 1];
            const latestMessageB = groupedConversations[b][groupedConversations[b].length - 1];
            return new Date(latestMessageB.createdAt) - new Date(latestMessageA.createdAt);
        });
    
        // Display sorted conversations
        sortedConversations.forEach(phoneNumber => {
            const conversations = groupedConversations[phoneNumber];
            const latestConversation = conversations[conversations.length - 1];
    
            const conversationItem = document.createElement('div');
            conversationItem.classList.add('conversation-item');
            conversationItem.innerHTML = `
                <div class="avatar">
                    <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar">
                </div>
                <div class="info">
                    <div class="name">${phoneNumber || 'Unknown'}</div>
                    <div class="preview">${latestConversation.content}</div>
                    <div class="timestamp">${new Date(latestConversation.createdAt).toLocaleString()}</div>
                </div>
            `;
            conversationItem.dataset.phoneNumber = phoneNumber;
            conversationItem.addEventListener('click', () => {
                setActiveConversation(conversationItem);
                currentConversation = groupedConversations[phoneNumber];
                loadedMessages = 0; // Reset loaded messages count
                displayConversationDetails(phoneNumber, currentConversation);
                localStorage.setItem('currentSender', latestConversation.sender);
                localStorage.setItem('currentReceiver', phoneNumber);
            });
    
            conversationList.appendChild(conversationItem);
        });
    }

    function setActiveConversation(conversationItem) {
        const allConversationItems = conversationList.querySelectorAll('.conversation-item');
        allConversationItems.forEach(item => item.classList.remove('active'));
        conversationItem.classList.add('active');
    }

    function displayConversationDetails(phoneNumber, conversations) {
        conversationDetails.innerHTML = '';

        const recipientInfo = document.createElement('div');
        recipientInfo.classList.add('recipient-info');
        recipientInfo.textContent = `Phone Number: ${phoneNumber}`;
        conversationDetails.appendChild(recipientInfo);

        // Load the initial batch of messages
        loadMoreMessages(conversations);

        // Attach scroll event listener for infinite loading
        conversationDetails.addEventListener('scroll', () => {
            if (conversationDetails.scrollTop + conversationDetails.clientHeight >= conversationDetails.scrollHeight) {
                loadMoreMessages(conversations);
            }
        });
    }

    function loadMoreMessages(conversations) {
        const remainingMessages = conversations.slice(loadedMessages, loadedMessages + messagesPerLoad);

        remainingMessages.forEach(message => {
            const isNewMessage = new Date(message.createdAt) > lastMessageTimestamp;
            const messageElement = createMessageElement(message, isNewMessage);
            conversationDetails.appendChild(messageElement);
        });

        loadedMessages += remainingMessages.length;

        if (remainingMessages.length > 0) {
            lastMessageTimestamp = new Date(remainingMessages[remainingMessages.length - 1].createdAt);
        }
    }

    function createMessageElement(message, isNewMessage) {
        const isAndroidOrigin = message.origin === 'Android';

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', message.status);
        messageElement.innerHTML = `
            <div class="info">
                <div class="name">${message.sender || 'Unknown'}</div>
                <div class="preview">${message.content}</div>
                <div class="timestamp">${new Date(message.createdAt).toLocaleString()}</div>
                <div class="status">${message.status}</div>
            </div>
        `;

        if (isAndroidOrigin) {
            messageElement.style.alignSelf = 'flex-start';
            messageElement.style.backgroundColor = isNewMessage ? '#b0f6ff' : '#f1f1f1';
            messageElement.style.color = 'black';
        } else {
            messageElement.style.alignSelf = 'flex-end';
            messageElement.style.backgroundColor = isNewMessage ? '#b0f6ff' : '#007AFF';
            messageElement.style.color = 'white';
            messageElement.style.marginLeft = '172px';
        }
        return messageElement;
    }

    function normalizePhoneNumber(phoneNumber) {
        if (!phoneNumber) return 'Unknown';
        phoneNumber = phoneNumber.replace(/\D/g, '');
        if (phoneNumber.length > 10) {
            phoneNumber = phoneNumber.slice(-10);
        }
        return phoneNumber;
    }

    const campaignButton = document.getElementById('campaignButton');
    campaignButton.addEventListener('click', () => {
        window.location.href = 'campaign.html';
    });
});