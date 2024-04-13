// ==UserScript==
// @name         TSC Companion - Next
// @namespace    TSC
// @version      next-8
// @author       mavri [2402357]
// @description  A very early version of the new TSC Companion. Special thanks to Kwack [2190604]
// @copyright    2024, diicot.cc
// @icon         https://i.imgur.com/8eydsOA.png
// @updateURL    https://github.com/LeoMavri/TSC-Companion/raw/next/dist/tsc-companion.user.js
// @match        https://www.torn.com/profiles.php?*
// @match        https://www.torn.com/factions.php*
// @connect      api.torn.com
// @connect      tsc.diicot.cc
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(t=>{if(typeof GM_addStyle=="function"){GM_addStyle(t);return}const o=document.createElement("style");o.textContent=t,document.head.append(o)})(" body{--tsc-bg-color: #f0f0f0;--tsc-border-color: #ccc;--tsc-input-color: #ccc;--tsc-text-color: #000;--tsc-hover-color: #ddd}body.dark-mode{--tsc-bg-color: #333;--tsc-border-color: #444;--tsc-input-color: #504f4f;--tsc-text-color: #ccc;--tsc-hover-color: #555}table.tsc-stat-table{width:100%;border-collapse:collapse;color:var(--tsc-text-color);background-color:var(--tsc-bg-color)}table.tsc-stat-table th,table.tsc-stat-table td{border:1px solid var(--tsc-border-color);color:var(--tsc-text-color);padding:4px;text-align:center}table.tsc-stat-table th{background-color:var(--tsc-bg-color);color:var(--tsc-text-color)}.tsc-faction-spy{background-color:var(--tsc-bg-color);color:var(--tsc-text-color);border:1px solid var(--tsc-border-color);border-radius:5px;padding:3px 5px;cursor:pointer;margin-left:auto;margin-right:2px}.tsc-chain-spy{background-color:var(--tsc-bg-color);color:var(--tsc-text-color);border:1px solid var(--tsc-border-color);font-size:10px;display:flex;vertical-align:middle;justify-content:center;align-items:center;width:200%;height:15px;border-radius:5px;padding:3px;margin-left:2px;cursor:pointer}.respect{margin-left:32px!important}.attack-number{min-width:45px!important}.tsc-accordion{background-color:var(--tsc-bg-color);border:1px solid var(--tsc-border-color);border-radius:5px;margin:10px 0;padding:10px}.tsc-header{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:1.2em;margin-top:10px;margin-bottom:10px}.tsc-header-username{font-style:italic;display:inline}.tsc-setting-entry{display:flex;align-items:center;gap:5px;margin-top:10px;margin-bottom:5px}.tsc-key-input{width:120px;padding-left:5px;background-color:var(--tsc-input-color);color:var(--tsc-text-color)}.tsc-button{background-color:var(--tsc-bg-color);color:var(--tsc-text-color);border:1px solid var(--tsc-border-color);transition:background-color .5s;border-radius:5px;padding:5px 10px;cursor:pointer}.tsc-button:hover{background-color:var(--tsc-hover-color);transition:background-color .5s}.tsc-blur{filter:blur(3px);transition:filter 2s}.tsc-blur:focus,.tsc-blur:active{transition-duration:.5s;filter:blur(0)} ");

