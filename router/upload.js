const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express.Router();
const con = require('../mysqlcon');

con.connect((err) => { if (err) { console.error('Error connecting to MySQL:', err); return; } });


// Set up storage for multer to save files in directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../userdata/' + req.session.idd + '_username'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer
const upload = multer({ storage: storage });

// Endpoint to handle file uploads
app.post('/uploadpostdata', upload.single('data'), (req, res) => {
    if (req.session.login) {
        const { signal, title, privacy } = req.body;
        const file = req.file;

        try {
            // chake upload file type exit or not
            switch (parseInt(signal)) {
                case 1: // Image upload
                case 2: // Video upload
                case 3: // File upload
                    if (!file) {
                        return res.status(400).json({ message: 'No file uploaded' });
                    }
                    break;
                case 4: // Generated image
                    if (!file) {
                        return res.status(400).json({ message: 'No generated image data found' });
                    }
                    break;
                case 5: // Code upload (text-based)
                    if (!file) {
                        return res.status(400).json({ message: 'No code content provided' });
                    }
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid signal value' });
            }
            // insert post detail to database and create nessary table for required post data
            var sql = `INSERT INTO \`${req.session.idd + '_username_post'}\` (filename, fullpath, title, usignal, privacy) VALUES (?,?,?,?,?)`;
            con.query(sql, [file.filename, file.path, title, parseInt(signal), parseInt(privacy)], (err, result) => {
                if (err) { return res.status(500).json({ error: 'Error creating table', details: err }); }
                sql = `UPDATE user_profile SET post_c = post_c + 1 WHERE id = ?`;
                con.query(sql, [req.session.idd], (err) => {
                    if (err) { return res.status(500).json({ error: 'Error adding data table', details: err }); }
                    res.send("Upload successful");
                });
                const userId = req.session.idd;
                const postId = result.insertId;
                const sql1 = `CREATE TABLE IF NOT EXISTS \`${userId}_strt_${postId}\` (id INT PRIMARY KEY)`;
                con.query(sql1, (err) => {
                    if (err) { console.error('Error executing query:', err); return; }
                });
                const sql3 = `CREATE TABLE IF NOT EXISTS \`${userId}_comnt_${postId}\` (id INT, comment varchar(1000), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
                con.query(sql3, (err) => {
                    if (err) { console.error('Error executing query:', err); return; }
                });
            });
        } catch (error) {
            res.status(500).json({ message: 'Upload failed', error: error.message });
        }
    } else { res.status(403).send('forbinned 403'); }
});



// Set up storage1 for multer to save message media in directory
const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../messagedata/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer
const upload1 = multer({ storage: storage1 });

// upload messages data
app.post('/uploadmessagedata', upload1.single('data'), (req, res) => {
    if (req.session.login) {
        const { signal, title, userid } = req.body; // Receive attached more data
        const file = req.file;

        try {
            // chake upload file type exit or not
            switch (parseInt(signal)) {
                case 1: // Image upload
                case 2: // Video upload
                case 3: // File upload
                    if (!file) {
                        return res.status(400).json({ message: 'No file uploaded' });
                    }
                    break;
                case 4: // Generated image
                    if (!file) {
                        return res.status(400).json({ message: 'No generated image data found' });
                    }
                    break;
                case 5: // Code upload (text-based)
                    if (!file) {
                        return res.status(400).json({ message: 'No code content provided' });
                    }
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid signal value' });
            }
            // select address of chatbox
            var str = `select address from ${req.session.idd}_message where userid = ${userid}`;
            con.query(str, (error, result1) => {
                if (error) { return console.error({ error: 'Error creating table', details: error }); }
                if (result1.length > 0) {

                    const sourcePath = file.path;
                    const destinationPath = path.join(__dirname, `../messagedata/${result1[0].address}/${file.filename}`);

                    // Move the file to the address chatbox directory
                    fs.rename(sourcePath, destinationPath, (err) => {
                        if (err) {
                            console.error('Error moving file:', err);
                            return res.status(500).send('Error moving file');
                        }
                        file.path = destinationPath;
                    });

                    // insert message detail to database 
                    var sql = `INSERT INTO \`${result1[0].address}\` (messages, messignal, datalink, userid) VALUES (?,?,?,?)`;

                    con.query(sql, [title, parseInt(signal), file.filename, req.session.idd], (err, result) => {
                        if (err) { return res.status(500).json({ error: 'Error creating table', details: err }); }

                        // increment of messages count
                        sql = `UPDATE ${userid}_message SET countmes = countmes + 1 WHERE userid = ?`;
                        con.query(sql, [req.session.idd], (err) => {
                            if (err) { return res.status(500).json({ error: 'Error adding data table', details: err }); }
                            var data = { userid: req.session.idd, messageid: result.insertId };
                            res.send(data); // send insertd data details
                            return;
                        });
                    });
                }
                else { return console.error({ error: 'Message address not found' }); }
            })

        } catch (error) {
            res.status(500).json({ message: 'Upload failed', error: error.message });
        }
    } else { res.status(403).send('forbinned 403'); }
});

module.exports = app;