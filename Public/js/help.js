// this function converted number in k,M,and B format
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num;
}

// this function convert timestamp to day or weeks ago format
function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);

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

//post top right called action
function threeDot(element) {
    // Get the .ftpocon element inside the same parent
    const ftpocon = element.closest('.mcdata').querySelector('.ftpocon');

    // Toggle the display of .ftpocon
    ftpocon.style.display = ftpocon.style.display === 'block' ? 'none' : 'block';

    // Click event to close .ftpocon if clicked outside
    document.addEventListener('click', function handleClickOutside(event) {
        if (!ftpocon.contains(event.target) && !element.contains(event.target)) {
            ftpocon.style.display = 'none';
            document.removeEventListener('click', handleClickOutside);
        }
    });
}

//click strike then action this function base on passing arguments
function clickStrict(element, url) {
    const path = element.querySelector('path');
    const strcount = element.closest('.mcdata').querySelector('.strcount');
    $.post(url, function (res) {
        if (res) {
            path.style.fill = 'var(--orange)';
            path.style.stroke = 'var(--orange)';
            if (url.includes('strick')) { strcount.innerHTML = countNumIncrement(strcount.innerHTML, 1); }
        }
        else {
            path.style.fill = 'none';
            path.style.stroke = 'var(--black)';
            if (url.includes('strick')) { strcount.innerHTML = countNumIncrement(strcount.innerHTML, -1); }
        }
    });
}

//instent reflect strike counting help of this function
function countNumIncrement(input, num) {
    // Check if the input string contains only numbers using a regular expression
    if (/^\d+$/.test(input)) {
        // Convert the numeric string to a number, increment it, and return it
        return (parseInt(input, 10) + num).toString();
    } else {
        // If the input contains any alphabetic character, return the same string
        return input;
    }
}

//instent add comment in comment box if user want to add any comments
function commentAdd(element, url) {
    const comment = element.closest('.come').querySelector('.comment');
    if (comment.value !== '' && comment.value !== null) {
        const data = { comment: comment.value };
        $.post(url, data, function (res) {
            comment.value = ''; // Clear the comment field
            const commentadd1 = element.closest('.mcdata').querySelector('.comprechild');
            const listItem = document.createElement('li');
            listItem.className = 'compcome';
            listItem.innerHTML = `<div class="comhead">
                                <div><a class="commuser" href="/${res[0].userurl}"><img class="commpic"
                                            src="/${res[0].userurl}/profile_pic"
                                            alt=""><span>${res[0].userurl}</span></a></div><span class="comdot">
                                    <!-- <svg class="svgco point" viewBox="0 0 16 16"
                                        xmlns="http://www.w3.org/2000/svg" fill="#000000"
                                        class="bi bi-three-dots-vertical">
                                        <path
                                            d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                    </svg> -->
                                </span>
                            </div>
                            <div class="commpr">
                                <p>${res[0].comment}</p>
                            </div>
                            <div class="datecom"><span class="dataday">${timeAgo(res[0].created_at)}</span></div>`;
            commentadd1.appendChild(listItem);
        });
    }
}

var startcom = 0;//correnting 0comment added in comment box

// add comment histry in comment box if user want to show comment box
function addcomment(commentadd1, url) {
    var data = { start: startcom, end: startcom += 6 };
    $.post(url, data, function (res) {
        for (let i = 0; i < res.length; i++) {
            const listItem = document.createElement('li');
            listItem.className = 'compcome';
            listItem.innerHTML = `<div class="comhead">
                                <div><a class="commuser" href="/${res[i].userurl}"><img class="commpic"
                                            src="/${res[i].userurl}/profile_pic"
                                            alt=""><span>${res[i].userurl}</span></a></div><span class="comdot">
                                    <!-- <svg class="svgco point" viewBox="0 0 16 16"
                                        xmlns="http://www.w3.org/2000/svg" fill="#000000"
                                        class="bi bi-three-dots-vertical">
                                        <path
                                            d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                    </svg> -->
                                </span>
                            </div>
                            <div class="commpr">
                                <p>${res[i].comment}</p>
                            </div>
                            <div class="datecom"><span class="dataday">${timeAgo(res[i].created_at)}</span></div>`;
            commentadd1.appendChild(listItem);
        }
    })
}

