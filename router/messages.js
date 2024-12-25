const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express.Router();
const con = require('../mysqlcon');

con.connect((err) => { if (err) { console.error('Error connecting to MySQL:', err); return; } });

// serve message page
app.get('/Messages', (req, res) => {
    if (req.session.login) {
        const data = { userurl: req.session.userurl, fullname: req.session.fullname, id: req.session.idd, click: 4 };
        res.render('messages.ejs', { data });
    }
    else { res.redirect('/login'); }
});

// send user list which perform chating 
app.post('/usermessagelist', async (req, res) => {
    if (req.session.login) {
        try {
            // select user odered by higher unread message 
            const str = `SELECT * FROM ${req.session.idd}_message ORDER BY countmes DESC LIMIT 50 OFFSET 0`;
            const [messages] = await con.promise().query(str);

            // store all user details
            const data = await Promise.all(
                messages
                    .filter(message => message.signalmes === 1) // check the user permission is allowed
                    .map(async (message) => {
                        const [userDetails] = await con.promise().query(
                            `SELECT userurl, fullname FROM users WHERE id = ?`,
                            [message.userid]
                        );
                        if (userDetails.length > 0) { // check user if found
                            userDetails[0].id = message.userid; // add user id in user details
                            return userDetails[0];
                        }
                    })
            );

            res.send(data.filter(Boolean)); // Filters out any `undefined` results
        } catch (e) {
            console.error('Error fetching user URLs:', e);
            res.status(500).send({ error: 'Error fetching user URLs', details: e });
        }
    } else { res.status(404).send('404 error'); }
});

