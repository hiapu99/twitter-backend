const jwt = require('jsonwebtoken');

const ensureAuthorization = async (req, res, next) => {
    // Access the Authorization header
    const authHeader = req.headers['authorization'];

    // Check if the Authorization header is present
    if (!authHeader) {
        return res.status(400).json({
            success: false,
            msg: "JWT token is required"
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);

        // Attach the decoded user information to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            success: false,
            msg: "Invalid or expired token"
        });
    }
};

module.exports = ensureAuthorization;
