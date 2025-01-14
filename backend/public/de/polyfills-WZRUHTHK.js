(function(e){e.ng??={},e.ng.common??={},e.ng.common.locales??={};let t=void 0;function c(n){let i=n,l=Math.floor(Math.abs(n)),d=n.toString().replace(/^[^.]*\.?/,"").length;return l===1&&d===0?1:5;}e.ng.common.locales.de=["de",[["AM","PM"],t,t],t,[["S","M","D","M","D","F","S"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."],["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."]],[["S","M","D","M","D","F","S"],["So","Mo","Di","Mi","Do","Fr","Sa"],["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan.","Feb.","M\xE4rz","Apr.","Mai","Juni","Juli","Aug.","Sept.","Okt.","Nov.","Dez."],["Januar","Februar","M\xE4rz","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","M\xE4r","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],["Januar","Februar","M\xE4rz","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]],[["v. Chr.","n. Chr."],t,t],1,[6,0],["dd.MM.yy","dd.MM.y","d. MMMM y","EEEE, d. MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",t,"{1} 'um' {0}",t],[",",".",";","%","+","-","E","\xB7","\u2030","\u221E","NaN",":"],["#,##0.###","#,##0\xA0%","#,##0.00\xA0\xA4","#E0"],"EUR","\u20AC","Euro",{ATS:["\xF6S"],AUD:["AU$","$"],BGM:["BGK"],BGO:["BGJ"],BYN:[t,"\u0440."],CUC:[t,"Cub$"],DEM:["DM"],FKP:[t,"Fl\xA3"],GHS:[t,"\u20B5"],GNF:[t,"F.G."],KMF:[t,"FC"],PHP:[t,"\u20B1"],RON:[t,"L"],RUR:[t,"\u0440."],RWF:[t,"F.Rw"],SYP:[],THB:["\u0E3F"],TWD:["NT$"],XXX:[],ZMW:[t,"K"]},"ltr",c,[[["Mitternacht","morgens","vorm.","mittags","nachm.","abends","nachts"],t,["Mitternacht","morgens","vormittags","mittags","nachmittags","abends","nachts"]],[["Mitternacht","Morgen","Vorm.","Mittag","Nachm.","Abend","Nacht"],t,["Mitternacht","Morgen","Vormittag","Mittag","Nachmittag","Abend","Nacht"]],["00:00",["05:00","10:00"],["10:00","12:00"],["12:00","13:00"],["13:00","18:00"],["18:00","24:00"],["00:00","05:00"]]]];})(globalThis);var ce=globalThis;function ee(e){return(ce.__Zone_symbol_prefix||"__zone_symbol__")+e;}function _t(){let e=ce.performance;function t(O){e&&e.mark&&e.mark(O);}function c(O,_){e&&e.measure&&e.measure(O,_);}t("Zone");let n=(()=>{class O{static{this.__symbol__=ee;}static assertZonePatched(){if(ce.Promise!==P.ZoneAwarePromise)throw new Error("Zone.js has detected that ZoneAwarePromise `(window|global).Promise` has been overwritten.\nMost likely cause is that a Promise polyfill has been loaded after Zone.js (Polyfilling Promise api is not necessary when zone.js is loaded. If you must load one, do so before loading zone.js.)");}static get root(){let r=O.current;for(;r.parent;)r=r.parent;return r;}static get current(){return b.zone;}static get currentTask(){return N;}static __load_patch(r,o,y=!1){if(P.hasOwnProperty(r)){let S=ce[ee("forceDuplicateZoneCheck")]===!0;if(!y&&S)throw Error("Already loaded patch: "+r);}else if(!ce["__Zone_disable_"+r]){let S="Zone:"+r;t(S),P[r]=o(ce,O,R),c(S,S);}}get parent(){return this._parent;}get name(){return this._name;}constructor(r,o){this._parent=r,this._name=o?o.name||"unnamed":"<root>",this._properties=o&&o.properties||{},this._zoneDelegate=new l(this,this._parent&&this._parent._zoneDelegate,o);}get(r){let o=this.getZoneWith(r);if(o)return o._properties[r];}getZoneWith(r){let o=this;for(;o;){if(o._properties.hasOwnProperty(r))return o;o=o._parent;}return null;}fork(r){if(!r)throw new Error("ZoneSpec required!");return this._zoneDelegate.fork(this,r);}wrap(r,o){if(typeof r!="function")throw new Error("Expecting function got: "+r);let y=this._zoneDelegate.intercept(this,r,o),S=this;return function(){return S.runGuarded(y,this,arguments,o);};}run(r,o,y,S){b={parent:b,zone:this};try{return this._zoneDelegate.invoke(this,r,o,y,S);}finally{b=b.parent;}}runGuarded(r,o=null,y,S){b={parent:b,zone:this};try{try{return this._zoneDelegate.invoke(this,r,o,y,S);}catch(W){if(this._zoneDelegate.handleError(this,W))throw W;}}finally{b=b.parent;}}runTask(r,o,y){if(r.zone!=this)throw new Error("A task can only be run in the zone of creation! (Creation: "+(r.zone||K).name+"; Execution: "+this.name+")");let S=r,{type:W,data:{isPeriodic:j=!1,isRefreshable:ge=!1}={}}=r;if(r.state===J&&(W===G||W===m))return;let ae=r.state!=Z;ae&&S._transitionTo(Z,h);let le=N;N=S,b={parent:b,zone:this};try{W==m&&r.data&&!j&&!ge&&(r.cancelFn=void 0);try{return this._zoneDelegate.invokeTask(this,S,o,y);}catch(ne){if(this._zoneDelegate.handleError(this,ne))throw ne;}}finally{let ne=r.state;if(ne!==J&&ne!==X)if(W==G||j||ge&&ne===k)ae&&S._transitionTo(h,Z,k);else{let f=S._zoneDelegates;this._updateTaskCount(S,-1),ae&&S._transitionTo(J,Z,J),ge&&(S._zoneDelegates=f);}b=b.parent,N=le;}}scheduleTask(r){if(r.zone&&r.zone!==this){let y=this;for(;y;){if(y===r.zone)throw Error(`can not reschedule task to ${this.name} which is descendants of the original zone ${r.zone.name}`);y=y.parent;}}r._transitionTo(k,J);let o=[];r._zoneDelegates=o,r._zone=this;try{r=this._zoneDelegate.scheduleTask(this,r);}catch(y){throw r._transitionTo(X,k,J),this._zoneDelegate.handleError(this,y),y;}return r._zoneDelegates===o&&this._updateTaskCount(r,1),r.state==k&&r._transitionTo(h,k),r;}scheduleMicroTask(r,o,y,S){return this.scheduleTask(new d(B,r,o,y,S,void 0));}scheduleMacroTask(r,o,y,S,W){return this.scheduleTask(new d(m,r,o,y,S,W));}scheduleEventTask(r,o,y,S,W){return this.scheduleTask(new d(G,r,o,y,S,W));}cancelTask(r){if(r.zone!=this)throw new Error("A task can only be cancelled in the zone of creation! (Creation: "+(r.zone||K).name+"; Execution: "+this.name+")");if(!(r.state!==h&&r.state!==Z)){r._transitionTo(H,h,Z);try{this._zoneDelegate.cancelTask(this,r);}catch(o){throw r._transitionTo(X,H),this._zoneDelegate.handleError(this,o),o;}return this._updateTaskCount(r,-1),r._transitionTo(J,H),r.runCount=-1,r;}}_updateTaskCount(r,o){let y=r._zoneDelegates;o==-1&&(r._zoneDelegates=null);for(let S=0;S<y.length;S++)y[S]._updateTaskCount(r.type,o);}}return O;})(),i={name:"",onHasTask:(O,_,r,o)=>O.hasTask(r,o),onScheduleTask:(O,_,r,o)=>O.scheduleTask(r,o),onInvokeTask:(O,_,r,o,y,S)=>O.invokeTask(r,o,y,S),onCancelTask:(O,_,r,o)=>O.cancelTask(r,o)};class l{get zone(){return this._zone;}constructor(_,r,o){this._taskCounts={microTask:0,macroTask:0,eventTask:0},this._zone=_,this._parentDelegate=r,this._forkZS=o&&(o&&o.onFork?o:r._forkZS),this._forkDlgt=o&&(o.onFork?r:r._forkDlgt),this._forkCurrZone=o&&(o.onFork?this._zone:r._forkCurrZone),this._interceptZS=o&&(o.onIntercept?o:r._interceptZS),this._interceptDlgt=o&&(o.onIntercept?r:r._interceptDlgt),this._interceptCurrZone=o&&(o.onIntercept?this._zone:r._interceptCurrZone),this._invokeZS=o&&(o.onInvoke?o:r._invokeZS),this._invokeDlgt=o&&(o.onInvoke?r:r._invokeDlgt),this._invokeCurrZone=o&&(o.onInvoke?this._zone:r._invokeCurrZone),this._handleErrorZS=o&&(o.onHandleError?o:r._handleErrorZS),this._handleErrorDlgt=o&&(o.onHandleError?r:r._handleErrorDlgt),this._handleErrorCurrZone=o&&(o.onHandleError?this._zone:r._handleErrorCurrZone),this._scheduleTaskZS=o&&(o.onScheduleTask?o:r._scheduleTaskZS),this._scheduleTaskDlgt=o&&(o.onScheduleTask?r:r._scheduleTaskDlgt),this._scheduleTaskCurrZone=o&&(o.onScheduleTask?this._zone:r._scheduleTaskCurrZone),this._invokeTaskZS=o&&(o.onInvokeTask?o:r._invokeTaskZS),this._invokeTaskDlgt=o&&(o.onInvokeTask?r:r._invokeTaskDlgt),this._invokeTaskCurrZone=o&&(o.onInvokeTask?this._zone:r._invokeTaskCurrZone),this._cancelTaskZS=o&&(o.onCancelTask?o:r._cancelTaskZS),this._cancelTaskDlgt=o&&(o.onCancelTask?r:r._cancelTaskDlgt),this._cancelTaskCurrZone=o&&(o.onCancelTask?this._zone:r._cancelTaskCurrZone),this._hasTaskZS=null,this._hasTaskDlgt=null,this._hasTaskDlgtOwner=null,this._hasTaskCurrZone=null;let y=o&&o.onHasTask,S=r&&r._hasTaskZS;(y||S)&&(this._hasTaskZS=y?o:i,this._hasTaskDlgt=r,this._hasTaskDlgtOwner=this,this._hasTaskCurrZone=this._zone,o.onScheduleTask||(this._scheduleTaskZS=i,this._scheduleTaskDlgt=r,this._scheduleTaskCurrZone=this._zone),o.onInvokeTask||(this._invokeTaskZS=i,this._invokeTaskDlgt=r,this._invokeTaskCurrZone=this._zone),o.onCancelTask||(this._cancelTaskZS=i,this._cancelTaskDlgt=r,this._cancelTaskCurrZone=this._zone));}fork(_,r){return this._forkZS?this._forkZS.onFork(this._forkDlgt,this.zone,_,r):new n(_,r);}intercept(_,r,o){return this._interceptZS?this._interceptZS.onIntercept(this._interceptDlgt,this._interceptCurrZone,_,r,o):r;}invoke(_,r,o,y,S){return this._invokeZS?this._invokeZS.onInvoke(this._invokeDlgt,this._invokeCurrZone,_,r,o,y,S):r.apply(o,y);}handleError(_,r){return this._handleErrorZS?this._handleErrorZS.onHandleError(this._handleErrorDlgt,this._handleErrorCurrZone,_,r):!0;}scheduleTask(_,r){let o=r;if(this._scheduleTaskZS)this._hasTaskZS&&o._zoneDelegates.push(this._hasTaskDlgtOwner),o=this._scheduleTaskZS.onScheduleTask(this._scheduleTaskDlgt,this._scheduleTaskCurrZone,_,r),o||(o=r);else if(r.scheduleFn)r.scheduleFn(r);else if(r.type==B)U(r);else throw new Error("Task is missing scheduleFn.");return o;}invokeTask(_,r,o,y){return this._invokeTaskZS?this._invokeTaskZS.onInvokeTask(this._invokeTaskDlgt,this._invokeTaskCurrZone,_,r,o,y):r.callback.apply(o,y);}cancelTask(_,r){let o;if(this._cancelTaskZS)o=this._cancelTaskZS.onCancelTask(this._cancelTaskDlgt,this._cancelTaskCurrZone,_,r);else{if(!r.cancelFn)throw Error("Task is not cancelable");o=r.cancelFn(r);}return o;}hasTask(_,r){try{this._hasTaskZS&&this._hasTaskZS.onHasTask(this._hasTaskDlgt,this._hasTaskCurrZone,_,r);}catch(o){this.handleError(_,o);}}_updateTaskCount(_,r){let o=this._taskCounts,y=o[_],S=o[_]=y+r;if(S<0)throw new Error("More tasks executed then were scheduled.");if(y==0||S==0){let W={microTask:o.microTask>0,macroTask:o.macroTask>0,eventTask:o.eventTask>0,change:_};this.hasTask(this._zone,W);}}}class d{constructor(_,r,o,y,S,W){if(this._zone=null,this.runCount=0,this._zoneDelegates=null,this._state="notScheduled",this.type=_,this.source=r,this.data=y,this.scheduleFn=S,this.cancelFn=W,!o)throw new Error("callback is not defined");this.callback=o;let j=this;_===G&&y&&y.useG?this.invoke=d.invokeTask:this.invoke=function(){return d.invokeTask.call(ce,j,this,arguments);};}static invokeTask(_,r,o){_||(_=this),Q++;try{return _.runCount++,_.zone.runTask(_,r,o);}finally{Q==1&&Y(),Q--;}}get zone(){return this._zone;}get state(){return this._state;}cancelScheduleRequest(){this._transitionTo(J,k);}_transitionTo(_,r,o){if(this._state===r||this._state===o)this._state=_,_==J&&(this._zoneDelegates=null);else throw new Error(`${this.type} '${this.source}': can not transition to '${_}', expecting state '${r}'${o?" or '"+o+"'":""}, was '${this._state}'.`);}toString(){return this.data&&typeof this.data.handleId<"u"?this.data.handleId.toString():Object.prototype.toString.call(this);}toJSON(){return{type:this.type,state:this.state,source:this.source,zone:this.zone.name,runCount:this.runCount};}}let T=ee("setTimeout"),p=ee("Promise"),D=ee("then"),g=[],M=!1,L;function $(O){if(L||ce[p]&&(L=ce[p].resolve(0)),L){let _=L[D];_||(_=L.then),_.call(L,O);}else ce[T](O,0);}function U(O){Q===0&&g.length===0&&$(Y),O&&g.push(O);}function Y(){if(!M){for(M=!0;g.length;){let O=g;g=[];for(let _=0;_<O.length;_++){let r=O[_];try{r.zone.runTask(r,null,null);}catch(o){R.onUnhandledError(o);}}}R.microtaskDrainDone(),M=!1;}}let K={name:"NO ZONE"},J="notScheduled",k="scheduling",h="scheduled",Z="running",H="canceling",X="unknown",B="microTask",m="macroTask",G="eventTask",P={},R={symbol:ee,currentZoneFrame:()=>b,onUnhandledError:V,microtaskDrainDone:V,scheduleMicroTask:U,showUncaughtError:()=>!n[ee("ignoreConsoleErrorUncaughtError")],patchEventTarget:()=>[],patchOnProperties:V,patchMethod:()=>V,bindArguments:()=>[],patchThen:()=>V,patchMacroTask:()=>V,patchEventPrototype:()=>V,isIEOrEdge:()=>!1,getGlobalObjects:()=>{},ObjectDefineProperty:()=>V,ObjectGetOwnPropertyDescriptor:()=>{},ObjectCreate:()=>{},ArraySlice:()=>[],patchClass:()=>V,wrapWithCurrentZone:()=>V,filterProperties:()=>[],attachOriginToPatched:()=>V,_redefineProperty:()=>V,patchCallbacks:()=>V,nativeScheduleMicroTask:$},b={parent:null,zone:new n(null,null)},N=null,Q=0;function V(){}return c("Zone","Zone"),n;}function Tt(){let e=globalThis,t=e[ee("forceDuplicateZoneCheck")]===!0;if(e.Zone&&(t||typeof e.Zone.__symbol__!="function"))throw new Error("Zone already loaded.");return e.Zone??=_t(),e.Zone;}var be=Object.getOwnPropertyDescriptor,Ze=Object.defineProperty,xe=Object.getPrototypeOf,mt=Object.create,Et=Array.prototype.slice,$e="addEventListener",He="removeEventListener",Ie=ee($e),Ae=ee(He),ue="true",fe="false",Se=ee("");function Be(e,t){return Zone.current.wrap(e,t);}function ze(e,t,c,n,i){return Zone.current.scheduleMacroTask(e,t,c,n,i);}var x=ee,De=typeof window<"u",ye=De?window:void 0,q=De&&ye||globalThis,pt="removeAttribute";function Fe(e,t){for(let c=e.length-1;c>=0;c--)typeof e[c]=="function"&&(e[c]=Be(e[c],t+"_"+c));return e;}function yt(e,t){let c=e.constructor.name;for(let n=0;n<t.length;n++){let i=t[n],l=e[i];if(l){let d=be(e,i);if(!nt(d))continue;e[i]=(T=>{let p=function(){return T.apply(this,Fe(arguments,c+"."+i));};return de(p,T),p;})(l);}}}function nt(e){return e?e.writable===!1?!1:!(typeof e.get=="function"&&typeof e.set>"u"):!0;}var rt=typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope,Ne=!("nw"in q)&&typeof q.process<"u"&&q.process.toString()==="[object process]",Ue=!Ne&&!rt&&!!(De&&ye.HTMLElement),ot=typeof q.process<"u"&&q.process.toString()==="[object process]"&&!rt&&!!(De&&ye.HTMLElement),we={},kt=x("enable_beforeunload"),qe=function(e){if(e=e||q.event,!e)return;let t=we[e.type];t||(t=we[e.type]=x("ON_PROPERTY"+e.type));let c=this||e.target||q,n=c[t],i;if(Ue&&c===ye&&e.type==="error"){let l=e;i=n&&n.call(this,l.message,l.filename,l.lineno,l.colno,l.error),i===!0&&e.preventDefault();}else i=n&&n.apply(this,arguments),e.type==="beforeunload"&&q[kt]&&typeof i=="string"?e.returnValue=i:i!=null&&!i&&e.preventDefault();return i;};function Ye(e,t,c){let n=be(e,t);if(!n&&c&&be(c,t)&&(n={enumerable:!0,configurable:!0}),!n||!n.configurable)return;let i=x("on"+t+"patched");if(e.hasOwnProperty(i)&&e[i])return;delete n.writable,delete n.value;let l=n.get,d=n.set,T=t.slice(2),p=we[T];p||(p=we[T]=x("ON_PROPERTY"+T)),n.set=function(D){let g=this;if(!g&&e===q&&(g=q),!g)return;typeof g[p]=="function"&&g.removeEventListener(T,qe),d&&d.call(g,null),g[p]=D,typeof D=="function"&&g.addEventListener(T,qe,!1);},n.get=function(){let D=this;if(!D&&e===q&&(D=q),!D)return null;let g=D[p];if(g)return g;if(l){let M=l.call(this);if(M)return n.set.call(this,M),typeof D[pt]=="function"&&D.removeAttribute(t),M;}return null;},Ze(e,t,n),e[i]=!0;}function st(e,t,c){if(t)for(let n=0;n<t.length;n++)Ye(e,"on"+t[n],c);else{let n=[];for(let i in e)i.slice(0,2)=="on"&&n.push(i);for(let i=0;i<n.length;i++)Ye(e,n[i],c);}}var oe=x("originalInstance");function ve(e){let t=q[e];if(!t)return;q[x(e)]=t,q[e]=function(){let i=Fe(arguments,e);switch(i.length){case 0:this[oe]=new t();break;case 1:this[oe]=new t(i[0]);break;case 2:this[oe]=new t(i[0],i[1]);break;case 3:this[oe]=new t(i[0],i[1],i[2]);break;case 4:this[oe]=new t(i[0],i[1],i[2],i[3]);break;default:throw new Error("Arg list too long.");}},de(q[e],t);let c=new t(function(){}),n;for(n in c)e==="XMLHttpRequest"&&n==="responseBlob"||function(i){typeof c[i]=="function"?q[e].prototype[i]=function(){return this[oe][i].apply(this[oe],arguments);}:Ze(q[e].prototype,i,{set:function(l){typeof l=="function"?(this[oe][i]=Be(l,e+"."+i),de(this[oe][i],l)):this[oe][i]=l;},get:function(){return this[oe][i];}});}(n);for(n in t)n!=="prototype"&&t.hasOwnProperty(n)&&(q[e][n]=t[n]);}function he(e,t,c){let n=e;for(;n&&!n.hasOwnProperty(t);)n=xe(n);!n&&e[t]&&(n=e);let i=x(t),l=null;if(n&&(!(l=n[i])||!n.hasOwnProperty(i))){l=n[i]=n[t];let d=n&&be(n,t);if(nt(d)){let T=c(l,i,t);n[t]=function(){return T(this,arguments);},de(n[t],l);}}return l;}function vt(e,t,c){let n=null;function i(l){let d=l.data;return d.args[d.cbIdx]=function(){l.invoke.apply(this,arguments);},n.apply(d.target,d.args),l;}n=he(e,t,l=>function(d,T){let p=c(d,T);return p.cbIdx>=0&&typeof T[p.cbIdx]=="function"?ze(p.name,T[p.cbIdx],p,i):l.apply(d,T);});}function de(e,t){e[x("OriginalDelegate")]=t;}var Ke=!1,Le=!1;function bt(){try{let e=ye.navigator.userAgent;if(e.indexOf("MSIE ")!==-1||e.indexOf("Trident/")!==-1)return!0;}catch{}return!1;}function St(){if(Ke)return Le;Ke=!0;try{let e=ye.navigator.userAgent;(e.indexOf("MSIE ")!==-1||e.indexOf("Trident/")!==-1||e.indexOf("Edge/")!==-1)&&(Le=!0);}catch{}return Le;}function Qe(e){return typeof e=="function";}function et(e){return typeof e=="number";}var pe=!1;if(typeof window<"u")try{let e=Object.defineProperty({},"passive",{get:function(){pe=!0;}});window.addEventListener("test",e,e),window.removeEventListener("test",e,e);}catch{pe=!1;}var Mt={useG:!0},te={},it={},ct=new RegExp("^"+Se+"(\\w+)(true|false)$"),at=x("propagationStopped");function lt(e,t){let c=(t?t(e):e)+fe,n=(t?t(e):e)+ue,i=Se+c,l=Se+n;te[e]={},te[e][fe]=i,te[e][ue]=l;}function Rt(e,t,c,n){let i=n&&n.add||$e,l=n&&n.rm||He,d=n&&n.listeners||"eventListeners",T=n&&n.rmAll||"removeAllListeners",p=x(i),D="."+i+":",g="prependListener",M="."+g+":",L=function(k,h,Z){if(k.isRemoved)return;let H=k.callback;typeof H=="object"&&H.handleEvent&&(k.callback=m=>H.handleEvent(m),k.originalDelegate=H);let X;try{k.invoke(k,h,[Z]);}catch(m){X=m;}let B=k.options;if(B&&typeof B=="object"&&B.once){let m=k.originalDelegate?k.originalDelegate:k.callback;h[l].call(h,Z.type,m,B);}return X;};function $(k,h,Z){if(h=h||e.event,!h)return;let H=k||h.target||e,X=H[te[h.type][Z?ue:fe]];if(X){let B=[];if(X.length===1){let m=L(X[0],H,h);m&&B.push(m);}else{let m=X.slice();for(let G=0;G<m.length&&!(h&&h[at]===!0);G++){let P=L(m[G],H,h);P&&B.push(P);}}if(B.length===1)throw B[0];for(let m=0;m<B.length;m++){let G=B[m];t.nativeScheduleMicroTask(()=>{throw G;});}}}let U=function(k){return $(this,k,!1);},Y=function(k){return $(this,k,!0);};function K(k,h){if(!k)return!1;let Z=!0;h&&h.useG!==void 0&&(Z=h.useG);let H=h&&h.vh,X=!0;h&&h.chkDup!==void 0&&(X=h.chkDup);let B=!1;h&&h.rt!==void 0&&(B=h.rt);let m=k;for(;m&&!m.hasOwnProperty(i);)m=xe(m);if(!m&&k[i]&&(m=k),!m||m[p])return!1;let G=h&&h.eventNameToString,P={},R=m[p]=m[i],b=m[x(l)]=m[l],N=m[x(d)]=m[d],Q=m[x(T)]=m[T],V;h&&h.prepend&&(V=m[x(h.prepend)]=m[h.prepend]);function O(s,u){return!pe&&typeof s=="object"&&s?!!s.capture:!pe||!u?s:typeof s=="boolean"?{capture:s,passive:!0}:s?typeof s=="object"&&s.passive!==!1?{...s,passive:!0}:s:{passive:!0};}let _=function(s){if(!P.isExisting)return R.call(P.target,P.eventName,P.capture?Y:U,P.options);},r=function(s){if(!s.isRemoved){let u=te[s.eventName],v;u&&(v=u[s.capture?ue:fe]);let w=v&&s.target[v];if(w){for(let E=0;E<w.length;E++)if(w[E]===s){w.splice(E,1),s.isRemoved=!0,s.removeAbortListener&&(s.removeAbortListener(),s.removeAbortListener=null),w.length===0&&(s.allRemoved=!0,s.target[v]=null);break;}}}if(s.allRemoved)return b.call(s.target,s.eventName,s.capture?Y:U,s.options);},o=function(s){return R.call(P.target,P.eventName,s.invoke,P.options);},y=function(s){return V.call(P.target,P.eventName,s.invoke,P.options);},S=function(s){return b.call(s.target,s.eventName,s.invoke,s.options);},W=Z?_:o,j=Z?r:S,ge=function(s,u){let v=typeof u;return v==="function"&&s.callback===u||v==="object"&&s.originalDelegate===u;},ae=h&&h.diff?h.diff:ge,le=Zone[x("UNPATCHED_EVENTS")],ne=e[x("PASSIVE_EVENTS")];function f(s){if(typeof s=="object"&&s!==null){let u={...s};return s.signal&&(u.signal=s.signal),u;}return s;}let a=function(s,u,v,w,E=!1,C=!1){return function(){let I=this||e,A=arguments[0];h&&h.transferEventName&&(A=h.transferEventName(A));let z=arguments[1];if(!z)return s.apply(this,arguments);if(Ne&&A==="uncaughtException")return s.apply(this,arguments);let F=!1;if(typeof z!="function"){if(!z.handleEvent)return s.apply(this,arguments);F=!0;}if(H&&!H(s,z,I,arguments))return;let _e=pe&&!!ne&&ne.indexOf(A)!==-1,se=f(O(arguments[2],_e)),Te=se?.signal;if(Te?.aborted)return;if(le){for(let ie=0;ie<le.length;ie++)if(A===le[ie])return _e?s.call(I,A,z,se):s.apply(this,arguments);}let Oe=se?typeof se=="boolean"?!0:se.capture:!1,Ge=se&&typeof se=="object"?se.once:!1,gt=Zone.current,Ce=te[A];Ce||(lt(A,G),Ce=te[A]);let Ve=Ce[Oe?ue:fe],me=I[Ve],We=!1;if(me){if(We=!0,X){for(let ie=0;ie<me.length;ie++)if(ae(me[ie],z))return;}}else me=I[Ve]=[];let Me,Je=I.constructor.name,Xe=it[Je];Xe&&(Me=Xe[A]),Me||(Me=Je+u+(G?G(A):A)),P.options=se,Ge&&(P.options.once=!1),P.target=I,P.capture=Oe,P.eventName=A,P.isExisting=We;let ke=Z?Mt:void 0;ke&&(ke.taskData=P),Te&&(P.options.signal=void 0);let re=gt.scheduleEventTask(Me,z,ke,v,w);if(Te){P.options.signal=Te;let ie=()=>re.zone.cancelTask(re);s.call(Te,"abort",ie,{once:!0}),re.removeAbortListener=()=>Te.removeEventListener("abort",ie);}if(P.target=null,ke&&(ke.taskData=null),Ge&&(P.options.once=!0),!pe&&typeof re.options=="boolean"||(re.options=se),re.target=I,re.capture=Oe,re.eventName=A,F&&(re.originalDelegate=z),C?me.unshift(re):me.push(re),E)return I;};};return m[i]=a(R,D,W,j,B),V&&(m[g]=a(V,M,y,j,B,!0)),m[l]=function(){let s=this||e,u=arguments[0];h&&h.transferEventName&&(u=h.transferEventName(u));let v=arguments[2],w=v?typeof v=="boolean"?!0:v.capture:!1,E=arguments[1];if(!E)return b.apply(this,arguments);if(H&&!H(b,E,s,arguments))return;let C=te[u],I;C&&(I=C[w?ue:fe]);let A=I&&s[I];if(A)for(let z=0;z<A.length;z++){let F=A[z];if(ae(F,E)){if(A.splice(z,1),F.isRemoved=!0,A.length===0&&(F.allRemoved=!0,s[I]=null,!w&&typeof u=="string")){let _e=Se+"ON_PROPERTY"+u;s[_e]=null;}return F.zone.cancelTask(F),B?s:void 0;}}return b.apply(this,arguments);},m[d]=function(){let s=this||e,u=arguments[0];h&&h.transferEventName&&(u=h.transferEventName(u));let v=[],w=ut(s,G?G(u):u);for(let E=0;E<w.length;E++){let C=w[E],I=C.originalDelegate?C.originalDelegate:C.callback;v.push(I);}return v;},m[T]=function(){let s=this||e,u=arguments[0];if(u){h&&h.transferEventName&&(u=h.transferEventName(u));let v=te[u];if(v){let w=v[fe],E=v[ue],C=s[w],I=s[E];if(C){let A=C.slice();for(let z=0;z<A.length;z++){let F=A[z],_e=F.originalDelegate?F.originalDelegate:F.callback;this[l].call(this,u,_e,F.options);}}if(I){let A=I.slice();for(let z=0;z<A.length;z++){let F=A[z],_e=F.originalDelegate?F.originalDelegate:F.callback;this[l].call(this,u,_e,F.options);}}}}else{let v=Object.keys(s);for(let w=0;w<v.length;w++){let E=v[w],C=ct.exec(E),I=C&&C[1];I&&I!=="removeListener"&&this[T].call(this,I);}this[T].call(this,"removeListener");}if(B)return this;},de(m[i],R),de(m[l],b),Q&&de(m[T],Q),N&&de(m[d],N),!0;}let J=[];for(let k=0;k<c.length;k++)J[k]=K(c[k],n);return J;}function ut(e,t){if(!t){let l=[];for(let d in e){let T=ct.exec(d),p=T&&T[1];if(p&&(!t||p===t)){let D=e[d];if(D)for(let g=0;g<D.length;g++)l.push(D[g]);}}return l;}let c=te[t];c||(lt(t),c=te[t]);let n=e[c[fe]],i=e[c[ue]];return n?i?n.concat(i):n.slice():i?i.slice():[];}function wt(e,t){let c=e.Event;c&&c.prototype&&t.patchMethod(c.prototype,"stopImmediatePropagation",n=>function(i,l){i[at]=!0,n&&n.apply(i,l);});}function Dt(e,t){t.patchMethod(e,"queueMicrotask",c=>function(n,i){Zone.current.scheduleMicroTask("queueMicrotask",i[0]);});}var Re=x("zoneTask");function Ee(e,t,c,n){let i=null,l=null;t+=n,c+=n;let d={};function T(D){let g=D.data;g.args[0]=function(){return D.invoke.apply(this,arguments);};let M=i.apply(e,g.args);return et(M)?g.handleId=M:(g.handle=M,g.isRefreshable=Qe(M.refresh)),D;}function p(D){let{handle:g,handleId:M}=D.data;return l.call(e,g??M);}i=he(e,t,D=>function(g,M){if(Qe(M[0])){let L={isRefreshable:!1,isPeriodic:n==="Interval",delay:n==="Timeout"||n==="Interval"?M[1]||0:void 0,args:M},$=M[0];M[0]=function(){try{return $.apply(this,arguments);}finally{let{handle:Z,handleId:H,isPeriodic:X,isRefreshable:B}=L;!X&&!B&&(H?delete d[H]:Z&&(Z[Re]=null));}};let U=ze(t,M[0],L,T,p);if(!U)return U;let{handleId:Y,handle:K,isRefreshable:J,isPeriodic:k}=U.data;if(Y)d[Y]=U;else if(K&&(K[Re]=U,J&&!k)){let h=K.refresh;K.refresh=function(){let{zone:Z,state:H}=U;return H==="notScheduled"?(U._state="scheduled",Z._updateTaskCount(U,1)):H==="running"&&(U._state="scheduling"),h.call(this);};}return K??Y??U;}else return D.apply(e,M);}),l=he(e,c,D=>function(g,M){let L=M[0],$;et(L)?($=d[L],delete d[L]):($=L?.[Re],$?L[Re]=null:$=L),$?.type?$.cancelFn&&$.zone.cancelTask($):D.apply(e,M);});}function Nt(e,t){let{isBrowser:c,isMix:n}=t.getGlobalObjects();if(!c&&!n||!e.customElements||!("customElements"in e))return;let i=["connectedCallback","disconnectedCallback","adoptedCallback","attributeChangedCallback","formAssociatedCallback","formDisabledCallback","formResetCallback","formStateRestoreCallback"];t.patchCallbacks(t,e.customElements,"customElements","define",i);}function Pt(e,t){if(Zone[t.symbol("patchEventTarget")])return;let{eventNames:c,zoneSymbolEventNames:n,TRUE_STR:i,FALSE_STR:l,ZONE_SYMBOL_PREFIX:d}=t.getGlobalObjects();for(let p=0;p<c.length;p++){let D=c[p],g=D+l,M=D+i,L=d+g,$=d+M;n[D]={},n[D][l]=L,n[D][i]=$;}let T=e.EventTarget;if(!(!T||!T.prototype))return t.patchEventTarget(e,t,[T&&T.prototype]),!0;}function Ot(e,t){t.patchEventPrototype(e,t);}function ft(e,t,c){if(!c||c.length===0)return t;let n=c.filter(l=>l.target===e);if(!n||n.length===0)return t;let i=n[0].ignoreProperties;return t.filter(l=>i.indexOf(l)===-1);}function tt(e,t,c,n){if(!e)return;let i=ft(e,t,c);st(e,i,n);}function je(e){return Object.getOwnPropertyNames(e).filter(t=>t.startsWith("on")&&t.length>2).map(t=>t.substring(2));}function Ct(e,t){if(Ne&&!ot||Zone[e.symbol("patchEvents")])return;let c=t.__Zone_ignore_on_properties,n=[];if(Ue){let i=window;n=n.concat(["Document","SVGElement","Element","HTMLElement","HTMLBodyElement","HTMLMediaElement","HTMLFrameSetElement","HTMLFrameElement","HTMLIFrameElement","HTMLMarqueeElement","Worker"]);let l=bt()?[{target:i,ignoreProperties:["error"]}]:[];tt(i,je(i),c&&c.concat(l),xe(i));}n=n.concat(["XMLHttpRequest","XMLHttpRequestEventTarget","IDBIndex","IDBRequest","IDBOpenDBRequest","IDBDatabase","IDBTransaction","IDBCursor","WebSocket"]);for(let i=0;i<n.length;i++){let l=t[n[i]];l&&l.prototype&&tt(l.prototype,je(l.prototype),c);}}function It(e){e.__load_patch("legacy",t=>{let c=t[e.__symbol__("legacyPatch")];c&&c();}),e.__load_patch("timers",t=>{let c="set",n="clear";Ee(t,c,n,"Timeout"),Ee(t,c,n,"Interval"),Ee(t,c,n,"Immediate");}),e.__load_patch("requestAnimationFrame",t=>{Ee(t,"request","cancel","AnimationFrame"),Ee(t,"mozRequest","mozCancel","AnimationFrame"),Ee(t,"webkitRequest","webkitCancel","AnimationFrame");}),e.__load_patch("blocking",(t,c)=>{let n=["alert","prompt","confirm"];for(let i=0;i<n.length;i++){let l=n[i];he(t,l,(d,T,p)=>function(D,g){return c.current.run(d,t,g,p);});}}),e.__load_patch("EventTarget",(t,c,n)=>{Ot(t,n),Pt(t,n);let i=t.XMLHttpRequestEventTarget;i&&i.prototype&&n.patchEventTarget(t,n,[i.prototype]);}),e.__load_patch("MutationObserver",(t,c,n)=>{ve("MutationObserver"),ve("WebKitMutationObserver");}),e.__load_patch("IntersectionObserver",(t,c,n)=>{ve("IntersectionObserver");}),e.__load_patch("FileReader",(t,c,n)=>{ve("FileReader");}),e.__load_patch("on_property",(t,c,n)=>{Ct(n,t);}),e.__load_patch("customElements",(t,c,n)=>{Nt(t,n);}),e.__load_patch("XHR",(t,c)=>{D(t);let n=x("xhrTask"),i=x("xhrSync"),l=x("xhrListener"),d=x("xhrScheduled"),T=x("xhrURL"),p=x("xhrErrorBeforeScheduled");function D(g){let M=g.XMLHttpRequest;if(!M)return;let L=M.prototype;function $(R){return R[n];}let U=L[Ie],Y=L[Ae];if(!U){let R=g.XMLHttpRequestEventTarget;if(R){let b=R.prototype;U=b[Ie],Y=b[Ae];}}let K="readystatechange",J="scheduled";function k(R){let b=R.data,N=b.target;N[d]=!1,N[p]=!1;let Q=N[l];U||(U=N[Ie],Y=N[Ae]),Q&&Y.call(N,K,Q);let V=N[l]=()=>{if(N.readyState===N.DONE)if(!b.aborted&&N[d]&&R.state===J){let _=N[c.__symbol__("loadfalse")];if(N.status!==0&&_&&_.length>0){let r=R.invoke;R.invoke=function(){let o=N[c.__symbol__("loadfalse")];for(let y=0;y<o.length;y++)o[y]===R&&o.splice(y,1);!b.aborted&&R.state===J&&r.call(R);},_.push(R);}else R.invoke();}else!b.aborted&&N[d]===!1&&(N[p]=!0);};return U.call(N,K,V),N[n]||(N[n]=R),G.apply(N,b.args),N[d]=!0,R;}function h(){}function Z(R){let b=R.data;return b.aborted=!0,P.apply(b.target,b.args);}let H=he(L,"open",()=>function(R,b){return R[i]=b[2]==!1,R[T]=b[1],H.apply(R,b);}),X="XMLHttpRequest.send",B=x("fetchTaskAborting"),m=x("fetchTaskScheduling"),G=he(L,"send",()=>function(R,b){if(c.current[m]===!0||R[i])return G.apply(R,b);{let N={target:R,url:R[T],isPeriodic:!1,args:b,aborted:!1},Q=ze(X,h,N,k,Z);R&&R[p]===!0&&!N.aborted&&Q.state===J&&Q.invoke();}}),P=he(L,"abort",()=>function(R,b){let N=$(R);if(N&&typeof N.type=="string"){if(N.cancelFn==null||N.data&&N.data.aborted)return;N.zone.cancelTask(N);}else if(c.current[B]===!0)return P.apply(R,b);});}}),e.__load_patch("geolocation",t=>{t.navigator&&t.navigator.geolocation&&yt(t.navigator.geolocation,["getCurrentPosition","watchPosition"]);}),e.__load_patch("PromiseRejectionEvent",(t,c)=>{function n(i){return function(l){ut(t,i).forEach(T=>{let p=t.PromiseRejectionEvent;if(p){let D=new p(i,{promise:l.promise,reason:l.rejection});T.invoke(D);}});};}t.PromiseRejectionEvent&&(c[x("unhandledPromiseRejectionHandler")]=n("unhandledrejection"),c[x("rejectionHandledHandler")]=n("rejectionhandled"));}),e.__load_patch("queueMicrotask",(t,c,n)=>{Dt(t,n);});}function At(e){e.__load_patch("ZoneAwarePromise",(t,c,n)=>{let i=Object.getOwnPropertyDescriptor,l=Object.defineProperty;function d(f){if(f&&f.toString===Object.prototype.toString){let a=f.constructor&&f.constructor.name;return(a||"")+": "+JSON.stringify(f);}return f?f.toString():Object.prototype.toString.call(f);}let T=n.symbol,p=[],D=t[T("DISABLE_WRAPPING_UNCAUGHT_PROMISE_REJECTION")]!==!1,g=T("Promise"),M=T("then"),L="__creationTrace__";n.onUnhandledError=f=>{if(n.showUncaughtError()){let a=f&&f.rejection;a?console.error("Unhandled Promise rejection:",a instanceof Error?a.message:a,"; Zone:",f.zone.name,"; Task:",f.task&&f.task.source,"; Value:",a,a instanceof Error?a.stack:void 0):console.error(f);}},n.microtaskDrainDone=()=>{for(;p.length;){let f=p.shift();try{f.zone.runGuarded(()=>{throw f.throwOriginal?f.rejection:f;});}catch(a){U(a);}}};let $=T("unhandledPromiseRejectionHandler");function U(f){n.onUnhandledError(f);try{let a=c[$];typeof a=="function"&&a.call(this,f);}catch{}}function Y(f){return f&&f.then;}function K(f){return f;}function J(f){return j.reject(f);}let k=T("state"),h=T("value"),Z=T("finally"),H=T("parentPromiseValue"),X=T("parentPromiseState"),B="Promise.then",m=null,G=!0,P=!1,R=0;function b(f,a){return s=>{try{O(f,a,s);}catch(u){O(f,!1,u);}};}let N=function(){let f=!1;return function(s){return function(){f||(f=!0,s.apply(null,arguments));};};},Q="Promise resolved with itself",V=T("currentTaskTrace");function O(f,a,s){let u=N();if(f===s)throw new TypeError(Q);if(f[k]===m){let v=null;try{(typeof s=="object"||typeof s=="function")&&(v=s&&s.then);}catch(w){return u(()=>{O(f,!1,w);})(),f;}if(a!==P&&s instanceof j&&s.hasOwnProperty(k)&&s.hasOwnProperty(h)&&s[k]!==m)r(s),O(f,s[k],s[h]);else if(a!==P&&typeof v=="function")try{v.call(s,u(b(f,a)),u(b(f,!1)));}catch(w){u(()=>{O(f,!1,w);})();}else{f[k]=a;let w=f[h];if(f[h]=s,f[Z]===Z&&a===G&&(f[k]=f[X],f[h]=f[H]),a===P&&s instanceof Error){let E=c.currentTask&&c.currentTask.data&&c.currentTask.data[L];E&&l(s,V,{configurable:!0,enumerable:!1,writable:!0,value:E});}for(let E=0;E<w.length;)o(f,w[E++],w[E++],w[E++],w[E++]);if(w.length==0&&a==P){f[k]=R;let E=s;try{throw new Error("Uncaught (in promise): "+d(s)+(s&&s.stack?`
`+s.stack:""));}catch(C){E=C;}D&&(E.throwOriginal=!0),E.rejection=s,E.promise=f,E.zone=c.current,E.task=c.currentTask,p.push(E),n.scheduleMicroTask();}}}return f;}let _=T("rejectionHandledHandler");function r(f){if(f[k]===R){try{let a=c[_];a&&typeof a=="function"&&a.call(this,{rejection:f[h],promise:f});}catch{}f[k]=P;for(let a=0;a<p.length;a++)f===p[a].promise&&p.splice(a,1);}}function o(f,a,s,u,v){r(f);let w=f[k],E=w?typeof u=="function"?u:K:typeof v=="function"?v:J;a.scheduleMicroTask(B,()=>{try{let C=f[h],I=!!s&&Z===s[Z];I&&(s[H]=C,s[X]=w);let A=a.run(E,void 0,I&&E!==J&&E!==K?[]:[C]);O(s,!0,A);}catch(C){O(s,!1,C);}},s);}let y="function ZoneAwarePromise() { [native code] }",S=function(){},W=t.AggregateError;class j{static toString(){return y;}static resolve(a){return a instanceof j?a:O(new this(null),G,a);}static reject(a){return O(new this(null),P,a);}static withResolvers(){let a={};return a.promise=new j((s,u)=>{a.resolve=s,a.reject=u;}),a;}static any(a){if(!a||typeof a[Symbol.iterator]!="function")return Promise.reject(new W([],"All promises were rejected"));let s=[],u=0;try{for(let E of a)u++,s.push(j.resolve(E));}catch{return Promise.reject(new W([],"All promises were rejected"));}if(u===0)return Promise.reject(new W([],"All promises were rejected"));let v=!1,w=[];return new j((E,C)=>{for(let I=0;I<s.length;I++)s[I].then(A=>{v||(v=!0,E(A));},A=>{w.push(A),u--,u===0&&(v=!0,C(new W(w,"All promises were rejected")));});});}static race(a){let s,u,v=new this((C,I)=>{s=C,u=I;});function w(C){s(C);}function E(C){u(C);}for(let C of a)Y(C)||(C=this.resolve(C)),C.then(w,E);return v;}static all(a){return j.allWithCallback(a);}static allSettled(a){return(this&&this.prototype instanceof j?this:j).allWithCallback(a,{thenCallback:u=>({status:"fulfilled",value:u}),errorCallback:u=>({status:"rejected",reason:u})});}static allWithCallback(a,s){let u,v,w=new this((A,z)=>{u=A,v=z;}),E=2,C=0,I=[];for(let A of a){Y(A)||(A=this.resolve(A));let z=C;try{A.then(F=>{I[z]=s?s.thenCallback(F):F,E--,E===0&&u(I);},F=>{s?(I[z]=s.errorCallback(F),E--,E===0&&u(I)):v(F);});}catch(F){v(F);}E++,C++;}return E-=2,E===0&&u(I),w;}constructor(a){let s=this;if(!(s instanceof j))throw new Error("Must be an instanceof Promise.");s[k]=m,s[h]=[];try{let u=N();a&&a(u(b(s,G)),u(b(s,P)));}catch(u){O(s,!1,u);}}get[Symbol.toStringTag](){return"Promise";}get[Symbol.species](){return j;}then(a,s){let u=this.constructor?.[Symbol.species];(!u||typeof u!="function")&&(u=this.constructor||j);let v=new u(S),w=c.current;return this[k]==m?this[h].push(w,v,a,s):o(this,w,v,a,s),v;}catch(a){return this.then(null,a);}finally(a){let s=this.constructor?.[Symbol.species];(!s||typeof s!="function")&&(s=j);let u=new s(S);u[Z]=Z;let v=c.current;return this[k]==m?this[h].push(v,u,a,a):o(this,v,u,a,a),u;}}j.resolve=j.resolve,j.reject=j.reject,j.race=j.race,j.all=j.all;let ge=t[g]=t.Promise;t.Promise=j;let ae=T("thenPatched");function le(f){let a=f.prototype,s=i(a,"then");if(s&&(s.writable===!1||!s.configurable))return;let u=a.then;a[M]=u,f.prototype.then=function(v,w){return new j((C,I)=>{u.call(this,C,I);}).then(v,w);},f[ae]=!0;}n.patchThen=le;function ne(f){return function(a,s){let u=f.apply(a,s);if(u instanceof j)return u;let v=u.constructor;return v[ae]||le(v),u;};}return ge&&(le(ge),he(t,"fetch",f=>ne(f))),Promise[c.__symbol__("uncaughtPromiseErrors")]=p,j;});}function Lt(e){e.__load_patch("toString",t=>{let c=Function.prototype.toString,n=x("OriginalDelegate"),i=x("Promise"),l=x("Error"),d=function(){if(typeof this=="function"){let g=this[n];if(g)return typeof g=="function"?c.call(g):Object.prototype.toString.call(g);if(this===Promise){let M=t[i];if(M)return c.call(M);}if(this===Error){let M=t[l];if(M)return c.call(M);}}return c.call(this);};d[n]=c,Function.prototype.toString=d;let T=Object.prototype.toString,p="[object Promise]";Object.prototype.toString=function(){return typeof Promise=="function"&&this instanceof Promise?p:T.call(this);};});}function jt(e,t,c,n,i){let l=Zone.__symbol__(n);if(t[l])return;let d=t[l]=t[n];t[n]=function(T,p,D){return p&&p.prototype&&i.forEach(function(g){let M=`${c}.${n}::`+g,L=p.prototype;try{if(L.hasOwnProperty(g)){let $=e.ObjectGetOwnPropertyDescriptor(L,g);$&&$.value?($.value=e.wrapWithCurrentZone($.value,M),e._redefineProperty(p.prototype,g,$)):L[g]&&(L[g]=e.wrapWithCurrentZone(L[g],M));}else L[g]&&(L[g]=e.wrapWithCurrentZone(L[g],M));}catch{}}),d.call(t,T,p,D);},e.attachOriginToPatched(t[n],d);}function Zt(e){e.__load_patch("util",(t,c,n)=>{let i=je(t);n.patchOnProperties=st,n.patchMethod=he,n.bindArguments=Fe,n.patchMacroTask=vt;let l=c.__symbol__("BLACK_LISTED_EVENTS"),d=c.__symbol__("UNPATCHED_EVENTS");t[d]&&(t[l]=t[d]),t[l]&&(c[l]=c[d]=t[l]),n.patchEventPrototype=wt,n.patchEventTarget=Rt,n.isIEOrEdge=St,n.ObjectDefineProperty=Ze,n.ObjectGetOwnPropertyDescriptor=be,n.ObjectCreate=mt,n.ArraySlice=Et,n.patchClass=ve,n.wrapWithCurrentZone=Be,n.filterProperties=ft,n.attachOriginToPatched=de,n._redefineProperty=Object.defineProperty,n.patchCallbacks=jt,n.getGlobalObjects=()=>({globalSources:it,zoneSymbolEventNames:te,eventNames:i,isBrowser:Ue,isMix:ot,isNode:Ne,TRUE_STR:ue,FALSE_STR:fe,ZONE_SYMBOL_PREFIX:Se,ADD_EVENT_LISTENER_STR:$e,REMOVE_EVENT_LISTENER_STR:He});});}function xt(e){At(e),Lt(e),Zt(e);}var ht=Tt();xt(ht);It(ht);var $t=":";function Ht(e,t){for(let c=1,n=1;c<e.length;c++,n++)if(t[n]==="\\")n++;else if(e[c]===$t)return c;throw new Error(`Unterminated $localize metadata block in "${t}".`);}var Pe=function(e,...t){if(Pe.translate){let n=Pe.translate(e,t);e=n[0],t=n[1];}let c=dt(e[0],e.raw[0]);for(let n=1;n<e.length;n++)c+=t[n-1]+dt(e[n],e.raw[n]);return c;},Bt=":";function dt(e,t){return t.charAt(0)===Bt?e.substring(Ht(e,t)+1):e;}globalThis.$localize=Pe;(globalThis.$localize??={}).locale="de";/**i18n:1964dde12af7df15d0053ab7761c4e4c56fe7eae085ef9e01bc7588ce5d2189d*/