import { supabase } from './supabase-config.js';

const defaults = {
  heroTitle: '관찰하고,\n더 나은 경험을\n만듭니다.',
  heroIntro:
    '디지털 제품과 브랜드에\n명료한 방향을 더하는 디자이너입니다.',
  aboutTitle: '생각의 빈틈을\n형태로 채웁니다.',
  aboutText:
    '서울을 기반으로 활동하며, 브랜드의 본질을 발견하고 사람들이 자연스럽게 머무는 경험을 설계합니다.',
  aboutKeywords:
    'BRAND DESIGN, DIGITAL PRODUCT, ART DIRECTION',
  heroSize: '100',
  aboutSize: '62',
  heroBg: '#f2f0ea',
  contactBg: '#171714',
  email: 'hello@example.com',

  projectTitle0: 'Ovoid / Wellness',
  projectDetail0: 'Brand identity · 2025',
  projectDesc0:
    '웰니스 브랜드를 위한 통합 브랜드 아이덴티티 프로젝트입니다.',

  projectTitle1: 'Juun / Editorial',
  projectDetail1: 'Art direction · 2025',
  projectDesc1:
    '패션과 라이프스타일을 위한 에디토리얼 아트 디렉션입니다.',

  projectTitle2: 'Objects in form',
  projectDetail2: 'Digital experience · 2024',
  projectDesc2:
    '사물의 형태와 질감을 탐구한 디지털 경험 프로젝트입니다.',

  projectTitle3: 'Visual system',
  projectDetail3: 'Brand experience · 2024',
  projectDesc3:
    '브랜드의 시각 시스템을 설계한 프로젝트입니다.',

  projectTitle4: 'Archive edition',
  projectDetail4: 'Editorial design · 2024',
  projectDesc4:
    '아카이브를 새로운 편집 방식으로 구성했습니다.',

  projectTitle5: 'New object',
  projectDetail5: 'Digital product · 2024',
  projectDesc5:
    '새로운 디지털 제품 경험을 담은 프로젝트입니다.'
};

const login = document.querySelector('#login');
const dashboard = document.querySelector('#dashboard');
const notice = document.querySelector('#notice');

let imageUrls = {};

/* 이미지 파일명 정리 */
function createSafeFileName(fileName) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');

  return (
    nameWithoutExtension
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'image'
  );
}

/* 파일 용량 표시 */
function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0KB';
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/* 이미지 자동 축소 및 WebP 압축 */
async function compressImage(
  file,
  maxSize = 1600,
  quality = 0.8
) {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다.');
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      let width = image.naturalWidth;
      let height = image.naturalHeight;

      if (!width || !height) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('이미지 크기를 확인할 수 없습니다.'));
        return;
      }

      if (width > maxSize || height > maxSize) {
        const scale = Math.min(
          maxSize / width,
          maxSize / height
        );

        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(
          new Error('이미지 압축 기능을 사용할 수 없습니다.')
        );
        return;
      }

      /*
       * 이미지 축소 시 품질을 높이기 위한 설정입니다.
       */
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        blob => {
          URL.revokeObjectURL(objectUrl);

          if (!blob) {
            reject(new Error('이미지 압축에 실패했습니다.'));
            return;
          }

          const safeName = createSafeFileName(file.name);

          const compressedFile = new File(
            [blob],
            `${safeName}.webp`,
            {
              type: 'image/webp',
              lastModified: Date.now()
            }
          );

          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(
        new Error('선택한 이미지를 불러올 수 없습니다.')
      );
    };

    image.src = objectUrl;
  });
}

/* 압축 후 Supabase Storage 업로드 */
async function uploadCompressedImage(
  originalFile,
  folder,
  options = {}
) {
  const {
    maxSize = 1600,
    quality = 0.8
  } = options;

  const compressedFile = await compressImage(
    originalFile,
    maxSize,
    quality
  );

  const path =
    `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}-${compressedFile.name}`;

  const { error } = await supabase.storage
    .from('portfolio-images')
    .upload(path, compressedFile, {
      upsert: false,
      contentType: 'image/webp',
      cacheControl: '3600'
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error('업로드된 이미지 주소를 생성하지 못했습니다.');
  }

  return {
    publicUrl: data.publicUrl,
    originalSize: originalFile.size,
    compressedSize: compressedFile.size
  };
}


/* 포트폴리오 원본 이미지 업로드 */
async function uploadOriginalImage(originalFile, folder) {
  if (!originalFile.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다.');
  }
  const safeName = createSafeFileName(originalFile.name);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { error } = await supabase.storage
    .from('portfolio-images')
    .upload(path, originalFile, {
      upsert: false,
      contentType: originalFile.type,
      cacheControl: '3600'
    });
  if (error) throw error;
  const { data } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('업로드된 이미지 주소를 생성하지 못했습니다.');
  }
  return {
    publicUrl: data.publicUrl,
    originalSize: originalFile.size,
    compressedSize: originalFile.size
  };
}

