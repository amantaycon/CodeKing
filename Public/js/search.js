// Function to perform a search based on input value and category (num)
function search(searchId, num) {
    const listAdd = searchId.closest('.search'); // Get the closest parent element with class 'search'
    const word = searchId.value; // Get the value of the search input

    // If the search input is empty, remove all list items from the search results
    if (word == '') {
        const manyList = listAdd.querySelectorAll("li");
        manyList.forEach(li => li.remove());
        return;
    }

    // Make an AJAX POST request to fetch search results from the server
    $.post('/search/' + searchId.value + '/' + num, async function (res) {
        // If no data is returned (false), stop processing
        if (res == false) { return; }

        // If searching for users (num == 1)
        if (num == 1) {
            // Clear any existing list items in the search results
            const manyList = listAdd.querySelectorAll("li");
            manyList.forEach(li => li.remove());

            // Loop through each returned user and create a list item for each
            res.forEach(row => {
                const listItem = document.createElement('li');
                listItem.className = 'lin';
                listItem.style.margin = '0'; // Remove margin for cleaner list appearance
                listItem.innerHTML = `<a class="fxcc sideb" href="/${row.userurl}">
                                        <div class="sideb">
                                            <div class="pros">
                                                <img class="pros pro" src="/${row.userurl}/profile_pic" alt="">
                                            </div>
                                            <div class="center fontsbs">
                                                <span>${row.userurl}</span>
                                                <span>${row.fullname}</span>
                                            </div>
                                        </div></a>`;
                listAdd.appendChild(listItem); // Append the list item to the results
            });
        }
        // If searching for posts (num == 2)
        else if (num == 2) {
            // Clear previous list items from search results
            const manyList = listAdd.querySelectorAll("li");
            manyList.forEach(li => li.remove());


            // Get the post list container and clear its previous items
            const postDiv = document.getElementById('postdiv');
            const manyList1 = postDiv.querySelectorAll("li");
            manyList1.forEach(li => li.remove());

            // Loop through the first set of search results (posts) and add them to the page
            for (let i = 0; i < res[0].length; i++) {
                const divItem = document.createElement('div');
                divItem.className = 'conitm center';
                divItem.innerHTML = `<li class="lin mcdata">
                                        <a class="fxcc sideb" href="/${res[0][i].userurl}">
                                            <div class="sideb">
                                                <div class="pros">
                                                    <img class="pros pro" src="/${res[0][i].userurl}/profile_pic" alt="">
                                                </div>
                                                <div class="center fontsbs">
                                                    <span>${res[0][i].userurl}</span>
                                                    <span>${res[0][i].fullname}</span>
                                                </div>
                                            </div>
                                        </a>
                                    </li>`;
                postDiv.appendChild(divItem); // Append the post to the post div
            }

            // Function to handle rendering individual posts
            async function called(userid, postid, usignal, userurl) {
                const listItem = document.createElement('li');
                listItem.className = 'conitm center';
                var str = await addpost1('/' + userid + '/_get_data_post/' + postid); // Fetch post data
                if (str == null) { return; } // If no data is returned, stop processing
                listItem.innerHTML = str; // Insert the post content
                postDiv.appendChild(listItem); // Append the post item

                // If the user has a signal (e.g., a special signal), call the codefile function
                if (usignal == 5) {
                    codefile(userurl + '/givemedata/' + postid);
                }

                // Attach event listeners for strike and save actions on the post
                const elet = document.getElementById(userid + '/chackstrike/' + postid);
                const elet1 = document.getElementById(userid + '/chacksave/' + postid);
                clickStrict(elet, '/' + userid + '/chackstrike/' + postid);
                clickStrict(elet1, '/' + userid + '/chacksave/' + postid);
            }

            // Loop through the second set of results (posts), calling the 'called' function for each
            for (let i = 0; i < res[1].length; i++) {
                for (let j = 0; j < res[1][i].length; j++) {
                    called(res[1][i][0].userid, res[1][i][j].id, res[1][i][j].usignal, res[1][i][0].userurl);
                }
            }
        }
    });
}

// Wrapper function to call search with category number
function matchdata(element, num) {
    search(element, num);
}

// Function to handle the 'Enter' key press in the search input field
function serchenter(event, element) {
    // If the 'Enter' key is pressed
    if (event.key === 'Enter') {
        element.blur(); // Remove focus from the input field
        matchdata(element, 2);  // Call the search function for posts (num = 2)
    }
}
