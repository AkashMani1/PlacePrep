import { DEFAULT_DSA_SHEET_ITEMS } from '@/lib/dsaSheetSeed';
import { DSASheetItem, Difficulty } from '@/lib/types';

export interface DsaSheetQuestionRecord {
  id: string;
  title: string;
  section: string;
  subgroup: string | null;
  difficulty: Difficulty;
  practice_links: string[];
  resource_links: string[];
  video_url: string;
  companies: string[];
  notes: string | null;
  section_order: number;
  item_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface DsaSheetQuestionPayload {
  title: string;
  section: string;
  subgroup: string | null;
  difficulty: Difficulty;
  practice_links: string[];
  resource_links: string[];
  video_url: string;
  companies: string[];
  notes: string | null;
  section_order: number;
  item_order: number;
}

export function createDsaSheetQuestionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `dsa-sheet-${crypto.randomUUID()}`;
  }
  return `dsa-sheet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function mapAdminRecordToSheetItem(record: DsaSheetQuestionRecord): DSASheetItem {
  return {
    id: record.id,
    title: record.title,
    section: record.section,
    subgroup: record.subgroup || undefined,
    difficulty: record.difficulty,
    practiceLinks: Array.isArray(record.practice_links) ? record.practice_links : [],
    resourceLinks: Array.isArray(record.resource_links) ? record.resource_links : [],
    videoUrl: record.video_url || '',
    companies: Array.isArray(record.companies) ? record.companies : [],
    notes: record.notes || '',
    sectionOrder: record.section_order ?? 0,
    order: record.item_order ?? 0,
    completed: false,
    saved: false,
    source: 'admin',
    hidden: false,
  };
}

export function mapSheetItemToAdminRecord(item: DSASheetItem): DsaSheetQuestionRecord {
  return {
    id: item.id,
    title: item.title,
    section: item.section,
    subgroup: item.subgroup || null,
    difficulty: item.difficulty,
    practice_links: item.practiceLinks,
    resource_links: item.resourceLinks,
    video_url: item.videoUrl,
    companies: item.companies,
    notes: item.notes || null,
    section_order: item.sectionOrder,
    item_order: item.order,
  };
}

export function buildSeedAdminRecords(): DsaSheetQuestionRecord[] {
  return DEFAULT_DSA_SHEET_ITEMS.map(mapSheetItemToAdminRecord);
}

function normalizeMergedSubgroup(section: string, subgroup?: string) {
  const cleanedSubgroup = subgroup?.trim();
  if (!cleanedSubgroup) return undefined;
  if (cleanedSubgroup.toLowerCase() === section.trim().toLowerCase()) return undefined;
  return cleanedSubgroup;
}

export function mergeDsaSheetItems(localItems?: DSASheetItem[], adminItems: DSASheetItem[] = DEFAULT_DSA_SHEET_ITEMS) {
  if (!Array.isArray(localItems) || localItems.length === 0) {
    return adminItems;
  }

  const localById = new Map(localItems.map((item) => [item.id, item]));

  const mergedAdminItems = adminItems.map((adminItem) => {
    const localItem = localById.get(adminItem.id);
    if (!localItem) return adminItem;

    return {
      ...adminItem,
      ...localItem,
      subgroup: normalizeMergedSubgroup(adminItem.section, localItem.subgroup ?? adminItem.subgroup),
      source: localItem.source || 'admin',
      companies: localItem.companies || adminItem.companies,
      videoUrl: localItem.videoUrl || adminItem.videoUrl,
    };
  });

  const userItems = localItems.filter((item) => item.source === 'user');
  return [...mergedAdminItems, ...userItems];
}
