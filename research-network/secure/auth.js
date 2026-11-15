'use strict';
const crypto=require('node:crypto');
function verifyJwt(token,secret,{issuer,audience}={}){
 if(!secret||Buffer.byteLength(secret)<32)throw Error('JWT verification is not configured');
 if(typeof token!=='string'||token.length>8192)throw Error('Invalid token');
 const parts=token.split('.');if(parts.length!==3)throw Error('Invalid token');
 const [head,body,signature]=parts;
 const header=JSON.parse(Buffer.from(head,'base64url').toString('utf8'));
 if(header.alg!=='HS256'||header.typ!=='JWT')throw Error('Unsupported token');
 const expected=crypto.createHmac('sha256',secret).update(head+'.'+body).digest();
 const supplied=Buffer.from(signature,'base64url');
 if(supplied.length!==expected.length||!crypto.timingSafeEqual(supplied,expected))throw Error('Invalid signature');
 const claims=JSON.parse(Buffer.from(body,'base64url').toString('utf8'));
 const now=Math.floor(Date.now()/1000);
 if(!Number.isInteger(claims.exp)||claims.exp<=now||!Number.isInteger(claims.iat)||claims.iat>now+60||claims.exp-claims.iat>3600)throw Error('Expired or invalid token');
 if(typeof claims.sub!=='string'||!claims.sub||claims.iss!==issuer||claims.aud!==audience)throw Error('Invalid claims');
 return {id:claims.sub,role:claims.role==='admin'?'admin':'member'};
}
function authenticate(req,res,next){try{const bearer=req.get('authorization')||'';if(!bearer.startsWith('Bearer '))throw Error('Bearer token required');req.identity=verifyJwt(bearer.slice(7),process.env.FEMMIE_JWT_HS256_SECRET,{issuer:process.env.FEMMIE_JWT_ISSUER,audience:process.env.FEMMIE_JWT_AUDIENCE});next();}catch{res.status(401).json({error:'Authentication required'});}}
function adminOnly(req,res,next){if(req.identity?.role!=='admin')return res.status(403).json({error:'Admin access required'});next();}
module.exports={verifyJwt,authenticate,adminOnly};
