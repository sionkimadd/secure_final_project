const api_key = "DEMO_KEY";

async function makeRequest(endpoint) {
    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();

    } catch (error) {
        console.error(error.message);
        alert("No API responses");
    }
}

async function fetchPhotos(date) {
    const endpoint = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?api_key=${api_key}&earth_date=${date}`;
    const nasaPhotos = await makeRequest(endpoint);

    if (!nasaPhotos) {
        throw new Error("Invalid NASA API");
    }

    const roverResults = [];

    for (const marsPhoto of nasaPhotos.photos.slice(0, 3)) {
        const {
            camera: { full_name },
            img_src,
            earth_date,
            sol,
            rover: { name, status }
        } = marsPhoto;

        roverResults.push({
            full_name,
            img_src,
            earth_date,
            sol,
            name,
            status
        });
    }

    return roverResults;
}

async function displayPhotos(photos, description) {
    const photoContainer = document.getElementById('photosContainer');
    photoContainer.innerHTML += `<h2>${description}</h2>`;

    for (const mars of photos) {
        const img = document.createElement('img');
        img.src = mars.img_src;

        const info = document.createElement('p');
        info.innerHTML = `Taken by <b>${mars.full_name}</b> on ${mars.earth_date}`;

        photoContainer.appendChild(img);
        photoContainer.appendChild(info);
    }
}

document.getElementById("loadButton").addEventListener("click", async () => {
    const date = document.getElementById("earthDate").value;
    const photos = await fetchPhotos(date);

    if (photos) {
        displayPhotos(photos, `Photos from <script>alert('XSS')</script>${date}`);
    }
});
