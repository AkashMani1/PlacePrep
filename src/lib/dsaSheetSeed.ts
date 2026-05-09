/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
import { DSASheetItem, Difficulty } from './types';
import { DSA_SHEET_CSV } from './dsaRawData';


const YOUTUBE_HOSTS = ['youtube.com', 'youtu.be'];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function inferDifficulty(question: string): Difficulty {
  const match = question.match(/\((easy|medium|hard)\)/i);
  if (!match) return 'Medium';
  const value = match[1].toLowerCase();
  if (value === 'easy') return 'Easy';
  if (value === 'hard') return 'Hard';
  return 'Medium';
}

function cleanTitle(question: string) {
  return question
    .replace(/\s*\((easy|medium|hard)\)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSectionName(section: string) {
  return section
    .replace(/^\d+\s*[\.\):\-]?\s*/i, '')
    .replace(/^pattern\s*:\s*/i, '')
    .replace(/^pattern\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSubgroupName(subgroup: string) {
  return subgroup
    .replace(/^\d+\s*[\.\):\-]?\s*/i, '')
    .replace(/^pattern\s*:\s*/i, '')
    .replace(/^pattern\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSectionRow(question: string, links: string[]) {
  return links.length === 0 && /(pattern|^\d+\.)/i.test(question);
}

function isYouTubeUrl(url: string) {
  return YOUTUBE_HOSTS.some((host) => url.includes(host));
}

export function parseDsaSheetCsv(csv: string): DSASheetItem[] {
  const rows = csv.split(/\r?\n/).slice(2);
  const items: DSASheetItem[] = [];
  let section = 'Uncategorized';
  let subgroup = '';
  let sectionOrder = -1;
  let itemOrder = 0;

  for (const row of rows) {
    const columns = row.split(',').map((part) => part.trim());
    const patternCell = (columns[0] || '').trim();
    const question = (columns[1] || '').trim();
    const links = columns.slice(2).filter(Boolean);

    if (!question) continue;

    if (isSectionRow(question, links)) {
      section = cleanSectionName(question);
      subgroup = '';
      sectionOrder += 1;
      itemOrder = 0;
      continue;
    }

    if (patternCell) {
      const cleanedSubgroup = cleanSubgroupName(patternCell);
      subgroup = cleanedSubgroup && cleanedSubgroup.toLowerCase() !== section.toLowerCase() ? cleanedSubgroup : '';
    }

    const videoLinks = links.filter(isYouTubeUrl);
    const nonVideoLinks = links.filter((link) => !isYouTubeUrl(link));
    const [primaryPractice = '', ...resourceLinks] = nonVideoLinks;
    const title = cleanTitle(question);

    const striverVideo = videoLinks[0] || '';
    
    // Fallback to a smart YouTube search for the specific problem to ensure they get the "best video"
    const smartSearchFallback = `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}+DSA+Solution+Love+Babbar`;
    
    const videoUrl = striverVideo || smartSearchFallback;

    items.push({
      id: `sheet-${slugify(section)}-${slugify(title)}`,
      section,
      subgroup: subgroup || undefined,
      sectionOrder: Math.max(sectionOrder, 0),
      order: itemOrder++,
      title,
      difficulty: inferDifficulty(question),
      practiceLinks: primaryPractice ? [primaryPractice] : [],
      resourceLinks,
      videoUrl,
      companies: [],
      notes: '',
      completed: false,
      saved: false,
      source: 'admin',
      hidden: false,
    });
  }

  return items;
}

export const DEFAULT_DSA_SHEET_ITEMS = parseDsaSheetCsv(DSA_SHEET_CSV);

function normalizeMergedSubgroup(section: string, subgroup?: string) {
  const cleanedSubgroup = subgroup ? cleanSubgroupName(subgroup) : '';
  if (!cleanedSubgroup) return undefined;
  if (cleanedSubgroup.toLowerCase() === cleanSectionName(section).toLowerCase()) return undefined;
  return cleanedSubgroup;
}

export function mergeDsaSheetItems(localItems?: DSASheetItem[]) {
  if (!Array.isArray(localItems) || localItems.length === 0) {
    return DEFAULT_DSA_SHEET_ITEMS;
  }

  const adminSeedIds = new Set(DEFAULT_DSA_SHEET_ITEMS.map((item) => item.id));
  const localById = new Map(localItems.map((item) => [item.id, item]));

  const mergedAdminItems = DEFAULT_DSA_SHEET_ITEMS.map((seedItem) => {
    const localItem = localById.get(seedItem.id);
    if (!localItem) return seedItem;

    const mergedSubgroup = normalizeMergedSubgroup(seedItem.section, localItem.subgroup ?? seedItem.subgroup);
    return {
      ...seedItem,
      ...localItem,
      subgroup: mergedSubgroup,
      source: localItem.source || 'admin',
      companies: localItem.companies || seedItem.companies,
      videoUrl: localItem.videoUrl || seedItem.videoUrl, // Crucial: Don't let an empty local string overwrite the new fallback
    };
  });

  const userItems = localItems.filter((item) => !adminSeedIds.has(item.id) || item.source === 'user');
  return [...mergedAdminItems, ...userItems];
}
