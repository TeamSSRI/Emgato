// /backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path')
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Security Middlewares
app.use(helmet()); // Protects against well-known vulnerabilities by setting HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(cors({ origin: 'http://localhost:8080', credentials: true })); // Restricting CORS for frontend server
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
}));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Server is running securely');
});

app.post('/register', async (req, res) => {
    // to-do: save user onto DB
    const userSignupInfo = req.body;
    console.log(userSignupInfo);
    const username = userSignupInfo.username;
    const pw = userSignupInfo.password;

    if(!username || !pw) {
        res.status(400).send();
        return;
    }

    const userInfo = {
        username,
        password: pw
    };
    const result = await db.collection('user').insertOne(userInfo);
    // res.status(200).json(result);
    // redirect UI
    res.redirect('http://localhost:3000/login');
});

let db = null;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
    db = mongoose.connection;
}).catch((err) => console.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
