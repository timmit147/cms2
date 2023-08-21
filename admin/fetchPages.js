const firebase = require('https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js');
require('https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js');


async function fetchPagesData() {
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

        return pagesData; // Return the data so it can be accessed outside the function

    } catch (error) {
        console.error("Error fetching data: ", error);
        throw error;
    }
}

async function main() {
    const result = await fetchPagesData();

    // Save the result to output.json
    const fs = require('fs');
    fs.writeFileSync('admin/output.json', JSON.stringify(result, null, 2));

    console.log("Data saved to output.json");

    // Print the result for GitHub Actions to capture
    console.log(JSON.stringify(result));
}

main();
