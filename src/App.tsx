import { useState, useEffect, useMemo, useRef } from 'react';
import { Solar } from 'lunar-javascript';

// Types
type Lang = 'zh' | 'en' | 'ja' | 'de';
type Region = 'china' | 'japan' | 'australia' | 'germany';
type SixGod = '大安' | '留连' | '速喜' | '赤口' | '小吉' | '空亡';

const SIX_GODS: SixGod[] = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'];

// 生肖数据
type Zodiac = '鼠' | '牛' | '虎' | '兔' | '龙' | '蛇' | '马' | '羊' | '猴' | '鸡' | '狗' | '猪';
const ZODIAC_LIST: Zodiac[] = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const ZODIAC_ICONS: Record<Zodiac, string> = { '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰', '龙': '🐉', '蛇': '🐍', '马': '🐴', '羊': '🐑', '猴': '🐵', '鸡': '🐔', '狗': '🐶', '猪': '🐷' };
const ZODIAC_EN: Record<Zodiac, string> = { '鼠': 'Rat', '牛': 'Ox', '虎': 'Tiger', '兔': 'Rabbit', '龙': 'Dragon', '蛇': 'Snake', '马': 'Horse', '羊': 'Goat', '猴': 'Monkey', '鸡': 'Rooster', '狗': 'Dog', '猪': 'Pig' };
const ZODIAC_JA: Record<Zodiac, string> = { '鼠': '子（ねずみ）', '牛': '丑（うし）', '虎': '寅（とら）', '兔': '卯（うさぎ）', '龙': '辰（たつ）', '蛇': '巳（へび）', '马': '午（うま）', '羊': '未（ひつじ）', '猴': '申（さる）', '鸡': '酉（とり）', '狗': '戌（いぬ）', '猪': '亥（いのしし）' };
const ZODIAC_DE: Record<Zodiac, string> = { '鼠': 'Ratte', '牛': 'Büffel', '虎': 'Tiger', '兔': 'Hase', '龙': 'Drache', '蛇': 'Schlange', '马': 'Pferd', '羊': 'Ziege', '猴': 'Affe', '鸡': 'Hahn', '狗': 'Hund', '猪': 'Schwein' };
const ZODIAC_ELEMENT: Record<Zodiac, string> = { '鼠': '水', '牛': '土', '虎': '木', '兔': '木', '龙': '土', '蛇': '火', '马': '火', '羊': '土', '猴': '金', '鸡': '金', '狗': '土', '猪': '水' };
const ZODIAC_ELEMENT_EN: Record<Zodiac, string> = { '鼠': 'Water', '牛': 'Earth', '虎': 'Wood', '兔': 'Wood', '龙': 'Earth', '蛇': 'Fire', '马': 'Fire', '羊': 'Earth', '猴': 'Metal', '鸡': 'Metal', '狗': 'Earth', '猪': 'Water' };
const ZODIAC_ELEMENT_JA: Record<Zodiac, string> = { '鼠': '水', '牛': '土', '虎': '木', '兔': '木', '龙': '土', '蛇': '火', '马': '火', '羊': '土', '猴': '金', '鸡': '金', '狗': '土', '猪': '水' };

// 香港天文台春节数据（1920-2025）
const LUNAR_NEW_YEAR: Record<string, string> = {
  "2025": "2025-01-29", "2024": "2024-02-10", "2023": "2023-01-22", "2022": "2022-02-01", "2021": "2021-02-12",
  "2020": "2020-01-25", "2019": "2019-02-05", "2018": "2018-02-16", "2017": "2017-01-28", "2016": "2016-02-08",
  "2015": "2015-02-19", "2014": "2014-01-31", "2013": "2013-02-10", "2012": "2012-01-23", "2011": "2011-02-03",
  "2010": "2010-02-14", "2009": "2009-01-26", "2008": "2008-02-07", "2007": "2007-02-18", "2006": "2006-01-29",
  "2005": "2005-02-09", "2004": "2004-01-22", "2003": "2003-02-01", "2002": "2002-02-12", "2001": "2001-01-24",
  "2000": "2000-02-05", "1999": "1999-02-16", "1998": "1998-01-28", "1997": "1997-02-07", "1996": "1996-02-19",
  "1995": "1995-01-31", "1994": "1994-02-10", "1993": "1993-01-23", "1992": "1992-02-04", "1991": "1991-02-15",
  "1990": "1990-01-27", "1989": "1989-02-06", "1988": "1988-02-17", "1987": "1987-01-29", "1986": "1986-02-09",
  "1985": "1985-02-20", "1984": "1984-02-02", "1983": "1983-02-13", "1982": "1982-01-25", "1981": "1981-02-05",
  "1980": "1980-02-16", "1979": "1979-01-28", "1978": "1978-02-07", "1977": "1977-02-18", "1976": "1976-01-31",
  "1975": "1975-02-11", "1974": "1974-01-23", "1973": "1973-02-03", "1972": "1972-01-16", "1971": "1971-01-27",
  "1970": "1970-02-06", "1969": "1969-02-17", "1968": "1968-01-30", "1967": "1967-02-09", "1966": "1966-01-21",
  "1965": "1965-02-02", "1964": "1964-02-13", "1963": "1963-01-25", "1962": "1962-02-05", "1961": "1961-01-15",
  "1960": "1960-01-28", "1959": "1959-02-08", "1958": "1958-02-18", "1957": "1957-01-31", "1956": "1956-02-12",
  "1955": "1955-01-24", "1954": "1954-02-03", "1953": "1953-02-14", "1952": "1952-01-27", "1951": "1951-02-06",
  "1950": "1950-02-17", "1949": "1949-01-29", "1948": "1948-02-10", "1947": "1947-01-22", "1946": "1946-02-02",
  "1945": "1945-02-13", "1944": "1944-01-25", "1943": "1943-02-05", "1942": "1942-02-15", "1941": "1941-01-27",
  "1940": "1940-02-08", "1939": "1939-02-19", "1938": "1938-01-31", "1937": "1937-02-11", "1936": "1936-01-24",
  "1935": "1935-02-04", "1934": "1934-02-14", "1933": "1933-01-26", "1932": "1932-02-06", "1931": "1931-02-17",
  "1930": "1930-01-30", "1929": "1929-02-10", "1928": "1928-01-23", "1927": "1927-02-02", "1926": "1926-02-13",
  "1925": "1925-01-24", "1924": "1924-02-05", "1923": "1923-02-16", "1922": "1922-01-28", "1921": "1921-02-08", "1920": "1920-02-20"
};

// 精准计算生肖（考虑春节边界）
function getExactZodiac(year: number, month: number, day: number): { zodiac: Zodiac; lunarYear: number; isBeforeNewYear: boolean } {
  const zodiacs: Zodiac[] = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊'];
  const yearStr = String(year);
  if (!LUNAR_NEW_YEAR[yearStr]) {
    return { zodiac: zodiacs[year % 12], lunarYear: year, isBeforeNewYear: false };
  }
  const lunarNewYear = new Date(LUNAR_NEW_YEAR[yearStr]);
  const birthDate = new Date(year, month - 1, day);
  if (birthDate < lunarNewYear) {
    return { zodiac: zodiacs[(year - 1) % 12], lunarYear: year - 1, isBeforeNewYear: true };
  }
  return { zodiac: zodiacs[year % 12], lunarYear: year, isBeforeNewYear: false };
}

// 六神五行与方位
const SHENSHA_ELEMENT: Record<SixGod, string> = {
  '大安': '木', '留连': '土', '速喜': '火', '赤口': '金', '小吉': '水', '空亡': '土'
};
const SHENSHA_DIRECTION: Record<SixGod, { main: string; alt: string }> = {
  '大安': { main: '东', alt: '北' },
  '留连': { main: '中', alt: '南' },
  '速喜': { main: '南', alt: '东' },
  '赤口': { main: '西', alt: '中' },
  '小吉': { main: '北', alt: '西' },
  '空亡': { main: '中', alt: '东' }
};

// 柔性提示语模板
const ZODIAC_HINTS = {
  zh: {
    generate: [
      "时机正好，{direction}方位或有助力",
      "气场相合，可往{direction}方寻机缘",
      "顺势而行，{direction}向较为顺遂",
      "天时相助，{direction}方宜多留意"
    ],
    restrain: [
      "稍安勿躁，{altDirection}方或有转机",
      "宜缓不宜急，可先观望{altDirection}方",
      "此时守静为上，{altDirection}向另有机缘",
      "暂避锋芒，{altDirection}方位更为稳妥"
    ],
    same: [
      "平稳之象，按部就班即可",
      "不急不躁，顺其自然为宜",
      "中正平和，本位行事即可"
    ]
  },
  en: {
    generate: [
      "Timing is right, {direction} direction may bring assistance",
      "Energy aligns well, seek opportunities in the {direction}",
      "Go with the flow, {direction} is favorable",
      "Fortune favors you, pay attention to the {direction}"
    ],
    restrain: [
      "Patience advised, {altDirection} may offer alternatives",
      "Take it slow, observe the {altDirection} first",
      "Stillness is wisdom now, {altDirection} holds other chances",
      "Step back for now, {altDirection} is more stable"
    ],
    same: [
      "Steady as it goes, proceed normally",
      "Neither rush nor delay, let nature take its course",
      "Balance is key, act from your center"
    ]
  },
  ja: {
    generate: [
      "今がチャンス、{direction}の方角に好機あり",
      "気の流れ良好、{direction}方面を探ってみて",
      "流れに乗って、{direction}が吉方位",
      "天の助けあり、{direction}に注目を"
    ],
    restrain: [
      "焦らずに、{altDirection}に転機あり",
      "急がば回れ、{altDirection}を見守って",
      "静観が吉、{altDirection}に別の道あり",
      "一歩引いて、{altDirection}がより安定"
    ],
    same: [
      "穏やかな兆し、普段通りに",
      "焦らず騒がず、自然に任せて",
      "中庸が大切、本分を守って"
    ]
  },
  de: {
    generate: [
      "Der Zeitpunkt ist günstig, {direction} bringt Unterstützung",
      "Die Energie ist harmonisch, suchen Sie Chancen im {direction}",
      "Gehen Sie mit dem Fluss, {direction} ist vorteilhaft",
      "Das Glück begünstigt Sie, achten Sie auf {direction}"
    ],
    restrain: [
      "Geduld empfohlen, {altDirection} bietet Alternativen",
      "Langsam vorgehen, beobachten Sie zuerst {altDirection}",
      "Ruhe ist jetzt Weisheit, {altDirection} hält andere Chancen",
      "Treten Sie zurück, {altDirection} ist stabiler"
    ],
    same: [
      "Stetig wie es geht, normal fortfahren",
      "Weder hetzen noch verzögern, lassen Sie die Natur ihren Lauf nehmen",
      "Balance ist der Schlüssel, handeln Sie aus Ihrer Mitte"
    ]
  }
};

// 方位多语言映射
const DIRECTION_NAME: Record<string, { zh: string; en: string; ja: string; de: string }> = {
  '东': { zh: '东', en: 'East', ja: '東', de: 'Osten' },
  '南': { zh: '南', en: 'South', ja: '南', de: 'Süden' },
  '西': { zh: '西', en: 'West', ja: '西', de: 'Westen' },
  '北': { zh: '北', en: 'North', ja: '北', de: 'Norden' },
  '中': { zh: '中央', en: 'Center', ja: '中央', de: 'Zentrum' }
};

// 根据生肖与六神关系生成柔性提示
function getZodiacHint(god: SixGod, zodiac: Zodiac, lang: Lang): string {
  const shenshaEl = SHENSHA_ELEMENT[god];
  const zodiacEl = ZODIAC_ELEMENT[zodiac];
  const dir = SHENSHA_DIRECTION[god];
  const hints = ZODIAC_HINTS[lang];
  
  // 五行生克判断
  const generates = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }; // 我生
  const restrains = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' }; // 我克
  const generatedBy = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' }; // 生我
  const restrainedBy = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' }; // 克我
  
  const mainDir = DIRECTION_NAME[dir.main][lang];
  const altDir = DIRECTION_NAME[dir.alt][lang];
  
  let templates: string[];
  
  if (shenshaEl === zodiacEl) {
    // 同五行 - 比和
    templates = hints.same;
  } else if (generates[zodiacEl as keyof typeof generates] === shenshaEl || generatedBy[shenshaEl as keyof typeof generatedBy] === zodiacEl) {
    // 生肖生六神 或 六神生生肖 - 相生
    templates = hints.generate;
  } else if (restrains[zodiacEl as keyof typeof restrains] === shenshaEl || restrainedBy[zodiacEl as keyof typeof restrainedBy] === shenshaEl) {
    // 相克关系
    templates = hints.restrain;
  } else {
    templates = hints.same;
  }
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace('{direction}', mainDir).replace('{altDirection}', altDir);
}

