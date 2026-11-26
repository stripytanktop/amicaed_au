(function(){var r=document.documentElement,btn=document.getElementById('rsBtn'),p=document.getElementById('rsPanel');
function ap(k,v){r.setAttribute('data-'+k,v);p.querySelectorAll('[data-'+k+']').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-'+k)===v))})}
['size','space'].forEach(function(k){var v=null;try{v=sessionStorage.getItem('amica-'+k)}catch(e){}if(v)ap(k,v)});
p.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;['size','space'].forEach(function(k){if(b.hasAttribute('data-'+k)){var v=b.getAttribute('data-'+k);ap(k,v);try{sessionStorage.setItem('amica-'+k,v)}catch(e){}}})});
btn.addEventListener('click',function(){var o=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!o));p.hidden=o});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!p.hidden){p.hidden=true;btn.setAttribute('aria-expanded','false');btn.focus()}});})();
