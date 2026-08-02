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
  projectTitle1: 'Juun / Editorial',
  projectDetail1: 'Art direction · 2025',
  projectTitle2: 'Objects in form',
  projectDetail2: 'Digital experience · 2024',
  projectDesc0: '웰니스 브랜드를 위한 통합 브랜드 아이덴티티 디렉션입니다.',
  projectDesc1: '패션 및 라이프스타일 에디토리얼을 위한 아트 디렉션 프로젝트입니다.',
  projectDesc2: '사물의 형태와 질감을 디지털 공간에서 탐구하는 인터랙티브 웹 경험 프로젝트입니다.'
};

let imageUrls = {};

function updateRanges() {
  ['heroSize', 'aboutSize'].forEach(key => {
    const input = document.querySelector('[name="' + key + '"]');
    const valEl = document.querySelector('#' + key + 'Value');
    if (input && valEl) valEl.textContent = input.value + 'px';
  });
}

async function loadContent() {
  let content = { ...defaults };
  try {
    const { data, error } = await supabase.from('site_content').select('content').eq('id', 'main').single();
    if (!error && data?.content) content = { ...content, ...data.content };
  } catch (e) {
    console.error('loadContent error:', e);
  }

  Object.entries(defaults).forEach(([key]) => {
    const input = document.querySelector('[name="' + key + '"]');
    if (input && content[key] !== undefined) input.value = content[key];
  });

  imageUrls = Object.fromEntries(Object.entries(content).filter(([key]) => key.startsWith('projectImage')));
  updateRanges();
}

function showDashboard() {
  const login = document.querySelector('#login');
  const dashboard = document.querySelector('#dashboard');
  if (login) login.hidden = true;
  if (dashboard) dashboard.hidden = false;
  loadContent();
}

function initAdmin() {
  const loginForm = document.querySelector('#loginForm');
  if (loginForm && !loginForm.dataset.bound) {
    loginForm.dataset.bound = 'true';
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const button = loginForm.querySelector('button');
      if (button) {
        button.disabled = true;
        button.textContent = '로그인 중…';
      }

      const emailInput = document.querySelector('#email');
      const passwordInput = document.querySelector('#password');
      const email = emailInput ? emailInput.value : '';
      const password = passwordInput ? passwordInput.value : '';

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          alert('이메일 또는 비밀번호를 확인해 주세요. 오류 내용: ' + error.message);
        } else {
          showDashboard();
        }
      } catch (err) {
        alert('로그인 시도 중 오류가 발생했습니다: ' + err.message);
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = '로그인 →';
        }
      }
    });
  }

  try {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) showDashboard();
    }).catch(() => {});
  } catch(e) {}

  const rangeInputs = document.querySelectorAll('.range');
  rangeInputs.forEach(input => input.addEventListener('input', updateRanges));

  const imageInputs = document.querySelectorAll('.image-input');
  imageInputs.forEach(input => input.addEventListener('change', async e => {
    const file = e.target.files[0];
    const notice = document.querySelector('#notice');
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('3MB 이하의 이미지를 선택해 주세요.');
      e.target.value = '';
      return;
    }
    if (notice) notice.textContent = '이미지를 업로드 중입니다…';
    const index = e.target.dataset.index;
    const path = 'project-' + index + '/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '-');

    try {
      const { error } = await supabase.storage.from('portfolio-images').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(path);
      imageUrls['projectImage' + index] = data.publicUrl;
      if (notice) notice.textContent = '이미지가 성공적으로 업로드되었습니다. 저장 버튼을 누르세요.';
    } catch (err) {
      if (notice) notice.textContent = '이미지 업로드 오류: ' + err.message;
    }
  }));

  const removeButtons = document.querySelectorAll('.remove-image');
  removeButtons.forEach(button => button.addEventListener('click', () => {
    delete imageUrls['projectImage' + button.dataset.index];
    const imgInput = document.querySelector('.image-input[data-index="' + button.dataset.index + '"]');
    if (imgInput) imgInput.value = '';
    const notice = document.querySelector('#notice');
    if (notice) notice.textContent = '저장 버튼을 누르면 기본 이미지로 돌아갑니다.';
  }));

  const settingsForm = document.querySelector('#settingsForm');
  if (settingsForm && !settingsForm.dataset.bound) {
    settingsForm.dataset.bound = 'true';
    settingsForm.addEventListener('submit', async e => {
      e.preventDefault();
      const notice = document.querySelector('#notice');
      if (notice) notice.textContent = '저장 중…';
      const content = { ...Object.fromEntries(new FormData(e.currentTarget)), ...imageUrls };

      try {
        const { error } = await supabase.from('site_content').upsert({ id: 'main', content, updated_at: new Date().toISOString() });
        if (notice) {
          notice.textContent = error ? '저장에 실패했습니다: ' + error.message : '저장되었습니다. 홈페이지를 새로고침해 확인하세요.';
        }
      } catch (err) {
        if (notice) notice.textContent = '저장 실패: ' + err.message;
      }
    });
  }

  const logoutBtn = document.querySelector('#logout');
  if (logoutBtn && !logoutBtn.dataset.bound) {
    logoutBtn.dataset.bound = 'true';
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      location.reload();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
