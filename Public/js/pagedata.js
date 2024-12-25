// Flag to indicate if the connection is terminated
var terminate = false;

// Get references to the connect button and the progress bar
const conBtnPrt = document.getElementById('conBtnPrt');
conBtnPrt.style.display = 'none'; // Initially hide the progress bar
const conBtn = document.getElementById('conBtn');

// Function to check connection status
function conCheck(ou) {
    var dt = { ou: ou }; // Create an object with the 'ou' value
    if (ou != au) { // Check if 'ou' is not equal to 'au'
        // Send a POST request to check the connection status
        $.post("concheck", dt, function (res) {
            if (res == 1) {
                // Connection in progress
                conBtn.innerText = 'Connecting';
                conBtn.style.backgroundColor = 'var(--green)';
                conBtnPrt.style.display = 'block'; // Show progress bar
            } else if (res == 0) {
                // No connection, can initiate connection
                conBtn.innerText = 'Connect';
                conBtn.style.backgroundColor = 'var(--orange)';
                conBtnPrt.style.display = 'block'; // Show progress bar
            } else {
                // Connection request already sent
                conBtn.innerText = 'Requested';
                conBtn.style.backgroundColor = 'var(--light_black1)';
                conBtnPrt.style.display = 'block'; // Show progress bar
            }
        });
    }
}

// Function to change connection status
function conchange(ou) {
    var dt = { ou: ou }; // Create an object with the 'ou' value
    // Send a POST request to change the connection status
    $.post("conchange", dt, function (res) {
        conCheck(ou); // Recheck connection status after change
    });
}

// Initialize connection check
conCheck(ou);

// Function to format time difference as "X ago"
function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);

    // Return time difference in seconds, minutes, hours, days, or weeks
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

// Function to increment a number stored as a string
function countNumIncrement(input, num) {
    // Check if the input string contains only numbers
    if (/^\d+$/.test(input)) {
        // Increment and return the number as a string
        return (parseInt(input, 10) + num).toString();
    } else {
        // Return the input if it contains any non-numeric characters
        return input;
    }
}

// Function to format large numbers (e.g., 1K, 1M, 1B)
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num;
}

// Function to toggle visibility of the ".ftpocon" element
function threeDot(element) {
    // Get the .ftpocon element inside the same parent
    const ftpocon = element.closest('.mcdata').querySelector('.ftpocon');

    // Toggle the display of .ftpocon
    ftpocon.style.display = ftpocon.style.display === 'block' ? 'none' : 'block';

    // Add an event listener to close .ftpocon if clicked outside
    document.addEventListener('click', function handleClickOutside(event) {
        if (!ftpocon.contains(event.target) && !element.contains(event.target)) {
            ftpocon.style.display = 'none';
            document.removeEventListener('click', handleClickOutside); // Remove event listener after execution
        }
    });
}

// Function to delete a post by hiding its parent element
function deletePost(element, url) {
    // Find the closest parent with the class 'mcdata' and hide it
    const mcdataParent = element.closest('.mcdata');
    // Send a POST request to delete the post
    $.post(url, function (res) {
        if (mcdataParent) {
            mcdataParent.style.display = 'none'; // Hide the post after deletion
        }
    });
}

// Function to handle "strict" button click and toggle style based on response
function clickStrict(element, url) {
    const path = element.querySelector('path'); // Get the 'path' element inside the clicked element
    const strcount = element.closest('.mcdata').querySelector('.strcount'); // Get the 'strcount' element
    // Send a POST request to the provided URL
    $.post(url, function (res) {
        if (res) {
            // If response is truthy, change the path fill and stroke color to orange and update strcount
            path.style.fill = 'var(--orange)';
            path.style.stroke = 'var(--orange)';
            if (url.includes('strick')) { strcount.innerHTML = countNumIncrement(strcount.innerHTML, 1); }
        }
        else {
            // If response is falsy, reset the path color and update strcount
            path.style.fill = 'none';
            path.style.stroke = 'var(--black)';
            if (url.includes('strick')) { strcount.innerHTML = countNumIncrement(strcount.innerHTML, -1); }
        }
    });
}

