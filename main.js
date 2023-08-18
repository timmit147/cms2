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



async function addHtmlToBody(key) {
    const response = await fetch(`./blocks/${key}/body.html`);
    const htmlContent = await response.text();
    document.body.insertAdjacentHTML('beforeend', htmlContent);
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


function addJsScript(key) {
    const url = `blocks/${key}/script.js`;
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
        await addHtmlToBody(blockType);
        await addCssLink(blockType);
        await addJsScript(blockType);
    }
}


async function handleHashbangChange() {
    const hashbang = window.location.hash.substr(1); // Get hash without the '#!'
    const path = window.location.pathname.substr(1); // Get path without the leading '/'

    let targetPage = hashbang || path; // Use hashbang if present, otherwise use path

    // Check if the targetPage is empty or matches "page1"
    if (targetPage === "" || targetPage === "page1") {
        targetPage = "page1"; // Change targetPage to "page1" by default or when it's "page1"
    }

    // Check if the target page is both valid and published
    const isPageValidAndPublished = await isValidAndPublishedPage(targetPage);

    if (!isPageValidAndPublished) {
        window.location.href = "/";
        return; // Stop further processing
    }

    placeBlock(targetPage); // Place block based on the targetPage value
}

async function isValidAndPublishedPage(page) {
    const pageRef = firestore.collection('pages').doc(page);
    const pageSnapshot = await pageRef.get();

    if (pageSnapshot.exists) {
        const pageData = pageSnapshot.data();
        return pageData.published === true;
    }

    return false;
}

// Listen for hash changes and handle them
window.addEventListener('hashchange', handleHashbangChange);

// Initial handling based on the current hashbang
handleHashbangChange();


