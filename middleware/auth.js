const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.log('No token provided'); // Add logging
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Failed to authenticate token'); // Add logging
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }
        req.user = decoded;
        console.log(`Authenticated user: ${JSON.stringify(decoded)}`); // Add logging
        next();
    });
};

module.exports = { verifyToken };