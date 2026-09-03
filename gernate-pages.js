#!/usr/bin/env node
"use strict";
const fs=require("fs");
const path=require("path");
const vm=require("vm");

const ROOT=__dirname;
const runtimePath=path.join(ROOT,"assets","omniforge-runtime.js");
const runtime=fs.readFileSync(runtimePath,"utf8");
const sandbox={console,crypto:{subtle:{digest(){}}},TextEncoder};
vm.createContext(sandbox);
vm.runInContext(runtime,sandbox);
const tools=sandbox.__OMNIFORGE_REGISTRY__;
if(!Array.isArray(tools)||tools.length!==1563) throw new Error("Registry validation failed: "+(tools&&tools.length));

const slugify=t=>String(t.name).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")+"-"+t.id;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const jsonSafe=o=>JSON.stringify(o).replace(/</g,"\\u003c").replace(/>/g,"\\u003e").replace(/&/g,"\\u0026");
const keywordList=t=>{
  const n=t.name.toLowerCase(), s=(t.sub||"").toLowerCase(), c=(t.cat||"").toLowerCase();
  return [n+" online",n+" free",n+" free online",n+" no signup","free "+s+" tool","browser "+n,c+" tools online","privacy friendly "+n,"instant "+n].join(", ");
};
const title=t=>{
  let x=`${t.name} | Free Online ${t.sub||"Tool"} — OmniForge`;
  return x.length<=60?x:`${t.name} — Free Online Tool | OmniForge`;
};
const description=t=>{
  let x=`Use ${t.name.toLowerCase()} online for free. ${t.desc} No signup required. Fast browser-based processing.`;
  return x.length<=160?x:x.slice(0,157).replace(/\s+\S*$/,"")+"...";
};
const today=new Date().toISOString().slice(0,10);

