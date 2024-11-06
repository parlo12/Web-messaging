$(document).ready(function() {
    $("#registerForm").submit(function(event) {
      event.preventDefault();
  
      const formData = {
        name: $("#name").val(),
        email: $("#email").val(),
        password: $("#password").val(),
        password_confirmation: $("#password_confirmation").val()
      };
  
      $.ajax({
        url: "http://68.183.112.242/api/register",
        method: "POST",
        data: JSON.stringify(formData),
        contentType: "application/json",
        success: function(response) {
          // Handle successful registration (e.g., redirect to login)
          console.log("Registration successful:", response);
          alert("Registration successful! You can now log in.");
          window.location.href = "index.html"; 
        },
        error: function(xhr, status, error) {
          // Handle registration errors
          console.error("Registration failed:", error);
          alert("Registration failed. Please try again."); 
        }
      });
    });
  });
  
  