const express = require('express');
const fs = require('fs');
const app = express.Router();
const con = require('../mysqlcon');
// connect data base
con.connect((err) => { if (err) { console.error('Error connecting to MySQL:', err); return; } });

// serve url profile page
app.get('/:userurl', (req, res) => {
  const userurl = req.params.userurl; // store userurl from link

  // select all nessesary data from url user
  const str = `select id, userurl, fullname, bio, account_status from users where userurl = ?`;
  con.query(str, [userurl], (e, r) => {
    if (e) { console.error('Error executing query:', e); return; }

    // if url user is present
    if (r.length > 0) {

      // account is proper status mean not suspended
      if (r[0].account_status == 0) {

        // select url user post detail
        var sql = `SELECT post_c, contd_c, contg_c FROM user_profile WHERE id = ?`;
        con.query(sql, [r[0].id], (err, result) => {
          if (err) { console.error('Error executing query:', err); return; }

          // check user login or not
          if (req.session.login) {

            // store own user details
            const r1 = { id: req.session.idd, userurl: req.session.userurl, fullname: req.session.fullname };
            if (req.session.idd == r[0].id) { r1.click = 5; }
            else { r1.click = 2; }
            res.render('profile.ejs', { data: r1, data1: r[0], data2: result[0] });
          }
          // return profile to guest user
          else {
            const r1 = { id: 0, userurl: 'login', fullname: 'Guest' };
            res.render('profile.ejs', { data: r1, data1: r[0], data2: result[0] });
          }
        });
      }
      else { res.status(404).render('404'); }
    }
    else { res.status(404).render('404'); }
  });
});

// chack login user connecting or not
app.post('/concheck', (req, res) => {
  const ou = req.body.ou; // other user id
  if (req.session.login) {
    const id = req.session.idd; // login user id
    if (id != ou) {

      // select login user connecting list other user present or not
      const str = `select * from \`${id}_cong\` where id = ?`;
      con.query(str, [ou], (e, r) => {
        if (e) { console.error('Error executing query:', e); return; }

        // if other user is connecting send true
        if (r.length > 0 && ou == r[0].id) { res.send(true); }
        else {
          // select other user requested list 
          var sql = `select * from ${ou}_requested where id = ?`;
          con.query(sql, [id], (er, re) => {
            if (er) { console.error('Error executing query:', er); return; }
            // if login user present  send null
            if (re.length > 0) {
              return res.send('-1');
            }
            // if login user not present send false
            else { return res.send(false); }
          });
        }
      });
    }
  } else { res.status(404).send('File is not found 404'); }
});

// change the connecting user status
app.post('/conchange', (req, res) => {
  const ou = req.body.ou; // store other user id
  if (req.session.login) {
    const id = req.session.idd; // store login user id

    // check two diffrent user
    if (id != ou) {

      // check user present or not
      var str = `select * from \`${id}_cong\` where id = ?`;
      con.query(str, [ou], (e, r) => {
        if (e) { console.error('Error executing query:', e); return; }

        // if user found disconnected and delete user row in table
        if (r.length > 0 && ou == r[0].id) {
          const str = `DELETE FROM \`${id}_cong\` WHERE id = ?`;
          con.query(str, [ou], (er) => {
            if (er) { console.error('Error executing query:', er); return; }
            var sql = `UPDATE user_profile SET contg_c = contg_c - 1 WHERE id = ?`;
            con.query(sql, [id], (err) => {
              if (err) { return res.status(500).json({ error: 'Error adding data table', details: err }); }
              const str1 = `DELETE FROM \`${ou}_cond\` WHERE id = ?`;
              con.query(str1, [id], (er, re) => {
                if (er) { console.error('Error executing query:', er); return; }
                var sql = `UPDATE user_profile SET contd_c = contd_c - 1 WHERE id = ?`;
                con.query(sql, [ou], (err) => {
                  if (err) { return res.status(500).json({ error: 'Error adding data table', details: err }); }
                  res.send(true); return;
                });
              });
            });
          });
        }
        else {
          str = `select * from ${ou}_requested where id = ?`;
          con.query(str, [id], (err, resu) => {
            if (err) { console.error('Error executing query:', err); return; }
            if (resu.length > 0) {
              const str = `DELETE FROM \`${ou}_requested\` WHERE id = ?`;
              con.query(str, [id], (er) => {
                if (er) { console.error('Error executing query:', er); return; }
                res.send(false);
              })
            }
            // if user not found connecting and inserting user row in table
            else {
              // insert connecting user
              var str = `select account_type from users where id = ?`;
              con.query(str, [ou], (e, r) => {
                if (e) { console.error('Error executing query:', e); return; }
                // if other user account is public insert connecting row table
                if (r[0].account_type === 0) {
                  var str = `INSERT INTO \`${id}_cong\` (id) VALUES (?)`;
                  con.query(str, [ou], (er) => {
                    if (er) { console.error('Error executing query:', er); return; }
                    var sql = `UPDATE user_profile SET contg_c = contg_c + 1 WHERE id = ?`;
                    con.query(sql, [id], (err) => {
                      if (err) { return res.status(500).json({ error: 'Error update data table', details: err }); }
                      var str = `INSERT INTO \`${ou}_cond\` (id) VALUES (?)`;
                      con.query(str, [id], (er, re) => {
                        if (er) { console.error('Error executing query:', er); return; }
                        var sql = `UPDATE user_profile SET contd_c = contd_c + 1 WHERE id = ?`;
                        con.query(sql, [ou], (err) => {
                          if (err) { return res.status(500).json({ error: 'Error update data table', details: err }); }
                          res.send(true); return;
                        });
                      });
                    });
                  });
                }

                // if other user account is private insert requested table
                else if (r[0].account_type === 1) {
                  str = `insert into \`${ou}_requested\` (id) values (?)`;
                  con.query(str, [id], (er) => {
                    if (er) { console.error('Error executing query:', er); return; }
                    res.send('-1');
                  });
                }
              });
            }
          })
        }
      });
    }
  } else { res.status(404).send('File is not found 404'); }
});

