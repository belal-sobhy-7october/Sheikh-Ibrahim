-- تفعيل UUID
create extension if not exists "uuid-ossp";

-- جدول المحاضرات والدروس
create table lectures (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  audio_url text,
  duration integer,
  category text check (category in ('محاضرة', 'درس')),
  tags text[],
  views integer default 0,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- جدول الخطب
create table sermons (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  audio_url text,
  video_url text,
  duration integer,
  sermon_date date,
  location text,
  views integer default 0,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- جدول المؤلفات والكتب
create table books (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  cover_url text,
  pdf_url text,
  author text default 'الدكتور إبراهيم صبحي',
  publisher text,
  year integer,
  pages integer,
  downloads integer default 0,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- جدول الفيديوهات
create table videos (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  youtube_url text,
  thumbnail_url text,
  duration integer,
  category text,
  views integer default 0,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- جدول المقالات
create table articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  excerpt text,
  cover_url text,
  tags text[],
  views integer default 0,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- إضافة RLS (Row Level Security)
alter table lectures enable row level security;
alter table sermons enable row level security;
alter table books enable row level security;
alter table videos enable row level security;
alter table articles enable row level security;

-- السماح للزوار بقراءة المحتوى المنشور فقط
create policy "public read published" on lectures for select using (published = true);
create policy "public read published" on sermons for select using (published = true);
create policy "public read published" on books for select using (published = true);
create policy "public read published" on videos for select using (published = true);
create policy "public read published" on articles for select using (published = true);

-- السماح للـ service role بكل العمليات (للأدمن)
create policy "admin full access" on lectures for all using (auth.role() = 'service_role');
create policy "admin full access" on sermons for all using (auth.role() = 'service_role');
create policy "admin full access" on books for all using (auth.role() = 'service_role');
create policy "admin full access" on videos for all using (auth.role() = 'service_role');
create policy "admin full access" on articles for all using (auth.role() = 'service_role');

-- دالة لزيادة عداد المشاهدات
create or replace function increment_views(table_name text, row_id uuid)
returns void as $$
begin
  execute format('update %I set views = views + 1 where id = $1', table_name)
  using row_id;
end;
$$ language plpgsql security definer;
