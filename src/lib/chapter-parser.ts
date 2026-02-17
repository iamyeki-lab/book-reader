/**
 * Chapter Parser - Regex-based splitting for Chinese web novels
 * Splits one large string into Chapter objects based on Chinese chapter headings.
 */

export interface Chapter {
  number: number;
  title: string;
  content: string;
  key: string;
}

const ZH_NUMS: Record<string, number> = {
  零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5,
  六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 百: 100, 千: 1000, 万: 10000,
};

function chapterKeyFromNumber(n: number): string {
  return `ch_${String(n).padStart(3, "0")}`;
}

/** Convert Chinese numerals (一、二、十、十一、一百) to integer */
function zhNumToInt(s: string): number {
  const t = s.trim().replace(/〇/g, "0");
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  let n = 0;
  let cur = 0;
  for (const c of t) {
    const v = ZH_NUMS[c];
    if (v !== undefined) {
      if (v === 10) n = (n || 1) * 10;         // 十
      else if (v >= 100) n = (n + cur || 1) * v; // 百、千、万
      else cur = v;                             // 一～九
    } else if (/\d/.test(c)) cur = parseInt(c, 10);
  }
  return n + cur || cur || 1;
}

/**
 * Regex for Chinese chapter headings:
 * 第1章 重生 | 第一章 | 第一百章 系统的觉醒 | 第 一 章
 */
const ZH_CHAPTER_RE = /第\s*([一二三四五六七八九十百千万零〇\d]+)\s*章\s*([^\n]*)/g;

/**
 * Split a raw book string into Chapter objects by Chinese chapter headings.
 * Handles: 第1章, 第一章, 第一百章, 第 一 章, etc.
 *
 * @param rawContent - The entire book text (title, intro, all chapters)
 * @returns Array of Chapter objects
 */
export function parseChapters(rawContent: string): Chapter[] {
  const text = rawContent.trim();
  if (!text) return [];

  const matches = Array.from(text.matchAll(ZH_CHAPTER_RE));
  if (matches.length < 2) {
    return [{
      number: 1,
      title: "",
      content: text,
      key: chapterKeyFromNumber(1),
    }];
  }

  const chapters: Chapter[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const num = zhNumToInt(m[1]);
    const title = (m[2] || "").trim();
    const start = m.index! + m[0].length;
    const end = matches[i + 1]?.index ?? text.length;
    const content = text.slice(start, end).trim();
    chapters.push({
      number: num,
      title,
      content,
      key: chapterKeyFromNumber(num),
    });
  }
  return chapters;
}