//return connecting list to user
app.post('/connting_list/:start/:end', (req, res) => {
  const start = parseInt(req.params.start); // Starting point
  const end = parseInt(req.params.end); // Ending point

  if (!req.session.login) {
    return res.status(404).send('File not found (404)');
  }

  const id = req.body.num; // ID of the user whose connection list is to be returned
  let grant = false;

  // Query to get the `conshow` setting for the specified user
  const conShowQuery = `SELECT conshow FROM users WHERE id = ?`;
  con.query(conShowQuery, [id], (err, conShowResult) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Error executing query', details: err });
    }

    // Determine if access should be granted based on `conshow` setting
    if (id == req.session.idd) {
      grant = true;
      retrieveConnectingList(grant);
    } else if (conShowResult[0].conshow === 2) {
      return res.send(null); // Deny access if "Only Me" setting is active
    } else if (conShowResult[0].conshow === 0) {
      grant = true;
      retrieveConnectingList(grant); // Grant access if the other user has a public status
    } else if (conShowResult[0].conshow === 1) {
      // Check if the logged-in user is a connected user
      const connectionCheckQuery = `SELECT id FROM ${id}_cond WHERE id = ?`;
      con.query(connectionCheckQuery, [req.session.idd], (connErr, connResult) => {
        if (connErr) {
          console.error('Error executing query:', connErr);
          return res.status(500).json({ error: 'Error executing query', details: connErr });
        }

        grant = connResult.length > 0; // Grant access if a connection exists
        retrieveConnectingList(grant);
      });
    }
  });

  // Function to retrieve the connecting list if access is granted
  function retrieveConnectingList(grant) {
    if (!grant) {
      return res.send(null); // Access not granted
    }

    // Query to get the connecting list in the specified range
    let connectingListQuery = `SELECT * FROM \`${id}_cong\` LIMIT ${end - start} OFFSET ${start}`;
    con.query(connectingListQuery, (listErr, listResult) => {
      if (listErr) {
        console.error('Error executing query:', listErr);
        return res.status(500).json({ error: 'Error executing query', details: listErr });
      }

      if (listResult.length > 0) {

        // Retrieve details for each user in the connecting list
        let userDataPromises = listResult.map(row => {
          let userQuery = `SELECT userurl, fullname FROM users WHERE id = ?`;
          return new Promise((resolve, reject) => {
            con.query(userQuery, [row.id], (userErr, userResults) => {
              if (userErr) return reject(userErr);
              resolve(userResults[0]); // Resolve with user data
            });
          });
        });

        // Wait for all user data queries to complete
        Promise.all(userDataPromises)
          .then(userData => {
            res.json(userData); // Send collected user data once all queries finish
          })
          .catch(userError => {
            res.status(500).json({ error: 'Error retrieving connected list', details: userError });
          });
      }
      else {
        return res.send(null); // No connections found
      }
    });
  }
});


