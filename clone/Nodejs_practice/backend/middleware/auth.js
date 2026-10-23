import jwt from "jsonwebtoken"

const auth = (req,res,next)=>{
//     if(req.headers.authorization==process.env.SECRET_KEY){
//             next()
//     }
//     else{
//             res.status(401).json({error:"Not Allowed"})
//     }
try {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (!authHeader) {
          return res.status(401).json({ error: "Authorization header is missing" });
      }
      const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
      next();
} catch (error) {
      return res.status(401).json({ error: "invalid token" });
}
}

export default auth;