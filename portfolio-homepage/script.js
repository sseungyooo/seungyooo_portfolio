import { supabase } from './supabase-config.js';

const defaults = {
  heroTitle: '작은 문제도 그냥 지나치지 않고
    개선 방안을 고민하고 실행합니다',
  heroIntro: 'I don’t overlook even small problems—
    I think about how to improve them and take action',
  aboutTitle: '사용자 관점에서 문제를 발견하고
해결하는 역량을 쌓아왔습니다',
  aboutText: '서울을 기반으로 활동하며, 브랜드의 본질을 발견하고 사람들이 자연스럽게 머무는 경험을 설계합니다. 전략부터 최종 디테일까지 함께합니다.',
  heroSize: '66',
  aboutSize: '48',
  heroBg: '#fefefe',
  contactBg: '#171714',
  email: 'sseungyooo@gmail.com',
  projectTitle0: 'Ovoid / Wellness',
  projectDetail0: 'Brand identity · 2025',
  projectTitle1: 'Juun / Editorial',
  projectDetail1: 'Art direction · 2025',
  projectTitle2: 'Objects in form',
  projectDetail2: 'Digital experience · 2024',
  projectTitle3: 'Visual system',
  projectDetail3: 'Brand experience · 2024',
  projectTitle4: 'Archive edition',
  projectDetail4: 'Editorial design · 2024',
  projectTitle5: 'New object',
  projectDetail5: 'Digital product · 2024',
  projectDesc0: '웰니스 브랜드를 위한 통합 브랜드 아이덴티티 디렉션입니다.',
  projectDesc1: '패션 및 라이프스타일 에디토리얼을 위한 아트 디렉션 프로젝트입니다.',
  projectDesc2: '사물의 형태와 질감을 디지털 공간에서 탐구하는 인터랙티브 웹 경험 프로젝트입니다.'
};

let currentContent = { ...defaults };

async function fetchAndApplySupabaseData() {
  try {
    const { data, error } = await supabase.from('site_content').select('content').eq('id', 'main').maybeSingle();
    if (!error && data?.content) {
      currentContent = { ...defaults, ...data.content };
      applyContent(currentContent);
    }
  } catch (err) {
    console.log('Supabase fetch notice:', err);
  }
}

function applyContent(content) {
  [['heroTitle','heroTitle'],['heroIntro','heroIntro'],['aboutTitle','aboutTitle'],['aboutText','aboutText']].forEach(([key,id]) => {
    const el = document.querySelector('#' + id);
    if (content[key] && el) {
      el.innerHTML = content[key].replaceAll('
','<br>');
    }
  });
  const mail = document.querySelector('#contactEmail');
  if (mail && content.email) {
    mail.href = 'mailto:' + content.email;
    mail.innerHTML = content.email + ' <span>&nearr;</span>';
  }
  if (content.heroSize) document.documentElement.style.setProperty('--hero-size', content.heroSize + 'px'); const h1 = document.querySelector('#heroTitle'); if (h1) h1.style.fontSize = content.heroSize + 'px'; const h2 = document.querySelector('#aboutTitle'); if (h2) h2.style.fontSize = content.aboutSize + 'px';
  if (content.aboutSize) document.documentElement.style.setProperty('--about-size', content.aboutSize + 'px');
  if (content.heroBg) document.documentElement.style.setProperty('--hero-bg', content.heroBg);
  if (content.contactBg) document.documentElement.style.setProperty('--contact-bg', content.contactBg);

  renderProjects(content);
}

function renderProjects(content) {
  const grid = document.querySelector('#workGrid');
  if (!grid) return;
  const colors = ['#ccb9f8', '#fd7e58', '#172426', '#c9e7d4', '#f6dfc5', '#b7c5ff'];
  grid.innerHTML = Array.from({ length: 6 }, (_, i) => {
    const image = content['projectImage' + i];
    const title = content['projectTitle' + i] || `Project ${String(i + 1).padStart(2, '0')}`;
    const detail = content['projectDetail' + i] || '';
    const artStyle = image ? `style="background:center / cover no-repeat url('${image}')"` : `style="background:${colors[i]}"`;
    return `<article class="project" data-project-index="${i}"><div class="project-art" ${artStyle}><span>${String(i + 1).padStart(2, '0')}</span></div><div class="project-meta"><h2>${title}</h2><p>${detail}</p></div></article>`;
  }).join('');
}

function initScript() {
  applyContent(defaults);
  fetchAndApplySupabaseData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScript);
} else {
  initScript();
}

function openModal(index) {
  const detailModal = document.querySelector('#detailModal');
  if (!detailModal) return;

  const title = currentContent['projectTitle' + index] || '프로젝트';
  const detail = currentContent['projectDetail' + index] || '';
  const desc = currentContent['projectDesc' + index] || '상세 설명이 준비되어 있습니다.';
  const image = currentContent['projectImage' + index];

  const modalTitle = document.querySelector('#modalTitle');
  const modalDetail = document.querySelector('#modalDetail');
  const modalDesc = document.querySelector('#modalDesc');
  const modalArt = document.querySelector('#modalArt');

  if (modalTitle) modalTitle.textContent = title;
  if (modalDetail) modalDetail.textContent = detail;
  if (modalDesc) modalDesc.innerHTML = desc.replaceAll('
', '<br>');

  if (modalArt) {
    if (image) {
      modalArt.style.background = 'center / cover no-repeat url(' + image + ')';
      modalArt.style.height = '300px';
    } else {
      const bgColors = ['#ccb9f8', '#fd7e58', '#172426'];
      modalArt.style.background = bgColors[index % 3];
      modalArt.style.height = '200px';
    }
  }

  if (typeof detailModal.showModal === 'function') {
    detailModal.showModal();
  } else {
    detailModal.setAttribute('open', 'true');
  }
}

document.addEventListener('click', (e) => {
  if (e.target.closest('#closeDetail')) {
    const detailModal = document.querySelector('#detailModal');
    if (detailModal) detailModal.close();
    return;
  }

  const detailModal = document.querySelector('#detailModal');
  if (detailModal && e.target === detailModal) {
    detailModal.close();
    return;
  }

  const projectCard = e.target.closest('.project');
  if (projectCard) {
    const allProjects = Array.from(document.querySelectorAll('.project'));
    const index = allProjects.indexOf(projectCard);
    if (index !== -1) {
      openModal(index);
    }
  }
});
