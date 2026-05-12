/**
 * Validation middleware for common fields
 */

export const validateSignup = (req, res, next) => {
    const { fullName, email, password } = req.body;

    // Check required fields
    if (!fullName?.trim()) {
        return res.status(400).json({ message: "Full name is required" });
    }
    if (!email?.trim()) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Validate full name length
    if (fullName.trim().length < 2) {
        return res.status(400).json({ message: "Full name must be at least 2 characters" });
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email?.trim()) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    next();
};

export const validateUpdateProfile = (req, res, next) => {
    const { profilePic } = req.body;

    if (!profilePic) {
        return res.status(400).json({ message: "Profile picture is required" });
    }

    // Check if it's a valid data URL or URL
    if (!profilePic.startsWith('data:') && !profilePic.startsWith('http')) {
        return res.status(400).json({ message: "Invalid profile picture format" });
    }

    next();
};
