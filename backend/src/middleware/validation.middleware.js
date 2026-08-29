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
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  // Validate full name length
  if (fullName.trim().length < 2) {
    return res
      .status(400)
      .json({ message: "Full name must be at least 2 characters" });
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

  if (profilePic.startsWith("data:")) {
    const allowedTypes = [
      "data:image/jpeg;",
      "data:image/png;",
      "data:image/webp;",
    ];

    const isValidType = allowedTypes.some((type) =>
      profilePic.startsWith(type),
    );

    if (!isValidType) {
      return res.status(400).json({
        message: "Only JPEG, PNG, and WebP images are allowed",
      });
    }
    const base64Size = Buffer.byteLength(profilePic, "utf8");
    if (base64Size > 500 * 1024) {
      return res.status(413).json({
        message: "Profile picture must be smaller than 500KB",
      });
    }
  } else if (!profilePic.startsWith("http")) {
    return res.status(400).json({
      message: "Invalid profile picture format",
    });
  }

  next();
};
