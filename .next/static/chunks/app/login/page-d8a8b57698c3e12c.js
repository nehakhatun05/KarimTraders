(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2626],{8291:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(2898).Z)("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]])},7216:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(2898).Z)("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]])},9670:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(2898).Z)("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},5589:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(2898).Z)("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]])},1295:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(2898).Z)("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]])},2741:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(2898).Z)("Phone",[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]])},2946:function(e,t,r){Promise.resolve().then(r.bind(r,378))},378:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return x}});var s=r(7437),a=r(2265),i=r(1396),o=r.n(i),n=r(4033),l=r(1295),c=r(2741),d=r(5589),u=r(7216),m=r(9670),p=r(8291),f=r(2749),h=r(5925);function x(){(0,n.useRouter)();let e=(0,n.useSearchParams)(),t=null==e?void 0:e.get("callbackUrl"),[r,i]=(0,a.useState)("email"),[x,y]=(0,a.useState)(!1),[g,b]=(0,a.useState)(!1),[v,w]=(0,a.useState)({email:"",phone:"",password:""}),j=async e=>{e.preventDefault(),b(!0);try{let e="email"===r?v.email:v.phone,s=await (0,f.signIn)("credentials",{identifier:e,password:v.password,redirect:!1});if(null==s?void 0:s.error){h.ZP.error(s.error),b(!1);return}h.ZP.success("Welcome back! Login successful");try{let e=await fetch("/api/user/profile");if(e.ok){let t=await e.json();if("ADMIN"===t.role||"SUPER_ADMIN"===t.role){window.location.href="/admin";return}}}catch(e){console.error("Error fetching user role:",e)}t?window.location.href=t:window.location.href="/account"}catch(e){h.ZP.error("Something went wrong. Please try again."),b(!1)}};return(0,s.jsx)("div",{className:"min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4",children:(0,s.jsxs)("div",{className:"max-w-md w-full",children:[(0,s.jsxs)("div",{className:"text-center mb-8",children:[(0,s.jsx)(o(),{href:"/",className:"inline-flex items-center gap-2",children:(0,s.jsx)("div",{className:"w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center",children:(0,s.jsx)("span",{className:"text-white font-bold text-2xl",children:"K"})})}),(0,s.jsx)("h1",{className:"mt-4 text-2xl font-bold text-gray-800",children:"Welcome Back!"}),(0,s.jsx)("p",{className:"text-gray-500 mt-1",children:"Sign in to continue shopping fresh groceries"})]}),(0,s.jsxs)("div",{className:"bg-white rounded-2xl shadow-xl p-8",children:[(0,s.jsxs)("div",{className:"flex bg-gray-100 rounded-lg p-1 mb-6",children:[(0,s.jsx)("button",{onClick:()=>i("email"),className:"flex-1 py-2 text-sm font-medium rounded-md transition-all ".concat("email"===r?"bg-white text-primary-600 shadow-sm":"text-gray-500 hover:text-gray-700"),children:"Email"}),(0,s.jsx)("button",{onClick:()=>i("phone"),className:"flex-1 py-2 text-sm font-medium rounded-md transition-all ".concat("phone"===r?"bg-white text-primary-600 shadow-sm":"text-gray-500 hover:text-gray-700"),children:"Phone"})]}),(0,s.jsxs)("form",{onSubmit:j,className:"space-y-5",children:["email"===r?(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Email Address"}),(0,s.jsxs)("div",{className:"relative",children:[(0,s.jsx)(l.Z,{className:"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",size:20}),(0,s.jsx)("input",{type:"email",value:v.email,onChange:e=>w({...v,email:e.target.value}),placeholder:"you@example.com",className:"w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500",required:!0})]})]}):(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Phone Number"}),(0,s.jsxs)("div",{className:"relative",children:[(0,s.jsx)(c.Z,{className:"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",size:20}),(0,s.jsx)("input",{type:"tel",value:v.phone,onChange:e=>w({...v,phone:e.target.value}),placeholder:"+91 9876543210",className:"w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500",required:!0})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Password"}),(0,s.jsxs)("div",{className:"relative",children:[(0,s.jsx)(d.Z,{className:"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",size:20}),(0,s.jsx)("input",{type:x?"text":"password",value:v.password,onChange:e=>w({...v,password:e.target.value}),placeholder:"Enter your password",className:"w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500",required:!0}),(0,s.jsx)("button",{type:"button",onClick:()=>y(!x),className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",children:x?(0,s.jsx)(u.Z,{size:20}):(0,s.jsx)(m.Z,{size:20})})]})]}),(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("label",{className:"flex items-center gap-2 cursor-pointer",children:[(0,s.jsx)("input",{type:"checkbox",className:"w-4 h-4 text-primary-600 rounded"}),(0,s.jsx)("span",{className:"text-sm text-gray-600",children:"Remember me"})]}),(0,s.jsx)(o(),{href:"/forgot-password",className:"text-sm text-primary-600 hover:underline",children:"Forgot Password?"})]}),(0,s.jsx)("button",{type:"submit",disabled:g,className:"w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70",children:g?(0,s.jsx)("div",{className:"w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"}):(0,s.jsxs)(s.Fragment,{children:["Sign In",(0,s.jsx)(p.Z,{size:18})]})})]}),(0,s.jsxs)("div",{className:"relative my-6",children:[(0,s.jsx)("div",{className:"absolute inset-0 flex items-center",children:(0,s.jsx)("div",{className:"w-full border-t border-gray-200"})}),(0,s.jsx)("div",{className:"relative flex justify-center text-sm",children:(0,s.jsx)("span",{className:"px-2 bg-white text-gray-500",children:"Or continue with"})})]}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-3",children:[(0,s.jsxs)("button",{className:"flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors",children:[(0,s.jsxs)("svg",{className:"w-5 h-5",viewBox:"0 0 24 24",children:[(0,s.jsx)("path",{fill:"#4285F4",d:"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"}),(0,s.jsx)("path",{fill:"#34A853",d:"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"}),(0,s.jsx)("path",{fill:"#FBBC05",d:"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"}),(0,s.jsx)("path",{fill:"#EA4335",d:"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"})]}),(0,s.jsx)("span",{className:"text-sm font-medium text-gray-600",children:"Google"})]}),(0,s.jsxs)("button",{className:"flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors",children:[(0,s.jsx)("svg",{className:"w-5 h-5 text-[#1877F2]",fill:"currentColor",viewBox:"0 0 24 24",children:(0,s.jsx)("path",{d:"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"})}),(0,s.jsx)("span",{className:"text-sm font-medium text-gray-600",children:"Facebook"})]})]}),(0,s.jsxs)("p",{className:"text-center text-sm text-gray-600 mt-6",children:["Don't have an account?"," ",(0,s.jsx)(o(),{href:"/register",className:"text-primary-600 font-medium hover:underline",children:"Sign up for free"})]})]}),(0,s.jsxs)("p",{className:"text-center text-xs text-gray-500 mt-6",children:["By signing in, you agree to our"," ",(0,s.jsx)(o(),{href:"/terms",className:"text-primary-600 hover:underline",children:"Terms of Service"})," ","and"," ",(0,s.jsx)(o(),{href:"/privacy",className:"text-primary-600 hover:underline",children:"Privacy Policy"})]})]})})}},4033:function(e,t,r){e.exports=r(5313)},5925:function(e,t,r){"use strict";let s,a;r.d(t,{x7:function(){return em},ZP:function(){return ep}});var i,o=r(2265);let n={data:""},l=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||n},c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,m=(e,t)=>{let r="",s="",a="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+o+";":s+="f"==i[1]?m(o,i):i+"{"+m(o,"k"==i[1]?"":t)+"}":"object"==typeof o?s+=m(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=m.p?m.p(i,o):i+":"+o+";")}return r+(t&&a?t+"{"+a+"}":a)+s},p={},f=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+f(e[r]);return t}return e},h=(e,t,r,s,a)=>{var i;let o=f(e),n=p[o]||(p[o]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(o));if(!p[n]){let t=o!==e?e:(e=>{let t,r,s=[{}];for(;t=c.exec(e.replace(d,""));)t[4]?s.shift():t[3]?(r=t[3].replace(u," ").trim(),s.unshift(s[0][r]=s[0][r]||{})):s[0][t[1]]=t[2].replace(u," ").trim();return s[0]})(e);p[n]=m(a?{["@keyframes "+n]:t}:t,r?"":"."+n)}let l=r&&p.g?p.g:null;return r&&(p.g=p[n]),i=p[n],l?t.data=t.data.replace(l,i):-1===t.data.indexOf(i)&&(t.data=s?i+t.data:t.data+i),n},x=(e,t,r)=>e.reduce((e,s,a)=>{let i=t[a];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":m(e,""):!1===e?"":e}return e+s+(null==i?"":i)},"");function y(e){let t=this||{},r=e.call?e(t.p):e;return h(r.unshift?r.raw?x(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}y.bind({g:1});let g,b,v,w=y.bind({k:1});function j(e,t){let r=this||{};return function(){let s=arguments;function a(i,o){let n=Object.assign({},i),l=n.className||a.className;r.p=Object.assign({theme:b&&b()},n),r.o=/ *go\d+/.test(l),n.className=y.apply(r,s)+(l?" "+l:""),t&&(n.ref=o);let c=e;return e[0]&&(c=n.as||e,delete n.as),v&&c[0]&&v(n),g(c,n)}return t?t(a):a}}var N=e=>"function"==typeof e,k=(e,t)=>N(e)?e(t):e,E=(s=0,()=>(++s).toString()),C=()=>{if(void 0===a&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");a=!e||e.matches}return a},z="default",Z=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return Z(e,{type:e.toasts.find(e=>e.id===s.id)?1:0,toast:s});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},P=[],A={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},M={},$=(e,t=z)=>{M[t]=Z(M[t]||A,e),P.forEach(([e,r])=>{e===t&&r(M[t])})},D=e=>Object.keys(M).forEach(t=>$(e,t)),O=e=>Object.keys(M).find(t=>M[t].toasts.some(t=>t.id===e)),S=(e=z)=>t=>{$(t,e)},I={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},_=(e={},t=z)=>{let[r,s]=(0,o.useState)(M[t]||A),a=(0,o.useRef)(M[t]);(0,o.useEffect)(()=>(a.current!==M[t]&&s(M[t]),P.push([t,s]),()=>{let e=P.findIndex(([e])=>e===t);e>-1&&P.splice(e,1)}),[t]);let i=r.toasts.map(t=>{var r,s,a;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(s=e[t.type])?void 0:s.duration)||(null==e?void 0:e.duration)||I[t.type],style:{...e.style,...null==(a=e[t.type])?void 0:a.style,...t.style}}});return{...r,toasts:i}},F=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||E()}),H=e=>(t,r)=>{let s=F(t,e,r);return S(s.toasterId||O(s.id))({type:2,toast:s}),s.id},L=(e,t)=>H("blank")(e,t);L.error=H("error"),L.success=H("success"),L.loading=H("loading"),L.custom=H("custom"),L.dismiss=(e,t)=>{let r={type:3,toastId:e};t?S(t)(r):D(r)},L.dismissAll=e=>L.dismiss(void 0,e),L.remove=(e,t)=>{let r={type:4,toastId:e};t?S(t)(r):D(r)},L.removeAll=e=>L.remove(void 0,e),L.promise=(e,t,r)=>{let s=L.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let a=t.success?k(t.success,e):void 0;return a?L.success(a,{id:s,...r,...null==r?void 0:r.success}):L.dismiss(s),e}).catch(e=>{let a=t.error?k(t.error,e):void 0;a?L.error(a,{id:s,...r,...null==r?void 0:r.error}):L.dismiss(s)}),e};var q=1e3,B=(e,t="default")=>{let{toasts:r,pausedAt:s}=_(e,t),a=(0,o.useRef)(new Map).current,i=(0,o.useCallback)((e,t=q)=>{if(a.has(e))return;let r=setTimeout(()=>{a.delete(e),n({type:4,toastId:e})},t);a.set(e,r)},[]);(0,o.useEffect)(()=>{if(s)return;let e=Date.now(),a=r.map(r=>{if(r.duration===1/0)return;let s=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(s<0){r.visible&&L.dismiss(r.id);return}return setTimeout(()=>L.dismiss(r.id,t),s)});return()=>{a.forEach(e=>e&&clearTimeout(e))}},[r,s,t]);let n=(0,o.useCallback)(S(t),[t]),l=(0,o.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),c=(0,o.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),d=(0,o.useCallback)(()=>{s&&n({type:6,time:Date.now()})},[s,n]),u=(0,o.useCallback)((e,t)=>{let{reverseOrder:s=!1,gutter:a=8,defaultPosition:i}=t||{},o=r.filter(t=>(t.position||i)===(e.position||i)&&t.height),n=o.findIndex(t=>t.id===e.id),l=o.filter((e,t)=>t<n&&e.visible).length;return o.filter(e=>e.visible).slice(...s?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+a,0)},[r]);return(0,o.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=a.get(e.id);t&&(clearTimeout(t),a.delete(e.id))}})},[r,i]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:d,calculateOffset:u}}},R=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,T=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,U=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,V=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${R} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${T} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${U} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,W=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,G=j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${W} 1s linear infinite;
`,K=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Y=w`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,J=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${K} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Y} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Q=j("div")`
  position: absolute;
`,X=j("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ee=w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,et=j("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ee} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,er=({toast:e})=>{let{icon:t,type:r,iconTheme:s}=e;return void 0!==t?"string"==typeof t?o.createElement(et,null,t):t:"blank"===r?null:o.createElement(X,null,o.createElement(G,{...s}),"loading"!==r&&o.createElement(Q,null,"error"===r?o.createElement(V,{...s}):o.createElement(J,{...s})))},es=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,ea=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,ei=j("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,eo=j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,en=(e,t)=>{let r=e.includes("top")?1:-1,[s,a]=C()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[es(r),ea(r)];return{animation:t?`${w(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},el=o.memo(({toast:e,position:t,style:r,children:s})=>{let a=e.height?en(e.position||t||"top-center",e.visible):{opacity:0},i=o.createElement(er,{toast:e}),n=o.createElement(eo,{...e.ariaProps},k(e.message,e));return o.createElement(ei,{className:e.className,style:{...a,...r,...e.style}},"function"==typeof s?s({icon:i,message:n}):o.createElement(o.Fragment,null,i,n))});i=o.createElement,m.p=void 0,g=i,b=void 0,v=void 0;var ec=({id:e,className:t,style:r,onHeightUpdate:s,children:a})=>{let i=o.useCallback(t=>{if(t){let r=()=>{s(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,s]);return o.createElement("div",{ref:i,className:t,style:r},a)},ed=(e,t)=>{let r=e.includes("top"),s=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:C()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...s}},eu=y`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,em=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:s,children:a,toasterId:i,containerStyle:n,containerClassName:l})=>{let{toasts:c,handlers:d}=B(r,i);return o.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:d.startPause,onMouseLeave:d.endPause},c.map(r=>{let i=r.position||t,n=ed(i,d.calculateOffset(r,{reverseOrder:e,gutter:s,defaultPosition:t}));return o.createElement(ec,{id:r.id,key:r.id,onHeightUpdate:d.updateHeight,className:r.visible?eu:"",style:n},"custom"===r.type?k(r.message,r):a?a(r):o.createElement(el,{toast:r,position:i}))}))},ep=L}},function(e){e.O(0,[6221,2749,2971,4938,1744],function(){return e(e.s=2946)}),_N_E=e.O()}]);