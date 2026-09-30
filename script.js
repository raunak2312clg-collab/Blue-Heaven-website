
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

const header=$('.site-header');
const topBtn=$('.to-top');
const heroBg=$('.hero-bg');

addEventListener('scroll',()=>{
  const y=scrollY;
  header.classList.toggle('scrolled',y>20);
  topBtn.classList.toggle('show',y>520);
  if(heroBg && y<950) heroBg.style.transform=`scale(1.05) translateY(${y*.10}px)`;
},{passive:true});
topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
},{threshold:.12});
$$('.reveal').forEach(el=>revealObserver.observe(el));

$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const target=$(a.getAttribute('href'));
  if(target){
    e.preventDefault();
    target.scrollIntoView({behavior:'smooth'});
    setMobileMenu(false);
  }
}));

const navLinks=$$('.nav a');
const spy=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      navLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));
    }
  });
},{rootMargin:'-45% 0px -45% 0px'});
$$('section[id]').forEach(s=>spy.observe(s));

const menuToggle=$('.menu-toggle');
const siteNav=$('#siteNav');

function setMobileMenu(open){
  siteNav.classList.toggle('mobile-open',open);
  menuToggle.classList.toggle('is-open',open);
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',open?'Close menu':'Open menu');
  document.body.classList.toggle('menu-open',open);

  if(open){
    siteNav.scrollTop=0;
    requestAnimationFrame(()=>{
      const firstLink=siteNav.querySelector('a');
      if(firstLink) firstLink.focus({preventScroll:true});
    });
  }else if(document.activeElement && siteNav.contains(document.activeElement)){
    menuToggle.focus({preventScroll:true});
  }
}
menuToggle.addEventListener('click',()=>setMobileMenu(!siteNav.classList.contains('mobile-open')));

/* ----------------------------
   Content modal
----------------------------- */
const contentModal=$('#contentModal');
const modalImage=$('#modalImage');
const modalTitle=$('#modalTitle');
const modalBody=$('#modalBody');
const modalEyebrow=$('#modalEyebrow');

function syncModalLock(){
  document.body.classList.toggle('modal-open',Boolean($('.modal.open')));
}

function openContent(title,body,img,eyebrow='Blue Heaven'){
  modalTitle.textContent=title;
  modalBody.textContent=body;
  modalImage.src=img||'assets/thali.jpg';
  modalEyebrow.textContent=eyebrow;
  contentModal.classList.add('open');
  contentModal.setAttribute('aria-hidden','false');
  syncModalLock();
}
function closeContent(){
  contentModal.classList.remove('open');
  contentModal.setAttribute('aria-hidden','true');
  syncModalLock();
}
function bindDataItems(root=document){
  $$('[data-item]',root).forEach(el=>{
    if(el.dataset.boundItem) return;
    el.dataset.boundItem='1';
    el.addEventListener('click',()=>{
      const [title,body,img]=el.dataset.item.split('|');
      openContent(title,body,img,'Blue Heaven · Goa');
    });
  });
}
bindDataItems();
$$('[data-close-modal]').forEach(el=>el.addEventListener('click',closeContent));

/* ----------------------------
   Specials slider
   Desktop: 3-card grouped slider
   Mobile/tablet: native swipe + scroll snap
----------------------------- */
const specialTrack=$('#specialTrack');
const specialViewport=$('.special-viewport');
const specialCards=$$('.special-card');
const specialDots=$('#specialDots');
let specialPage=0;
let specialScrollTimer;

function isTouchSlider(){return innerWidth<=980}
function specialsPerPage(){return isTouchSlider()?1:3}
function specialsPages(){return Math.ceil(specialCards.length/specialsPerPage())}

function buildSpecialDots(){
  specialDots.innerHTML='';
  for(let i=0;i<specialsPages();i++){
    const b=document.createElement('button');
    b.setAttribute('aria-label',`Go to specials slide ${i+1}`);
    b.addEventListener('click',()=>goSpecial(i));
    specialDots.appendChild(b);
  }
}

function setSpecialDot(page){
  $$('#specialDots button').forEach((d,i)=>d.classList.toggle('active',i===page));
}

function goSpecial(page,behavior='smooth'){
  const pages=specialsPages();
  specialPage=(page+pages)%pages;
  const firstIndex=specialPage*specialsPerPage();
  const card=specialCards[firstIndex];
  if(!card) return;

  if(isTouchSlider()){
    specialTrack.style.transform='none';
    const left=card.offsetLeft - specialTrack.offsetLeft;
    specialViewport.scrollTo({left,behavior});
  }else{
    specialViewport.scrollLeft=0;
    specialTrack.style.transform=`translateX(${-card.offsetLeft}px)`;
  }
  setSpecialDot(specialPage);
}

