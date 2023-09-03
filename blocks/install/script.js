let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
    console.log("test");
    event.preventDefault();
    deferredPrompt = event;

    const installButtons = document.querySelectorAll('.installButton');

    installButtons.forEach((button) => {
        button.style.display = 'block';
        button.addEventListener('click', handleInstallButtonClick);
    });
});

function handleInstallButtonClick(event) {
    event.preventDefault();
    const installButton = event.target;
    const parentDiv = installButton.parentElement;

    if (deferredPrompt) {
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the PWA installation');
            } else {
                console.log('User dismissed the PWA installation');
            }
            deferredPrompt = null;
            parentDiv.style.display = 'none';
        });
    }
}

console.log("test");