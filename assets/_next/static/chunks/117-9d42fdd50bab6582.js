"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[117],{4291:function(e,n,t){t.d(n,{lR:function(){return w},ZP:function(){return S}});var r=t(5893),i=t(7294),a=(0,i.createContext)(null);function o(e){var n=e.room,t=e.children,o=(0,i.useState)(null),c=o[0],s=o[1];return(0,i.useEffect)((function(){if(n){var e=function(){return s(null)},t=function(e){return s((function(n){return n===e?null:n}))};return n.on("disconnected",e),n.on("participantDisconnected",t),function(){n.off("disconnected",e),n.off("participantDisconnected",t)}}}),[n]),(0,r.jsx)(a.Provider,{value:[c,function(e){return s((function(n){return n===e?null:e}))}],children:t})}var c=t(5666),s=t.n(c),l=t(1438),u=t(8847),d=t(8445),f=t.n(d);function m(e,n,t,r,i,a,o){try{var c=e[a](o),s=c.value}catch(l){return void t(l)}c.done?n(s):Promise.resolve(s).then(r,i)}function v(e){return function(){var n=this,t=arguments;return new Promise((function(r,i){var a=e.apply(n,t);function o(e){m(a,r,i,o,c,"next",e)}function c(e){m(a,r,i,o,c,"throw",e)}o(void 0)}))}}function p(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function h(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{},r=Object.keys(t);"function"===typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(t).filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})))),r.forEach((function(n){p(e,n,t[n])}))}return e}function x(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function b(e,n,t){var r=(0,i.useState)(null),a=r[0],o=r[1],c=(0,i.useState)(!1),s=c[0],l=c[1],d=(0,i.useRef)(t);return(0,i.useEffect)((function(){window.TwilioVideo||(window.TwilioVideo=f()),d.current=t}),[t]),{room:a,isConnecting:s,connect:(0,i.useCallback)((function(t){return l(!0),f().connect(t,function(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{},r=Object.keys(t);"function"===typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(t).filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})))),r.forEach((function(n){x(e,n,t[n])}))}return e}({},d.current,{tracks:e})).then((function(e){o(e);var n=function(){return e.disconnect()};e.setMaxListeners(15),e.once("disconnected",(function(){setTimeout((function(){return o(null)})),window.removeEventListener("beforeunload",n),u.tq&&window.removeEventListener("pagehide",n)})),window.twilioRoom=e,e.localParticipant.videoTracks.forEach((function(e){return e.setPriority("low")})),l(!1),window.addEventListener("beforeunload",n),u.tq&&window.addEventListener("pagehide",n)}),(function(e){n(e),l(!1)}))}),[e,n])}}var g=t(4155);var j=t(1582);function y(e,n){return function(e){if(Array.isArray(e))return e}(e)||function(e,n){var t=[],r=!0,i=!1,a=void 0;try{for(var o,c=e[Symbol.iterator]();!(r=(o=c.next()).done)&&(t.push(o.value),!n||t.length!==n);r=!0);}catch(s){i=!0,a=s}finally{try{r||null==c.return||c.return()}finally{if(i)throw a}}return t}(e,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var w=(0,i.createContext)(null);function N(e){var n=e.options,t=e.children,a=e.onError,c=void 0===a?function(){}:a,d=(0,i.useCallback)((function(e){console.log("ERROR: ".concat(e.message),e),c(e)}),[c]),m=function(){var e=(0,i.useState)(),n=e[0],t=e[1],r=(0,i.useState)(),a=r[0],o=r[1],c=(0,i.useState)(!1),d=c[0],m=c[1],p=(0,i.useCallback)((function(e){var n={};return e&&(n.deviceId={exact:e}),f().createLocalAudioTrack(n).then((function(e){return t(e),e}))}),[]),x=(0,i.useCallback)(v(s().mark((function e(){var n,t,r,i;return s().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=window.localStorage.getItem(l.p8),e.next=3,(0,u.dz)();case 3:return t=e.sent.videoInputDevices,r=t.some((function(e){return n&&e.deviceId===n})),i=h({},l.lA,{name:"camera-".concat(Date.now())},r&&{deviceId:{exact:n}}),e.abrupt("return",f().createLocalVideoTrack(i).then((function(e){return o(e),e})));case 7:case"end":return e.stop()}}),e)}))),[]),b=(0,i.useCallback)((function(){n&&(n.stop(),t(void 0))}),[n]),g=(0,i.useCallback)((function(){a&&(a.stop(),o(void 0))}),[a]),j=(0,i.useCallback)(v(s().mark((function e(){var r,i,c,v,p,x,b,g,j,y,w,N;return s().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,u.dz)();case 2:var s;if(s=e.sent,r=s.audioInputDevices,i=s.videoInputDevices,c=s.hasAudioInputDevices,v=s.hasVideoInputDevices,c||v){e.next=5;break}return e.abrupt("return",Promise.resolve());case 5:if(!(d||n||a)){e.next=7;break}return e.abrupt("return",Promise.resolve());case 7:return m(!0),p=window.localStorage.getItem(l.J$),x=window.localStorage.getItem(l.p8),b=r.some((function(e){return p&&e.deviceId===p})),g=i.some((function(e){return x&&e.deviceId===x})),e.next=14,(0,u.$l)("camera");case 14:return j=e.sent,e.next=17,(0,u.$l)("microphone");case 17:return y=e.sent,w=c&&!y,N={video:v&&!j&&h({},l.lA,{name:"camera-".concat(Date.now())},g&&{deviceId:{exact:x}}),audio:w&&(b?{deviceId:{exact:p}}:c)},e.abrupt("return",f().createLocalTracks(N).then((function(e){var n,r=e.find((function(e){return"video"===e.kind})),i=e.find((function(e){return"audio"===e.kind}));if(r&&(o(r),window.localStorage.setItem(l.p8,null!==(n=r.mediaStreamTrack.getSettings().deviceId)&&void 0!==n?n:"")),i&&t(i),j&&y){var a=new Error;throw a.name="NotAllowedError",a}if(j)throw new Error("CameraPermissionsDenied");if(y)throw new Error("MicrophonePermissionsDenied")})).finally((function(){return m(!1)})));case 22:case"end":return e.stop()}}),e)}))),[n,a,d]);return{localTracks:[n,a].filter((function(e){return void 0!==e})),getLocalVideoTrack:x,getLocalAudioTrack:p,isAcquiringLocalTracks:d,removeLocalAudioTrack:b,removeLocalVideoTrack:g,getAudioAndVideoTracks:j}}(),p=m.localTracks,x=m.getLocalVideoTrack,g=m.getLocalAudioTrack,j=m.isAcquiringLocalTracks,N=m.removeLocalAudioTrack,S=m.removeLocalVideoTrack,k=m.getAudioAndVideoTracks,O=b(p,d,n),P=O.room,T=O.isConnecting,C=O.connect,I=y(function(e,n){var t=(0,i.useState)(!1),r=t[0],a=t[1],o=(0,i.useRef)(null),c=(0,i.useCallback)((function(){navigator.mediaDevices.getDisplayMedia({audio:!1,video:{frameRate:10,height:1080,width:1920}}).then((function(t){var r=t.getTracks()[0];e.localParticipant.publishTrack(r,{name:"screen",priority:"low"}).then((function(n){o.current=function(){e.localParticipant.unpublishTrack(r),e.localParticipant.emit("trackUnpublished",n),r.stop(),a(!1)},r.onended=o.current,a(!0)})).catch(n)})).catch((function(e){"AbortError"!==e.name&&"NotAllowedError"!==e.name&&n(e)}))}),[e,n]),s=(0,i.useCallback)((function(){e&&(r?o.current():c())}),[r,c,e]);return[r,s]}(P,c),2),E=I[0],A=I[1];!function(e,n,t,r,a,o){(0,i.useEffect)((function(){if(e){var i=function(e,i){i&&n(i),t(),r(),a&&o()};return e.on("disconnected",i),function(){e.off("disconnected",i)}}}),[e,n,t,r,a,o])}(P,c,N,S,E,A),function(e,n){(0,i.useEffect)((function(){if(e)return e.localParticipant.on("trackPublicationFailed",n),function(){e.localParticipant.off("trackPublicationFailed",n)}}),[e,n])}(P,c),function(e){var n=e.find((function(e){return"audio"===e.kind}));(0,i.useEffect)((function(){var e=function(){"ended"===(null===n||void 0===n?void 0:n.mediaStreamTrack.readyState)&&n.restart({})};return navigator.mediaDevices.addEventListener("devicechange",e),function(){navigator.mediaDevices.removeEventListener("devicechange",e)}}),[n])}(p);var V=(0,i.useState)(!1),L=V[0],D=V[1];p.find((function(e){return e.name.includes("camera")}));return(0,r.jsx)(w.Provider,{value:{room:P,localTracks:p,isConnecting:T,onError:d,getLocalVideoTrack:x,getLocalAudioTrack:g,connect:C,isAcquiringLocalTracks:j,removeLocalVideoTrack:S,isSharingScreen:E,toggleScreenShare:A,getAudioAndVideoTracks:k,isBackgroundSelectionOpen:L,setIsBackgroundSelectionOpen:D},children:(0,r.jsx)(o,{room:P,children:t})})}var S=function(e){var n=function(){var e,n=(0,i.useState)(l.DF),t=n[0],r=(n[1],{bandwidthProfile:{video:{mode:t.bandwidthProfileMode,dominantSpeakerPriority:t.dominantSpeakerPriority,trackSwitchOffMode:t.trackSwitchOffMode,contentPreferencesMode:t.contentPreferencesMode,clientTrackSwitchOffControl:t.clientTrackSwitchOffControl}},dominantSpeaker:!0,networkQuality:{local:1,remote:1},maxAudioBitrate:Number(t.maxAudioBitrate),preferredVideoCodecs:[{codec:"VP8",simulcast:"peer-to-peer"!==t.roomType&&"go"!==t.roomType}],environment:g.env.REACT_APP_TWILIO_ENVIRONMENT});return u.tq&&(null===r||void 0===r||null===(e=r.bandwidthProfile)||void 0===e?void 0:e.video)&&(r.bandwidthProfile.video.maxSubscriptionBitrate=25e5),"dev"===g.env.REACT_APP_TWILIO_ENVIRONMENT&&(r.wsServer="wss://us2.vss.dev.twilio.com/signaling"),(0,u.po)(r)}();return(0,r.jsx)(j.KX,{children:(0,r.jsx)(N,{options:n,onError:function(e){return console.log(e)},children:e.children})})}},5428:function(e,n,t){t.d(n,{Z:function(){return a}});var r=t(7294),i=t(4291);function a(){var e=(0,r.useContext)(i.lR);if(!e)throw new Error("useVideoContext must be used within a VideoProvider");return e}},5112:function(e,n,t){t.d(n,{l:function(){return u}});var r=t(5893),i=t(7294),a=t(2283),o=t(8847),c=function(e){var n=e.children,t=e.pattern,i=e.required;return(0,r.jsxs)("div",{className:"font-bold text-sm text-primary",children:[i&&"Required",t===o.aK&&"Letters only",t===o.CU&&"Email address must be valid",t===o._D&&"Phone number must be valid",t===o.G3&&"Zip must be valid",n]})};function s(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{},r=Object.keys(t);"function"===typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(t).filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})))),r.forEach((function(n){s(e,n,t[n])}))}return e}var u=function(e){var n=e.className,t=e.defaultValues,s=void 0===t?{}:t,u=e.children,d=e.onChange,f=void 0===d?null:d,m=e.onSubmit,v=(0,a.cI)({defaultValues:s}),p=v.watch,h=v.register,x=v.handleSubmit,b=v.formState.errors;return(0,i.useEffect)((function(){var e=p((function(e,n){n.name,n.type;f&&f(e)}));return function(){return e.unsubscribe()}}),[f,p]),(0,r.jsx)("form",{className:(0,o.WM)(n),onSubmit:x(m),children:i.Children.map(u,(function(e){var n,t,a;return(null===e||void 0===e?void 0:e.props.name)?(0,r.jsxs)(r.Fragment,{children:[i.createElement(e.type,l({},l({},e.props,{register:h,key:e.props.name}))),(null===(n=e.props.registerOptions)||void 0===n?void 0:n.required)&&b[e.props.name]&&"required"===b[e.props.name].type&&(0,r.jsx)(c,{required:!0}),(null===(t=e.props.registerOptions)||void 0===t?void 0:t.pattern)&&b[e.props.name]&&"pattern"===b[e.props.name].type&&(0,r.jsx)(c,{pattern:null===(a=e.props.registerOptions)||void 0===a?void 0:a.pattern})]}):e}))})}},3130:function(e,n,t){t.d(n,{l:function(){return r.l}});var r=t(5112)},1117:function(e,n,t){t.d(n,{Xy:function(){return l},tL:function(){return b},pi:function(){return j},Ar:function(){return N},pm:function(){return S},ls:function(){return V}});var r=t(5893),i=function(e){var n=e.name,t=void 0===n?"Owl Health":n;return(0,r.jsx)("div",{className:"flex items-center justify-center h-16 w-full bg-white shadow-patientHeader",children:(0,r.jsx)("div",{className:"font-bold text-2xl text-primary",children:t})})},a=t(7294),o=t(6419),c=t(9716),s=t(8657),l=function(e){var n=e.onSubmit,t=(0,a.useState)(""),i=t[0],l=(t[1],(0,a.useState)("")),u=l[0],d=(l[1],(0,a.useState)("")),f=d[0],m=(d[1],(0,a.useState)([{name:"Attached_File_Name.jpg"}])),v=m[0];m[1];return(0,r.jsxs)("form",{className:"flex flex-col h-full",onSubmit:function(e){e.preventDefault(),n({conditions:i,medications:u,reason:f,files:v})},children:[(0,r.jsx)("p",{className:"text-center text-dark",children:"Tell the doctor a little more about why you\u2019re visiting today"}),(0,r.jsx)(s.g,{className:"my-2",placeholder:"Preexisting Conditions"}),(0,r.jsx)(s.g,{className:"my-2",placeholder:"Current Medications"}),(0,r.jsx)(s.g,{className:"my-2",placeholder:"Reason for visit (symptoms, etc - this is optional)"}),(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{className:"my-3 text-dark",children:"Would you like to share a file, such as a photo, form, or test result?"}),(0,r.jsxs)("div",{className:"mx-auto max-w-[300px]",children:[v.map((function(e,n){return(0,r.jsxs)("a",{className:"flex rounded-lg my-3 border border-link py-3 px-4 text-link text-xs items-center cursor-pointer",download:!0,children:[(0,r.jsx)("span",{className:"flex-grow underline",children:e.name}),(0,r.jsx)(c.J,{name:"close",outline:!0})]},n)})),(0,r.jsxs)("a",{className:"text-link text-xs flex items-center",children:[(0,r.jsx)(c.J,{name:"add",outline:!0})," Attach a File"]})]})]}),(0,r.jsx)("div",{className:"mt-5 text-center",children:(0,r.jsxs)("label",{className:"text-light",children:[(0,r.jsx)("input",{type:"checkbox"})," I agree to the Terms & Conditions"]})}),(0,r.jsx)("div",{className:"my-5 mx-auto max-w-[250px] w-full",children:(0,r.jsx)(o.z,{type:"submit",className:"w-full",children:"Continue"})})]})},u=t(5112),d=t(8847),f=t(8498);function m(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function v(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{},r=Object.keys(t);"function"===typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(t).filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})))),r.forEach((function(n){m(e,n,t[n])}))}return e}function p(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var h=function(e){e.className;var n=e.label,t=e.name,i=e.register,a=e.registerOptions,o=e.value,c=p(e,["className","label","name","register","registerOptions","value"]);return(0,r.jsxs)("label",{className:"flex items-center my-1",children:[(0,r.jsx)("input",v({className:"ml-3 mr-2",type:"radio",name:t,value:o},i?i(t,a):{},c)),n]})},x=t(1321),b=function(e){var n=e.onSubmit,t=(0,a.useState)({}),i=t[0],c=t[1];return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:"text-dark",children:"This will be shared with your doctor."}),(0,r.jsxs)(u.l,{className:"flex flex-col h-full",onChange:c,onSubmit:n,children:[(0,r.jsx)(f.I,{className:"my-2",name:"firstName",placeholder:"First Name",registerOptions:{required:!0,pattern:d.aK}}),(0,r.jsx)(f.I,{className:"my-2",name:"lastName",placeholder:"Last Name",registerOptions:{required:!0,pattern:d.aK}}),(0,r.jsx)(f.I,{className:"my-2",name:"phoneNumber",placeholder:"Phone Number",registerOptions:{required:!0,pattern:d._D}}),(0,r.jsx)(f.I,{type:"email",name:"email",className:"my-2",placeholder:"Email",registerOptions:{required:!0,pattern:d.CU}}),(0,r.jsx)("div",{className:"mt-3",children:"Will you need a translator?"}),(0,r.jsx)(h,{name:"needTranslator",label:"No",value:"No"}),(0,r.jsx)(h,{name:"needTranslator",label:"Yes",value:"Yes"}),"Yes"===i.needTranslator&&(0,r.jsx)(x.P,{className:"my-2",placeholder:"Language",options:[{value:"Spanish "}],name:"language"}),(0,r.jsx)("div",{className:"mt-4",children:"I am"}),(0,r.jsx)(h,{name:"gender",label:"Male",value:"Male"}),(0,r.jsx)(h,{name:"gender",label:"Female",value:"Female"}),(0,r.jsx)(h,{name:"gender",label:"Other",value:"Other"}),(0,r.jsx)("div",{className:"my-5 mx-auto max-w-[250px] w-full",children:(0,r.jsx)(o.z,{type:"submit",className:"w-full",children:"Continue"})})]})]})},g=t(3130),j=function(e){var n=e.onSubmit;return(0,r.jsxs)(g.l,{className:"flex flex-col h-full",onSubmit:n,children:[(0,r.jsx)("div",{className:"mt-2",children:"Do you have insurance?"}),(0,r.jsx)(h,{name:"haveInsurance",label:"Yes",value:"Yes"}),(0,r.jsx)(h,{name:"haveInsurance",label:"No",value:"No"}),(0,r.jsx)(f.I,{className:"my-2",placeholder:"Member ID",name:"memberId"}),(0,r.jsx)(x.P,{className:"my-2",name:"healthPlan",placeholder:"Health Plan",options:[{value:"Plan 1"}]}),(0,r.jsx)("div",{className:"mt-2",children:"Are you the primary member?"}),(0,r.jsx)(h,{name:"isPrimaryMember",label:"Yes",value:"Yes"}),(0,r.jsx)(h,{name:"isPrimaryMember",label:"No",value:"No"}),(0,r.jsx)("div",{className:"my-5 mx-auto max-w-[250px] w-full",children:(0,r.jsx)(o.z,{type:"submit",className:"w-full",children:"Continue"})})]})},y=t(9783),w=t(7871),N=function(e){var n=e.children,t=e.title;return(0,r.jsxs)("div",{className:"flex flex-col h-full",children:[(0,r.jsx)("div",{children:(0,r.jsx)(i,{})}),(0,r.jsxs)("div",{className:"max-w-sm w-full mx-auto flex flex-grow justify-center items-center",children:[t&&(0,r.jsx)(y.X,{children:t}),(0,r.jsx)("div",{children:n})]}),(0,r.jsx)("footer",{className:"pt-2 pb-5",children:(0,r.jsx)(w.O,{className:"mx-auto"})})]})},S=function(e){e.onSubmit;var n=(0,a.useRef)(null);return(0,r.jsxs)("div",{className:"border-2 border-primary rounded-md flex flex-col items-center justify-center h-[225px] w-[225px] cursor-pointer",onClick:function(){var e;return null===n||void 0===n||null===(e=n.current)||void 0===e?void 0:e.click()},children:[(0,r.jsx)("img",{className:"mb-6",src:"/icons/upload.svg",height:48,width:69}),(0,r.jsx)("input",{ref:n,className:"hidden",type:"file",accept:"image/*"}),(0,r.jsx)("div",{className:"text-primary",children:"Upload Image"}),(0,r.jsx)("div",{className:"text-dark",children:"Size limit: 4mb"})]})},k=t(5428);var O=t(8986),P=t(9738),T=t(9891),C=function(e){var n=e.close,t=e.isVisible,i=(0,a.useState)("SMS"),c=i[0],s=i[1],l=(0,a.useState)(""),u=l[0],d=l[1];return(0,r.jsxs)(T.u,{backdropClick:n,isVisible:t,children:[(0,r.jsx)("div",{className:"mb-3 border-b border-border-primary",children:(0,r.jsx)("h3",{className:"my-3 px-5",children:"Invite to Visit"})}),(0,r.jsxs)("form",{className:"py-3 px-5",onSubmit:function(e){e.preventDefault(),console.log(c,u),d(""),n()},children:[(0,r.jsxs)("div",{className:"flex mb-5 items-center justify-center",children:[(0,r.jsx)("div",{className:"flex-grow",children:(0,r.jsx)("label",{className:"font-bold",children:"Invite Via:"})}),(0,r.jsx)("div",{className:"flex-grow",children:(0,r.jsx)(x.P,{className:"w-full",options:[{value:"SMS"}],value:c,onChange:function(e){return s(e.target.value)}})})]}),(0,r.jsx)("div",{className:"my-5",children:(0,r.jsx)(f.I,{className:"w-full",placeholder:"Phone Number",value:u,onChange:function(e){return d(e.target.value)}})}),(0,r.jsx)("div",{className:"my-2 text-center",children:(0,r.jsx)(o.z,{type:"submit",children:"Invite"})})]})]})},I=t(7872),E=function(e){var n=e.name,t=e.hasAudio,i=e.hasVideo,o=e.isProvider,s=e.isOverlap,l=e.isSelf,u=(0,a.useState)(null),f=u[0],m=u[1],v=(0,a.useState)(!1),p=v[0],h=v[1],x=s?"w-[92px]":o?"w-[405px]":"w-[274px]",b=s?"h-[122px]":o?"h-[234px]":"h-[364px]";return(0,a.useEffect)((function(){m(null!==f&&!t);var e=setTimeout((function(){m(!1)}),3e3);return function(){return clearTimeout(e)}}),[t,f]),(0,r.jsxs)("div",{className:"mx-auto relative w-max group",children:[!l&&(0,r.jsx)("div",{className:"absolute inset-0 text-right w-full flex justify-end group-hover:bg-gradient-to-b from-gray-700 via-transparent to-transparent",children:(0,r.jsx)("div",{className:(0,d.WM)("p-1",!p&&"hidden group-hover:block"),children:(0,r.jsx)("button",{className:(0,d.WM)("border-0 bg-transparent rotate-45 p-2",p?"text-primary":"text-white"),onClick:function(){return h(!p)},children:(0,r.jsx)(c.J,{name:"push_pin",outline:!p})})})}),f&&(0,r.jsx)("div",{className:"absolute top-0 bottom-0 left--2 right--2 flex items-center justify-center w-full",children:(0,r.jsx)("div",{className:"bg-[#000000BF] text-white h-min text-center flex-grow py-4",children:"You have been muted"})}),(0,r.jsxs)("div",{className:"flex items-center justify-center bg-dark text-white text-2xl overflow-hidden ".concat(b," ").concat(x),children:[!i&&n,o?i&&(0,r.jsx)("img",{src:"/provider.jpg",alt:"Provider"}):i&&(0,r.jsx)("img",{src:"/patient.jpg",alt:"Patient"})]}),(0,r.jsxs)("div",{className:"absolute bottom-0 right-0 text-white bg-[#00000082] px-2 py-1 flex items-center",children:[(0,r.jsx)(c.J,{className:(0,d.WM)("text-md",!t&&"text-primary"),name:"mic"}),i?!s&&n:(0,r.jsx)(c.J,{className:"text-md text-primary",name:"videocam_off"})]})]})};var A="Dr. Josefina Santos",V=function(e){e=null!==e?e:function(e){throw e}(new TypeError("Cannot destructure undefined"));var n=function(){h(!p)},t=(0,a.useState)(!1),i=t[0],c=t[1],s=(0,a.useState)(!0),l=s[0],u=s[1],d=(0,a.useState)(!0),f=d[0],m=d[1],v=(0,a.useState)(!1),p=v[0],h=v[1],x=(0,a.useState)(!1),b=x[0],g=x[1],j=function(){var e=(0,k.Z)().room,n=(0,a.useState)("disconnected"),t=n[0],r=n[1];return(0,a.useEffect)((function(){if(e){var n=function(){return r(e.state)};return n(),e.on("disconnected",n).on("reconnected",n).on("reconnecting",n),function(){e.off("disconnected",n).off("reconnected",n).off("reconnecting",n)}}}),[e]),t}();return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:"bg-secondary flex flex-col h-full items-center",children:[(0,r.jsx)("div",{className:"py-5",children:(0,r.jsx)(w.O,{inverted:!0})}),"connected"==j?i?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:"flex",children:(0,r.jsxs)("div",{className:"relative",children:[(0,r.jsx)(E,{name:A,hasAudio:!0,hasVideo:!0,isProvider:!0}),(0,r.jsx)("div",{className:"absolute top-1 right-1",children:(0,r.jsx)(E,{name:"Sarah Cooper",hasAudio:l,hasVideo:f,isOverlap:!0,isSelf:!0})}),(0,r.jsx)(o.z,{className:"absolute left-4 bottom-3",icon:"chat_bubble",variant:o.W.tertiary,onClick:function(){return c(!i)}})]})}),(0,r.jsx)("div",{className:"flex-grow w-full",children:(0,r.jsx)(O.e,{inputPlaceholder:"Message to ".concat(A)})})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:"flex-grow",children:[(0,r.jsxs)("div",{className:"flex flex-col justify-evenly h-full",children:[(0,r.jsx)(E,{name:"Sarah Cooper",hasAudio:l,hasVideo:f,isSelf:!1,isProvider:!0}),(0,r.jsx)(E,{name:A,hasAudio:!0,hasVideo:!0,isProvider:!1,isSelf:!0})]}),i&&(0,r.jsx)(o.z,{icon:"chat_bubble_outline",onClick:function(){return c(!i)}})]}),(0,r.jsx)(I.H,{containerClass:"mb-5 bg-[#FFFFFF4A] rounded-lg",addParticipant:n,flipCamera:function(){return g(!0)},toggleAudio:function(){return u(!l)},toggleChat:function(){return c(!i)},toggleVideo:function(){return m(!f)}})]}):(0,r.jsx)(r.Fragment,{})]}),(0,r.jsx)(P.N,{close:function(){return g(!1)},isVisible:b}),(0,r.jsx)(C,{close:n,isVisible:p})]})}},8657:function(e,n,t){t.d(n,{g:function(){return c}});var r=t(5893),i=t(8847);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var c=function(e){var n=e.className,t=e.name,c=e.register,s=e.registerOptions,l=o(e,["className","name","register","registerOptions"]);return(0,r.jsx)("textarea",function(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{},r=Object.keys(t);"function"===typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(t).filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})))),r.forEach((function(n){a(e,n,t[n])}))}return e}({className:(0,i.WM)("px-3 py-2 border border-light rounded-md",n)},c?c(t,s):{},l))}},1438:function(e,n,t){t.d(n,{lA:function(){return r},J$:function(){return i},p8:function(){return a},sL:function(){return o},LX:function(){return c},DF:function(){return s}});var r={width:1280,height:720,frameRate:24},i="TwilioVideoApp-selectedAudioInput",a="TwilioVideoApp-selectedVideoInput",o="TelehealthUser",c="TelehealthVisit",s={trackSwitchOffMode:void 0,dominantSpeakerPriority:"standard",bandwidthProfileMode:"collaboration",maxAudioBitrate:"16000",contentPreferencesMode:"auto",clientTrackSwitchOffControl:"auto",roomType:"group"}},1502:function(e,n){n.Z={getFromStorage:function(e,n){try{var t=window.localStorage.getItem(e);if(t){var r=JSON.parse(t);return Promise.resolve(r)}}catch(i){return console.log(i),Promise.resolve(n)}},saveToStorage:function(e,n){return null==n?window.localStorage.removeItem(e):window.localStorage.setItem(e,JSON.stringify(n)),Promise.resolve()}}},1582:function(e,n,t){t.d(n,{KX:function(){return l},R:function(){return u}});var r=t(5893),i=t(7294),a=t(1438),o={name:"Guest",isAuthenticated:!1,role:"guest",token:null},c=t(1502),s=(0,i.createContext)(null);function l(e){var n=(0,i.useState)(o),t=n[0],l=n[1],u=(0,i.useState)(null),d=u[0],f=u[1];return(0,i.useEffect)((function(){c.Z.getFromStorage(a.sL,o).then((function(e){if(e!==o)return l(e),c.Z.getFromStorage(a.LX)})).then((function(e){return f(e)}))}),[l,f]),(0,r.jsx)(s.Provider,{value:{user:t,visit:d},children:e.children})}function u(){var e=(0,i.useContext)(s);if(!e)throw new Error("useVisitContext must be used within the VisitContextProvider");return e}}}]);