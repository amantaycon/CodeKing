// Initialize the starting point for pagination (set to -10 to load first 10 items initially)
var start = -10;

// Get the element where the posts will be appended
const postDiv = document.getElementById('postdiv');

// Function to load more data (pagination) when called
function morePageData() {
    start += 10; // Increment the starting point by 10 to fetch the next set of data
    $.post('/savedata/' + start, function (res) {
        // If the response is null or empty, stop further processing
        if (res == null || res.length <= 0) {
            return;
        }

        // Loop through the response array and call the `called` function for each post data
        for (let i = 0; i < res.length; i++) {
            called(res[i].userid, res[i].id, res[i].usignal, res[i].userurl);
        }
    });
}

// Call the function to load the first set of data when the script runs
morePageData();
