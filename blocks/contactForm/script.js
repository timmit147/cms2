const contactForm = document.querySelector('.contactForm form');

// Add an event listener for the form submission
contactForm.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the default form submission behavior
    
    // Get the form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Hide the form
    contactForm.style.display = 'none';

    // Create an object to hold the form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message);

    try {
        // Make an HTTP POST request to your PHP script
        const response = await fetch('http://multii.freaze.eu/email.php', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // If the request was successful, display the response message
            const responseData = await response.text();
            const submittedMessage = document.getElementById('submittedMessage');
            submittedMessage.style.display = 'block';
            submittedMessage.textContent = responseData;
        } else {
            console.error('Failed to send email:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
});
