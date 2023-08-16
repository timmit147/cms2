let database = null;

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
    const firestore = firebase.firestore();

    // Reference to the <ul> element in the HTML
    const dataList = document.getElementById('data-list');
    const dataListContainer = document.getElementById('data-list-container');

    // Function to fetch data from Firestore and display
    function fetchDataFromFirestore() {
        firestore.collection('data').get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    database = data;
                    placeBlock();
                });
            })
            .catch((error) => {
                console.error('Error fetching documents: ', error);
            });
    }

    // Call the function to fetch data from Firestore
    fetchDataFromFirestore();
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



async function placeBlock() {
    const blocksData = database["pages"]["page1"]["blocks"];
  
    for (const blockKey in blocksData) {
      const block = blocksData[blockKey];
      const blockType = block['type'];
  
      await addHtmlToBody(blockType);
      await addCssLink(blockType);
      await addJsScript(blockType);
    }
  }
  
  