'use strict';
(function(){
 const root='/api/research-network';
 let token=null;
 function setToken(value){token=typeof value==='string'&&value?value:null;}
 function clearToken(){token=null;}
 async function request(path,{method='GET',body,auth=false}={}){
  if(auth&&!token)throw Error('Sign in to continue');
  const headers={Accept:'application/json'};
  if(body!==undefined)headers['Content-Type']='application/json';
  if(auth)headers.Authorization='Bearer '+token;
  const response=await fetch(root+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',credentials:'omit'});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(response.status===401?'Session expired. Please sign in again.':payload.error||'Request failed');
  return payload;
 }
 window.FemmieResearch={setToken,clearToken,request};
})();
