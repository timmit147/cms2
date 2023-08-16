let currentPage = null;
let database = null;


async function fetchAllData() {
    try {
        const response = await fetch("../database.js");
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

    // Function to fetch data from Firestore and display
    function fetchDataFromFirestore() {
      firestore.collection('data').get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            database = data;
            addMenuButtons();
          });
        })
        .catch((error) => {
          console.error('Error fetching documents: ', error);
        });
    }

    // Call login function initially
    login();
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

function reverseBlock(index, blockHash) {
    // Implement your logic for reversing a block here
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

// function sendRequestToPhp(route, value) {
//     const formData = new FormData();
//     formData.append('JSON_PATH', route);
//     formData.append('NEW_TITLE', value);

//     fetch('server.php', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.text();
//     })
//     .then(data => {
//         console.log(data); // Output the response to the console
//     })
//     .catch(error => {
//         console.error('Fetch error:', error);
//     });
// }

async function addMenuButtons() {
    const menuContainer = document.getElementById('menuContainer');

    try {
        // var data = await fetchAllData();
        const pagesData = database["pages"];

        for (const page in pagesData) {
            const button = document.createElement('button');
            button.textContent = page;

            button.addEventListener('click', () => {
                currentPage = pagesData[page];
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


// function sendBlockName() {
// // Get the selected value from the dropdown
// var selectedValue = document.getElementById("dropdown").value;
// console.log(selectedValue);

// // Create a new XMLHttpRequest object
// var xhr = new XMLHttpRequest();

// // Define the PHP file URL to send the data to
// var phpFile = "addBlock.php";

// // Create the data to be sent in the request
// var data = new FormData();
// data.append('blockName', selectedValue);

// // Set up the AJAX request
// xhr.open("POST", phpFile, true);

// // Set the event handler to handle the response from the PHP file
// xhr.onreadystatechange = function() {
//     if (xhr.readyState === 4 && xhr.status === 200) {
//         // This is where you can handle the response from the PHP file if needed
//         console.log(xhr.responseText);
//     }
// };

// // Send the AJAX request with the data
// xhr.send(data);
// }

// document.getElementById("submitButton").addEventListener("click", sendBlockName);

        
