import { supabase } from './supabase-config.js';

const defaults = {
  heroTitle: '관찰하고,\n더 나은 경험을\n만듭니다.',
  heroIntro: '디지털 제품과 브랜드에\n명료한 방향을 더하는 디자이너입니다.',
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

/* 이미지 자동 압축 및 WebP 변환 */
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
       * 투명 PNG를 WebP로 변환할 때도
       * 투명 배경을 그대로 유지합니다.
       */
      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        blob => {
          URL.revokeObjectURL(objectUrl);

          if (!blob) {
            reject(new Error('이미지 압축에 실패했습니다.'));
            return;
          }

          const originalName = file.name.replace(
            /\.[^/.]+$/,
            ''
          );

          const safeName = originalName
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

          const compressedFile = new File(
            [blob],
            `${safeName || 'image'}.webp`,
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

/* Supabase 이미지 업로드 */
async function uploadCompressedImage(
  originalFile,
  folder
) {
  const compressedFile = await compressImage(
    originalFile,
    1600,
    0.8
  );

  const safeFileName = compressedFile.name.replace(
    /[^a-zA-Z0-9._-]/g,
    '-'
  );

  const path =
    `${folder}/${Date.now()}-${safeFileName}`;

  const { error } = await supabase.storage
    .from('portfolio-images')
    .upload(path, compressedFile, {
      upsert: false,
      contentType: 'image/webp',
      cacheControl: '3600'
