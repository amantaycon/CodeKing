function convertCodeToSafeHtml(codeText) {
    // Replace < and > with their HTML entity equivalents
    const safeCode = codeText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return safeCode;
}

// if post type is code than call this function and add code file in post list
function codefile(url){
    $.get(url, function(res){
        const pre = document.getElementById(url);
        pre.innerHTML = convertCodeToSafeHtml(res);
    })
}