newDatabase()


async function getCurrentPage() {
    let currentPage = localStorage.getItem("currentPage");

    if (window.location.pathname === '/' && currentPage !== 'homepage') {
        localStorage.setItem("currentPage", "homepage");
    }

    document.body.id = currentPage;
    return currentPage; // Add this line to return the currentPage value
    
}

function changeSlug(page) {
    console.log(page);
    if (window.history && window.history.pushState) {
        const baseUrl = window.location.protocol + '//' + window.location.host;
        const newUrl = page === 'homepage' ? baseUrl : `${baseUrl}/${page}`;
        window.history.pushState(null, null, newUrl);
    }
}

  

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
    
    let page = await getCurrentPage();
    await changeSlug(page);
    await placeBlock(page);
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
    await addCssLink(blockType);
    const response = await fetch(`./blocks/${blockType}/body.html`);
    const htmlContent = await response.text();
    document.body.insertAdjacentHTML('beforeend', htmlContent);
    await changeId(blockKey,blockType);
    await addJsScript(blockType,blockKey);
}

function changeId(blockKey,blockType){
    document.querySelector(`#${blockType}`).id = blockKey;
}

function windowsKey(blockKey,blockType){
    window.key = blockKey;   
    const imageBlockElement = document.querySelector(`#${blockType}`);
    imageBlockElement.id = blockKey;
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


async function addJsScript(blockType) {
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
    let firestorePath = `pages/${pageName}/blocks`;
    let blocksData = await fetchDataFromFirestore(firestorePath);

    if (Object.keys(blocksData).length === 0) {
        await changeSlug("homepage");
        firestorePath = `pages/homepage/blocks`;
        blocksData = await fetchDataFromFirestore(firestorePath);
    }    

    // Convert the blocksData object into an array of blocks
    const blockArray = Object.entries(blocksData).map(([blockKey, block]) => ({
        blockKey,
        ...block
    }));

    // Sort the blocks based on the "order" property
    const sortedBlocks = blockArray.sort((a, b) => a.order - b.order);

    // Clear previous content before adding new blocks
    document.body.innerHTML = ''; // Clear the body content

    for (const block of sortedBlocks) {
        await addHtmlToBody(block.blockKey, block.type);
    }
}