// 五行相生相克关系
function getElementRelation(shenshaElement: string, zodiacElement: string, lang: Lang): { effect: 'good' | 'bad' | 'neutral'; text: string; power: number } {
  const relations: Record<string, { effect: 'good' | 'bad' | 'neutral'; zh: string; en: string; power: number }> = {
    '木木': { effect: 'good', zh: '比和（大吉）', en: 'Harmony (Very Lucky)', power: 100 },
    '木火': { effect: 'good', zh: '木生火（吉）', en: 'Wood feeds Fire (Lucky)', power: 120 },
    '木土': { effect: 'bad', zh: '木克土（凶）', en: 'Wood controls Earth (Unlucky)', power: 60 },
    '木金': { effect: 'bad', zh: '金克木（凶）', en: 'Metal controls Wood (Unlucky)', power: 55 },
    '木水': { effect: 'good', zh: '水生木（吉）', en: 'Water feeds Wood (Lucky)', power: 110 },
    '火木': { effect: 'good', zh: '木生火（吉）', en: 'Wood feeds Fire (Lucky)', power: 120 },
    '火火': { effect: 'good', zh: '比和（大吉）', en: 'Harmony (Very Lucky)', power: 115 },
    '火土': { effect: 'good', zh: '火生土（吉）', en: 'Fire feeds Earth (Lucky)', power: 85 },
    '火金': { effect: 'bad', zh: '火克金（凶）', en: 'Fire controls Metal (Unlucky)', power: 55 },
    '火水': { effect: 'bad', zh: '水克火（凶）', en: 'Water controls Fire (Unlucky)', power: 70 },
    '土木': { effect: 'bad', zh: '木克土（凶）', en: 'Wood controls Earth (Unlucky)', power: 60 },
    '土火': { effect: 'good', zh: '火生土（吉）', en: 'Fire feeds Earth (Lucky)', power: 90 },
    '土土': { effect: 'good', zh: '比和（大吉）', en: 'Harmony (Very Lucky)', power: 100 },
    '土金': { effect: 'good', zh: '土生金（吉）', en: 'Earth feeds Metal (Lucky)', power: 85 },
    '土水': { effect: 'bad', zh: '土克水（凶）', en: 'Earth controls Water (Unlucky)', power: 65 },
    '金木': { effect: 'bad', zh: '金克木（凶）', en: 'Metal controls Wood (Unlucky)', power: 55 },
    '金火': { effect: 'bad', zh: '火克金（凶）', en: 'Fire controls Metal (Unlucky)', power: 55 },
    '金土': { effect: 'good', zh: '土生金（吉）', en: 'Earth feeds Metal (Lucky)', power: 80 },
    '金金': { effect: 'good', zh: '比和（大吉）', en: 'Harmony (Very Lucky)', power: 100 },
    '金水': { effect: 'good', zh: '金生水（吉）', en: 'Metal feeds Water (Lucky)', power: 85 },
    '水木': { effect: 'good', zh: '水生木（吉）', en: 'Water feeds Wood (Lucky)', power: 110 },
    '水火': { effect: 'bad', zh: '水克火（凶）', en: 'Water controls Fire (Unlucky)', power: 70 },
    '水土': { effect: 'bad', zh: '土克水（凶）', en: 'Earth controls Water (Unlucky)', power: 65 },
    '水金': { effect: 'good', zh: '金生水（吉）', en: 'Metal feeds Water (Lucky)', power: 80 },
    '水水': { effect: 'good', zh: '比和（大吉）', en: 'Harmony (Very Lucky)', power: 100 },
  };
  const key = shenshaElement + zodiacElement;
  const rel = relations[key] || { effect: 'neutral', zh: '中性', en: 'Neutral', power: 75 };
  return { effect: rel.effect, text: lang === 'zh' ? rel.zh : lang === 'ja' ? rel.zh : rel.en, power: rel.power };
}

// 双语内容
const i18n = {
  zh: {
    title: '小六壬占卜',
    subtitle: '唐代李淳风六壬时课',
    regionChina: '中国',
    regionJapan: '日本',
    regionAustralia: '澳洲',
    regionGermany: '德国',
    today: '今日',
    currentHour: '当前时辰',
    allHours: '当前时辰',
    sixGodsExplain: '六神详解',
    history: '历史渊源',
    southernHemisphere: '南半球应用',
    melbourneTable: '澳洲南半球能量月对照表',
    element: '五行',
    color: '颜色',
    direction: '方位',
    luck: '吉凶',
    meaning: '含义',
    modernTip: '现代解读',
    calculation: '推算过程',
    basicVersion: '基础版：月份+6',
    advancedVersion: '高级版：观象能量月',
    month: '月份',
    phenology: '物候特征',
    energyMonth: '能量月*',
    actionTip: '行为口诀',
    gods: {
      '大安': { name: '大安', en: 'Da An (Great Peace)', element: '木', color: '青色', direction: '东方', luck: '吉', meaning: '安定、顺利', desc: '身不动时', modern: '宜守成，事态平稳', gradient: 'from-emerald-400 to-teal-500' },
      '留连': { name: '留连', en: 'Liu Lian (Lingering)', element: '土', color: '黄色', direction: '中央', luck: '凶带小吉', meaning: '拖延、纠缠', desc: '卒未归时', modern: '需等待，防小人阻碍', gradient: 'from-amber-400 to-yellow-500' },
      '速喜': { name: '速喜', en: 'Su Xi (Swift Joy)', element: '火', color: '红色', direction: '南方', luck: '吉', meaning: '快速、喜讯', desc: '人即至时', modern: '时机转瞬，行动要果断', gradient: 'from-rose-400 to-red-500' },
      '赤口': { name: '赤口', en: 'Chi Kou (Red Mouth)', element: '金', color: '白色', direction: '西方', luck: '凶', meaning: '口舌、是非', desc: '官事凶时', modern: '慎言行，易有冲突', gradient: 'from-slate-300 to-gray-400' },
      '小吉': { name: '小吉', en: 'Xiao Ji (Small Fortune)', element: '水', color: '黑/蓝色', direction: '北方', luck: '吉', meaning: '小利、助力', desc: '人来喜时', modern: '得人相助，小事可成', gradient: 'from-blue-400 to-indigo-500' },
      '空亡': { name: '空亡', en: 'Kong Wang (Emptiness)', element: '无', color: '灰色', direction: '四隅', luck: '凶', meaning: '落空、无果', desc: '音信稀时', modern: '事难成，需重新谋划', gradient: 'from-gray-400 to-slate-500' },
    },
    hours: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    hourRanges: ['23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00', '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'],
    months: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'],
    days: ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'],
    historyText: '小六壬起始于唐代，由著名天文学家、术数大师李淳风所创。他将天干地支的历法与占卜相结合，创造了一种简单易行的占卜法。在干支纪时系统中，"壬"代表阳水，象征万物开始和生命孕育。在六十甲子循环中，壬干对应六个组合，称为"六壬"。小六壬以快速、便携、易学著称，常用于日常琐事的吉凶判断，3秒即可成卦，无需任何工具。',
    southernText: '南半球运用小六壬需考虑季节颠倒和能量场差异。基础版采用月份+6的简易换算；高级版则根据当地物候现象（如树木落叶、气温变化）直接判断能量月，准确率可达90%以上。方位上，速喜指向赤道方向（热源），小吉指向极地方向（冷源）。',
    australiaNote: '澳洲月份已调整',
  },
  en: {
    title: 'Xiao Liu Ren Divination',
    subtitle: 'This divination operates on a Two-Hour Energy Cycle',
    regionChina: 'China',
    regionJapan: 'Japan',
    regionAustralia: 'Australia',
    regionGermany: 'Germany',
    today: 'Today',
    currentHour: 'Current Hour',
    allHours: 'Current Hour',
    sixGodsExplain: 'Six Spirits Guide',
    history: 'Historical Origins',
    southernHemisphere: 'Southern Hemisphere Application',
    melbourneTable: 'Australian Southern Hemisphere Energy Month Table',
    element: 'Element',
    color: 'Color',
    direction: 'Direction',
    luck: 'Fortune',
    meaning: 'Meaning',
    modernTip: 'Modern Interpretation',
    calculation: 'Calculation Process',
    basicVersion: 'Basic: Month + 6',
    advancedVersion: 'Advanced: Phenology Energy',
    month: 'Month',
    phenology: 'Phenology Signs',
    energyMonth: 'Energy Month*',
    actionTip: 'Action Guidance',
    gods: {
      '大安': { name: 'Great Peace', element: 'Wood', color: 'Cyan/Green', direction: 'East', luck: 'Auspicious', meaning: 'Stability, Success', desc: 'The energy suggests stillness and harmony', modern: 'Environments aligned: calm, stable, grounded spaces', gradient: 'from-emerald-400 to-teal-500' },
      '留连': { name: 'Lingering', element: 'Earth', color: 'Yellow', direction: 'Center', luck: 'Mixed', meaning: 'Waiting, Patience', desc: 'The energy suggests delay and contemplation', modern: 'Patience is required; revisit later', gradient: 'from-amber-400 to-yellow-500' },
      '速喜': { name: 'Swift Joy', element: 'Fire', color: 'Red', direction: 'South', luck: 'Auspicious', meaning: 'Speed, Good News', desc: 'The energy suggests swift, favorable movement', modern: 'Decisive and swift actions are supported', gradient: 'from-rose-400 to-red-500' },
      '赤口': { name: 'Conflict', element: 'Metal', color: 'White', direction: 'West', luck: 'Inauspicious', meaning: 'Disputes, Tension', desc: 'The energy suggests friction and discord', modern: 'Avoid confrontations; practice caution with words', gradient: 'from-slate-300 to-gray-400' },
      '小吉': { name: 'Minor Fortune', element: 'Water', color: 'Black/Blue', direction: 'North', luck: 'Auspicious', meaning: 'Small gains, Assistance', desc: 'The energy suggests gentle blessing and support', modern: 'Subtle opportunities; seek quiet, reflective spaces', gradient: 'from-blue-400 to-indigo-500' },
      '空亡': { name: 'The Void', element: 'None', color: 'Gray', direction: 'Corners', luck: 'Inauspicious', meaning: 'Emptiness, Uncertainty', desc: 'The energy suggests absence and ambiguity', modern: 'Unfavorable timing; consider postponing', gradient: 'from-gray-400 to-slate-500' },
    },
    hours: ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'],
    hourRanges: ['23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00', '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'],
    hourRanges24: ['00:00-02:00', '02:00-04:00', '04:00-06:00', '06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00'],
    months: ['1st Month', '2nd Month', '3rd Month', '4th Month', '5th Month', '6th Month', '7th Month', '8th Month', '9th Month', '10th Month', '11th Month', '12th Month'],
    days: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    historyText: 'Xiao Liu Ren originated in the Tang Dynasty, created by the renowned astronomer and divination master Li Chunfeng. This ancient system uses the flow of time and cosmic energy to reveal guidance for daily matters. Based on the traditional lunar calendar and the cycle of elemental forces, each two-hour period carries a unique energy signature. The method is prized for its elegance and accessibility — a reading takes only moments, requiring no tools beyond awareness of the present moment.',
    southernText: 'Using Xiao Liu Ren in the Southern Hemisphere requires considering reversed seasons and energy field differences. The basic version uses a simple Month+6 conversion; the advanced version determines the energy month directly from local phenology (tree leaf fall, temperature changes), achieving over 90% accuracy. Direction-wise, Su Xi points toward the equator (heat source), Xiao Ji points toward the pole (cold source).',
    australiaNote: 'Australia month adjusted',
  },
  ja: {
    title: '小六壬占い',
    subtitle: '唐代の李淳風による六壬時課',
    regionChina: '中国',
    regionJapan: '日本',
    regionAustralia: '豪州',
    regionGermany: 'ドイツ',
    today: '本日',
    currentHour: '現在の時刻',
    allHours: '現在の時刻',
    sixGodsExplain: '六神詳解',
    history: '歴史と由来',
    southernHemisphere: '南半球での応用',
    melbourneTable: 'オーストラリア南半球エネルギー月表',
    element: '五行',
    color: '色',
    direction: '方位',
    luck: '吉凶',
    meaning: '意味',
    modernTip: '現代的解釈',
    calculation: '計算過程',
    basicVersion: '基本版：月＋6',
    advancedVersion: '高級版：物候エネルギー',
    month: '月',
    phenology: '物候の特徴',
    energyMonth: 'エネルギー月*',
    actionTip: '行動の指針',
    gods: {
      '大安': { name: '大安', element: '木', color: '青/緑', direction: '東', luck: '吉', meaning: '安定・順調', desc: '身動かぬ時', modern: '守りの姿勢が吉、事態は安定', gradient: 'from-emerald-400 to-teal-500' },
      '留连': { name: '留連', element: '土', color: '黄', direction: '中央', luck: '凶に小吉', meaning: '遅延・停滞', desc: '未だ帰らぬ時', modern: '待機が必要、小人に注意', gradient: 'from-amber-400 to-yellow-500' },
      '速喜': { name: '速喜', element: '火', color: '赤', direction: '南', luck: '吉', meaning: '迅速・吉報', desc: '人来たる時', modern: '好機は一瞬、果断な行動を', gradient: 'from-rose-400 to-red-500' },
      '赤口': { name: '赤口', element: '金', color: '白', direction: '西', luck: '凶', meaning: '口論・是非', desc: '官事凶時', modern: '言動に注意、衝突の恐れ', gradient: 'from-slate-300 to-gray-400' },
      '小吉': { name: '小吉', element: '水', color: '黒/青', direction: '北', luck: '吉', meaning: '小利・助力', desc: '人来たりて喜ぶ時', modern: '人の助けあり、小事は成る', gradient: 'from-blue-400 to-indigo-500' },
      '空亡': { name: '空亡', element: '無', color: '灰', direction: '四隅', luck: '凶', meaning: '空振り・無果', desc: '音信稀なる時', modern: '成就困難、再考が必要', gradient: 'from-gray-400 to-slate-500' },
    },
    hours: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    hourRanges: ['23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00', '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'],
    months: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    days: ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'],
    historyText: '小六壬は唐代に起源を持ち、著名な天文学者・術数の大家である李淳風によって創られました。彼は天干地支の暦法と占いを組み合わせ、簡単で実用的な占術を編み出しました。干支紀時の体系において「壬」は陽水を表し、万物の始まりと生命の孕みを象徴します。六十甲子の循環において、壬干は六つの組み合わせに対応し、「六壬」と呼ばれています。小六壬は迅速・携帯性・習得のしやすさで知られ、日常の吉凶判断に用いられ、3秒で卦を得ることができ、道具は一切不要です。',
    southernText: '南半球で小六壬を用いる際は、季節の逆転とエネルギー場の差異を考慮する必要があります。基本版は月＋6の簡易換算を採用。高級版は現地の物候現象（落葉、気温変化など）から直接エネルギー月を判断し、90%以上の精度を達成。方位については、速喜は赤道方向（熱源）を、小吉は極地方向（冷源）を指します。',
    australiaNote: '豪州月調整済み',
  },
  de: {
    title: 'Xiao Liu Ren Wahrsagung',
    subtitle: 'Tang-Dynastie Li Chunfeng Zeitkurs',
    regionChina: 'China',
    regionJapan: 'Japan',
    regionAustralia: 'Australien',
    regionGermany: 'Deutschland',
    today: 'Heute',
    currentHour: 'Aktuelle Stunde',
    allHours: 'Aktuelle Stunde',
    sixGodsExplain: 'Sechs Geister Erklärung',
    history: 'Historische Ursprünge',
    southernHemisphere: 'Südhalbkugel Anwendung',
    melbourneTable: 'Australien Südhalbkugel Energie-Monat Tabelle',
    element: 'Element',
    color: 'Farbe',
    direction: 'Richtung',
    luck: 'Glück',
    meaning: 'Bedeutung',
    modernTip: 'Moderne Interpretation',
    calculation: 'Berechnungsprozess',
    basicVersion: 'Basis: Monat + 6',
    advancedVersion: 'Erweitert: Phänologie Energie',
    month: 'Monat',
    phenology: 'Phänologie Zeichen',
    energyMonth: 'Energie-Monat*',
    actionTip: 'Handlungsanleitung',
    gods: {
      '大安': { name: 'Großer Friede', element: 'Holz', color: 'Cyan/Grün', direction: 'Osten', luck: 'Günstig', meaning: 'Stabilität, Erfolg', desc: 'Die Energie deutet auf Ruhe und Harmonie', modern: 'Ruhige, stabile Umgebungen sind förderlich', gradient: 'from-emerald-400 to-teal-500' },
      '留连': { name: 'Verweilen', element: 'Erde', color: 'Gelb', direction: 'Zentrum', luck: 'Gemischt', meaning: 'Warten, Geduld', desc: 'Die Energie deutet auf Verzögerung und Besinnung', modern: 'Geduld erforderlich; später erneut versuchen', gradient: 'from-amber-400 to-yellow-500' },
      '速喜': { name: 'Schnelle Freude', element: 'Feuer', color: 'Rot', direction: 'Süden', luck: 'Günstig', meaning: 'Geschwindigkeit, Gute Nachricht', desc: 'Die Energie deutet auf schnelle, günstige Bewegung', modern: 'Entschlossenes, schnelles Handeln wird unterstützt', gradient: 'from-rose-400 to-red-500' },
      '赤口': { name: 'Konflikt', element: 'Metall', color: 'Weiß', direction: 'Westen', luck: 'Ungünstig', meaning: 'Streit, Spannung', desc: 'Die Energie deutet auf Reibung und Zwietracht', modern: 'Konfrontationen vermeiden; Vorsicht mit Worten', gradient: 'from-slate-300 to-gray-400' },
      '小吉': { name: 'Kleines Glück', element: 'Wasser', color: 'Schwarz/Blau', direction: 'Norden', luck: 'Günstig', meaning: 'Kleine Gewinne, Hilfe', desc: 'Die Energie deutet auf sanften Segen und Unterstützung', modern: 'Subtile Gelegenheiten; ruhige, reflektierende Räume suchen', gradient: 'from-blue-400 to-indigo-500' },
      '空亡': { name: 'Die Leere', element: 'Keine', color: 'Grau', direction: 'Ecken', luck: 'Ungünstig', meaning: 'Leere, Ungewissheit', desc: 'Die Energie deutet auf Abwesenheit und Mehrdeutigkeit', modern: 'Ungünstiger Zeitpunkt; Verschiebung erwägen', gradient: 'from-gray-400 to-slate-500' },
    },
    hours: ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'],
    hourRanges: ['23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00', '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'],
    months: ['1. Monat', '2. Monat', '3. Monat', '4. Monat', '5. Monat', '6. Monat', '7. Monat', '8. Monat', '9. Monat', '10. Monat', '11. Monat', '12. Monat'],
    days: Array.from({ length: 30 }, (_, i) => `Tag ${i + 1}`),
    historyText: 'Xiao Liu Ren entstand in der Tang-Dynastie und wurde vom berühmten Astronomen und Wahrsagemeister Li Chunfeng geschaffen. Dieses alte System nutzt den Fluss von Zeit und kosmischer Energie, um Führung für alltägliche Angelegenheiten zu enthüllen. Basierend auf dem traditionellen Mondkalender und dem Zyklus der elementaren Kräfte trägt jede Zwei-Stunden-Periode eine einzigartige Energiesignatur.',
    southernText: 'Die Verwendung von Xiao Liu Ren auf der Südhalbkugel erfordert die Berücksichtigung umgekehrter Jahreszeiten und Energiefeldunterschiede. Die Basisversion verwendet eine einfache Monat+6 Umrechnung; die erweiterte Version bestimmt den Energiemonat direkt aus lokaler Phänologie.',
    australiaNote: 'Australien Monat angepasst',
  }
};

