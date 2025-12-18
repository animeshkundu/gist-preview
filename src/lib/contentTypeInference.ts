export type InferredContentType = 
  | 'html'
  | 'markdown'
  | 'json'
  | 'css'
  | 'javascript'
  | 'code'
  | 'text';

interface ContentTypeResult {
  type: InferredContentType;
  confidence: number;
}

const HTML_DOCTYPE_PATTERN = /^\s*<!DOCTYPE\s+html/i;
const HTML_TAG_PATTERN = /<\s*(html|head|body|div|span|p|a|h[1-6]|script|style|link|meta|table|form|input|button|img|ul|ol|li|nav|header|footer|main|section|article|aside)\b[^>]*>/i;
const HTML_SELF_CLOSING_PATTERN = /<\s*(br|hr|img|input|meta|link)\s*\/?>/i;
const HTML_FULL_STRUCTURE_PATTERN = /<html[\s\S]*<\/html>/i;

const MD_HEADER_PATTERN = /^#{1,6}\s+.+$/m;
const MD_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/;
const MD_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/;
const MD_CODE_BLOCK_PATTERN = /```[\s\S]*?```/;
const MD_INLINE_CODE_PATTERN = /`[^`\n]+`/;
const MD_BOLD_PATTERN = /(\*\*|__)[^*_]+\1/;
const MD_ITALIC_PATTERN = /(\*|_)[^*_\n]+\1/;
const MD_LIST_PATTERN = /^[\s]*[-*+]\s+.+$/m;
const MD_ORDERED_LIST_PATTERN = /^[\s]*\d+\.\s+.+$/m;
const MD_BLOCKQUOTE_PATTERN = /^>\s+.+$/m;
const MD_HR_PATTERN = /^[-*_]{3,}\s*$/m;
const MD_TABLE_PATTERN = /\|.+\|[\r\n]+\|[-:| ]+\|/;

function isValidJson(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

function inferHtmlFromContent(content: string): ContentTypeResult {
  const trimmed = content.trim();
  
  if (HTML_DOCTYPE_PATTERN.test(trimmed)) {
    return { type: 'html', confidence: 1.0 };
  }
  
  if (HTML_FULL_STRUCTURE_PATTERN.test(trimmed)) {
    return { type: 'html', confidence: 0.95 };
  }
  
  const htmlTagMatches = trimmed.match(new RegExp(HTML_TAG_PATTERN.source, 'gi')) || [];
  const selfClosingMatches = trimmed.match(new RegExp(HTML_SELF_CLOSING_PATTERN.source, 'gi')) || [];
  const totalTagCount = htmlTagMatches.length + selfClosingMatches.length;
  
  if (totalTagCount >= 5) {
    return { type: 'html', confidence: 0.9 };
  }
  
  if (totalTagCount >= 2) {
    return { type: 'html', confidence: 0.7 };
  }
  
  if (totalTagCount === 1 && (trimmed.startsWith('<') || HTML_TAG_PATTERN.test(trimmed))) {
    return { type: 'html', confidence: 0.5 };
  }
  
  return { type: 'html', confidence: 0 };
}

function inferMarkdownFromContent(content: string): ContentTypeResult {
  let score = 0;
  const checks = [
    { pattern: MD_HEADER_PATTERN, weight: 2 },
    { pattern: MD_LINK_PATTERN, weight: 2 },
    { pattern: MD_IMAGE_PATTERN, weight: 2 },
    { pattern: MD_CODE_BLOCK_PATTERN, weight: 3 },
    { pattern: MD_INLINE_CODE_PATTERN, weight: 1 },
    { pattern: MD_BOLD_PATTERN, weight: 1 },
    { pattern: MD_ITALIC_PATTERN, weight: 1 },
    { pattern: MD_LIST_PATTERN, weight: 1.5 },
    { pattern: MD_ORDERED_LIST_PATTERN, weight: 1.5 },
    { pattern: MD_BLOCKQUOTE_PATTERN, weight: 2 },
    { pattern: MD_HR_PATTERN, weight: 1 },
    { pattern: MD_TABLE_PATTERN, weight: 3 },
  ];
  
  let maxScore = 0;
  for (const check of checks) {
    maxScore += check.weight;
    if (check.pattern.test(content)) {
      score += check.weight;
    }
  }
  
  const lines = content.split('\n');
  const headerLines = lines.filter(line => MD_HEADER_PATTERN.test(line)).length;
  if (headerLines >= 2) {
    score += 2;
    maxScore += 2;
  }
  
  const confidence = Math.min(score / 8, 1);
  
  return { type: 'markdown', confidence };
}

function inferJsonFromContent(content: string): ContentTypeResult {
  const trimmed = content.trim();
  
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return { type: 'json', confidence: 0 };
  }
  
  if (isValidJson(trimmed)) {
    return { type: 'json', confidence: 1.0 };
  }
  
  return { type: 'json', confidence: 0 };
}

function inferCssFromContent(content: string): ContentTypeResult {
  const cssPatterns = [
    /[.#]?[a-zA-Z_-]+\s*\{[^}]*\}/,
    /@(media|keyframes|import|font-face)\s/,
    /:\s*(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/,
    /:\s*(px|em|rem|%|vh|vw)\s*;/,
  ];
  
  let matches = 0;
  for (const pattern of cssPatterns) {
    if (pattern.test(content)) {
      matches++;
    }
  }
  
  const selectorBlocks = (content.match(/[{]/g) || []).length;
  
  if (matches >= 3 || (matches >= 2 && selectorBlocks >= 3)) {
    return { type: 'css', confidence: 0.9 };
  }
  
  if (matches >= 2) {
    return { type: 'css', confidence: 0.6 };
  }
  
  return { type: 'css', confidence: 0 };
}

function inferJavaScriptFromContent(content: string): ContentTypeResult {
  const jsPatterns = [
    /\b(function|const|let|var|class|import|export|return|if|else|for|while|switch)\b/,
    /=>\s*[{(]/,
    /\.\s*(then|catch|finally)\s*\(/,
    /\bconsole\.(log|error|warn)\s*\(/,
    /\bdocument\.(getElementById|querySelector|createElement)/,
    /\bwindow\./,
    /\bnew\s+(Promise|Map|Set|Array|Object|Date|Error)\s*\(/,
    /\basync\s+function|\bawait\s+/,
  ];
  
  let matches = 0;
  for (const pattern of jsPatterns) {
    if (pattern.test(content)) {
      matches++;
    }
  }
  
  if (matches >= 4) {
    return { type: 'javascript', confidence: 0.9 };
  }
  
  if (matches >= 2) {
    return { type: 'javascript', confidence: 0.6 };
  }
  
  return { type: 'javascript', confidence: 0 };
}

export function inferContentType(content: string, filename: string): InferredContentType {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const extensionMap: Record<string, InferredContentType> = {
    html: 'html',
    htm: 'html',
    md: 'markdown',
    markdown: 'markdown',
    json: 'json',
    css: 'css',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'javascript',
    tsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
  };
  
  if (ext && extensionMap[ext]) {
    return extensionMap[ext];
  }
  
  const results: ContentTypeResult[] = [
    inferHtmlFromContent(content),
    inferMarkdownFromContent(content),
    inferJsonFromContent(content),
    inferCssFromContent(content),
    inferJavaScriptFromContent(content),
  ];
  
  const best = results.reduce((prev, curr) => 
    curr.confidence > prev.confidence ? curr : prev
  );
  
  if (best.confidence >= 0.5) {
    return best.type;
  }
  
  const codeIndicators = [
    /[{}\[\]();]/g,
    /\b(function|class|import|export|const|let|var|def|return|if|else|for|while)\b/,
    /[=<>!]+/g,
  ];
  
  let codeScore = 0;
  for (const pattern of codeIndicators) {
    const matches = content.match(pattern);
    if (matches && matches.length > 5) {
      codeScore++;
    }
  }
  
  if (codeScore >= 2) {
    return 'code';
  }
  
  return 'text';
}

export function shouldRenderAsWebPage(type: InferredContentType): boolean {
  return type === 'html' || type === 'markdown';
}

export function getDisplayType(type: InferredContentType): string {
  const displayMap: Record<InferredContentType, string> = {
    html: 'HTML',
    markdown: 'Markdown',
    json: 'JSON',
    css: 'CSS',
    javascript: 'JavaScript',
    code: 'Code',
    text: 'Text',
  };
  return displayMap[type];
}
