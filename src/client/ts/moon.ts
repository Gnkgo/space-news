function createFooterMoon() {
    const body = document.body;
    const footer = document.createElement("footer");  
    footer.textContent = "© 2023 by DeValdi - Gnkgo - Nick20500";
    body?.appendChild(footer);
  }

function initMoon() {
    createFooterMoon();

    const body = document.body;
    const h1 = document.createElement("h1");
    h1.textContent = "Hello I am a Moon`! :D"

    const img = document.createElement("img");
    img.src = "/src/client/img/moon.png"
    img.id = "moon";
    body?.appendChild(img);
    body?.appendChild(h1);
}


  
initMoon();
