document.addEventListener("DOMContentLoaded", () => {
    const csvFileInput = document.getElementById("csvFileInput");
    const startCampaignButton = document.getElementById("startCampaignButton");
    const formattedMessageElement = document.getElementById("formattedMessage");

    let csvData = [];

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
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            // Redirect to login page if not authenticated
            window.location.href = "index.html";
            return;
        }

        for (const row of csvData) {
            const formattedMessage = formatMessage(row);
            try {
                const response = await sendMessage(accessToken, row["Phone"], formattedMessage);
                if (!response.ok) {
                    throw new Error(`Network response was not ok. Status: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                console.log('Message sent:', data);
                alert(`Phone Number: ${row["Phone"]} Message: ${formattedMessage}`);
                // Optionally, redirect or update the UI here
                //window.location.href = "conversation.html";
            } catch (error) {
                console.error('Error sending message:', error);
            }
            await delay(1000); // Add a delay of 1 second between each request
        }
        window.location.href = "conversation.html";
    });

    function formatMessage(data) {
        // Check if 'Address' property exists, otherwise provide a default value
        const address = data["Street"] || "unknown address";
        return `Hello, are you the owner of the property located at ${address}, ${data["City"]}, ${data["State"]} ${data["Zip"]}?`;
    }

    function updateMessagePreview(data) {
        formattedMessageElement.textContent = formatMessage(data);
    }

    function sendMessage(accessToken, recipient, content) {
        return fetch("http://localhost:4000", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ recipient, content })
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});