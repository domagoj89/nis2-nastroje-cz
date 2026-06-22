
// Cookie consent
(function(){
  if(localStorage.getItem('cookies_accepted')) return;
  document.addEventListener('DOMContentLoaded', function(){
    var b = document.getElementById('cookie-banner');
    if(b) b.style.display='flex';
  });
})();
function acceptCookies(){localStorage.setItem('cookies_accepted','1');document.getElementById('cookie-banner').style.display='none';}
function declineCookies(){document.getElementById('cookie-banner').style.display='none';}

// Email subscribe
function subscribeEmail(e){
  e.preventDefault();
  var form = e.target;
  var email = form.querySelector('input[type=email]').value;
  var btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Odesílám...';
  fetch('/subscribe', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email: email, source: 'comparison-gate'})
  }).then(function(r){
    btn.textContent = 'Hotovo!';
    form.innerHTML = '<p style="color:#10b981;font-weight:600;">Zkontrolujte email — posíláme vám srovnání a seznam doporučených nástrojů.</p>';
    localStorage.setItem('subscribed','1');
    unlockContent();
  }).catch(function(){
    btn.disabled = false;
    btn.textContent = 'Odeslat';
  });
}
function unlockContent(){
  document.querySelectorAll('.gated').forEach(function(el){el.style.display='block';});
  var gate = document.getElementById('email-gate');
  if(gate) gate.style.display='none';
}
document.addEventListener('DOMContentLoaded', function(){
  if(localStorage.getItem('subscribed')) unlockContent();
});

// FAQ accordion
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.faq-item h3').forEach(function(h){
    h.addEventListener('click', function(){
      var p = this.nextElementSibling;
      p.style.display = p.style.display === 'block' ? 'none' : 'block';
    });
  });
});
