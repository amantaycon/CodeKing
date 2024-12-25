const express = require('express');
const app = express.Router();
const con = require('../mysqlcon');
con.connect((err) => { if (err) { console.error('Error connecting to MySQL:', err); return; } });

// serve search page 
app.get('/search', (req, res) => {
    if (req.session.login) {
        const data = { userurl: req.session.userurl, fullname: req.session.fullname, id: req.session.idd, click: 2 };
        res.render('search.ejs', { data });
    }
    else { res.redirect('/login'); }
});

// serve searched data 
app.post('/search/:search_word/:signal', async (req, res) => {
    const signal = parseInt(req.params.signal); // read signal = 1 to deside user corrently on search bar signal = 2 decide user want to complete search results
    const word = req.params.search_word; //store serched word given by user 
    if (!word || !signal || !req.session.login) {
        return res.send(false);
    }


    // SQL query with exact match prioritized over partial matches
    const query = `
              SELECT id, userurl, fullname
              FROM users
              WHERE userurl LIKE ? OR fullname LIKE ?
              ORDER BY 
                (userurl = ? OR fullname = ?) DESC,  -- Exact match priority
                (userurl LIKE ? OR fullname LIKE ?) DESC  -- Partial match next
              LIMIT 10;
            `;

    // Prepare query parameters
    const exactMatch = word;
    const partialMatch = `%${word}%`;

    con.query(query, [
        partialMatch, partialMatch,
        exactMatch, exactMatch,
        partialMatch, partialMatch
    ], (e, r) => {
        if (e) { return res.status(500).json({ error: 'Error selecting user data', details: e }); }
        //signal = 1 to deside user corrently on search bar return only user list
        if (signal == 1) {
            res.json(r);
        // signal = 2 decide user want to complete search results
        } else if (signal == 2) {
            const data = [];
            data.push(r); // id user list which match

            const str = `SELECT id, userurl FROM users ORDER BY id DESC LIMIT 10 OFFSET 0`;
            con.query(str, (er, re) => {
                if (er) {
                    return res.status(500).json({ error: 'Error selecting user data', details: er });
                }
                if (re.length == 0) {
                    res.send(data); // send data if no more data availble on search word
                }

                // find post matched data 
                const promises = re.map(row => {
                    const sql = `
            SELECT id, usignal
            FROM ${row.id}_username_post
            WHERE filename LIKE ? OR title LIKE ?
            ORDER BY 
              (filename = ? OR title = ?) DESC,  -- Exact match priority
              (filename LIKE ? OR title LIKE ?) DESC  -- Partial match next
            LIMIT 10`;

                    return new Promise((resolve, reject) => {
                        con.query(sql, [
                            partialMatch, partialMatch,
                            exactMatch, exactMatch,
                            partialMatch, partialMatch
                        ], (err, ree) => {
                            if (err) return reject(err);
                            if (ree.length > 0) { ree[0].userid = row.id; ree[0].userurl = row.userurl; resolve(ree); }
                            else { resolve(null); }
                        });
                    });
                });

                Promise.all(promises)
                    .then(results => {
                        const filteredData = results.filter(result => result !== null); // Remove null values
                        data.push(filteredData);
                        res.json(data); // send complete data
                    })
                    .catch(error => {
                        console.log({ error: 'Error selecting user data', details: error });
                        res.status(500).json({ error: 'Error selecting user data', details: error })
                    });
            });
        }
    });
});


module.exports = app;