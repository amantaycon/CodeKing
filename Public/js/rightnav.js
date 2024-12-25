// Initialize the variable for pagination
var reqstart = 0;

// Function to fetch and display the list of requested users
function req() {
    // Make an AJAX request to fetch the list of requested users based on the current pagination
    $.post('/requested/' + reqstart + '/' + (reqstart += 30), function (res) {
        // Get the right navigation container where the list items will be appended
        const rightNav = document.getElementById('rightnav');

        // If no data is returned (empty response), exit the function
        if (res == null || res.length == 0) {
            return;
        }
        else {
            // Loop through each user in the response and create a list item for each
            res.forEach(row => {
                const listItem = document.createElement('li'); // Create a new list item
                listItem.className = 'lin'; // Assign a class to the list item
                
                // Set the content of the list item with user data and action buttons
                listItem.innerHTML = `<div class="fxcc">
                    <div class="sidelb">
                        <a href="/${row.userurl}" class="pros">
                            <img class="pros pro" src="/${row.userurl}/profile_pic" alt="">
                        </a>
                        <a href="/${row.userurl}" class="center fontsbs black textun">
                            <span class='orange'>${row.userurl}</span>
                            <span class='black'>${row.fullname}</span>
                        </a>
                        <div class="center fontsbs conpeople conpeo14">
                            <!-- Action buttons for accepting or rejecting the request -->
                            <span onclick="desi(this, ${row.id}, 'accept')" class="chbox point">Accept</span>
                            <span onclick="desi(this, ${row.id}, 'reject')" class="chbox point">Reject</span>
                        </div>
                    </div>
                </div>`;

                // Append the new list item to the right navigation container
                rightNav.appendChild(listItem);
            });
        }
    });
}

// Call the `req()` function to load the initial list of requests
req();

// Function to handle accepting or rejecting a request
function desi(elemet, num, de) {
    // Make an AJAX request to process the response (accept or reject)
    $.post('/response/' + de + '/' + num, function (res) {
        // If the request was successful, hide the list item
        if (res.success) {
            elemet.closest('.lin').style.display = 'none'; // Hide the corresponding list item
        }
    });
}