(function () {
	'use strict';

	var F=Object.defineProperty;var _=(e,t,n)=>t in e?F(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var m=(e,t,n)=>(_(e,typeof t!="symbol"?t+"":t,n),n);const w={Colours:{Info:"#05668D",Warn:"#EDDEA4",Error:"#ff0000",Debug:"#5C415D"}};class N{constructor(t){m(this,"storageKey");this.storageKey=t;}get(t){return localStorage.getItem(`${this.storageKey}-${t}`)}set(t,n){localStorage.setItem(`${this.storageKey}-${t}`,n);}getToggle(t){return this.get(t)==="true"}getJSON(t){const n=this.get(t);return n===null?null:JSON.parse(n)}setJSON(t,n){this.set(t,JSON.stringify(n));}fullClear(){let t=0;for(let n=0;n<localStorage.length;n++){const i=localStorage.key(n);i!=null&&i.startsWith(this.storageKey)&&(localStorage.removeItem(i),a.debug(`Cleared ${i}`),++t);}return t}spyClear(){let t=0;for(let n=0;n<localStorage.length;n++){const i=localStorage.key(n);i!=null&&i.startsWith(`${this.storageKey}-spy`)&&(localStorage.removeItem(i),a.debug(`Cleared ${i}`),++t);}return t}}const r=new N("kwack.mavri.tsc.rocks");class a{static info(t,...n){console.info(`%c[TSC Companion] ${t}`,`color: ${w.Colours.Info}`,...n);}static warn(t,...n){console.log(`%c[TSC Companion] ${t}`,`color: ${w.Colours.Warn}`,...n);}static error(t,...n){console.error(`%c[TSC Companion] ${t}`,`color: ${w.Colours.Error}`,...n);}static debug(t,...n){r.getToggle("debug-logs")&&console.log(`%c[TSC Companion] ${t}`,`color: ${w.Colours.Debug}`,...n);}}class S{constructor({name:t,description:n,shouldRun:i,start:s}){m(this,"name");m(this,"description");m(this,"shouldRun");m(this,"start");this.name=t,this.description=n,this.shouldRun=i,this.start=s;}}function y(e,t){return new Promise((n,i)=>{let s;if(document.querySelectorAll(e).length)return n(document.querySelector(e));const o=new MutationObserver(()=>{if(document.querySelectorAll(e).length)return o.disconnect(),s!=null&&clearTimeout(s),n(document.querySelector(e))});o.observe(document.body,{childList:!0,subtree:!0}),t&&(s=setTimeout(()=>{o.disconnect(),n(null);},t));})}const O=12*60*60*1e3;function C(e){const t=r.getJSON(`spy-${e}`);if(t){if(t.insertedAt&&new Date().getTime()-new Date(t.insertedAt).getTime()<O)return a.debug("Spy cache still valid"),Promise.resolve(t);a.debug("Spy cache expired, fetching new data"),r.setJSON(`spy-${e}`,null);}return new Promise((n,i)=>{(GM.xmlHttpRequest??GM.xmlhttpRequest)({method:"POST",url:"https://tsc.diicot.cc/stats/update",headers:{authorization:"10000000-6000-0000-0009-000000000001","x-requested-with":"XMLHttpRequest","Content-Type":"application/json"},data:JSON.stringify({apiKey:r.get("api-key")??"",userId:e}),onload(o){const c=JSON.parse(o.responseText);console.log(c),!("error"in c)&&c.success&&r.setJSON(`spy-${e}`,{...c,insertedAt:new Date().getTime()}),n(c);},onerror(){i({success:!1,code:999});},timeout:5e3});})}async function B(){if(r.get("api-key")===null)return {error:!0,message:"API Key not set"};const e=r.getJSON("user-data");if(e){if(e.insertedAt&&new Date().getTime()-new Date(e.insertedAt).getTime()<O)return a.debug("User cache still valid"),e;a.debug("User cache expired, fetching new data"),r.setJSON("user-data",null);}const t=await fetch(`https://api.torn.com/user/?selections=basic&key=${r.get("api-key")}`);if(!t.ok)return {error:!0,message:t.statusText};const n=await t.json();return n.error?{error:!0,message:n.error.error}:(r.setJSON("user-data",{...n,insertedAt:new Date().getTime()}),n)}function l(e,t=2){return Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:t,minimumFractionDigits:t}).format(e)}const P=new S({name:"Profile Page",description:"Shows a user's spy on their profile page",shouldRun:async function(){return r.getToggle(this.name)&&window.location.pathname==="/profiles.php"},start:async()=>{const e=await y(".empty-block",15e3);if(e===null){a.warn("Could not find the empty block on the profile page");return}const t=window.location.search.split("XID=")[1];if(!r.get("api-key")){a.warn("No API key found, cannot fetch spy");return}const i=await C(t);if("error"in i){a.error(i.message);return}if(!i.success){a.error(`Failed to fetch spy: ${i.code}`);return}const{estimate:s,statInterval:o}=i.spy;$(e).append($("<table>").addClass("tsc-stat-table").append($("<tr>").append($("<th>").text("Estimated Stats")).append($("<th>").text("Min")).append($("<th>").text("Max")).append($("<th>").text("Battle Score"))).append($("<tr>").append($("<td>").text(l(BigInt(s.stats)))).append($("<td>").text(o!=null&&o.battleScore?l(BigInt(o.min)):"N/A")).append($("<td>").text(o!=null&&o.battleScore?l(BigInt(o.max)):"N/A")).append($("<td>").text(o!=null&&o.battleScore?o.battleScore:"N/A"))));}}),E=new S({name:"Faction - Normal",description:"Shows a list of spies on the faction page",shouldRun:async function(){return r.getToggle(this.name)&&window.location.href.includes("factions.php?step=profile")},start:async function(){const e=await y(".faction-info-wrap.restyle.another-faction .table-body > li:nth-child(1)",15e3);if(e===null){a.warn(`${this.name}: Failed to find element to append to.`);return}const t=$(e).parent().parent()[0];$(t).find("li").each((n,i)=>{const s=$(i).find('[class*="userInfoBox"]')[0];//! This is a bit of a hack, but it works for now
	if($(s).css("width","169px"),$(s).css("overflow","hidden"),$(s).css("text-overflow","ellipsis"),s===void 0){a.warn("Failed to find infoBox",i);return}const o=$(s).find('a[href^="/profiles.php?XID="]')[0];if(o===void 0){a.warn("Failed to find userHref",s);return}const c=o.href.split("XID=")[1];C(c).then(h=>{if("error"in h||h.success!==!0){a.warn(`Failed to find spy for ${c}`,h);return}const{estimate:g,statInterval:u}=h.spy;let d=l(g.stats,1),p=`Estimate: ${l(g.stats,2)}`;u!=null&&u.battleScore&&(d=`${l(BigInt(u.min),1)} - ${l(BigInt(u.max),1)}`,p+=`<br>Interval: ${l(BigInt(u.min),2)} - ${l(BigInt(u.max),2)}<br>Battle Score: ${l(u.battleScore,2)}`),$(s).after($("<div>").addClass("tsc-faction-spy").text(d).attr("title",p));});});}}),M=new S({name:"Faction - Chain",description:"Shows spies on the chain page",shouldRun:async function(){return !r.getToggle(this.name)||!window.location.href.includes("factions.php?step=your")?!1:await y('[class^="warListItem___eE_Ve first-in-row"]')!==null},start:async function(){let e=null;const t=document.querySelector('[class^="warListItem___eE_Ve first-in-row"]'),n=new MutationObserver(async i=>{if(i.length===0)return;const s=document.querySelector('[class^="warListItem___eE_Ve first-in-row"]');if(!(s!=null&&s.classList.contains("act")))return;a.info("Chain is active"),e!==null&&(e.disconnect(),e=null);const o=await y('[class^="chain-attacks-list"]',15e3);if(!o){a.warn("Could not find attacks list (probable time-out)");return}const c=async()=>{$('[class^="chain-attacks-list"] li').each(function(h,g){const u=$(g).find('[class^="honorWrap"]');for(let d=0;d<=1;d++){const p=u[d];if(a.debug("Element: ",p),a.debug("Has spy: ",$(p).find(".tsc-chain-spy").parent().length>0),$(p).parent().find(".tsc-chain-spy").length>0){a.debug("Skipping element as it already has a spy.");continue}const k=$(p).find("a").attr("href");if(!k){a.warn("Failed to find ID.");return}const T=k.split("XID=")[1];C(T).then(b=>{if("error"in b||b.success!==!0){a.warn(`Failed to find spy for ${T}`,b);return}const{estimate:v,statInterval:f}=b.spy;let I=l(v.stats,1),D=`Estimate: ${l(v.stats,2)}`;f!=null&&f.battleScore&&(I=`${l(BigInt(f.min),1)} - ${l(BigInt(f.max),1)}`,D+=`<br>Interval: ${l(BigInt(f.min),2)} - ${l(BigInt(f.max),2)}<br>Battle Score: ${l(f.battleScore,2)}`),$(p).append($("<div>").addClass("tsc-chain-spy").text(I).attr("title",D));});}});};e=new MutationObserver(async h=>{let g=!1;$('[class^="chain-attacks-list"] li').each(function(u,d){$(d).find(".tsc-chain-spy").length===0&&g===!1&&(g=!0,c());});}),await c(),e.observe(o,{childList:!0,subtree:!0});});if(!t){a.error(`${this.name} Could not find element`);return}n.observe(t,{attributes:!0,attributeFilter:["class"]});}}),x=Object.freeze(Object.defineProperty({__proto__:null,FactionChain:M,FactionNormal:E,ProfilePage:P},Symbol.toStringTag,{value:"Module"})),A=new S({name:"Settings Panel",description:"Adds a settings panel to your own faction page.",shouldRun:async function(){return window.location.href.includes("factions.php?step=your")},start:async function(){var i;const e=await y("#factions > ul",15e3);if(e===null){a.warn(`${this.name}: Failed to find element to append to.`);return}if((i=e.nextElementSibling)!=null&&i.classList.contains("tsc-accordion")){a.warn(`${this.name}: Element already exists`);return}a.debug("Features:",Object.values(x));const t=await B(),n="error"in t?$("<div>").text("Welcome!"):$("<div>").html(`Hey, ${$("<div>").addClass("tsc-header-username").text(t.name).prop("outerHTML")}!`);$(e).after($("<details>").addClass("tsc-accordion").append($("<summary>").text("TSC Settings")).append($("<div>").addClass("tsc-header").append(n),$("<p>").css("margin-top","5px").text("This is the settings panel for the Torn Spies Central script."),$("<p>").text("Here you can configure the settings to your liking. Please note that changes will be saved automatically."),$("<br>"),$("<div>").addClass("tsc-setting-entry").append($("<input>").attr("type","checkbox").attr("id","enable").prop("checked",r.getToggle("enable")).on("change",function(){r.set("enable",$(this).prop("checked")),a.debug(`Set enable to ${$(this).prop("checked")}`);})).append($("<p>").text("Enable Script")),$("<div>").addClass("tsc-setting-entry").append($("<label>").attr("for","api-key").text("API Key"),$("<input>").attr("type","text").attr("id","api-key").attr("placeholder","Paste your key here...").addClass("tsc-key-input").addClass("tsc-blur").val(r.get("api-key")||"").on("change",function(){const s=$(this).val();if(typeof s!="string"){a.warn("API Key is not a string.");return}if(!/^[a-zA-Z0-9]{16}$/.test(s)){a.warn("API Key is not valid."),$(this).css("outline","1px solid red");return}$(this).css("outline","none"),s!==r.get("api-key")&&(r.set("api-key",s),a.debug(`Set api-key to ${s}`));})),$("<br>"),$("<p>").text("Feature toggles:"),Object.values(x).map(s=>$("<div>").append($("<div>").addClass("tsc-setting-entry").append($("<input>").attr("type","checkbox").attr("id",s.name).prop("checked",r.getToggle(s.name)).on("change",function(){r.set(s.name,$(this).prop("checked")),a.debug(`Set ${s.name} to ${$(this).prop("checked")}`);})).append($("<p>").text(s.name))).append($("<p>").text(s.description))),$("<br>"),$("<p>").text("The following buttons require a confirmation before anything is deleted.").css("margin-bottom","10px"),$("<button>").text("Clear cached spies").addClass("tsc-button").css("margin-right","10px").on("click",async function(){if(!confirm("Are you sure you want to clear cached spies?"))return;const o=r.spyClear();a.debug("Cleared all cached spies");const c=$(this);c.animate({opacity:0},"slow",function(){c.text(`Cleared ${o} spies`);}).animate({opacity:1},"slow"),setTimeout(function(){c.animate({opacity:0},"slow",function(){c.text("Clear cached spies");}).animate({opacity:1},"slow");},3e3);}),$("<button>").text("Clear all cache").addClass("tsc-button").on("click",async function(){if(!confirm("Are you sure you want to clear all cache?"))return;const o=r.fullClear();a.debug("Cleared all cache");const c=$(this);c.animate({opacity:0},"slow",function(){c.text(`Cleared ${o} items`);}).animate({opacity:1},"slow"),setTimeout(function(){c.animate({opacity:0},"slow",function(){c.text("Clear all cache");}).animate({opacity:1},"slow");},3e3);}),$("<br>"),$("<br>"),$("<p>").text("Debug settings:"),$("<div>").addClass("tsc-setting-entry").append($("<input>").attr("type","checkbox").attr("id","debug-logs").prop("checked",r.getToggle("debug-logs")).on("change",function(){r.set("debug-logs",$(this).prop("checked"));})).append($("<p>").text("Extra debug logs"))));}});async function J(){if(await A.shouldRun()===!0&&(a.info("Settings panel feature started"),await A.start()),r.getToggle("enable")===!1){a.info("TSC is disabled");return}a.info("Starting TSC features...");for(const e of Object.values(x)){if(await e.shouldRun()===!1){a.info(`${e.name} feature not applicable`);continue}try{await e.start(),a.info(`${e.name} feature started`);}catch(t){a.error(`Failed to start ${e.name} feature:`,t);}}}J().catch(e=>{a.error("TSC failed catastrophically:",e);});

})();