//return connected list to user
app.post('/connted_list/:start/:end', (req, res) => {
  const start = parseInt(req.params.start); // Starting point
  const end = parseInt(req.params.end); // Ending point

  if (req.session.login) {
    const id = req.body.num; // ID of the user whose connections list is to be retrieved

    // Select the `conshow` type for the specified user
    const conShowQuery = `SELECT conshow FROM users WHERE id = ?`;
    con.query(conShowQuery, [id], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Error executing query', details: err });
      }

      let grant = false;

      if (id == req.session.idd) {
        grant = true; // Allow if the IDs match (self-access)
        retrieveConnectedList(grant);
      } else if (result[0].conshow === 2) {
        // If "Only Me" setting is active, deny access
        return res.send(null);
      } else if (result[0].conshow === 0) {
        grant = true; // Allow if the other user has a public status
        retrieveConnectedList(grant);
      } else if (result[0].conshow === 1) {
        // If "Connected Users Only" setting is active, check connection
        const connectionCheckQuery = `SELECT id FROM ${id}_cond WHERE id = ?`;
        con.query(connectionCheckQuery, [req.session.idd], (connErr, connResult) => {
          if (connErr) {
            console.error('Error executing query:', connErr);
            return res.status(500).json({ error: 'Error executing query', details: connErr });
          }

          // Grant access if there is a connection
          grant = connResult.length > 0;
          retrieveConnectedList(grant);
        });
      }
    });

    // Function to retrieve the connected list if access is granted
    function retrieveConnectedList(grant) {
      if (!grant) {
        return res.send(null); // Access not granted
      }

      const connectionListQuery = `SELECT * FROM \`${id}_cond\` LIMIT ? OFFSET ?`;
      con.query(connectionListQuery, [end - start, start], (listErr, listResult) => {
        if (listErr) {
          return res.status(500).json({ error: 'Error selecting table', details: listErr });
        }

        if (listResult.length > 0) {
          // Map over each connection to retrieve detailed user information
          const userDataPromises = listResult.map(row => {
            const userQuery = `SELECT userurl, fullname FROM users WHERE id = ?`;
            return new Promise((resolve, reject) => {
              con.query(userQuery, [row.id], (userErr, userResults) => {
                if (userErr) return reject(userErr);
                resolve(userResults[0]); // Resolve with user data
              });
            });
          });

          // Wait for all user data queries to complete
          Promise.all(userDataPromises)
            .then(userData => {
              res.json(userData); // Send collected user data
            })
            .catch(userError => {
              res.status(500).json({ error: 'Error retrieving connected list', details: userError });
            });
        } else {
          res.send(null); // No connections found
        }
      });
    }
  } else {
    res.status(404).send('File not found (404)');
  }
});


//return post list to user
app.post('/userpost/:start/:end', (req, res) => {
  var start = parseInt(req.params.start); // store start point
  var end = parseInt(req.params.end); // store end point
  if (req.session.login) {
    const id = req.body.ou; // Store the ID of the user whose posts are to be returned

    // Check the account type of the specified user
    let str = `select account_type from users where id = ?`;
    con.query(str, [id], (err, accountTypeResult) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Error executing query', details: err });
      }

      let grant = false;

      // Grant access if the logged-in user and requested user are the same
      if (id == req.session.idd) {
        grant = true;
        retrieveUserPosts(grant);
      } else if (accountTypeResult[0].account_type === 0) {
        // Grant access if the other user has a public account
        grant = true;
        retrieveUserPosts(grant);
      } else if (accountTypeResult[0].account_type === 1) {
        // Check if the logged-in user is a connected user
        str = `select id from ${id}_cond where id = ?`;
        con.query(str, [req.session.idd], (err, connectionResult) => {
          if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Error executing query', details: err });
          }

          // Grant access if a connection exists
          if (grant = connectionResult.length > 0) {
            retrieveUserPosts(grant);
          }
          else { return res.send('-1'); }
        });
      }
    });

    function retrieveUserPosts(grant) {
      if (!grant) {
        return res.send(null); // Access not granted
      }

      const data = [];

      // Select the requested user's details
      const userDetailsQuery = `select id, userurl from users where id = ?`;
      con.query(userDetailsQuery, [id], (err, userDetails) => {
        if (err) {
          return res.status(500).json({ error: 'Error selecting user data', details: err });
        }

        data.push(userDetails[0]); // Add user details to the response data

        // Select the user's posts in the specified range
        const postsQuery = `select id, usignal from \`${id}_username_post\` ORDER BY id DESC LIMIT ${end - start} OFFSET ${start}`;
        con.query(postsQuery, (err, posts) => {
          if (err) {
            return res.status(500).json({ error: 'Error selecting posts', details: err });
          }

          if (posts.length > 0) {
            // Append each post to the response data
            posts.forEach(post => data.push(post));
            res.send(data);
          } else {
            res.send(null); // No posts available
          }
        });
      });
    }
  } else { res.send(true); } // User is not logged in
});

