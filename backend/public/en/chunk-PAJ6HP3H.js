import{b as $}from"./chunk-PM5VPY4S.js";import{A as E,C as M,Ia as I,Ja as G,L as A,Ma as p,N as l,Na as m,Oa as f,U as O,Z as g,aa as x,ca as T,ea as w,ga as c,ka as o,la as _,ma as h,ob as L,pa as N,sa as u,tb as b,ub as U,w as v,wa as a,xa as r,xb as k,z as S}from"./chunk-V52KVE3Z.js";function V(n,d){if(n&1&&h(0,"i"),n&2){let t=r();w("bi bi-",t.offIcon," text-xs text-slate-400");}}function H(n,d){if(n&1&&h(0,"i"),n&2){let t=r();w("text-sm text-indigo-600 bi bi-",t.onIcon,"");}}var B=(()=>{class n{labelOff="Off";labelOn="Open";onIcon;offIcon;changed=new M();value=!1;valueChange=new M();toggle(){this.value=!this.value,this.valueChange.emit(this.value);}static ɵfac=function(i){return new(i||n)();};static ɵcmp=O({type:n,selectors:[["rw-toggle"]],inputs:{labelOff:"labelOff",labelOn:"labelOn",onIcon:"onIcon",offIcon:"offIcon",value:"value"},outputs:{changed:"changed",valueChange:"valueChange"},decls:14,vars:36,consts:[[1,"flex"],[1,"select-none","cursor-pointer","pt-1",3,"click"],[1,"px-1.5"],["type","button","role","switch","aria-checked","false",1,"relative","inline-flex","h-8","w-16","flex-shrink-0","cursor-pointer","rounded-full","border-2","border-transparent","transition-colors","duration-300","ease-in-out","focus:outline-none","focus:ring-2","focus:ring-indigo-500","focus:ring-offset-2",3,"click"],[1,"sr-only"],[1,"pointer-events-none","relative","inline-block","h-7","w-7","transform","rounded-full","bg-white","shadow","ring-0","transition","duration-300","ease-in-out"],["aria-hidden","true",1,"opacity-100","ease-in","duration-300","absolute","inset-0","flex","h-full","w-full","items-center","justify-center","transition-opacity"],[3,"class"],["aria-hidden","true",1,"absolute","inset-0","flex","h-full","w-full","items-center","justify-center","transition-opacity"],[1,"select-none","cursor-pointer","text-base","pt-1",3,"click"]],template:function(i,e){i&1&&(o(0,"div",0)(1,"div",1),a("click",function(){return e.toggle();}),I(2),_(),o(3,"div",2)(4,"button",3),a("click",function(){return e.toggle();}),o(5,"span",4),I(6,"Use setting"),_(),o(7,"span",5)(8,"span",6),g(9,V,1,3,"i",7),_(),o(10,"span",8),g(11,H,1,3,"i",7),_()()()(),o(12,"div",9),a("click",function(){return e.toggle();}),I(13),_()()),i&2&&(l(2),G(e.labelOff),l(2),T("bg-indigo-600",e.value)("bg-slate-200",!e.value),l(3),T("translate-x-8",e.value)("translate-x-0",!e.value),l(),T("opacity-0",e.value)("ease-out",e.value)("duration-100",e.value)("opacity-100",!e.value)("ease-in",!e.value)("duration-300",!e.value),l(),c(e.offIcon?9:-1),l(),T("opacity-100",e.value)("ease-in",e.value)("duration-300",e.value)("opacity-0",!e.value)("ease-out",!e.value)("duration-100",!e.value),l(),c(e.onIcon?11:-1),l(2),G(e.labelOn));},encapsulation:2});}return n;})();function K(n,d){if(n&1){let t=N();o(0,"rw-button",10),a("clicked",function(){S(t);let e=r();return E(e.close());}),_();}}function X(n,d){if(n&1){let t=N();o(0,"div")(1,"rw-button",20),a("clicked",function(){S(t);let e=r(2);return e.settings.darkMode=!1,E(e.persist());}),_()();}}function z(n,d){if(n&1){let t=N();o(0,"div")(1,"rw-button",21),a("clicked",function(){S(t);let e=r(2);return e.settings.darkMode="system",E(e.persist());}),_()();}}function F(n,d){if(n&1){let t=N();o(0,"rw-toggle",22),f("valueChange",function(e){S(t);let s=r(2);return m(s.settings.darkMode,e)||(s.settings.darkMode=e),E(e);}),a("valueChange",function(){S(t);let e=r(2);return E(e.persist());}),_();}if(n&2){let t=r(2);p("value",t.settings.darkMode);}}function j(n,d){if(n&1){let t=N();o(0,"div",9)(1,"div",11)(2,"div",12),u(3,1),_(),o(4,"div",13)(5,"rw-toggle",14),f("valueChange",function(e){S(t);let s=r();return m(s.settings.modulesOpen,e)||(s.settings.modulesOpen=e),E(e);}),a("valueChange",function(){S(t);let e=r();return E(e.persist());}),_()()(),o(6,"div",11)(7,"div",12),u(8,2),_(),o(9,"div",13)(10,"rw-toggle",15),f("valueChange",function(e){S(t);let s=r();return m(s.settings.blendControls,e)||(s.settings.blendControls=e),E(e);}),a("valueChange",function(){S(t);let e=r();return E(e.persist());}),_()()(),o(11,"div",16)(12,"div",12),u(13,3),_(),g(14,X,2,0,"div")(15,z,2,0,"div"),o(16,"div",17),g(17,F,1,1,"rw-toggle",18),_()(),o(18,"div",11)(19,"div",12),u(20,4),_(),o(21,"div",13)(22,"rw-toggle",19),f("valueChange",function(e){S(t);let s=r();return m(s.settings.fastLane,e)||(s.settings.fastLane=e),E(e);}),a("valueChange",function(){S(t);let e=r();return E(e.persist());}),_()()()();}if(n&2){let t=r();l(5),p("value",t.settings.modulesOpen),l(5),p("value",t.settings.blendControls),l(4),c(t.settings.darkMode==="system"?14:-1),l(),c(t.settings.darkMode!=="system"?15:-1),l(2),c(t.settings.darkMode!=="system"?17:-1),l(5),p("value",t.settings.fastLane);}}var ae=(()=>{class n{settingsService=v(b);iaService=v(U);router=v(L);settings;showConfirmation=!1;previousUrl;iaLayer="settings"+new Date().getTime();closeByEscape(t){this.iaService.is(this.iaLayer)&&this.close();}constructor(){let t=this.settingsService;this.iaService.add(this.iaLayer),t.fetchSettings().subscribe(i=>{this.settings=i;}),this.previousUrl=sessionStorage.getItem("previousUrl"),sessionStorage.removeItem("previousUrl");}ngOnDestroy(){this.iaService.take(this.iaLayer);}persist(){this.settingsService.saveSettings(this.settings);}securityWarning(t=!1){!t&&this.settings.remote?(this.showConfirmation=!0,requestAnimationFrame(()=>{this.settings.remote=!1;})):t?(this.showConfirmation=!1,this.settings.remote=!0,this.settingsService.saveSettings(this.settings)):!t&&!this.settings.remote&&this.settingsService.saveSettings(this.settings);}close(){this.previousUrl&&this.router.navigate([this.previousUrl.split("#")[0]],{fragment:this.previousUrl.split("#")[1]});}static ɵfac=function(i){return new(i||n)();};static ɵcmp=O({type:n,selectors:[["rw-screen-settings"]],hostBindings:function(i,e){i&1&&a("keydown.escape",function(R){return e.closeByEscape(R);},!1,A);},decls:6,vars:3,consts:()=>{let t;t="Leave application settings (ESC)";let i;i=" Settings ";let e;e="Page modules opened";let s;s=" Blend in controls on hover ";let R;R="Dark Mode (the app will be restarted)";let P;P=" Fast lane (applies auto confirm where ever possible) ";let D;D="Set color scheme manually";let y;return y="Apply system preferences",[i,e,s,R,P,[3,"showQr"],["header","",1,"flex","items-center","w-full"],[1,"flex-grow","grow","pl-3","md:pt-0","capitalize","text-2xl","md:text-4xl"],["title",t,"icon","x-lg","styling","standard_outline",1,"mr-3"],["main",""],["title",t,"icon","x-lg","styling","standard_outline",1,"mr-3",3,"clicked"],[1,"flex","mt-3","py-3"],[1,"label","flex-grow"],[1,"togle"],["offIcon","arrow-bar-left","onIcon","arrow-bar-right",3,"valueChange","value"],["offIcon","arrow-bar-up","onIcon","arrow-bar-down",3,"valueChange","value"],[1,"flex","mt-3","py-3","items-center"],[1,"toggle"],["offIcon","sun","onIcon","moon",3,"value"],["offIcon","lock-fill","onIcon","exclamation-triangle",3,"valueChange","value"],["icon","toggle2-off","label","System (Auto)","title",D,1,"scale-75","inline-block","-translate-y-0.5","origin-right",3,"clicked"],["title",y,"icon","x-lg",1,"scale-50","inline-block","-translate-y-0.5",3,"clicked"],["offIcon","sun","onIcon","moon",3,"valueChange","value"]];},template:function(i,e){i&1&&(o(0,"rw-page",5)(1,"div",6)(2,"h3",7),u(3,0),_(),g(4,K,1,0,"rw-button",8),_(),g(5,j,23,6,"div",9),_()),i&2&&(x("showQr",!1),l(4),c(e.previousUrl?4:-1),l(),c(e.settings?5:-1));},dependencies:[$,k,B],encapsulation:2});}return n;})();export{ae as a};/**i18n:1964dde12af7df15d0053ab7761c4e4c56fe7eae085ef9e01bc7588ce5d2189d*/