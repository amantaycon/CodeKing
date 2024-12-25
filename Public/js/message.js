// Establish a WebSocket connection to the server
const ws = new WebSocket(`ws://127.0.0.1:3000`);

// Handle WebSocket connection open event
ws.onopen = () => {
    console.log('WebSocket connected');
};

// Initialize UI elements and set default styles
var imogifloatv = document.getElementById("imogifloat");
imogifloatv.style.display = 'none';
const inputMessage = document.getElementById('inputmessage');
const fixedTabMenumess = document.getElementById('fixedTabMenumess');
fixedTabMenumess.style.display = 'none';
const postTabmes = document.getElementById('postTabmes');
var selectUser = 0;

// Toggle visibility of emoji floating menu
function imogifloat() {
    imogifloatv.style.display = imogifloatv.style.display === 'none' ? 'flex' : 'none';
}

// Toggle visibility of the menu for sending messages
function sendMenufloat() {
    fixedTabMenumess.style.display = fixedTabMenumess.style.display === 'none' ? 'flex' : 'none';
}

// add a listener to the parent emoji list
imogifloatv.addEventListener('click', function (event) {
    // Ensure input focus when emoji menu is clicked
    if (imogifloatv.contains(event.target)) {
        inputMessage.focus();
    }
    // if the clicked element is an emoji
    if (event.target.classList.contains('emoji')) {
        const selectedEmoji = event.target.textContent; // Get the emoji text

        // Get the current position of the cursor
        const startPos = inputMessage.selectionStart;
        const endPos = inputMessage.selectionEnd;

        // Insert the emoji at the current cursor position
        const textBefore = inputMessage.value.substring(0, startPos);
        const textAfter = inputMessage.value.substring(endPos);
        inputMessage.value = textBefore + selectedEmoji + textAfter;

        // Set the cursor position to after the inserted emoji
        inputMessage.focus();
        const newCursorPos = startPos + selectedEmoji.length;
        inputMessage.setSelectionRange(newCursorPos, newCursorPos);
    }
});

// Close floating menus when clicking outside
document.addEventListener('click', function (event) {
    if (!fixedTabMenumess.contains(event.target) && !postTabmes.contains(event.target)) {
        fixedTabMenumess.style.display = 'none'; // Hide message menu
    }
    if (!imogifloatv.contains(event.target) && !inputMessage.contains(event.target) && !document.getElementById('imogiparent').contains(event.target)) {
        imogifloatv.style.display = 'none'; // Hide emoji menu
    }
});

// UI elements for file upload and preview
var pfTabmes = document.getElementById("pfTabmes");
var imageTabmes = document.getElementById("poimagemes");
var videoTabmes = document.getElementById("povideomes");
var fileTabmes = document.getElementById("podocmes");
var imagepremes = document.getElementById("imagepremes");
var videopremes = document.getElementById("videopremes");
var filepremes = document.getElementById("filepremes");
var textpremes = document.getElementById("textpremes");
var codepremes = document.getElementById("codepremes");
var signalmes = 0;
var start = 0;

// Hide all preview elements
pfTabmes.style.display = 'none';
function hidefloat1mes() {
    pfTabmes.style.display = 'none';
    imagepremes.style.display = 'none';
    videopremes.style.display = 'none';
    filepremes.style.display = 'none';
    textpremes.style.display = 'none';
    codepremes.style.display = 'none';
    videopremes.src = ''; // Clear video preview
    imagepremes.src = ''; // Clear image preview
}

// Close floating menus when clicking outside
document.addEventListener('click', function (event) {
    if (!pfTabmes.contains(event.target) && !fixedTabMenumess.contains(event.target)) {
        hidefloat1mes();
    }
});

// Handle page reload to reset UI state
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        hidefloat1mes();
    }
});

// Handle image file upload
imageTabmes.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagepremes.src = e.target.result; // Set image source
            imagepremes.style.display = 'block';
            pfTabmes.style.display = 'flex';
        };
        reader.readAsDataURL(file);
        signalmes = 1; // Signal for image
    }
});

