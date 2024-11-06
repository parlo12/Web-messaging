document.addEventListener('DOMContentLoaded', () => {
    const conversationList = document.querySelector('.conversation-list');
    const conversationDetails = document.querySelector('.conversation-details');

    function setActiveConversation(conversationItem) {
        const allConversationItems = conversationList.querySelectorAll('.conversation-item');
        allConversationItems.forEach(item => item.classList.remove('active'));
        conversationItem.classList.add('active');
        conversationItem.classList.remove('unread');
    }

    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    if (!accessToken) {
        window.location.href = "index.html";
        return;
    }

    console.log('Access Token:', accessToken);
    console.log('User ID:', userId);

    fetch('http://68.183.112.242/api/message/showallmessages', {
        headers: {
            'Authorization': accessToken 
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched Data:', data);
        console.log('All Conversations:', data.data);
        data.data.forEach(conversation => {
            console.log('Conversation:', conversation);
        });
        const userConversations = data.data.filter(conversation => conversation.user_id.toString() === userId.toString());
        console.log('Filtered User Conversations:', userConversations);
        const groupedConversations = groupConversationsByPhoneNumber(userConversations);
        console.log('Grouped Conversations:', groupedConversations);
        displayConversationItems(groupedConversations);
    })
    .catch(error => {
        console.error('Error fetching conversation data:', error);
    });

    // Normalize phone number
    function normalizePhoneNumber(phoneNumber) {
        phoneNumber = phoneNumber.replace(/\D/g, ''); // Remove non-numeric characters
        if (phoneNumber.length > 10) {
            phoneNumber = phoneNumber.slice(-10); // Take the last 10 digits
        }
        return phoneNumber;
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

    // Display conversation items in the list
    function displayConversationItems(groupedConversations) {
        for (const phoneNumber in groupedConversations) {
            const conversations = groupedConversations[phoneNumber];
            const latestConversation = conversations[conversations.length - 1]; 

            const conversationItem = document.createElement('div');
            conversationItem.classList.add('conversation-item');
            if (!latestConversation.read) { 
                conversationItem.classList.add('unread');
            }
            conversationItem.innerHTML = `
                <div class="avatar">
                    <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar">
                </div>
                <div class="info">
                    <div class="name">${latestConversation.recipient}</div>
                    <div class="preview">${latestConversation.content}</div>
                    <div class="timestamp">${latestConversation.created_at}</div>
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

    // Function to display conversation details
    function displayConversationDetails(phoneNumber, conversations) {
        conversationDetails.innerHTML = ''; 

        const groupedByStatus = groupMessagesByStatus(conversations);

        const recipientInfo = document.createElement('div');
        recipientInfo.classList.add('recipient-info');
        recipientInfo.textContent = `Phone Number: ${phoneNumber}`;
        conversationDetails.appendChild(recipientInfo);

        conversations.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        conversations.forEach(message => {
            if (message.status === 'delivered' || message.status === 'received') {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', message.status);
                messageElement.textContent = message.content;
                conversationDetails.appendChild(messageElement);
            }
        });
    }

    // Group messages by status
    function groupMessagesByStatus(conversations) {
        const grouped = {
            delivered: [],
            received: []
        };
        conversations.forEach(message => {
            if (message.status === 'delivered') {
                grouped.delivered.push(message);
            } else if (message.status === 'received') {
                grouped.received.push(message);
            }
        });
        return grouped;
    }

    const campaignButton = document.getElementById('campaignButton');
    campaignButton.addEventListener('click', () => {
        window.location.href = 'campaign.html'; 
    });
});