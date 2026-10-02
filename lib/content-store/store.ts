import 'server-only';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { withMutex } from './mutex';
import {
  TableName,
  RecordType,
  Lecture,
  Sermon,
  Book,
  Article,
  ListOptions,
  ListResult,
  TableConfig,
  TABLE_CONFIGS,
  StatsData,
  StatsCounts,
  StatsLatestItem,
  VALID_TABLES,
} from './types';

export type { TableName };

const DATA_DIR = path.join(process.cwd(), 'data');

function getFilePath(table: TableName): string {
  return path.join(DATA_DIR, `${table}.json`);
}

function isWritable(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.CONTENT_WRITABLE === 'true';
}

function normalizeTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter((t): t is string => typeof t === 'string');
  if (typeof tags === 'string') {
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function normalizeRecord<T extends RecordType>(table: TableName, record: Partial<T>): T {
  const now = new Date().toISOString();
  const base: RecordType = {
    id: record.id || randomUUID(),
    created_at: record.created_at || now,
    updated_at: now,
    published: Boolean(record.published),
    views: typeof record.views === 'number' ? record.views : 0,
  } as T;

  const config = TABLE_CONFIGS[table];

  switch (table) {
    case 'lectures': {
      const r = record as Partial<Lecture>;
      return {
        ...base,
        title: r.title || '',
        description: r.description ?? null,
        audio_url: r.audio_url ?? null,
        youtube_url: r.youtube_url ?? null,
        media_url: r.media_url ?? null,
        duration: typeof r.duration === 'number' ? r.duration : null,
        category: r.category || null,
        tags: normalizeTags(r.tags),
      } as T;
    }
    case 'sermons': {
      const r = record as Partial<Sermon>;
      return {
        ...base,
        title: r.title || '',
        description: r.description ?? null,
        audio_url: r.audio_url ?? null,
        video_url: r.video_url ?? null,
        youtube_url: r.youtube_url ?? null,
        media_url: r.media_url ?? null,
        thumbnail_url: r.thumbnail_url ?? null,
        duration: typeof r.duration === 'number' ? r.duration : null,
        sermon_date: r.sermon_date ?? null,
        location: r.location ?? null,
      } as T;
    }
    case 'books': {
      const r = record as Partial<Book>;
      return {
        ...base,
        title: r.title || '',
        description: r.description ?? null,
        cover_url: r.cover_url ?? null,
        pdf_url: r.pdf_url ?? null,
        author: r.author || 'الدكتور إبراهيم صبحي',
        publisher: r.publisher ?? null,
        year: typeof r.year === 'number' ? r.year : null,
        pages: typeof r.pages === 'number' ? r.pages : null,
        downloads: typeof r.downloads === 'number' ? r.downloads : 0,
      } as T;
    }
    case 'articles': {
      const r = record as Partial<Article>;
      return {
        ...base,
        title: r.title || '',
        content: r.content || '',
        excerpt: r.excerpt ?? null,
        cover_url: r.cover_url ?? null,
        tags: normalizeTags(r.tags),
      } as T;
    }
  }
}

async function readTable<T extends RecordType>(table: TableName): Promise<T[]> {
  const filePath = getFilePath(table);
  try {
    const content = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      throw new Error('Not an array');
    }
    return parsed as T[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    const corruptPath = `${filePath}.corrupt-${Date.now()}.json`;
    try {
      await rename(filePath, corruptPath);
      console.warn(`Corrupted ${table}.json backed up to ${corruptPath}`);
    } catch {}
    return [];
  }
}

async function writeTable<T extends RecordType>(table: TableName, data: T[]): Promise<void> {
  if (!isWritable()) {
    throw new Error('WRITE_DISABLED: edits must be made locally and pushed');
  }

  const filePath = getFilePath(table);
  const tempPath = `${filePath}.tmp-${Date.now()}-${randomUUID()}`;

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await rename(tempPath, filePath);
}

function matchesSearch(item: Record<string, unknown>, search: string, config: TableConfig): boolean {
  const lowerSearch = search.toLowerCase();
  return config.searchFields.some((field) => {
    const value = item[field];
    if (typeof value === 'string') {
      return value.toLowerCase().includes(lowerSearch);
    }
    if (Array.isArray(value)) {
      return value.some((v) => typeof v === 'string' && v.toLowerCase().includes(lowerSearch));
    }
    return false;
  });
}

function compareItems(a: Record<string, unknown>, b: Record<string, unknown>, orderBy: string, orderAsc: boolean): number {
  const aVal = a[orderBy];
  const bVal = b[orderBy];
  let result = 0;

  if (aVal instanceof Date && bVal instanceof Date) {
    result = aVal.getTime() - bVal.getTime();
  } else if (typeof aVal === 'string' && typeof bVal === 'string') {
    result = aVal.localeCompare(bVal);
  } else if (typeof aVal === 'number' && typeof bVal === 'number') {
    result = aVal - bVal;
  } else if (aVal === null || aVal === undefined) {
    result = 1;
  } else if (bVal === null || bVal === undefined) {
    result = -1;
  }

  return orderAsc ? result : -result;
}

export async function list<T extends RecordType>(
  table: TableName,
  options: ListOptions = {}
): Promise<ListResult<T>> {
  const config = TABLE_CONFIGS[table];
  const {
    publishedOnly = false,
    search = '',
    page = 1,
    perPage = 10,
    limit,
    excludeId,
    orderBy,
    orderAsc,
    tagsOverlap,
  } = options;

  const data = await readTable<T>(table);

  let filtered = data.filter((item) => {
    if (publishedOnly && !item.published) return false;
    if (excludeId && item.id === excludeId) return false;
    if (search && !matchesSearch(item as unknown as Record<string, unknown>, search, config)) return false;
    if (tagsOverlap && tagsOverlap.length > 0) {
      const itemTags = (item as Lecture).tags || [];
      const hasOverlap = tagsOverlap.some((tag) => itemTags.includes(tag));
      if (!hasOverlap) return false;
    }
    return true;
  });

  const totalCount = filtered.length;

  const orderField = orderBy || config.defaultOrder;
  const orderAscending = orderAsc ?? config.defaultOrderAsc;

  filtered.sort((a, b) => compareItems(a as unknown as Record<string, unknown>, b as unknown as Record<string, unknown>, orderField, orderAscending));

  if (limit) {
    filtered = filtered.slice(0, limit);
  } else {
    const from = (page - 1) * perPage;
    const to = from + perPage;
    filtered = filtered.slice(from, to);
  }

  return { data: filtered, count: totalCount };
}

export async function getById<T extends RecordType>(
  table: TableName,
  id: string,
  options: { publishedOnly?: boolean } = {}
): Promise<T | null> {
  const data = await readTable<T>(table);
  const item = data.find((item) => item.id === id);
  if (!item) return null;
  if (options.publishedOnly && !item.published) return null;
  return item;
}

export async function create<T extends RecordType>(
  table: TableName,
  input: Partial<T>
): Promise<T> {
  const config = TABLE_CONFIGS[table];
  const inputRecord = input as Record<string, unknown>;

  for (const field of config.requiredFields) {
    if (!inputRecord[field] || (typeof inputRecord[field] === 'string' && !inputRecord[field].trim())) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return withMutex(`write-${table}`, async () => {
    const data = await readTable<T>(table);
    const newItem = normalizeRecord<T>(table, input);
    data.unshift(newItem);
    await writeTable(table, data);
    return newItem;
  });
}

export async function update<T extends RecordType>(
  table: TableName,
  id: string,
  input: Partial<T>
): Promise<T | null> {
  return withMutex(`write-${table}`, async () => {
    const data = await readTable<T>(table);
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updated = normalizeRecord<T>(table, { ...data[index], ...input, id });
    updated.created_at = data[index].created_at;
    data[index] = updated;
    await writeTable(table, data);
    return updated;
  });
}

export async function remove(table: TableName, id: string): Promise<boolean> {
  return withMutex(`write-${table}`, async () => {
    const data = await readTable(table);
    const filtered = data.filter((item) => item.id !== id);
    if (filtered.length === data.length) return false;
    await writeTable(table, filtered);
    return true;
  });
}

export async function counts(): Promise<StatsCounts[]> {
  const tables: TableName[] = ['lectures', 'sermons', 'books', 'articles'];
  const labels: Record<TableName, string> = {
    lectures: 'المحاضرات',
    sermons: 'الخطب',
    books: 'الكتب',
    articles: 'المقالات',
  };
  const icons: Record<TableName, string> = {
    lectures: '📚',
    sermons: '📖',
    books: '📕',
    articles: '📝',
  };

  return Promise.all(
    tables.map(async (table) => {
      const data = await readTable(table);
      const total = data.length;
      const published = data.filter((item) => item.published).length;
      return { key: table, label: labels[table], icon: icons[table], total, published };
    })
  );
}

export async function latest(): Promise<StatsLatestItem[]> {
  const tables: TableName[] = ['lectures', 'sermons', 'books', 'articles'];
  const labels: Record<TableName, string> = {
    lectures: 'محاضرة',
    sermons: 'خطبة',
    books: 'كتاب',
    articles: 'مقال',
  };

  const allItems: StatsLatestItem[] = [];
  for (const table of tables) {
    const data = await readTable(table);
    const latestItems = data
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        created_at: item.created_at,
        typeLabel: labels[table],
      }));
    allItems.push(...latestItems);
  }

  return allItems
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
}

export async function getAllData(): Promise<Record<TableName, RecordType[]>> {
  const tables: TableName[] = ['lectures', 'sermons', 'books', 'articles'];
  const result: Partial<Record<TableName, RecordType[]>> = {};
  for (const table of tables) {
    result[table] = await readTable(table);
  }
  return result as Record<TableName, RecordType[]>;
}

export async function importData(
  data: Record<TableName, RecordType[]>,
  mode: 'merge' | 'replace' = 'merge'
): Promise<void> {
  if (!isWritable()) {
    throw new Error('WRITE_DISABLED: edits must be made locally and pushed');
  }

  const tables: TableName[] = ['lectures', 'sermons', 'books', 'articles'];

  for (const table of tables) {
    await withMutex(`write-${table}`, async () => {
      let existing: RecordType[] = [];
      if (mode === 'merge') {
        existing = await readTable(table);
      }
      const incoming = data[table] || [];
      const byId = new Map<string, RecordType>();

      for (const item of existing) {
        byId.set(item.id, item);
      }
      for (const item of incoming) {
        byId.set(item.id, normalizeRecord(table, item));
      }

      const merged = Array.from(byId.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      await writeTable(table, merged);
    });
  }
}

export { VALID_TABLES };