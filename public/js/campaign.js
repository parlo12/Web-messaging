document.addEventListener("DOMContentLoaded", () => {
    const csvFileInput = document.getElementById("csvFileInput");
    const startCampaignButton = document.getElementById("startCampaignButton");
    const formattedMessageElement = document.getElementById("formattedMessage");

    let csvData = [];

    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId'); // Retrieve userId

    if (!accessToken || !userId) {
        // Redirect to login page if not authenticated
        window.location.href = "index.html";
        return;
    }

    // Initialize WebSocket connection
    const socket = io('http://165.22.179.230:4000', {
        auth: { token: accessToken }
    });

    csvFileInput.addEventListener("change", (event) => {
        console.log("File input changed");
        const file = event.target.files[0];
        console.log("File selected:", file);

        if (file) {
            Papa.parse(file, {
                header: true,
                complete: function(results) {
                    console.log("Parsing complete:", results);
                    csvData = results.data;
                    startCampaignButton.disabled = false;
                    updateMessagePreview(csvData[0]); // Show preview for the first row
                },
                error: function(error) {
                    console.error("Parsing error:", error);
                }
            });
        } else {
            console.log("No file selected");
        }
    });

    startCampaignButton.addEventListener("click", async () => {
        for (const row of csvData) {
            const formattedMessage = formatMessage(row);
            try {
                sendMessage(row["Phone"], formattedMessage);
                alert(`Phone Number: ${row["Phone"]} Message: ${formattedMessage}`);
            } catch (error) {
                console.error('Error sending message:', error);
            }
            await delay(1000); // Add a delay of 1 second between each message
        }
        window.location.href = "conversation.html";
    });

    function formatMessage(data) {
        const address = data["Street"] || "unknown address";
        return `Hello, are you the owner of the property located at ${address}, ${data["City"]}, ${data["State"]} ${data["Zip"]}?`;
    }

    function updateMessagePreview(data) {
        formattedMessageElement.textContent = formatMessage(data);
    }

    function sendMessage(recipient, content) {
        socket.emit('message', {
            sender: userId, // Use userId from local storage
            receiver: recipient,
            content: content,
            userId: userId,
            origin: "CRM"
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});