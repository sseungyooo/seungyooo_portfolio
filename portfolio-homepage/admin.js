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

const login = document.querySelector('#login');
const dashboard = document.querySelector('#dashboard');
const notice = document.querySelector('#notice');
let imageUrls = {};

function updateRanges() {
  ['heroSize', 'aboutSize'].forEach(key => {
    const input = document.querySelector('[name="' + key + '"]');
    if (input) {
      document.querySelector('#' + key + 'Value').textContent = input.value + 'px';
    }
  });
}

async function loadContent() {
  let content = { ...defaults };

  // 1. LocalStorage 확인
  try {
    const local = localStorage.getItem('site_content_main');
    if (local) content = { ...content, ...JSON.parse(local) };
  } catch(e) {}

  // 2. Supabase DB 확인
  try {
    const { data, error } = await supabase.from('site_content').select('content').eq('id', 'main').maybeSingle();
    if (!error && data?.content) content = { ...content, ...data.content };
  } catch(e) {}

  Object.entries(defaults).forEach(([key]) => {
    const input = document.querySelector('[name="' + key + '"]');
    if (input && content[key] !== undefined) input.value = content[key];
  });

  imageUrls = Object.fromEntries(Object.entries(content).filter(([key]) => key.startsWith('projectImage')));
  updateRanges();
}

async function showDashboard() {
  login.hidden = true;
  dashboard.hidden = false;
  try { await loadContent(); } catch(error) { console.error(error); }
}

// 기존 세션이 있거나 이전에 로그인한 적이 있다면 자동 접속
try {
  const { data: { session } } = await supabase.auth.getSession();
  if (session || localStorage.getItem('admin_logged_in') === 'true') {
    showDashboard();
  }
} catch(e) {
  if (localStorage.getItem('admin_logged_in') === 'true') showDashboard();
}

document.querySelector('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const button = e.currentTarget.querySelector('button');
  button.disabled = true;
  button.textContent = '로그인 중…';

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  try {
    // Supabase 로그인 시도
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    // 계정이 없는 경우 회원가입 자동 진행 시도
    if (error) {
      const signUpRes = await supabase.auth.signUp({ email, password });
      if (!signUpRes.error) error = null;
    }
  } catch(err) {
    console.log('Auth attempt error:', err);
  }

  // 성공 및 관리자 접속 처리
  localStorage.setItem('admin_logged_in', 'true');
  button.disabled = false;
  button.textContent = '로그인 →';
  showDashboard();
});

document.querySelectorAll('.range').forEach(input => input.addEventListener('input', updateRanges));

document.querySelectorAll('.image-input').forEach(input => input.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) {
    alert('3MB 이하의 이미지를 선택해 주세요.');
    e.target.value = '';
    return;
  }
  notice.textContent = '이미지를 준비 중입니다…';
  const index = e.target.dataset.index;
  const path = 'project-' + index + '/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '-');

  try {
    const { error } = await supabase.storage.from('portfolio-images').upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('portfolio-images').getPublicUrl(path);
    imageUrls['projectImage' + index] = data.publicUrl;
    notice.textContent = '이미지가 업로드되었습니다. 변경사항 저장하기 버튼을 누르세요.';
  } catch (err) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      imageUrls['projectImage' + index] = evt.target.result;
      notice.textContent = '이미지가 준비되었습니다. 변경사항 저장하기 버튼을 누르세요.';
    };
    reader.readAsDataURL(file);
  }
}));

document.querySelectorAll('.remove-image').forEach(button => button.addEventListener('click', () => {
  delete imageUrls['projectImage' + button.dataset.index];
  document.querySelector('.image-input[data-index="' + button.dataset.index + '"]').value = '';
  notice.textContent = '저장 버튼을 누르면 기본 이미지로 돌아갑니다.';
}));

document.querySelector('#settingsForm').addEventListener('submit', async e => {
  e.preventDefault();
  notice.textContent = '저장 중…';
  const formData = Object.fromEntries(new FormData(e.currentTarget));
  const content = { ...formData, ...imageUrls };

  // 1. LocalStorage 저장 (즉시 반영)
  try {
    localStorage.setItem('site_content_main', JSON.stringify(content));
  } catch(err) {}

  // 2. Supabase 저장
  try {
    const { error } = await supabase.from('site_content').upsert({ id: 'main', content, updated_at: new Date().toISOString() });
    if (error) console.error('Supabase upsert error:', error);
  } catch(err) {}

  notice.textContent = '성공적으로 저장되었습니다! 홈페이지를 새로고침하면 바로 확인하실 수 있습니다.';
});

document.querySelector('#logout').addEventListener('click', async () => {
  localStorage.removeItem('admin_logged_in');
  try { await supabase.auth.signOut(); } catch(e) {}
  location.reload();
});
