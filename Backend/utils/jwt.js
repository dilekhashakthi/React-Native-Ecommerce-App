const jwt = require("jsonwebtoken");

function generateToken(
  res,
  userId,
  secret = process.env.JWT_SECRET,
  expiresIn = process.env.JWT_EXPIRES_IN,
) {
  const token = jwt.sign({ userId }, secret, { expiresIn });

  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

module.exports = generateToken;