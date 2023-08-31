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
    if (pageName['name'] == "settings" || pageName['name'] == "tutorial") {
      return;
    }
    const htmlContent = await createBaseHtmlContent(pageName["name"]);
    const newPageFilePath = path.join(outputPath, `${pageName["name"]}.html`);
    fs.writeFileSync(newPageFilePath, htmlContent);
    console.log(`New HTML page generated at: ${newPageFilePath}`);
  }
}


createHtmlFiles();


const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);


function generateJavascriptTags(blocks) {
  return blocks
    .map(block => {
      const filePath = path.join(__dirname, 'blocks', block['fields']['type']['stringValue'], 'script.js');
      return `<script src="${filePath}"></script>`;
    })
    .join('');
}

function generateCssLinks(cssFiles) {
  return cssFiles
    .map(cssFilePath => {
      return `<link rel="stylesheet" type="text/css" href="${cssFilePath}">`;
    })
    .join('');
}

async function generateHtmlPage(pageName, javascriptFiles, cssLinks, combinedBodyContent) {
  if (combinedBodyContent.trim() !== '') {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>${pageName}</title>
          ${javascriptFiles}
          ${cssLinks}
      </head>
      <body>
          ${combinedBodyContent}
      </body>
      </html>
    `;

    const outputFilePath = path.join(__dirname, `${pageName}.html`);
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

  for (const block of blocks) {
    const filePath = path.join(__dirname, 'blocks', block['fields']['type']['stringValue'], 'body.html');
    const promise = readFile(filePath, 'utf-8');
    bodyPromises.push(promise);

    const cssFilePath = path.join(__dirname, 'blocks', block['fields']['type']['stringValue'], 'style.css');
    cssFiles.push(cssFilePath);
  }

  const bodyContents = await Promise.all(bodyPromises);
  const combinedBodyContent = bodyContents.join('');

  const javascriptFiles = generateJavascriptTags(blocks);
  const cssLinks = generateCssLinks(cssFiles);

  generateHtmlPage(pageName, javascriptFiles, cssLinks, combinedBodyContent);
}