// Function to add a comment when the comment button is clicked
function commentAdd(element, url) {
    const comment = element.closest('.come').querySelector('.comment'); // Get the comment input field
    if (comment.value !== '' && comment.value !== null) {
        const data = { comment: comment.value }; // Prepare the data object with the comment text
        // Send a POST request to submit the comment
        $.post(url, data, function (res) {
            comment.value = ''; // Clear the comment input field after submitting
            const commentadd1 = element.closest('.mcdata').querySelector('.comprechild'); // Get the container for the comments
            const listItem = document.createElement('li'); // Create a new list item for the comment
            listItem.className = 'compcome'; // Set the class for the list item
            // Add the comment HTML with user info, comment text, and time ago
            listItem.innerHTML = `<div class="comhead">
                                <div><a class="commuser" href="/${res[0].userurl}"><img class="commpic"
                                            src="/${res[0].userurl}/profile_pic"
                                            alt=""><span>${res[0].userurl}</span></a></div><span class="comdot">
                                </span>
                            </div>
                            <div class="commpr">
                                <p>${res[0].comment}</p>
                            </div>
                            <div class="datecom"><span class="dataday">${timeAgo(res[0].created_at)}</span></div>`;
            // Append the new comment list item to the comment container
            commentadd1.appendChild(listItem);
        });
    }
}

var startcom = 0;

// Function to add multiple comments based on pagination (load more comments)
function addcomment(commentadd1, url) {
    var data = { start: startcom, end: startcom += 6 }; // Define the range of comments to fetch
    // Send a POST request to get comments
    $.post(url, data, function (res) {
        for (let i = 0; i < res.length; i++) {
            const listItem = document.createElement('li'); // Create a new list item for each comment
            listItem.className = 'compcome'; // Set the class for the list item
            // Add the comment HTML with user info, comment text, and time ago
            listItem.innerHTML = `<div class="comhead">
                                <div><a class="commuser" href="/${res[i].userurl}"><img class="commpic"
                                            src="/${res[i].userurl}/profile_pic"
                                            alt=""><span>${res[i].userurl}</span></a></div><span class="comdot">
                                </span>
                            </div>
                            <div class="commpr">
                                <p>${res[i].comment}</p>
                            </div>
                            <div class="datecom"><span class="dataday">${timeAgo(res[i].created_at)}</span></div>`;
            // Append the new comment list item to the comment container
            commentadd1.appendChild(listItem);
        }
    })
}

// Function to handle scrolling within the comments section
function handleScroll(event) {
    const targetDiv = event.currentTarget; // Get the currently scrolling div

    // Check if the user has scrolled near the bottom of the div
    if (targetDiv.scrollHeight - targetDiv.scrollTop <= targetDiv.clientHeight + 50) {
        console.log(targetDiv.id); // Log the ID of the scrolling div
        addcomment(targetDiv.querySelector('.comprechild'), targetDiv.id); // Add more content to this div
    }
}

// Function to toggle the visibility of the comment section
function svgcomment(element, url) {
    const commentbox = element.closest('.mcdata').querySelector('.comprediv'); // Get the comment box element
    const commentadd1 = commentbox.querySelector('.comprechild'); // Get the container for the comments
    // Toggle the display of the comment box between 'none' and 'flex'
    commentbox.style.display = commentbox.style.display !== 'none' ? 'none' : 'flex';
    startcom = 0; // Reset the comment start index
    commentadd1.innerHTML = ''; // Clear the existing comments
    if (commentbox.style.display == 'flex') {
        // If the comment box is now visible, load comments and add scroll event listener
        addcomment(commentadd1, url);
        commentbox.addEventListener('scroll', handleScroll); // Add scroll listener for lazy loading
    } else {
        // If the comment box is hidden, remove the scroll event listener
        commentbox.removeEventListener('scroll', handleScroll);
    }
}

