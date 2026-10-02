export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  views: number;
}

export interface Lecture extends BaseRecord {
  title: string;
  description: string | null;
  audio_url: string | null;
  youtube_url: string | null;
  media_url: string | null;
  duration: number | null;
  category: 'محاضرة' | 'درس' | null;
  tags: string[];
}

export interface Sermon extends BaseRecord {
  title: string;
  description: string | null;
  audio_url: string | null;
  video_url: string | null;
  youtube_url: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  sermon_date: string | null;
  location: string | null;
}

export interface Book extends BaseRecord {
  title: string;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  author: string;
  publisher: string | null;
  year: number | null;
  pages: number | null;
  downloads: number;
}

export interface Article extends BaseRecord {
  title: string;
  content: string;
  excerpt: string | null;
  cover_url: string | null;
  tags: string[];
}

export type TableName = 'lectures' | 'sermons' | 'books' | 'articles';
export type RecordType = Lecture | Sermon | Book | Article;

export const VALID_TABLES: TableName[] = ['lectures', 'sermons', 'books', 'articles'];

export interface TableConfig {
  name: TableName;
  requiredFields: string[];
  searchFields: string[];
  orderFields: string[];
  defaultOrder: 'created_at' | 'sermon_date';
  defaultOrderAsc: boolean;
}

export const TABLE_CONFIGS: Record<TableName, TableConfig> = {
  lectures: {
    name: 'lectures',
    requiredFields: ['title'],
    searchFields: ['title', 'description'],
    orderFields: ['created_at'],
    defaultOrder: 'created_at',
    defaultOrderAsc: false,
  },
  sermons: {
    name: 'sermons',
    requiredFields: ['title'],
    searchFields: ['title', 'description'],
    orderFields: ['sermon_date', 'created_at'],
    defaultOrder: 'sermon_date',
    defaultOrderAsc: false,
  },
  books: {
    name: 'books',
    requiredFields: ['title'],
    searchFields: ['title', 'description'],
    orderFields: ['created_at'],
    defaultOrder: 'created_at',
    defaultOrderAsc: false,
  },
  articles: {
    name: 'articles',
    requiredFields: ['title', 'content'],
    searchFields: ['title', 'excerpt', 'content'],
    orderFields: ['created_at'],
    defaultOrder: 'created_at',
    defaultOrderAsc: false,
  },
};

export interface ListOptions {
  publishedOnly?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
  limit?: number;
  excludeId?: string;
  orderBy?: string;
  orderAsc?: boolean;
  tagsOverlap?: string[];
}

export interface ListResult<T> {
  data: T[];
  count: number;
}

export interface StatsCounts {
  key: TableName;
  label: string;
  icon: string;
  total: number;
  published: number;
}

export interface StatsLatestItem {
  id: string;
  title: string;
  created_at: string;
  typeLabel: string;
}

export interface StatsData {
  counts: StatsCounts[];
  latestItems: StatsLatestItem[];
}