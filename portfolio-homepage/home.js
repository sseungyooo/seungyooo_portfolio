import { supabase } from './supabase-config.js';

const defaults = {
  heroTitle: '작은 문제도 그냥 지나치지 않고\n개선 방안을 고민하고 실행합니다',
  heroIntro: 'I don’t overlook even small problems—\nI think about how to improve them and take action',
  aboutTitle: '사용자 관점에서 문제를 발견하고\n해결하는 역량을 쌓아왔습니다',
  aboutText: '서울을 기반으로 활동하며, 브랜드의 본질을 발견하고 사람들이 자연스럽게 머무는 경험을 설계합니다. 전략부터 최종 디테일까지 함께합니다',
  heroSize: '66', aboutSize: '48', heroBg: '#f2f0ea', contactBg: '#171714', email: 'sseungyooo@gmail.com',
  aboutKeywords: 'BRAND DESIGN, DIGITAL PRODUCT, ART DIRECTION', projectTitle0:'Ovoid / Wellness', projectDetail0:'Brand identity · 2025', projectTitle1:'Juun / Editorial', projectDetail1:'Art direction · 2025', projectTitle2:'Objects in form', projectDetail2:'Digital experience · 2024', projectTitle3:'Visual system', projectDetail3:'Brand experience · 2024', projectTitle4:'Archive edition', projectDetail4:'Editorial design · 2024', projectTitle5:'New object', projectDetail5:'Digital product · 2024'
};
const colors = ['#ccb9f8','#fd7e58','#172426','#c9e7d4','#f6dfc5','#b7c5ff'];

function render(content) {
  ['heroTitle','heroIntro','aboutTitle','aboutText'].forEach(key => {
    const el = document.querySelector(`#${key}`);
    if (el && content[key]) el.innerHTML = content[key].split('\n').join('<br>');
  });
  document.documentElement.style.setProperty('--hero-size', `${content.heroSize || 66}px`);
  document.documentElement.style.setProperty('--about-size', `${content.aboutSize || 48}px`);
  document.documentElement.style.setProperty('--hero-bg', content.heroBg || '#fefefe');
  document.documentElement.style.setProperty('--contact-bg', content.contactBg || '#171714');
  const hero = document.querySelector('.hero');
  const heroImage = document.querySelector('#heroImage');
  if (hero && heroImage) {
    if (content.heroImage) {
      heroImage.src = content.heroImage;
      heroImage.hidden = false;
      hero.style.removeProperty('background-image');
      hero.style.removeProperty('--hero-image');
      hero.classList.add('has-hero-image');
    } else {
      heroImage.removeAttribute('src');
      heroImage.hidden = true;
      hero.style.removeProperty('background-image');
      hero.style.removeProperty('--hero-image');
      hero.classList.remove('has-hero-image');
    }
  }
  const keywords = document.querySelector('#aboutKeywords');
  if (keywords && content.aboutKeywords) keywords.innerHTML = content.aboutKeywords.split(',').map(word => word.trim()).filter(Boolean).map(word => '<span>' + word.replace(/[&<>]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[char])) + '</span>').join('');
  const aboutImage = document.querySelector('#aboutImage');
  const aboutImageBox = document.querySelector('#aboutImageBox');
  if (aboutImage && aboutImageBox) {
    if (content.aboutImage) { aboutImage.src = content.aboutImage; aboutImage.hidden = false; aboutImageBox.classList.add('has-image'); }
    else { aboutImage.removeAttribute('src'); aboutImage.hidden = true; aboutImageBox.classList.remove('has-image'); }
  }
  const galleryTrack = document.querySelector('#aboutGalleryTrack');
  const galleryPrev = document.querySelector('#aboutGalleryPrev');
  const galleryNext = document.querySelector('#aboutGalleryNext');
  if (galleryTrack) {
    const galleryImages = Array.from({ length: 9 }, (_, index) => content['aboutGalleryImage' + index]).filter(Boolean);
    galleryTrack.innerHTML = galleryImages.map((src, index) => '<div class="about-gallery-item"><img src="' + src + '" alt="소개 이미지 ' + (index + 1) + '"></div>').join('');
    galleryTrack.parentElement.classList.toggle('has-images', galleryImages.length > 0);
    const canMove = galleryImages.length > 3;
    if (galleryPrev) galleryPrev.disabled = !canMove;
    if (galleryNext) galleryNext.disabled = !canMove;
    const moveGallery = direction => {
      if (!canMove || galleryTrack.dataset.moving === 'true') return;
      galleryTrack.dataset.moving = 'true';
      const finish = () => {
        galleryTrack.style.transition = 'none';
        if (direction > 0) galleryTrack.append(galleryTrack.firstElementChild);
        galleryTrack.classList.remove('is-shifting');
        void galleryTrack.offsetWidth;
        galleryTrack.style.removeProperty('transition');
        galleryTrack.dataset.moving = 'false';
      };
      if (direction < 0) {
        galleryTrack.style.transition = 'none';
        galleryTrack.prepend(galleryTrack.lastElementChild);
        galleryTrack.classList.add('is-shifting');
        void galleryTrack.offsetWidth;
        galleryTrack.style.removeProperty('transition');
        requestAnimationFrame(() => {
          galleryTrack.classList.remove('is-shifting');
          galleryTrack.addEventListener('transitionend', finish, { once: true });
        });
      } else {
        galleryTrack.classList.add('is-shifting');
        galleryTrack.addEventListener('transitionend', finish, { once: true });
      }
    };
    if (canMove && !galleryTrack.dataset.started) {
      galleryTrack.dataset.started = 'true';
      galleryPrev.addEventListener('click', () => moveGallery(-1));
      galleryNext.addEventListener('click', () => moveGallery(1));
      window.setInterval(() => moveGallery(1), 3000);
    }
  }
  const email = document.querySelector('#contactEmail');
  if (email && content.email) { email.href = `mailto:${content.email}`; email.innerHTML = `${content.email} <span>↗</span>`; }
  const grid = document.querySelector('#workGrid');
  grid.innerHTML = Array.from({length: 6}, (_, i) => {
    const image = content[`projectImage${i}`];
    const style = image ? `background:center / cover no-repeat url('${image}')` : `background:${colors[i]}`;
    return `<a class="project" href="project.html?project=${i}" aria-label="${content[`projectTitle${i}`] || '작업'}"><div class="project-art" style="${style}"><span>${String(i + 1).padStart(2,'0')}</span></div><div class="project-meta"><h2>${content[`projectTitle${i}`] || `Project ${i + 1}`}</h2><p>${content[`projectDetail${i}`] || ''}</p></div></a>`;
  }).join('');
}

render(defaults);
const { data } = await supabase.from('site_content').select('content').eq('id', 'main').maybeSingle();
if (data?.content) render({ ...defaults, ...data.content });

const homeGrid = document.querySelector('#workGrid');
homeGrid.addEventListener('wheel', event => {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  const maxScroll = homeGrid.scrollWidth - homeGrid.clientWidth;
  const isAtStart = homeGrid.scrollLeft <= 1 && event.deltaY < 0;
  const isAtEnd = homeGrid.scrollLeft >= maxScroll - 1 && event.deltaY > 0;
  if (isAtStart || isAtEnd) {
    event.preventDefault();
    window.scrollBy({ top: event.deltaY, behavior: 'smooth' });
    return;
  }
  event.preventDefault();
  homeGrid.scrollBy({ left: event.deltaY * 0.65, behavior: 'smooth' });
}, { passive: false });
