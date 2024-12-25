const express = require('express');
const app = express();
const con = require('./mysqlcon');
const port = 3000;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const WebSocket = require('ws');


// const { geHaNum, checkLogin } = require('./router/function');

// set session for all users
sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "defaultSecret", // Load secret from environment
  resave: false,
  saveUninitialized: false, // Only save sessions when there’s data
  cookie: {
    secure: false, // Set secure to true in production
    maxAge: 1000 * 60 * 60  // Optional: Set a maximum age for the session (e.g., 1 hour)
  }
});

app.use(sessionMiddleware);

// create table to store all login user details it create onle at once
con.connect((err) => {
  if (err) { console.error('Error connecting to MySQL:', err); return; }
  var columns = `id INT AUTO_INCREMENT PRIMARY KEY,
      fullname VARCHAR(255),
      username VARCHAR(50) UNIQUE,
      userurl VARCHAR(100) UNIQUE,
      passwd VARCHAR(500),
      email VARCHAR(255) UNIQUE NOT NULL,
      profile_photo_url VARCHAR(500),
      gender INT DEFAULT 0,
      dob DATE,
      bio TEXT,
      notification INT DEFAULT 0, -- count a number notification
      theme INT DEFAULT 0,  -- Assuming a number corresponds to different themes
      account_status TINYINT DEFAULT 0,  -- 0: Active, 1: Deactivated, 2: Suspended
      account_type TINYINT DEFAULT 0,  -- 0: private, 1: public
      conshow TINYINT DEFAULT 0,  -- 0: Public, 1: Private, 2: Friends only
      message_privacy TINYINT DEFAULT 0,  -- 0: Anyone, 1: connection only, 3: Requested
      strict int8,
      skey varchar(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;

  var sql = `CREATE TABLE IF NOT EXISTS users (${columns})`;
  con.query(sql, (err) => {
    if (err) { console.error({ error: 'Error creating users table', details: err }); return; }
    columns = `id INT PRIMARY KEY,
      post_c int default 0,
      contd_c int default 0,
      contg_c int default 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    sql = `CREATE TABLE IF NOT EXISTS user_profile (${columns})`;
    con.query(sql, (err) => {
      if (err) { console.error({ error: 'Error creating users table', details: err }); return; }
    });
  });
});

// Serve static files (like images, CSS, JavaScript) from the 'public' directory
app.use(express.static('public'));

// Set the template engine to EJS (Embedded JavaScript) for rendering views
app.set('view engine', 'ejs');

// Middleware to parse JSON bodies from incoming requests
app.use(bodyParser.json());

// Middleware to parse URL-encoded bodies (form submissions) from incoming requests
// The 'extended: true' option allows for rich objects and arrays to be encoded
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse cookies from the request headers
app.use(cookieParser());

// Middleware to parse JSON bodies from incoming requests (alternative to bodyParser.json())
app.use(express.json());

// Middleware to handle all routes related to user login
app.use('/', require('./router/login'));

// Middleware to manage user settings and preferences
app.use('/', require('./router/setting'));

// Middleware to handle the uploading of posts
app.use('/', require('./router/upload'));

// Middleware for Communicate eachother
app.use('/', require('./router/messages'));

// Middleware for searching user and data
app.use('/', require('./router/search'));

// Middleware for viewing user profiles and posts
app.use('/', require('./router/userurl_data_prosessing'));





app.get('/', (req, res) => {
  
  if (req.session.login) {
    var data = { userurl: req.session.userurl };
    data.click = 1;
    res.render("dashboard", { data }); // serve dashboard
  } else {
    // serve intro page with random themes
    var num = Math.floor(Math.random() * 7);
    const themes = ['defaulthemes.css', 'deep_black.css', 'colors_of_nature.css', 'crystal_white.css', 'hot_pink_evening.css', 'rosy_retreat.css', 'simple_light.css'];
    var data = { theme: themes[num] };
    res.render('intro', { data });
  }
});




const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

const wss = new WebSocket.Server({ noServer: true });

// Middleware wrapper for WebSocket
const wrap = (middleware) => (req, res, next) => middleware(req, {}, next);

// Handle HTTP to WebSocket upgrade
server.on('upgrade', (req, socket, head) => {
  // Prevent multiple upgrades for the same socket
  if (socket.upgraded) {
    socket.destroy();
    return;
  }
  socket.upgraded = true;

  wrap(sessionMiddleware)(req, {}, (err) => {
    if (err || !req.session) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });
});

const activeConnections = new Map(); // Track user ID -> WebSocket mapping

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  var userId = 0;
  if (req.session && req.session.login) {
    activeConnections.set(req.session.idd, ws);
    userId = req.session.idd;
  } else {
    ws.send('Unauthorized');
    ws.close();
  }

  // Handle incoming messages
  ws.on('message', (message) => {
    // Parse the message to identify the recipient
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message); // Expect JSON format
    } catch (e) {
      ws.send('Error: Invalid message format. Use JSON.');
      return;
    }
    const { recipientId, signal, content } = parsedMessage;

    if (!recipientId || !content || !signal) {
      ws.send('Error: Message must contain recipientId and content and signal.');
      return;
    }

    // Find the recipient's WebSocket connection
    const recipientWs = activeConnections.get(recipientId);

    if (recipientWs) {
      // Deliver the message to the recipient
      recipientWs.send(JSON.stringify({
        userId: userId,
        signal,
        content,
      }));
    } else {
      ws.send('offline');
    }
  });

  // Handle WebSocket disconnection
  ws.on('close', () => {
    activeConnections.delete(userId); // Remove user from active connections
  });
});



app.use((req, res) => {
  res.status(404).render('404');
});