// Handle video file upload
videoTabmes.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            videopremes.src = e.target.result; // Set video source
            videopremes.style.display = 'block';
            pfTabmes.style.display = 'flex';
        };
        reader.readAsDataURL(file);
        signalmes = 2; // Signal for video
    }
});

// Handle document file upload
fileTabmes.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('filenames').innerText = file.name; // Display file name
            filepremes.style.display = 'block';
            pfTabmes.style.display = 'flex';
        };
        reader.readAsDataURL(file);
        signalmes = 3; // Signal for document
    }
});

// Show different tabs based on selected type
function floattabmes(name) {
    fixedTabMenumess.style.display = 'none';
    if (name == 'text') {
        textpremes.style.display = 'flex';
        pfTabmes.style.display = 'flex';
        signalmes = 4; // Signal for text
    }
    else if (name == 'code') {
        codepremes.style.display = 'block';
        pfTabmes.style.display = 'flex';
        signalmes = 5; // Signal for code
    }
}

// Update text container styles dynamically
function updateTextStylemes() {
    let container = document.getElementById('text-containermes');
    let fontSize = document.getElementById('fontSizemes').value + 'px';
    let align = document.getElementById('alignmes').value;
    let bgColor = document.getElementById('bgColormes').value;
    let textColor = document.getElementById('textColormes').value;

    container.style.fontSize = fontSize;
    container.style.textAlign = align;
    container.style.backgroundColor = bgColor;
    container.style.color = textColor;
}

// Generate an image from the text container
function generateImage() {
    return html2canvas(document.querySelector("#text-containermes")).then(canvas => {
        return canvas.toDataURL("image/png");
    });
}

// Update line numbers in the code editor
function updateLineNumbersmes() {
    const textarea = document.getElementById("code-inputmes");
    const lineNumbers = document.getElementById("line-numbersmes");
    const lines = textarea.value.split("\n").length;

    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("<br>");
}

// Synchronize scrolling between code editor and line numbers
function syncScroll() {
    const textarea = document.getElementById("code-inputmes");
    const lineNumbers = document.getElementById("line-numbersmes");
    lineNumbers.scrollTop = textarea.scrollTop;
}

// Update line numbers in the code editor
updateLineNumbersmes();

// Function to send text messages
async function sendtext() {
    // Prepare the data object with message and selected user ID
    var data = { messages: inputMessage.value, userid: selectUser };
    // Send a POST request to upload the text message
    $.post('/uploadmessagedatatext', data, function (res) {
        if (res == null) {
            return; // If no response, return early
        }
        else {
            inputMessage.value = ''; // Clear input field
            start++; // Increment message count
            add_recent_message(`/recentdata/${selectUser}/${res.messageid}`); // Add to recent messages

            // Prepare the WebSocket message to notify the recipient
            const message = JSON.stringify({
                recipientId: parseInt(selectUser, 10),
                signal: 1, // Signal for text message
                content: `/recentdata/${res.userid}/${res.messageid}`, // Message content URL
              });
              ws.send(message); // Send the WebSocket message
        }
    });
}

// Function to send data (image, video, file, generated content, or code)
async function senddata() {
    const formData = new FormData(); // Initialize a FormData object
    // Append the appropriate data based on the signal type
    switch (signalmes) {
        case 1: formData.append('data', imageTabmes.files[0]); break; // Image file
        case 2: formData.append('data', videoTabmes.files[0]); break; // Video file
        case 3: formData.append('data', fileTabmes.files[0]); break; // Document file
        case 4: // Generated image
            const imageData = await generateImage();
            const imageBlob = await (await fetch(imageData)).blob();
            formData.append('data', imageBlob, 'generated_image.png');
            break;
        case 5: // Code content
            const codeContent = document.getElementById('code-inputmes').value;
            const codeBlob = new Blob([codeContent], { type: 'text/plain' });
            formData.append('data', codeBlob, 'code.txt');
            break;
        default: signalmes = 0; return; // If no signal, exit the function
    }

    // Append additional data to the form
    formData.append('title', document.getElementById('titlepmes').value)
    formData.append('signal', signalmes);
    formData.append('userid', selectUser);

    // Send the form data via AJAX
    $.ajax({
        url: '/uploadmessagedata', // Upload endpoint
        type: 'POST',
        data: formData,
        processData: false, // Prevent automatic data processing
        contentType: false, // Prevent automatic content type header
        success: async function (response) {
            if (response == null) {
                return; // If no response, return early
            }
            else {
                hidefloat1mes(); // Hide floating UI elements
                start++; // Increment message count
                await add_recent_message(`/recentdata/${selectUser}/${response.messageid}`); // Add to recent messages

                // Prepare the WebSocket message to notify the recipient
                const message = JSON.stringify({
                    recipientId: parseInt(selectUser, 10),
                    signal: 1, // Signal for data message
                    content: `/recentdata/${response.userid}/${response.messageid}`, // Message content URL
                  });
                  ws.send(message); // Send the WebSocket message
            }
        },
        error: function (xhr, status, error) {
            alert('Error uploading the file: ' + error); // Alert error if the request fails
        }
    });
}