// returned given user post complete data
app.post('/:userid/_get_data_post/:postid', (req, res) => {
  const userid = req.params.userid; // store post user id
  const postid = req.params.postid; // store post id

  if (req.session.login) {
    // select post owner details
    var str = `select id, userurl, fullname, account_type from users where id = ?`;
    con.query(str, [userid], (e, r) => {
      if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }
      // select post details
      str = `select * from ${userid}_username_post where id = ?`;
      con.query(str, [postid], (err, re) => {
        if (err) { return res.status(500).json({ error: 'Error selecting user data', details: err }); }
        var g1 = false;
        var g2 = false;

        // Check the account type and set g1 accordingly
        if (r[0].account_type === 0) {
          g1 = true;
          proceed();
        } else if (r[0].account_type === 1) {
          let str = `select id from ${userid}_cond where id = ?`;

          // Perform the query and determine the value of g1 based on the result
          con.query(str, [req.session.idd], (error, result) => {
            if (error) {
              return res.status(500).json({ error: 'Error selecting user data', details: error });
            }
            g1 = result.length > 0;
            proceed();
          });
        } else {
          proceed();
        }

        // Function to continue execution once g1 is determined
        function proceed() {
          if (g1 || userid == req.session.idd) {
            g2 = re[0].privacy === 0;

            if (g2 || userid == req.session.idd) {
              const data = [r[0], re[0]];
              res.send(data);
            }
            else { res.send(null); }
          }
          else { res.send(null); }
        }

      });
    });
  }
  else { return res.send(null); }
});