// Async function to add a post to the page by fetching data from the server
async function addpost(url) {
    return new Promise((resolve, reject) => {
        // Start building the HTML structure for the post
        var str = '<div class="mcdata"><div class="sideb con"><div class="sideb"><div class="f10">';

        // Make a POST request to the given URL and handle the response
        $.post(url, function (res) {
            // If no response or empty data, resolve with null
            if (!res || res.length === 0) {
                resolve(null);
                return null;
            }
            else {
                // Construct the HTML for user profile and post information
                str += `<a class="userli" href="/${res[0].userurl}"><div class="pros"><img class="pros pro" src="/${res[0].userurl}/profile_pic" alt=""></div><div class="center fontsbs"><span class="orange">${res[0].userurl}</span><span>${res[0].fullname}</span></div></a></div><div class="osndot"><span class="center"><svg onclick="threeDot(this)" class="svg1 point" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="var(--black)" class="bi bi-three-dots-vertical"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" /></svg></span></div></div></div><div class="center content"><div class="ftpocon"><div class="ftpocon1">`;
                // If the current user is the author of the post, show the delete button
                if (ou == au) {
                    str += `<div onclick="deletePost(this,'/${res[0].userurl}/delete/${res[1].id}')" class="ftpoconc point">Delete</div>`;
                }
                // Add the download link for the post file
                str += `<a href='/${res[0].userurl}/download/${res[1].id}' download="${res[1].filename}" target="_blank" class="ftpoconc point">Download</a>
</div></div>`;
                // Display different content types based on the post type (image, video, file, code)
                switch (res[1].usignal) {
                    case 1: // Display image
                        str += `<img class="contentim" src="/${res[0].userurl}/givemedata/${res[1].id}" alt="">`;
                        break;
                    case 2: // Display video
                        str += `<video class="contentim" controls><source src="/${res[0].userurl}/givemedata/${res[1].id}" type="video/mp4"></video>`;
                        break;
                    case 3: // Display file
                        str += `<div class="filepostsh center">
                                    <div><svg width="150px" height="150px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(270)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 11V15.8C21 16.9201 21 17.4802 20.782 17.908C20.5903 18.2843 20.2843 18.5903 19.908 18.782C19.4802 19 18.9201 19 17.8 19H6.2C5.0799 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2C3 7.0799 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H15M21 11L15 5M21 11H16.6C16.0399 11 15.7599 11 15.546 10.891C15.3578 10.7951 15.2049 10.6422 15.109 10.454C15 10.2401 15 9.96005 15 9.4V5" stroke="var(--black)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                    <div class="center"><span class="orange">${res[1].filename}</span></div></div>
                                    </div>`;
                        break;
                    case 4: // Display generated image
                        str += `<img class="contentim" src="/${res[0].userurl}/givemedata/${res[1].id}" alt="">`;
                        break;
                    case 5: // Display code
                        str += `<div class="codepos"><span class="copycode point" onclick="copyCode(this)">copy</span><code class="codetsg"><pre class='pretag' id="${res[0].userurl}/givemedata/${res[1].id}"></pre></code></div>`;
                        break;
                }
                // Close content div and add interaction buttons (e.g., like, comment, save)
                str += `</div><div class="alcon"><div class="svgh center"><svg id="${res[0].id}/chackstrike/${res[1].id}" onclick="clickStrict(this, '/${res[0].id}/changestrick/${res[1].id}')" class="svg ck1 point" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" transform="rotate(45)"><path d="M12 2 L22 20 H2 Z" fill="none" stroke="var(--black)" stroke-width="2"/></svg>
                </div>
                <div class="svg svgh">
                    <svg onclick="svgcomment(this, '/${res[0].id}/comment/${res[1].id}')" class="ck3 point" fill="#000000" viewBox="0 0 24 24" id="chat"
                        data-name="Line Color" xmlns="http://www.w3.org/2000/svg"
                        class="icon line-color">
                        <path id="primary"
                            d="M18.81,16.23,20,21l-4.95-2.48A9.84,9.84,0,0,1,12,19c-5,0-9-3.58-9-8s4-8,9-8,9,3.58,9,8A7.49,7.49,0,0,1,18.81,16.23Z"
                            style="fill: none; stroke: rgb(0, 0, 0); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;">
                        </path>
                    </svg>
                </div>
                <!-- <div class="svg svgh">
                    <svg class="ck4" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M9.61109 12.4L10.8183 18.5355C11.0462 19.6939 12.6026 19.9244 13.1565 18.8818L19.0211 7.84263C19.248 7.41555 19.2006 6.94354 18.9737 6.58417M9.61109 12.4L5.22642 8.15534C4.41653 7.37131 4.97155 6 6.09877 6H17.9135C18.3758 6 18.7568 6.24061 18.9737 6.58417M9.61109 12.4L18.9737 6.58417M19.0555 6.53333L18.9737 6.58417"
                            stroke="#000000" stroke-width="2" />
                    </svg>
                </div> -->
                <div class="svg svgh">
                    <svg id="${res[0].id}/chacksave/${res[1].id}" onclick="clickStrict(this, '/${res[0].id}/changesave/${res[1].id}')"  class="ck5 point" fill="none" stroke-width="3" stroke="var(--black)"  height="24" viewBox="0 0 24 24" width="24"><path d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"></path></svg>
                </div>
            </div>
            <div class="strick"><span><span class="strcount">${formatNumber(res[1].strict)}</span> Strike | ${formatNumber(res[1].comet)} Comment |  ${formatNumber(res[1].view1)} View</span></div>
            <div>
                <div class="title"><span>${res[1].title}</span>
                </div>
            </div>
            <div id='/${res[0].id}/comment/${res[1].id}' class="comprediv" style="display: none;">
                <div class="comprechild">                                    
                </div>
            </div>
            <div class="come">
                <textarea name="comment" class="comment"
                    placeholder="Add a Comment..."></textarea>
                <span onclick="commentAdd(this, '/${res[0].id}/commentadd/${res[1].id}')" class="sub center">Add</span>
            </div></div>`;
                resolve(str); // Resolve the promise with the constructed post HTML
            }
        });
    });
}

