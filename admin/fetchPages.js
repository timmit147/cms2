const https = require('https');

const apiKey = "YOUR_API_KEY";
const collectionName = "pages";
const projectId = "YOUR_PROJECT_ID";

const apiUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?key=${apiKey}`;

function fetchData(apiUrl) {
  https.get(apiUrl, response => {
    let data = '';

    response.on('data', chunk => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.documents) {
          const names = jsonData.documents.map(item => {
            const nameParts = item.name.split('/'); // Split the full path
            return nameParts[nameParts.length - 1]; // Get the last part
          });
          console.log(names);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });
  }).on('error', error => {
    console.error("Error fetching data:", error);
  });
}

fetchData(apiUrl);