// Define a GET route to retrieve data based on user URL and post ID parameters
app.get('/:userurl/givemedata/:postid', (req, res) => {

  // Check if the user is logged in
  if (req.session.login) {

    // Extract user URL and post ID from route parameters
    const userurl = req.params.userurl;
    const postid = req.params.postid;

    // Get the 'Referer' header to check if the request came from a specific page
    const referer = req.get('Referer');

    // Query to find user ID based on the user URL
    var str = `select id, account_type from users where userurl = ?`;
    con.query(str, [userurl], (e, r) => {

      // Handle any database error that occurs while retrieving user data
      if (e) {
        return res.status(500).json({ error: 'Error selecting user data', details: e });
      }
      const userid = r[0].id;
      // If user ID is found, query to get file path and signal based on post ID
      str = `select fullpath, usignal, privacy from ${r[0].id}_username_post where id = ?`;
      con.query(str, [postid], (er, re) => {

        // Handle any database error that occurs while retrieving post data
        if (er) {
          return res.status(500).json({ error: 'Error selecting user data', details: er });
        }

        const filepath = re[0].fullpath;  // File path of the requested resource
        const filesize = fs.statSync(filepath).size;  // Size of the file



        // const myDomain = 'https://codeking.com'; 
        // if (referer && referer.startsWith(myDomain)) {

        if (referer) {  // If referer exists, proceed to determine the type of file to send

          var g1 = false;
          var g2 = false;
          // Check the account type and set g1 accordingly
          if (r[0].account_type === 0) {
            g1 = true;
            proceed();
          } else if (r[0].account_type === 1) {
            let str = `select id from ${r[0].id}_cond where id = ?`;

            // Perform the query and determine the value of g1 based on the result
            con.query(str, [req.session.idd], (error, result) => {
              if (error) {
                return res.status(500).json({ error: 'Error selecting user data', details: error });
              }
              g1 = result.length > 0;
              proceed();
            });
          } else {
            proceed();
          }

          // Function to continue execution once g1 is determined
          function proceed() {
            if (g1 || userid == req.session.idd) {
              g2 = re[0].privacy === 0;

              if (g2 || userid == req.session.idd) {
                serveFile(); // call to serve file data
              }
              else { res.send(null); }
            }
            else { res.send(null); }
          }

          // serve file to users execution once
          function serveFile() {
            // Check the 'usignal' field to decide on the file type and handling method
            if (parseInt(re[0].usignal) == 2 || parseInt(re[0].usignal) == 3) {

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
            else if (parseInt(re[0].usignal) == 1 || parseInt(re[0].usignal) == 4) {
              // For images, set the content type and send the file
              res.setHeader('Content-Type', 'image/*');
              res.sendFile(filepath);
            }
            else if (parseInt(re[0].usignal) == 5) {
              // For plain text files, set content type and send the file
              res.setHeader('Content-Type', 'text/plain');
              res.sendFile(filepath);
            }

            // Update the view count for the post in the database
            str = `UPDATE ${r[0].id}_username_post SET view1 = view1 + 1 WHERE id = ?`;
            con.query(str, [postid], (err) => {
              if (err) {
                return res.status(500).json({ error: 'Error selecting user data', details: err });
              }
            });
            return;
          }
        }
        else {
          // Log a message if the request is a direct access (no referrer)
          console.log('This is a direct call (e.g., typed URL or refreshed).');
          res.send('Somethink Wrong 404');
        }
      });
    });
  }
});


// Define a GET route to download based on user URL and post ID parameters
app.get('/:userurl/download/:postid', (req, res) => {
  if (req.session.login) {
    const userurl = req.params.userurl;
    const postid = req.params.postid;

    var str = `select id, account_type from users where userurl = ?`;
    con.query(str, [userurl], (e, r) => {
      if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }

      const userid = r[0].id;
      str = `select fullpath, filename, usignal, privacy from ${r[0].id}_username_post where id = ?`;
      con.query(str, [postid], (er, re) => {
        if (er) { return res.status(500).json({ error: 'Error selecting user data', details: er }); }
        const filepath = re[0].fullpath;

        var g1 = false;
        var g2 = false;
        // Check the account type and set g1 accordingly
        if (r[0].account_type === 0) {
          g1 = true;
          proceed();
        } else if (r[0].account_type === 1) {
          let str = `select id from ${r[0].id}_cond where id = ?`;

          // Perform the query and determine the value of g1 based on the result
          con.query(str, [req.session.idd], (error, result) => {
            if (error) {
              return res.status(500).json({ error: 'Error selecting user data', details: error });
            }
            g1 = result.length > 0;
            proceed();
          });
        } else {
          proceed();
        }

        // Function to continue execution once g1 is determined
        function proceed() {
          if (g1 || userid == req.session.idd) {
            g2 = re[0].privacy === 0;

            if (g2 || userid == req.session.idd) {
              downloadData() // call to download file data
            }
            else { res.send(null); }
          }
          else { res.send(null); }
        }

        function downloadData() {
          fs.access(filepath, fs.constants.F_OK, (err) => {
            if (err) { return res.status(404).send("File not found."); }

            // Set headers for downloading the file
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${re[0].filename}"`);

            // Send the file to the client for download
            res.sendFile(filepath, (err) => {
              if (err) {
                console.error("Error downloading file:", err);
                res.status(500).send("Error downloading file."); // Handle server errors
              }
              str = `UPDATE ${r[0].id}_username_post SET view1 = view1 + 1 WHERE id = ?`;
              con.query(str, [postid], (errr) => {
                if (errr) { return res.status(500).json({ error: 'Error selecting user data', details: errr }); }
              });
            });
          });
        }
      });
    });
  }
});

// Define a GET route to delete based on user URL and post ID parameters
app.post('/:userurl/delete/:postid', (req, res) => {
  if (req.session.login) {
    const userurl = req.params.userurl;
    const postid = req.params.postid;
    if (req.session.userurl == userurl) {
      var str = `select id from users where userurl = ?`;
      con.query(str, [userurl], (e, r) => {
        if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }
        str = `select fullpath from ${r[0].id}_username_post where id = ?`;
        con.query(str, [postid], (er, re) => {
          if (er) { return res.status(500).json({ error: 'Error selecting user data', details: er }); }
          const filepath = re[0].fullpath;
          str = `delete from ${r[0].id}_username_post where id = ?`;
          con.query(str, [postid], (error) => {
            if (error) { return res.status(500).json({ error: 'Error selecting user data', details: error }); }
          });
          fs.unlink(filepath, (err) => { if (err) { return res.status(500).json({ error: 'Failed to delete file' }); } });
          const query = `DROP TABLE IF EXISTS \`${r[0].id}_strt_${postid}\``;
          con.query(query, (error) => {
            if (error) { return res.status(500).json({ error: 'Failed to delete data' }); }
          });
          const query1 = `DROP TABLE IF EXISTS \`${r[0].id}_comnt_${postid}\``;
          con.query(query1, (error) => {
            if (error) { return res.status(500).json({ error: 'Failed to delete data' }); }
          });
          const sql = `UPDATE user_profile SET post_c = post_c - 1 WHERE id = ?`;
          con.query(sql, [req.session.idd], (err) => {
            if (err) { return res.status(500).json({ error: 'Error adding data table', details: err }); }
          });
          res.send('clear data');
        });
      });
    }
  }
});