//if user scroll then add more comment history
function handleScroll(event) {
    const targetDiv = event.currentTarget; // Get the currently scrolling div

    // Check if the user has scrolled near the bottom of the div
    if (targetDiv.scrollHeight - targetDiv.scrollTop <= targetDiv.clientHeight + 50) {
        console.log(targetDiv.id); // Log the ID of the scrolling div
        addcomment(targetDiv.querySelector('.comprechild'), targetDiv.id); // Add more content to this div
    }
}

//check the user click or not in comment box icon
function svgcomment(element, url) {
    const commentbox = element.closest('.mcdata').querySelector('.comprediv');
    const commentadd1 = commentbox.querySelector('.comprechild');
    commentbox.style.display = commentbox.style.display !== 'none' ? 'none' : 'flex';
    startcom = 0;
    commentadd1.innerHTML = '';
    if (commentbox.style.display == 'flex') {
        addcomment(commentadd1, url);
        commentbox.addEventListener('scroll', handleScroll);
    } else {
        commentbox.removeEventListener('scroll', handleScroll);
    }
}

//add every post data if content is accesable by user
async function addpost1(url) {
    return new Promise((resolve, reject) => {
        var str = '<div class="mcdata"><div class="sideb con"><div class="sideb"><div class="f10">';
        $.post(url, function (res) {
            if (!res || res.length === 0) {
                resolve(null);
                return null;
            }
            else {
                str += `<a class="userli" href="/${res[0].userurl}"><div class="pros"><img class="pros pro" src="/${res[0].userurl}/profile_pic" alt=""></div><div class="center fontsbs"><span class="orange">${res[0].userurl}</span><span>${res[0].fullname}</span></div></a></div><div class="osndot"><span class="center"><svg onclick="threeDot(this)" class="svg1 point" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="var(--black)" class="bi bi-three-dots-vertical"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" /></svg></span></div></div></div><div class="center content"><div class="ftpocon"><div class="ftpocon1">`;

                str += `<a href='/${res[0].userurl}/download/${res[1].id}' download="${res[1].filename}" target="_blank" class="ftpoconc point">Download</a>
</div></div>`;
                switch (res[1].usignal) {
                    case 1:
                        str += `<img class="contentim" src="/${res[0].userurl}/givemedata/${res[1].id}" alt="">`;
                        break;
                    case 2:
                        str += `<video class="contentim" controls><source src="/${res[0].userurl}/givemedata/${res[1].id}" type="video/mp4"></video>`;
                        break;
                    case 3:
                        str += `<div class="filepostsh center">
                                    <div><svg width="150px" height="150px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(270)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 11V15.8C21 16.9201 21 17.4802 20.782 17.908C20.5903 18.2843 20.2843 18.5903 19.908 18.782C19.4802 19 18.9201 19 17.8 19H6.2C5.0799 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2C3 7.0799 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H15M21 11L15 5M21 11H16.6C16.0399 11 15.7599 11 15.546 10.891C15.3578 10.7951 15.2049 10.6422 15.109 10.454C15 10.2401 15 9.96005 15 9.4V5" stroke="var(--black)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                    <div class="center"><span class="orange">${res[1].filename}</span></div></div>
                                    </div>`;
                        break;
                    case 4:
                        str += `<img class="contentim" src="/${res[0].userurl}/givemedata/${res[1].id}" alt="">`;
                        break;
                    case 5:
                        str += `<div class="codepos"><span class="copycode point" onclick="copyCode(this)">copy</span><code class="codetsg"><pre class='pretag' id="${res[0].userurl}/givemedata/${res[1].id}"></pre></code></div>`;
                        break;
                }
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
                resolve(str);
            }
        });
    });
}

//insure that every data and comment box adress and strick update
async function called(userid, postid, usignal, userurl) {
    const listItem = document.createElement('li');
    listItem.className = 'conitm center';
    var str = await addpost1('/' + userid + '/_get_data_post/' + postid);
    if (str == null) { return; }
    listItem.innerHTML = str;
    postDiv.appendChild(listItem);
    if (usignal == 5) {
        codefile(userurl + '/givemedata/' + postid);
    }
    const elet = document.getElementById(userid + '/chackstrike/' + postid);
    const elet1 = document.getElementById(userid + '/chacksave/' + postid);
    clickStrict(elet, '/' + userid + '/chackstrike/' + postid);
    clickStrict(elet1, '/' + userid + '/chacksave/' + postid);
}