async function uploadOriginalImages(files, folder) {
  const results = [];
  for (let index = 0; index < files.length; index += 1) {
    notice.textContent = `${files.length}장 중 ${index + 1}번째 원본 이미지를 업로드하고 있습니다…`;
    results.push(await uploadOriginalImage(files[index], folder));
  }
  return results;
}

/* 여러 이미지 압축 및 업로드 */
async function uploadMultipleImages(
  files,
  folder,
  options = {}
) {
  const results = [];

  /*
   * 한꺼번에 너무 많은 이미지 압축이 실행되지 않도록
   * 순서대로 처리합니다.
   */
  for (let index = 0; index < files.length; index += 1) {
    notice.textContent =
      `${files.length}장 중 ${index + 1}번째 이미지를 압축하고 있습니다…`;

    const result = await uploadCompressedImage(
      files[index],
      folder,
      options
    );

    results.push(result);
  }

  return results;
}

/* 폰트 크기 슬라이더 표시 */
function updateRanges() {
  ['heroSize', 'aboutSize'].forEach(key => {
    const input = document.querySelector(
      `[name="${key}"]`
    );

    const output = document.querySelector(
      `#${key}Value`
    );

    if (input && output) {
      output.textContent = `${input.value}px`;
    }
  });
}

/* 저장된 콘텐츠 불러오기 */
async function loadContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('id', 'main')
    .maybeSingle();

  if (error) {
    throw error;
  }

  const content = {
    ...defaults,
    ...(data?.content || {})
  };

  Object.keys(defaults).forEach(key => {
    const input = document.querySelector(
      `[name="${key}"]`
    );

    if (input && content[key] !== undefined) {
      input.value = content[key];
    }
  });

  imageUrls = Object.fromEntries(
    Object.entries(content).filter(([key]) => {
      return (
        key.startsWith('projectImage') ||
        key.startsWith('projectGallery') ||
        key.startsWith('aboutGalleryImage') ||
        key === 'heroImage' ||
        key === 'aboutImage'
      );
    })
  );

  updateRanges();
}

/* 관리자 화면 표시 */
async function showDashboard() {
  if (login) {
    login.hidden = true;
  }

  if (dashboard) {
    dashboard.hidden = false;
  }

  try {
    await loadContent();
  } catch (error) {
    notice.textContent =
      '데이터를 불러올 수 없습니다. 설정 SQL을 실행했는지 확인하세요.';

    console.error(error);
  }
}

/* 로그인 상태 확인 */
const {
  data: { session }
} = await supabase.auth.getSession();

if (session) {
  showDashboard();
}

/* 로그인 */
document
  .querySelector('#loginForm')
  ?.addEventListener('submit', async event => {
    event.preventDefault();

    const button =
      event.currentTarget.querySelector('button');

    if (button) {
      button.disabled = true;
      button.textContent = '로그인 중…';
    }

    const email =
      document.querySelector('#email')?.value || '';

    const password =
      document.querySelector('#password')?.value || '';

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (button) {
      button.disabled = false;
      button.textContent = '로그인 →';
    }

    if (error) {
      alert('이메일 또는 비밀번호를 확인해 주세요.');
      return;
    }

    showDashboard();
  });

/* 슬라이더 */
document.querySelectorAll('.range').forEach(input => {
  input.addEventListener('input', updateRanges);
});

/* 프로젝트 썸네일 업로드 */
document
  .querySelectorAll('.image-input')
  .forEach(input => {
    input.addEventListener('change', async event => {
      const originalFile = event.target.files?.[0];

      if (!originalFile) {
        return;
      }

      const index = event.target.dataset.index;

      try {
        notice.textContent =
          '프로젝트 썸네일 원본을 업로드하고 있습니다…';

        const result = await uploadOriginalImage(
          originalFile,
          `project-${index}`
        );

        imageUrls[`projectImage${index}`] =
          result.publicUrl;

        notice.textContent =
          `프로젝트 썸네일이 업로드되었습니다. ` +
          `${formatFileSize(result.originalSize)} → ` +
          `${formatFileSize(result.compressedSize)}로 압축되었습니다. ` +
          `변경사항 저장하기를 눌러 반영하세요.`;
      } catch (error) {
        console.error(error);

        notice.textContent =
          '프로젝트 썸네일 업로드에 실패했습니다.';

        event.target.value = '';
      }
    });
  });