//give strice or not perform with help of url which user reqested
app.post('/:userid/changestrick/:postid', (req, res) => {
  const userid = parseInt(req.params.userid); // store owener of post user id
  const postid = parseInt(req.params.postid); // store post id
  if (req.session.login) {
    // select strike details to user strike this post or not
    var str = `select * from \`${userid}_strt_${postid}\` where id = ?`;
    con.query(str, [req.session.idd], (e, r) => {
      if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }
      // if user strike this post then remove strike
      if (r.length > 0) {
        str = `delete from \`${userid}_strt_${postid}\` where id = ?`;
        con.query(str, [req.session.idd], (er) => {
          if (er) { return res.status(500).json({ error: 'Error deleting data', details: er }); }
          // decrement strike count of post
          const sql = `UPDATE ${userid}_username_post SET strict = strict - 1 WHERE id = ?`;
          con.query(sql, [postid], (err) => {
            if (err) { return res.status(500).json({ error: 'Error adding data table', details: err }); }
            res.send(false); return; // send false means user not strike this post 
          });
        });
      }
      // if user not strike this post
      else {
        // inserted strike details of userid of user
        str = `INSERT INTO \`${userid}_strt_${postid}\` (id) VALUES (?)`;
        con.query(str, [req.session.idd], (er) => {
          if (er) { return res.status(500).json({ error: 'Error deleting data', details: er }); }
          // update strike count count detals od post
          const sql = `UPDATE ${userid}_username_post SET strict = strict + 1 WHERE id = ?`;
          con.query(sql, [postid], (err) => {
            if (err) { return res.status(500).json({ error: 'Error adding data table', details: err }); }
            res.send(true); return; // serve true meane user strike this post
          });
        });
      }
    })
  }
});

//change save post which user reqested
app.post('/:userid/changesave/:postid', (req, res) => {
  const userid = parseInt(req.params.userid);
  const postid = parseInt(req.params.postid);
  if (req.session.login) {
    // select post details
    var str = `select * from \`${req.session.idd}_save\` where id = ? and postid = ?`;
    con.query(str, [userid, postid], (e, r) => {
      if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }
      // if already save means delete the post on save table
      if (r.length > 0) {
        str = `delete from \`${req.session.idd}_save\` where id = ? and postid = ?`;
        con.query(str, [userid, postid], (er) => {
          if (er) { return res.status(500).json({ error: 'Error deleting data', details: er }); }
          res.send(false); return; // false means user not saved
        });
      }
      // if not present insert post details to save table
      else {
        str = `INSERT INTO \`${req.session.idd}_save\` (id, postid) VALUES (?,?)`;
        con.query(str, [userid, postid], (er) => {
          if (er) { return res.status(500).json({ error: 'Error deleting data', details: er }); }
          res.send(true); return; // true means user save post
        });
      }
    })
  }
});

// any post comments added
app.post('/:userid/commentadd/:postid', (req, res) => {
  const userid = parseInt(req.params.userid);
  const postid = parseInt(req.params.postid);
  if (req.session.login) {
    var comment = req.body.comment;
    if (comment != null && comment != '') {
      //insert comment in post comment table
      var str = `INSERT INTO \`${userid}_comnt_${postid}\` (id, comment) VALUES (?,?)`;
      con.query(str, [req.session.idd, comment], (e) => {
        if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }
        // select corrent added comment
        const fetchQuery = `SELECT created_at FROM \`${userid}_comnt_${postid}\` WHERE id = ? ORDER BY created_at DESC LIMIT 1`;
        con.query(fetchQuery, [req.session.idd], (fetchErr, fetchResult) => {
          if (fetchErr) {
            return res.status(500).json({ error: 'Error fetching timestamp', details: fetchErr });
          }
          const data = [];
          // select user details own of current comment 
          var str = `select userurl from users where id = ?`;
          con.query(str, [req.session.idd], (e1, r1) => {
            if (e1) { return res.status(500).json({ error: 'Error selecting user data', details: e1 }); }
            // update post comment number of counting
            str = `UPDATE ${userid}_username_post SET comet = comet + 1 WHERE id = ?`;
            con.query(str, [postid], (err) => {
              if (err) { return res.status(500).json({ error: 'Error selecting user data', details: err }); }
            });
            r1[0].created_at = fetchResult[0].created_at;
            r1[0].comment = comment;
            data.push(r1[0]); 
            // send all comments of data
            res.send(data); return;
          });
        });
      });
    }
  }
});