const pageTemplate=(t,related)=>`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title(t))}</title>
<meta name="description" content="${esc(description(t))}">
<meta name="keywords" content="${esc(keywordList(t))}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="https://omniforge.pro/tools/${esc(slugify(t))}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title(t))}">
<meta property="og:description" content="${esc(description(t))}">
<meta property="og:url" content="https://omniforge.pro/tools/${esc(slugify(t))}/">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title(t))}">
<meta name="twitter:description" content="${esc(description(t))}">
<link rel="stylesheet" href="../../assets/omniforge.css">
<style>
.tool-shell{max-width:1000px;margin:auto;padding:22px}.tool-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center}.brand{font-weight:900;color:#ffd700;text-decoration:none}.crumbs{color:#999;font-size:.82rem;margin:20px 0}.seo{border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:22px;background:rgba(255,255,255,.03);margin:20px 0}.seo h1{font-size:clamp(1.7rem,4vw,3rem);margin:0 0 12px;color:#ffd700}.seo p{color:#aaa;line-height:1.7}.field{margin:14px 0}.field label{display:block;color:#aaa;margin-bottom:7px}.field input,.field textarea{width:100%;box-sizing:border-box;background:#000;color:#fff;border:1px solid rgba(255,215,0,.35);border-radius:12px;padding:13px;font:inherit}.field textarea{min-height:150px}.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{border:0;border-radius:999px;padding:11px 17px;font-weight:800;cursor:pointer}.run{background:#00ff88;color:#00150c}.copy{background:#ffd700;color:#151000}.ad{margin:20px 0;padding:15px;border:1px solid rgba(255,215,0,.2);border-radius:15px}.ad a{display:inline-block;color:#000;background:#ffd700;padding:9px 14px;border-radius:999px;text-decoration:none;font-weight:800}.out{white-space:pre-wrap;overflow:auto;background:#050505;border:1px solid #222;border-radius:14px;padding:16px;margin-top:16px;min-height:70px}.related a{display:block;color:#ffd700;padding:7px 0}.search{width:100%;padding:12px;border-radius:12px;border:1px solid #333;background:#090909;color:#fff;margin:12px 0}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head>
<body>
<main class="tool-shell">
<div class="tool-top"><a class="brand" href="../../">⚡ OmniForge</a><a class="glass-pill black" href="../../">← All Tools</a></div>
<div class="crumbs"><a href="../../">OmniForge</a> / ${esc(t.cat)} / ${esc(t.sub)} / ${esc(t.name)}</div>
<section class="seo">
<h1>${esc(t.name)}</h1>
<p>${esc(t.desc)}</p>
<p><strong>Free online ${esc((t.sub||"").toLowerCase())} tool:</strong> Enter your values below and run the calculation or transformation directly in your browser. No signup is required.</p>
</section>
<section class="glass-card" style="padding:20px">
<div id="fields"></div>
<div class="actions"><button class="btn run" id="run">Run Tool</button><button class="btn copy" id="copy">Copy Result</button></div>
<pre class="out" id="out">Ready. Enter your values and press Run Tool.</pre>
</section>
<div class="ad"><strong>Sponsored</strong><p style="color:#aaa">Support this free tool by exploring a sponsor offer.</p><a href="https://www.effectivecpmnetwork.com/x0wcj4zk?key=c2b46070b44982014166acafd6074c3d" target="_blank" rel="sponsored noopener noreferrer">Open Sponsor</a></div>
<section class="seo">
<h2>How to use ${esc(t.name)}</h2>
<p>Enter the required values, then select <strong>Run Tool</strong>. The result is generated in your browser using the registered OmniForge engine for this tool.</p>
<h2>Privacy-first processing</h2>
<p>This dedicated page is designed for local browser execution. Inputs are passed to the selected client-side engine and are not intentionally uploaded by OmniForge.</p>
</section>
<section class="related"><h2>Related tools</h2><input class="search" id="search" placeholder="Search ${tools.length.toLocaleString()} tools...">${related.map(r=>`<a href="../${slugify(r)}/">${esc(r.name)}</a>`).join("")}<div id="searchResults"></div></section>
</main>
<script src="../../assets/omniforge-runtime.js"></script>
<script>
const TOOL=${jsonSafe(t)};
const $=s=>document.querySelector(s);
const fieldsEl=$("#fields");
const out=$("#out");
const esc2=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
(TOOL.fields||[]).forEach(f=>{
  const d=document.createElement("div");d.className="field";
  const l=document.createElement("label");l.textContent=f.l||f.k;d.appendChild(l);
  const i=document.createElement(f.t==="textarea"?"textarea":"input");
  if(f.t!=="textarea")i.type=f.t==="number"?"number":"text";
  i.id="f_"+f.k;i.placeholder=f.p||f.placeholder||f.l||"Enter value";
  d.appendChild(i);fieldsEl.appendChild(d);
});
if(!TOOL.fields.length)fieldsEl.innerHTML="<p style='color:#999'>No input required. Press Run Tool.</p>";
$("#run").onclick=async()=>{
  const d={...TOOL};
  (TOOL.fields||[]).forEach(f=>d[f.k]=$("#f_"+f.k)?.value??"");
  out.textContent="Processing...";
  try{const r=await E[TOOL.engine](d);out.textContent=typeof r==="object"?JSON.stringify(r,null,2):String(r);}
  catch(e){out.textContent="Error: "+(e?.message||e);}
};
$("#copy").onclick=async()=>{try{await navigator.clipboard.writeText(out.textContent);alert("Result copied");}catch(e){alert("Copy failed");}};
$("#search").addEventListener("input",e=>{
  const q=e.target.value.trim().toLowerCase(),box=$("#searchResults");
  if(!q){box.innerHTML="";return;}
  const res=MasterRegistry.filter(x=>(x.name+" "+x.cat+" "+x.sub).toLowerCase().includes(q)).slice(0,20);
  box.innerHTML=res.map(x=>'<a href="../'+slugify(x)+'/">'+esc2(x.name)+'</a>').join("")||"<p style='color:#999'>No matching tools.</p>";
});
</script>
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":t.name+" — OmniForge","url":"https://omniforge.pro/tools/"+slugify(t)+"/","description":t.desc,"applicationCategory":"UtilitiesApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}})}</script>
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Is "+t.name+" free?","acceptedAnswer":{"@type":"Answer","text":"Yes. The OmniForge "+t.name+" tool is available online without signup."}},{"@type":"Question","name":"Does "+t.name+" work in a browser?","acceptedAnswer":{"@type":"Answer","text":"Yes. The dedicated page runs its registered client-side engine in a modern browser."}}]})}</script>
</body></html>`;

const toolsDir=path.join(ROOT,"tools");
for(const t of tools){
  const rel=tools.filter(x=>x.cat===t.cat && x.id!==t.id).slice(0,8);
  const dir=path.join(toolsDir,slugify(t));
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,"index.html"),pageTemplate(t,rel));
}

const urls=[
  `<url><loc>https://omniforge.pro/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  ...tools.map(t=>`<url><loc>https://omniforge.pro/tools/${slugify(t)}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
];
fs.writeFileSync(path.join(ROOT,"sitemap.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT,"robots.txt"),`User-agent: *\nAllow: /\nSitemap: https://omniforge.pro/sitemap.xml\n`);
console.log(`Generated ${tools.length} dedicated tool pages.`);