// Initialize the message list in the UI
var messagelist = document.getElementById('rightnav');
messagelist.innerHTML = `<h3 class="messhd center no-select">Messages</h3>
<div class="conitm center">
                                    <div class="mcdata search searchmes">
                                        <div class="searchdiv">
                                            <div>
                                                <div class="selogo"><img class="selogo" src="/image/weblogo.png" alt="">
                                                </div>
                                            </div><input class="comment commentser" name="search" placeholder="Search" id="search" oninput="search(this,1)" autocomplete="off">
                                        </div>
                                    </div>
                                </div>
`;

// Function to fetch and display the user message list
function userMessageList() {
    // Fetch user messages via a POST request
    $.post('/usermessagelist', function (res) {
        if (res == null || res.length == 0) {
            return; // If no response or empty list, return early
        }
        // Loop through each user and create a message list item
        for (let i = 0; i < res.length; i++) {
            const listItem = document.createElement('li');
            listItem.className = 'lin';
            listItem.innerHTML = `<div class="fxcc point no-select" onclick="clickMessage(this,${res[i].id})">
                    <div class="sidelb">
                        <div class="pros">
                            <img class="pros pro" src="/${res[i].userurl}/profile_pic" alt="">
                        </div>
                        <div class="center fontsbs black textun">
                            <span class="orange">${res[i].userurl}</span>
                            <span class="black">${res[i].fullname}</span>
                        </div>
                    </div>
                </div>`;
            messagelist.appendChild(listItem); // Append list item to the message list
        }
    });
}
// Initialize the user message list
userMessageList();

/**
 * Function to search for users or messages.
 * @param {HTMLElement} searchId - The input element triggering the search.
 * @param {number} num - The search mode (1 for user search, other values for different modes).
 */
function search(searchId, num) {
    const listAdd = searchId.closest('.search'); // Get the closest parent with the 'search' class
    const word = searchId.value; // Get the input value
    
    // Clear the list if the search term is empty
    if (word == '') {
        const manyList = listAdd.querySelectorAll("li");
        manyList.forEach(li => li.remove());
        return;
    }

    // Send a POST request to fetch search results
    $.post('/search/' + searchId.value + '/' + num, async function (res) {
        if (res == false) { return; } // Exit if no results
        if (num == 1) { // If in user search mode
            const manyList = listAdd.querySelectorAll("li");
            manyList.forEach(li => li.remove()); // Clear existing list items

            // Iterate through search results and add them to the list
            res.forEach(row => {
                const listItem = document.createElement('li');
                listItem.className = 'lin'; // Add styling class
                listItem.style.margin = '0';
                listItem.innerHTML = `<div class="fxcc sideb no-select point" onclick="clickMessage(this,${row.id})">
                                        <div class="sideb">
                                            <div class="pros">
                                                <img class="pros pro" src="/${row.userurl}/profile_pic" alt="">
                                            </div>
                                            <div class="center fontsbs">
                                                <span>${row.userurl}</span>
                                                <span>${row.fullname}</span>
                                            </div>
                                        </div></div>`;
                listAdd.appendChild(listItem); // Add item to the DOM
            });
        }
    });
}