//check the user current post give strike or not
app.post('/:userid/chackstrike/:postid', (req, res) => {
  const userid = parseInt(req.params.userid);
  const postid = parseInt(req.params.postid);
  if (req.session.login) {
    // select user is present in strike list or not
    var str = `select * from \`${userid}_strt_${postid}\` where id = ?`;
    con.query(str, [req.session.idd], (e, r) => {
      if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }
      if (r.length > 0) { res.send(true); return; } // true means present in strike list
      else { res.send(false); return; } // false means not present in strike list
    })
  }
});

//check the user current post save or not
app.post('/:userid/chacksave/:postid', (req, res) => {
  const userid = parseInt(req.params.userid);
  const postid = parseInt(req.params.postid);
  if (req.session.login) {
    // select post is present in user save list or not
    var str = `select * from \`${req.session.idd}_save\` where id = ? and postid = ?`;
    con.query(str, [userid, postid], (e, r) => {
      if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }
      if (r.length > 0) { res.send(true); return; }
      else { res.send(false); return; }
    })
  }
});

// serve post comments list which reqested from of url
app.post('/:userid/comment/:postid', (req, res) => {
  const userid = parseInt(req.params.userid);
  const postid = parseInt(req.params.postid);
  const start = req.body.start;
  const end = req.body.end;
  if (req.session.login) {
    // select comments list of given range
    const query = `SELECT * FROM \`${userid}_comnt_${postid}\` LIMIT ${end - start} OFFSET ${start}`;

    con.query(query, async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error selecting user data', details: err });
      }

      try {
        // Fetch `userurl` for each result asynchronously, means owner of messages 
        const updatedResults = await Promise.all(results.map(async (row) => {
          const [userResult] = await new Promise((resolve, reject) => {
            con.query('SELECT userurl FROM users WHERE id = ?', [row.id], (error, res) => {
              if (error) reject(error);
              else resolve(res);
            });
          });
          row.userurl = userResult.userurl; // add every message owner url
          return row;
        }));

        res.send(updatedResults);
      } catch (err) {
        res.status(500).json({ error: 'Error fetching user URLs', details: err });
      }
    });
  }
});

//serve all requested list of current login users
app.post('/requested/:start/:end', (req, res) => {
  const start = parseInt(req.params.start);
  const end = parseInt(req.params.end);
  if (req.session.login) {
    // send reqested list of users in given range of list
    let str = `select * from ${req.session.idd}_requested limit ${end - start} offset ${start}`;
    con.query(str, (e, r) => {
      if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }
      if (r.length > 0) {
        // Map over each id to retrieve detailed user information
        const userDataPromises = r.map(row => {
          const userQuery = `SELECT id, userurl, fullname FROM users WHERE id = ?`;
          return new Promise((resolve, reject) => {
            con.query(userQuery, [row.id], (userErr, userResults) => {
              if (userErr) return reject(userErr);
              resolve(userResults[0]); // Resolve with user data
            });
          });
        });

        // Wait for all user data queries to complete
        Promise.all(userDataPromises)
          .then(userData => {
            res.json(userData); // Send collected user data
          })
          .catch(userError => {
            res.status(500).json({ error: 'Error retrieving connected list', details: userError });
          });
      } else {
        res.send(null); // No connections found
      }
    });
  }
});

