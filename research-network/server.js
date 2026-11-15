'use strict';
const express=require('express');
const {TOPICS,dedupeNews,matchMembers,createDraft,transition}=require('./engine');
const router=express.Router();
router.use(express.json({limit:'50kb'}));
const drafts=new Map(); // Development-only; replace with persistent storage before production.
const demoMembers=[
{id:'m1',displayName:'Amina',interests:['Cooking','Nutrition'],matchingConsent:true,discoverable:true},
{id:'m2',displayName:'Jordan',interests:['Skincare','Emotional Wellness'],matchingConsent:true,discoverable:true},
{id:'m3',displayName:'Taylor',interests:['Cooking','Pet Care'],matchingConsent:false,discoverable:false}
];
function requireAdmin(req,res,next){if(process.env.NODE_ENV==='production')return res.status(503).json({error:'Admin identity integration is not configured'});if(req.get('x-demo-admin')!=='true')return res.status(403).json({error:'Demo admin header required'});req.admin={id:'development-admin',isAdmin:true};next();}
router.get('/topics',(_req,res)=>res.json({topics:TOPICS}));
router.get('/members',(_req,res)=>res.json({notice:'Demo data only; no private profile fields exposed',members:demoMembers.filter(m=>m.discoverable).map(({id,displayName,interests})=>({id,displayName,interests}))}));
router.post('/matches',(req,res)=>res.json({matches:matchMembers(req.body.viewer,demoMembers)}));
router.get('/news',(_req,res)=>res.json({items:[...drafts.values()].filter(d=>d.status==='Published')}));
router.get('/admin/drafts',requireAdmin,(_req,res)=>res.json({items:[...drafts.values()]}));
router.post('/admin/import',requireAdmin,(req,res)=>{const items=dedupeNews(Array.isArray(req.body.items)?req.body.items:[]);let added=0;for(const item of items){const d=createDraft(item);if(!drafts.has(d.id)){drafts.set(d.id,d);added++;}}res.json({added,total:drafts.size});});
router.patch('/admin/drafts/:id',requireAdmin,(req,res)=>{const d=drafts.get(req.params.id);if(!d)return res.status(404).json({error:'Not found'});try{const updated=transition({...d,summary:typeof req.body.summary==='string'?req.body.summary:d.summary},req.body.status,req.admin);drafts.set(d.id,updated);res.json(updated);}catch(e){res.status(400).json({error:e.message});}});
module.exports=router;
