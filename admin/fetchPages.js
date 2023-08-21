const apiKey = "AIzaSyCj6MCnHdqr9_DOYRJtSsB30P_LfD3QyH8";
const collectionName = "pages";
const projectId = "cms2-58eaf";

const apiUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?key=${apiKey}`;

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.documents) {
      data.documents.forEach(doc => {
        console.log(doc.fields); // Access the fields of each document
      });
    }
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });

  
  console.log(fetch(apiUrl));
  
  
  