// 墨尔本能量月表
// 寻物数据
type I18nText = { zh: string; en: string; ja: string; de: string };
type I18nTextArr = { zh: string[]; en: string[]; ja: string[]; de: string[] };

// 辅助函数：根据语言选择文本
function getText(data: I18nText, lang: Lang): string {
  return data[lang] || data.en;
}
function getTextArr(data: I18nTextArr, lang: Lang): string[] {
  return data[lang] || data.en;
}
const ITEM_FINDING_DATA: Record<string, { element: string; directions: I18nTextArr; locations: I18nTextArr; timing: I18nText; tips: I18nText }> = {
  '大安': { element: '木', directions: { zh: ['东方', '东南'], en: ['East', 'Southeast'], ja: ['東', '南東'], de: ['Osten', 'Südosten'] }, locations: { zh: ['家中东侧', '书房', '绿植旁', '木制家具中', '阳台'], en: ['East side of home', 'Study room', 'Near plants', 'In wooden furniture', 'Balcony'], ja: ['家の東側', '書斎', '植物の近く', '木製家具の中', 'バルコニー'], de: ['Ostseite des Hauses', 'Arbeitszimmer', 'Bei Pflanzen', 'In Holzmöbeln', 'Balkon'] }, timing: { zh: '寅卯时(3-7点)最易找到', en: 'Best found during 3-7 AM', ja: '3-7時が見つかりやすい', de: 'Am besten 3-7 Uhr' }, tips: { zh: '静心回想，物品多在原处附近', en: 'Stay calm and recall; item likely near original spot', ja: '落ち着いて思い出すこと。元の場所の近くにある可能性大', de: 'Ruhig nachdenken; wahrscheinlich am ursprünglichen Ort' } },
  '留连': { element: '土', directions: { zh: ['中央', '东北', '西南'], en: ['Center', 'Northeast', 'Southwest'], ja: ['中央', '北東', '南西'], de: ['Zentrum', 'Nordosten', 'Südwesten'] }, locations: { zh: ['客厅中央', '储物间', '杂物堆中', '地下室', '床底'], en: ['Living room center', 'Storage room', 'Among clutter', 'Basement', 'Under bed'], ja: ['リビング中央', '物置', '雑物の中', '地下室', 'ベッドの下'], de: ['Wohnzimmermitte', 'Abstellraum', 'Im Durcheinander', 'Keller', 'Unter dem Bett'] }, timing: { zh: '辰戌丑未时(7-9,19-21,1-3,13-15点)', en: '7-9AM, 7-9PM, 1-3AM, 1-3PM', ja: '7-9時, 19-21時, 1-3時, 13-15時', de: '7-9, 19-21, 1-3, 13-15 Uhr' }, tips: { zh: '可能被其他物品覆盖，仔细翻找', en: 'May be covered by other items; search carefully', ja: '他の物に覆われているかも。丁寧に探す', de: 'Möglicherweise von anderen Dingen bedeckt; sorgfältig suchen' } },
  '速喜': { element: '火', directions: { zh: ['南方', '东南'], en: ['South', 'Southeast'], ja: ['南', '南東'], de: ['Süden', 'Südosten'] }, locations: { zh: ['厨房', '电器旁', '充电处', '阳光照射处', '红色物品附近'], en: ['Kitchen', 'Near electronics', 'Charging area', 'Sunlit spots', 'Near red items'], ja: ['キッチン', '電化製品の近く', '充電場所', '日当たりの良い場所', '赤い物の近く'], de: ['Küche', 'Bei Elektronik', 'Ladebereich', 'Sonnige Stellen', 'Bei roten Gegenständen'] }, timing: { zh: '巳午时(9-13点)最易找到', en: 'Best found during 9AM-1PM', ja: '9-13時が見つかりやすい', de: 'Am besten 9-13 Uhr' }, tips: { zh: '速战速决，今日内可寻得', en: 'Act quickly; can be found today', ja: '素早く行動すれば今日中に見つかる', de: 'Schnell handeln; heute noch zu finden' } },
  '赤口': { element: '金', directions: { zh: ['西方', '西北'], en: ['West', 'Northwest'], ja: ['西', '北西'], de: ['Westen', 'Nordwesten'] }, locations: { zh: ['金属物品旁', '刀具附近', '白色物品处', '卫生间', '镜子旁'], en: ['Near metal items', 'Near cutlery', 'White item area', 'Bathroom', 'Near mirrors'], ja: ['金属の近く', '刀物の近く', '白い物の近く', '浴室', '鏡の近く'], de: ['Bei Metallgegenständen', 'Bei Besteck', 'Weiße Gegenstände', 'Bad', 'Bei Spiegeln'] }, timing: { zh: '申酉时(15-19点)', en: '3-7 PM', ja: '15-19時', de: '15-19 Uhr' }, tips: { zh: '注意尖锐物品周围，小心行事', en: 'Check around sharp objects; proceed carefully', ja: '尖った物の周りを確認、注意して', de: 'Bei scharfen Gegenständen suchen; vorsichtig sein' } },
  '小吉': { element: '水', directions: { zh: ['北方', '西北'], en: ['North', 'Northwest'], ja: ['北', '北西'], de: ['Norden', 'Nordwesten'] }, locations: { zh: ['水源附近', '卫生间', '饮水机旁', '黑色物品处', '车内'], en: ['Near water source', 'Bathroom', 'Near water dispenser', 'Near black items', 'In car'], ja: ['水場の近く', '浴室', 'ウォーターサーバーの近く', '黒い物の近く', '車内'], de: ['Bei Wasserquellen', 'Bad', 'Beim Wasserspender', 'Bei schwarzen Dingen', 'Im Auto'] }, timing: { zh: '亥子时(21-1点)', en: '9PM-1AM', ja: '21-1時', de: '21-1 Uhr' }, tips: { zh: '可能在移动过程中遗落，检查途经之处', en: 'May have dropped while moving; check your path', ja: '移動中に落としたかも。通った道を確認', de: 'Vielleicht beim Bewegen verloren; Weg überprüfen' } },
  '空亡': { element: '土', directions: { zh: ['中央'], en: ['Center'], ja: ['中央'], de: ['Zentrum'] }, locations: { zh: ['隐蔽角落', '高处', '遗忘之地', '旧物堆中'], en: ['Hidden corners', 'High places', 'Forgotten spots', 'Among old items'], ja: ['隠れた角', '高い場所', '忘れられた場所', '古い物の中'], de: ['Versteckte Ecken', 'Hohe Stellen', 'Vergessene Orte', 'Bei alten Sachen'] }, timing: { zh: '难以确定', en: 'Uncertain timing', ja: '時間不明', de: 'Unsichere Zeit' }, tips: { zh: '物品可能已不在原处，需扩大搜索范围或等待机缘', en: 'Item may have moved; expand search or wait for opportunity', ja: '別の場所に移動したかも。探索範囲を広げるか待つ', de: 'Vielleicht bewegt; Suche erweitern oder warten' } }
};

