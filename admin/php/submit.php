<?php
$repositoryOwner = 'timmit147';
$repositoryName = 'cms2';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $selectedBlock = $_POST['block'];

    // Construct the correct file path
    $templateFilePath = __DIR__ . "/../../blocks/{$selectedBlock}/template.js";

    // Read the content of the template file
    $templateContent = file_get_contents($templateFilePath);

    // Authenticate with GitHub (using a user agent)
    $authHeader = "User-Agent: YourAppName"; // Replace YourAppName with a unique name for your application

    // Prepare the data to be added to database.js
    $dataToAppend = "// Appended from form submission\n";
    $dataToAppend .= "// Template content for {$selectedBlock}\n";
    $dataToAppend .= $templateContent;

    // Send a request to add content to database.js
    $url = "https://api.github.com/repos/{$repositoryOwner}/{$repositoryName}/contents/database.js";
    $data = [
        "message" => "Add template content for {$selectedBlock}",
        "content" => base64_encode($dataToAppend)
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\n{$authHeader}",
            'method' => 'PUT',
            'content' => json_encode($data)
        ]
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);

    if ($response !== false) {
        echo "Content added successfully!";
    } else {
        echo "Error adding content.";
    }
}
?>