/**
 * Function to handle back navigation for messages on smaller screens.
 */
function backmessage() {
    // Adjust UI based on screen width
    if (window.innerWidth <= 600) {
        document.getElementById('lgn0mes').style.display = 'flex'; // Show message tab
        document.getElementById('messtab').style.display = 'none'; // Hide main message tab
    }
    if (window.innerWidth <= 900) {
        document.getElementById('lgn2mes').style.display = 'flex'; // Show secondary tab
        document.getElementById('lgn1mes').style.display = 'none'; // Hide primary tab
    }
    selectUser = 0; // Reset the selected user
}
var backbutton = false; // Track back button state

// Handle browser history popstate events
window.onpopstate = function (event) {
    if (backbutton) {
        backmessage(); // Handle back navigation
        backbutton = false;
    }
};

/**
 * Function to calculate and display time ago for a given timestamp.
 * @param {string} timestamp - The timestamp to calculate time ago.
 * @returns {string} - A human-readable time difference.
 */
function timeAgo(timestamp) {
    const now = new Date(); // Get the current date and time
    const past = new Date(timestamp); // Convert timestamp to date
    const seconds = Math.floor((now - past) / 1000); // Calculate time difference in seconds

    // Return appropriate time ago format
    if (seconds < 60) {
        return `${seconds} seconds ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minutes ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hours ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${days} days ago`;
    }

    const weeks = Math.floor(days / 7);
    return `${weeks} weeks ago`;
}

// Handles the action when a message is clicked
function clickMessage(element, id) {
    let data = { id: id }; // Prepare the data with the selected user ID

    // Send a POST request to fetch user message data
    $.post('/clickusermessage', data, async function (res) {
        // Check if the response is invalid or permission is denied
        if (res == false || res.length == 0) {
            return alert("You are not able to send message because permission is denied ");
        }

        // Adjust the UI based on screen width for mobile responsiveness
        if (window.innerWidth <= 600) {
            document.getElementById('lgn0mes').style.display = 'none';
            document.getElementById('messtab').style.display = 'flex';
        }
        // For medium screen sizes, hide and show specific elements
        if (window.innerWidth <= 900) {
            document.getElementById('lgn2mes').style.display = 'none';
            document.getElementById('lgn1mes').style.display = 'flex';

            // Push a new state to the history without changing the page
            history.pushState({ customState: true }, '', '');
            backbutton = true; // A custom flag for back button handling
        }

        // Highlight the selected user for larger screens
        if (window.innerWidth > 900) {
            element.style.backgroundColor = 'var(--orange_light)';
        }

        // Dynamically update the message container with fetched data
        const postDiv1 = document.getElementById('postdiv');
        postDiv1.innerHTML = `<header class="head center">
                        <div class="h1 fhw">
                        <div class="center point backsvg" onclick="history.back()">
                        <svg class="svg" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><path fill="#000000" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path><path fill="#000000" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path></g></svg></div>
                            <div class="maifon clrgrn center">{</div>
                            <a class="fhw fsp" href="/${res.userurl}">
                                <h1 class="fsp fhw center"><span id=""><img class="messpro"
                                            src="/${res.userurl}/profile_pic" alt="dp"></span>
                                    <span class="clrorg nm">${res.fullname}</span>
                                </h1>
                            </a>
                            <div class="maifon clrorg center">}</div>
                        </div>
                    </header>
                    <div class="mescont" id='messagescroll'><div class="conscrol" id="addmessage"></div></div>`;

        // Initialize the selected user ID and load the initial messages
        selectUser = res.id;
        start = -15;
        await getmessage(selectUser);

        // Scroll to the bottom of the chat
        const chatbox = document.getElementById('messagescroll');
        chatbox.scrollTop = chatbox.scrollHeight;
        setTimeout(() => {
            chatbox.scrollTop = chatbox.scrollHeight;
        }, 100);

        // Add an event listener to load more messages on scroll
        document.getElementById('messagescroll').addEventListener('scroll', loadMoreMessages);
    });
}