// 方位指引数据
const DIRECTION_GUIDE_DATA: Record<string, { core: I18nText; action: I18nText; goodTime: string; avoid: I18nText; gambling: { casino: I18nText; lottery: I18nText; numbers: string; color: I18nText }; melbourne: I18nTextArr }> = {
  '大安': { core: { zh: '木元素聚集区', en: 'Wood element zone', ja: '木のエネルギー場', de: 'Holz-Element-Zone' }, action: { zh: '面向东方/绿色植物', en: 'Face East / green plants', ja: '東向き/緑の植物', de: 'Nach Osten / Grünpflanzen' }, goodTime: '03:00-07:00', avoid: { zh: '西方金属区', en: 'West metal areas', ja: '西側の金属エリア', de: 'Westlicher Metallbereich' }, gambling: { casino: { zh: '靠近绿植装饰区', en: 'Near green plant decor', ja: '緑の装飾近く', de: 'Bei Grünpflanzen-Deko' }, lottery: { zh: '门口东侧', en: 'East side of entrance', ja: '入口東側', de: 'Ostseite des Eingangs' }, numbers: '3, 8, 13, 38', color: { zh: '绿色装饰区', en: 'Green decor area', ja: '緑の装飾エリア', de: 'Grüner Dekobereich' } }, melbourne: { zh: ['Crown赌场：Garden区', '公园附近彩票站', '生肖虎/兔效果+50%'], en: ['Crown Casino: Garden area', 'Lottery near parks', 'Tiger/Rabbit zodiac +50%'], ja: ['Crownカジノ:ガーデンエリア', '公園近くの宝くじ', '寅/卯年+50%'], de: ['Crown Casino: Gartenbereich', 'Lotto bei Parks', 'Tiger/Hase +50%'] } },
  '留连': { core: { zh: '土元素沉积区', en: 'Earth element zone', ja: '土のエネルギー場', de: 'Erde-Element-Zone' }, action: { zh: '保持原位/中央位置', en: 'Stay put / central position', ja: 'その場に留まる/中央', de: 'Bleiben / zentrale Position' }, goodTime: '07:00-09:00, 13:00-15:00', avoid: { zh: '频繁移动', en: 'Frequent movement', ja: '頻繁な移動', de: 'Häufige Bewegung' }, gambling: { casino: { zh: '大厅中央机器', en: 'Central hall machines', ja: 'ホール中央の機械', de: 'Maschinen in der Hallenmitte' }, lottery: { zh: '店铺正中柜台', en: 'Center counter of shop', ja: '店中央のカウンター', de: 'Mittlerer Ladentisch' }, numbers: '5, 10, 15, 50', color: { zh: '黄色/棕色区', en: 'Yellow/brown area', ja: '黄色/茶色エリア', de: 'Gelb/Braun-Bereich' } }, melbourne: { zh: ['Crown赌场：中庭大厅', '生肖牛/龙/羊/狗效果+40%'], en: ['Crown Casino: Central atrium', 'Ox/Dragon/Goat/Dog zodiac +40%'], ja: ['Crownカジノ:中央アトリウム', '丑/辰/未/戌年+40%'], de: ['Crown Casino: Zentrales Atrium', 'Büffel/Drache/Ziege/Hund +40%'] } },
  '速喜': { core: { zh: '火元素聚集区', en: 'Fire element zone', ja: '火のエネルギー場', de: 'Feuer-Element-Zone' }, action: { zh: '面向光源/热源', en: 'Face light/heat source', ja: '光源/熱源に向かう', de: 'Richtung Licht/Wärme' }, goodTime: '09:00-13:00', avoid: { zh: '背阴潮湿处', en: 'Shaded damp places', ja: '日陰で湿った場所', de: 'Schattige feuchte Orte' }, gambling: { casino: { zh: '正对大门机器', en: 'Machines facing main door', ja: '正面入口の機械', de: 'Maschinen zum Haupteingang' }, lottery: { zh: '灯光最亮点', en: 'Brightest lit spot', ja: '最も明るい場所', de: 'Hellste Stelle' }, numbers: '3, 9, 12, 30', color: { zh: '红色装饰区', en: 'Red decor area', ja: '赤の装飾エリア', de: 'Roter Dekobereich' } }, melbourne: { zh: ['Crown赌场：Ruby Room', '天气>30℃：通风口', '生肖虎/马/狗效果+50%'], en: ['Crown Casino: Ruby Room', 'Hot weather >30°C: vents', 'Tiger/Horse/Dog zodiac +50%'], ja: ['Crownカジノ:ルビールーム', '暑い日>30°C:通風口', '寅/午/戌年+50%'], de: ['Crown Casino: Ruby Room', 'Heiß >30°C: Lüftung', 'Tiger/Pferd/Hund +50%'] } },
  '赤口': { core: { zh: '金元素锐利区', en: 'Metal element zone', ja: '金のエネルギー場', de: 'Metall-Element-Zone' }, action: { zh: '面向西方/金属物', en: 'Face West / metal objects', ja: '西向き/金属', de: 'Nach Westen / Metall' }, goodTime: '15:00-19:00', avoid: { zh: '与人争执', en: 'Arguments with others', ja: '他人との争い', de: 'Streit mit anderen' }, gambling: { casino: { zh: '金属装饰旁', en: 'Near metal decor', ja: '金属装飾の近く', de: 'Bei Metalldeko' }, lottery: { zh: '西侧窗口', en: 'West side window', ja: '西側の窓', de: 'Westfenster' }, numbers: '4, 7, 14, 49', color: { zh: '白色/银色区', en: 'White/silver area', ja: '白/銀エリア', de: 'Weiß/Silber-Bereich' } }, melbourne: { zh: ['Crown赌场：Platinum区', '谨慎投注', '生肖猴/鸡效果+40%'], en: ['Crown Casino: Platinum area', 'Bet cautiously', 'Monkey/Rooster zodiac +40%'], ja: ['Crownカジノ:プラチナエリア', '慎重に', '申/酉年+40%'], de: ['Crown Casino: Platinum', 'Vorsichtig wetten', 'Affe/Hahn +40%'] } },
  '小吉': { core: { zh: '水元素流动区', en: 'Water element zone', ja: '水のエネルギー場', de: 'Wasser-Element-Zone' }, action: { zh: '面向北方/水源', en: 'Face North / water source', ja: '北向き/水場', de: 'Nach Norden / Wasser' }, goodTime: '21:00-01:00', avoid: { zh: '干燥高温处', en: 'Dry hot places', ja: '乾燥した暑い場所', de: 'Trockene heiße Orte' }, gambling: { casino: { zh: '靠近喷泉/水景', en: 'Near fountains/water features', ja: '噴水/水景の近く', de: 'Bei Brunnen/Wasser' }, lottery: { zh: '北侧位置', en: 'North side position', ja: '北側の位置', de: 'Nordseite' }, numbers: '1, 6, 11, 16', color: { zh: '黑色/蓝色区', en: 'Black/blue area', ja: '黒/青エリア', de: 'Schwarz/Blau-Bereich' } }, melbourne: { zh: ['Crown赌场：Water Bar', '雨天效果+30%', '生肖鼠/猪效果+50%'], en: ['Crown Casino: Water Bar', 'Rainy days +30%', 'Rat/Pig zodiac +50%'], ja: ['Crownカジノ:ウォーターバー', '雨の日+30%', '子/亥年+50%'], de: ['Crown Casino: Water Bar', 'Regentage +30%', 'Ratte/Schwein +50%'] } },
  '空亡': { core: { zh: '能量空虚区', en: 'Void energy zone', ja: '空虚のエネルギー', de: 'Leere Energie-Zone' }, action: { zh: '静待时机/不宜行动', en: 'Wait / not ideal for action', ja: '待つ/行動に不向き', de: 'Warten / nicht handeln' }, goodTime: '-', avoid: { zh: '重大决策', en: 'Major decisions', ja: '重要な決定', de: 'Große Entscheidungen' }, gambling: { casino: { zh: '不建议', en: 'Not recommended', ja: '非推奨', de: 'Nicht empfohlen' }, lottery: { zh: '暂缓购买', en: 'Delay purchase', ja: '購入延期', de: 'Kauf verschieben' }, numbers: '-', color: { zh: '无', en: 'None', ja: 'なし', de: 'Keine' } }, melbourne: { zh: ['建议休息', '等待下一时辰', '可做准备工作'], en: ['Rest advised', 'Wait for next hour', 'Prepare for later'], ja: ['休憩推奨', '次の時間を待つ', '準備をする'], de: ['Ruhe empfohlen', 'Nächste Stunde warten', 'Später vorbereiten'] } }
};

// 财运指引数据
const WEALTH_GUIDE_DATA: Record<string, { investment: I18nTextArr; method: I18nTextArr; avoid: I18nTextArr; zodiacBoost: I18nTextArr }> = {
  '大安': { investment: { zh: ['稳健型：稳步行事', '适合保守投资', '时间窗口：当日有效', '金额比例：资金50%'], en: ['Steady approach', 'Conservative investment', 'Time window: Today', 'Amount: 50% of funds'], ja: ['安定型', '保守的な投資', '有効期間：今日', '資金50%'], de: ['Stabiler Ansatz', 'Konservative Investition', 'Zeitfenster: Heute', 'Betrag: 50%'] }, method: { zh: ['携带绿色物品', '上午5-7点行动', '面向东方默念愿望', '选择木质摆件'], en: ['Carry green items', 'Act 5-7 AM', 'Face East and make wishes', 'Choose wooden ornaments'], ja: ['緑の物を持つ', '5-7時に行動', '東向きで願う', '木製の置物を選ぶ'], de: ['Grüne Gegenstände tragen', 'Um 5-7 Uhr handeln', 'Nach Osten wünschen', 'Holzornamente wählen'] }, avoid: { zh: ['属猴、鸡者同行', '金属首饰过多'], en: ['Avoid Monkey/Rooster companions', 'Too much metal jewelry'], ja: ['申/酉年の人を避ける', '金属アクセサリーは控えめに'], de: ['Affe/Hahn-Partner meiden', 'Wenig Metallschmuck'] }, zodiacBoost: { zh: ['生肖虎/兔效果+50%', '生肖蛇/马效果+30%'], en: ['Tiger/Rabbit zodiac +50%', 'Snake/Horse zodiac +30%'], ja: ['寅/卯年+50%', '巳/午年+30%'], de: ['Tiger/Hase +50%', 'Schlange/Pferd +30%'] } },
  '留连': { investment: { zh: ['稳定型：保本为主', '不急于出手', '时间窗口：一个时辰内观望', '金额比例：资金20%'], en: ['Stable type: Preserve capital', 'No rush to act', 'Time window: Observe within 2 hours', 'Amount: 20% of funds'], ja: ['安定型：元本確保', '急がない', '有効期間：2時間以内', '資金20%'], de: ['Stabil: Kapital erhalten', 'Nicht hetzen', 'Zeitfenster: 2 Stunden', 'Betrag: 20%'] }, method: { zh: ['保持耐心等待', '不急于出手', '中央位置办公', '黄色系衣物'], en: ['Stay patient', "Don't rush", 'Work from center position', 'Wear yellow clothes'], ja: ['忍耐強く', '急がない', '中央で仕事', '黄色の服'], de: ['Geduldig bleiben', 'Nicht hetzen', 'Zentral arbeiten', 'Gelb tragen'] }, avoid: { zh: ['频繁操作', '属鼠、猪者同行'], en: ['Frequent trading', 'Avoid Rat/Pig companions'], ja: ['頻繁な取引', '子/亥年の人を避ける'], de: ['Häufiges Handeln', 'Ratte/Schwein-Partner meiden'] }, zodiacBoost: { zh: ['生肖牛/龙/羊/狗效果+40%'], en: ['Ox/Dragon/Goat/Dog zodiac +40%'], ja: ['丑/辰/未/戌年+40%'], de: ['Büffel/Drache/Ziege/Hund +40%'] } },
  '速喜': { investment: { zh: ['短线操作：快进快出', '即时见效类型', '时间窗口：一个时辰内（约2小时）', '金额比例：资金30%'], en: ['Short-term: Quick in/out', 'Immediate results type', 'Time window: Within 2 hours', 'Amount: 30% of funds'], ja: ['短期：素早く', '即效タイプ', '有効期間：2時間以内', '資金30%'], de: ['Kurzfristig: Schnell rein/raus', 'Sofortige Ergebnisse', 'Zeitfenster: 2 Stunden', 'Betrag: 30%'] }, method: { zh: ['携带红色物品', '上午9-11点行动', '面向南方默念愿望', '速战速决'], en: ['Carry red items', 'Act 9-11 AM', 'Face South and make wishes', 'Act decisively'], ja: ['赤い物を持つ', '9-11時に行動', '南向きで願う', '素早く決断'], de: ['Rote Gegenstände tragen', 'Um 9-11 Uhr handeln', 'Nach Süden wünschen', 'Entschlossen handeln'] }, avoid: { zh: ['属鼠、猪者同行', '犹豫不决'], en: ['Avoid Rat/Pig companions', 'Hesitation'], ja: ['子/亥年の人を避ける', '迷い'], de: ['Ratte/Schwein-Partner meiden', 'Zögern'] }, zodiacBoost: { zh: ['生肖虎/马/狗效果+50%', '生肖蛇效果+40%'], en: ['Tiger/Horse/Dog zodiac +50%', 'Snake zodiac +40%'], ja: ['寅/午/戌年+50%', '巳年+40%'], de: ['Tiger/Pferd/Hund +50%', 'Schlange +40%'] } },
  '赤口': { investment: { zh: ['谨慎观望为主', '避免大额投入', '时间窗口：观望为主', '金额比例：资金10%'], en: ['Observe cautiously', 'Avoid large investments', 'Time window: Observe mainly', 'Amount: 10% of funds'], ja: ['慎重に観察', '大きな投資を避ける', '有効期間：観察中心', '資金10%'], de: ['Vorsichtig beobachten', 'Große Investitionen meiden', 'Zeitfenster: Beobachten', 'Betrag: 10%'] }, method: { zh: ['佩戴金属饰品', '下午3-5点行动', '面向西方', '独自决策'], en: ['Wear metal accessories', 'Act 3-5 PM', 'Face West', 'Decide alone'], ja: ['金属アクセサリーをつける', '15-17時に行動', '西向き', '一人で決める'], de: ['Metallschmuck tragen', 'Um 15-17 Uhr handeln', 'Nach Westen', 'Allein entscheiden'] }, avoid: { zh: ['与人合作投资', '口舌之争'], en: ['Joint investments', 'Arguments'], ja: ['共同投資', '言い争い'], de: ['Gemeinsame Investitionen', 'Streit'] }, zodiacBoost: { zh: ['生肖猴/鸡效果+40%', '单独行动更佳'], en: ['Monkey/Rooster zodiac +40%', 'Solo action is better'], ja: ['申/酉年+40%', '単独行動が良い'], de: ['Affe/Hahn +40%', 'Allein besser'] } },
  '小吉': { investment: { zh: ['顺势而为', '小额分散投资', '时间窗口：当日有效', '金额比例：资金25%'], en: ['Go with the flow', 'Small diversified investments', 'Time window: Today', 'Amount: 25% of funds'], ja: ['流れに乗る', '少額分散投資', '有効期間：今日', '資金25%'], de: ['Mit dem Strom gehen', 'Kleine diversifizierte Investitionen', 'Zeitfenster: Heute', 'Betrag: 25%'] }, method: { zh: ['携带蓝色/黑色物品', '晚上9-11点行动', '面向北方默念愿望', '顺势而为'], en: ['Carry blue/black items', 'Act 9-11 PM', 'Face North and make wishes', 'Follow the flow'], ja: ['青/黒の物を持つ', '21-23時に行動', '北向きで願う', '流れに乗る'], de: ['Blau/schwarz tragen', 'Um 21-23 Uhr handeln', 'Nach Norden wünschen', 'Dem Fluss folgen'] }, avoid: { zh: ['属蛇、马者同行', '高温环境决策'], en: ['Avoid Snake/Horse companions', 'Hot environment decisions'], ja: ['巳/午年の人を避ける', '暑い環境での決定'], de: ['Schlange/Pferd-Partner meiden', 'Entscheidungen bei Hitze'] }, zodiacBoost: { zh: ['生肖鼠/猪效果+50%'], en: ['Rat/Pig zodiac +50%'], ja: ['子/亥年+50%'], de: ['Ratte/Schwein +50%'] } },
  '空亡': { investment: { zh: ['暂不投资', '整理现有资产', '时间窗口：等待时机', '金额比例：0%'], en: ['No investment now', 'Organize current assets', 'Time window: Wait', 'Amount: 0%'], ja: ['今は投資しない', '現有資産を整理', '有効期間：待機', '資金0%'], de: ['Jetzt nicht investieren', 'Aktuelle Anlagen ordnen', 'Zeitfenster: Warten', 'Betrag: 0%'] }, method: { zh: ['休息调整', '学习研究', '为下次做准备', '反思总结'], en: ['Rest and adjust', 'Study and research', 'Prepare for next time', 'Reflect and summarize'], ja: ['休憩と調整', '学び研究', '次の準備', '振り返り'], de: ['Ruhen und anpassen', 'Studieren und forschen', 'Nächstes Mal vorbereiten', 'Reflektieren'] }, avoid: { zh: ['任何重大投资', '冲动消费'], en: ['Any major investment', 'Impulse spending'], ja: ['大きな投資', '衝動購入'], de: ['Große Investitionen', 'Impulskäufe'] }, zodiacBoost: { zh: ['任何生肖效果均减半', '建议静待'], en: ['All zodiac effects halved', 'Wait advised'], ja: ['全干支効果半減', '待機推奨'], de: ['Alle Tierkreis-Effekte halbiert', 'Warten empfohlen'] } }
};

