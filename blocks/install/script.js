let deferredPrompt = null;

const installButton = document.querySelector('.installButton');

// Check if the browser supports the beforeinstallprompt event
if ('beforeinstallprompt' in window) {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;

        // Show the install button
        installButton.style.display = 'block';
    });

    // Add a click event listener to the install button
    installButton.addEventListener('click', () => {
        if (deferredPrompt) {
            // Trigger the installation prompt
            deferredPrompt.prompt();
            
            // Wait for the user's choice
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the PWA installation');
                } else {
                    console.log('User dismissed the PWA installation');
                }
                
                // Reset the deferredPrompt
                deferredPrompt = null;

                // Hide the install button
                installButton.style.display = 'none';
            });
        }
    });
} else {
    // If the beforeinstallprompt event is not supported, hide the install button
    installButton.style.display = 'none';
}
