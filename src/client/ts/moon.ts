const moonContainer = document.getElementById('moon-container');

function createFooterMoon() {
    const footer = document.createElement("footer");  
    footer.textContent = "© 2023 by DeValdi - Gnkgo - Nick20500";
    moonContainer?.appendChild(footer);
  }

function initMoon() {
    createFooterMoon();

    const h1 = document.createElement("h1");
    h1.textContent = "Hello I am a Moon`! :D"

    const img = document.createElement("img");
    img.src = "/src/client/img/moon.png"
    img.id = "moon";
    moonContainer?.appendChild(img);
    moonContainer?.appendChild(h1);
}


  
initMoon();
