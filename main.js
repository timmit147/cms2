newDatabase()

async function newDatabase() {
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
    firestore = firebase.firestore();

    placeBlock()
}

// Function to fetch data from Firestore and display
async function fetchDataFromFirestore(path) {
    const allData = {};

    try {
        const querySnapshot = await firestore.collection(path).get();
        querySnapshot.forEach((doc) => {
            allData[doc.id] = doc.data();
        });
        return allData;
    } catch (error) {
        console.error("Error fetching data: ", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}



async function addHtmlToBody(blockKey,blockType) {
    const response = await fetch(`./blocks/${blockType}/body.html`);
    const htmlContent = await response.text();
    document.body.insertAdjacentHTML('beforeend', htmlContent);
    window.key = blockKey;   
    await addCssLink(blockType);
    const imageBlockElement = document.querySelector(`#${blockType}`);
    imageBlockElement.id = blockKey;
    await addJsScript(blockType,blockKey);
}

function addCssLink(key) {
    const url = `blocks/${key}/style.css`;
    const head = document.getElementsByTagName('head')[0];
    const links = document.getElementsByTagName('link');
    let isCssAlreadyAdded = false;

    for (let i = 0; i < links.length; i++) {
        if (links[i].href === url && links[i].rel === 'stylesheet') {
            isCssAlreadyAdded = true;
            break;
        }
    }

    if (!isCssAlreadyAdded) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        head.appendChild(link);
    }
}


async function addJsScript(blockType,blockKey) {
    const url = `blocks/${blockType}/script.js`;
    const head = document.getElementsByTagName('head')[0];
    const scripts = document.getElementsByTagName('script');
    let isScriptAlreadyAdded = false; 

    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src === url) {
            isScriptAlreadyAdded = true;
            break;
        }
    }

    if (!isScriptAlreadyAdded) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        head.appendChild(script);
        
    }
}


async function placeBlock(pageName) {
    const firestorePath = `pages/${pageName}/blocks`;
    const blocksData = await fetchDataFromFirestore(firestorePath);

    // Clear previous content before adding new blocks
    document.body.innerHTML = ''; // Clear the body content

    for (const blockKey in blocksData) {
        const block = blocksData[blockKey];
        const blockType = block['type'];
        await addHtmlToBody(blockKey,blockType);
    }
}

placeBlock(document.body.id);