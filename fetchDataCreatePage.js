const fs = require('fs');
const path = require('path');
const https = require('https');
const util = require('util');
const fileRead = util.promisify(fs.readFile); // Rename the utility function to fileRead
const sharp = require('sharp');


async function fetchData(path) {
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
          console.error('Error parsing JSON:', error);
          reject(error);
        }
      });
    }).on('error', error => {
      reject(error);
    });
  });
}


async function getHtmlPages() {
  const pages = await fetchData("pages");

  for (const page of pages) {
    const pageName = page.name;
    getBlocks(pageName); 
  }
}

function saveImages(imageUrl) {
  const rootDirectory = './';
  const imagesDirectory = path.join(rootDirectory, 'images');
  if (!fs.existsSync(imagesDirectory)) {
    fs.mkdirSync(imagesDirectory, { recursive: true });
  }

  const originalFilename = path.basename(imageUrl);
  const filename = sanitizeFilename(originalFilename.split('?')[0]);

  const fileStream = fs.createWriteStream(path.join(imagesDirectory, filename));

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
            return;
          }
    
          // Resize the image for mobile devices and save as WebP
          const mobileOutputPath = path.join(imagesDirectory, filename.replace(/\.[^.]+$/, '_mobile.webp'));
          originalImage
            .resize({ width: 600 }) // Adjust the width as needed for your mobile design
            .toFile(mobileOutputPath, (err) => {
              if (err) {
                console.error(`Error converting mobile image to WebP: ${err.message}`);
                return;
              }
    
              // Remove the original image after all operations are complete
              fs.unlinkSync(path.join(imagesDirectory, filename));
            });
        });
      });
    });
  }).on('error', (err) => {
    console.error(`Error downloading image: ${err.message}`);
  });
return `src="images/${filename.replace(/\.[^.]+$/, '.webp')}"  srcset="images/${filename.replace(/\.[^.]+$/, '_mobile.webp')} 600w, images/${filename.replace(/\.[^.]+$/, '.webp')} 1200w" sizes="(max-width: 600px) 100vw, 1500px"`;
  }

function sanitizeFilename(filename) {
  return filename.replace(/[/\\?%*:|"<>]/g, '_');
}


async function getBlocks(pageName) {
  let blocks = await fetchData(`pages/${pageName}/blocks`);
  blocks.sort(compareBlocks);

  const blocksHtml = [];
  const blocksCss = [];

  for (const block of blocks) {
    const update = await processBlock(block, blocksHtml, blocksCss);
    blocksHtml.push(update);
  }

  const bodyContents = await Promise.all(blocksHtml);
  const combinedBodyContent = bodyContents.join('');

  const javascriptFiles = generateJavascriptTags(blocks);
  const cssLinks = generateSingleCssFile(blocksCss, pageName);
  generateHtmlPage(pageName, javascriptFiles, cssLinks, combinedBodyContent);
}

function compareBlocks(a, b) {
  const orderA = getOrderValue(a);
  const orderB = getOrderValue(b);

  if (typeof orderA === 'number' && typeof orderB === 'number') {
    return orderA - orderB;
  } else {
    return orderA.toString().localeCompare(orderB.toString());
  }
}

function getOrderValue(block) {
  return (
    block['fields']['order']['integerValue'] ||
    block['fields']['order']['stringValue'] ||
    0
  );
}

async function processBlock(block, blocksHtml, blocksCss) {
  const blockType = block['fields']['type']['stringValue'];

  if (!blockType) {
    return '';
  }

  let filePath = path.join("./", 'blocks', blockType, 'body.html');
  let fileContent = await fileRead(filePath, 'utf-8');
  let update = await replaceValues(fileContent, 'id', block['name']);

  const fields = block['fields'];

  for (const key in fields) {
    if (fields.hasOwnProperty(key)) {
      let value = fields[key];

      if (value['stringValue'] === 'reference') {
        const refUpdates = await processReferenceField(key, value, blocksCss);
        blocksHtml.push(...refUpdates);
      }

      for (const innerKey in value) {
        if (value[innerKey].startsWith('https://firebasestorage.googleapis.com/')) {
          const savedImageFilename = await saveImages(value[innerKey]);
          value[innerKey] = savedImageFilename;
        }

        update = await replaceValues(update, key, fields[key].stringValue);
      }
    }
  }

  blocksHtml.push(update);
  const cssFilePath = path.join("./", 'blocks', blockType, 'style.css');
  blocksCss.push(cssFilePath);
}


async function processReferenceField(key, value, blocksCss) {
  const referencedBlocks = [];

  let newKey = key.replace('Schema', '');
  let referencedBlocksData = await fetchData(`pages/${newKey}/blocks`);

  for (const referencedBlock of referencedBlocksData) {
    const referencedBlockType = referencedBlock['fields']['type']['stringValue'];

    let refFilePath = path.join("./", 'blocks', referencedBlockType, 'body.html');
    let refFileContent = await fileRead(refFilePath, 'utf-8');
    let refUpdate = await replaceValues(refFileContent, 'id', referencedBlock['name']);

    // Replace placeholders dynamically based on keys in 'fields'
    for (const fieldKey in referencedBlock['fields']) {
      const placeholder = `{{${fieldKey}}}`;
      const value = referencedBlock['fields'][fieldKey]['stringValue'];
      refUpdate = refUpdate.replace(new RegExp(placeholder, 'g'), value);
    }

    const refCssFilePath = path.join("./", 'blocks', referencedBlockType, 'style.css');
    blocksCss.push(refCssFilePath);

    referencedBlocks.push(refUpdate);
  }
  console.log(referencedBlocks);
  return referencedBlocks;
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
          <link rel="stylesheet" type="text/css" href="style.css">
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

function generateJavascriptTags(blocks) {
  const filePathSet = new Set(); // Create a Set to store unique filePath values

  return blocks
    .map(block => {
      if(block['fields']['type']['stringValue'] === undefined){
        return;
      }
      const filePath = path.join("./", 'blocks', block['fields']['type']['stringValue'], 'script.js');

      if (!filePathSet.has(filePath)) {
        filePathSet.add(filePath);
        return `<script src="${filePath}" type="module" defer></script>`;
      }

      return '';
    })
    .join('');
}



function replaceValues(htmlContent, currentName, updateName) {
  var regexPattern = new RegExp(`{{${currentName}}}`, 'g');
  var updatedHtmlContent = htmlContent.replace(regexPattern, updateName);
  return updatedHtmlContent;
}

getHtmlPages();
