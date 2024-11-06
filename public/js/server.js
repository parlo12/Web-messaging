$(document).ready(function() {
    $("form").submit(function(event) {
        event.preventDefault();

        const email = $("input[name='user']").val();

        const payload = { email };

        $.ajax({
            url: "http://localhost:4000/users/login",
            method: "POST",
            data: JSON.stringify(payload),
            contentType: "application/json",
            success: function(response) {
                console.log("Login successful:", response);

                const accessToken = response.token;
                const userId = response.data._id;
                const userRole = response.data.role;

                if (accessToken && userId && userRole) {
                    // Save data in localStorage
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('userRole', userRole);

                    // Short delay to ensure storage before redirecting
                    setTimeout(() => {
                        window.location.href = "conversation.html";
                    }, 100); // Delay by 100 ms
                } else {
                    console.error("Missing login data, unable to proceed.");
                }
            },
            error: function(xhr, status, error) {
                console.error("Login failed:", error);
                alert("Invalid email. Please try again.");
            }
        });
    });
});