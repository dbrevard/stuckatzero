const Q=[
 {id:"restrict",t:"Restrictions column: any copyright claim, 'Made for kids', age-restriction or ads-review label?",h:"Studio > Content > Restrictions column. These quietly stop Shorts-feed testing.",o:[["none","None"],["copyright","Copyright claim"],["kids","Made for kids / comments auto-off"],["other","Age / other restriction"]]},
 {id:"impr",t:"Analytics > Reach: Shorts feed impressions / 'Shown in feed'?",h:"0 = never tested. Low number = tested, viewers swiped.",o:[["zero","0"],["low","Under 100"],["some","100 or more"],["unsure","Can't find it"]]},
 {id:"swipe",t:"Engagement: 'Viewed vs swiped away' – what % stayed to watch?",h:"Shown once the Short gets some feed views.",o:[["na","No data yet"],["bad","Under 50% stayed"],["ok","50–70%"],["good","Over 70%"]]},
 {id:"age",t:"How long since it went public?",h:"Realtime stats can lag; YouTube has had confirmed analytics bugs. Don't delete early.",o:[["lt24","Under 24 hours"],["d2","1–3 days"],["gt3","More than 3 days"]]},
 {id:"chan",t:"Are your other recent Shorts also at 0?",h:"Many in a row points to a channel-level issue, not this video.",o:[["one","Just this one"],["few","2–4 in a row"],["all","5+ in a row / all"]]}
];
const qs=document.getElementById("qs");
Q.forEach(q=>{const d=document.createElement("div");d.className="q";d.innerHTML=`<b>${q.t}</b><div class="hint">${q.h}</div>`+q.o.map(([v,l])=>`<label><input type="radio" name="${q.id}" value="${v}"> ${l}</label>`).join("");qs.appendChild(d)});
let meta=null;
function vid(u){const m=u.match(/(?:shorts\/|youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);return m&&m[1]}
document.getElementById("fetchBtn").onclick=async()=>{
 const u=document.getElementById("url").value.trim(),id=vid(u),el=document.getElementById("meta");
 if(!id){el.innerHTML='<span class="bad">That doesn\'t look like a YouTube link.</span>';return}
 el.textContent="Looking it up…";
 try{const r=await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/shorts/${id}`);
  if(!r.ok)throw r.status;meta=await r.json();meta.id=id;
  el.innerHTML=`<img class="thumb" src="${meta.thumbnail_url}"><b>${meta.title}</b><br>by ${meta.author_name}<br><span class="ok">Found. It's public or unlisted and embeddable.</span>`;
 }catch(e){meta={id,missing:true};el.innerHTML='<span class="bad">YouTube returned no public info. It may be private, deleted, or have embedding turned off. That alone can explain 0 views.</span>'}
};
function autoChecks(){const n=[];if(!meta)return n;
 if(meta.missing){n.push(["bad","Video isn't publicly reachable (private, deleted or embedding off)."]);return n}
 const t=meta.title||"",tags=(t.match(/#\w+/g)||[]);
 if(meta.height&&meta.width&&meta.width>meta.height)n.push(["warn","Player is horizontal. Shorts should be vertical 9:16 and under 3 minutes."]);else n.push(["ok","Vertical format."]);
 if(t.length>70)n.push(["warn",`Title is ${t.length} characters and gets cut off in the feed. Aim under 60.`]);else n.push(["ok","Title length fine."]);
 if(tags.length>3)n.push(["warn",`${tags.length} hashtags in title. Keep it to 1–3 relevant ones.`]);
 if(tags.length===0)n.push(["warn","No hashtag. Add 1–2 topic hashtags (e.g. #manhwa)."]);
 return n}
function diagnose(a){
 if(meta&&meta.missing)return["Video not public/embeddable","Set visibility to Public and allow embedding (Studio > Details > Show more)."];
 if(a.restrict==="copyright")return["Copyright claim on audio","Claimed music often stops Shorts-feed testing."];
 if(a.restrict==="kids")return["'Made for kids' / comments auto-disabled","Kids-flagged Shorts get very limited feed distribution."];
 if(a.restrict==="other")return["Restriction on the video","Age or policy restrictions limit who can be shown it."];
 if(a.age==="lt24")return["Too early / analytics lag","Under 24h, counts can lag. Wait before changing or deleting."];
 if(a.chan==="all"&&a.impr==="zero")return["Channel-level distribution issue","Many 0-impression Shorts in a row points to the account, not the video."];
 if(a.impr==="zero")return["Never tested in the Shorts feed","0 impressions means YouTube didn't push it. Usually a hidden flag, a reused/duplicate upload, or metadata."];
 if(a.swipe==="bad"||a.impr==="low")return["Weak hook: viewers swipe away","It was tested but people swiped in the first 1–3 seconds, so the push stopped."];
 return["No single blocker found","It's being shown; growth now depends on hook, retention and posting consistency."]}
document.getElementById("scoreBtn").onclick=()=>{
 const a={};Q.forEach(q=>{const c=document.querySelector(`input[name=${q.id}]:checked`);a[q.id]=c?c.value:null});
 if(Object.values(a).some(v=>!v)){alert("Answer all 5 checks first.");return}
 let s=100;const pen={restrict:{copyright:40,kids:40,other:30},impr:{zero:30,low:15,unsure:10},swipe:{bad:25,ok:8},chan:{few:10,all:20}};
 for(const k in pen)s-=pen[k][a[k]]||0;
 autoChecks().forEach(([c])=>{if(c==="warn")s-=5;if(c==="bad")s-=40});s=Math.max(0,s);
 const [cause,why]=diagnose(a),cls=s>=70?"ok":s>=40?"warn":"bad";
 document.getElementById("score").innerHTML=`<span class="${cls}">${s}/100</span>`;
 document.getElementById("cause").innerHTML=`<b>Most likely cause:</b> ${cause}<br><span class="hint">${why}</span>`;
 document.getElementById("autoNotes").innerHTML="<ul>"+autoChecks().map(([c,t])=>`<li class="${c}">${t}</li>`).join("")+"</ul>";
 ["result","paid"].forEach(i=>document.getElementById(i).classList.remove("hidden"));
 document.getElementById("result").scrollIntoView({behavior:"smooth"})};
