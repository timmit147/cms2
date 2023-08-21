const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const firebaseConfig = {
    apiKey: "AIzaSyCj6MCnHdqr9_DOYRJtSsB30P_LfD3QyH8",
    authDomain: "cms2-58eaf.firebaseapp.com",
    projectId: "cms2-58eaf",
    storageBucket: "cms2-58eaf.appspot.com",
    messagingSenderId: "405806447010",
    appId: "1:405806447010:web:e842ddf9737960fbd45afb",
    measurementId: "G-VYBDR6G2EG"
  };

const firestore = admin.firestore();

async function fetchDataFromFirestore() {
  try {
    const collectionRef = firestore.collection('pages');
    const querySnapshot = await collectionRef.get();
    
    querySnapshot.forEach(doc => {
      console.log(`Document ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    process.exit(1); // Exit with an error status code
  }
}

fetchDataFromFirestore();
