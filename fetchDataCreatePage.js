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

  for (const page of pages) {
    const pageName = page.name;
      await createBaseHtmlContent(pageName); 
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
        return `<script src="${filePath}" type="module" defer></script>`;
      }

      return '';
    })
    .join('');
}


function generateSingleCssFile(cssFiles,page) {
  const outputFilePath = `${page}.css`; // Set the output file path in the root directory
  
  let combinedCss = '';
  
  cssFiles.forEach(cssFilePath => {
    const cssContent = fs.readFileSync(cssFilePath, 'utf-8');
    combinedCss += cssContent;
  });

  fs.writeFileSync(outputFilePath, combinedCss, 'utf-8');
  return `<link rel="stylesheet" type="text/css" href="${outputFilePath}">`;
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

async function getPagemetaTitle(pageName){
  const pages = await fetchData('pages');
  
  const page = pages.find(page => page.name === pageName);
  
  if (page) {
    metaTitle = page.fields && page.fields.metaTitle;
    if (metaTitle && typeof metaTitle === 'object' && metaTitle.stringValue) {
      metaTitle = metaTitle.stringValue;
    }
  } else {
    console.log(`Page '${pageName}' not found.`);
  }
  return metaTitle;
}

async function generateHtmlPage(pageName, javascriptFiles, cssLinks, combinedBodyContent) {
  metaDescription = await getPageMetaDescription(pageName);
  metaTitle = await getPagemetaTitle(pageName);

  
  if (combinedBodyContent.trim() !== '') {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content='${metaDescription}'>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
          <link rel="manifest" href="/manifest.json">
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
          <meta name="msapplication-TileColor" content="#1c1c1c">
          <meta name="theme-color" content="#1c1c1c">
          <title>${pageName}</title>
          <link rel="canonical" href="https://multii.nl">
          ${cssLinks}
      </head>
      <body>
          ${combinedBodyContent}
          ${javascriptFiles}
          <script defer src="script.js"></script>

          
          <script>
              if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
                      .then(registration => {
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

    const outputFilePath = path.join("./", pageName + ".html");
    
    fs.writeFileSync(outputFilePath, htmlContent);
    
    console.log(`New HTML page generated at: ${outputFilePath}`);
  } else {
    console.log(`No body content found for ${pageName}.`);
  }
}

async function createBaseHtmlContent(pageName) {
  console.log(pageName);
  let blocks = await fetchData(`pages/${pageName}/blocks`);

  const bodyPromises = [];
  const cssFiles = [];


  const cssFilePath = path.join('./style.css');
  cssFiles.push(cssFilePath);

  
  blocks.sort((a, b) => {
    const orderA = a['fields']['order']['integerValue'] || a['fields']['order']['stringValue'] || 0;
    const orderB = b['fields']['order']['integerValue'] || b['fields']['order']['stringValue'] || 0;
  
    // Use localeCompare for string comparison and parseInt for numeric comparison
    if (typeof orderA === 'number' && typeof orderB === 'number') {
      return orderA - orderB; // Numeric comparison
    } else {
      return orderA.toString().localeCompare(orderB.toString()); // String comparison
    }
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
  const cssLinks = generateSingleCssFile(cssFiles,pageName);
  generateHtmlPage(pageName, javascriptFiles, cssLinks, combinedBodyContent);
}


const https = require('https');

const sharp = require('sharp');

function sanitizeFilename(filename) {
  // Remove invalid characters from the filename
  return filename.replace(/[/\\?%*:|"<>]/g, '_');
}

async function saveImages(imageUrl) {
  const rootDirectory = './';
  const imagesDirectory = path.join(rootDirectory, 'images');
  if (!fs.existsSync(imagesDirectory)) {
    fs.mkdirSync(imagesDirectory, { recursive: true });
  }

  const originalFilename = path.basename(imageUrl);
  const filename = sanitizeFilename(originalFilename.split('?')[0]);

  const fileStream = fs.createWriteStream(path.join(imagesDirectory, filename));

  return new Promise((resolve, reject) => {
    https.get(imageUrl, (response) => {
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();

        // Resize the original image to have a max width of 1500px or smaller
        const originalImage = sharp(path.join(imagesDirectory, filename));
        originalImage.metadata().then((metadata) => {
          if (metadata.width > 1500) {
            originalImage.resize({ width: 1500 });
          }

          // Convert the original image to WebP format
          const originalOutputPath = path.join(imagesDirectory, filename.replace(/\.[^.]+$/, '.webp'));
          originalImage.toFile(originalOutputPath, (err) => {
            if (err) {
              console.error(`Error converting original image to WebP: ${err.message}`);
              reject(err);
              return;
            }
            // Remove the original image
            fs.unlinkSync(path.join(imagesDirectory, filename));
            resolve(`src="images/${filename.replace(/\.[^.]+$/, '.webp')}" srcset="images/${filename.replace(/\.[^.]+$/, '_mobile.webp')} 600w, images/${filename.replace(/\.[^.]+$/, '.webp')} 1200w" sizes="(max-width: 600px) 100vw, 1500px"`);
          });
        });
      });
    }).on('error', (err) => {
      console.error(`Error downloading image: ${err.message}`);
      reject(err);
    });
  });
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

