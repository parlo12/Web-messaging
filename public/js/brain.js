//apikey =***REMOVED***

document.addEventListener("DOMContentLoaded", () => {
    // Listen for the custom event to initialize the input field functionality
    document.addEventListener('inputFieldCreated', () => {
        const newMessageInput = document.querySelector('.new-message-input');
        
        if (!newMessageInput) {
            console.error('Error: new-message-input element not found');
            return;
        }

        const suggestionElement = document.createElement('div');
        suggestionElement.classList.add('chatgpt-suggestion');
        newMessageInput.parentNode.insertBefore(suggestionElement, newMessageInput.nextSibling); // Add suggestion element after input

        newMessageInput.addEventListener('input', debounce(async () => {
            const inputText = newMessageInput.value.trim();
            if (inputText !== '') {
                console.log('Input text:', inputText); // Debug log for input text
                try {
                    const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'REMOVED'
                        },
                        body: JSON.stringify({
                            prompt: `Correct the grammar and improve the sentence structure of the following text:\n\n${inputText}\n\nImproved text:`,
                            temperature: 0.2, // Adjust for creativity
                            max_tokens: 100,  // Adjust for response length
                            top_p: 0.95,     // Adjust for confidence
                            frequency_penalty: 0,
                            presence_penalty: 0
                        })
                    });

                    console.log('API response:', response); // Debug log for the response
                    const data = await response.json();
                    console.log('API response data:', data); // Debug log for the response data
                    if (data.choices && data.choices.length > 0) {
                        suggestionElement.textContent = `Suggestion: ${data.choices[0].text.trim()}`;
                    } else {
                        suggestionElement.textContent = ''; // Clear suggestion if none
                    }
                } catch (error) {
                    console.error('Error getting ChatGPT suggestion:', error);
                    suggestionElement.textContent = 'Error getting suggestion';
                }
            } else {
                suggestionElement.textContent = ''; // Clear suggestion if input is empty
            }
        }, 300)); // Debounce with 300ms delay

        function debounce(func, wait) {
            let timeout;
            return function() {
                const context = this, args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }
    });

    // Dispatch the custom event to initialize the input field functionality
    document.dispatchEvent(new Event('inputFieldCreated'));
});
