export function formatDate(inputDate: string | undefined): string {
    if (inputDate === undefined) {
        // Handle the case when inputDate is undefined
        return "N/A";
    }
    const dateParts = inputDate.split("-");

    const year = parseInt(dateParts?.[0] ?? "N/A");
    const month = parseInt(dateParts?.[1] ?? "N/A");
    const day = parseInt(dateParts?.[2] ?? "N/A");

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const formattedDate = `${day} ${months[month - 1]} ${year}`;
    return formattedDate;
}

export function createTitle(divContainer: HTMLDivElement, title: string, isSol: boolean, dateEarth: string, dateSol: string) {
    let titleBox = divContainer.querySelector("#title-box");
    if (!titleBox) {
        titleBox = document.createElement("div");
        titleBox.id = "title-box";
        titleBox.classList.add("title-box"); 
    } else {
        titleBox.innerHTML = '';
    }

    const titleElement = document.createElement("h1");
    titleElement.textContent = title;
    const dateElement = document.createElement("h2");

    if (isSol) {   
        dateElement.textContent = `Sol ${dateSol}`;
    } else {
        dateElement.textContent = dateEarth;
    }

    titleBox?.appendChild(titleElement);
    titleBox?.appendChild(dateElement);

    divContainer.appendChild(titleBox);
}

export function createText(divContainer: HTMLDivElement, text: string) {
    const textElement = document.createElement("p");
    textElement.textContent = text;
    divContainer.appendChild(textElement);
}

export function createFooter(divContainer: HTMLDivElement) {
    const footer = document.createElement("footer");
    footer.textContent = "© 2023 by DeValdi - Gnkgo - Nick";
    divContainer.appendChild(footer);
}

export function celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9 / 5) + 32;
  }