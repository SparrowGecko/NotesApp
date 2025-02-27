require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json()); // parse incoming JSON request to acces req.body in API routes
app.use(cookieParser()); // to read cookies

// routes
app.use('/auth', authRoutes);  // Authentication routes
app.use('/notes', notesRoutes);

// Serve static files from client directory
app.use(express.static(path.resolve(__dirname, '../client')));
 
app.get('/', (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../client/index.html'));
});
app.get('/secret', (req, res) => {
    return res.sendFile(path.join(__dirname, '../client/secret.html'));
  });

// Test route
app.get('/test', (req, res) => {
    res.send("Server is running...");
});

// global error handler
app.use((err, req, res, next) => {
    const defaultErr = {
        log: 'Express error handler caught unknown middleware error',
      status: 500,
      message: { err: 'An error occurred' },
    };
    const errorObj = Object.assign({}, defaultErr, err);
    console.log(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));