const MELBOURNE_TABLE = [
  { month: 1, phenologyZh: '桉树皮脱落、沥青融化', phenologyEn: 'Eucalyptus bark shedding, asphalt melting', energyZh: '五月（火）', energyEn: '5th Month (Fire)', tipZh: '速喜向热光', tipEn: 'Su Xi - seek heat/light' },
  { month: 2, phenologyZh: '草坪枯黄如毯', phenologyEn: 'Lawns brown like carpet', energyZh: '五月（火）', energyEn: '5th Month (Fire)', tipZh: '赤口避西晒', tipEn: 'Chi Kou - avoid west sun' },
  { month: 3, phenologyZh: '枫叶初红、气温20-25℃', phenologyEn: 'Maple leaves turning red, 20-25°C', energyZh: '正月（木）', energyEn: '1st Month (Wood)', tipZh: '大安定中堂', tipEn: 'Da An - stay centered' },
  { month: 4, phenologyZh: '橡树落叶封路、晨雾锁城', phenologyEn: 'Oak leaves blocking roads, morning fog', energyZh: '八月（金）', energyEn: '8th Month (Metal)', tipZh: '赤口查锐器', tipEn: 'Chi Kou - check sharp objects' },
  { month: 5, phenologyZh: '首霜染白丹德农山', phenologyEn: 'First frost whitens Dandenong', energyZh: '十一月（水）', energyEn: '11th Month (Water)', tipZh: '小吉寻暗潮', tipEn: 'Xiao Ji - seek dark/damp' },
  { month: 6, phenologyZh: '冬季开始、频繁降雨、市区罕见霜冻', phenologyEn: 'Winter begins, frequent rain, rare frost in city', energyZh: '十一月（水）', energyEn: '11th Month (Water)', tipZh: '小吉查浴室水槽', tipEn: 'Xiao Ji - check bathroom/kitchen sink' },
  { month: 7, phenologyZh: '严寒多雨、山区降雪、市区晨霜', phenologyEn: 'Severe cold and rain, mountain snow, city morning frost', energyZh: '十一月（水）', energyEn: '11th Month (Water)', tipZh: '空亡：高处衣柜/闲置外套口袋', tipEn: 'Kong Wang - high closet/unused coat pockets' },
  { month: 8, phenologyZh: '山茶花破霜绽放', phenologyEn: 'Camellias blooming through frost', energyZh: '正月（木）', energyEn: '1st Month (Wood)', tipZh: '小吉问新芽', tipEn: 'Xiao Ji - look near new growth' },
  { month: 9, phenologyZh: '花粉云笼罩全城', phenologyEn: 'Pollen clouds over city', energyZh: '正月（木）', energyEn: '1st Month (Wood)', tipZh: '大安守旧位', tipEn: 'Da An - check usual places' },
  { month: 10, phenologyZh: '玫瑰抽新枝、春雨猝至', phenologyEn: 'Roses sprouting, sudden spring rain', energyZh: '正月（木）', energyEn: '1st Month (Wood)', tipZh: '留连验湿衣', tipEn: 'Liu Lian - check wet clothes' },
  { month: 11, phenologyZh: '梧桐飞絮迷眼、突发热浪', phenologyEn: 'Plane tree fluff, sudden heatwave', energyZh: '五月（火）', energyEn: '5th Month (Fire)', tipZh: '速喜查风口', tipEn: 'Su Xi - check vents' },
  { month: 12, phenologyZh: '紫外线极强、桉叶焦卷', phenologyEn: 'Extreme UV, eucalyptus leaves curling', energyZh: '五月（火）', energyEn: '5th Month (Fire)', tipZh: '赤口远钢架', tipEn: 'Chi Kou - avoid metal structures' },
];

// 从某个神起数N步，返回落在哪个神（索引0-5）
function countSteps(startIndex: number, steps: number): number {
  return (startIndex + steps - 1) % 6;
}

// 计算六神 - 逐层起卦法
function calculateGod(month: number, day: number, hour: number, isAustralia: boolean = false): { monthGod: number; dayGod: number; hourGod: number } {
  // hour 是 0-11 索引，转换为 1-12（子时=1，丑时=2...）
  const hourValue = hour + 1;
  
  // 确定起始位置
  let startIndex = 0; // 大安(0)
  if (isAustralia) {
    // 澳洲：从大安数6格=空亡(5)
    startIndex = countSteps(0, 6); // = 5 (空亡)
  }
  
  // 月盘：从起始位置起，数农历月份
  const monthGod = countSteps(startIndex, month);
  // 日盘：从月结果起，数农历日期
  const dayGod = countSteps(monthGod, day);
  // 时盘：从日结果起，数时辰
  const hourGod = countSteps(dayGod, hourValue);
  
  return { monthGod, dayGod, hourGod };
}

// 获取当地时间
function getLocalTime(region: Region): Date {
  const now = new Date();
  const timeZones: Record<Region, string> = {
    china: 'Asia/Shanghai',
    japan: 'Asia/Tokyo',
    germany: 'Europe/Berlin',
    australia: 'Australia/Melbourne'
  };
  return new Date(now.toLocaleString('en-US', { timeZone: timeZones[region] }));
}

