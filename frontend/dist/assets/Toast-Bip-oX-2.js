import{r as i,j as e}from"./index-DMiwMyb7.js";import{c as r,m as d}from"./ThemeToggle-COYxnB4v.js";import{A as m,C as n}from"./check-circle-BA9sB1YV.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=r("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=r("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),f=({message:a,type:s="success",onClose:t})=>{i.useEffect(()=>{const l=setTimeout(()=>{t()},4e3);return()=>clearTimeout(l)},[t]);const o={success:e.jsx(n,{className:"h-5 w-5 text-emerald-500"}),error:e.jsx(m,{className:"h-5 w-5 text-red-500"}),info:e.jsx(x,{className:"h-5 w-5 text-blue-500"})},c={success:"border-emerald-500/20 bg-white/95 dark:bg-slate-900/95",error:"border-red-500/20 bg-white/95 dark:bg-slate-900/95",info:"border-blue-500/20 bg-white/95 dark:bg-slate-900/95"};return e.jsxs(d.div,{initial:{opacity:0,y:50,scale:.95},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,scale:.9,y:20},className:`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 ${c[s]}`,children:[o[s],e.jsx("p",{className:"text-sm font-medium text-slate-800 dark:text-slate-200",children:a}),e.jsx("button",{onClick:t,className:"ml-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200",children:e.jsx(b,{className:"h-4 w-4"})})]})};export{f as T,b as X};
