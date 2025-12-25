"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4356],{9883:function(e,t,r){r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(2898).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},9808:function(e,t,r){/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var a=r(2265),n="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},i=a.useState,o=a.useEffect,s=a.useLayoutEffect,l=a.useDebugValue;function u(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!n(e,r)}catch(e){return!0}}var d="undefined"==typeof window||void 0===window.document||void 0===window.document.createElement?function(e,t){return t()}:function(e,t){var r=t(),a=i({inst:{value:r,getSnapshot:t}}),n=a[0].inst,d=a[1];return s(function(){n.value=r,n.getSnapshot=t,u(n)&&d({inst:n})},[e,r,t]),o(function(){return u(n)&&d({inst:n}),e(function(){u(n)&&d({inst:n})})},[e]),l(r),r};t.useSyncExternalStore=void 0!==a.useSyncExternalStore?a.useSyncExternalStore:d},3176:function(e,t,r){/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var a=r(2265),n=r(6272),i="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},o=n.useSyncExternalStore,s=a.useRef,l=a.useEffect,u=a.useMemo,d=a.useDebugValue;t.useSyncExternalStoreWithSelector=function(e,t,r,a,n){var c=s(null);if(null===c.current){var f={hasValue:!1,value:null};c.current=f}else f=c.current;var p=o(e,(c=u(function(){function e(e){if(!l){if(l=!0,o=e,e=a(e),void 0!==n&&f.hasValue){var t=f.value;if(n(t,e))return s=t}return s=e}if(t=s,i(o,e))return t;var r=a(e);return void 0!==n&&n(t,r)?(o=e,t):(o=e,s=r)}var o,s,l=!1,u=void 0===r?null:r;return[function(){return e(t())},null===u?void 0:function(){return e(u())}]},[t,r,a,n]))[0],c[1]);return l(function(){f.hasValue=!0,f.value=p},[p]),d(p),p}},6272:function(e,t,r){e.exports=r(9808)},5401:function(e,t,r){e.exports=r(3176)},5925:function(e,t,r){let a,n;r.d(t,{x7:function(){return ef},ZP:function(){return ep}});var i,o=r(2265);let s={data:""},l=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||s},u=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,c=/\n+/g,f=(e,t)=>{let r="",a="",n="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+o+";":a+="f"==i[1]?f(o,i):i+"{"+f(o,"k"==i[1]?"":t)+"}":"object"==typeof o?a+=f(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),n+=f.p?f.p(i,o):i+":"+o+";")}return r+(t&&n?t+"{"+n+"}":n)+a},p={},m=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+m(e[r]);return t}return e},g=(e,t,r,a,n)=>{var i;let o=m(e),s=p[o]||(p[o]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(o));if(!p[s]){let t=o!==e?e:(e=>{let t,r,a=[{}];for(;t=u.exec(e.replace(d,""));)t[4]?a.shift():t[3]?(r=t[3].replace(c," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(c," ").trim();return a[0]})(e);p[s]=f(n?{["@keyframes "+s]:t}:t,r?"":"."+s)}let l=r&&p.g?p.g:null;return r&&(p.g=p[s]),i=p[s],l?t.data=t.data.replace(l,i):-1===t.data.indexOf(i)&&(t.data=a?i+t.data:t.data+i),s},h=(e,t,r)=>e.reduce((e,a,n)=>{let i=t[n];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":f(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"");function v(e){let t=this||{},r=e.call?e(t.p):e;return g(r.unshift?r.raw?h(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}v.bind({g:1});let y,b,w,x=v.bind({k:1});function E(e,t){let r=this||{};return function(){let a=arguments;function n(i,o){let s=Object.assign({},i),l=s.className||n.className;r.p=Object.assign({theme:b&&b()},s),r.o=/ *go\d+/.test(l),s.className=v.apply(r,a)+(l?" "+l:""),t&&(s.ref=o);let u=e;return e[0]&&(u=s.as||e,delete s.as),w&&u[0]&&w(s),y(u,s)}return t?t(n):n}}var S=e=>"function"==typeof e,k=(e,t)=>S(e)?e(t):e,O=(a=0,()=>(++a).toString()),I=()=>{if(void 0===n&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");n=!e||e.matches}return n},z="default",D=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return D(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:n}=t;return{...e,toasts:e.toasts.map(e=>e.id===n||void 0===n?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},j=[],C={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},$={},N=(e,t=z)=>{$[t]=D($[t]||C,e),j.forEach(([e,r])=>{e===t&&r($[t])})},P=e=>Object.keys($).forEach(t=>N(e,t)),A=e=>Object.keys($).find(t=>$[t].toasts.some(t=>t.id===e)),H=(e=z)=>t=>{N(t,e)},T={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},_=(e={},t=z)=>{let[r,a]=(0,o.useState)($[t]||C),n=(0,o.useRef)($[t]);(0,o.useEffect)(()=>(n.current!==$[t]&&a($[t]),j.push([t,a]),()=>{let e=j.findIndex(([e])=>e===t);e>-1&&j.splice(e,1)}),[t]);let i=r.toasts.map(t=>{var r,a,n;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||T[t.type],style:{...e.style,...null==(n=e[t.type])?void 0:n.style,...t.style}}});return{...r,toasts:i}},R=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||O()}),F=e=>(t,r)=>{let a=R(t,e,r);return H(a.toasterId||A(a.id))({type:2,toast:a}),a.id},M=(e,t)=>F("blank")(e,t);M.error=F("error"),M.success=F("success"),M.loading=F("loading"),M.custom=F("custom"),M.dismiss=(e,t)=>{let r={type:3,toastId:e};t?H(t)(r):P(r)},M.dismissAll=e=>M.dismiss(void 0,e),M.remove=(e,t)=>{let r={type:4,toastId:e};t?H(t)(r):P(r)},M.removeAll=e=>M.remove(void 0,e),M.promise=(e,t,r)=>{let a=M.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let n=t.success?k(t.success,e):void 0;return n?M.success(n,{id:a,...r,...null==r?void 0:r.success}):M.dismiss(a),e}).catch(e=>{let n=t.error?k(t.error,e):void 0;n?M.error(n,{id:a,...r,...null==r?void 0:r.error}):M.dismiss(a)}),e};var L=1e3,U=(e,t="default")=>{let{toasts:r,pausedAt:a}=_(e,t),n=(0,o.useRef)(new Map).current,i=(0,o.useCallback)((e,t=L)=>{if(n.has(e))return;let r=setTimeout(()=>{n.delete(e),s({type:4,toastId:e})},t);n.set(e,r)},[]);(0,o.useEffect)(()=>{if(a)return;let e=Date.now(),n=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&M.dismiss(r.id);return}return setTimeout(()=>M.dismiss(r.id,t),a)});return()=>{n.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let s=(0,o.useCallback)(H(t),[t]),l=(0,o.useCallback)(()=>{s({type:5,time:Date.now()})},[s]),u=(0,o.useCallback)((e,t)=>{s({type:1,toast:{id:e,height:t}})},[s]),d=(0,o.useCallback)(()=>{a&&s({type:6,time:Date.now()})},[a,s]),c=(0,o.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:n=8,defaultPosition:i}=t||{},o=r.filter(t=>(t.position||i)===(e.position||i)&&t.height),s=o.findIndex(t=>t.id===e.id),l=o.filter((e,t)=>t<s&&e.visible).length;return o.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+n,0)},[r]);return(0,o.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=n.get(e.id);t&&(clearTimeout(t),n.delete(e.id))}})},[r,i]),{toasts:r,handlers:{updateHeight:u,startPause:l,endPause:d,calculateOffset:c}}},J=x`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,V=x`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Z=x`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,q=E("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${J} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${V} 0.15s ease-out forwards;
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
    animation: ${Z} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,W=x`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,B=E("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${W} 1s linear infinite;
`,Y=x`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,G=x`
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
}`,K=E("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Y} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${G} 0.2s ease-out forwards;
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
`,Q=E("div")`
  position: absolute;
`,X=E("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ee=x`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,et=E("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ee} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,er=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?o.createElement(et,null,t):t:"blank"===r?null:o.createElement(X,null,o.createElement(B,{...a}),"loading"!==r&&o.createElement(Q,null,"error"===r?o.createElement(q,{...a}):o.createElement(K,{...a})))},ea=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,en=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,ei=E("div")`
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
`,eo=E("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,es=(e,t)=>{let r=e.includes("top")?1:-1,[a,n]=I()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ea(r),en(r)];return{animation:t?`${x(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${x(n)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},el=o.memo(({toast:e,position:t,style:r,children:a})=>{let n=e.height?es(e.position||t||"top-center",e.visible):{opacity:0},i=o.createElement(er,{toast:e}),s=o.createElement(eo,{...e.ariaProps},k(e.message,e));return o.createElement(ei,{className:e.className,style:{...n,...r,...e.style}},"function"==typeof a?a({icon:i,message:s}):o.createElement(o.Fragment,null,i,s))});i=o.createElement,f.p=void 0,y=i,b=void 0,w=void 0;var eu=({id:e,className:t,style:r,onHeightUpdate:a,children:n})=>{let i=o.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return o.createElement("div",{ref:i,className:t,style:r},n)},ed=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:I()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},ec=v`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ef=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:n,toasterId:i,containerStyle:s,containerClassName:l})=>{let{toasts:u,handlers:d}=U(r,i);return o.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...s},className:l,onMouseEnter:d.startPause,onMouseLeave:d.endPause},u.map(r=>{let i=r.position||t,s=ed(i,d.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return o.createElement(eu,{id:r.id,key:r.id,onHeightUpdate:d.updateHeight,className:r.visible?ec:"",style:s},"custom"===r.type?k(r.message,r):n?n(r):o.createElement(el,{toast:r,position:i}))}))},ep=M},4660:function(e,t,r){r.d(t,{Ue:function(){return f}});let a=e=>{let t;let r=new Set,a=(e,a)=>{let n="function"==typeof e?e(t):e;if(!Object.is(n,t)){let e=t;t=(null!=a?a:"object"!=typeof n||null===n)?n:Object.assign({},t,n),r.forEach(r=>r(t,e))}},n=()=>t,i={setState:a,getState:n,getInitialState:()=>o,subscribe:e=>(r.add(e),()=>r.delete(e)),destroy:()=>{console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),r.clear()}},o=t=e(a,n,i);return i},n=e=>e?a(e):a;var i=r(2265),o=r(5401);let{useDebugValue:s}=i,{useSyncExternalStoreWithSelector:l}=o,u=!1,d=e=>e,c=e=>{"function"!=typeof e&&console.warn("[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.");let t="function"==typeof e?n(e):e,r=(e,r)=>(function(e,t=d,r){r&&!u&&(console.warn("[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"),u=!0);let a=l(e.subscribe,e.getState,e.getServerState||e.getInitialState,t,r);return s(a),a})(t,e,r);return Object.assign(r,t),r},f=e=>e?c(e):c},4810:function(e,t,r){r.d(t,{tJ:function(){return o}});let a=e=>t=>{try{let r=e(t);if(r instanceof Promise)return r;return{then:e=>a(e)(r),catch(e){return this}}}catch(e){return{then(e){return this},catch:t=>a(t)(e)}}},n=(e,t)=>(r,n,i)=>{let o,s,l={getStorage:()=>localStorage,serialize:JSON.stringify,deserialize:JSON.parse,partialize:e=>e,version:0,merge:(e,t)=>({...t,...e}),...t},u=!1,d=new Set,c=new Set;try{o=l.getStorage()}catch(e){}if(!o)return e((...e)=>{console.warn(`[zustand persist middleware] Unable to update item '${l.name}', the given storage is currently unavailable.`),r(...e)},n,i);let f=a(l.serialize),p=()=>{let e;let t=f({state:l.partialize({...n()}),version:l.version}).then(e=>o.setItem(l.name,e)).catch(t=>{e=t});if(e)throw e;return t},m=i.setState;i.setState=(e,t)=>{m(e,t),p()};let g=e((...e)=>{r(...e),p()},n,i),h=()=>{var e;if(!o)return;u=!1,d.forEach(e=>e(n()));let t=(null==(e=l.onRehydrateStorage)?void 0:e.call(l,n()))||void 0;return a(o.getItem.bind(o))(l.name).then(e=>{if(e)return l.deserialize(e)}).then(e=>{if(e){if("number"!=typeof e.version||e.version===l.version)return e.state;if(l.migrate)return l.migrate(e.state,e.version);console.error("State loaded from storage couldn't be migrated since no migrate function was provided")}}).then(e=>{var t;return r(s=l.merge(e,null!=(t=n())?t:g),!0),p()}).then(()=>{null==t||t(s,void 0),u=!0,c.forEach(e=>e(s))}).catch(e=>{null==t||t(void 0,e)})};return i.persist={setOptions:e=>{l={...l,...e},e.getStorage&&(o=e.getStorage())},clearStorage:()=>{null==o||o.removeItem(l.name)},getOptions:()=>l,rehydrate:()=>h(),hasHydrated:()=>u,onHydrate:e=>(d.add(e),()=>{d.delete(e)}),onFinishHydration:e=>(c.add(e),()=>{c.delete(e)})},h(),s||g},i=(e,t)=>(r,n,i)=>{let o,s={storage:function(e,t){let r;try{r=e()}catch(e){return}return{getItem:e=>{var a;let n=e=>null===e?null:JSON.parse(e,null==t?void 0:t.reviver),i=null!=(a=r.getItem(e))?a:null;return i instanceof Promise?i.then(n):n(i)},setItem:(e,a)=>r.setItem(e,JSON.stringify(a,null==t?void 0:t.replacer)),removeItem:e=>r.removeItem(e)}}(()=>localStorage),partialize:e=>e,version:0,merge:(e,t)=>({...t,...e}),...t},l=!1,u=new Set,d=new Set,c=s.storage;if(!c)return e((...e)=>{console.warn(`[zustand persist middleware] Unable to update item '${s.name}', the given storage is currently unavailable.`),r(...e)},n,i);let f=()=>{let e=s.partialize({...n()});return c.setItem(s.name,{state:e,version:s.version})},p=i.setState;i.setState=(e,t)=>{p(e,t),f()};let m=e((...e)=>{r(...e),f()},n,i);i.getInitialState=()=>m;let g=()=>{var e,t;if(!c)return;l=!1,u.forEach(e=>{var t;return e(null!=(t=n())?t:m)});let i=(null==(t=s.onRehydrateStorage)?void 0:t.call(s,null!=(e=n())?e:m))||void 0;return a(c.getItem.bind(c))(s.name).then(e=>{if(e){if("number"!=typeof e.version||e.version===s.version)return[!1,e.state];if(s.migrate)return[!0,s.migrate(e.state,e.version)];console.error("State loaded from storage couldn't be migrated since no migrate function was provided")}return[!1,void 0]}).then(e=>{var t;let[a,i]=e;if(r(o=s.merge(i,null!=(t=n())?t:m),!0),a)return f()}).then(()=>{null==i||i(o,void 0),o=n(),l=!0,d.forEach(e=>e(o))}).catch(e=>{null==i||i(void 0,e)})};return i.persist={setOptions:e=>{s={...s,...e},e.storage&&(c=e.storage)},clearStorage:()=>{null==c||c.removeItem(s.name)},getOptions:()=>s,rehydrate:()=>g(),hasHydrated:()=>l,onHydrate:e=>(u.add(e),()=>{u.delete(e)}),onFinishHydration:e=>(d.add(e),()=>{d.delete(e)})},s.skipHydration||g(),o||m},o=(e,t)=>"getStorage"in t||"serialize"in t||"deserialize"in t?(console.warn("[DEPRECATED] `getStorage`, `serialize` and `deserialize` options are deprecated. Use `storage` option instead."),n(e,t)):i(e,t)}}]);