specialViewport.addEventListener('scroll',()=>{
  if(!isTouchSlider()) return;
  clearTimeout(specialScrollTimer);
  specialScrollTimer=setTimeout(()=>{
    const viewportLeft=specialViewport.scrollLeft;
    let closest=0;
    let best=Infinity;
    specialCards.forEach((card,i)=>{
      const dist=Math.abs((card.offsetLeft-specialTrack.offsetLeft)-viewportLeft);
      if(dist<best){best=dist;closest=i}
    });
    specialPage=closest;
    setSpecialDot(specialPage);
  },80);
},{passive:true});

$('[data-special-prev]').addEventListener('click',()=>goSpecial(specialPage-1));
$('[data-special-next]').addEventListener('click',()=>goSpecial(specialPage+1));
buildSpecialDots();
goSpecial(0,'auto');

let resizeTimer;
addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>{
    specialPage=0;
    buildSpecialDots();
    goSpecial(0,'auto');
  },160);
});

let specialAuto;
function startSpecialAuto(){
  clearInterval(specialAuto);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  specialAuto=setInterval(()=>goSpecial(specialPage+1),6200);
}
startSpecialAuto();
$('.slider-shell').addEventListener('mouseenter',()=>clearInterval(specialAuto));
$('.slider-shell').addEventListener('mouseleave',startSpecialAuto);
specialViewport.addEventListener('touchstart',()=>clearInterval(specialAuto),{passive:true});
specialViewport.addEventListener('touchend',startSpecialAuto,{passive:true});

/* ----------------------------
   Full menu modal
----------------------------- */
const menuData=[
  ['popular','Butter Squids','Tender squid in a rich buttery Goan-style preparation.'],
  ['popular','Crispy Paneer','Crispy paneer bites with a flavorful house seasoning.'],
  ['popular','Chicken Cafreal','Goan-style chicken packed with herbs and spices.'],
  ['popular','Fish Curry Rice','Classic Goan fish curry served with fragrant rice.'],
  ['mains','Chicken Cafreal','A Goan favourite with fresh herbs and bold spices.'],
  ['mains','Chicken Xacuti','Slow-cooked chicken in a rich roasted-spice gravy.'],
  ['mains','Pork Sorpotel','Traditional Goan pork preparation with deep spices.'],
  ['mains','Fish Curry Rice','Coastal fish curry served with steamed rice.'],
  ['vegetarian','Crispy Paneer','Golden paneer with crunchy exterior and house seasoning.'],
  ['vegetarian','Goan Vegetable Curry','Seasonal vegetables in a fragrant coconut-based curry.'],
  ['vegetarian','Garden Salad','Fresh greens, vegetables and a light dressing.'],
  ['vegetarian','Masala Fries','Crispy fries finished with a house masala.'],
  ['starters','Chicken Wings','Crispy wings tossed in a flavorful house sauce.'],
  ['starters','Crispy Paneer','Crunchy paneer bites with a spicy dip.'],
  ['starters','Calamari','Lightly seasoned squid served crisp and tender.'],
  ['starters','Masala Fries','Crispy fries with our signature seasoning.'],
  ['seafood','Butter Squids','Tender squid cooked in a rich buttery preparation.'],
  ['seafood','Goan Fish Curry','Classic coconut-based Goan curry with fresh fish.'],
  ['seafood','Prawn Curry','Juicy prawns cooked in a fragrant coastal curry.'],
  ['seafood','Fish Fry','Fresh fish marinated with Goan spices and pan fried.'],
  ['drinks','Fresh Lime Soda','Refreshing lime, soda and a touch of sweetness.'],
  ['drinks','Fresh Fruit Juice','Seasonal fruit blended fresh to order.'],
  ['drinks','Cold Coffee','Smooth chilled coffee with a creamy finish.'],
  ['drinks','Iced Tea','Refreshing chilled tea with citrus notes.']
];

const menuModal=$('#menuModal');
const fullMenuGrid=$('#fullMenuGrid');
let activeCategory='all';

