// Import the Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCj6MCnHdqr9_DOYRJtSsB30P_LfD3QyH8",
    authDomain: "cms2-58eaf.firebaseapp.com",
    projectId: "cms2-58eaf",
    storageBucket: "cms2-58eaf.appspot.com",
    messagingSenderId: "405806447010",
    appId: "1:405806447010:web:e842ddf9737960fbd45afb",
    measurementId: "G-VYBDR6G2EG"
  };

// Initialize Firebase with your config
const firebaseApp = initializeApp(firebaseConfig);

// Get a reference to the form element by its ID
const contactForm = document.querySelector('.contactForm form');

// Add an event listener for the form submission
contactForm.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the default form submission behavior
    
    // Get the form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Call a function to add the data to Firebase Firestore
    await addDataToFirestore(name, email, message);

    // Hide the form
    contactForm.style.display = 'none';

    // Display the "Form submitted" message
    const submittedMessage = document.getElementById('submittedMessage');
    submittedMessage.style.display = 'block';
});

// Function to add data to Firebase Firestore
async function addDataToFirestore(name, email, message) {
    try {
        // Get a reference to the Firestore database
        const db = getFirestore(firebaseApp);

        // Get a reference to the "emails" collection
        const emailsCollection = collection(db, "emails");

        // Create a new document with the form data
        const newDocument = {
            name: name,
            email: email,
            content: message,
            date: new Date(),
        };

        // Add the document to the "emails" collection
        const docRef = await addDoc(emailsCollection, newDocument);
        console.log("Document written with ID: ", docRef.id);

        // Optionally, you can reset the form after successful submission
        contactForm.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}
