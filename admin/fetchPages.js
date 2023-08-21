async function fetchPagesData() {
    // Your Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCj6MCnHdqr9_DOYRJtSsB30P_LfD3QyH8",
        authDomain: "cms2-58eaf.firebaseapp.com",
        projectId: "cms2-58eaf",
        storageBucket: "cms2-58eaf.appspot.com",
        messagingSenderId: "405806447010",
        appId: "1:405806447010:web:e842ddf9737960fbd45afb",
        measurementId: "G-VYBDR6G2EG"
      };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Get a reference to the Firestore database
    const firestore = firebase.firestore();

    const pagesData = {};

    try {
        const querySnapshot = await firestore.collection('/pages').get();
        querySnapshot.forEach((doc) => {
            pagesData[doc.id] = doc.data();
        });

        console.log("Pages data:", pagesData);

        // Call any other functions that need to use pagesData here

        return pagesData; // Return the data so it can be accessed outside the function

    } catch (error) {
        console.error("Error fetching data: ", error);
        throw error;
    }
}

// Call the fetchPagesData function to start fetching data
async function main() {
    const result = await fetchPagesData();

    // Print the result for GitHub Actions to capture
    console.log(JSON.stringify(result));
}

main(); // Call the main function to initiate the process