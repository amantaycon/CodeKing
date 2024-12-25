// Hides the fixed tab menu by default
var t = document.getElementById('fixedTabMenu');
t.style.display = 'none';

// Toggles visibility of the fixed tab menu
function postTab() {
    t.style.display = t.style.display === 'none' ? 'flex' : 'none';
}

// Hides the "more" menu by default
var t1 = document.getElementById('moreMenu');
t1.style.display = 'none';

// Toggles visibility of the "more" menu
function postTab1() {
    t1.style.display = t1.style.display === 'none' ? 'flex' : 'none';
}

// Event listener to hide the fixed tab and "more" menu when clicking outside
document.addEventListener('click', function (event) {
    if (!t.contains(event.target) && !document.getElementById('postab').contains(event.target)) {
        t.style.display = 'none';
    }
    if (!t1.contains(event.target) && !document.getElementById('moretab').contains(event.target) && !document.getElementById('moretab1').contains(event.target)) {
        t1.style.display = 'none';
    }
});

// Initializing the elements for previewing images, videos, files, text, and code
var pfTab = document.getElementById("pfTab");
var imageTab = document.getElementById("poimage");
var videoTab = document.getElementById("povideo");
var fileTab = document.getElementById("podoc");
var imagepre = document.getElementById("imagepre");
var videopre = document.getElementById("videopre");
var filepre = document.getElementById("filepre");
var textpre = document.getElementById("textpre");
var codepre = document.getElementById("codepre");
var signal = 0;

// Hides the preview tab and resets the preview elements
pfTab.style.display = 'none';
function hidefloat1() {
    pfTab.style.display = 'none';
    imagepre.style.display = 'none';
    videopre.style.display = 'none';
    filepre.style.display = 'none';
    textpre.style.display = 'none';
    codepre.style.display = 'none';
    videopre.src = '';
    imagepre.src = '';
}

// Event listener to hide the preview tab if clicked outside
document.addEventListener('click', function (event) {
    if (!pfTab.contains(event.target) && !t.contains(event.target)) {
        hidefloat1();
    }
});

// Ensures the preview tab is hidden when the page is loaded from cache
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        hidefloat1();
    }
});

// Handle file selection for image upload
imageTab.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagepre.src = e.target.result;
            imagepre.style.display = 'block';
            pfTab.style.display = 'flex';  // Display the preview tab
        };
        reader.readAsDataURL(file);
        signal = 1;  // Set signal to 1 for image
    }
});

// Handle file selection for video upload
videoTab.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            videopre.src = e.target.result;
            videopre.style.display = 'block';
            pfTab.style.display = 'flex';  // Display the preview tab
        };
        reader.readAsDataURL(file);
        signal = 2;  // Set signal to 2 for video
    }
});

// Handle file selection for document upload
fileTab.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('filena').innerText = file.name;
            filepre.style.display = 'block';
            pfTab.style.display = 'flex';  // Display the preview tab
        };
        reader.readAsDataURL(file);
        signal = 3;  // Set signal to 3 for file
    }
});

// Function to show a specific preview tab (text or code)
function floattab(name) {
    t.style.display = 'none';  // Hide the fixed tab menu
    if (name == 'text') {
        textpre.style.display = 'flex';
        pfTab.style.display = 'flex';  // Display the preview tab
        signal = 4;  // Set signal to 4 for text
    }
    else if (name == 'code') {
        codepre.style.display = 'block';
        pfTab.style.display = 'flex';  // Display the preview tab
        signal = 5;  // Set signal to 5 for code
    }
}

// Function to update text styles like font size, alignment, and colors
function updateTextStyle() {
    let container = document.getElementById('text-container');
    let fontSize = document.getElementById('fontSize').value + 'px';
    let align = document.getElementById('align').value;
    let bgColor = document.getElementById('bgColor').value;
    let textColor = document.getElementById('textColor').value;

    container.style.fontSize = fontSize;
    container.style.textAlign = align;
    container.style.backgroundColor = bgColor;
    container.style.color = textColor;
}

// Function to generate an image of the text container
function generateImage() {
    return html2canvas(document.querySelector("#text-container")).then(canvas => {
        return canvas.toDataURL("image/png");
    });
}

// Function to update line numbers in the code editor
function updateLineNumbers() {
    const textarea = document.getElementById("code-input");
    const lineNumbers = document.getElementById("line-numbers");
    const lines = textarea.value.split("\n").length;

    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("<br>");
}

// Function to sync the scroll position between the code textarea and line numbers
function syncScroll() {
    const textarea = document.getElementById("code-input");
    const lineNumbers = document.getElementById("line-numbers");
    lineNumbers.scrollTop = textarea.scrollTop;
}

// Initialize line numbers on page load
updateLineNumbers();

// Function to post the selected data (image, video, file, text, or code) to the server
async function postdata() {
    const formData = new FormData();
    switch (signal) {
        case 1: formData.append('data', imageTab.files[0]); break;  // Image upload
        case 2: formData.append('data', videoTab.files[0]); break;  // Video upload
        case 3: formData.append('data', fileTab.files[0]); break;  // File upload
        case 4:
            const imageData = await generateImage();  // Capture text as an image
            const imageBlob = await (await fetch(imageData)).blob();
            formData.append('data', imageBlob, 'generated_image.png');
            break;
        case 5:
            const codeContent = document.getElementById('code-input').value;
            const codeBlob = new Blob([codeContent], { type: 'text/plain' });
            formData.append('data', codeBlob, 'code.txt');  // Upload code as a text file
            break;
        default: signal = 0; return;  // No data to upload
    }
    formData.append('title', document.getElementById('titlep').value);  // Add post title
    formData.append('signal', signal);  // Add the signal indicating the type of data
    formData.append('privacy', document.getElementById('post_pri').value);  // Add privacy setting

    // Ajax request to upload the data to the server
    $.ajax({
        url: '/uploadpostdata',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            location.reload();  // Reload the page on success
        },
        error: function (xhr, status, error) {
            alert('Error uploading the file: ' + error);  // Show error if upload fails
        }
    });
}
