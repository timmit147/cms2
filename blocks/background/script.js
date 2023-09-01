const backgroundElements = document.querySelectorAll(".background");

backgroundElements.forEach(element => {
  element.addEventListener("click", changeBackgroundColor);
});

function changeBackgroundColor(event) {
  const element = event.currentTarget;
  const innerElements = element.querySelectorAll("p, h1");
  
  element.style.backgroundColor = "yellow";
  
  innerElements.forEach(innerElement => {
    innerElement.style.backgroundColor = "yellow";
  });
}
