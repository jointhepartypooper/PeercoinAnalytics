var q=Object.defineProperty;var W=(o,e,t)=>e in o?q(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var x=(o,e,t)=>(W(o,typeof e!="symbol"?e+"":e,t),t);import{B as J,a as Y,C as Z,E as L,F as D,K as Q,R as X,S as ee,b as te,T as ae,c as se,d as ne,e as oe,V as re,f as ie,g as ce,h as le,i as ue,j as de,k as pe,l as ve,m as _,n as fe,o as he,p as ge,q as k,r as m,s as be,t as me,u as we,v as ye,w as Te,x as xe,y as P,z as w,A as Se,D as Re,G as A,H as Ce,I as Pe,J as _e,L as ke,M as Ae,N as Be,O as Ee,P as Me,Q as Ve,U as Ie,W as Ne,X as De,Y as He,Z as $e,_ as je,$ as ze,a0 as Ue,a1 as Ke,a2 as Oe,a3 as Fe,a4 as Ge,a5 as qe,a6 as We,a7 as Je,a8 as Ye,a9 as Ze,aa as Le,ab as Qe,ac as Xe,ad as et,ae as tt,af as at,ag as st,ah as nt,ai as ot,aj as H,ak as rt,al as it,am as ct,an as lt,ao as ut,ap as dt,aq as pt,ar as vt,as as ft,at as ht,au as gt,av as bt,aw as mt,ax as wt,ay as yt,az as B,aA as $,aB as Tt,aC as xt,aD as j,aE as St,aF as Rt,aG as Ct,aH as b,aI as Pt,aJ as _t,aK as kt,aL as At,aM as Bt,aN as Et,aO as Mt,aP as Vt,aQ as It,aR as Nt,aS as Dt,aT as Ht,aU as $t,aV as jt,aW as zt,aX as Ut,aY as Kt,aZ as Ot,a_ as Ft,a$ as Gt,b0 as qt,b1 as Wt,b2 as Jt,b3 as Yt,b4 as Zt,b5 as Lt,b6 as Qt,b7 as S,b8 as Xt,b9 as ea,ba as ta,bb as aa,bc as sa,bd as na,be as oa,bf as ra,bg as ia,bh as ca,bi as la,bj as z,bk as ua,bl as da,bm as pa,bn as va,bo as fa,bp as ha,bq as ga,br as ba,bs as g,bt as ma,bu as U,bv as wa,bw as ya,bx as Ta,by as xa,bz as Sa,bA as Ra,bB as Ca,bC as Pa,bD as _a,bE as E,bF as ka,bG as Aa,bH as M,bI as Ba}from"./index-dkZJ18MN.js";const Ea=()=>{},Ma=Object.freeze(Object.defineProperty({__proto__:null,BaseTransition:J,BaseTransitionPropsValidators:Y,Comment:Z,EffectScope:L,Fragment:D,KeepAlive:Q,ReactiveEffect:X,Static:ee,Suspense:te,Teleport:ae,Text:se,Transition:ne,TransitionGroup:oe,VueElement:re,assertNumber:ie,callWithAsyncErrorHandling:ce,callWithErrorHandling:le,camelize:ue,capitalize:de,cloneVNode:pe,compatUtils:ve,compile:Ea,computed:_,createApp:fe,createBlock:he,createCommentVNode:ge,createElementBlock:k,createElementVNode:m,createHydrationRenderer:be,createPropsRestProxy:me,createRenderer:we,createSSRApp:ye,createSlots:Te,createStaticVNode:xe,createTextVNode:P,createVNode:w,customRef:Se,defineAsyncComponent:Re,defineComponent:A,defineCustomElement:Ce,defineEmits:Pe,defineExpose:_e,defineModel:ke,defineOptions:Ae,defineProps:Be,defineSSRCustomElement:Ee,defineSlots:Me,get devtools(){return Ve},effect:Ie,effectScope:Ne,getCurrentInstance:De,getCurrentScope:He,getTransitionRawChildren:$e,guardReactiveProps:je,h:ze,handleError:Ue,hasInjectionContext:Ke,hydrate:Oe,initCustomFormatter:Fe,initDirectivesForSSR:Ge,inject:qe,isMemoSame:We,isProxy:Je,isReactive:Ye,isReadonly:Ze,isRef:Le,isRuntimeOnly:Qe,isShallow:Xe,isVNode:et,markRaw:tt,mergeDefaults:at,mergeModels:st,mergeProps:nt,nextTick:ot,normalizeClass:H,normalizeProps:rt,normalizeStyle:it,onActivated:ct,onBeforeMount:lt,onBeforeUnmount:ut,onBeforeUpdate:dt,onDeactivated:pt,onErrorCaptured:vt,onMounted:ft,onRenderTracked:ht,onRenderTriggered:gt,onScopeDispose:bt,onServerPrefetch:mt,onUnmounted:wt,onUpdated:yt,openBlock:B,popScopeId:$,provide:Tt,proxyRefs:xt,pushScopeId:j,queuePostFlushCb:St,reactive:Rt,readonly:Ct,ref:b,registerRuntimeCompiler:Pt,render:_t,renderList:kt,renderSlot:At,resolveComponent:Bt,resolveDirective:Et,resolveDynamicComponent:Mt,resolveFilter:Vt,resolveTransitionHooks:It,setBlockTracking:Nt,setDevtoolsHook:Dt,setTransitionHooks:Ht,shallowReactive:$t,shallowReadonly:jt,shallowRef:zt,ssrContextKey:Ut,ssrUtils:Kt,stop:Ot,toDisplayString:Ft,toHandlerKey:Gt,toHandlers:qt,toRaw:Wt,toRef:Jt,toRefs:Yt,toValue:Zt,transformVNodeArgs:Lt,triggerRef:Qt,unref:S,useAttrs:Xt,useCssModule:ea,useCssVars:ta,useModel:aa,useSSRContext:sa,useSlots:na,useTransitionState:oa,vModelCheckbox:ra,vModelDynamic:ia,vModelRadio:ca,vModelSelect:la,vModelText:z,vShow:ua,version:da,warn:pa,watch:va,watchEffect:fa,watchPostEffect:ha,watchSyncEffect:ga,withAsyncContext:ba,withCtx:g,withDefaults:ma,withDirectives:U,withKeys:wa,withMemo:ya,withModifiers:Ta,withScopeId:xa},Symbol.toStringTag,{value:"Module"})),V=365*24*3600,I=24*3600;class Va{constructor(e){x(this,"client");x(this,"BlockHeaderSize",80);x(this,"Transactions",[]);this.client=e}getTransaction(e){const t=this.Transactions.find(s=>s.txid===e);return t||null}async fetchTransactions(e){for(let t=0;t<e.length;t++){const s=e[t],n=await this.getRawTransaction(s);if(!n)console.log("unable to get raw transaction "+s);else{if(!this.isEven(n.length))throw n+" is not even";const c=await this.getDecodedTransaction(n);if(!c)throw"unable to get getDecodedTransaction "+n;this.Transactions.push(c)}}return this.Transactions}isEven(e){return e%2==0}expavgint(e,t){const n=new Date("2020-06-05T01:00:00Z").getTime()/1e3,c=1,p=5;let u=0,l=0;return e<n?(l=l+c*(n-e),u=n):u=e,n<t?l=l+p*(t-u):l=l+c*(t-u),.75*l/(t-e)}async procdata(e){if(!e)return[];let t=[...e];t.sort((l,d)=>l.time-d.time);const s=[],n=[];for(let l=0;l<t.length;l++){let d=t[l].txid;s.includes(d)||(s.push(d),n.push(l))}const c=[],p=t[0].hash;let u=0;for(let l=0;l<n.length;l++){let d=n[l],r=t[d],a=0;if(this.isCoinstake(r)){const i=await this.getRawTransaction(r.vin[0].txid),y=(await this.getDecodedTransaction(i)).vout[r.vin[0].vout].value,h=r.vout[r.vout.length-1].value;a=a+h-y,u=u+a,c.push({date:r.time,amount:a,tag:"Mint by stake",amtTotal:u})}else{for(let i=0;i<r.vout.length;i++)r.vout[i].scriptPubKey.address&&r.vout[i].scriptPubKey.address===p&&(a=a+Number(r.vout[i].value));for(let i=0;i<r.vin.length;i++){const v=r.vin[i],y=await this.getRawTransaction(v.txid),h=await this.getDecodedTransaction(y),C=v.vout;h.vout[C].scriptPubKey.address&&h.vout[C].scriptPubKey.address===p&&(a=a-h.vout[C].value)}u=u+a,c.push({date:r.time,amount:a,tag:"Send/Receive",amtTotal:u})}}return c}datedata(e,t,s){let n=this.calcintrst(e,t,s),c=[],p=[],u=[];n.interest>this.expavgint(e,t)?console.log("You were a CONTINUOUS minter during this period"):console.log("You were a PERIODIC minter during this period");for(let i=e;i<t;i=i+I){let v=this.calcintrst(i-V,i,s),y=new Date(i*1e3);c.push(y),p.push(v.interest);let h=this.calcintrst(e,i,s);u.push(h.rewardpercent)}const l=this.posreward(e,t,s),d=l.posdate,r=l.posreward,a=l.posdatediff;return[{xAxis:c,yAxis:p},{xAxis:c,yAxis:u},{xAxis:d,yAxis:r},{xAxis:d,yAxis:a}]}posreward(e,t,s){const n=[],c=[],p=[];let u=-1;for(let l=0;l<s.length;l++){const d=s[l];if(d.date>e&&d.date<t&&d.tag==="Mint by stake")if(u++,n.push(d.date),c.push(d.amount),u>0){const r=(n[u]-n[u-1])/I;p.push(r)}else p[0]=0}return{posdate:n,posreward:c,posdatediff:p}}calcintrst(e,t,s){let n=0,c=0,p=s.length,u=0;for(let a=0;a<s.length;a++){const i=s[a];i.date>e&&i.date<t&&(u==0&&a>0?n=n+s[a-1].amtTotal*(i.date-e):a+1===p||s[a+1].amtTotal>t?n=n+i.amtTotal*(t-i.amtTotal):n=n+i.amtTotal*(s[a+1].date-i.date),i.tag==="Mint by stake"&&(c=c+i.amount),u=1)}const l=n/(t-e),d=100*c*V/n,r=100*c*(t-e)/(n*1);return{avg:l,reward:c,interest:d,rewardpercent:r}}isCoinstake(e){return e.vin.length===1&&e.vout.length>1&&e.vout[0].value<1e-6}async getRawTransaction(e){try{return e?await this.client.getRawTransaction(e,0):null}catch(t){console.error(t)}return null}async getDecodedTransaction(e){try{return e?await this.client.decodeRawTransaction(e):null}catch(t){console.error(t)}return null}}const Ia=Sa("transactions",()=>{const o=b({}),e=b({}),t=b(""),s=b([]);_(()=>s.value.length);function n(){s.value=[],t.value="",o.value={},e.value={}}function c(u){const l=Array.from(new Set([...u,...s.value]));s.value=l}function p(u){let l={},d={};for(let r=0;r<u.length;r++){const a=u[r];l[a.hash]=a,d[a.time]=a}o.value=l,e.value=d}return{txMapHash:o,txMapTime:e,address:t,txids:s,addTxRange:c,clear:n,setMaps:p}});var T={};const Na=Ra(Ma);Object.defineProperty(T,"__esModule",{value:!0});var f=Na;const K={instance:null},O=Symbol("Vue3Progress"),F=()=>K.instance||f.inject(O);function G(o){const e={interval:null},t=f.ref(0),s=()=>{e.interval&&(clearInterval(e.interval),e.interval=null)},n=()=>{t.value=Math.min(t.value+Da(t.value),100)},c=()=>{s(),o.active?(t.value=0,e.interval=setInterval(()=>n(),300)):(t.value=100,e.interval=setInterval(()=>t.value=0,500))};return f.watch(()=>o.active,()=>{c()}),f.onBeforeUnmount(()=>s()),o.active&&c(),{value:t}}function Da(o){return o<20?10:o<50?4:o<80?2:o<99?.5:0}var R=f.defineComponent({name:"Vue3ProgressBar",setup:()=>{const o=F().state(),{value:e}=G(o);return{state:o,value:e}},computed:{style(){return{transform:`translate3d(${this.value-100}%,0,0)`}}}});const Ha=["active"];function $a(o,e,t,s,n,c){return f.openBlock(),f.createElementBlock("div",{class:"vue3-progress-bar-container",active:o.state.active},[f.createElementVNode("div",{class:"vue3-progress-bar",style:f.normalizeStyle(o.style)},null,4)],8,Ha)}R.render=$a;R.__file="src/ProgressBar.vue";const N=f.reactive({active:!1}),ja=()=>{const o={inflight:0},e=()=>{N.active=o.inflight>0},t=s=>({finish:()=>{s.used||(s.used=!0,o.inflight--,e())}});return{start(){return o.inflight++,e(),t({used:!1})},attach(s){const n=this.start();return s.then(()=>n.finish(),()=>n.finish()),s},state(){return N}}},za={install:(o,e)=>{const t=ja();o.provide(O,t),o.config.globalProperties.$progress=t,(!e||!e.disableGlobalInstance)&&(K.instance=t),o.component("Vue3ProgressBar",R)}};T.ProgressBar=R;T.Vue3ProgressPlugin=za;T.trickleComposable=G;var Ua=T.useProgress=F;const Ka=o=>(j("data-v-3bc777db"),o=o(),$(),o),Oa={class:"input-group"},Fa=Ka(()=>m("span",{class:"input-group-text"},"Address",-1)),Ga=["disabled"],qa=A({__name:"CollectTransactions",setup(o){const e=Ca(),t=Ia(),s=Pa(),n=b(!1),c=b(""),p=_(()=>{if(c.value){const r=c.value;return new RegExp(/^(pc1|[Pp])[a-km-zA-HJ-NP-Z1-9]{25,34}$/).test(r)==!0}return!1});async function u(){if(n.value)return;n.value=!0;const r=await d(c.value);if(r&&r.addrStr){const a=l(r.transactions);Ua().attach(a),await a,t.clear(),t.address=r.addrStr,t.addTxRange(r.transactions)}n.value=!1}async function l(r){return await new Va(new Aa("localhost",s.name,s.password,s.port)).fetchTransactions(r),[]}async function d(r){try{let a=[],i=1,v=(await M.get("https://blockbook.peercoin.net/api/address/"+r+"?page="+i,void 0)).data;if(a=[...a,...v.transactions],v&&v.totalPages>v.page)do i++,v=(await M.get("https://blockbook.peercoin.net/api/address/"+r+"?page="+i,void 0)).data,a=[...a,...v.transactions];while(v.totalPages>v.page);return{addrStr:v.addrStr,transactions:a}}catch(a){console.error(a)}return null}return(r,a)=>(B(),k(D,null,[w(E,null,{icon:g(()=>[w(S(_a))]),heading:g(()=>[P("Transactions")]),default:g(()=>[m("div",Oa,[Fa,U(m("input",{id:"peercoinAddressinp",class:H(["form-control",{invalid:!!c.value&&!p.value}]),type:"text","onUpdate:modelValue":a[0]||(a[0]=i=>c.value=i)},null,2),[[z,c.value]]),m("button",{disabled:!p.value,class:"btn btn-outline-success",type:"button",onClick:u}," Get transactions ids ",8,Ga)])]),_:1}),w(E,null,{icon:g(()=>[w(S(ka))]),heading:g(()=>[P("Next tab")]),default:g(()=>[m("button",{type:"button",class:"btn btn-success",onClick:a[1]||(a[1]=i=>S(e).push({name:"address"}))}," Next ")]),_:1})],64))}}),Wa=Ba(qa,[["__scopeId","data-v-3bc777db"]]),Ja={class:"collectTransactions"},La=A({__name:"AddressView",setup(o){return(e,t)=>(B(),k("div",Ja,[w(Wa)]))}});export{La as default};
