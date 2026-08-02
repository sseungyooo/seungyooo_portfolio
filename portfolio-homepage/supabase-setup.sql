-- Supabase Dashboard → SQL Editor에서 이 전체 내용을 실행하세요.
create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "Anyone can view portfolio content"
on public.site_content for select using (true);

create policy "Signed-in owner can manage content"
on public.site_content for all to authenticated
using (true) with check (true);

insert into public.site_content (id, content) values (
  'main',
  '{"heroTitle":"관찰하고,\\n더 나은 경험을\\n만듭니다.","heroIntro":"디지털 제품과 브랜드에\\n명료한 방향을 더하는 디자이너입니다.","aboutTitle":"생각의 빈틈을\\n형태로 채웁니다.","aboutText":"서울을 기반으로 활동하며, 브랜드의 본질을 발견하고 사람들이 자연스럽게 머무는 경험을 설계합니다. 전략부터 최종 디테일까지 함께합니다.","heroSize":"100","aboutSize":"62","heroBg":"#f2f0ea","contactBg":"#171714","email":"hello@example.com","projectTitle0":"Ovoid / Wellness","projectDetail0":"Brand identity · 2025","projectTitle1":"Juun / Editorial","projectDetail1":"Art direction · 2025","projectTitle2":"Objects in form","projectDetail2":"Digital experience · 2024"}'::jsonb
) on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do update set public = true;

create policy "Anyone can view portfolio images"
on storage.objects for select using (bucket_id = 'portfolio-images');

create policy "Signed-in owner can upload portfolio images"
on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-images');

create policy "Signed-in owner can update portfolio images"
on storage.objects for update to authenticated using (bucket_id = 'portfolio-images');

create policy "Signed-in owner can delete portfolio images"
on storage.objects for delete to authenticated using (bucket_id = 'portfolio-images');
