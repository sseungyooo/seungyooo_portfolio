import { supabase } from './supabase-config.js';

const defaults = {
  heroTitle: '관찰하고,
더 나은 경험을
만듭니다.',
  heroIntro: '디지털 제품과 브랜드에
명료한 방향을 더하는 디자이너입니다.',
  aboutTitle: '생각의 빈틈을
형태로 채웁니다.',
  aboutText: '서울을 기반으로 활동하며, 브랜드의 본질을 발견하고 사람들이 자연스럽게 머무는 경험을 설계합니다.',
  heroSize: '100',
  aboutSize: '62',
  heroBg: '#f2f0ea',
  contactBg: '#171714',
  email: 'hello@example.com',
  projectTitle0: 'Ovoid / Wellness',
  projectDetail0: 'Brand identity · 2025',
  projectDesc0: '웰니스 브랜드를 위한 통합 브랜드 아이덴티티 디렉션입니다.

브랜드의 핵심 가치를 시각적으로 재해석하고 사용자가 경험하는 모든 터치포인트에서 일관된 감성을 전달하도록 설계되었습니다.',
  projectTitle1: 'Juun / Editorial',
  projectDetail1: 'Art direction · 2025',
  projectDesc1: '패션 및 라이프스타일 에디토리얼을 위한 아트 디렉션 프로젝트입니다.

과감한 타이포그래피 배치와 감각적인 비주얼 레이아웃을 통해 브랜드 고유의 서사를 스타일리시하게 구현했습니다.',
  projectTitle2: 'Objects in form',
  projectDetail2: 'Digital experience · 2024',
  projectDesc2: '사물의 형태와 질감을 디지털 공간에서 탐구하는 인터랙티브 웹 경험 프로젝트입니다.

3D 오브젝트와 감성적인 마이크로 인터랙션을 결합하여 오랫동안 머무르고 싶은 시각적 스토리를 선사합니다.'
};

let currentContent = { ...defaults };

applyContent(defaults);

const { data, error } = await supabase.from('site_content').select('content').eq('id', 'main').maybeSingle();
if (!error && data?.content) {
  currentContent = { ...defaults, ...data.content };
  applyContent(currentContent);
}

function applyContent(content) {
  [['heroTitle','heroTitle'],['heroIntro','heroIntro'],['aboutTitle','aboutTitle'],['aboutText','aboutText']].forEach(([key,id]) => {
    if (content[key]) document.querySelector('#' + id).innerHTML = content[key].replaceAll('
','<br>');
  });
  const mail = document.querySelector('#contactEmail');
  if (mail) {
    mail.href = 'mailto:' + content.email;
    mail.innerHTML = content.email + ' <span>&nearr;</span>';
  }
  document.documentElement.style.setProperty('--hero-size', content.heroSize + 'px');
  document.documentElement.style.setProperty('--about-size', content.aboutSize + 'px');
  document.documentElement.style.setProperty('--hero-bg', content.heroBg);
  document.documentElement.style.setProperty('--contact-bg', content.contactBg);
  
  for (let i = 0; i < 3; i++) {
    const art = document.querySelector('#projectArt' + i);
    if (art) {
      document.querySelector('#projectTitle' + i).textContent = content['projectTitle' + i];
      document.querySelector('#projectDetail' + i).textContent = content['projectDetail' + i];
      if (content['projectImage' + i]) {
        art.style.background = 'center / cover no-repeat url(' + content['projectImage' + i] + ')';
        art.querySelectorAll('.shape, span').forEach(node => node.style.display = 'none');
      }
    }
  }
}

const detailModal = document.querySelector('#detailModal');
const closeDetail = document.querySelector('#closeDetail');

if (detailModal && closeDetail) {
  closeDetail.addEventListener('click', () => detailModal.close());
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) detailModal.close();
  });

  document.querySelectorAll('.project').forEach((article, index) => {
    article.addEventListener('click', () => {
      const title = currentContent['projectTitle' + index] || '프로젝트';
      const detail = currentContent['projectDetail' + index] || '';
      const desc = currentContent['projectDesc' + index] || '상세 설명이 준비되어 있습니다.';
      const image = currentContent['projectImage' + index];

      document.querySelector('#modalTitle').textContent = title;
      document.querySelector('#modalDetail').textContent = detail;
      document.querySelector('#modalDesc').innerHTML = desc.replaceAll('
', '<br>');

      const modalArt = document.querySelector('#modalArt');
      if (image) {
        modalArt.style.background = 'center / cover no-repeat url(' + image + ')';
      } else {
        const bgColors = ['#ccb9f8', '#fd7e58', '#172426'];
        modalArt.style.background = bgColors[index % 3];
      }

      detailModal.showModal();
    });
  });
}