// 获取当前时辰索引
function getCurrentHourIndex(region: Region): number {
  const hour = getLocalTime(region).getHours();
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

// 方位角度映射
const DIRECTION_ANGLES: Record<string, number> = { '东方': 90, 'East': 90, '南方': 180, 'South': 180, '西方': 270, 'West': 270, '北方': 0, 'North': 0, '中央': -1, 'Center': -1, '四隅': -1, 'Corners': -1 };

export default function App() {
  // 语言自动检测
  const [lang, setLang] = useState<Lang>(() => {
    const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
    if (browserLang.startsWith('zh')) return 'zh';
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('de')) return 'de';
    return 'en';
  });
  const [region, setRegion] = useState<Region>(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    // 澳洲时区自动选择澳洲版
    return tz.includes('Australia') ? 'australia' : 'china';
  });
  const [darkMode, setDarkMode] = useState(false);
  const [bgImage, setBgImage] = useState<string>('');
  const [rotating, setRotating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  
  // 生肖分析状态
  const [birthYear, setBirthYear] = useState(1990);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(15);
  const [zodiacResult, setZodiacResult] = useState<{ zodiac: Zodiac; lunarYear: number; isBeforeNewYear: boolean } | null>(null);
  
  // 音乐控制状态
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const advancedRef = useRef<HTMLDivElement>(null);
  
  // 滚动到高级版
  const scrollToAdvanced = () => {
    advancedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  // 防止复制保护
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // 音乐播放控制
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, volume]);

  // 背景图：中国用山水画，澳洲每日轮换世界著名风景
  useEffect(() => {
    if (region === 'china') {
      setBgImage('/bg-china.jpg');
    } else {
      // 澳洲版：每日轮换空旷空灵风景
      const worldScenes = [
        '/backgrounds/lighthouse-blue-flowers.jpg',    // 蓝白灯塔紫花海
        '/backgrounds/lighthouse-sunset-glow.jpg',     // 日落灯塔
        '/backgrounds/lighthouse-pink-rocks.jpg',      // 粉紫天空灯塔
        '/backgrounds/french-castle-reflection.jpg',   // 法国城堡倒影
        '/backgrounds/italian-lake-town.jpg',          // 意大利湖畔小镇
        '/backgrounds/scotland-highland-road.jpg',     // 苏格兰高地
        '/backgrounds/green-rolling-hills.jpg',        // 摩拉维亚田野
      ];
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const todayIndex = dayOfYear % worldScenes.length;
      setBgImage(worldScenes[todayIndex]);
    }
  }, [region]);

  const t = i18n[lang];

  // 获取农历（根据地区时区计算）
  const lunarData = useMemo(() => {
    const localTime = getLocalTime(region);
    const solar = Solar.fromDate(localTime);
    const lunar = solar.getLunar();
    const month = lunar.getMonth();
    const day = lunar.getDay();
    const hourIndex = getCurrentHourIndex(region);
    // 澳洲显示月份 = (中国月份 + 6) % 12，0则取12
    const displayMonth = region === 'australia' ? ((month + 6 - 1) % 12) + 1 : month;
    return { month, day, hourIndex, lunar, solar, localTime, displayMonth };
  }, [region]);

  // 计算当前时辰结果
  const currentResult = useMemo(() => {
    const isAustralia = region === 'australia';
    const { monthGod, dayGod, hourGod } = calculateGod(lunarData.month, lunarData.day, lunarData.hourIndex, isAustralia);
    return { monthGod, dayGod, hourGod, god: SIX_GODS[hourGod] };
  }, [lunarData, region]);

  // 计算所有时辰结果
  const allHourResults = useMemo(() => {
    const isAustralia = region === 'australia';
    return Array.from({ length: 12 }, (_, i) => {
      const { hourGod } = calculateGod(lunarData.month, lunarData.day, i, isAustralia);
      return SIX_GODS[hourGod];
    });
  }, [lunarData, region]);

  // 方位处理（澳洲反转南北）
  const getDirection = (dir: string) => {
    if (region === 'australia') {
      if (dir === '南方' || dir === 'South') return lang === 'zh' || lang === 'ja' ? '北方' : 'North';
      if (dir === '北方' || dir === 'North') return lang === 'zh' || lang === 'ja' ? '南方' : 'South';
    }
    return dir;
  };

  useEffect(() => {
    setRotating(true);
    setTimeout(() => setRotating(false), 2000);
  }, [region]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const godInfo = t.gods[currentResult.god];
  const direction = getDirection(godInfo.direction);
  const dirAngle = DIRECTION_ANGLES[direction] ?? -1;

  return (
    <div className={`min-h-screen transition-colors duration-500 relative ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} translate="no">
      {/* Windows 11 风格风景背景 */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url("${bgImage || (region === 'australia' ? '/bg-australia.jpg' : '/bg-china.jpg')}")`,
            filter: darkMode ? 'brightness(0.4) saturate(1.2)' : 'brightness(0.95) saturate(1.3)'
          }} 
        />
        <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-b from-black/40 via-transparent to-black/60' : 'bg-gradient-to-b from-white/20 via-transparent to-white/30'}`} />
      </div>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl ${darkMode ? 'bg-gray-900/70 border-gray-700/50' : 'bg-white/60 border-white/30'} border-b px-4 py-3 shadow-lg`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">{t.title}</h1>
            <p className="text-sm opacity-70">{t.subtitle}</p>
          </div>
          <div className="flex gap-2 md:gap-4 items-center flex-wrap justify-end">
            <div className="flex gap-1">
              <button onClick={() => setLang('zh')} className={`px-2 py-1 rounded text-sm font-medium transition ${lang === 'zh' ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                中文
              </button>
              <button onClick={() => setLang('en')} className={`px-2 py-1 rounded text-sm font-medium transition ${lang === 'en' ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                EN
              </button>
              <button onClick={() => setLang('ja')} className={`px-2 py-1 rounded text-sm font-medium transition ${lang === 'ja' ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                日本語
              </button>
              <button onClick={() => setLang('de')} className={`px-2 py-1 rounded text-sm font-medium transition ${lang === 'de' ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                DE
              </button>
            </div>
            <select value={region} onChange={e => setRegion(e.target.value as Region)} className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-amber-300'} border`}>
              <option value="china">{t.regionChina}</option>
              <option value="japan">{t.regionJapan}</option>
              <option value="germany">{t.regionGermany}</option>
              <option value="australia">{t.regionAustralia}</option>
            </select>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-amber-100 hover:bg-amber-200'} transition`}>
              {darkMode ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 max-w-6xl mx-auto space-y-12">
        {/* 日期显示 */}
        <section className="text-center">
          <div className={`inline-block px-6 py-3 rounded-2xl ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-xl shadow-lg`}>
            <p className="text-sm opacity-70 mb-1">
              {lang === 'zh' 
                ? `${lunarData.localTime.getFullYear()}年${lunarData.localTime.getMonth() + 1}月${lunarData.localTime.getDate()}日`
                : `${String(lunarData.localTime.getDate()).padStart(2, '0')}/${String(lunarData.localTime.getMonth() + 1).padStart(2, '0')}/${lunarData.localTime.getFullYear()}`}
            </p>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              {t.months[lunarData.displayMonth - 1]} {t.days[lunarData.day - 1]} {t.hours[lunarData.hourIndex]}{lang === 'en' ? ' Hour' : '時'}
            </p>
            <p className="text-base mt-1 font-semibold" style={{ background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'cool-pulse 4s ease-in-out infinite' }}>{t.hourRanges[lunarData.hourIndex]}</p>
            <style>{`
              @keyframes cool-pulse { 0%, 100% { transform: scale(1); background-position: 0% 50%; } 50% { transform: scale(1.35); background-position: 100% 50%; } }
              @keyframes result-bounce { 
                0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); } 
                25% { transform: scale(1.15); box-shadow: 0 0 20px 10px rgba(251, 191, 36, 0.4); }
                50% { transform: scale(1.05); box-shadow: 0 0 10px 5px rgba(251, 191, 36, 0.2); }
                75% { transform: scale(1.1); box-shadow: 0 0 15px 8px rgba(251, 191, 36, 0.3); }
              }
              .animate-result-bounce { animation: result-bounce 2s ease-in-out infinite; }
            `}</style>
          </div>
        </section>

        {/* 主卡片 - 转盘和结果 */}
        <section className="grid lg:grid-cols-2 gap-8 items-start">
          {/* 转盘 */}
          <div className="flex flex-col items-center">
            <div className="relative w-80 h-80 md:w-[480px] md:h-[480px]">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                {/* 外圈装饰 */}
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={darkMode ? '#f59e0b' : '#d97706'} />
                    <stop offset="100%" stopColor={darkMode ? '#ef4444' : '#ea580c'} />
                  </linearGradient>
                  <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={darkMode ? '#000' : '#fff'} floodOpacity="0.8" />
                  </filter>
                </defs>
                {/* 半透明背景 */}
                <circle cx="200" cy="200" r="195" fill={darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)'} />
                <circle cx="200" cy="200" r="195" fill="none" stroke="url(#ringGrad)" strokeWidth="3" />
                <circle cx="200" cy="200" r="140" fill="none" stroke={darkMode ? '#475569' : '#fbbf24'} strokeWidth="2" opacity="0.6" />
                <circle cx="200" cy="200" r="85" fill="none" stroke={darkMode ? '#475569' : '#fbbf24'} strokeWidth="2" opacity="0.6" />

                {/* 月份 */}
                <g className={rotating ? 'animate-spin' : ''} style={{ transformOrigin: '200px 200px', animationDuration: '3s' }}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const angle = (i * 30 - 90) * Math.PI / 180;
                    const x = 200 + 170 * Math.cos(angle);
                    const y = 200 + 170 * Math.sin(angle);
                    const isActive = i === lunarData.month - 1;
                    // 标注位置（更外圈）
                    const labelX = 200 + 188 * Math.cos(angle);
                    const labelY = 200 + 188 * Math.sin(angle);
                    const showLabel = i === 0 || i === 11; // 正月和腊月
                    return <g key={i}>
                      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className={`text-base md:text-lg font-bold ${isActive ? 'fill-red-500' : darkMode ? 'fill-gray-200' : 'fill-gray-800'}`}>{lang === 'zh' ? ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'][i] : (i + 1)}</text>
                      {showLabel && <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" className={`text-[7px] ${darkMode ? 'fill-gray-400' : 'fill-gray-500'}`}>{lang === 'zh' ? (i === 0 ? '正月' : '腊月') : (i === 0 ? '1st Month' : '12th Month')}</text>}
                    </g>;
                  })}
                </g>

                {/* 日期 */}
                <g className={rotating ? 'animate-spin' : ''} style={{ transformOrigin: '200px 200px', animationDuration: '2s', animationDirection: 'reverse' }}>
                  {Array.from({ length: 30 }, (_, i) => {
                    const angle = (i * 12 - 90) * Math.PI / 180;
                    const x = 200 + 120 * Math.cos(angle);
                    const y = 200 + 120 * Math.sin(angle);
                    const isActive = i === lunarData.day - 1;
                    // 标注位置
                    const labelX = 200 + 135 * Math.cos(angle);
                    const labelY = 200 + 135 * Math.sin(angle);
                    return <g key={i}>
                      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className={`text-xs md:text-sm font-medium ${isActive ? 'fill-red-500 font-bold' : darkMode ? 'fill-gray-300' : 'fill-gray-700'}`}>{i + 1}</text>
                      {i === 0 && <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" className={`text-[6px] ${darkMode ? 'fill-gray-400' : 'fill-gray-500'}`}>{lang === 'zh' ? '初一' : '1st Day'}</text>}
                    </g>;
                  })}
                </g>

                {/* 时辰 */}
                <g className={rotating ? 'animate-spin' : ''} style={{ transformOrigin: '200px 200px', animationDuration: '1.5s' }}>
                  {t.hours.map((h, i) => {
                    const angle = (i * 30 - 90) * Math.PI / 180;
                    const x = 200 + 60 * Math.cos(angle);
                    const y = 200 + 60 * Math.sin(angle);
                    const isActive = i === lunarData.hourIndex;
                    return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className={`text-sm md:text-base font-bold ${isActive ? 'fill-red-500' : darkMode ? 'fill-gray-200' : 'fill-gray-800'}`}>{lang === 'zh' ? h : ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'][i]}</text>;
                  })}
                </g>
              </svg>

              {/* 中心结果 - 可点击查看高级版 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  onClick={() => { setShowPremiumModal(true); setTimeout(scrollToAdvanced, 100); }}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${godInfo.gradient} flex flex-col items-center justify-center shadow-lg shadow-current/20 border-2 border-white/30 cursor-pointer hover:scale-110 transition-transform animate-pulse`}
                  title={lang === 'zh' ? '点击查看详细解读' : lang === 'ja' ? 'クリックで詳細を見る' : lang === 'de' ? 'Klicken für Details' : 'Click for detailed reading'}
                >
                  <span className="text-sm md:text-base font-bold text-white">{lang === 'zh' ? i18n.zh.gods[currentResult.god].name : t.gods[currentResult.god].name}</span>
                <span className="text-[10px] text-white/90">{lang === 'zh' ? i18n.zh.gods[currentResult.god].luck : t.gods[currentResult.god].luck}</span>
                </div>
              </div>
            </div>
            {/* 点击提示 - 紧贴圆盘下方 */}
            <div className="text-center mt-2 text-base md:text-lg font-medium animate-fade-pulse">
              {lang === 'zh' ? '👆 点击结果查看详情 👆' : lang === 'ja' ? '👆 クリックで詳細を見る 👆' : lang === 'de' ? '👆 Klicken für Details 👆' : '👆 Click result for details 👆'}
            </div>
          </div>

          {/* 结果详情 */}
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${godInfo.gradient} text-white shadow-xl`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold">{lang === 'zh' ? i18n.zh.gods[currentResult.god].name : t.gods[currentResult.god].name}</h2>
                </div>
                {dirAngle >= 0 && (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <svg viewBox="0 0 64 64" className="w-12 h-12 md:w-16 md:h-16">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
                      <text x="32" y="10" textAnchor="middle" className="text-[8px] fill-white font-bold">N</text>
                      <text x="32" y="58" textAnchor="middle" className="text-[8px] fill-white">S</text>
                      <text x="8" y="34" textAnchor="middle" className="text-[8px] fill-white">W</text>
                      <text x="56" y="34" textAnchor="middle" className="text-[8px] fill-white">E</text>
                      <line x1="32" y1="32" x2={32 + 18 * Math.sin(dirAngle * Math.PI / 180)} y2={32 - 18 * Math.cos(dirAngle * Math.PI / 180)} stroke="white" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="32" cy="32" r="4" fill="white" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-base md:text-lg">
                <p><span className="opacity-70">{t.element}:</span> {lang === 'zh' ? godInfo.element : (t.gods[currentResult.god] as any).element}</p>
                <p><span className="opacity-70">{t.color}:</span> {lang === 'zh' ? godInfo.color : (t.gods[currentResult.god] as any).color}</p>
                <p><span className="opacity-70">{t.direction}:</span> {direction}</p>
                <p><span className="opacity-70">{t.luck}:</span> {lang === 'zh' ? godInfo.luck : (t.gods[currentResult.god] as any).luck}</p>
              </div>
              <p className="mt-4 text-lg italic opacity-90">"{lang === 'zh' ? i18n.zh.gods[currentResult.god].desc : t.gods[currentResult.god].desc}"</p>
              <p className="mt-2 text-base opacity-80">{lang === 'zh' ? i18n.zh.gods[currentResult.god].modern : t.gods[currentResult.god].modern}</p>
              <div className="mt-4 pt-4 border-t border-white/30 text-sm opacity-80">
                <p>{t.calculation}: {t.months[lunarData.month - 1]} → {lang === 'zh' ? i18n.zh.gods[SIX_GODS[currentResult.monthGod]].name : t.gods[SIX_GODS[currentResult.monthGod]].name} → {t.days[lunarData.day - 1]} → {lang === 'zh' ? i18n.zh.gods[SIX_GODS[currentResult.dayGod]].name : t.gods[SIX_GODS[currentResult.dayGod]].name} → {t.hours[lunarData.hourIndex]} → {lang === 'zh' ? i18n.zh.gods[currentResult.god].name : t.gods[currentResult.god].name}</p>
              </div>
            </div>

            {/* 今日十二时辰 */}
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800/90' : 'bg-white/95'} backdrop-blur-xl shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {lang === 'zh' ? '今日十二时辰' : 'Today\'s 12 Shichen'}
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {t.hours.map((h, i) => {
                  const god = allHourResults[i];
                  const gInfo = i18n.zh.gods[god];
                  const isCurrent = i === lunarData.hourIndex;
                  const isLucky = gInfo.luck.includes('吉');
                  const isBad = gInfo.luck === '凶';
                  
                  return (
                    <div 
                      key={i} 
                      className={`group relative p-3 rounded-xl transition-all duration-300 cursor-pointer
                        ${isCurrent 
                          ? `${darkMode ? 'bg-amber-500/20' : 'bg-amber-50'} ring-2 ring-amber-400 shadow-lg shadow-amber-500/20` 
                          : `${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-white hover:shadow-md'}`
                        }
                        ${!isCurrent && 'opacity-75 hover:opacity-100'}
                      `}
                    >
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 animate-pulse" />
                      )}
                      
                      <div className="relative flex flex-col items-center gap-1.5">
                        <span className={`text-lg font-bold ${isCurrent ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                          {h}
                        </span>
                        <span className="text-xs opacity-60">{t.hourRanges[i]}</span>
                        <div className={`mt-1 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1
                          ${isLucky 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' 
                            : isBad 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                          }`}
                        >
                          <span>{lang === 'zh' ? gInfo.name : t.gods[god].name}</span>
                          <span className="opacity-70">·</span>
                          <span>{lang === 'zh' ? gInfo.luck : t.gods[god].luck}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 六神详解表格 */}
        <section className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur shadow-lg`}>
          <h3 className="text-2xl font-bold mb-6">{t.sixGodsExplain}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className={`${darkMode ? 'bg-gray-700' : 'bg-amber-100'}`}>
                  <th className="p-3 text-left rounded-tl-lg">{lang === 'zh' ? '神煞' : 'Spirit'}</th>
                  <th className="p-3 text-left">{t.element}</th>
                  <th className="p-3 text-left">{t.direction}</th>
                  <th className="p-3 text-left">{t.luck}</th>
                  <th className="p-3 text-left">{t.meaning}</th>
                  <th className="p-3 text-left rounded-tr-lg">{t.modernTip}</th>
                </tr>
              </thead>
              <tbody>
                {SIX_GODS.map((god, i) => {
                  const info = t.gods[god];
                  return (
                    <tr key={god} className={`border-b ${darkMode ? 'border-gray-700' : 'border-amber-100'} ${i % 2 === 0 ? (darkMode ? 'bg-gray-800/50' : 'bg-amber-50/50') : ''}`}>
                      <td className="p-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-bold bg-gradient-to-r ${info.gradient}`}>
                          {lang === 'zh' ? i18n.zh.gods[god].name : info.name}
                        </span>
                      </td>
                      <td className="p-3">{lang === 'zh' ? i18n.zh.gods[god].element : info.element}</td>
                      <td className="p-3">{lang === 'zh' ? i18n.zh.gods[god].direction : info.direction}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${(lang === 'zh' ? i18n.zh.gods[god].luck : info.luck).includes(lang === 'zh' ? '吉' : 'Auspicious') ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                          {lang === 'zh' ? i18n.zh.gods[god].luck : info.luck}
                        </span>
                      </td>
                      <td className="p-3">{lang === 'zh' ? i18n.zh.gods[god].meaning : info.meaning}</td>
                      <td className="p-3 text-sm opacity-80">{lang === 'zh' ? i18n.zh.gods[god].modern : info.modern}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 历史介绍 */}
        <section className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur shadow-lg`}>
          <h3 className="text-2xl font-bold mb-4">{t.history}</h3>
          <p className="text-lg leading-relaxed opacity-90">{t.historyText}</p>
        </section>

        {/* 南半球说明 - 仅澳洲地区显示 */}
        {region === 'australia' && <section className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur shadow-lg`}>
          <h3 className="text-2xl font-bold mb-4">{t.southernHemisphere}</h3>
          <p className="text-lg leading-relaxed opacity-90 mb-6">{t.southernText}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <h4 className="font-bold text-lg mb-2 text-blue-600 dark:text-blue-400">{t.basicVersion}</h4>
              <p className="text-base opacity-80">{lang === 'zh' ? '直接将农历月份+6后取模12。例如：农历十二月 → (12+6)%12 = 6 → 取六月能量。简单快速，适合初学者。' : 'Simply add 6 to the lunar month and mod 12. Example: 12th lunar month → (12+6)%12 = 6 → Use 6th month energy. Quick and easy for beginners.'}</p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
              <h4 className="font-bold text-lg mb-2 text-amber-600 dark:text-amber-400">{t.advancedVersion}</h4>
              <p className="text-base opacity-80">{lang === 'zh' ? '根据当地物候现象判断能量月：树木落叶→八月（金）、高温>30°C→五月（火）、晨露结霜→十一月（水）、草木萌发→正月（木）。准确率高达90%。' : 'Determine energy month by local phenology: leaf fall→8th Month (Metal), temp>30°C→5th Month (Fire), frost→11th Month (Water), new growth→1st Month (Wood). 90% accuracy.'}</p>
            </div>
          </div>
        </section>}

        {/* 澳洲南半球能量月表 - 仅澳洲地区显示 */}
        {region === 'australia' && <section className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur shadow-lg`}>
          <h3 className="text-2xl font-bold mb-6">{t.melbourneTable}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className={`${darkMode ? 'bg-gray-700' : 'bg-amber-100'}`}>
                  <th className="p-3 text-left rounded-tl-lg">{t.month}</th>
                  <th className="p-3 text-left">{t.phenology}</th>
                  <th className="p-3 text-left">{t.energyMonth}</th>
                  <th className="p-3 text-left rounded-tr-lg">{t.actionTip}</th>
                </tr>
              </thead>
              <tbody>
                {MELBOURNE_TABLE.map((row, i) => (
                  <tr key={row.month} className={`border-b ${darkMode ? 'border-gray-700' : 'border-amber-100'} ${i % 2 === 0 ? (darkMode ? 'bg-gray-800/50' : 'bg-amber-50/50') : ''}`}>
                    <td className="p-3 font-bold">{lang === 'zh' ? `${row.month}月` : `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][row.month - 1]}`}</td>
                    <td className="p-3">{lang === 'zh' ? row.phenologyZh : row.phenologyEn}</td>
                    <td className="p-3">{lang === 'zh' ? row.energyZh : row.energyEn}</td>
                    <td className="p-3">{lang === 'zh' ? row.tipZh : row.tipEn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm opacity-70 italic">
            {lang === 'zh' 
              ? '*能量月用于替代传统农历月份进行小六壬计算。在南半球，由于季节与北半球相反，直接使用农历月份会导致五行能量错配。能量月根据当地物候现象确定，使计算结果更符合实际能量场。'
              : '*Energy Month replaces the traditional lunar month for Xiao Liuren calculations. In the Southern Hemisphere, seasons are opposite to the Northern Hemisphere, so using lunar months directly causes elemental energy misalignment. Energy Month is determined by local phenology to better match the actual energy field.'}
          </p>
        </section>}
      </main>

      {/* Footer */}
      <footer className={`mt-12 py-6 text-center text-sm opacity-60 ${darkMode ? 'bg-gray-900' : 'bg-amber-100/50'}`}>
        <p>{lang === 'zh' ? '小六壬占卜 - 源自唐代李淳风六壬时课' : 'Ancient Chinese Time Divination'}</p>
      </footer>

      {/* 背景音乐 */}
      <audio ref={audioRef} src="/bgm.mp3" loop autoPlay />
      
      {/* 音乐控制面板 - 右下角 */}
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 p-3 rounded-full shadow-lg backdrop-blur-md ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} border ${darkMode ? 'border-gray-700' : 'border-amber-200'}`}>
        {/* 音量滑块 */}
        {showVolumeSlider && (
          <div className="flex items-center gap-2 pr-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1.5 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs w-8 opacity-70">{Math.round(volume * 100)}%</span>
          </div>
        )}
        
        {/* 音量按钮 */}
        <button
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          className={`p-2 rounded-full transition hover:bg-amber-100 dark:hover:bg-gray-700`}
          title={lang === 'zh' ? '音量' : 'Volume'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {volume === 0 ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            ) : volume < 0.5 ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )}
          </svg>
        </button>
        
        {/* 播放/暂停按钮 */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 rounded-full transition ${isPlaying ? 'bg-amber-500 text-white' : 'hover:bg-amber-100 dark:hover:bg-gray-700'}`}
          title={isPlaying ? (lang === 'zh' ? '暂停' : 'Pause') : (lang === 'zh' ? '播放' : 'Play')}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin linear infinite; }
      `}</style>

      {/* 高级版弹窗 */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowPremiumModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div 
            className={`relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button 
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 头部渐变 */}
            <div className={`h-32 bg-gradient-to-br ${godInfo.gradient} rounded-t-3xl flex items-center justify-center`}>
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold">{lang === 'zh' ? i18n.zh.gods[currentResult.god].name : t.gods[currentResult.god].name}</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 基础版 */}
              <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm font-medium">
                    {lang === 'zh' ? '六神速断' : lang === 'ja' ? '六神速断' : lang === 'de' ? 'Sechs Geister' : 'Six Spirits'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="opacity-60">{t.element}:</span> {lang === 'zh' ? i18n.zh.gods[currentResult.god].element : t.gods[currentResult.god].element}</div>
                  <div><span className="opacity-60">{t.color}:</span> {lang === 'zh' ? i18n.zh.gods[currentResult.god].color : t.gods[currentResult.god].color}</div>
                  <div><span className="opacity-60">{t.direction}:</span> {direction}</div>
                  <div><span className="opacity-60">{t.luck}:</span> {lang === 'zh' ? i18n.zh.gods[currentResult.god].luck : t.gods[currentResult.god].luck}</div>
                </div>
                <p className="mt-4 text-base italic opacity-80">"{lang === 'zh' ? i18n.zh.gods[currentResult.god].desc : t.gods[currentResult.god].desc}"</p>
                <p className="mt-2 opacity-70">{lang === 'zh' ? i18n.zh.gods[currentResult.god].modern : t.gods[currentResult.god].modern}</p>
              </div>

              {/* 高级版（锁定/解锁） */}
              <div className={`relative p-5 rounded-2xl overflow-hidden min-h-[300px]`}
                style={!premiumUnlocked ? {
                  backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : { backgroundColor: darkMode ? '#1f2937' : '#f9fafb' }}>
                {/* 模糊遮罩 - 仅未解锁时显示 */}
                {!premiumUnlocked && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                  {/* 简洁的锁定提示 */}
                  <div className="text-center px-6 py-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold mb-2">{lang === 'zh' ? '精准解读' : lang === 'ja' ? '精密解読' : lang === 'de' ? 'Präzise Deutung' : 'Premium Reading'}</p>
                    <p className="text-sm opacity-70 mb-4">
                      {lang === 'zh' ? '输入密码解锁完整内容' : lang === 'ja' ? 'パスワードを入力してください' : lang === 'de' ? 'Passwort eingeben' : 'Enter password to unlock'}
                    </p>
                    <input 
                      type="password" 
                      placeholder={lang === 'zh' ? '输入密码' : lang === 'ja' ? 'コード入力' : lang === 'de' ? 'Code eingeben' : 'Enter code'}
                      className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-center w-36"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value === 'liuren2026') {
                          setPremiumUnlocked(true);
                        }
                      }}
                    />
                  </div>
                </div>}

                {/* 高级内容 - 仅解锁后显示 */}
                {premiumUnlocked && (
                  <>
                <div ref={advancedRef} className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium">
                    {lang === 'zh' ? '生肖合参' : lang === 'ja' ? '十二支合参' : lang === 'de' ? 'Tierkreis-Integration' : 'Zodiac Integration'}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-2">{lang === 'zh' ? '📊 详细命理分析' : lang === 'ja' ? '📊 詳細分析' : lang === 'de' ? '📊 Detaillierte Analyse' : '📊 Detailed Analysis'}</h4>
                    <p className="text-sm">{lang === 'zh' 
                      ? `此时${i18n.zh.gods[currentResult.god].name}主事，${i18n.zh.gods[currentResult.god].element}气当令。${i18n.zh.gods[currentResult.god].luck.includes('吉') ? '整体运势向好，可积极行事。' : '需谨慎行事，避免冲动决策。'}五行${i18n.zh.gods[currentResult.god].element}与当前时辰相合，能量场稳定。`
                      : lang === 'ja'
                      ? `現在${t.gods[currentResult.god].name}が主宰、${t.gods[currentResult.god].element}のエネルギーが優勢。${t.gods[currentResult.god].luck.includes('吉') ? '運勢良好、自信を持って行動を。' : '慎重に行動し、衝動的な決定を避けて。'}`
                      : lang === 'de'
                      ? `${t.gods[currentResult.god].name} herrscht, ${t.gods[currentResult.god].element}-Energie dominiert. ${t.gods[currentResult.god].luck.includes('Günstig') ? 'Glück ist günstig, handeln Sie zuversichtlich.' : 'Gehen Sie vorsichtig vor, vermeiden Sie impulsive Entscheidungen.'}`
                      : `Today ${t.gods[currentResult.god].name} presides, ${t.gods[currentResult.god].element} energy is dominant. ${t.gods[currentResult.god].luck.includes('Auspicious') ? 'Overall fortune is favorable, act with confidence.' : 'Proceed with caution, avoid impulsive decisions.'}`}</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">{lang === 'zh' ? '🎯 行事建议' : lang === 'ja' ? '🎯 行動指針' : lang === 'de' ? '🎯 Handlungsempfehlung' : '🎯 Action Guidance'}</h4>
                    <p className="text-sm">{lang === 'zh'
                      ? (currentResult.god === '大安' ? '宜守成、签约、谈判、求职。不宜激进冒险。' 
                        : currentResult.god === '留连' ? '宜等待、观望、休整。不宜催促、急躁行事。'
                        : currentResult.god === '速喜' ? '宜快速决策、把握机会、主动出击。不宜犹豫拖延。'
                        : currentResult.god === '赤口' ? '宜沉默、独处、书面沟通。不宜争论、谈判、社交。'
                        : currentResult.god === '小吉' ? '宜求助他人、合作共事、小额投资。不宜独断专行。'
                        : '宜休息、反思、调整计划。不宜启动新项目、做重大决定。')
                      : lang === 'ja'
                      ? (currentResult.god === '大安' ? '吉：交渉、契約、就職活動。避：リスクの高い行動。' 
                        : currentResult.god === '留连' ? '吉：待機、観察、休息。避：急ぎ、焦り。'
                        : currentResult.god === '速喜' ? '吉：素早い決断、チャンスをつかむ。避：迷い。'
                        : currentResult.god === '赤口' ? '吉：沈黙、文書によるコミュニケーション。避：口論、社交。'
                        : currentResult.god === '小吉' ? '吉：助けを求める、協力。避：単独行動。'
                        : '吉：休息、内省。避：新プロジェクト、重要な決定。')
                      : lang === 'de'
                      ? (currentResult.god === '大安' ? 'Günstig: Verhandlungen, Verträge, Jobsuche. Vermeiden: Riskante Unternehmungen.' 
                        : currentResult.god === '留连' ? 'Günstig: Warten, Beobachten, Ruhe. Vermeiden: Hetzen, Ungeduld.'
                        : currentResult.god === '速喜' ? 'Günstig: Schnelle Entscheidungen, Chancen ergreifen. Vermeiden: Zögern.'
                        : currentResult.god === '赤口' ? 'Günstig: Einsamkeit, schriftliche Kommunikation. Vermeiden: Streit, gesellschaftliche Ereignisse.'
                        : currentResult.god === '小吉' ? 'Günstig: Hilfe suchen, Zusammenarbeit. Vermeiden: Alleingang.'
                        : 'Günstig: Ruhe, Reflexion. Vermeiden: Neue Projekte, wichtige Entscheidungen.')
                      : (currentResult.god === '大安' ? 'Favorable for: negotiations, contracts, job seeking. Avoid: risky ventures.'
                        : currentResult.god === '留连' ? 'Favorable for: waiting, observing, rest. Avoid: rushing, impatience.'
                        : currentResult.god === '速喜' ? 'Favorable for: quick decisions, seizing opportunities. Avoid: hesitation.'
                        : currentResult.god === '赤口' ? 'Favorable for: solitude, written communication. Avoid: arguments, social events.'
                        : currentResult.god === '小吉' ? 'Favorable for: seeking help, collaboration. Avoid: going alone.'
                        : 'Favorable for: rest, reflection. Avoid: new projects, major decisions.')}</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">{lang === 'zh' ? '⏰ 今日吉时' : lang === 'ja' ? '⏰ 本日の吉時' : lang === 'de' ? '⏰ Günstige Stunden' : '⏰ Auspicious Hours'}</h4>
                    <p className="text-sm">{lang === 'zh'
                      ? `吉時：${allHourResults.map((g, i) => i18n.zh.gods[g].luck.includes('吉') ? t.hours[i] + '(' + t.hourRanges[i] + ')' : '').filter(Boolean).join('、')}`
                      : lang === 'ja'
                      ? `吉時：${allHourResults.map((g, i) => i18n.zh.gods[g].luck.includes('吉') ? t.hours[i] + '(' + t.hourRanges[i] + ')' : '').filter(Boolean).join('、')}`
                      : lang === 'de'
                      ? `Günstig: ${allHourResults.map((g, i) => i18n.zh.gods[g].luck.includes('吉') ? t.hours[i] + '(' + t.hourRanges[i] + ')' : '').filter(Boolean).join(', ')}`
                      : `Auspicious: ${allHourResults.map((g, i) => i18n.zh.gods[g].luck.includes('吉') ? t.hours[i] + '(' + t.hourRanges[i] + ')' : '').filter(Boolean).join(', ')}`}</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">{lang === 'zh' ? '🔮 特别提醒' : lang === 'ja' ? '🔮 特別なヒント' : lang === 'de' ? '🔮 Besondere Hinweise' : '🔮 Special Notes'}</h4>
                    <p className="text-sm">{lang === 'zh'
                      ? `方位提示：${direction}方位能量较强，可朝此方向行事。颜色建议：此时宜${i18n.zh.gods[currentResult.god].color}色系，可增强运势。`
                      : lang === 'ja'
                      ? `方位ヒント：${direction}方向のエネルギーが強い。色のアドバイス：${t.gods[currentResult.god].color}系が運勢を高めます。`
                      : lang === 'de'
                      ? `Richtungshinweis: ${direction} hat starke Energie. Farbempfehlung: ${t.gods[currentResult.god].color} Töne sind heute günstig.`
                      : `Direction tip: ${direction} direction has strong energy. Color advice: ${t.gods[currentResult.god].color} tones are favorable today.`}</p>
                  </div>
                  
                  {/* 方位指引 */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold mb-3 text-lg flex items-center gap-2">
                      <span>🧭</span> {lang === 'zh' ? '方位指引' : lang === 'ja' ? '方位ガイド' : lang === 'de' ? 'Richtungsführer' : 'Direction Guide'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                        <p className="text-sm mb-1"><span className="font-medium">{lang === 'zh' ? '能量核心：' : lang === 'ja' ? 'エネルギー核：' : lang === 'de' ? 'Energiekern: ' : 'Energy Core: '}</span>{getText(DIRECTION_GUIDE_DATA[currentResult.god].core, lang)}</p>
                        <p className="text-sm mb-1"><span className="font-medium">{lang === 'zh' ? '行动方向：' : lang === 'ja' ? '行動方向：' : lang === 'de' ? 'Aktion: ' : 'Action: '}</span>{getText(DIRECTION_GUIDE_DATA[currentResult.god].action, lang)}</p>
                        <p className="text-sm mb-1"><span className="font-medium">{lang === 'zh' ? '吉时：' : lang === 'ja' ? '吉時：' : lang === 'de' ? 'Gute Zeit: ' : 'Good Time: '}</span>{DIRECTION_GUIDE_DATA[currentResult.god].goodTime}</p>
                        <p className="text-sm"><span className="font-medium">{lang === 'zh' ? '忌向：' : lang === 'ja' ? '避ける：' : lang === 'de' ? 'Vermeiden: ' : 'Avoid: '}</span>{getText(DIRECTION_GUIDE_DATA[currentResult.god].avoid, lang)}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
                        <p className="font-medium text-sm mb-2">{lang === 'zh' ? '🎰 老虎机/彩票位' : lang === 'ja' ? '🎰 ギャンブルヒント' : lang === 'de' ? '🎰 Glücksspiel-Tipps' : '🎰 Gambling Tips'}</p>
                        <p className="text-xs mb-1">• {lang === 'zh' ? '赌场：' : lang === 'ja' ? 'カジノ：' : lang === 'de' ? 'Casino: ' : 'Casino: '}{getText(DIRECTION_GUIDE_DATA[currentResult.god].gambling.casino, lang)}</p>
                        <p className="text-xs mb-1">• {lang === 'zh' ? '彩票站：' : lang === 'ja' ? '宝くじ：' : lang === 'de' ? 'Lotterie: ' : 'Lottery: '}{getText(DIRECTION_GUIDE_DATA[currentResult.god].gambling.lottery, lang)}</p>
                        <p className="text-xs mb-1">• {lang === 'zh' ? '数字：' : lang === 'ja' ? '数字：' : lang === 'de' ? 'Zahlen: ' : 'Numbers: '}{DIRECTION_GUIDE_DATA[currentResult.god].gambling.numbers}</p>
                        <p className="text-xs">• {lang === 'zh' ? '颜色：' : lang === 'ja' ? '色：' : lang === 'de' ? 'Farbe: ' : 'Color: '}{getText(DIRECTION_GUIDE_DATA[currentResult.god].gambling.color, lang)}</p>
                      </div>
                    </div>
                    {/* 澳洲特调 - 仅澳洲地区显示 */}
                    {region === 'australia' && (
                      <div className={`mt-3 p-3 rounded-xl ${darkMode ? 'bg-amber-900/30' : 'bg-amber-50'} border-l-4 border-amber-500`}>
                        <p className="font-medium text-sm mb-2">📍 {lang === 'zh' ? '澳洲特调' : lang === 'ja' ? '豪州特別' : lang === 'de' ? 'Australien Spezial' : 'Australian Special'}</p>
                        {getTextArr(DIRECTION_GUIDE_DATA[currentResult.god].melbourne, lang).map((tip, i) => (
                          <p key={i} className="text-xs mb-1">• {tip}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* 财运指引 */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold mb-3 text-lg flex items-center gap-2">
                      <span>💰</span> {lang === 'zh' ? '财运指引' : lang === 'ja' ? '財運ガイド' : lang === 'de' ? 'Vermögensführer' : 'Wealth Guide'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-green-50'}`}>
                        <p className="font-medium text-sm mb-2">{lang === 'zh' ? '💹 最佳投资方向' : lang === 'ja' ? '💹 投資方向' : lang === 'de' ? '💹 Investition' : '💹 Investment'}</p>
                        {getTextArr(WEALTH_GUIDE_DATA[currentResult.god].investment, lang).map((item, i) => (
                          <p key={i} className="text-xs mb-1">• {item}</p>
                        ))}
                      </div>
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-yellow-50'}`}>
                        <p className="font-medium text-sm mb-2">{lang === 'zh' ? '🎯 增强财运方法' : lang === 'ja' ? '🎯 財運強化' : lang === 'de' ? '🎯 Vermögen steigern' : '🎯 Enhance Wealth'}</p>
                        {getTextArr(WEALTH_GUIDE_DATA[currentResult.god].method, lang).map((item, i) => (
                          <p key={i} className="text-xs mb-1">• {item}</p>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                        <p className="font-medium text-sm mb-2">{lang === 'zh' ? '⚠️ 避免' : lang === 'ja' ? '⚠️ 避けるべき' : lang === 'de' ? '⚠️ Vermeiden' : '⚠️ Avoid'}</p>
                        {getTextArr(WEALTH_GUIDE_DATA[currentResult.god].avoid, lang).map((item, i) => (
                          <p key={i} className="text-xs mb-1">• {item}</p>
                        ))}
                      </div>
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                        <p className="font-medium text-sm mb-2">{lang === 'zh' ? '✨ 生肖加成' : lang === 'ja' ? '✨ 干支ボーナス' : lang === 'de' ? '✨ Tierkreis-Bonus' : '✨ Zodiac Boost'}</p>
                        {getTextArr(WEALTH_GUIDE_DATA[currentResult.god].zodiacBoost, lang).map((item, i) => (
                          <p key={i} className="text-xs mb-1">• {item}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* 寻物指引 */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold mb-3 text-lg flex items-center gap-2">
                      <span>🔍</span> {lang === 'zh' ? '寻物指引' : lang === 'ja' ? '失せ物探し' : lang === 'de' ? 'Verlorene Gegenstände' : 'Lost Item Finder'}
                    </h4>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-amber-50'} mb-3`}>
                      <p className="text-sm mb-2">
                        <span className="font-medium">{lang === 'zh' ? '方位：' : lang === 'ja' ? '方位：' : lang === 'de' ? 'Richtung: ' : 'Direction: '}</span>
                        {getTextArr(ITEM_FINDING_DATA[currentResult.god].directions, lang).join(lang === 'zh' || lang === 'ja' ? '、' : ', ')}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="font-medium">{lang === 'zh' ? '可能位置：' : lang === 'ja' ? '場所：' : lang === 'de' ? 'Orte: ' : 'Locations: '}</span>
                        {getTextArr(ITEM_FINDING_DATA[currentResult.god].locations, lang).join(lang === 'zh' || lang === 'ja' ? '、' : ', ')}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="font-medium">{lang === 'zh' ? '最佳时间：' : lang === 'ja' ? '最適時間：' : lang === 'de' ? 'Beste Zeit: ' : 'Best Time: '}</span>
                        {getText(ITEM_FINDING_DATA[currentResult.god].timing, lang)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">{lang === 'zh' ? '提示：' : lang === 'ja' ? 'ヒント：' : lang === 'de' ? 'Tipps: ' : 'Tips: '}</span>
                        {getText(ITEM_FINDING_DATA[currentResult.god].tips, lang)}
                      </p>
                    </div>
                  </div>
                  
                  {/* 生肖精准判定系统 */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold mb-3 text-lg">{lang === 'zh' ? '🐲 生肖精准判定系统' : lang === 'ja' ? '🐲 十二支判定システム' : lang === 'de' ? '🐲 Chinesisches Tierkreiszeichen' : '🐲 Chinese Zodiac'}</h4>
                    <p className="text-xs opacity-70 mb-3">{lang === 'zh' ? '输入公历出生年月日，系统自动计算农历生肖（考虑跨年问题）' : lang === 'ja' ? '生年月日を入力すると、旧暦の十二支を自動計算（年越しも考慮）' : lang === 'de' ? 'Geben Sie Ihr Geburtsdatum ein, um Ihr chinesisches Tierkreiszeichen zu berechnen' : 'Enter your birth date to calculate your Chinese zodiac (considering Lunar New Year boundary)'}</p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {lang === 'zh' || lang === 'ja' ? (
                        <>
                          <div>
                            <label className="text-xs opacity-70 block mb-1">{lang === 'zh' ? '出生年' : '年'}</label>
                            <input type="number" min="1920" max="2025" value={birthYear} onChange={e => setBirthYear(parseInt(e.target.value) || 1990)} className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
                          </div>
                          <div>
                            <label className="text-xs opacity-70 block mb-1">月</label>
                            <select value={birthMonth} onChange={e => setBirthMonth(parseInt(e.target.value))} className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{m}月</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs opacity-70 block mb-1">日</label>
                            <input type="number" min="1" max="31" value={birthDay} onChange={e => setBirthDay(parseInt(e.target.value) || 1)} className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-xs opacity-70 block mb-1">Day</label>
                            <input type="number" min="1" max="31" value={birthDay} onChange={e => setBirthDay(parseInt(e.target.value) || 1)} className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
                          </div>
                          <div>
                            <label className="text-xs opacity-70 block mb-1">Month</label>
                            <select value={birthMonth} onChange={e => setBirthMonth(parseInt(e.target.value))} className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs opacity-70 block mb-1">Year</label>
                            <input type="number" min="1920" max="2025" value={birthYear} onChange={e => setBirthYear(parseInt(e.target.value) || 1990)} className={`w-full px-2 py-1.5 rounded text-sm border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
                          </div>
                        </>
                      )}
                    </div>
                    
                    <button onClick={() => setZodiacResult(getExactZodiac(birthYear, birthMonth, birthDay))} className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:opacity-90 transition">
                      {lang === 'zh' ? '分析生肖与六壬关系' : lang === 'ja' ? '十二支と六壬の関係を分析' : lang === 'de' ? 'Tierkreis-Kompatibilität analysieren' : 'Analyze Zodiac Compatibility'}
                    </button>
                    
                    {zodiacResult && (() => {
                      const zodiacEl = ZODIAC_ELEMENT[zodiacResult.zodiac];
                      const shenshaEl = i18n.zh.gods[currentResult.god].element === '无' ? '土' : i18n.zh.gods[currentResult.god].element; // 空亡用土
                      const relation = getElementRelation(shenshaEl, zodiacEl, lang);
                      return (
                        <div className={`mt-3 p-3 rounded-lg ${relation.effect === 'good' ? 'bg-green-50 dark:bg-green-900/30' : relation.effect === 'bad' ? 'bg-red-50 dark:bg-red-900/30' : 'bg-yellow-50 dark:bg-yellow-900/30'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{ZODIAC_ICONS[zodiacResult.zodiac]}</span>
                            <div>
                              <span className="font-bold text-lg">{lang === 'zh' ? zodiacResult.zodiac : lang === 'ja' ? ZODIAC_JA[zodiacResult.zodiac] : lang === 'de' ? ZODIAC_DE[zodiacResult.zodiac] : ZODIAC_EN[zodiacResult.zodiac]}</span>
                              <span className="text-xs opacity-70 ml-2">({lang === 'zh' ? '农历' : lang === 'ja' ? '旧暦' : lang === 'de' ? 'Lunar' : 'Lunar'} {zodiacResult.lunarYear})</span>
                            </div>
                          </div>
                          
                          {zodiacResult.isBeforeNewYear && (
                            <div className="text-xs p-2 mb-2 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                              ⚠️ {lang === 'zh' ? `您的出生日期在${birthYear}年春节之前，实际属于${zodiacResult.lunarYear}年（${zodiacResult.zodiac}）` : lang === 'ja' ? `生年月日は${birthYear}年の春節前のため、実際は${zodiacResult.lunarYear}年（${ZODIAC_JA[zodiacResult.zodiac]}）生まれです` : lang === 'de' ? `Geburtsdatum vor dem Mondneujahr ${birthYear}, tatsächliches Tierkreisjahr ist ${zodiacResult.lunarYear} (${ZODIAC_DE[zodiacResult.zodiac]})` : `Born before Lunar New Year ${birthYear}, actual zodiac year is ${zodiacResult.lunarYear} (${ZODIAC_EN[zodiacResult.zodiac]})`}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                            <div><span className="opacity-60">{lang === 'zh' ? '生肖五行' : 'Zodiac Element'}:</span> <strong>{lang === 'zh' ? zodiacEl : ZODIAC_ELEMENT_EN[zodiacResult.zodiac]}</strong></div>
                            <div><span className="opacity-60">{lang === 'zh' ? '神煞五行' : 'Spirit Element'}:</span> <strong>{lang === 'zh' ? shenshaEl : (t.gods[currentResult.god] as any).element}</strong></div>
                          </div>
                          
                          <div className={`text-center py-2 rounded font-bold ${relation.effect === 'good' ? 'text-green-600 dark:text-green-400' : relation.effect === 'bad' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {relation.text} · {lang === 'zh' ? '效力' : 'Power'}: {relation.power}%
                          </div>
                          
                          <p className="text-xs mt-2 opacity-80">
                            {lang === 'zh' 
                              ? (relation.effect === 'good' ? `生肖${zodiacResult.zodiac}与${godInfo.name}相合，此时运势增强，可大胆行事。` : relation.effect === 'bad' ? `生肖${zodiacResult.zodiac}与${godInfo.name}相克，此时宜谨慎保守，避免重大决策。` : `生肖${zodiacResult.zodiac}与${godInfo.name}关系中性，按常规行事即可。`)
                              : lang === 'ja'
                              ? (relation.effect === 'good' ? `十二支${ZODIAC_JA[zodiacResult.zodiac]}と${godInfo.name}は相性良好、運勢上昇中。` : relation.effect === 'bad' ? `十二支${ZODIAC_JA[zodiacResult.zodiac]}と${godInfo.name}は相克、慈重な行動は避けて。` : `十二支${ZODIAC_JA[zodiacResult.zodiac]}と${godInfo.name}は中立、通常通りに。`)
                              : lang === 'de'
                              ? (relation.effect === 'good' ? `Ihr Tierkreiszeichen ${ZODIAC_DE[zodiacResult.zodiac]} harmoniert mit ${godInfo.name}. Das Glück ist heute verstärkt.` : relation.effect === 'bad' ? `Ihr Tierkreiszeichen ${ZODIAC_DE[zodiacResult.zodiac]} steht in Konflikt mit ${godInfo.name}. Seien Sie heute vorsichtig.` : `Ihr Tierkreiszeichen ${ZODIAC_DE[zodiacResult.zodiac]} hat eine neutrale Beziehung zu ${godInfo.name}.`)
                              : (relation.effect === 'good' ? `Your zodiac ${ZODIAC_EN[zodiacResult.zodiac]} harmonizes with ${godInfo.name}. Fortune is enhanced today.` : relation.effect === 'bad' ? `Your zodiac ${ZODIAC_EN[zodiacResult.zodiac]} conflicts with ${godInfo.name}. Be cautious today.` : `Your zodiac ${ZODIAC_EN[zodiacResult.zodiac]} has a neutral relationship with ${godInfo.name}.`)}
                          </p>
                          
                          {/* 柔性方位提示 */}
                          <div className={`mt-3 p-2 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-amber-50'} border-l-4 ${relation.effect === 'good' ? 'border-green-500' : relation.effect === 'bad' ? 'border-amber-500' : 'border-blue-500'}`}>
                            <p className="text-sm italic">
                              💡 {getZodiacHint(currentResult.god, zodiacResult.zodiac, lang)}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* 所有生肖关系表 */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline">
                        {lang === 'zh' ? '查看所有生肖与当前神煞的关系' : 'View all zodiac relationships'}
                      </summary>
                      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                        {ZODIAC_LIST.map(z => {
                          const zEl = ZODIAC_ELEMENT[z];
                          const sEl = godInfo.element === '无' ? '土' : godInfo.element;
                          const rel = getElementRelation(sEl, zEl, lang);
                          return (
                            <div key={z} className={`p-2 rounded text-center ${rel.effect === 'good' ? 'bg-green-50 dark:bg-green-900/30' : rel.effect === 'bad' ? 'bg-red-50 dark:bg-red-900/30' : 'bg-yellow-50 dark:bg-yellow-900/30'}`}>
                              <span className="text-lg">{ZODIAC_ICONS[z]}</span>
                              <div className="font-medium">{lang === 'zh' ? z : lang === 'ja' ? ZODIAC_JA[z] : lang === 'de' ? ZODIAC_DE[z] : ZODIAC_EN[z]}</div>
                              <div className={`text-[10px] ${rel.effect === 'good' ? 'text-green-600' : rel.effect === 'bad' ? 'text-red-600' : 'text-amber-600'}`}>{rel.power}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  </div>
                </div>
                  </>
                )}
              </div>

              {/* 推算过程 */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-amber-50'} text-sm`}>
                <p className="font-medium mb-2">{t.calculation}:</p>
                <p className="opacity-80">
                  {t.months[lunarData.month - 1]} → {t.gods[SIX_GODS[currentResult.monthGod]].name} → 
                  {t.days[lunarData.day - 1]} → {t.gods[SIX_GODS[currentResult.dayGod]].name} → 
                  {t.hours[lunarData.hourIndex]} → {t.gods[currentResult.god].name}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 版权声明 */}
      <footer className={`mt-8 py-4 text-center text-sm font-medium ${darkMode ? 'bg-gray-900/95 text-gray-200' : 'bg-white/95 text-gray-700'} border-t ${darkMode ? 'border-gray-800' : 'border-gray-300'} backdrop-blur-sm shadow-inner`}>
        <p>{lang === 'zh' ? '© 2026 维多利亚电脑澳洲公司 版权所有' : '© 2026 Victorian Computers Australian. All rights reserved.'}</p>
        <p className="mt-1">{lang === 'zh' ? '未经授权，禁止复制或传播' : 'Unauthorized reproduction or distribution is prohibited.'}</p>
      </footer>
    </div>
  );
}
