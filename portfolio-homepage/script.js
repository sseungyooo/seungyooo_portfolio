import { supabase } from './supabase-config.js';

const defaults = { heroTitle:'관찰하고,\n더 나은 경험을\n만듭니다.', heroIntro:'디지털 제품과 브랜드에\n명료한 방향을 더하는 디자이너입니다.', aboutTitle:'생각의 빈틈을\n형태로 채웁니다.', aboutText:'서울을 기반으로 활동하며, 브랜드의 본질을 발견하고 사람들이 자연스럽게 머무는 경험을 설계합니다.', heroSize:'100', aboutSize:'62', heroBg:'#f2f0ea', contactBg:'#171714', email:'hello@example.com', projectTitle0:'Ovoid / Wellness', projectDetail0:'Brand identity · 2025', projectTitle1:'Juun / Editorial', projectDetail1:'Art direction · 2025', projectTitle2:'Objects in form', projectDetail2:'Digital experience · 2024' };
applyContent(defaults);
const { data, error } = await supabase.from('site_content').select('content').eq('id', 'main').maybeSingle();
if (!error && data?.content) applyContent({ ...defaults, ...data.content });

function applyContent(content) {
  [['heroTitle','heroTitle'],['heroIntro','heroIntro'],['aboutTitle','aboutTitle'],['aboutText','aboutText']].forEach(([key,id]) => {
    if (content[key]) document.querySelector('#' + id).innerHTML = content[key].replaceAll('\n','<br>');
  });
  const mail = document.querySelector('#contactEmail'); mail.href = 'mailto:' + content.email; mail.innerHTML = `${content.email} <span>↗</span>`;
  document.documentElement.style.setProperty('--hero-size', content.heroSize + 'px');
  document.documentElement.style.setProperty('--about-size', content.aboutSize + 'px');
  document.documentElement.style.setProperty('--hero-bg', content.heroBg);
  document.documentElement.style.setProperty('--contact-bg', content.contactBg);
  for (let i = 0; i < 3; i++) { const art = document.querySelector('#projectArt' + i); document.querySelector('#projectTitle' + i).textContent = content['projectTitle' + i]; document.querySelector('#projectDetail' + i).textContent = content['projectDetail' + i]; if (content['projectImage' + i]) { art.style.background = `center / cover no-repeat url(${content['projectImage' + i]})`; art.querySelectorAll('.shape, span').forEach(node => node.style.display = 'none'); } }
}