function dishImageFor(name){
  const map={
    'Butter Squids':'assets/buttersquids2.jpg',
    'Fish Curry Rice':'assets/thali.jpg',
    'Goan Fish Curry':'assets/thali.jpg',
    'Prawn Curry':'assets/FL-4.jpg',
    'Fish Fry':'assets/FL-4.jpg',
    'Chicken Cafreal':'assets/dish-03.jpg',
    'Chicken Xacuti':'assets/dish-05.jpg',
    'Pork Sorpotel':'assets/dish-06.jpg',
    'Crispy Paneer':'assets/dish-10.jpg'
  };
  return map[name]||'assets/dish-11.jpg';
}
function renderFullMenu(){
  const data=activeCategory==='all'?menuData:menuData.filter(i=>i[0]===activeCategory);
  fullMenuGrid.innerHTML=data.map(([cat,name,desc])=>`
    <button class="full-menu-card" data-menu-detail="${name}|${desc}|${dishImageFor(name)}">
      <h3>${name}</h3>
      <p>${desc}</p>
    </button>
  `).join('');
  $$('[data-menu-detail]',fullMenuGrid).forEach(el=>el.addEventListener('click',()=>{
    const [title,body,img]=el.dataset.menuDetail.split('|');
    openContent(title,body,img,'Our Menu');
  }));
}
function openMenu(){
  menuModal.classList.add('open');
  menuModal.setAttribute('aria-hidden','false');
  renderFullMenu();
  syncModalLock();
}
function closeMenu(){
  menuModal.classList.remove('open');
  menuModal.setAttribute('aria-hidden','true');
  syncModalLock();
}
$('#fullMenuButton').addEventListener('click',openMenu);
$$('[data-close-menu]').forEach(el=>el.addEventListener('click',closeMenu));
$$('#menuTabs button').forEach(btn=>btn.addEventListener('click',()=>{
  activeCategory=btn.dataset.category;
  $$('#menuTabs button').forEach(b=>b.classList.toggle('active',b===btn));
  renderFullMenu();
}));

/* ----------------------------
   Reviews — real slide with changing full background
----------------------------- */
const reviews=[
  {
    text:'“The food was absolutely delicious. The Goan flavours felt authentic and the seafood was fresh. Definitely coming back!”',
    author:'Arjun M. · Local Guide',
    bg:'assets/place-06.jpg'
  },
  {
    text:'“A lovely place for dinner with friends. Great atmosphere, friendly service and the seafood was one of the highlights.”',
    author:'Sarah D. · Visitor',
    bg:'assets/place-04.jpg'
  },
  {
    text:'“The Bhatkar Thali is a must try. Generous portions, proper Goan taste and a really relaxed atmosphere.”',
    author:'Rahul K. · Food Lover',
    bg:'assets/thali.jpg'
  },
  {
    text:'“Great place for a family dinner. The seafood was excellent and everything arrived fresh and well prepared.”',
    author:'Nikhil S. · Local Guide',
    bg:'assets/place-02.jpg'
  }
];

let reviewIndex=0;
const quoteText=$('#quoteText');
const quoteAuthor=$('#quoteAuthor');
const quoteDots=$('#quoteDots');
let activeBg=$('#reviewBgA');
let inactiveBg=$('#reviewBgB');

reviews.forEach((r,i)=>{
  const b=document.createElement('button');
  b.setAttribute('aria-label',`Go to review ${i+1}`);
  b.addEventListener('click',()=>setReview(i));
  quoteDots.appendChild(b);
});

function changeReviewBackground(src){
  inactiveBg.style.backgroundImage=`url("${src}")`;
  inactiveBg.classList.add('active');
  activeBg.classList.remove('active');
  const temp=activeBg;activeBg=inactiveBg;inactiveBg=temp;
}

function setReview(i,initial=false){
  reviewIndex=(i+reviews.length)%reviews.length;
  const r=reviews[reviewIndex];
  quoteText.animate(
    [{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],
    {duration:430,easing:'ease-out'}
  );
  quoteText.textContent=r.text;
  quoteAuthor.textContent=r.author;
  if(!initial) changeReviewBackground(r.bg);
  else activeBg.style.backgroundImage=`url("${r.bg}")`;
  $$('#quoteDots button').forEach((d,k)=>d.classList.toggle('active',k===reviewIndex));
}
$('.quote-prev').addEventListener('click',()=>setReview(reviewIndex-1));
$('.quote-next').addEventListener('click',()=>setReview(reviewIndex+1));
setReview(0,true);

let reviewAuto=setInterval(()=>setReview(reviewIndex+1),5600);
$('.review-slider').addEventListener('mouseenter',()=>clearInterval(reviewAuto));
$('.review-slider').addEventListener('mouseleave',()=>{
  clearInterval(reviewAuto);
  reviewAuto=setInterval(()=>setReview(reviewIndex+1),5600);
});

/* ----------------------------
   Gallery
----------------------------- */
const lightbox=$('#lightbox');
const lightboxImg=$('#lightbox img');

function openGallery(src){
  lightboxImg.src=src;
  lightbox.classList.add('open');
}
$$('[data-gallery]').forEach(el=>el.addEventListener('click',()=>openGallery(el.dataset.gallery)));
$('#galleryButton').addEventListener('click',()=>openGallery($$('[data-gallery]')[0].dataset.gallery));
$('.lightbox-close').addEventListener('click',()=>lightbox.classList.remove('open'));
lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.classList.remove('open')});

