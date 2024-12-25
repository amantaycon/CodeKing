// Initialize pagination and counter variables
var startcoli = 0;
var count = 0;

// Get the floating list element
const listfloat = document.getElementById('listfloat');

// Function to hide the floating list and reset counters
function hidelist() {
    listfloat.style.display = 'none'; // Hide the floating list
    startcoli = 0; // Reset the pagination counter
    count = 0; // Reset the list display counter
}

// Initially hide the list on page load
hidelist()

// Add a click event listener to close the list if clicked outside of it
document.addEventListener('click', function (event) {
    // Check if the clicked area is not inside the list and the list is currently visible
    if (!listfloat.contains(event.target) && listfloat.style.display == 'block') {
        hidelist(); // Close the list
    }
});

// Get the list container where user information will be displayed
const listfloathead = document.getElementById('listfloathead');

// Function to display users based on their connection status
function showListUser(str, num) {
    // Check if the requested user list is "connecting"
    if (str == 'connecting') {
        var dt = { num: num }; // Prepare data to send to the server
        // Make an AJAX request to fetch the list of "connecting" users
        $.post('/connting_list/' + startcoli + '/' + (startcoli += 9), dt, function (res) {
            // If no users are found, exit the function
            if (res == null || res.length == 0) {
                return;
            } else {
                // If it's the first time showing the list, set the header and a close button
                if (count == 0) {
                    listfloathead.innerHTML = `<h3 class="messhd center">Connecting User</h3>
                        <div class="cross">
                            <svg onclick="hidelist()" class="svg point" fill="var(--black)" viewBox="0 0 490 490" xml:space="preserve">
                                <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337"></polygon>
                            </svg>
                        </div>`;
                    count++; // Update the counter to prevent resetting the header on subsequent calls
                }

                // Loop through the returned user data and create a list item for each user
                for (let i = 0; i < res.length; i++) {
                    const listItem = document.createElement('li'); // Create a new list item
                    listItem.className = 'lin'; // Assign a class to the list item

                    // Set the content of the list item with user profile data
                    listItem.innerHTML = `
                        <a href="/${res[i].userurl}" class="fxcc sideb">
                            <div class="sideb">
                                <div class="pros">
                                    <img class="pros pro" src="/${res[i].userurl}/profile_pic" alt="">
                                </div>
                                <div class="center fontsbs black textun">
                                    <span>${res[i].userurl}</span>
                                    <span>${res[i].fullname}</span>
                                </div>
                            </div>
                        </a>
                    `;

                    // Append the new list item to the list container
                    listfloathead.appendChild(listItem);
                }
                // Show the floating list
                listfloat.style.display = 'block';
            }
        });
    }
    // Check if the requested user list is "connected"
    else if (str == 'connected') {
        var dt = { num: num }; // Prepare data to send to the server
        // Make an AJAX request to fetch the list of "connected" users
        $.post('/connted_list/' + startcoli + '/' + (startcoli += 9), dt, function (res) {
            // If no users are found, exit the function
            if (res == null || res.length == 0) {
                return;
            } else {
                // If it's the first time showing the list, set the header and a close button
                if (count == 0) {
                    listfloathead.innerHTML = `<h3 class="messhd center">Connected User</h3>
                        <div class="cross">
                            <svg onclick="hidelist()" class="svg point" fill="var(--black)" viewBox="0 0 490 490" xml:space="preserve">
                                <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337"></polygon>
                            </svg>
                        </div>`;
                    count++; // Update the counter to prevent resetting the header on subsequent calls
                }

                // Loop through the returned user data and create a list item for each user
                for (let i = 0; i < res.length; i++) {
                    const listItem = document.createElement('li'); // Create a new list item
                    listItem.className = 'lin'; // Assign a class to the list item

                    // Set the content of the list item with user profile data
                    listItem.innerHTML = `
                        <a href="/${res[i].userurl}" class="fxcc sideb">
                            <div class="sideb">
                                <div class="pros">
                                    <img class="pros pro" src="/${res[i].userurl}/profile_pic" alt="">
                                </div>
                                <div class="center fontsbs black textun">
                                    <span>${res[i].userurl}</span>
                                    <span>${res[i].fullname}</span>
                                </div>
                            </div>
                        </a>
                    `;

                    // Append the new list item to the list container
                    listfloathead.appendChild(listItem);
                }
                // Show the floating list
                listfloat.style.display = 'block';
            }
        });
    }
}

// Event listener to detect when the user scrolls to the bottom of the floating list
listfloathead.addEventListener("scroll", () => {
    // Check if the user has scrolled to the bottom of the list container
    if (listfloathead.scrollTop + listfloathead.clientHeight >= listfloathead.scrollHeight - 50) {
        var asd = listfloathead.querySelector('.messhd').innerHTML;
        // If the current header is "Connecting User", fetch more "connecting" users
        if (asd == 'Connecting User') { showListUser('connecting', ou); }
        // If the current header is "Connected User", fetch more "connected" users
        if (asd == 'Connected User') { showListUser('connected', ou); }
    }
});