/* 메인 이미지 업로드 */
document
  .querySelector('#heroImageInput')
  ?.addEventListener('change', async event => {
    const originalFile = event.target.files?.[0];

    if (!originalFile) {
      return;
    }

    try {
      notice.textContent =
        '메인 이미지를 압축하고 있습니다…';

      const result = await uploadCompressedImage(
        originalFile,
        'hero'
      );

      imageUrls.heroImage = result.publicUrl;

      const { data: existing, error: loadError } =
        await supabase
          .from('site_content')
          .select('content')
          .eq('id', 'main')
          .maybeSingle();

      if (loadError) {
        throw loadError;
      }

      const settingsForm =
        document.querySelector('#settingsForm');

      const formValues = settingsForm
        ? Object.fromEntries(new FormData(settingsForm))
        : {};

      const content = {
        ...defaults,
        ...(existing?.content || {}),
        ...formValues,
        ...imageUrls
      };

      const { error: saveError } = await supabase
        .from('site_content')
        .upsert({
          id: 'main',
          content,
          updated_at: new Date().toISOString()
        });

      if (saveError) {
        throw saveError;
      }

      notice.textContent =
        `메인 이미지가 저장되었습니다. ` +
        `${formatFileSize(result.originalSize)} → ` +
        `${formatFileSize(result.compressedSize)}로 압축되었습니다.`;
    } catch (error) {
      console.error(error);

      notice.textContent =
        '메인 이미지 업로드 또는 저장에 실패했습니다.';

      event.target.value = '';
    }
  });

/* 소개 대표 이미지 업로드 */
document
  .querySelector('#aboutImageInput')
  ?.addEventListener('change', async event => {
    const originalFile = event.target.files?.[0];

    if (!originalFile) {
      return;
    }

    try {
      notice.textContent =
        '소개 이미지를 압축하고 있습니다…';

      const result = await uploadCompressedImage(
        originalFile,
        'about'
      );

      imageUrls.aboutImage = result.publicUrl;

      notice.textContent =
        `소개 이미지가 업로드되었습니다. ` +
        `${formatFileSize(result.originalSize)} → ` +
        `${formatFileSize(result.compressedSize)}로 압축되었습니다. ` +
        `변경사항 저장하기를 눌러 반영하세요.`;
    } catch (error) {
      console.error(error);

      notice.textContent =
        '소개 이미지 업로드에 실패했습니다.';

      event.target.value = '';
    }
  });

/* 소개 갤러리 이미지 업로드 */
document
  .querySelectorAll('.about-gallery-input')
  .forEach(input => {
    input.addEventListener('change', async event => {
      const originalFile = event.target.files?.[0];

      if (!originalFile) {
        return;
      }

      const index = event.target.dataset.index;

      try {
        notice.textContent =
          '슬라이드 이미지를 압축하고 있습니다…';

        const result = await uploadCompressedImage(
          originalFile,
          `about-gallery/${index}`
        );

        imageUrls[`aboutGalleryImage${index}`] =
          result.publicUrl;

        notice.textContent =
          `슬라이드 이미지가 업로드되었습니다. ` +
          `${formatFileSize(result.originalSize)} → ` +
          `${formatFileSize(result.compressedSize)}로 압축되었습니다. ` +
          `변경사항 저장하기를 눌러 반영하세요.`;
      } catch (error) {
        console.error(error);

        notice.textContent =
          '슬라이드 이미지 업로드에 실패했습니다.';

        event.target.value = '';
      }
    });
  });

/* 소개 대표 이미지 제거 */
document
  .querySelector('#removeAboutImage')
  ?.addEventListener('click', () => {
    delete imageUrls.aboutImage;

    const input =
      document.querySelector('#aboutImageInput');

    if (input) {
      input.value = '';
    }

    notice.textContent =
      '변경사항 저장하기를 누르면 소개 이미지가 제거됩니다.';
  });

/* 메인 이미지 제거 */
document
  .querySelector('#removeHeroImage')
  ?.addEventListener('click', () => {
    delete imageUrls.heroImage;

    const input =
      document.querySelector('#heroImageInput');

    if (input) {
      input.value = '';
    }

    notice.textContent =
      '변경사항 저장하기를 누르면 메인 이미지가 제거됩니다.';
  });

/* 프로젝트 썸네일 제거 */
document
  .querySelectorAll('.remove-project-image')
  .forEach(button => {
    button.addEventListener('click', () => {
      const index = button.dataset.index;

      delete imageUrls[`projectImage${index}`];

      const input = document.querySelector(
        `.image-input[data-index="${index}"]`
      );

      if (input) {
        input.value = '';
      }

      notice.textContent =
        '변경사항 저장하기를 누르면 기본 이미지로 돌아갑니다.';
    });
  });