/* ----------------------------
   Booking -> WhatsApp
----------------------------- */
const bookingModal=$('#bookingModal');

function openBooking(){
  setMobileMenu(false);
  bookingModal.classList.add('open');
  bookingModal.setAttribute('aria-hidden','false');
  syncModalLock();
}
function closeBooking(){
  bookingModal.classList.remove('open');
  bookingModal.setAttribute('aria-hidden','true');
  syncModalLock();
}
$$('[data-book]').forEach(el=>el.addEventListener('click',openBooking));
$$('[data-close-booking]').forEach(el=>el.addEventListener('click',closeBooking));

const dateInput=$('#bookingForm input[name="date"]');
if(dateInput){
  const now=new Date();
  const local=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
  dateInput.min=local;
}

$('#bookingForm').addEventListener('submit',e=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  const name=fd.get('name');
  const phone=fd.get('phone');
  const date=fd.get('date');
  const time=fd.get('time');
  const guests=fd.get('guests');
  const email=fd.get('email')||'Not provided';
  const note=fd.get('note')||'None';
  const message=`Hello Blue Heaven! I would like to reserve a table.

Name: ${name}
Phone: ${phone}
Email: ${email}
Date: ${date}
Time: ${time}
Guests: ${guests}
Special request: ${note}`;
  $('.form-status',e.target).textContent='Opening WhatsApp with your reservation details…';
  window.open(`https://wa.me/9028910022?text=${encodeURIComponent(message)}`,'_blank','noopener');
});

/* ----------------------------
   Lazy-load the background video
----------------------------- */
const vibeVideo=$('.vibe-bg-video');
if(vibeVideo){
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduceMotion){
    const loadVibeVideo=()=>{
      const source=$('source[data-src]',vibeVideo);
      if(source){
        source.src=source.dataset.src;
        source.removeAttribute('data-src');
        vibeVideo.load();
        vibeVideo.play().catch(()=>{});
      }
    };
    const videoObserver=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){
        loadVibeVideo();
        videoObserver.disconnect();
      }
    },{rootMargin:'350px 0px'});
    videoObserver.observe(vibeVideo);
  }
}

/* ----------------------------
   Interactive custom cursor
----------------------------- */
if(matchMedia('(pointer:fine)').matches){
  const dot=$('.cursor-dot');
  const ring=$('.cursor-ring');
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  document.body.classList.add('cursor-ready');

  addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';
  },{passive:true});

  function animateCursor(){
    rx+=(mx-rx)*.16;ry+=(my-ry)*.16;
    ring.style.left=rx+'px';ring.style.top=ry+'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverables='a,button,input,select,textarea,.special-card,.menu-item,.favourite-card,[data-gallery]';
  document.addEventListener('mouseover',e=>{
    if(e.target.closest(hoverables)) ring.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout',e=>{
    if(e.target.closest(hoverables)) ring.classList.remove('cursor-hover');
  });
  addEventListener('mousedown',()=>ring.classList.add('cursor-press'));
  addEventListener('mouseup',()=>ring.classList.remove('cursor-press'));
}

addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    setMobileMenu(false);
    closeContent();
    closeMenu();
    closeBooking();
    lightbox.classList.remove('open');
  }
});


/* ----------------------------
   Scroll-triggered counters
----------------------------- */
const counterEls=$$('.counter');
let countersStarted=false;

function formatCounterValue(el,value){
  const suffix=el.dataset.suffix||'';
  return `${Math.floor(value)}${suffix}`;
}

function animateCounter(el){
  const target=Number(el.dataset.target||0);
  const duration=1600;
  const start=performance.now();

  function tick(now){
    const progress=Math.min((now-start)/duration,1);
    const eased=1-Math.pow(1-progress,3);
    const value=target*eased;
    el.textContent=formatCounterValue(el,value);
    if(progress<1){
      requestAnimationFrame(tick);
    }else{
      el.textContent=formatCounterValue(el,target);
    }
  }
  requestAnimationFrame(tick);
}

const statsSection=$('#statsCounters');
if(statsSection){
  const counterObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting && !countersStarted){
        countersStarted=true;
        counterEls.forEach((el,i)=>{
          setTimeout(()=>animateCounter(el),i*120);
        });
        counterObserver.disconnect();
      }
    });
  },{threshold:.45});
  counterObserver.observe(statsSection);
}


/* close mobile nav if viewport becomes desktop */
addEventListener('resize',()=>{
  if(innerWidth>980 && siteNav.classList.contains('mobile-open')){
    setMobileMenu(false);
  }
},{passive:true});
