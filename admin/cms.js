let currentPage = null;
let database = null;
let firestore = null; // Declare firestore in a broader scope

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

    // Reference to the <ul> element in the HTML
    const dataList = document.getElementById('data-list');
    const dataListContainer = document.getElementById('data-list-container');
    const loginForm = document.getElementById('login-form');

    // Function to log in
    function login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                // User logged in successfully
                loginForm.style.display = 'none';

                // Call function to fetch data
                fetchDataFromFirestore();
            })
            .catch((error) => {
                console.error('Error logging in: ', error);
            });
    }
    // Call login function initially
login();
}

// Function to fetch data from Firestore and display
function fetchDataFromFirestore() {
    const blocksData = {};

    firestore.collection('pages').get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            blocksData[doc.id] = doc.data();
        });

        database = blocksData;
        addMenuButtons();
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
}








  async function placeBlock() {
    if (!currentPage) {
        return;
    }

    const blocksData = currentPage["blocks"];
    const blockContainer = document.getElementById('blockContainer');
    blockContainer.innerHTML = ''; // Clear the existing content

    for (const [index, block] of Object.entries(blocksData)) {
        const blockDiv = document.createElement('div');
        const typeLabel = document.createElement('label');
        typeLabel.textContent = block["title"] || block["type"];
        typeLabel.style.fontWeight = 'bold';
        blockDiv.appendChild(typeLabel);

        let propertiesVisible = false;

        for (const key in block) {
            if (key === "type" || key === "hash") {
                continue;
            }
            if (block.hasOwnProperty(key)) {
                const propertyDiv = document.createElement('div');
                propertyDiv.style.display = 'none';

                const inputLabel = document.createElement('label');
                inputLabel.textContent = key;
                inputLabel.style.fontWeight = 'bold';
                propertyDiv.appendChild(inputLabel);

                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.value = block[key];
                propertyDiv.appendChild(inputField);

                blockDiv.appendChild(propertyDiv);
            }
        }

        if (block.hash) {
            const reverseDiv = document.createElement('div');
            reverseDiv.style.display = 'none';

            const reverseButton = document.createElement('button');
            reverseButton.textContent = 'Reverse';
            reverseButton.addEventListener('click', () => {
                reverseBlock(index, block.hash); // Pass the block index and hash to reverseBlock function
            });
            reverseDiv.appendChild(reverseButton);

            blockDiv.appendChild(reverseDiv);
        }

        typeLabel.addEventListener('click', () => {
            const propertyDivs = blockDiv.querySelectorAll('div');
            propertiesVisible = !propertiesVisible;
            propertyDivs.forEach(div => {
                div.style.display = propertiesVisible ? 'block' : 'none';
            });
        });

        blockContainer.appendChild(blockDiv);
    }
}




async function fetchOldData(commitHash) {
    try {
        const response = await fetch(
            `https://raw.githubusercontent.com/timmit147/cms/${commitHash}/database.js`
        );

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

async function reverseBlock(blockIndex, hash) {
    try {
        const oldData = await fetchOldData(hash);
        if (oldData && oldData.pages) {
            const pages = oldData.pages;
            for (const page in pages) {
                if (pages.hasOwnProperty(page)) {
                    const reversedBlock = pages[page]["blocks"][blockIndex];
                    for (const key in reversedBlock) {
                        if (reversedBlock.hasOwnProperty(key)) {
                            currentPage["blocks"][blockIndex][key] = reversedBlock[key];
                        }
                    }
                    placeBlock();
                    break; // Only process the first page found
                }
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


async function addMenuButtons() {
    const menuContainer = document.getElementById('menuContainer');

    try {
        for (const page in database) {
            const button = document.createElement('button');
            button.textContent = page;

            button.addEventListener('click', () => {
                currentPage = database[page];
                currentPage.name = page;
                placeBlock();
            });

            menuContainer.appendChild(button);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


placeBlock();





document.querySelector('#submitButton').addEventListener('click', (event) => {
    event.preventDefault();
    const selectedBlock = document.querySelector('#dropdown').value;
    addNewBlock(selectedBlock);
});


async function addNewBlock(selectedBlock) {
    try {
        const pagesCollection = firestore.collection('pages'); // No 'data' prefix
        const page1DocumentRef = pagesCollection.doc('page1');
        const blocksCollectionRef = page1DocumentRef.collection('blocks'); // Subcollection for blocks

        const newBlockDocRef = blocksCollectionRef.doc(selectedBlock);

        const newBlockData = {
            content: `Content of ${selectedBlock}`,
            title: selectedBlock,
            link: `https://example.com/${selectedBlock}`,
            type: selectedBlock
        };

        // Set the entire block data in the document with the selectedBlock ID
        await newBlockDocRef.set(newBlockData);

        console.log(`New block '${selectedBlock}' added successfully.`);
    } catch (error) {
        console.error('Error adding new block:', error);
    }
}

// Add an event listener to the form submission
document.querySelector('#submitButton').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the selected block value from the dropdown
    const selectedBlock = document.querySelector('#dropdown').value;

    // Call the function to add a new block with the selected value
    await addNewBlock(selectedBlock);
});