/* 소개 갤러리 이미지 제거 */
document
  .querySelectorAll('.remove-about-gallery-image')
  .forEach(button => {
    button.addEventListener('click', () => {
      const index = button.dataset.index;

      delete imageUrls[
        `aboutGalleryImage${index}`
      ];

      const input = document.querySelector(
        `.about-gallery-input[data-index="${index}"]`
      );

      if (input) {
        input.value = '';
      }

      notice.textContent =
        '변경사항 저장하기를 누르면 슬라이드 이미지가 제거됩니다.';
    });
  });

/* 상세페이지 이미지 입력 영역 생성 */
const projectDetailManager =
  document.querySelector('.projects');

projectDetailManager
  ?.querySelectorAll('fieldset')
  .forEach((fieldset, index) => {
    if (fieldset.querySelector('.project-gallery-input')) {
      return;
    }

    const label = document.createElement('label');

    label.innerHTML = `
      상세 페이지 이미지
      <small>
        여러 장을 선택할 수 있습니다. 큰 이미지는 자동 압축됩니다.
      </small>
      <input
        class="project-gallery-input"
        data-index="${index}"
        type="file"
        accept="image/*"
        multiple
      >
    `;

    const removeButton =
      document.createElement('button');

    removeButton.className =
      'remove-project-gallery';

    removeButton.dataset.index = index;
    removeButton.type = 'button';
    removeButton.textContent =
      '상세 이미지 전체 제거';

    fieldset.append(label, removeButton);
  });

/* 상세페이지 여러 이미지 업로드 */
projectDetailManager?.addEventListener(
  'change',
  async event => {
    const input = event.target;

    if (
      !(input instanceof HTMLInputElement) ||
      !input.matches('.project-gallery-input')
    ) {
      return;
    }

    const files = Array.from(input.files || []);

    if (!files.length) {
      return;
    }

    const index = input.dataset.index;

    try {
      const results = await uploadOriginalImages(
        files,
        `project-gallery/${index}`
      );

      const uploadedUrls = results.map(
        result => result.publicUrl
      );

      const previousImages =
        Array.isArray(
          imageUrls[`projectGallery${index}`]
        )
          ? imageUrls[`projectGallery${index}`]
          : [];

      imageUrls[`projectGallery${index}`] = [
        ...previousImages,
        ...uploadedUrls
      ];

      const originalTotalSize = results.reduce(
        (sum, result) => sum + result.originalSize,
        0
      );

      const compressedTotalSize = results.reduce(
        (sum, result) => sum + result.compressedSize,
        0
      );

      notice.textContent =
        `${results.length}장의 상세 이미지가 업로드되었습니다. ` +
        `${formatFileSize(originalTotalSize)} → ` +
        `${formatFileSize(compressedTotalSize)}로 압축되었습니다. ` +
        `변경사항 저장하기를 눌러 반영하세요.`;
    } catch (error) {
      console.error(error);

      notice.textContent =
        '상세 이미지 업로드에 실패했습니다.';

      input.value = '';
    }
  }
);

/* 상세페이지 이미지 전체 제거 */
projectDetailManager?.addEventListener(
  'click',
  event => {
    const button = event.target.closest(
      '.remove-project-gallery'
    );

    if (!button) {
      return;
    }

    const index = button.dataset.index;

    delete imageUrls[`projectGallery${index}`];

    const input = projectDetailManager.querySelector(
      `.project-gallery-input[data-index="${index}"]`
    );

    if (input) {
      input.value = '';
    }

    notice.textContent =
      '변경사항 저장하기를 누르면 상세 이미지가 모두 제거됩니다.';
  }
);

/* 전체 변경사항 저장 */
document
  .querySelector('#settingsForm')
  ?.addEventListener('submit', async event => {
    event.preventDefault();

    notice.textContent = '저장 중…';

    const formData = Object.fromEntries(
      new FormData(event.currentTarget)
    );

    const content = {
      ...formData,
      ...imageUrls
    };

    try {
      localStorage.setItem(
        'site_content_main',
        JSON.stringify(content)
      );
    } catch (error) {
      console.warn(
        '로컬 저장소에 저장하지 못했습니다.',
        error
      );
    }

    const { error } = await supabase
      .from('site_content')
      .upsert({
        id: 'main',
        content,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(error);
      notice.textContent = '저장에 실패했습니다.';
      return;
    }

    notice.textContent =
      '저장되었습니다. 홈페이지를 새로고침해 확인하세요.';
  });

/* 로그아웃 */
document
  .querySelector('#logout')
  ?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.reload();
  });
