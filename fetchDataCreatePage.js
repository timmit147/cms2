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
  
  const outputPath = path.join("./", '..');
  
  if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
  }

  for (const pageName of pages) {
    if (pageName['name'] == "settings" || pageName['name'] == "tutorial") {
      return;
    }
    await createBaseHtmlContent(pageName['name']);    
  }
}


createHtmlFiles();


const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);


function generateJavascriptTags(blocks) {
  const filePathSet = new Set(); // Create a Set to store unique filePath values

  return blocks
    .map(block => {
      const filePath = path.join("./", 'blocks', block['fields']['type']['stringValue'], 'script.js');

      if (!filePathSet.has(filePath)) {
        filePathSet.add(filePath);
        return `<script src="${filePath}" defer></script>`;
      }

      return '';
    })
    .join('');
}


function generateCssLinks(cssFiles) {
  const cssFilePathSet = new Set(); 
  return cssFiles
    .map(cssFilePath => {
      if (!cssFilePathSet.has(cssFilePath)) {
        cssFilePathSet.add(cssFilePath);
        return `<link rel="stylesheet" type="text/css" href="${cssFilePath}">`;
      }

      return '';
    })
    .join('');
}


async function getPageMetaDescription(pageName){
  const pages = await fetchData('pages');
  let metaDescription;
  
  const page = pages.find(page => page.name === pageName);
  
  if (page) {
    metaDescription = page.fields && page.fields.metaDescription;
    if (metaDescription && typeof metaDescription === 'object' && metaDescription.stringValue) {
      metaDescription = metaDescription.stringValue;
    }
  } else {
    console.log(`Page '${pageName}' not found.`);
  }
  return metaDescription;
}

async function generateHtmlPage(pageName, javascriptFiles, cssLinks, combinedBodyContent) {

  metaDescription = await getPageMetaDescription(pageName);
  
  if (combinedBodyContent.trim() !== '') {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content='${metaDescription}'>
          <meta name="theme-color" content="#007bff">
          <link rel="manifest" href="/manifest.json">
          <title>${pageName}</title>
          ${cssLinks}
      </head>
      <body>
          ${combinedBodyContent}
          ${javascriptFiles}
          
          <script>
              if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
                      .then(registration => {
                          console.log('Service Worker registered with scope:', registration.scope);
                      })
                      .catch(error => {
                          console.error('Service Worker registration failed:', error);
                      });
              }
          </script>
      </body>
      </html>    
    `;

    if (pageName === "homepage") {
      pageName = "index";
    }

    const outputFilePath = path.join("./", `${pageName}.html`);
    
    fs.writeFileSync(outputFilePath, htmlContent);
    
    console.log(`New HTML page generated at: ${outputFilePath}`);
  } else {
    console.log(`No body content found for ${pageName}.`);
  }
}

async function createBaseHtmlContent(pageName) {
  const blocks = await fetchData(`pages/${pageName}/blocks`);
  const bodyPromises = [];
  const cssFiles = [];

  const cssFilePath = path.join('./style.css');
  cssFiles.push(cssFilePath);

  blocks.sort((a, b) => {
  const orderA = parseInt(a['fields']['order']['integerValue']) || 0;
  const orderB = parseInt(b['fields']['order']['integerValue']) || 0;
  return orderA - orderB;
});

  for (const block of blocks) {
    const filePath = path.join("./", 'blocks', block['fields']['type']['stringValue'], 'body.html');
    const promise = await readFile(filePath, 'utf-8');


    let update = await replaceValues(promise,'id',block['name']);
    const fields = await block['fields'];
    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
        let value = fields[key];
    
        for (const innerKey in value) {
          if (value[innerKey].startsWith('https://firebasestorage.googleapis.com/')) {
            // Save the image and get the saved filename
            const savedImageFilename = await saveImages(value[innerKey]);
            // Replace the URL with the saved filename
            value[innerKey] = savedImageFilename;
          }
        }
    
        if (value.arrayValue) {
          update = renderArray(update, 'fruits', fields[key].arrayValue.values);
        } else {
          update = await replaceValues(update, key, fields[key].stringValue);
        }
      }
    }
    

    bodyPromises.push(update);

    const cssFilePath = path.join("./", 'blocks', block['fields']['type']['stringValue'], 'style.css');
    cssFiles.push(cssFilePath);
  }

  const bodyContents = await Promise.all(bodyPromises);
  const combinedBodyContent = bodyContents.join('');

  const javascriptFiles = generateJavascriptTags(blocks);
  const cssLinks = generateCssLinks(cssFiles);

  generateHtmlPage(pageName, javascriptFiles, cssLinks, combinedBodyContent);
}


const https = require('https');

function sanitizeFilename(filename) {
  // Remove invalid characters from the filename
  return filename.replace(/[/\\?%*:|"<>]/g, '_');
}

function saveImages(imageUrl) {
  // Specify the root directory where "images" folder will be created
  const rootDirectory = './';
  
  // Create the "images" directory if it doesn't exist
  const imagesDirectory = path.join(rootDirectory, 'images');
  if (!fs.existsSync(imagesDirectory)) {
    fs.mkdirSync(imagesDirectory, { recursive: true });
  }

  // Extract the image filename from the URL and sanitize it
  const originalFilename = path.basename(imageUrl);
  const filename = sanitizeFilename(originalFilename.split('?')[0]); // Remove everything after '?'

  // Create a writable stream to save the image
  const fileStream = fs.createWriteStream(path.join(imagesDirectory, filename));

  // Send an HTTP GET request to download the image
  https.get(imageUrl, (response) => {
    response.pipe(fileStream);

    // Handle the end of the download
    fileStream.on('finish', () => {
      fileStream.close();
      // console.log(`Image saved: ${filename}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading image: ${err.message}`);
  });
  return `images/${filename}`;

}


function replaceValues(htmlContent, currentName, updateName) {
  var regexPattern = new RegExp(`{{${currentName}}}`, 'g');
  var updatedHtmlContent = htmlContent.replace(regexPattern, updateName);
  return updatedHtmlContent;
}

function renderArray(htmlContent, arrayName, dataArray) {
  const loopStart = `{{${arrayName}}}`;
  const loopEnd = `{{/${arrayName}}}`;
  const loopRegex = new RegExp(`${loopStart}(.*?)${loopEnd}`, 'gs');

  return htmlContent.replace(loopRegex, (match, innerContent) => {
    return dataArray.map(item => {
      return innerContent.replace(/\{\{this\}\}/g, item.stringValue || '');
    }).join('');
  });
}

