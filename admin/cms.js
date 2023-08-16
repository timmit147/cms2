let currentPage = null;
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
                const formContainer = document.getElementById('form-container');
                formContainer.style.display = 'block';

                addMenuButtons();
            })
            .catch((error) => {
                console.error('Error logging in: ', error);
            });
    }
    // Call login function initially
login();
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


async function placeBlock() {
    if (!currentPage) {
        return;
    }

    const blockContainer = document.getElementById('blockContainer');
    blockContainer.innerHTML = ''; // Clear the existing content

    const pages = await fetchDataFromFirestore(`pages/${currentPage}/blocks`);

    for (const [index, block] of Object.entries(pages)) {
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
                reverseBlock(index, block.hash);
            });
            reverseDiv.appendChild(reverseButton);

            blockDiv.appendChild(reverseDiv);
        }

        // Add Remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            removeBlockAndPage(currentPage, index);
        });
        blockDiv.appendChild(removeButton);

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

async function removeBlockAndPage(pageName, blockIndex) {
    const confirmation = confirm(`Are you sure you want to remove the block ${blockIndex} from the page ${pageName}?`);
    if (confirmation) {
        try {
            // Assuming you are using Firebase Firestore
            const blockRef = firebase.firestore().doc(`pages/${pageName}/blocks/${blockIndex}`);
            await blockRef.delete();
            console.log(`Removed block ${blockIndex} from page ${pageName}`);
            placeBlock(); // Re-render the blocks after removal
        } catch (error) {
            console.error("Error removing block:", error);
        }
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
    const pages = await fetchDataFromFirestore("pages");
    try {
        for (const page in pages) {
            const button = document.createElement('button');
            button.textContent = page;

            button.addEventListener('click', () => {
                currentPage = page;
                placeBlock();
            });

            menuContainer.appendChild(button);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}





document.querySelector('#submitButton').addEventListener('click', (event) => {
    event.preventDefault();
    const selectedBlock = document.querySelector('#dropdown').value;
    addNewBlock(selectedBlock);
});


async function addNewBlock(selectedBlock) {
    try {
        const pagesCollection = firestore.collection('pages'); // No 'data' prefix
        const page1DocumentRef = pagesCollection.doc(currentPage);
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

        placeBlock(); // Refresh the blocks after adding a new block
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


