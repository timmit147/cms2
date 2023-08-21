const https = require('https');

const apiKey = "AIzaSyCj6MCnHdqr9_DOYRJtSsB30P_LfD3QyH8";
const collectionName = "pages";
const projectId = "cms2-58eaf";

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
              // Extract the document name from the full path
              const pathSegments = item.name.split('/');
              return pathSegments[pathSegments.length - 1];
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