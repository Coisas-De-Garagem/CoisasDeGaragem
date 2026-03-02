import{j as e,F as x,a8 as b,a9 as f}from"./index-Df8U0lBF.js";import{b as h}from"./router-A6-V_tmr.js";function j({label:n,error:s,helperText:r,fullWidth:o=!1,className:d="",type:l="text",...t}){const[a,c]=h.useState(!1),u=o?"w-full":"",i=l==="password",m=i?a?"text":"password":l;return e.jsxs("div",{className:`mb-4 ${u}`,children:[n&&e.jsx("label",{htmlFor:t.id,className:"block text-sm font-medium text-neutral-700 mb-1",children:n}),e.jsxs("div",{className:"relative",children:[e.jsx("input",{id:t.id,type:m,className:`
            w-full px-4 py-2.5 
            bg-white border border-neutral-200 
            rounded-xl text-neutral-900 
            placeholder-neutral-400 
            focus:ring-4 focus:ring-primary/10 focus:border-primary 
            focus:outline-none 
            disabled:opacity-50 disabled:bg-neutral-50 disabled:cursor-not-allowed 
            transition-all duration-300
            ${i?"pr-12":""}
            ${s?"border-error ring-error/10":""}
            ${d}
          `,"aria-invalid":!!s,"aria-describedby":s?`${t.id}-error`:r?`${t.id}-helper`:void 0,...t}),i&&e.jsx("button",{type:"button",className:"absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:text-primary transition-colors",onClick:()=>c(!a),tabIndex:-1,"aria-label":a?"Esconder senha":"Exibir senha",children:e.jsx(x,{icon:a?b:f})})]}),s&&e.jsxs("p",{id:`${t.id}-error`,className:"mt-1.5 text-sm text-error font-medium flex items-center gap-1",role:"alert",children:[e.jsx("span",{className:"w-1 h-1 rounded-full bg-error"}),s]}),r&&!s&&e.jsx("p",{id:`${t.id}-helper`,className:"mt-1.5 text-sm text-neutral-500",children:r})]})}export{j as I};
