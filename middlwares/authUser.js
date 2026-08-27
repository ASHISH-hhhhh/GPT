import jwt from "jsonwebtoken";

const authenticateUser = async (req, res, next) => {
  try {
    const payload = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    console.log("Here:", payload);
    if (!payload) {
      return res.status(401).json({ message: "In valid token credentials" });
    }
    req.payload = payload;
    next();
  } catch (error) {
    console.log("In authUser.js", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export default authenticateUser;