// add user in message list if permision is allowed
app.post('/clickusermessage', (req, res) => {
    const userid = parseInt(req.body.id);
    if (req.session.login) {
        // chech user is already exits
        var str = `select * from ${req.session.idd}_message where userid = ?`;
        con.query(str, [userid], (e, r) => {
            if (e) { console.error('Error fetching user URLs:', e); }
            // if user alredy exits
            if (r.length > 0) {
                createUserMessage(true); // call with true
            } else { // create message list and some requqed table if permision is allowed
                str = `select conshow from users where id = ?`;
                con.query(str, [userid], (er, re) => {
                    if (er) { console.error('Error fetching user URLs:', er); }
                    if (re.length > 0) {
                        // user message setting permision is public
                        if (re[0].conshow == 0) {
                            createUserMessageAdd();
                        }
                        // user message setting permision is only connected people
                        else if (re[0].conshow == 1) {
                            // check user is connected list present or not
                            str = `select * from ${userid}_cond where id = ?`;
                            con.query(str, [req.session.idd], (error, result) => {
                                if (error) { console.error('Error fetching user URLs:', error); }
                                // present in connected list
                                if (result.length > 0) {
                                    createUserMessageAdd();
                                }
                                else { createUserMessage(false); }//not present in connected list
                            });
                        } else { return res.send(null); }
                    } else { return res.send(null); }
                })
            }

            // run only once if user added newly message list
            function createUserMessageAdd() {
                // store userid, permisson and data table address
                str = `INSERT INTO ${req.session.idd}_message (userid, signalmes, address) VALUES(?,?,?)`;
                con.query(str, [userid, 1, req.session.idd + 'messagebox' + userid], (err) => {
                    if (err) { console.error('Error fetching user URLs:', err); }
                    // add user in message list
                    str = `INSERT INTO ${userid}_message (userid, signalmes, address) VALUES(?,?,?)`;
                    con.query(str, [req.session.idd, 1, req.session.idd + 'messagebox' + userid], (er) => {
                        if (er) { console.error('Error fetching user URLs:', er); }
                        // create table for storing user message data
                        var columns = `id INT AUTO_INCREMENT PRIMARY KEY,
                                        messages varchar(2000),
                                        messignal int ,
                                        datalink varchar(255) ,
                                        userid int,
                                        messeen tinyint default 0,
                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;

                        var sql = `CREATE TABLE IF NOT EXISTS ${req.session.idd}messagebox${userid} (${columns})`;
                        con.query(sql, (errrr) => {
                            if (errrr) { console.error({ error: 'Error creating users table', details: errrr }); return; }

                            // Create the directory for store user message data
                            fs.mkdir(`./messagedata/${req.session.idd}messagebox${userid}`, { recursive: true }, (err) => {
                                if (err) { return console.error('Error creating directory:', err); }
                                createUserMessage(true);
                            });
                        });
                    });

                });
            }

            // desi = desision is boolean value
            function createUserMessage(desi) {
                if (desi == false) {
                    return res.send(false); // if false retun false
                } else if (desi == true) { // if true select details of user
                    str = `select id, userurl, fullname from users where id = ?`;
                    con.query(str, [userid], (er, re) => {
                        if (er) { console.error('Error fetching user URLs:', er); }
                        if (re.length > 0) {
                            res.send(re[0]); // send user details data for start messaging
                        }
                        else { return res.send(false); }
                    })
                } else { return res.send(null); }
            }
        });

    } else { res.status(404).send('404 error'); }
});

// // upload messages
app.post('/uploadmessagedatatext', (req, res) => {
    if (req.session.login) {
        const userid = parseInt(req.body.userid);
        const message = req.body.messages.trim();
        if (!userid || message == '') {
            return res.send('0');
        }
        var str = `select address from ${req.session.idd}_message where userid = ${userid}`; // select message address
        con.query(str, (e, r) => {
            if (e) { console.error('error executing qurey message uploading time', e) }
            if (r.length > 0) {
                // insert message detail to database
                var sql = `INSERT INTO \`${r[0].address}\` (messages, messignal, userid) VALUES (?,?,?)`;

                con.query(sql, [message, 6, req.session.idd], (err, result) => {
                    if (err) { return res.status(500).json({ error: 'Error creating table', details: err }); }

                    sql = `UPDATE ${userid}_message SET countmes = countmes + 1 WHERE userid = ?`; // update counting of messages
                    con.query(sql, [req.session.idd], (err) => {
                        if (err) { return res.status(500).json({ error: 'Error adding data table', details: err }); }
                        var data = {userid: req.session.idd, messageid: result.insertId};
                        res.send(data); // return iserted data 
                    });
                });
            } else { return res.send(null); }
        });

    } else { return res.send(null); }
});

// serve messages
app.post('/givememessage/:userid/:start', (req, res) => {
    if (req.session.login) {
        var start = parseInt(req.params.start); // start posione of messages
        var userid = parseInt(req.params.userid); // userid of messages which send
        var str = `select address from ${req.session.idd}_message where userid = ${userid}`; // select messages address
        const data = [];
        con.query(str, (e, r) => {
            if (e) { console.error('error executing sql query', e); }
            if (r.length > 0) {
                str = `select * from ${r[0].address} ORDER BY id DESC limit 15 offset ${start}`; // select messages upto 15
                con.query(str, (er, re) => {
                    if (er) { console.error('error executing sql query', er); }
                    if (re.length > 0) {
                        data.push(re.length); // message data lenght inserted in data
                        data.push(re); // inserted user message list in data
                        return res.send(data); // send all message data
                    } else { return res.send(null); }
                });
            } else { return res.status(400).send(null); }
        });
    } else { return res.send(null); }
});


// get url and serve media data like videos, images, files, code
app.get('/givememessagechat/:userid/:messageid', (req, res) => {

    // Check if the user is logged in
    if (req.session.login) {

        // Extract fileid URL and user ID from route parameters
        const fileid = req.params.messageid;
        const userid = req.params.userid;


        // Query to find message address of users if present for privacy reason
        var str = `select address from ${req.session.idd}_message where userid = ?`;
        con.query(str, [userid], (e, r) => {

            // Handle any database error that occurs while retrieving user data
            if (e) {
                return res.status(500).json({ error: 'Error selecting user data', details: e });
            }

            if (r.length == 0) {
                return res.send(null);
            }

            const address = r[0].address; // store message address
            // find actual message which user requsted
            str = `select * from ${address} where id = ?`;
            con.query(str, [fileid], (er, re) => {

                // Handle any database error that occurs while retrieving post data
                if (er) {
                    return res.status(500).json({ error: 'Error selecting user data', details: er });
                }
                if (re.length == 0) {
                    return res.send(null);
                }
                var filepath;
                var filesize;
                // check if data is not only text message it's media data
                if (parseInt(re[0].messignal) != 6) {
                    filepath = path.join(__dirname, '../messagedata', address, re[0].datalink);  // File path of the requested resource
                    filesize = fs.statSync(filepath).size;  // Size of the file
                }

                

                // Check the 'messignal' field to decide on the file type and handling method
                if (parseInt(re[0].messignal) == 2) {

                    // If 'Range' header is missing, return a 416 error requiring it
                    const range = req.headers.range;
                    if (!range) {
                        res.status(416).send('Requires Range header');
                        return;
                    }

                    // Define the start and end byte range for partial content delivery
                    const CHUNK_SIZE = 10 ** 6; // 1MB chunk size
                    const start = Number(range.replace(/\D/g, ''));
                    const end = Math.min(start + CHUNK_SIZE, filesize - 1);

                    // Set headers for partial content delivery
                    const contentLength = end - start + 1;
                    var headers = {
                        'Content-Range': `bytes ${start}-${end}/${filesize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': contentLength,
                        'Content-Type': 'application/octet-stream',
                    };

                    // Send partial content with HTTP status 206
                    res.writeHead(206, headers);

                    // Create a readable stream for the requested byte range and pipe it to the response
                    const videoStream = fs.createReadStream(filepath, { start, end });
                    videoStream.pipe(res);
                }
                else if (parseInt(re[0].messignal) == 1 || parseInt(re[0].messignal) == 4) {
                    // For images, set the content type and send the file
                    res.setHeader('Content-Type', 'image/*');
                    res.sendFile(filepath);
                }
                else if (parseInt(re[0].messignal) == 5) {
                    // For plain text files, set content type and send the file
                    res.setHeader('Content-Type', 'text/plain');
                    res.sendFile(filepath);
                } else if (parseInt(re[0].messignal) == 3) {

                    fs.access(filepath, fs.constants.F_OK, (err) => {
                        if (err) { return res.status(404).send("File not found."); }

                        // Set headers for downloading the file
                        res.setHeader('Content-Type', 'application/octet-stream');
                        res.setHeader('Content-Disposition', `attachment; filename="${re[0].datalink}"`);

                        // Send the file to the client for download
                        res.sendFile(filepath, (err) => {
                            if (err) {
                                console.error("Error downloading file:", err);
                                res.status(500).send("Error downloading file."); // Handle server errors
                            }
                        });
                    });
                } else { return res.send(null); }

                // If the message belongs to another user, mark it as seen
                if (re[0].userid !== req.session.idd) {

                    str = `UPDATE ${r[0].address} SET messeen = 1 WHERE id = ?`;
                    con.query(str, [fileid], (err) => {
                        if (err) {
                            return console.error({ error: 'Error selecting user data', details: err });
                        }
                    });

                }
            });
        });
    } else { return res.send(null); }
});

// serve one complete message data to user if user requsted
app.post('/recentdata/:userid/:messageid', (req, res) => {
    const userid = parseInt(req.params.userid);
    const messageid = parseInt(req.params.messageid);
    // check userid and message id is valid or not and also check login
    if (!req.session.login || userid <= 0 || messageid <= 0) {
        return res.status(400).json({ error: "Invalid request or session not active." });
    }

    const userTable = `${req.session.idd}_message`;

    // Query to get the address table name
    const query1 = `SELECT address FROM ?? WHERE userid = ?`;
    con.query(query1, [userTable, userid], (err1, result1) => {
        if (err1) {
            console.error('SQL query execution error:', err1);
            return res.status(500).json({ error: "Database query failed." });
        }

        if (result1.length == 0) {
            return res.status(404).json({ error: "No address found for the user." });
        }

        const addressTable = result1[0].address;

        // Query to fetch the message details
        const query2 = `SELECT * FROM ?? WHERE id = ?`;
        con.query(query2, [addressTable, messageid], (err2, result2) => {
            if (err2) {
                console.error('SQL query execution error:', err2);
                return res.status(500).json({ error: "Database query failed." });
            }

            if (result2.length == 0) {
                return res.status(404).json({ error: "Message not found." });
            }

            const message = result2[0];

            // If the message belongs to another user, mark it as seen
            if (message.userid !== req.session.idd) {
                const query3 = `UPDATE ?? SET messeen = 1 WHERE id = ?`;
                con.query(query3, [addressTable, messageid], (err3) => {
                    if (err3) {
                        console.error('SQL query execution error:', err3);
                    }
                });
            }

            return res.status(200).json(message);
        });
    });
});



module.exports = app;