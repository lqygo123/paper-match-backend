(function(){var t={6305:function(t,e,i){"use strict";i.d(e,{Z:function(){return g}});var a=function(){var t=this,e=t._self._c;return e("div",{attrs:{id:"app"}},[t.showSidebar?e("Sidebar"):t._e(),e("div",{staticClass:"main-con"},[e("router-view")],1)],1)},n=[],o=function(){var t=this,e=t._self._c;return e("div",{attrs:{id:"sidebar"}},[e("el-menu",{staticClass:"el-menu-vertical-demo",attrs:{"default-active":t.activeIndex},on:{select:t.handleSelect}},[e("el-menu-item",{attrs:{index:"/file-upload"}},[e("template",{slot:"title"},[e("i",{staticClass:"el-icon-folder"}),e("span",[t._v("标书查重 ")])])],2),e("el-menu-item",{attrs:{index:"/report-list"}},[e("i",{staticClass:"el-icon-tickets"}),e("span",[t._v("查看报告")])]),e("el-menu-item",{attrs:{index:"logout"}},[e("i",{staticClass:"el-icon-switch-button"}),e("span",[t._v("退出登录")])])],1)],1)},s=[],l=(i(560),i(3219)),r={name:"Sidebar",components:{},data(){return{activeIndex:"/file-upload"}},mounted(){},methods:{handleSelect(t){if(this.activeIndex=t,"logout"===t)return this.logout(),void this.$router.push("/login");this.$router.push(t)},logout(){(0,l.pQ)()}}},c=r,d=i(1001),u=(0,d.Z)(c,o,s,!1,null,"3a7636dc",null),p=u.exports,f={name:"App",components:{Sidebar:p},data(){return{showSidebar:"login"!==this.$route.name}},mounted(){console.log("mounted",this.$route)},watch:{$route(t){console.log("watch $route",t),this.showSidebar="login"!==t.name}},errorCaptured(t,e,i){return console.error(t,i),!1}},h=f,m=(0,d.Z)(h,a,n,!1,null,null,null),g=m.exports},9676:function(t,e,i){"use strict";i.d(e,{Z:function(){return d}});var a=function(){var t=this,e=t._self._c;return e("div",{attrs:{id:"file-upload"}},[t.isCompire?e("div",{staticClass:"compire-loading"},[t._v(" 结果对比中，请耐心等待... ")]):t._e(),e("div",{staticClass:"file-upload-tab",attrs:{id:"mode-switch"}},[e("div",{staticClass:"file-upload-tab-item",class:{active:"digital"===t.mode},on:{click:function(e){t.mode="digital"}}},[e("span",[t._v("文件对比")])]),e("div",{staticClass:"file-upload-tab-item",class:{active:"ocr"===t.mode},on:{click:function(e){t.mode="ocr"}}},[e("span",[t._v("扫描件对比")])])]),e("div",{staticClass:"main-content"},[e("div",{staticClass:"file-upload-header"},[t._v(" 招标文件（可选） ")]),e("div",{staticClass:"file-upload-desc"},[t._v(" 可选择上传一份招标文件参与查重，与招标文件相同内容不参与查重 ")]),e("div",{staticClass:"drop-zone",on:{drop:t.handleDropSkipFile,dragover:function(t){t.preventDefault()},dragenter:function(t){t.preventDefault()}}},[t._m(0),t._m(1)]),t.skipFile?e("div",{staticClass:"file-list"},[e("div",{staticClass:"file-item"},[e("div",{staticClass:"file-content"},[t._v(" 招标文件 ")]),e("div",{staticClass:"file-name"},[t._v(t._s(t.skipFile.name))]),e("div",{staticClass:"file-content"},[t._v(t._s(t.skipFile.state))]),e("div",{staticClass:"file-content"},[e("el-button",{on:{click:function(e){return t.deleteSkipFile()}}},[t._v("删除")])],1)])]):t._e(),e("div",{staticClass:"file-upload-header"},[t._v(" 投标文件（必选） ")]),e("div",{staticClass:"drop-zone",on:{drop:t.handleDrop,dragover:function(t){t.preventDefault()},dragenter:function(t){t.preventDefault()}}},[t._m(2),t._m(3)]),t.files.length?e("div",{staticClass:"file-list"},t._l(t.files,(function(i,a){return e("div",{key:a,staticClass:"file-item"},[e("div",{staticClass:"file-content"},[t._v(" 投标文件 ")]),e("div",{staticClass:"file-name"},[t._v(t._s(i.name))]),e("div",{staticClass:"file-content"},[t._v(t._s(i.state))]),e("div",{staticClass:"file-content"},[e("el-button",{on:{click:function(e){return t.deleteFile(a)}}},[t._v("删除")])],1)])})),0):t._e(),e("input",{ref:"fileInput",staticStyle:{display:"none"},attrs:{type:"file"},on:{change:t.handleFile}})]),e("div",{staticClass:"buttons-wrap"},[e("el-button",{attrs:{type:"primary"},on:{click:t.handleCompire}},[t._v("执行对比 ")])],1)])},n=[function(){var t=this,e=t._self._c;return e("div",{staticClass:"upload-box left-box"},[e("div",{staticClass:"origin-file preview-div"},[e("img",{staticStyle:{top:"0px","margin-top":"0px",width:"72px",height:"72px"},attrs:{src:i(5989)}})])])},function(){var t=this,e=t._self._c;return e("div",{staticClass:"unUploaded-container"},[e("div",{staticClass:"select-file-text left-select"},[t._v("拖放招标文件到这里")]),e("div",{staticClass:"file-restriction"},[t._v(" 格式支持：单份50M以内word、pdf、ppt、txt、扫描件文档进行比对 页数文档：电子文档500页，扫描件300页 ")])])},function(){var t=this,e=t._self._c;return e("div",{staticClass:"upload-box left-box"},[e("div",{staticClass:"origin-file preview-div"},[e("img",{staticStyle:{top:"0px","margin-top":"0px",width:"72px",height:"72px"},attrs:{src:i(5989)}})])])},function(){var t=this,e=t._self._c;return e("div",{staticClass:"unUploaded-container"},[e("div",{staticClass:"select-file-text left-select"},[t._v("拖放投标文件到这里")]),e("div",{staticClass:"file-restriction"},[t._v(" 格式支持：单份50M以内word、pdf、ppt、txt、扫描件文档进行比对 页数文档：电子文档500页，扫描件300页 ")])])}],o=(i(560),i(3219)),s={name:"FileUpload",data(){return{mode:"digital",files:[],skipFile:null,compireResults:[],isCompire:!1}},watch:{files:{handler(){console.log(this.files)},deep:!0}},methods:{validateFiles(t){const e=["application/pdf"];console.log(t);const i=t.filter((t=>e.includes(t.type))),a=t.filter((t=>!e.includes(t.type)));return a.length&&alert("仅支持 pdf 格式的文件"),i},handleDrop(t){t.preventDefault();const e=this.validateFiles(Array.from(t.dataTransfer.files));e.length&&(this.files=[...this.files,...e]),e.forEach((t=>{this.uploadFile(t)}))},handleDropSkipFile(t){t.preventDefault();const e=this.validateFiles(Array.from(t.dataTransfer.files));e.length&&(this.skipFile=e[0]),this.skipFile&&this.uploadSkipFile()},handleFile(t){const e=this.validateFiles(Array.from(t.target.files));e.length&&(this.files=[...this.files,...e]),e.forEach((t=>{this.uploadFile(t)}))},triggerFileInput(){this.$refs.fileInput.click()},deleteFile(t){this.files.splice(t,1)},async uploadFile(t){const e=new FormData;e.append("file",t,encodeURIComponent(t.name)),t.state="上传中",this.files=[...this.files];try{const i=await(0,o.cT)(e,(e=>{console.log(t.name,e)}));t.state="上传成功",t.fileId=i.data._id}catch(i){t.state="上传失败"}this.files=[...this.files]},async uploadSkipFile(){const t=new FormData;t.append("file",this.skipFile,encodeURIComponent(this.skipFile.name)),this.skipFile.state="上传中";try{const e=await(0,o.cT)(t,(t=>{console.log(this.skipFile.name,t)}));this.skipFile.state="上传成功",this.skipFile.fileId=e.data._id,this.skipFile={...this.skipFile,name:this.skipFile.name,state:"上传成功",fileId:e.data._id}}catch(e){this.skipFile={...this.skipFile,name:this.skipFile.name,state:"上传失败"}}},deleteSkipFile(){this.skipFile=null},async handleCompire(){if(this.files.length<2)return void alert("请至少上传两个文件");this.isCompire=!0;const t=this.files.map((t=>t.fileId));try{for(let e=0;e<t.length;e++)for(let i=0;i<t.length;i++){if(e===i)continue;const a=this.$message(`正在对比 ${this.files[e].name} 和 ${this.files[i].name}`,0),n=await this.execCompire(t[e],t[i],this.skipFile&&this.skipFile.fileId);a.close(),this.compireResults.push(n)}this.isCompire=!1,this.handleGenerateReport()}catch(e){console.log(e),this.isCompire=!1,this.$message.error("对比失败请打开调试控制台查看具体报错信息")}},async handleGenerateReport(){const t=await(0,o.Zn)(this.compireResults.map((t=>t._id)));console.log("createReport res",t),this.$router.push({path:"/report-detail",query:{id:t.data._id,mode:"edit"}})},async execCompire(t,e,i){const a={biddingFileId:t,targetFileId:e,mode:this.mode};i&&(a.skipFileId=i),console.log("execCompire",a);const n=await(0,o.Rf)(a);return n.data}}},l=s,r=i(1001),c=(0,r.Z)(l,a,n,!1,null,"5fb8ea69",null),d=c.exports},8902:function(t,e,i){"use strict";i.a(t,(async function(t,a){try{var n=i(7686),o=i(8954),s=(i(6279),i(1001)),l=t([o]);o=(l.then?(await l)():l)[0];var r=(0,s.Z)(o.Z,n.s,n.x,!1,null,null,null);e.Z=r.exports,a()}catch(c){a(c)}}))},8792:function(t,e,i){"use strict";i.d(e,{Z:function(){return d}});var a=function(){var t=this,e=t._self._c;return e("div",{staticClass:"report-detail"},[e("div",{staticClass:"header-con"},[e("div",{staticClass:"header-desc"},[t._v(" "+t._s("edit"===t.mode?"编辑报告":"查重报告结果"))])]),e("div",{staticClass:"main-con"},[e("div",{staticClass:"report-header"},[e("div",{staticClass:"header-item"},[e("span",{staticClass:"label"},[t._v("项目名称：")]),"detail"===t.mode?e("span",{staticClass:"content"},[t._v(t._s(t.metaInfo.projectName||"—"))]):t._e(),"edit"===t.mode?e("el-input",{attrs:{placeholder:"请输入项目名称"},model:{value:t.metaInfo.projectName,callback:function(e){t.$set(t.metaInfo,"projectName",e)},expression:"metaInfo.projectName"}}):t._e()],1),e("div",{staticClass:"header-item"},[e("span",{staticClass:"label"},[t._v("招标编号：")]),"detail"===t.mode?e("span",{staticClass:"content"},[t._v(t._s(t.metaInfo.biddingNumber||"—"))]):t._e(),"edit"===t.mode?e("el-input",{attrs:{placeholder:"请输入招标编号"},model:{value:t.metaInfo.biddingNumber,callback:function(e){t.$set(t.metaInfo,"biddingNumber",e)},expression:"metaInfo.biddingNumber"}}):t._e()],1),e("div",{staticClass:"header-item"},[e("span",{staticClass:"label"},[t._v("招标人：")]),"detail"===t.mode?e("span",{staticClass:"content"},[t._v(t._s(t.metaInfo.biddingCompany||"—"))]):t._e(),"edit"===t.mode?e("el-input",{attrs:{placeholder:"请输入招标人"},model:{value:t.metaInfo.biddingCompany,callback:function(e){t.$set(t.metaInfo,"biddingCompany",e)},expression:"metaInfo.biddingCompany"}}):t._e()],1),e("div",{staticClass:"header-item"},[e("span",{staticClass:"label"},[t._v("参与公司：")]),"detail"===t.mode?e("span",{staticClass:"content"},[t._v(t._s(t.metaInfo.participatingCompany||"—"))]):t._e(),"edit"===t.mode?e("el-input",{attrs:{placeholder:"请输入参与公司"},model:{value:t.metaInfo.participatingCompany,callback:function(e){t.$set(t.metaInfo,"participatingCompany",e)},expression:"metaInfo.participatingCompany"}}):t._e()],1),e("div",{staticClass:"header-item"},[e("span",{staticClass:"label"},[t._v("开标时间：")]),"detail"===t.mode?e("span",{staticClass:"content"},[t._v(t._s(t.metaInfo.time||"—"))]):t._e(),"edit"===t.mode?e("el-date-picker",{attrs:{type:"date",placeholder:"选择日期","value-format":"yyyy-MM-dd",format:"yyyy-MM-dd"},model:{value:t.metaInfo.time,callback:function(e){t.$set(t.metaInfo,"time",e)},expression:"metaInfo.time"}}):t._e()],1),e("div",{staticClass:"header-item"},[e("span",{staticClass:"label"},[t._v("提交时间：")]),e("span",{staticClass:"content"},[t._v(t._s(t.reportTime.substring(0,10)))])])]),e("el-table",{staticStyle:{width:"100%"},attrs:{data:t.results,border:""},on:{"row-click":t.handleResultClick}},[e("el-table-column",{attrs:{align:"center",label:"编号",width:"50"},scopedSlots:t._u([{key:"default",fn:function(i){return[e("span",[t._v(t._s(i.$index+1))])]}}])}),e("el-table-column",{attrs:{align:"center",prop:"biddingFileName",label:"招标公司"}}),e("el-table-column",{attrs:{align:"center",prop:"targetFileName",label:"对比公司"}}),e("el-table-column",{attrs:{align:"center",prop:"repetitionRate",label:"重复率"}}),e("el-table-column",{attrs:{align:"center",prop:"sameImage",label:"图片相似(张)"}}),e("el-table-column",{attrs:{align:"center",prop:"sameSentence",label:"相似句子(条)"}})],1)],1),e("div",{staticClass:"bottom-con"},["detail"===t.mode?e("Button",{on:{click:t.handleEdit}},[t._v("编辑")]):t._e(),"edit"===t.mode?e("Button",{on:{click:t.handleSave}},[t._v("保存")]):t._e()],1)])},n=[],o=(i(560),i(3219)),s={name:"ReportDetail",components:{},data(){return{id:"",mode:"detail",metaInfo:{projectName:"",biddingNumber:"",biddingCompany:"",participatingCompany:"",time:""},reportTime:"",results:[]}},mounted(){console.log(this.$route.query);const{id:t,mode:e}=this.$route.query;this.mode=e||"detail",this.id=t,this.getReportDetail(t)},methods:{async getReportDetail(t){const e=await(0,o.gp)(t);console.log("getReportDetail",e);const i=await(0,o.VB)(e.data.results);this.reportTime=e.data.reportTime,this.metaInfo=e.data.metaInfo||{projectName:"",biddingNumber:"",biddingCompany:"",participatingCompany:"",time:""},console.log("getDuplicates",i),this.results=i.data.map((t=>{const e={...t,biddingFileName:decodeURIComponent(t.biddingFileName),targetFileName:decodeURIComponent(t.targetFileName),repetitionRate:(""+100*parseFloat(t.abstract.repetitionRate)).substring(0,5)+"%",sameImage:`${t.abstract.imageRepetitionCount}/${t.abstract.imageTotal}`,sameSentence:`${t.abstract.textRepetitionCount}/${t.abstract.textTotal}`};return e}))},handleResultClick(t){console.log("handleResultClick",t),this.$router.push({path:"/pdf-preview",query:{compireId:t._id}})},handleEdit(){this.mode="edit"},handleSave(){this.mode="detail",(0,o.iE)(this.id,this.metaInfo)}}},l=s,r=i(1001),c=(0,r.Z)(l,a,n,!1,null,"9a2fc246",null),d=c.exports},2036:function(t,e,i){"use strict";i.d(e,{Z:function(){return d}});var a=function(){var t=this,e=t._self._c;return e("div",{staticClass:"report-preview"},[e("div",{staticClass:"filter"},[e("el-form",{staticClass:"demo-form-inline",attrs:{inline:!0,model:t.filters}},[e("el-form-item",{attrs:{label:"项目名称："}},[e("el-input",{attrs:{placeholder:"请输入项目名称"},model:{value:t.filters.projectName,callback:function(e){t.$set(t.filters,"projectName",e)},expression:"filters.projectName"}})],1),e("el-form-item",{attrs:{label:"招标编号："}},[e("el-input",{attrs:{placeholder:"请输入招标编号"},model:{value:t.filters.biddingID,callback:function(e){t.$set(t.filters,"biddingID",e)},expression:"filters.biddingID"}})],1),e("el-form-item",{attrs:{label:"招标单位："}},[e("el-input",{attrs:{placeholder:"请输入招标单位"},model:{value:t.filters.biddingCompany,callback:function(e){t.$set(t.filters,"biddingCompany",e)},expression:"filters.biddingCompany"}})],1),e("el-form-item",{attrs:{label:"招标代理："}},[e("el-input",{attrs:{placeholder:"请输入招标代理"},model:{value:t.filters.biddingAgent,callback:function(e){t.$set(t.filters,"biddingAgent",e)},expression:"filters.biddingAgent"}})],1),e("el-form-item",{attrs:{label:"参与单位："}},[e("el-input",{attrs:{placeholder:"请输入参与单位"},model:{value:t.filters.participateCompany,callback:function(e){t.$set(t.filters,"participateCompany",e)},expression:"filters.participateCompany"}})],1),e("el-form-item",{attrs:{label:"选择时间："}},[e("el-date-picker",{attrs:{type:"daterange","range-separator":"至","start-placeholder":"开始日期","end-placeholder":"结束日期","value-format":"yyyy-MM-dd"},on:{change:t.changeDate},model:{value:t.value1,callback:function(e){t.value1=e},expression:"value1"}})],1),e("el-form-item",[e("el-button",{attrs:{type:"primary"},on:{click:t.getReports}},[t._v("查询")])],1)],1)],1),e("div",{staticClass:"report-list"},[e("el-table",{staticStyle:{width:"100%"},attrs:{data:t.reports,border:""},on:{"row-click":t.goDetail}},[e("el-table-column",{attrs:{align:"center",prop:"projectName",label:"项目名称",width:"180"}}),e("el-table-column",{attrs:{align:"center",prop:"biddingNumber",label:"招标编号",width:"180"}}),e("el-table-column",{attrs:{align:"center",prop:"biddingCompany",label:"招标单位"}}),e("el-table-column",{attrs:{align:"center",prop:"time",label:"时间"}}),e("el-table-column",{attrs:{align:"center",prop:"results",label:"文件数量"}})],1)],1)])},n=[],o=(i(560),i(3219)),s={name:"ReportDetail",components:{},data(){return{value1:"",reports:[],filters:{projectName:"",biddingID:"",biddingCompany:"",biddingAgent:"",participateCompany:"",startTime:"",endTime:""}}},mounted(){console.log(this.$route.query),this.getReports()},methods:{changeDate(){this.filters.startTime=this.value1[0],this.filters.endTime=this.value1[1]},goDetail(t){this.$router.push({path:"/report-detail",query:{id:t._id}})},async getReports(){console.log("test");const t=await(0,o._8)(this.filters);console.log(t.data),this.reports=t.data.map((t=>{let e={};return e=t.metaInfo?{...t,...t.metaInfo}:{...t,projectName:"",biddingNumber:"",biddingCompany:"",time:""},e.results=t.results?t.results.length:0,console.log(e),e}))}}},l=s,r=i(1001),c=(0,r.Z)(l,a,n,!1,null,"340046ea",null),d=c.exports},5258:function(t,e,i){"use strict";i.d(e,{Z:function(){return d}});var a=function(){var t=this,e=t._self._c;return e("div",{attrs:{id:"login-page"}},[e("div",{staticClass:"login-con"},[e("div",{staticClass:"banner"}),e("div",{staticClass:"login-from"},[e("div",{staticClass:"title"},[t._v("用户登录")]),e("div",{staticClass:"input-con"},[e("el-input",{attrs:{type:"text",placeholder:"请输入用户名"},model:{value:t.username,callback:function(e){t.username=e},expression:"username"}},[e("i",{staticClass:"el-input__icon el-icon-user",attrs:{slot:"prefix"},slot:"prefix"})])],1),e("div",{staticClass:"input-con"},[e("el-input",{attrs:{type:"password",placeholder:"请输入密码"},model:{value:t.password,callback:function(e){t.password=e},expression:"password"}},[e("i",{staticClass:"el-input__icon el-icon-lock",attrs:{slot:"prefix"},slot:"prefix"})])],1),e("div",{staticClass:"btn-con"},[e("el-button",{attrs:{type:"primary"},on:{click:t.handleSubmit}},[t._v("登录")])],1)])])])},n=[],o=(i(560),i(3219)),s={name:"LoginPage",data(){return{username:"",password:""}},methods:{async handleSubmit(){try{await(0,o.x4)(this.username,this.password),this.$router.push("/file-upload")}catch(t){this.$message.error(t.message),console.error(t)}}}},l=s,r=i(1001),c=(0,r.Z)(l,a,n,!1,null,null,null),d=c.exports},6279:function(){},8954:function(t,e,i){"use strict";i.a(t,(async function(t,a){try{var n=i(9979),o=t([n]);n=(o.then?(await o)():o)[0],e.Z=n.Z,a()}catch(s){a(s)}}))},2751:function(t){function e(t){return Promise.resolve().then((function(){var e=new Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e}))}e.keys=function(){return[]},e.resolve=e,e.id=2751,t.exports=e},7849:function(t,e,i){"use strict";i.d(e,{y:function(){return a}});const a="http://localhost:3000"},9979:function(t,e,i){"use strict";i.a(t,(async function(t,a){try{var n=i(2998),o=i(2269),s=i.n(o),l=i(8914),r=i(7849),c=i(3219),d=t([n]);n=(d.then?(await d)():d)[0];const u=(t,e,i)=>{const[a,n,o,s]=t;return a.length?[a[0]*i,a[1]*i,o[0]*i,o[1]*i]:[a*i,n*i,o*i,s*i]};e.Z={data(){return{mode:this.$route.query.mode,compireId:this.$route.query.compireId,factor:1,leftWidth:.3*document.documentElement.clientWidth,highlightedBlock:{},rendedPages:{},MockMatchRes:[],ocrPages:[],pdf1TextTotal:0,textRepetitionCount:0,compireResult:{abstract:{}}}},async mounted(){console.log("this.$route",this.$route);const t=await(0,c.DH)(this.compireId),e=t;this.mode=e.data.mode,"ocr"===this.mode?this.factor=.4:this.factor=1,console.log("compireResult",e.data),console.log("compireResult detail",e.detail),this.compireResult=e.data,this.ocrPages=e.detail.pdf1Pages||[],this.MockMatchRes=e.detail.textRepetitions||e.detail.ocrRepetitions||[],this.loadPdf(`${r.y}/api/v1/file/${this.compireResult.biddingFileId}`)},methods:{async loadPdf(t){let e;"ocr"===this.mode?e=this.ocrPages.length:(n.Tu.workerSrc=i(9690),this.pdfDocument=await n.Me(t).promise,e=this.pdfDocument.numPages);for(let i=1;i<=e;i++){const t=document.createElement("div");t.className="pdf-page",t.dataset.pageNum=i;const e=document.createElement("canvas");e.dataset.pageNum=i,this.$refs.pdfContainer.appendChild(t),t.appendChild(e)}const a=new IntersectionObserver((t=>{t.forEach((t=>{t.intersectionRatio>.3&&(this.renderPage(parseInt(t.target.dataset.pageNum),t.target),this.renderHighlightBlocks(parseInt(t.target.dataset.pageNum),t.target))}))}),{threshold:.3}),o=this.$refs.pdfContainer.querySelectorAll("canvas");o.forEach((t=>a.observe(t)))},async setCanvasSize(t,e){if("ocr"===this.mode){const i=this.ocrPages[t-1],a={width:i.width,height:i.height};e.height=a.height*this.factor,e.width=a.width*this.factor}else{const i=await this.pdfDocument.getPage(t),a=i.getViewport({scale:1});e.height=a.height*this.factor,e.width=a.width*this.factor}},getHighlightBlocks(t){const e=this.MockMatchRes.filter((e=>e.pdf1Page===t)),i={};return e.forEach((t=>{const e=`${t.pdf1Page}-${t.pdf1BlockIdx}`;i[e]||(i[e]=t)})),Object.values(i)},renderHighlightBlocks(t,e){if(e.isRenderHighlitBlocks)return;e.isRenderHighlitBlocks=!0;const i=this.getHighlightBlocks(t-1),a=e.parentNode;console.log("renderHighlightBlocks blocks",t,i,a),i.forEach((t=>{const{pdf1coord:e}=t;let[i,n,o,s]=u(e,a.clientHeight,this.factor);const l=o-i,r=s-n,c=document.createElement("div");c.className="highlight-block",c.style.position="absolute",c.style.left=`${i}px`,console.log(s),"ocr"===this.mode?c.style.top=`${n}px`:c.style.bottom=`${n}px`,c.style.width=`${l}px`,c.style.height=`${r}px`,c.style.backgroundColor="rgba(255, 0, 0, 0.2)",c.dataset.id=t.id,c.dataset.index=t.index,c.dataset.blockIdx=`${t.pdf1Page}-${t.pdf1BlockIdx}`,c.addEventListener("click",(async()=>{console.log("hight block click",t.id),console.log("hight block click",JSON.stringify(t)),this.handleResItemClick(t);const e=window.document.querySelector(`.res-list > [data-id="${t.id}"]`);e.scrollIntoView(!0)})),a.appendChild(c)}))},async renderPage(t,e){if(!e.isRendered&&e)if(e.isRendered=!0,"ocr"===this.mode){const i=this.ocrPages[t-1],a={width:i.width*this.factor,height:i.height*this.factor},n=e.getContext("2d");e.height=a.height,e.width=a.width;const o=new Image;o.src=`${r.y}${i.src}`,o.onload=function(){n.drawImage(o,0,0,a.width,a.height)}}else{const i=await this.pdfDocument.getPage(t),a=i.getViewport({scale:1}),n=e.getContext("2d");e.height=a.height,e.width=a.width,await i.render({canvasContext:n,viewport:a}).promise}},scrollToTargetPage(t){console.log("scrollToTargetPage",t);const e=window.document.querySelector(`.pdfContainer > :nth-child(${t+1})`);e.scrollIntoView(!0)},onScroll(t){console.log(`Scrolled to page ${t}`),console.log(this.MockMatchRes[t-1]);const e=window.document.querySelector(`.res-list > :nth-child(${t})`);e.scrollIntoView(!0)},handleResItemClick(t){console.log("handleResItemClick",t);const e=()=>{if(this.highlightedBlock){const t=window.document.querySelector(`.highlight-block[data-block-idx="${this.highlightedBlock.pdf1Page}-${this.highlightedBlock.pdf1BlockIdx}"]`);t&&(t.style.backgroundColor="rgba(255, 0, 0, 0.2)")}this.highlightedBlock=t;const e=window.document.querySelector(`.highlight-block[data-block-idx="${this.highlightedBlock.pdf1Page}-${this.highlightedBlock.pdf1BlockIdx}"]`);e&&(e.style.backgroundColor="rgba(255, 255, 0, 0.5)")},i=t.pdf1Page;this.scrollToTargetPage(i),setTimeout((()=>{e()}),300)},async handleExportPdf(){this.$message.info("正在初始化导出，请稍后");const t=document.querySelectorAll(".pdf-page");for(let i=0;i<t.length;i++){const e=t[i];e.firstChild.isRendered||(await this.renderPage(i+1,e.firstChild),await this.renderHighlightBlocks(i+1,e.firstChild))}const e=new l.ZP("p","mm","a4");for(let i=0;i<t.length;i++){this.$message.info(`正在导出第 ${i} 页`);const a=t[i],n=await s()(a,{scale:1,useCORS:!0,allowTaint:!0,logging:!0}),o=n.toDataURL("image/png"),l=e.getImageProperties(o),r=e.internal.pageSize.getWidth(),c=l.height*r/l.width;e.addImage(o,"PNG",0,0,r,c),e.addPage()}e.save("download.pdf")}}},a()}catch(u){a(u)}}))},7686:function(t,e,i){"use strict";i.d(e,{s:function(){return a},x:function(){return n}});var a=function(){var t=this,e=t._self._c;return e("div",{staticClass:"flex"},[e("div",{ref:"pdfContainer",staticClass:"pdfContainer",class:t.mode,attrs:{id:"pdfContainer"}}),e("div",{staticClass:"res-list",style:"width:"+t.leftWidth+"px",attrs:{id:"right"}},[e("div",{staticClass:"header"},[e("div",{staticClass:"title"},[t._v("重复率")]),e("div",{staticClass:"content"},[t._v(" "+t._s(t.compireResult.abstract.textRepetitionCount)+" / "+t._s(t.compireResult.abstract.textTotal)+" ")])]),t._l(t.MockMatchRes,(function(i,a){return e("div",{key:a,staticClass:"res-item",class:{active:i.id===t.highlightedBlock.id},attrs:{"data-id":i.id},on:{click:function(e){return t.handleResItemClick(i)}}},[e("div",{staticClass:"res-item_title"},[e("div",{staticClass:"index"},[t._v(t._s(i.index))]),e("div",{staticClass:"content"},[t._v(" "+t._s(decodeURIComponent(t.compireResult.targetFileName))+" 第"+t._s(i.pdf2Page)+"页 ")]),e("div",{staticClass:"icon"})]),i.id===t.highlightedBlock.id?e("div",{staticClass:"res-item_card"},[e("div",[t._v("重复内容：")]),e("div",[t._v(" "+t._s(i.text)+" ")])]):t._e()])}))],2),e("el-button",{staticClass:"export-btn",attrs:{type:"primary"},on:{click:t.handleExportPdf}},[t._v("导出")])],1)},n=[]},3219:function(t,e,i){"use strict";i.d(e,{DH:function(){return u},Rf:function(){return g},VB:function(){return d},Zn:function(){return m},_8:function(){return f},cT:function(){return h},gp:function(){return c},iE:function(){return p},pQ:function(){return l},x4:function(){return v}});var a=i(1076),n=i(7849);const o=a.Z.create({baseURL:n.y,timeout:3e5}),s=t=>{localStorage.setItem("token",t)},l=()=>{localStorage.removeItem("token")};async function r(t){const e=localStorage.getItem("token");e?o.defaults.headers.common["Authorization"]=e:(delete o.defaults.headers.common["Authorization"],window.location.href="#/login");let i={};try{i=await t()}catch(a){401===a.response.status&&(window.location.href="#/login",l())}return i.data}const c=async t=>await r((()=>o.get(`api/v1/duplicate/report/${t}`))),d=async t=>await r((()=>o.post("api/v1/duplicate/get-duplicates",{duplicateIds:t}))),u=async t=>await r((()=>o.get(`api/v1/duplicate/duplicate-result/${t}`))),p=async(t,e)=>await r((()=>o.post("api/v1/duplicate/update-report",{id:t,metaInfo:e}))),f=async t=>await r((()=>o.get("api/v1/duplicate/reports",{params:t}))),h=async(t,e)=>await r((()=>o.post("api/v1/file/upload",t,{headers:{"Content-Type":"multipart/form-data"},onUploadProgress:t=>{const{loaded:i,total:a}=t,n=Math.floor(100*i/a);e(n)}}))),m=async t=>await r((()=>o.post("api/v1/duplicate/create-report",{results:t}))),g=async t=>await r((()=>o.post("api/v1/duplicate/exec-duplicate",t))),v=async(t,e)=>{const i=await o.post("api/v1/user/login",{username:t,password:e});0===i.data.code?s(i.data.data.token):console.error(i.data.message)}},866:function(t,e,i){"use strict";i.a(t,(async function(t,e){try{var a=i(6369),n=i(2631),o=i(6305),s=i(8902),l=i(9676),r=i(8792),c=i(2036),d=i(8499),u=i.n(d),p=i(5258),f=t([s]);s=(f.then?(await f)():f)[0],a["default"].use(n.Z),a["default"].use(u());const h=[{path:"/",redirect:"/login",name:"login"},{path:"/login",component:p.Z,name:"login"},{path:"/pdf-preview",component:s.Z},{path:"/report-list",component:c.Z},{path:"/file-upload",component:l.Z},{path:"/report-detail",component:r.Z}],m=new n.Z({routes:h});new a["default"]({router:m,render:t=>t(o.Z)}).$mount("#app"),e()}catch(h){e(h)}}))},5989:function(t,e,i){"use strict";t.exports=i.p+"img/icon.1294d74a.webp"}},e={};function i(a){var n=e[a];if(void 0!==n)return n.exports;var o=e[a]={id:a,loaded:!1,exports:{}};return t[a].call(o.exports,o,o.exports,i),o.loaded=!0,o.exports}i.m=t,function(){i.amdO={}}(),function(){var t="function"===typeof Symbol?Symbol("webpack queues"):"__webpack_queues__",e="function"===typeof Symbol?Symbol("webpack exports"):"__webpack_exports__",a="function"===typeof Symbol?Symbol("webpack error"):"__webpack_error__",n=function(t){t&&t.d<1&&(t.d=1,t.forEach((function(t){t.r--})),t.forEach((function(t){t.r--?t.r++:t()})))},o=function(i){return i.map((function(i){if(null!==i&&"object"===typeof i){if(i[t])return i;if(i.then){var o=[];o.d=0,i.then((function(t){s[e]=t,n(o)}),(function(t){s[a]=t,n(o)}));var s={};return s[t]=function(t){t(o)},s}}var l={};return l[t]=function(){},l[e]=i,l}))};i.a=function(i,s,l){var r;l&&((r=[]).d=-1);var c,d,u,p=new Set,f=i.exports,h=new Promise((function(t,e){u=e,d=t}));h[e]=f,h[t]=function(t){r&&t(r),p.forEach(t),h["catch"]((function(){}))},i.exports=h,s((function(i){var n;c=o(i);var s=function(){return c.map((function(t){if(t[a])throw t[a];return t[e]}))},l=new Promise((function(e){n=function(){e(s)},n.r=0;var i=function(t){t!==r&&!p.has(t)&&(p.add(t),t&&!t.d&&(n.r++,t.push(n)))};c.map((function(e){e[t](i)}))}));return n.r?l:s()}),(function(t){t?u(h[a]=t):d(f),n(r)})),r&&r.d<0&&(r.d=0)}}(),function(){var t=[];i.O=function(e,a,n,o){if(!a){var s=1/0;for(d=0;d<t.length;d++){a=t[d][0],n=t[d][1],o=t[d][2];for(var l=!0,r=0;r<a.length;r++)(!1&o||s>=o)&&Object.keys(i.O).every((function(t){return i.O[t](a[r])}))?a.splice(r--,1):(l=!1,o<s&&(s=o));if(l){t.splice(d--,1);var c=n();void 0!==c&&(e=c)}}return e}o=o||0;for(var d=t.length;d>0&&t[d-1][2]>o;d--)t[d]=t[d-1];t[d]=[a,n,o]}}(),function(){i.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return i.d(e,{a:e}),e}}(),function(){var t,e=Object.getPrototypeOf?function(t){return Object.getPrototypeOf(t)}:function(t){return t.__proto__};i.t=function(a,n){if(1&n&&(a=this(a)),8&n)return a;if("object"===typeof a&&a){if(4&n&&a.__esModule)return a;if(16&n&&"function"===typeof a.then)return a}var o=Object.create(null);i.r(o);var s={};t=t||[null,e({}),e([]),e(e)];for(var l=2&n&&a;"object"==typeof l&&!~t.indexOf(l);l=e(l))Object.getOwnPropertyNames(l).forEach((function(t){s[t]=function(){return a[t]}}));return s["default"]=function(){return a},i.d(o,s),o}}(),function(){i.d=function(t,e){for(var a in e)i.o(e,a)&&!i.o(t,a)&&Object.defineProperty(t,a,{enumerable:!0,get:e[a]})}}(),function(){i.f={},i.e=function(t){return Promise.all(Object.keys(i.f).reduce((function(e,a){return i.f[a](t,e),e}),[]))}}(),function(){i.u=function(t){return"js/"+t+"."+{1:"9767c27d",128:"5f39fdae",172:"89689426",296:"0b703417",414:"9089b8ac",558:"2351afce",617:"27cba3a1",779:"a23472a9"}[t]+".js"}}(),function(){i.miniCssF=function(t){}}(),function(){i.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"===typeof window)return window}}()}(),function(){i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)}}(),function(){var t={},e="paper-match-frontend:";i.l=function(a,n,o,s){if(t[a])t[a].push(n);else{var l,r;if(void 0!==o)for(var c=document.getElementsByTagName("script"),d=0;d<c.length;d++){var u=c[d];if(u.getAttribute("src")==a||u.getAttribute("data-webpack")==e+o){l=u;break}}l||(r=!0,l=document.createElement("script"),l.charset="utf-8",l.timeout=120,i.nc&&l.setAttribute("nonce",i.nc),l.setAttribute("data-webpack",e+o),l.src=a),t[a]=[n];var p=function(e,i){l.onerror=l.onload=null,clearTimeout(f);var n=t[a];if(delete t[a],l.parentNode&&l.parentNode.removeChild(l),n&&n.forEach((function(t){return t(i)})),e)return e(i)},f=setTimeout(p.bind(null,void 0,{type:"timeout",target:l}),12e4);l.onerror=p.bind(null,l.onerror),l.onload=p.bind(null,l.onload),r&&document.head.appendChild(l)}}}(),function(){i.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}}(),function(){i.nmd=function(t){return t.paths=[],t.children||(t.children=[]),t}}(),function(){i.p=""}(),function(){var t={143:0};i.f.j=function(e,a){var n=i.o(t,e)?t[e]:void 0;if(0!==n)if(n)a.push(n[2]);else{var o=new Promise((function(i,a){n=t[e]=[i,a]}));a.push(n[2]=o);var s=i.p+i.u(e),l=new Error,r=function(a){if(i.o(t,e)&&(n=t[e],0!==n&&(t[e]=void 0),n)){var o=a&&("load"===a.type?"missing":a.type),s=a&&a.target&&a.target.src;l.message="Loading chunk "+e+" failed.\n("+o+": "+s+")",l.name="ChunkLoadError",l.type=o,l.request=s,n[1](l)}};i.l(s,r,"chunk-"+e,e)}},i.O.j=function(e){return 0===t[e]};var e=function(e,a){var n,o,s=a[0],l=a[1],r=a[2],c=0;if(s.some((function(e){return 0!==t[e]}))){for(n in l)i.o(l,n)&&(i.m[n]=l[n]);if(r)var d=r(i)}for(e&&e(a);c<s.length;c++)o=s[c],i.o(t,o)&&t[o]&&t[o][0](),t[o]=0;return i.O(d)},a=self["webpackChunkpaper_match_frontend"]=self["webpackChunkpaper_match_frontend"]||[];a.forEach(e.bind(null,0)),a.push=e.bind(null,a.push.bind(a))}();var a=i.O(void 0,[998],(function(){return i(866)}));a=i.O(a)})();
//# sourceMappingURL=app.4b1847cf.js.map