// Fetch messages for a specific user
async function getmessage(id) {
    await new Promise((resolve, reject) => {
        $.post(`/givememessage/${id}/${start += 15}`, function (res) {
            if (res == null || res.length == 0 || res[1].length == 0) {
                resolve('');
                return;
            }
            const addmessage = document.getElementById('addmessage');
            // Iterate through the received messages and dynamically create HTML elements
            for (let i = 0; i < res[1].length; i++) {
                const divItem = document.createElement('div');
                divItem.className = `conopti${aliner(res[1][i].userid)}`;
                var str = `<div class="ridiv">`;

                // Handle different message types (image, video, file, code, or text)
                switch (res[1][i].messignal) {
                    case 1: // Image
                        str += `<img class="contentim" src="/givememessagechat/${selectUser}/${res[1][i].id}" alt="">`;
                        break;
                    case 2: // Video
                        str += `<video class="contentim" controls><source src="/givememessagechat/${selectUser}/${res[1][i].id}" type="video/mp4"></video>`;
                        break;
                    case 3: //File
                        str += `<div class="filepostsh center" style="width: unset;">
                                    <a href="/givememessagechat/${selectUser}/${res[1][i].id}" style="text-decoration: none;"><svg width="150px" height="150px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(270)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 11V15.8C21 16.9201 21 17.4802 20.782 17.908C20.5903 18.2843 20.2843 18.5903 19.908 18.782C19.4802 19 18.9201 19 17.8 19H6.2C5.0799 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2C3 7.0799 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H15M21 11L15 5M21 11H16.6C16.0399 11 15.7599 11 15.546 10.891C15.3578 10.7951 15.2049 10.6422 15.109 10.454C15 10.2401 15 9.96005 15 9.4V5" stroke="var(--black)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                    <div class="center"><span class="orange">${res[1][i].datalink}</span></div></a>
                                    </div>`;
                        break;
                    case 4: //text type genrated image
                        str += `<img class="contentim" src="/givememessagechat/${selectUser}/${res[1][i].id}" alt="">`;
                        break;
                    case 5: //code snippet
                        str += `<div class="codepos" style="width: unset;  position: relative;"><span class="copycode point" onclick="copyCode(this)">copy</span><code class="codetsg"><pre class='pretag' id="/givememessagechat/${selectUser}/${res[1][i].id}"></pre></code></div>`;
                        break;

                    case 6: // plane text
                        str += res[1][i].messages;
                        break;
                }

                // Add additional details like title and timestamp
                if (res[1][i].messignal != 6) {
                    str += `<div><div class="title"><span>${res[1][i].messages}</span></div></div>`;
                }
                str += `<div class="mesbottom"><span class="mesbotl">${timeAgo(res[1][i].created_at)}</span><span class="mesbotr">${seenornot(res[1][i].userid, res[1][i].messeen)}</span></div></div>`;

                divItem.innerHTML = str;

                addmessage.prepend(divItem); // Prepend the message to the chat box

                // Handle code file content
                if (res[1][i].messignal == 5) {
                    codefile(`/givememessagechat/${selectUser}/${res[1][i].id}`);
                }

            }
            resolve('');
        }).fail(reject);
    });
}

// Determines message alignment based on the sender
function aliner(user) {
    if (user !== selectUser) {
        return 'r';
    } else return '';
}

// Checks if a message is seen
function seenornot(user, num) {
    if (user !== selectUser && num == 1) {
        return 'seen';
    } else return '';
}

// Copies a code block to the clipboard
function copyCode(button) {
    const container = button.parentElement; // Get the parent container
    const codeBlock = container.querySelector('pre');
    const range = document.createRange();
    range.selectNode(codeBlock);
    window.getSelection().removeAllRanges(); // Clear current selections
    window.getSelection().addRange(range); // Select the code
    document.execCommand('copy');
    window.getSelection().removeAllRanges(); // Clear the selection
}

// Function to load more chat messages when the user scrolls to the top
async function loadMoreMessages() {
    const chatbox = document.getElementById('messagescroll');

    // Check if the user has scrolled to the top
    if (chatbox.scrollTop === 0) {

        const previousHeight = chatbox.scrollHeight;
        await getmessage(selectUser);
        const newHeight = chatbox.scrollHeight;
        chatbox.scrollTop = newHeight - previousHeight;
    }
}

