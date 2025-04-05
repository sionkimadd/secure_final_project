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
    // **Vulnerability Comment:**
    // XSS (Cross-Site Scripting) Vulnerability Detected!
    // The `description` parameter is directly inserted into the DOM via `innerHTML` without sanitization.
    // In this case, `description` contains user-controlled data from `date` concatenated with a hardcoded
    // `<script>alert('XSS')</script>`, which will execute arbitrary JavaScript when rendered.
    // This allows attackers to inject malicious scripts if `date` is manipulable (e.g., via input field).
    // **OWASP Top Ten 2021 Category:** A03:2021 - Injection
    // **Fix:** Sanitize `description` before insertion, or use `textContent` instead of `innerHTML` if no HTML is needed.
    // Example fix: `photoContainer.innerHTML += `<h2>${sanitize(description)}</h2>`;` or
    // `photoContainer.textContent += description;` if plain text is sufficient.
    photoContainer.innerHTML += `<h2>${description}</h2>`;

    for (const mars of photos) {
        const img = document.createElement('img');
        img.src = mars.img_src;

        const info = document.createElement('p');
        // **Comment:** Good practice here using `innerHTML` with controlled data from the API response,
        // but ensure `full_name` and `earth_date` are safe. If these could be manipulated server-side,
        // consider sanitizing them too. For now, this looks fine assuming NASA API is trusted.
        info.innerHTML = `Taken by <b>${mars.full_name}</b> on ${mars.earth_date}`;

        photoContainer.appendChild(img);
        photoContainer.appendChild(info);
    }
}

document.getElementById("loadButton").addEventListener("click", async () => {
    const date = document.getElementById("earthDate").value;
    const photos = await fetchPhotos(date);

    if (photos) {
        // **Vulnerability Comment:**
        // XSS Vulnerability Source!
        // The `date` value comes directly from a user input (`earthDate.value`) and is passed unsanitized
        // into `displayPhotos`. Concatenating it with a string containing `<script>alert('XSS')</script>`
        // explicitly demonstrates the vulnerability. An attacker could inject arbitrary JavaScript via
        // the input field (e.g., `"><script>alert('hacked')</script>`), leading to code execution.
        // **OWASP Top Ten 2021 Category:** A03:2021 - Injection
        // **Fix:** Sanitize `date` before passing it to `displayPhotos`. Use a library like `DOMPurify`
        // or escape HTML characters manually. Example:
        // `const safeDate = date.replace(/[<>&"']/g, '');`
        displayPhotos(photos, `Photos from <script>alert('XSS')</script>${date}`);
    }
});
