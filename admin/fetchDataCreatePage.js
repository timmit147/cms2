async function fetchData(path) {
  const https = require('https');
  const apiKey = "AIzaSyCj6MCnHdqr9_DOYRJtSsB30P_LfD3QyH8";
  const projectId = "cms2-58eaf";
  let apiUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?key=${apiKey}`;

  return new Promise((resolve, reject) => {
    https.get(apiUrl, response => {
      let data = '';

      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.documents) {
            const documents = jsonData.documents.map(item => {
              const pathSegments = item.name.split('/');
              const name = pathSegments[pathSegments.length - 1];
              const fields = item.fields;
              return { name, fields };
            });
            resolve(documents);
          }
        } catch (error) {
          reject(error); 
        }
      });
    }).on('error', error => {
      reject(error);
    });
  });
}

async function createHtmlFiles() {
  const fs = require('fs');
  const path = require('path');
  const pages = await fetchData("pages");
  
  const outputPath = path.join(__dirname, '..');
  
  if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
  }

  for (const pageName of pages) {
    const htmlContent = await createBaseHtmlContent(pageName["name"]);
    const newPageFilePath = path.join(outputPath, `${pageName["name"]}.html`);
    fs.writeFileSync(newPageFilePath, htmlContent);
    console.log(`New HTML page generated at: ${newPageFilePath}`);
  }
}


createHtmlFiles();


async function createBaseHtmlContent(pageName) {
  const blocks = await fetchData(`pages/${pageName}/blocks`);
  let bodyContent = '';
  for (const block of blocks) {
    const blockType = block['fields']['type']['stringValue'];
    console.log(blockType);
    bodyContent += `<div class="${blockType}"></div>`;
  }
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <title>${pageName}</title>
  </head>
  <body>
      ${bodyContent}
  </body>
  </html>
  `;
}





// fetchData("pages/homepage/blocks");

// fetchData("pages");

// fetchData("pages/settings/field");

// fetchData("pages/settings/blocks");


// const fs = require('fs');
// const path = require('path');

// // Function to fetch data from Firestore and display
// async function fetchDataFromFirestore(path) {
//   const allData = {};

//   try {
//       const querySnapshot = await firestore.collection(path).get();
//       querySnapshot.forEach((doc) => {
//           allData[doc.id] = doc.data();
//       });
//       console.log(allData);
//       return allData;
//   } catch (error) {
//       console.error("Error fetching data: ", error);
//       throw error; // Re-throw the error to be handled by the caller
//   }
// }




// fetchDataFromFirestore('pages/homepage/blocks');

// async function placeBlocks(pageName) {
//   let firestorePath = `pages/${pageName}/blocks`;
//   let blocksData = await fetchDataFromFirestore(firestorePath);

//   if (Object.keys(blocksData).length === 0) {
//       await changeSlug("homepage");
//       firestorePath = `pages/homepage/blocks`;
//       blocksData = await fetchDataFromFirestore(firestorePath);
//   }    

//   // Convert the blocksData object into an array of blocks
//   const blockArray = Object.entries(blocksData).map(([blockKey, block]) => ({
//       blockKey,
//       ...block
//   }));

//   // Sort the blocks based on the "order" property
//   const sortedBlocks = blockArray.sort((a, b) => a.order - b.order);

//   // Clear previous content before adding new blocks
//   document.body.innerHTML = ''; // Clear the body content

//   for (const block of sortedBlocks) {
//       await addHtmlToBody(block.blockKey, block.type);
//   }
// }

