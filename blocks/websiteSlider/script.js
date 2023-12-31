const buttons = document.querySelectorAll('.websiteSlider .circle-button');
const slider = document.querySelector('.websiteSlider .blocks');

buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        // Calculate the left percentage based on the button index
        const leftPercentage = index * -100;

        // Set the margin-left property instead of left property
        slider.style.marginLeft = leftPercentage + '%';

        // Remove 'active' class from all buttons
        buttons.forEach(btn => btn.classList.remove('active'));

        // Add 'active' class to the clicked button
        button.classList.add('active');
    });
});
