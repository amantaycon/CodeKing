

const reqVerDivAdd = document.getElementById('reqverdivadd'); // dashboat list main head div
const reqverDiv = document.getElementById('reqverdiv'); // dashboad list main chile list div
reqverDiv.style.display = 'none';
var startredver = 0; // its intialise 0 to tell 0 post called and added in dashboad list

//this function add all requesed user list in dashboad top
function reqAddVer() {
    $.post('/requested/' + startredver + '/' + (startredver += 10), function (res) {
        if (res == null || res.length == 0) {
            return;
        }
        else {
            reqverDiv.style.display = 'flex';
            res.forEach(row => {
                const listItem = document.createElement('li');
                listItem.className = 'reqcon center';
                listItem.innerHTML = `<a href="/${row.userurl}" draggable="false" class="reqconimg">
                    <img class="reqconimg" src="/${row.userurl}/profile_pic" alt="" draggable="false">
                </a>
                <a href="/${row.userurl}"  draggable="false" class="center black reqverna">
                    <span class='orange'>${row.userurl}</span>
                    <span class='black'>${row.fullname}</span>
                </a>
                <div class="center reqcondis">
                    <span onclick="desiver(this, ${row.id}, 'accept')" class="point reqconac black">Accept</span>
                    <span onclick="desiver(this, ${row.id}, 'reject')" class="point reqconac black">Reject</span>
                </div>`
                reqVerDivAdd.appendChild(listItem);
            });
        }
    });
}

// if user request accept or reject then hide it imediatily base on calling value
function desiver(elemet, num, de) {
    $.post('/response/' + de + '/' + num, function (res) {
        if (res.success) {
            elemet.closest('.reqcon').style.display = 'none';
        }
    });
}

reqAddVer(); // call to add some requested users in dashboad 

// connection change base on calling argument
function conchangedas(ou, element) {
    var dt = { ou: ou };
    $.post("conchange", dt, function (res) {
        if (res == '-1') {
            element.innerHTML = 'Requested';
            element.style.background = 'var(--light_black1)';
        }
        else if (res == false) {
            element.innerHTML = 'Connect';
            element.style.background = 'var(--orange)';
        }
        else {
            element.closest('.reqcon').style.display = 'none';
        }
    });
}

// add some user list for connection to new users
function sugAddVer() {
    $.post('/suggested', function (res) {
        if (res == null || res.length == 0) {
            return;
        }
        else {
            reqverDiv.style.display = 'flex';
            res.forEach(row => {
                const listItem = document.createElement('li');
                listItem.className = 'reqcon center';
                listItem.innerHTML = `<a href="/${row.userurl}" draggable="false" class="reqconimg">
                    <img class="reqconimg" src="/${row.userurl}/profile_pic" alt="" draggable="false">
                </a>
                <a href="/${row.userurl}"  draggable="false" class="center black reqverna">
                    <span class='orange'>${row.userurl}</span>
                    <span class='black'>${row.fullname}</span>
                </a>
                <div class="center reqcondis">
                    <span onclick="conchangedas(${row.id},this)" class="point reqconct black">Connect</span>
                </div>`
                reqVerDivAdd.appendChild(listItem);
            });
        }
    });
}

sugAddVer(); // call it to add some sugested user list

var start = -10;
const postDiv = document.getElementById('postdiv');

// call to add some post in dashboard
function dashPageData() {
    start += 10;
    $.post('/dashboard/' + start, function (res) {
        if (res == null || res.length <= 0) {
            return;
        }

        for (let i = 0; i < res.length; i++) {
            called(res[i].userid, res[i].id, res[i].usignal, res[i].userurl);
        }
    });
}
dashPageData();
