/* ========================================================================== 
   PMEW INDIVIDUAL PRODUCT PAGE — B2B ECOMMERCE CONTROLLER
   PHASE 4: accessibility and full UX-QA hardening on top of Phases 1–3.
   Adds keyboard/focus safety, reduced-motion behavior, accessible section state,
   visual-viewport keyboard protection and readable/non-destructive interaction states.
   Reuses window.PradakoEnquiryCart + window.PradakoCompare when available.
   ========================================================================== */
(function(window,document){
  'use strict';

  var product=window.PMEW_PRODUCT_DETAIL||{};
  var lastImageFocus=null;
  var COMPARE_STORAGE_KEY='pradako_compare_products_v1';
  var SAVED_STORAGE_KEY='pradako_saved_products_v1';
  var RECENT_STORAGE_KEY='pradako_recent_products_v1';
  var hydratingCompare=false;
  var lastUnit='Pieces';
  var suppressUnitReset=false;
  var pendingQuantityMessage='';
  var storageWarningShown=false;
  var configDraftTimer=null;
  var configDraftRestored=false;
  var memoryStore={};
  var CONFIG_DRAFT_VERSION=2;
  var CONFIG_DRAFT_TTL_MS=24*60*60*1000;
  var CONFIG_DRAFT_KEY='pradako_product_config_draft_v2:'+(product.id||'unknown-product');
  var FALLBACK_EMAIL='info@pradakomechanicals.com';
  var SCROLL_STORAGE_PREFIX='pradako_product_scroll_v1:';
  var CATALOGUE_CONTEXT_KEY='pradako_catalogue_context_v1';
  var SHARE_VERSION='1';
  var sharedConfigurationApplied=false;

  var UNIT_RULES={
    Pieces:{min:1,step:1,decimals:0,integer:true,singular:'Piece'},
    Kilograms:{min:.1,step:.1,decimals:3,integer:false,singular:'Kilogram'},
    Tonnes:{min:.001,step:.001,decimals:3,integer:false,singular:'Tonne'},
    Boxes:{min:1,step:1,decimals:0,integer:true,singular:'Box'},
    Sets:{min:1,step:1,decimals:0,integer:true,singular:'Set'}
  };

  function q(sel,root){return(root||document).querySelector(sel)}
  function qa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
  function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim()}
  function normal(v){return clean(v).toLowerCase()}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
  function prefersReducedMotion(){try{return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){return false}}
  function motionBehavior(){return prefersReducedMotion()?'auto':'smooth'}
  function focusables(root){return qa('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',root).filter(function(node){return node.offsetParent!==null&&!node.hasAttribute('inert')})}
  function setBackgroundInert(except,active){
    qa('body > *').forEach(function(node){
      if(node===except||node.tagName==='SCRIPT'||node.tagName==='STYLE')return;
      if(active){if(!node.hasAttribute('inert')){node.setAttribute('data-pmew-modal-inert','1');node.setAttribute('inert','')}}
      else if(node.getAttribute('data-pmew-modal-inert')==='1'){node.removeAttribute('inert');node.removeAttribute('data-pmew-modal-inert')}
    });
  }
  function focusProgrammatically(node){if(!node||!node.focus)return;try{node.focus({preventScroll:true})}catch(e){try{node.focus()}catch(ignore){}}}
  function toast(message,type){
    if(window.PradakoEnquiryCart&&window.PradakoEnquiryCart.toast){window.PradakoEnquiryCart.toast(message,type||'success');return}
    var live=q('[data-system-live]');if(live){live.textContent=message;live.setAttribute('data-kind',type||'info');return}
    if(window.console&&console.log)console.log(message);
  }
  function storageObject(kind){try{var s=kind==='session'?window.sessionStorage:window.localStorage;var probe='__pmew_probe_'+kind+'__';s.setItem(probe,'1');s.removeItem(probe);return s}catch(e){return null}}
  function memoryGet(key,fallback){try{return Object.prototype.hasOwnProperty.call(memoryStore,key)?JSON.parse(memoryStore[key]):fallback}catch(e){return fallback}}
  function memorySet(key,value){try{memoryStore[key]=JSON.stringify(value);return true}catch(e){return false}}
  function storeGet(key,fallback,kind){var s=storageObject(kind||'local');if(!s)return memoryGet(key,fallback);try{var raw=s.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){try{s.removeItem(key)}catch(ignore){}return fallback}}
  function storeSet(key,value,kind){var s=storageObject(kind||'local');if(!s){memorySet(key,value);surfaceStorageWarning();return false}try{s.setItem(key,JSON.stringify(value));return true}catch(e){memorySet(key,value);surfaceStorageWarning();return false}}
  function storeRemove(key,kind){var s=storageObject(kind||'local');try{if(s)s.removeItem(key)}catch(e){}delete memoryStore[key]}
  function surfaceStorageWarning(){
    if(storageWarningShown)return;storageWarningShown=true;
    showRecoveryStrip('warning','Browser storage is unavailable','This page will keep working for the current visit, but saved products, compare selections and unfinished configuration may not survive a reload.','Dismiss',hideRecoveryStrip);
  }

  function copyText(value){
    if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(value);
    return new Promise(function(resolve,reject){try{var t=document.createElement('textarea');t.value=value;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();var ok=document.execCommand('copy');document.body.removeChild(t);ok?resolve():reject(new Error('copy failed'))}catch(e){reject(e)}})
  }

  function cleanPageUrl(){
    try{var u=new URL(window.location.href);u.hash='';u.search='';return u.toString()}catch(e){return window.location.href.split(/[?#]/)[0]}
  }
  function currentShareConfiguration(){
    var cfg=readConfiguration();
    return {size:clean(cfg.size),grade:clean(cfg.grade),finish:clean(cfg.finish),quantity:isFinite(Number(cfg.quantity))?Number(cfg.quantity):null,unit:UNIT_RULES[cfg.unit]?cfg.unit:'Pieces'};
  }
  function configuredShareUrl(){
    var cfg=currentShareConfiguration();
    try{
      var u=new URL(cleanPageUrl());u.searchParams.set('cfg',SHARE_VERSION);
      if(cfg.size)u.searchParams.set('cfg_size',cfg.size);if(cfg.grade)u.searchParams.set('cfg_grade',cfg.grade);if(cfg.finish)u.searchParams.set('cfg_finish',cfg.finish);
      if(cfg.quantity!=null&&isFinite(cfg.quantity)&&cfg.quantity>0)u.searchParams.set('cfg_qty',String(cfg.quantity));if(cfg.unit)u.searchParams.set('cfg_unit',cfg.unit);
      return u.toString();
    }catch(e){return cleanPageUrl()}
  }
  function selectSharedValue(select,value){
    if(!select||!value)return {applied:false,substituted:false};var exact=qa('option',select).find(function(o){return normal(o.value)===normal(value)});
    if(exact){select.value=exact.value;return {applied:true,substituted:false}}
    var fallback=qa('option',select).find(function(o){return clean(o.value)&&isEngineeringChoice(o.value)});if(fallback){select.value=fallback.value;return {applied:true,substituted:true}}
    return {applied:false,substituted:true};
  }
  function applySharedConfiguration(){
    var params;try{params=new URL(window.location.href).searchParams}catch(e){return false}if(params.get('cfg')!==SHARE_VERSION)return false;
    var size=q('[data-config-size]'),grade=q('[data-config-grade]'),finish=q('[data-config-finish]'),qty=q('[data-config-quantity]'),unit=q('[data-config-unit]');var substituted=[];
    suppressUnitReset=true;
    var sharedSize=clean(params.get('cfg_size'));if(size&&sharedSize)size.value=sharedSize.slice(0,120);
    var g=selectSharedValue(grade,clean(params.get('cfg_grade')));if(g.substituted&&params.get('cfg_grade'))substituted.push('grade');
    var f=selectSharedValue(finish,clean(params.get('cfg_finish')));if(f.substituted&&params.get('cfg_finish'))substituted.push('finish');
    var sharedUnit=clean(params.get('cfg_unit'));if(unit&&UNIT_RULES[sharedUnit])unit.value=sharedUnit;var activeUnit=unit&&UNIT_RULES[unit.value]?unit.value:'Pieces';
    var sharedQty=Number(params.get('cfg_qty'));if(qty&&isFinite(sharedQty)&&sharedQty>0)qty.value=String(roundForRule(sharedQty,unitRule(activeUnit)));
    suppressUnitReset=false;lastUnit=activeUnit;applyQuantityRule(activeUnit);sharedConfigurationApplied=true;scheduleConfigDraft();
    showRecoveryStrip(substituted.length?'warning':'success',substituted.length?'Shared requirement needs review':'Shared configuration loaded',substituted.length?'This shared link contains '+substituted.join(' and ')+' values that are not currently listed. Engineering review has been selected instead.':'The product configuration included in this link has been restored.','Start fresh',function(){resetConfigurator(true)});
    return true;
  }

  function bindCopy(){
    qa('[data-copy-partno]').forEach(function(btn){btn.addEventListener('click',function(){
      var value=btn.getAttribute('data-copy-partno')||product.partNo||'';if(!value)return;
      copyText(value).then(function(){btn.classList.add('is-copied');toast(value+' copied.','success');setTimeout(function(){btn.classList.remove('is-copied')},1400)}).catch(function(){toast('Could not copy the product number.','warning')});
    })})
  }

  /* --------------------------------------------------------------------------
     Phase 2 — recovery/status helpers
     -------------------------------------------------------------------------- */
  function showRecoveryStrip(kind,title,message,actionLabel,action){
    var box=q('[data-recovery-strip]');if(!box)return;
    box.hidden=false;box.className='pmew-ip-recovery-strip is-'+(kind||'info');
    var t=q('[data-recovery-title]',box),m=q('[data-recovery-message]',box),b=q('[data-recovery-action]',box);
    if(t)t.textContent=title||'';if(m)m.textContent=message||'';
    if(b){b.hidden=!actionLabel;b.textContent=actionLabel||'';b.onclick=typeof action==='function'?action:null}
  }
  function hideRecoveryStrip(){var box=q('[data-recovery-strip]');if(box)box.hidden=true}

  function showConnectivity(kind,title,message){
    var box=q('[data-connectivity-status]');if(!box)return;
    box.hidden=false;box.className='pmew-ip-connectivity is-'+(kind||'info');
    var t=q('[data-connectivity-title]',box),m=q('[data-connectivity-message]',box);if(t)t.textContent=title||'';if(m)m.textContent=message||'';
  }
  function hideConnectivity(){var box=q('[data-connectivity-status]');if(box)box.hidden=true}
  function bindConnectivity(){
    function sync(initial){
      if(navigator.onLine===false){showConnectivity('offline','You are offline','You can keep configuring this product. Your RFQ remains saved in this browser, but submission needs a connection.');return}
      if(!initial){showConnectivity('online','Connection restored','Your saved configuration is intact and the RFQ can be submitted again.');window.setTimeout(hideConnectivity,4500)}else hideConnectivity();
    }
    window.addEventListener('offline',function(){sync(false)});window.addEventListener('online',function(){sync(false)});sync(true);
  }

  function draftSnapshot(){
    var cfg=readConfiguration();
    return {version:CONFIG_DRAFT_VERSION,productId:String(product.id||''),updatedAt:Date.now(),config:{size:cfg.size||'',grade:cfg.grade||'',finish:cfg.finish||'',quantity:isFinite(cfg.quantity)?cfg.quantity:null,unit:cfg.unit||'Pieces'}};
  }
  function saveConfigDraftNow(){storeSet(CONFIG_DRAFT_KEY,draftSnapshot(),'session')}
  function scheduleConfigDraft(){if(configDraftTimer)window.clearTimeout(configDraftTimer);configDraftTimer=window.setTimeout(saveConfigDraftNow,220)}
  function clearConfigDraft(){if(configDraftTimer)window.clearTimeout(configDraftTimer);configDraftTimer=null;storeRemove(CONFIG_DRAFT_KEY,'session')}
  function restoreConfigDraft(){
    var payload=storeGet(CONFIG_DRAFT_KEY,null,'session');if(!payload||payload.version!==CONFIG_DRAFT_VERSION||String(payload.productId||'')!==String(product.id||''))return false;
    var age=Date.now()-Number(payload.updatedAt||0);if(age<0||age>CONFIG_DRAFT_TTL_MS){clearConfigDraft();return false}
    var cfg=payload.config||{},size=q('[data-config-size]'),grade=q('[data-config-grade]'),finish=q('[data-config-finish]'),qty=q('[data-config-quantity]'),unit=q('[data-config-unit]');
    suppressUnitReset=true;
    if(size&&typeof cfg.size==='string')size.value=cfg.size;if(grade&&typeof cfg.grade==='string'&&qa('option',grade).some(function(o){return o.value===cfg.grade}))grade.value=cfg.grade;if(finish&&typeof cfg.finish==='string'&&qa('option',finish).some(function(o){return o.value===cfg.finish}))finish.value=cfg.finish;
    if(unit&&UNIT_RULES[cfg.unit])unit.value=cfg.unit;if(qty&&cfg.quantity!=null&&isFinite(Number(cfg.quantity)))qty.value=String(cfg.quantity);
    suppressUnitReset=false;lastUnit=unit&&UNIT_RULES[unit.value]?unit.value:'Pieces';applyQuantityRule(lastUnit);configDraftRestored=true;
    var mins=Math.max(1,Math.round(age/60000));showRecoveryStrip('success','Configuration recovered','Your unfinished '+(product.name||'product')+' requirement from '+(mins<60?mins+' min ago':Math.round(mins/60)+' hr ago')+' has been restored.','Start fresh',function(){resetConfigurator(true)});
    return true;
  }

  function fallbackImageData(){
    var label=clean(product.name||'Product image unavailable').slice(0,42);
    var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700"><rect width="900" height="700" fill="#f5f8fa"/><rect x="58" y="58" width="784" height="584" rx="28" fill="#fff" stroke="#dce6ed" stroke-width="3"/><g fill="none" stroke="#0b304c" stroke-width="18" stroke-linecap="round"><circle cx="450" cy="286" r="84"/><path d="M450 202v168M366 286h168"/></g><text x="450" y="440" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#0b304c">PRODUCT IMAGE UNAVAILABLE</text><text x="450" y="486" text-anchor="middle" font-family="Arial,sans-serif" font-size="21" fill="#677e92">'+esc(label)+'</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }
  function bindImageFallbacks(root){
    qa('img',root||document).forEach(function(img){if(img.getAttribute('data-pmew-image-guard')==='1')return;img.setAttribute('data-pmew-image-guard','1');img.addEventListener('error',function(){if(img.getAttribute('data-pmew-fallback')==='1')return;img.setAttribute('data-pmew-fallback','1');img.src=fallbackImageData();img.alt=(product.name||'Product')+' — image unavailable';img.classList.add('is-image-fallback')})});
  }

  function fallbackQuoteByEmail(){
    var cfg=readConfiguration();var validation=validateConfiguration(cfg,false);var item=configuredProduct(cfg,validation);var subject='RFQ — '+(product.partNo||product.name||'Pradako product');
    var body=['PRADAKO PRODUCT RFQ','',product.name||'',product.partNo?'Product no.: '+product.partNo:'','Quantity: '+(isFinite(cfg.quantity)?formatQuantity(cfg.quantity,cfg.unit)+' '+unitLabel(cfg.unit,cfg.quantity):'To be confirmed'),item.specifications||'',validation.needsEngineering?'Engineering review required: '+(validation.reviewWarnings||[]).join('; '):'','', 'Page: '+window.location.href].filter(Boolean).join('\n');
    window.location.href='mailto:'+FALLBACK_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  }

  /* --------------------------------------------------------------------------
     Enquiry helpers
     -------------------------------------------------------------------------- */
  function cartApi(){return window.PradakoEnquiryCart||null}
  function cartItems(){var api=cartApi();return api&&api.items?api.items():[]}
  function baseIdOf(item){
    if(!item)return'';
    if(item.baseProductId)return String(item.baseProductId);
    return String(item.id||'').split('::cfg-')[0];
  }
  function itemsForCurrentProduct(){
    var api=cartApi();
    if(api&&api.findByBase)return api.findByBase(product.id)||[];
    return cartItems().filter(function(item){return baseIdOf(item)===String(product.id||'')});
  }

  function hashString(value){
    var h=2166136261;var str=String(value||'');
    for(var i=0;i<str.length;i+=1){h^=str.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)}
    return (h>>>0).toString(36);
  }
  function isEngineeringChoice(value){
    var v=normal(value);
    return !v||v.indexOf('engineering recommendation')>-1||v.indexOf('engineering review')>-1||v.indexOf('not sure')>-1;
  }
  function isDrawingChoice(value){
    var v=normal(value);
    return v.indexOf('drawing')>-1||v.indexOf('customer specification')>-1||v.indexOf('customer / drawing')>-1;
  }
  function configKeyOf(cfg){return [normal(cfg.size),normal(cfg.grade),normal(cfg.finish)].join('|')}
  function lineIdFor(cfg){return String(product.id||'product')+'::cfg-'+hashString(configKeyOf(cfg))}

  function parseLegacySpecifications(item){
    var out={size:'',grade:'',finish:''};
    var text=clean(item&&item.specifications);
    if(!text)return out;
    text.split('|').forEach(function(part){
      var bits=part.split(':');if(bits.length<2)return;
      var key=normal(bits.shift());var value=clean(bits.join(':'));
      if(key.indexOf('size')===0)out.size=value;
      else if(key.indexOf('grade')===0||key.indexOf('property class')===0)out.grade=value;
      else if(key.indexOf('finish')===0||key.indexOf('coating')===0)out.finish=value;
    });
    return out;
  }

  function describeCartLine(item){
    if(!item)return'';
    var parsed=parseLegacySpecifications(item);var bits=[];
    if(parsed.size&&!isEngineeringChoice(parsed.size))bits.push(parsed.size);
    if(parsed.grade&&!isEngineeringChoice(parsed.grade))bits.push(parsed.grade);
    if(parsed.finish&&!isEngineeringChoice(parsed.finish))bits.push(parsed.finish);
    if(isFinite(Number(item.quantity)))bits.unshift(formatQuantity(Number(item.quantity),item.unit||'Pieces')+' '+unitLabel(item.unit||'Pieces',Number(item.quantity)));
    return bits.length?bits.join(' · '):'Older unconfigured enquiry line';
  }

  function describeExistingConfigurations(items){
    var list=(items||[]).slice(0,3).map(describeCartLine).filter(Boolean);
    var suffix=(items||[]).length>3?' · +'+((items||[]).length-3)+' more':'';
    return list.join(' / ')+suffix;
  }

  function configValue(sel){var n=q(sel);return n?clean(n.value):''}
  function parseQuantity(value){
    var raw=clean(value).replace(/,/g,'').replace(/\s/g,'');
    if(!raw)return NaN;
    var n=Number(raw);return isFinite(n)?n:NaN;
  }
  function unitRule(unit){return UNIT_RULES[unit]||UNIT_RULES.Pieces}
  function roundForRule(value,rule){var f=Math.pow(10,rule.decimals);return Math.round((value+Number.EPSILON)*f)/f}
  function formatQuantity(value,unit){
    var rule=unitRule(unit);var n=Number(value);
    if(!isFinite(n))return'';
    try{return new Intl.NumberFormat(undefined,{minimumFractionDigits:0,maximumFractionDigits:rule.decimals}).format(n)}catch(e){return String(n)}
  }
  function unitLabel(unit,quantity){var rule=unitRule(unit);return Number(quantity)===1?rule.singular:unit}

  function readConfiguration(){
    var unit=configValue('[data-config-unit]')||'Pieces';
    return {
      size:configValue('[data-config-size]'),
      grade:configValue('[data-config-grade]'),
      finish:configValue('[data-config-finish]'),
      quantity:parseQuantity(configValue('[data-config-quantity]')),
      unit:unit
    };
  }

  function setFieldError(field,message){
    var node=q('[data-field-error="'+field+'"]');
    var control=field==='quantity'?q('[data-config-quantity]'):q('[data-config-'+field+']');
    var shell=control&&control.closest?control.closest('.pmew-ip-input-shell,.pmew-ip-select-shell,.pmew-ip-qty-control'):null;
    if(node){node.hidden=!message;node.textContent=message||''}
    if(control)control.setAttribute('aria-invalid',message?'true':'false');
    if(shell)shell.classList.toggle('is-invalid',!!message);
  }

  function matchesRule(cfg,when){
    if(!when||typeof when!=='object')return false;
    var keys=['size','grade','finish','unit'];var matchedAtLeastOne=false;
    for(var i=0;i<keys.length;i+=1){
      var key=keys[i];if(when[key]==null||when[key]==='')continue;matchedAtLeastOne=true;
      var expected=Array.isArray(when[key])?when[key]:[when[key]];
      var actual=normal(cfg[key]);
      var ok=expected.some(function(v){return normal(v)===actual});
      if(!ok)return false;
    }
    return matchedAtLeastOne;
  }

  function validateConfiguration(cfg,renderErrors){
    var errors=[];var reviews=[];var rule=unitRule(cfg.unit);
    if(!isFinite(cfg.quantity)||cfg.quantity<=0){errors.push({field:'quantity',message:pendingQuantityMessage||'Enter a required quantity greater than 0.'})}
    else if(cfg.quantity<rule.min){errors.push({field:'quantity',message:'Minimum entry for '+cfg.unit+' is '+rule.min+'.'})}
    else if(rule.integer&&Math.floor(cfg.quantity)!==cfg.quantity){errors.push({field:'quantity',message:cfg.unit+' must be entered as a whole number.'})}
    else if(cfg.quantity>1000000000000){errors.push({field:'quantity',message:'This quantity is unusually large. Reduce it or send the requirement directly to our engineering team.'})}
    if(cfg.size.length>120)errors.push({field:'size',message:'Keep the size / drawing reference within 120 characters.'});

    if(!cfg.size)reviews.push('Size / thread or drawing reference to be confirmed');
    else if(isDrawingChoice(cfg.size))reviews.push('Size / geometry to be confirmed from drawing or customer specification');
    if(!cfg.grade||isEngineeringChoice(cfg.grade))reviews.push('Grade / property class recommendation required');
    else if(isDrawingChoice(cfg.grade))reviews.push('Grade / property class to be confirmed from drawing or customer specification');
    if(!cfg.finish||isEngineeringChoice(cfg.finish))reviews.push('Finish / coating recommendation required');
    else if(isDrawingChoice(cfg.finish))reviews.push('Finish / coating to be confirmed from drawing or customer specification');

    var rules=product.configurationRules||{};
    (rules.blocked||[]).forEach(function(ruleItem){
      if(matchesRule(cfg,ruleItem.when||{}))errors.push({field:ruleItem.field||'configuration',message:clean(ruleItem.message)||'This verified combination is unavailable. Choose another requirement or contact engineering.'});
    });
    (rules.review||[]).forEach(function(ruleItem){
      if(matchesRule(cfg,ruleItem.when||{}))reviews.push(clean(ruleItem.message)||'This combination requires engineering confirmation before quotation.');
    });

    if(renderErrors){
      setFieldError('quantity','');setFieldError('size','');
      errors.forEach(function(err){if(err.field==='quantity'||err.field==='size')setFieldError(err.field,err.message)});
    }
    var complete=!!(cfg.size&&cfg.grade&&cfg.finish);
    return {valid:errors.length===0,errors:errors,complete:complete,resolved:complete&&reviews.length===0,needsEngineering:reviews.length>0,reviewWarnings:reviews};
  }

  function configuredProduct(cfg,validation){
    cfg=cfg||readConfiguration();validation=validation||validateConfiguration(cfg,false);
    var bits=[];
    if(cfg.size)bits.push('Size / thread: '+cfg.size);else bits.push('Size / thread: Engineering review required');
    if(cfg.grade)bits.push('Grade / property class: '+cfg.grade);else bits.push('Grade / property class: Engineering recommendation required');
    if(cfg.finish)bits.push('Finish / coating: '+cfg.finish);else bits.push('Finish / coating: Engineering recommendation required');
    var key=configKeyOf(cfg);var reviewText=(validation.reviewWarnings||[]).join('; ');
    return {
      id:lineIdFor(cfg),
      baseProductId:String(product.id||''),
      configKey:key,
      partNo:product.partNo||'',
      name:product.name,
      category:product.category||'',
      family:product.family||'',
      familyUrl:product.familyUrl||'',
      image:product.image||'',
      quantity:cfg.quantity,
      unit:cfg.unit,
      specifications:bits.join(' | '),
      notes:'',
      configurationStatus:validation.needsEngineering?'engineering-review':'configured',
      reviewReasons:reviewText
    };
  }

  function relationFor(cfg){
    var api=cartApi();var key=configKeyOf(cfg);var baseItems=itemsForCurrentProduct();
    var legacyItems=baseItems.filter(function(item){return !clean(item.configKey)});
    var same=baseItems.find(function(item){return clean(item.configKey)&&item.configKey===key})||baseItems.find(function(item){return String(item.id||'')===lineIdFor(cfg)});
    var legacyMatch=null;
    if(!same){
      legacyMatch=legacyItems.find(function(item){
        var inferred=parseLegacySpecifications(item);var hasAny=!!(inferred.size||inferred.grade||inferred.finish);
        return hasAny&&configKeyOf(inferred)===key;
      })||null;
    }
    if(!same&&!legacyMatch&&legacyItems.length===1&&!cfg.size&&!cfg.grade&&!cfg.finish)legacyMatch=legacyItems[0];
    var compareItem=same||legacyMatch;
    var sameCommercial=!!(compareItem&&Number(compareItem.quantity)===Number(cfg.quantity)&&String(compareItem.unit||'Pieces')===String(cfg.unit));
    return {
      baseItems:baseItems,
      configuredItems:baseItems.filter(function(item){return !!clean(item.configKey)}),
      legacyItems:legacyItems,
      sameConfig:same||null,
      legacyMatch:legacyMatch,
      sameCommercial:sameCommercial,
      otherConfigs:baseItems.filter(function(item){return !compareItem||item.id!==compareItem.id}),
      full:!!(api&&api.isFull&&api.isFull())
    };
  }

  function setSummaryState(kind,label){
    var box=q('[data-config-summary]'),state=q('[data-config-state]');if(box){box.classList.remove('is-error','is-warning','is-success','is-info');box.classList.add('is-'+kind)}if(state)state.textContent=label;
  }

  /* Three-state enquiry control shared with the Customised / Spotlight UI.
     ADD = navy, ADDED = green, REMOVE = red. */
  function setEnquiryButtonVisual(btn,state,labelOverride){
    if(!btn)return;
    var iconNode=q('i',btn),label=q('[data-ecom-add-label]',btn);
    btn.classList.remove('is-added','is-remove-ready','is-update','is-new-config','is-blocked');
    btn.removeAttribute('aria-disabled');

    var text=labelOverride||'Add to Enquiry';
    var iconClass='fa-solid fa-plus';
    var pressed='false';

    if(state==='added'){
      btn.classList.add('is-added');
      text=labelOverride||'Added to Enquiry';
      iconClass='fa-solid fa-check';
      pressed='true';
    }else if(state==='remove'){
      btn.classList.add('is-added','is-remove-ready');
      text=labelOverride||'Remove from Enquiry';
      iconClass='fa-solid fa-minus';
      pressed='true';
    }else if(state==='blocked'){
      btn.classList.add('is-blocked');
      text=labelOverride||'Enquiry Full';
      iconClass='fa-solid fa-ban';
      btn.setAttribute('aria-disabled','true');
    }

    if(iconNode)iconNode.className=iconClass;
    if(label)label.textContent=text;
    btn.setAttribute('aria-pressed',pressed);
    btn.setAttribute('aria-label',text+' for '+product.name);
  }

  function showAddedStateMomentarily(){
    qa('[data-ecom-add].is-added').forEach(function(btn){
      btn.classList.remove('is-remove-ready');
      btn.classList.add('is-just-added');
      setEnquiryButtonVisual(btn,'added');
      btn.classList.add('is-just-added');
      window.setTimeout(function(){
        btn.classList.remove('is-just-added');
        if(btn.matches(':hover')||document.activeElement===btn)setEnquiryButtonVisual(btn,'remove');
      },950);
    });
  }

  function removeCurrentConfiguration(){
    var api=cartApi();if(!api||!api.remove)return false;
    var cfg=readConfiguration();var relation=relationFor(cfg);var existing=relation.sameConfig||relation.legacyMatch;
    if(!existing){updateConfigSummary();return false}
    var removed=api.remove(existing.id);
    if(removed===false){toast('Could not remove '+product.name+' from your enquiry. Please review the enquiry basket.','warning');return false}
    /* The shared cart emits the standard PMEW removal toast. */
    updateConfigSummary();syncCart();return true;
  }

  function updateConfigSummary(){
    var target=q('[data-config-summary-text]');if(!target)return;
    var cfg=readConfiguration();var result=validateConfiguration(cfg,true);var relation=relationFor(cfg);var bits=[];
    if(isFinite(cfg.quantity)&&cfg.quantity>0)bits.push(formatQuantity(cfg.quantity,cfg.unit)+' '+unitLabel(cfg.unit,cfg.quantity));else bits.push('Quantity required');
    if(cfg.size)bits.push(cfg.size);if(cfg.grade)bits.push(cfg.grade);if(cfg.finish)bits.push(cfg.finish);
    if(!cfg.size&&!cfg.grade&&!cfg.finish)bits.push('Specification can be completed with engineering');
    target.textContent=bits.join(' · ');

    var addButtons=qa('[data-ecom-add]');var quoteSubs=qa('[data-ecom-quote-sub]');
    addButtons.forEach(function(btn){btn.classList.remove('is-added','is-remove-ready','is-just-added','is-update','is-new-config','is-blocked');btn.removeAttribute('data-commit-strategy');btn.removeAttribute('aria-disabled')});
    hideNotice();

    if(!result.valid){
      setSummaryState('error','CHECK REQUIREMENT');
      addButtons.forEach(function(btn){btn.setAttribute('data-commit-strategy','blocked');setEnquiryButtonVisual(btn,'blocked','Check Requirement')});
      quoteSubs.forEach(function(n){n.textContent='Fix the highlighted requirement'});
      return;
    }

    /* Existing line: keep the commerce control deliberately simple.
       The buyer sees Added, then Remove on hover/focus/click — never Update. */
    if(relation.legacyMatch||relation.sameConfig){
      setSummaryState(result.needsEngineering?'warning':'success',result.needsEngineering?'IN ENQUIRY — ENGINEERING REVIEW':'IN ENQUIRY');
      addButtons.forEach(function(btn){btn.setAttribute('data-commit-strategy','remove');setEnquiryButtonVisual(btn,'added')});
      quoteSubs.forEach(function(n){n.textContent='Open saved enquiry line'});
      return;
    }

    if(relation.baseItems.length){
      var count=relation.baseItems.length;var existing=describeExistingConfigurations(relation.baseItems);
      if(relation.full){
        setSummaryState('warning','ENQUIRY FULL');
        addButtons.forEach(function(btn){btn.setAttribute('data-commit-strategy','blocked');setEnquiryButtonVisual(btn,'blocked','Enquiry Full · '+((cartApi()&&cartApi().count)?cartApi().count():10)+'/'+((cartApi()&&cartApi().MAX)?cartApi().MAX:10))});
      }else{
        setSummaryState(result.needsEngineering?'info':'success',result.needsEngineering?'NEW CONFIG · ENGINEERING REVIEW':'NEW CONFIGURATION READY');
        addButtons.forEach(function(btn){btn.setAttribute('data-commit-strategy','add-new');setEnquiryButtonVisual(btn,'add')});
        if(count===1&&relation.legacyItems.length===1){
        }else if(count===1){
        }else{
        }
      }
      return;
    }

    if(relation.full){
      setSummaryState('warning','ENQUIRY FULL');
      addButtons.forEach(function(btn){btn.setAttribute('data-commit-strategy','blocked');setEnquiryButtonVisual(btn,'blocked','Enquiry Full')});
      return;
    }

    setSummaryState(result.needsEngineering?'info':'success',result.needsEngineering?'ENGINEERING REVIEW':'CONFIGURATION READY');
    addButtons.forEach(function(btn){btn.setAttribute('data-commit-strategy','add');setEnquiryButtonVisual(btn,'add')});
    quoteSubs.forEach(function(n){n.textContent=result.needsEngineering?'Add & continue · engineering can complete details':'Add & continue to Enquiry'});
    /* Engineering-review state is already visible in the compact summary.
       Do not duplicate it with a second informational card. */
  }

  function openCart(mode){
    var api=cartApi();
    if(api&&api.open){
      api.open(mode==='detailed'?'detailed':'quick');
      return true;
    }
    showRecoveryStrip('warning','Enquiry basket unavailable','The shared enquiry module did not load. Your current product configuration is still available; use Request Quote to prepare an email instead.','Prepare email',fallbackQuoteByEmail);
    return false;
  }
  function commitConfiguration(openAfter,strategy){
    if(strategy==='blocked'){updateConfigSummary();return false}
    var cfg=readConfiguration();var validation=validateConfiguration(cfg,true);
    var api=cartApi();
    if(!api||!api.add){
      if(!validation.valid){updateConfigSummary();var fallbackFocus=validation.errors[0]&&validation.errors[0].field==='size'?q('[data-config-size]'):q('[data-config-quantity]');if(fallbackFocus)fallbackFocus.focus();return false}
      saveConfigDraftNow();
      if(openAfter){fallbackQuoteByEmail();return true}
      showRecoveryStrip('warning','Enquiry basket unavailable','The shared enquiry module did not load, so this configuration cannot be added to the basket. You can still prepare a direct RFQ email without losing the requirement.','Prepare email',fallbackQuoteByEmail);
      return false;
    }
    if(!validation.valid){updateConfigSummary();var first=validation.errors[0];var focusNode=first&&first.field==='size'?q('[data-config-size]'):q('[data-config-quantity]');if(focusNode)focusNode.focus();return false}
    var item=configuredProduct(cfg,validation);var relation=relationFor(cfg);var ok=false;

    if(relation.legacyMatch||relation.sameConfig){
      if(openAfter)openCart('quick');
      else updateConfigSummary();
      return true;
    }

    if(relation.full){
      toast('Your enquiry basket is full. Remove one product or submit the current enquiry before adding another configuration.','warning');
      if(openAfter)openCart('quick');
      updateConfigSummary();
      return false;
    }

    ok=api.add(item,true);
    if(!ok){
      var nowRelation=relationFor(cfg);
      if(nowRelation.sameConfig||nowRelation.legacyMatch){
        toast('That configuration is already present in your enquiry.','info');
        if(openAfter)openCart('quick');
      }else{
        toast('The configuration could not be added. Review your enquiry and try again.','warning');
      }
      updateConfigSummary();
      return false;
    }
    toast(relation.baseItems.length?product.name+' added as a new configuration.':(validation.needsEngineering?product.name+' added for engineering review.':product.name+' added to your enquiry.'),'success');

    if(ok){saveConfigDraftNow();if(openAfter)window.setTimeout(function(){openCart('quick')},80)}
    updateConfigSummary();syncCart();if(ok)showAddedStateMomentarily();return !!ok;
  }

  function syncCart(){
    var api=cartApi();var count=api&&api.count?api.count():0;var max=api&&api.MAX?api.MAX:10;
    qa('[data-cart-badge]').forEach(function(el){el.textContent=count+'/'+max;el.setAttribute('aria-label',count+' of '+max+' enquiry lines used')});
    updateConfigSummary();
    if(q('[data-alt-product-card]'))syncAlternativeActions();
  }
  function bindCart(){
    syncCart();var api=cartApi();
    if(api&&api.on)api.on('change',syncCart);
    else {
      qa('[data-open-enquiry]').forEach(function(btn){btn.addEventListener('click',function(e){e.preventDefault();openCart()})});
      window.setTimeout(function(){if(!cartApi())showRecoveryStrip('warning','Enquiry tools are unavailable','The product page is still usable, but the shared basket module did not initialise. Request Quote will fall back to a prepared email.','Dismiss',hideRecoveryStrip)},500);
    }
    window.setTimeout(syncCart,300);
  }

  function applyQuantityRule(unit){
    var input=q('[data-config-quantity]');if(!input)return;var rule=unitRule(unit);
    input.setAttribute('inputmode',rule.integer?'numeric':'decimal');
    input.setAttribute('data-quantity-step',String(rule.step));
    input.setAttribute('data-quantity-min',String(rule.min));
  }
  function setQuantity(value,unit){
    var input=q('[data-config-quantity]');if(!input)return;var rule=unitRule(unit||configValue('[data-config-unit]')||'Pieces');var n=Number(value);
    if(!isFinite(n))n=rule.min;n=Math.max(rule.min,n);if(rule.integer)n=Math.round(n);else n=roundForRule(n,rule);input.value=String(n);updateConfigSummary();scheduleConfigDraft();
  }
  function resetConfigurator(fromRecovery){
    var size=q('[data-config-size]'),grade=q('[data-config-grade]'),finish=q('[data-config-finish]'),input=q('[data-config-quantity]'),unit=q('[data-config-unit]');
    suppressUnitReset=true;if(size)size.value='';if(grade)grade.value='';if(finish)finish.value='';if(unit)unit.value='Pieces';lastUnit='Pieces';applyQuantityRule('Pieces');if(input)input.value='1';suppressUnitReset=false;
    pendingQuantityMessage='';setFieldError('quantity','');setFieldError('size','');clearConfigDraft();configDraftRestored=false;hideRecoveryStrip();updateConfigSummary();if(size&&fromRecovery)size.focus();
  }
  function bindCommerceActions(){
    qa('[data-ecom-add]').forEach(function(btn){
      function revealRemove(){if(btn.classList.contains('is-added')&&!btn.classList.contains('is-just-added')&&!btn.classList.contains('is-blocked'))setEnquiryButtonVisual(btn,'remove')}
      function restoreAdded(){if(btn.classList.contains('is-added')&&!btn.classList.contains('is-blocked'))setEnquiryButtonVisual(btn,'added')}
      btn.addEventListener('pointerenter',revealRemove);
      btn.addEventListener('pointerleave',function(){if(document.activeElement!==btn)restoreAdded()});
      btn.addEventListener('focus',revealRemove);
      btn.addEventListener('blur',restoreAdded);
      btn.addEventListener('click',function(e){
        e.preventDefault();
        if(btn.getAttribute('aria-disabled')==='true'||btn.classList.contains('is-blocked')){
          var blockedLabel=clean((q('[data-ecom-add-label]',btn)||{}).textContent||'');
          if(/enquiry full/i.test(blockedLabel)){toast('Your enquiry basket is full. Review the selected products before adding another configuration.','warning');openCart('quick')}
          else updateConfigSummary();
          return;
        }
        if(btn.classList.contains('is-added')){removeCurrentConfiguration();return}
        commitConfiguration(false,btn.getAttribute('data-commit-strategy')||'add');
      });
    });
    qa('[data-ecom-quote]').forEach(function(btn){btn.addEventListener('click',function(){commitConfiguration(true,'quote')})});

    var minus=q('[data-qty-minus]'),plus=q('[data-qty-plus]'),input=q('[data-config-quantity]'),unit=q('[data-config-unit]');
    var configNodes=qa('[data-config-size],[data-config-grade],[data-config-finish],[data-config-quantity]');
    if(unit){lastUnit=clean(unit.value)||'Pieces';applyQuantityRule(lastUnit)}

    function stepQty(direction){var currentUnit=configValue('[data-config-unit]')||'Pieces';var rule=unitRule(currentUnit);var n=parseQuantity(input&&input.value);if(!isFinite(n))n=rule.min;setQuantity(n+(direction*rule.step),currentUnit)}
    if(minus)minus.addEventListener('click',function(){stepQty(-1)});
    if(plus)plus.addEventListener('click',function(){stepQty(1)});
    if(input){
      input.addEventListener('input',function(){if(clean(input.value))pendingQuantityMessage='';updateConfigSummary();scheduleConfigDraft()});
      input.addEventListener('blur',function(){var cfg=readConfiguration();var result=validateConfiguration(cfg,true);if(result.valid)setQuantity(cfg.quantity,cfg.unit);else updateConfigSummary();scheduleConfigDraft()});
    }
    configNodes.forEach(function(node){if(node!==input){node.addEventListener('input',function(){updateConfigSummary();scheduleConfigDraft()});node.addEventListener('change',function(){updateConfigSummary();scheduleConfigDraft()})}});

    if(unit)unit.addEventListener('change',function(){
      var next=clean(unit.value)||'Pieces';applyQuantityRule(next);
      if(!suppressUnitReset&&lastUnit&&next!==lastUnit){
        if(input)input.value='';
        pendingQuantityMessage='Enter the quantity in '+next+'. The previous '+lastUnit+' value was cleared so it is not reinterpreted as a different unit.';
        setFieldError('quantity',pendingQuantityMessage);
        toast('Quantity cleared after changing unit from '+lastUnit+' to '+next+'.','info');
      }
      lastUnit=next;updateConfigSummary();scheduleConfigDraft();
    });

    qa('[data-config-clear]').forEach(function(btn){btn.addEventListener('click',function(){resetConfigurator(true)})});
    updateConfigSummary();
  }

  /* --------------------------------------------------------------------------
     Compare — includes max-limit recovery instead of a dead-end toast.
     -------------------------------------------------------------------------- */
  function loadCompareSelection(){var parsed=storeGet(COMPARE_STORAGE_KEY,[]);return Array.isArray(parsed)?parsed.filter(function(i){return i&&i.id}).slice(0,4):[]}
  function saveCompareSelection(){if(hydratingCompare||!window.PradakoCompare||!window.PradakoCompare.items)return;storeSet(COMPARE_STORAGE_KEY,window.PradakoCompare.items().slice(0,4))}
  function compareIdSignature(items){return (items||[]).map(function(i){return String(i&&i.id||'')}).filter(Boolean).join('|')}
  function hydrateCompare(){
    var api=window.PradakoCompare;if(!api||!api.add||!api.has)return;var saved=loadCompareSelection();var current=api.items?api.items():[];if(compareIdSignature(saved)===compareIdSignature(current))return;
    hydratingCompare=true;if(api.clear)api.clear();else current.forEach(function(item){if(item&&item.id&&api.remove)api.remove(item.id)});saved.forEach(function(item){if(item&&item.id&&!api.has(item.id))api.add(item)});hydratingCompare=false;syncCompare();
  }
  function syncCompare(){
    var api=window.PradakoCompare;if(!api){qa('[data-product-compare]').forEach(function(btn){btn.disabled=true;btn.classList.add('is-blocked');var missingLabel=q('[data-compare-label]',btn);if(missingLabel)missingLabel.textContent='Compare unavailable';btn.setAttribute('aria-label','Comparison tools are temporarily unavailable')});return}
    var active=api&&api.has&&api.has(product.id);var count=api&&api.count?api.count():0;var max=api&&api.MAX?api.MAX:4;var full=!active&&count>=max;
    qa('[data-product-compare]').forEach(function(btn){
      btn.classList.toggle('is-active',!!active);btn.classList.toggle('is-blocked',!!full);var label=q('[data-compare-label]',btn);
      if(label)label.textContent=active?(count>=2?'Compare · '+count+'/'+max:'Selected · '+count+'/'+max):(full?'Compare full · '+count+'/'+max:'Compare');
      btn.setAttribute('aria-pressed',active?'true':'false');btn.setAttribute('aria-label',full?'Comparison is full. Open comparison to remove one product.':(active?'Product selected for comparison':'Add product to comparison'));
    });
  }
  function bindCompare(){
    if(!window.PradakoCompare){qa('[data-product-compare]').forEach(function(btn){btn.disabled=true;btn.classList.add('is-blocked');var label=q('[data-compare-label]',btn);if(label)label.textContent='Compare unavailable';btn.setAttribute('aria-label','Comparison tools are temporarily unavailable')});return}
    hydrateCompare();syncCompare();qa('[data-product-compare]').forEach(function(btn){btn.addEventListener('click',function(){
      var api=window.PradakoCompare;if(!api||!api.add||!api.remove)return;var active=api.has&&api.has(product.id);var count=api.count?api.count():0;var max=api.MAX||4;
      if(!active&&count>=max){toast('Comparison already has '+max+' products. Remove one before adding '+product.name+'.','warning');if(api.open)api.open();return}
      if(active&&count>=2&&api.open){api.open();return}
      if(active){api.remove(product.id);toast('Product removed from comparison.','removed')}
      else{var added=api.add(product);var next=api.count?api.count():0;if(added!==false)toast(next===1?'Product selected. Choose one more product to compare.':'Comparison ready — '+next+' of '+max+' products selected.','success')}
      saveCompareSelection();syncCompare();
    })});if(window.PradakoCompare.on)window.PradakoCompare.on('change',function(){saveCompareSelection();syncCompare()});window.addEventListener('storage',function(e){if(e.key!==COMPARE_STORAGE_KEY)return;hydrateCompare();syncCompare()});
  }

  /* --------------------------------------------------------------------------
     Existing saved/share/media/navigation behaviour.
     -------------------------------------------------------------------------- */
  function savedItems(){var items=storeGet(SAVED_STORAGE_KEY,[]);return Array.isArray(items)?items.filter(function(item){return item&&item.id}).slice(0,30):[]}
  function savedItem(){return savedItems().find(function(item){return item&&item.id===product.id})||null}
  function isSaved(){return !!savedItem()}
  function syncSaved(){var active=isSaved();qa('[data-save-product]').forEach(function(btn){btn.classList.toggle('is-active',active);btn.setAttribute('aria-pressed',active?'true':'false');btn.setAttribute('title',active?'Remove saved product':'Save product');var label=q('[data-save-label]',btn);if(label)label.textContent=active?'Saved':'Save';var icon=q('i',btn);if(icon)icon.className=active?'fa-solid fa-bookmark':'fa-regular fa-bookmark'})}
  function bindSaved(){
    syncSaved();qa('[data-save-product]').forEach(function(btn){btn.addEventListener('click',function(){var items=savedItems();var idx=items.findIndex(function(i){return i&&i.id===product.id});
      if(idx>=0){items.splice(idx,1);toast('Product removed from saved items.','removed')}else{items.unshift({id:product.id,name:product.name,partNo:product.partNo,image:product.image,url:cleanPageUrl(),family:product.family||'',savedAt:Date.now()});items=items.slice(0,30);toast('Product saved in this browser.','success')}
      storeSet(SAVED_STORAGE_KEY,items);syncSaved();
    })});
    window.addEventListener('storage',function(e){if(e.key===SAVED_STORAGE_KEY)syncSaved()});
  }

  function shareText(){var cfg=currentShareConfiguration();var bits=[];if(cfg.size)bits.push(cfg.size);if(cfg.grade)bits.push(cfg.grade);if(cfg.finish)bits.push(cfg.finish);if(cfg.quantity)bits.unshift(formatQuantity(cfg.quantity,cfg.unit));return (product.partNo?product.partNo+' — ':'')+(product.name||'')+(bits.length?' · '+bits.join(' · '):'')}
  function bindShare(){qa('[data-share-product]').forEach(function(btn){btn.addEventListener('click',function(){var url=configuredShareUrl();var data={title:product.name||document.title,text:shareText(),url:url};if(navigator.share){navigator.share(data).catch(function(err){if(err&&err.name==='AbortError')return;copyText(url).then(function(){toast('Configured product link copied.','success')}).catch(function(){toast('Could not share the product link.','warning')})})}else{copyText(url).then(function(){toast('Configured product link copied.','success')}).catch(function(){toast('Could not copy the product link.','warning')})}})})}

  function bindImageModal(){
    var modal=q('[data-product-image-modal]');if(!modal)return;
    function isOpen(){return modal.classList.contains('is-open')}
    function open(){
      if(isOpen())return;lastImageFocus=document.activeElement;modal.removeAttribute('inert');setBackgroundInert(modal,true);
      modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('pmew-ip-modal-open');
      var c=q('.pmew-ip-image-modal-close',modal);function settleFocus(){if(isOpen()&&!modal.contains(document.activeElement))focusProgrammatically(c||modal)}focusProgrammatically(c||modal);window.setTimeout(settleFocus,80);window.setTimeout(settleFocus,180);
    }
    function close(){
      if(!isOpen())return;modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');modal.setAttribute('inert','');
      document.body.classList.remove('pmew-ip-modal-open');setBackgroundInert(modal,false);focusProgrammatically(lastImageFocus);
    }
    qa('[data-product-image-open]').forEach(function(btn){btn.addEventListener('click',open)});
    qa('[data-product-image-close]',modal).forEach(function(btn){btn.addEventListener('click',close)});
    document.addEventListener('keydown',function(e){
      if(!isOpen())return;
      if(e.key==='Escape'){e.preventDefault();close();return}
      if(e.key!=='Tab')return;var list=focusables(modal);if(!list.length){e.preventDefault();return}
      var first=list[0],last=list[list.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    });
  }

  function pagePositionKey(){return SCROLL_STORAGE_PREFIX+window.location.pathname+window.location.search}
  function savePagePositionNow(){storeSet(pagePositionKey(),{y:Math.max(0,Math.round(window.scrollY||0)),at:Date.now()},'session')}
  function navigationType(){try{var entries=performance.getEntriesByType&&performance.getEntriesByType('navigation');return entries&&entries[0]?entries[0].type:''}catch(e){return ''}}
  function restorePagePosition(){if(window.location.hash||navigationType()!=='back_forward')return;var saved=storeGet(pagePositionKey(),null,'session');if(!saved||!isFinite(Number(saved.y))||Date.now()-Number(saved.at||0)>2*60*60*1000)return;window.setTimeout(function(){window.scrollTo(0,Number(saved.y)||0)},80)}
  function isSameOriginUrl(value){try{return !!value&&new URL(value,window.location.href).origin===window.location.origin}catch(e){return false}}
  function looksLikeProductDetailUrl(value){try{var u=new URL(value,window.location.href);return /\/products\/[^/]+\.html$/i.test(u.pathname)}catch(e){return false}}
  function rememberCatalogueContext(){var ref=document.referrer;if(!isSameOriginUrl(ref)||ref===window.location.href)return;if(!looksLikeProductDetailUrl(ref))storeSet(CATALOGUE_CONTEXT_KEY,{url:ref,at:Date.now()},'session')}
  function bindReturnContext(){
    var btn=q('[data-return-context]');if(!btn)return;rememberCatalogueContext();var ref=document.referrer;var sameOrigin=isSameOriginUrl(ref)&&ref!==window.location.href;var catalogue=storeGet(CATALOGUE_CONTEXT_KEY,null,'session');var familyFallback=product.familyUrl||'/pages/products/products.html';
    btn.hidden=false;var label=q('[data-return-label]',btn);if(label)label.textContent=sameOrigin?(looksLikeProductDetailUrl(ref)?'Back to previous product':'Back to product results'):'Back to '+(product.family||'products');
    btn.addEventListener('click',function(){savePagePositionNow();if(sameOrigin&&window.history.length>1){window.history.back();return}if(catalogue&&catalogue.url&&Date.now()-Number(catalogue.at||0)<2*60*60*1000){window.location.href=catalogue.url;return}window.location.href=familyFallback});
  }
  function bindContinuityLinks(){qa('a[href]').forEach(function(link){if(link.getAttribute('data-continuity-bound')==='1')return;link.setAttribute('data-continuity-bound','1');link.addEventListener('click',function(){savePagePositionNow()})})}

  function bindBackTop(){var btn=q('[data-back-top]');if(!btn)return;function update(){btn.classList.toggle('is-visible',window.scrollY>800);btn.setAttribute('aria-hidden',window.scrollY>800?'false':'true');if(window.scrollY>800)btn.removeAttribute('tabindex');else btn.setAttribute('tabindex','-1')}window.addEventListener('scroll',update,{passive:true});btn.addEventListener('click',function(){window.scrollTo({top:0,behavior:motionBehavior()});window.setTimeout(function(){focusProgrammatically(q('#product-main'))},prefersReducedMotion()?0:260)});update()}
  function bindSectionNav(){
    var links=qa('.pmew-ip-anchor-nav a[href^="#"]');if(!links.length)return;var manualUntil=0;
    function setActive(id){links.forEach(function(link){var active=link.getAttribute('href')==='#'+id;link.classList.toggle('is-active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}
    function go(link,updateHistory){var target=q(link.getAttribute('href'));if(!target)return;manualUntil=Date.now()+900;target.setAttribute('tabindex','-1');target.scrollIntoView({behavior:motionBehavior(),block:'start'});window.setTimeout(function(){focusProgrammatically(target)},prefersReducedMotion()?0:180);setActive(target.id);if(updateHistory)history.replaceState(history.state||{},'',link.getAttribute('href'))}
    links.forEach(function(link){link.addEventListener('click',function(e){e.preventDefault();go(link,true)})});
    qa('.pmew-ip-gallery-shortcut[href^="#"]').forEach(function(link){link.addEventListener('click',function(e){e.preventDefault();go(link,false)})});
    if(!('IntersectionObserver'in window))return;var sections=['overview'].concat(qa('[data-page-section]').map(function(s){return s.id})).map(function(id){return q('#'+id)}).filter(Boolean);
    var observer=new IntersectionObserver(function(entries){if(Date.now()<manualUntil)return;var visible=entries.filter(function(e){return e.isIntersecting}).sort(function(a,b){return b.intersectionRatio-a.intersectionRatio})[0];if(visible)setActive(visible.target.id)},{rootMargin:'-25% 0px -58% 0px',threshold:[0,.1,.35,.6]});sections.forEach(function(section){observer.observe(section)});
  }

  function updateNavOffset(){var candidates=[q('#navbar-container'),q('header'),q('.navbar'),q('.pmew-navbar')].filter(Boolean);var height=0;candidates.forEach(function(n){var r=n.getBoundingClientRect();if(r.height>height&&r.height<240)height=r.height});document.documentElement.style.setProperty('--ip-nav-offset',Math.max(64,Math.round(height))+'px')}

  function bindVisualViewportSafety(){
    var vv=window.visualViewport;if(!vv)return;var baseline=vv.height;
    function isEditing(){var a=document.activeElement;return !!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))}
    function sync(){var keyboard=isEditing()&&(baseline-vv.height)>120&&window.innerWidth<=1040;document.body.classList.toggle('pmew-ip-keyboard-open',keyboard);document.documentElement.style.setProperty('--ip-visual-viewport-height',Math.round(vv.height)+'px')}
    vv.addEventListener('resize',sync,{passive:true});vv.addEventListener('scroll',sync,{passive:true});
    window.addEventListener('resize',function(){if(!isEditing())baseline=vv.height;sync()},{passive:true});document.addEventListener('focusout',function(){window.setTimeout(function(){if(!isEditing()){baseline=vv.height;sync()}},80)});sync();
  }

  function recentItems(){var list=storeGet(RECENT_STORAGE_KEY,[]);return Array.isArray(list)?list.filter(function(i){return i&&i.id&&i.name}).slice(0,12):[]}
  function recordCurrentRecent(){var current={id:product.id,name:product.name,partNo:product.partNo,image:product.image,url:cleanPageUrl(),family:product.family||'',viewedAt:Date.now()};var list=[current].concat(recentItems().filter(function(i){return i.id!==product.id})).slice(0,12);storeSet(RECENT_STORAGE_KEY,list)}
  function renderRecent(){
    var section=q('[data-recent-section]'),grid=q('[data-recent-grid]');if(!section||!grid)return;var previous=recentItems().filter(function(i){return i.id!==product.id}).slice(0,6);if(!previous.length){section.hidden=true;return}section.hidden=false;
    grid.innerHTML=previous.map(function(item){return '<a class="pmew-ip-recent-card" href="'+esc(item.url||'#')+'"><img src="'+esc(item.image||'')+'" alt=""><span><small>'+esc(item.partNo||item.family||'Recently viewed')+'</small><strong>'+esc(item.name||'Product')+'</strong></span></a>'}).join('');bindImageFallbacks(grid);bindContinuityLinks();
  }
  function clearRecent(){var current=recentItems().find(function(i){return i.id===product.id});storeSet(RECENT_STORAGE_KEY,current?[current]:[]);renderRecent();toast('Recently viewed history cleared.','removed')}
  function bindRecent(){var clear=q('[data-recent-clear]');if(clear)clear.addEventListener('click',clearRecent);window.addEventListener('storage',function(e){if(e.key===RECENT_STORAGE_KEY)renderRecent()})}
  function syncContinuityState(){syncCart();syncCompare();syncSaved();renderRecent()}


  /* --------------------------------------------------------------------------
     Alternative Products — same-page configuration swaps + cross-page RFQ candidates
     -------------------------------------------------------------------------- */
  function alternativeProducts(){
    var list=product&&product.alternatives&&Array.isArray(product.alternatives.products)?product.alternatives.products:[];
    return list;
  }
  function alternativeById(id){return alternativeProducts().find(function(item){return String(item.id||'')===String(id||'')})||null}
  function hasOption(select,value){return !!(select&&qa('option',select).some(function(o){return normal(o.value)===normal(value)}))}
  function applyAlternativeConfiguration(axis,value,announce){
    if(axis!=='grade'&&axis!=='finish')return false;
    var select=q(axis==='grade'?'[data-config-grade]':'[data-config-finish]');
    if(!select||!hasOption(select,value)){toast('That '+axis+' option is no longer listed for this product. Engineering review is recommended.','warning');return false}
    var option=qa('option',select).find(function(o){return normal(o.value)===normal(value)});select.value=option.value;
    select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));
    updateConfigSummary();scheduleConfigDraft();syncAlternativeConfigState();
    if(announce!==false)toast(value+' applied to the current '+product.name+' configuration.','success');
    return true;
  }
  function syncAlternativeConfigState(){
    qa('[data-alt-config-card]').forEach(function(card){
      var axis=card.getAttribute('data-alt-axis'),value=card.getAttribute('data-alt-value');var current=configValue(axis==='grade'?'[data-config-grade]':'[data-config-finish]');var active=normal(current)===normal(value);
      card.classList.toggle('is-applied',active);var button=q('[data-alt-config-apply]',card);if(button){button.disabled=active;button.textContent=active?'Applied':'Apply'}
    });
  }
  function altValueAvailable(values,value){return Array.isArray(values)&&values.some(function(v){return normal(v)===normal(value)})}
  function alternativeCartItem(alt){
    var cfg=readConfiguration();var validation=validateConfiguration(cfg,true);if(!validation.valid)return null;
    var attrs=alt&&alt.attributes?alt.attributes:{};var mappedGrade=cfg.grade,mappedFinish=cfg.finish;var reasons=[];
    if(cfg.grade&&!isEngineeringChoice(cfg.grade)&&!isDrawingChoice(cfg.grade)&&!altValueAvailable(attrs.grades,cfg.grade)){mappedGrade='Engineering recommendation required';reasons.push('Selected grade / property class is not listed on the alternative product')}
    if(cfg.finish&&!isEngineeringChoice(cfg.finish)&&!isDrawingChoice(cfg.finish)&&!altValueAvailable(attrs.finishes,cfg.finish)){mappedFinish='Engineering recommendation required';reasons.push('Selected finish / coating is not listed on the alternative product')}
    if(!cfg.grade)reasons.push('Grade / property class to be confirmed');if(!cfg.finish)reasons.push('Finish / coating to be confirmed');if(!cfg.size)reasons.push('Size / thread or drawing reference to be confirmed');
    reasons.unshift('Alternative product form requires engineering review before substitution');
    var key=[normal(cfg.size),normal(mappedGrade),normal(mappedFinish)].join('|');var bits=[];
    bits.push('Alternative to: '+(product.partNo||product.name||'current product'));
    bits.push('Size / thread: '+(cfg.size||'Engineering review required'));
    bits.push('Grade / property class: '+(mappedGrade||'Engineering recommendation required'));
    bits.push('Finish / coating: '+(mappedFinish||'Engineering recommendation required'));
    return {
      id:String(alt.id||'alternative')+'::cfg-'+hashString(key),baseProductId:String(alt.id||''),configKey:key,partNo:alt.partNo||'',name:alt.name||'Alternative product',category:alt.category||'',family:alt.family||product.family||'',familyUrl:product.familyUrl||'',image:alt.image||'',quantity:cfg.quantity,unit:cfg.unit,specifications:bits.join(' | '),notes:'Alternative candidate selected from '+product.name+'. '+(alt.confidenceLabel||'ENGINEERING REVIEW')+(alt.basis?' — '+alt.basis:''),configurationStatus:alt.confidence==='verified-equivalent'&&alt.basis&&!reasons.slice(1).length?'configured':'engineering-review',reviewReasons:reasons.join('; ')
    };
  }
  function addAlternativeToRFQ(alt,silent){
    var api=cartApi();if(!api||!api.add){showRecoveryStrip('warning','Enquiry basket unavailable','The alternative could not be added because the shared enquiry module did not load.','Dismiss',hideRecoveryStrip);return false}
    var item=alternativeCartItem(alt);if(!item)return false;
    var existing=cartItems().find(function(x){return String(x.id||'')===item.id});if(existing){if(!silent)toast(alt.name+' is already in your enquiry with this mapped requirement.','info');return true}
    if(api.isFull&&api.isFull()){toast('Your enquiry basket is full. Remove one product before adding this alternative.','warning');openCart('quick');return false}
    var ok=api.add(item,true);if(ok&&!silent)toast(alt.name+' added as an engineering-review alternative.','success');syncCart();return !!ok;
  }
  function syncAlternativeActions(){
    syncAlternativeConfigState();
  }
  function bindAlternativeViewAll(){
    var btn=q('[data-alt-viewall]');if(!btn)return;var cards=qa('.pmew-ip-alt-product-card.is-extra-alt');
    function setExpanded(expanded){cards.forEach(function(card){card.hidden=!expanded});btn.setAttribute('aria-expanded',expanded?'true':'false');var label=q('span',btn);if(label)label.textContent=expanded?'Show fewer alternatives':'View all '+qa('.pmew-ip-alt-product-card').length+' alternatives'}
    btn.addEventListener('click',function(){setExpanded(btn.getAttribute('aria-expanded')!=='true')});setExpanded(false);
  }
  function bindAlternatives(){
    qa('[data-alt-config-apply]').forEach(function(btn){btn.addEventListener('click',function(){applyAlternativeConfiguration(btn.getAttribute('data-alt-axis'),btn.getAttribute('data-alt-value'),true)})});
    qa('[data-alt-rfq-add]').forEach(function(btn){btn.addEventListener('click',function(){var alt=alternativeById(btn.getAttribute('data-alt-id'));if(alt)addAlternativeToRFQ(alt,false)})});
    var grade=q('[data-config-grade]'),finish=q('[data-config-finish]');[grade,finish].filter(Boolean).forEach(function(node){node.addEventListener('change',syncAlternativeConfigState);node.addEventListener('input',syncAlternativeConfigState)});
    var api=cartApi();if(api&&api.on)api.on('change',syncAlternativeActions);bindAlternativeViewAll();syncAlternativeActions();
  }

  function init(){
    bindCopy();if(!applySharedConfiguration())restoreConfigDraft();bindCommerceActions();bindCart();bindAlternatives();bindCompare();bindSaved();bindShare();bindImageModal();bindImageFallbacks(document);bindConnectivity();bindReturnContext();bindBackTop();bindVisualViewportSafety();bindSectionNav();recordCurrentRecent();renderRecent();bindRecent();bindContinuityLinks();updateNavOffset();restorePagePosition();
    window.addEventListener('resize',updateNavOffset,{passive:true});
    window.addEventListener('pagehide',function(){saveConfigDraftNow();savePagePositionNow()});
    window.addEventListener('pageshow',function(){window.setTimeout(syncContinuityState,0)});
    setTimeout(updateNavOffset,500);setTimeout(updateNavOffset,1400);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}(window,document));