//get response and allow user aacept connection or rejected
app.post('/response/:desi/:userid', async (req, res) => {
  const desi = req.params.desi;
  const userid = parseInt(req.params.userid);

  if (!req.session.login) {
    return res.status(404).send('File not found 404');
  }

  try {
    // Check if the user exists in the requested table
    let str = `SELECT * FROM \`${req.session.idd}_requested\` WHERE id = ?`;
    const [rows] = await con.promise().query(str, [userid]);

    if (rows.length == 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Delete the request entry
    await con.promise().query(`DELETE FROM \`${req.session.idd}_requested\` WHERE id = ?`, [userid]);

    if (desi === 'accept') {
      // Insert into user's connections and update counts
      await con.promise().query(`INSERT INTO \`${userid}_cong\` (id) VALUES (?)`, [req.session.idd]);
      await con.promise().query(`UPDATE user_profile SET contg_c = contg_c + 1 WHERE id = ?`, [userid]);

      await con.promise().query(`INSERT INTO \`${req.session.idd}_cond\` (id) VALUES (?)`, [userid]);
      await con.promise().query(`UPDATE user_profile SET contd_c = contd_c + 1 WHERE id = ?`, [req.session.idd]);

      return res.json({ success: true, message: 'Request accepted' });
    } else if (desi === 'reject') {
      return res.json({ success: true, message: 'Request rejected' });
    } else {
      return res.status(400).json({ error: 'Invalid operation' });
    }
  } catch (error) {
    console.error('Error executing query:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// serve suggested list of users for connecting
app.post('/suggested/', (req, res) => {

  if (req.session.login) {
    // serve some user list for connection
    let str = `select id, userurl, fullname from users ORDER BY id DESC limit 50 offset 0`;
    con.query(str, (e, r) => {
      if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }
      if (r.length > 0) {

        // filteled already connected users or requsted users
        const userDataPromises = r.map(row => {
          const userQuery = `SELECT id FROM ${req.session.idd}_cong WHERE id = ?`;
          return new Promise((resolve, reject) => {
            con.query(userQuery, [row.id], (userErr, userResults) => {
              if (userErr) return reject(userErr);
              if (userResults.length > 0 || req.session.idd == row.id) { resolve(null); } // Resolve with user data
              str = `select * from ${row.id}_requested where id = ?`;
              con.query(str, [req.session.idd], (err, resu) => {
                if (err) return reject(err);
                if (resu.length > 0) { resolve(null); }
                else { resolve(row); }
              });
            });
          });
        });

        // Wait for all user data queries to complete
        Promise.all(userDataPromises)
          .then(userData => {
            // Filter out null values, keeping only rows with no match
            const filteredUserData = userData.filter(row => row !== null);
            res.json(filteredUserData); // Send the filtered user data
          })
          .catch(userError => {
            res.status(500).json({ error: 'Error retrieving connected list', details: userError });
            console.error('Error executing query:', userError);
          });

      } else {
        res.send(null); // No connections found
      }
    });
  }
});

// serve random post list to users 
app.post('/dashboard/:start', async (req, res) => {
  if (!req.session.login) {
    return res.redirect('/');
  }

  try {
    let start = parseInt(req.params.start);
    let j = 0;
    let temp = true;

    const data = [];

    while (temp) {
      // select random users
      const userQuery = `SELECT id, userurl FROM users ORDER BY RAND() LIMIT 10 OFFSET ${start}`;
      const users = await new Promise((resolve, reject) => {
        con.query(userQuery, (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        });
      });

      if (users.length == 0) {
        const filteredUserData = data.filter(row => row !== null);
        return res.send(filteredUserData);
      }
      // select some recent post of selected users and serve
      for (const user of users) {
        const postQuery = `SELECT id, usignal FROM ${user.id}_username_post ORDER BY id DESC LIMIT 1 OFFSET ${j}`;
        const post = await new Promise((resolve, reject) => {
          con.query(postQuery, (err, results) => {
            if (err) {
              return reject(err);
            }
            if (results.length > 0) {
              results[0].userid = user.id;
              results[0].userurl = user.userurl;
              resolve(results[0]);
            }
            else {
              resolve(null);
            }
          });
        });
        data.push(post);
      }
      const filteredUserData = data.filter(row => row !== null); // remove all null value
      // if post list lenth is more then 10 send it overwise more addedd
      if (filteredUserData.length > 10) { 
        return res.send(filteredUserData);
      } else {
        j++;
        continue;
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Error processing data', details: error });
    console.log({ error: 'Error processing data', details: error });
  }
});

// serve all save post to users
app.post('/savedata/:start', async (req, res) => {

  let start = parseInt(req.params.start);
  let j = 0;
  let temp = true;
  if (req.session.login) {
    const data = [];
    // select save list of current login user
    const userQuery = `SELECT id, postid FROM ${req.session.idd}_save ORDER BY created_at DESC LIMIT 10 OFFSET ${start}`;
    const users = await new Promise((resolve, reject) => {
      con.query(userQuery, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });

    if (users.length == 0) {
      return res.send(null);
    }
    // fetch saved post data with owener of post 
    for (const user of users) {
      const postQuery = `SELECT id, usignal FROM ${user.id}_username_post where id = ?`;
      const post = await new Promise((resolve, reject) => {
        con.query(postQuery, [user.postid], (err, results) => {
          if (err) {
            return reject(err);
          }
          var str = `select userurl from users where id = ?`;
          con.query(str, [user.id], (error, resu) => {
            if (error) {
              return reject(error);
            }
            if (results.length > 0 && resu.length > 0) {
              results[0].userurl = resu[0].userurl;
              results[0].userid = user.id;
              resolve(results[0]);
            }
            else {
              resolve(null);
            }
          });
        });
      });
      data.push(post);
    }
    const filteredUserData = data.filter(row => row !== null); // remove all null value and send it
    return res.send(filteredUserData);
  }
});



module.exports = app;