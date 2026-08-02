import { supabase } from './supabase-config.js';

const defaults = {
  heroTitle: '작은 문제도 그냥 지나치지 않고\n개선 방안을 고민하고 실행합니다.',
  heroIntro: '디지털 제품과 브랜드에\n명료한 방향을 더하는 디자이너입니다.',
  aboutTitle: '사용자 관점에서 문제를 발견하고\n해결하는 역량을 쌓아왔습니다.',
  aboutText: '서울을 기반으로 활동하며, 브랜드의 본질을 발견하고 사람들이 자연스럽게 머무는 경험을 설계합니다. 전략부터 최종 디테일까지 함께합니다.',
  heroSize: '66', aboutSize: '48', heroBg: '#f2f0ea', contactBg: '#171714', email: 'sseungyooo@gmail.com',
  projectTitle0:'Ovoid / Wellness', projectDetail0:'Brand identity · 2025', projectTitle1:'Juun / Editorial', projectDetail1:'Art direction · 2025', projectTitle2:'Objects in form', projectDetail2:'Digital experience · 2024', projectTitle3:'Visual system', projectDetail3:'Brand experience · 2024', projectTitle4:'Archive edition', projectDetail4:'Editorial design · 2024', projectTitle5:'New object', projectDetail5:'Digital product · 2024'
};
const colors = ['#ccb9f8','#fd7e58','#172426','#c9e7d4','#f6dfc5','#b7c5ff'];

function render(content) {
  ['heroTitle','heroIntro','aboutTitle','aboutText'].forEach(key => {
    const el = document.querySelector(`#${key}`);
    if (el && content[key]) el.innerHTML = content[key].split('\n').join('<br>');
  });
  document.documentElement.style.setProperty('--hero-size', `${content.heroSize || 66}px`);
  document.documentElement.style.setProperty('--about-size', `${content.aboutSize || 48}px`);
  document.documentElement.style.setProperty('--hero-bg', content.heroBg || '#f2f0ea');
  document.documentElement.style.setProperty('--contact-bg', content.contactBg || '#171714');
  const email = document.querySelector('#contactEmail');
  if (email && content.email) { email.href = `mailto:${content.email}`; email.innerHTML = `${content.email} <span>↗</span>`; }
  const grid = document.querySelector('#workGrid');
  grid.innerHTML = Array.from({length: 6}, (_, i) => {
    const image = content[`projectImage${i}`];
    const style = image ? `background:center / cover no-repeat url('${image}')` : `background:${colors[i]}`;
    return `<a class="project" href="works.html" aria-label="${content[`projectTitle${i}`] || '작업'}"><div class="project-art" style="${style}"><span>${String(i + 1).padStart(2,'0')}</span></div><div class="project-meta"><h2>${content[`projectTitle${i}`] || `Project ${i + 1}`}</h2><p>${content[`projectDetail${i}`] || ''}</p></div></a>`;
  }).join('');
}

render(defaults);
const { data } = await supabase.from('site_content').select('content').eq('id', 'main').maybeSingle();
if (data?.content) render({ ...defaults, ...data.content });