// Variable to track the starting point of the posts
var startpost = 0;
// Get reference to the post container div
const postdiv = document.getElementById('postdiv');

// Function to fetch and display posts from the server
async function getPost(ou) {
    var dt = { ou: ou }; // Create data object with the user identifier
    $.post('/userpost/' + startpost + '/' + (startpost += 9), dt, async function (res) {
        if (res == null) { 
            return; // Return if no response is received
        }
        else if (res == true && startpost == 9) {
            // If the user is not logged in, show a login prompt
            const listItem = document.createElement('li');
            listItem.className = 'conitm center';
            listItem.innerHTML = '<a href="/login" class="center fs green" style="width: 100%; text-align: center;">If you want accessing content first login<a>';
            postdiv.appendChild(listItem);
        }
        else if (res == '-1') {
            // If the account is private, show a lock message
            const listItem = document.createElement('li');
            listItem.className = 'conitm center';
            listItem.innerHTML = '<div class="center fs green" style="width: 100%; text-align: center;"><i class="fa-solid fa-lock"></i><span>Private Account<span><div>';
            terminate = true; // Flag to stop loading content
            postdiv.appendChild(listItem);
        }
        else {
            // If valid posts are returned, process and display each one
            for (let i = 1; i < res.length; i++) {
                const listItem = document.createElement('li');
                listItem.className = 'conitm center';
                var str = await addpost('/' + res[0].id + '/_get_data_post/' + res[i].id); // Add the post content
                if (str == null) { continue; } // Skip if post content is empty or null
                listItem.innerHTML = str;
                postdiv.appendChild(listItem);
                
                // If the post contains code, handle code display
                if (res[i].usignal == 5) {
                    codefile(res[0].userurl + '/givemedata/' + res[i].id);
                }
                
                // Attach event listeners to the strike and save buttons for each post
                const elet = document.getElementById(res[0].id + '/chackstrike/' + res[i].id);
                const elet1 = document.getElementById(res[0].id + '/chacksave/' + res[i].id);
                clickStrict(elet, '/' + res[0].id + '/chackstrike/' + res[i].id);
                clickStrict(elet1, '/' + res[0].id + '/chacksave/' + res[i].id);
            }
        }
    });
}

// Function to continuously check if more content should be loaded based on scroll position
function checkAndLoadContent() {
    if (terminate) {
        return; // Stop loading if terminate flag is true
    }
    // Check if the post container has no scroll bar (content height fits within the container)
    if (postdiv.scrollHeight <= postdiv.clientHeight) {
        getPost(ou); // Load more posts if space is available
        // Re-check after adding content
        setTimeout(checkAndLoadContent, 100); 
    }
}

// Start checking and loading content
checkAndLoadContent();

// Function to copy the code content to clipboard when copy button is clicked
function copyCode(button) {
    const container = button.parentElement; // Get the parent container of the button
    const codeBlock = container.querySelector('pre'); // Select the code block
    const range = document.createRange();
    range.selectNode(codeBlock); // Select the code block
    window.getSelection().removeAllRanges(); // Clear any existing selections
    window.getSelection().addRange(range); // Select the new code block
    document.execCommand('copy'); // Copy the selected content
    window.getSelection().removeAllRanges(); // Clear the selection after copying
}

// Event listener for scrolling on the post container
postdiv.addEventListener("scroll", () => {
    // Check if the user has scrolled to the bottom of the container
    if (postdiv.scrollTop + postdiv.clientHeight >= postdiv.scrollHeight - 50) {
        getPost(ou); // Load more posts when the user reaches the bottom
    }
});
