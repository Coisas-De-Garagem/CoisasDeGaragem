import{j as e}from"./index-Df8U0lBF.js";function u({label:l,error:t,helperText:s,fullWidth:a=!1,className:n="",options:d,...r}){const o=a?"w-full":"";return e.jsxs("div",{className:`mb-4 ${o}`,children:[l&&e.jsx("label",{htmlFor:r.id,className:"block text-sm font-medium text-neutral-700 mb-1",children:l}),e.jsxs("div",{className:"relative group",children:[e.jsx("select",{id:r.id,className:`
            appearance-none w-full px-4 py-2.5 
            bg-white border border-neutral-200 
            rounded-xl text-neutral-900 
            focus:ring-4 focus:ring-primary/10 focus:border-primary 
            focus:outline-none 
            disabled:opacity-50 disabled:bg-neutral-50 disabled:cursor-not-allowed 
            transition-all duration-300
            pr-10
            ${t?"border-error ring-error/10":""}
            ${n}
          `,"aria-invalid":!!t,"aria-describedby":t?`${r.id}-error`:s?`${r.id}-helper`:void 0,...r,children:d.map(i=>e.jsx("option",{value:i.value,children:i.label},i.value))}),e.jsx("div",{className:"absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors",children:e.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2.5",d:"M19 9l-7 7-7-7"})})})]}),t&&e.jsxs("p",{id:`${r.id}-error`,className:"mt-1.5 text-sm text-error font-medium flex items-center gap-1",role:"alert",children:[e.jsx("span",{className:"w-1 h-1 rounded-full bg-error"}),t]}),s&&!t&&e.jsx("p",{id:`${r.id}-helper`,className:"mt-1.5 text-sm text-neutral-500",children:s})]})}export{u as S};