// Function to add a recently received message to the chat window
async function add_recent_message(url) {
    try {
        // Send an HTTP POST request to fetch the recent message
        const response = await $.post(url);
        // If the response is empty or invalid, exit the function
        if (!response || response.length === 0) {
            return;
        }

        // Select the container where messages will be appended
        const addmessage = document.getElementById('addmessage');
        const message = response; // The message data returned from the server

        // Create a new div to hold the message
        const divItem = document.createElement('div');
        divItem.className = `conopti${aliner(message.userid)}`; // Add alignment class based on the user

        // Initialize the HTML for the message content
        let contentHTML = `<div class="ridiv">`;

        // Switch-case to handle different message types
        switch (message.messignal) {
            case 1:
            case 4: // Image
                contentHTML += `<img class="contentim" src="/givememessagechat/${selectUser}/${message.id}" alt="">`;
                break;
            case 2: // Video
                contentHTML += `<video class="contentim" controls>
                                    <source src="/givememessagechat/${selectUser}/${message.id}" type="video/mp4">
                                </video>`;
                break;
            case 3: // File/Link
                contentHTML += `<div class="filepostsh center" style="width: unset;">
                                    <a href="/givememessagechat/${selectUser}/${message.id}" style="text-decoration: none;">
                                        <svg ...></svg>
                                        <div class="center"><span class="orange">${message.datalink}</span></div>
                                    </a>
                                </div>`;
                break;
            case 5: // Code
                contentHTML += `<div class="codepos" style="width: unset; position: relative;">
                                    <span class="copycode point" onclick="copyCode(this)">copy</span>
                                    <code class="codetsg"><pre class='pretag' id="/givememessagechat/${selectUser}/${message.id}"></pre></code>
                                </div>`;
                codefile(`/givememessagechat/${selectUser}/${message.id}`);
                break;
            case 6: // Text
                contentHTML += message.messages;
                break;
        }

        // Add the message text if it's not a plain text message
        if (message.messignal !== 6) {
            contentHTML += `<div><div class="title"><span>${message.messages}</span></div></div>`;
        }

        // Add timestamp and "seen" status to the message footer
        contentHTML += `<div class="mesbottom">
                            <span class="mesbotl">${timeAgo(message.created_at)}</span>
                            <span class="mesbotr">${seenornot(message.userid, message.messeen)}</span>
                        </div></div>`;

        // Set the HTML content of the new message div
        divItem.innerHTML = contentHTML;

        // Append the new message to the message container
        addmessage.appendChild(divItem);

        // Automatically scroll the chatbox to the latest message if the user is near the bottom
        const chatbox = document.getElementById('messagescroll');
        if (chatbox.scrollTop + chatbox.offsetHeight >= chatbox.scrollHeight - 150) {
            setTimeout(() => {
                chatbox.scrollTop = chatbox.scrollHeight;
            }, 100);
        }

    } catch (error) {
        // Log any errors to the console
        console.error("Error fetching or rendering messages:", error);
    }
}

// WebSocket message handler to process incoming events
ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data); // Parse the JSON data from the server

        if (data.signal == 1) { // Check the signal value
            if (selectUser == data.userId) {
                add_recent_message(data.content); // Handle the message for the selected user
            } else {
                console.log(`User ${data.userId} has new messages!`);
            }
        } else {
            console.log('Received non-message signal:', data);
        }
    } catch (error) {
        // Log errors in parsing WebSocket messages
        console.error('Error parsing WebSocket message:', error);
        console.log(`Raw message from server: ${event.data}`);
    }
};

// WebSocket close event handler
ws.onclose = () => {
    console.log('WebSocket disconnected');
};

// WebSocket error event handler
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};


// Function to log out and close the WebSocket connection
function logout() {
    if (ws) {
        ws.close(); // Explicitly close WebSocket on logout
        console.log('User logged out, WebSocket closed');
    }
}

// Ensure WebSocket connection is closed when the page unloads
window.onunload = () => {
    if (ws) ws.close();
};
