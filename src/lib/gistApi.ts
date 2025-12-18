export interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  content: string;
}

export interface GistOwner {
  login: string;
  avatar_url: string;
}

export interface GistData {
  id: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
  owner: GistOwner | null;
  html_url: string;
}

export interface GistApiSuccess {
  success: true;
  data: GistData;
}

export interface GistApiError {
  success: false;
  error: string;
  status?: number;
  retryAfter?: number;
}

export type GistApiResult = GistApiSuccess | GistApiError;

export async function fetchGist(gistId: string): Promise<GistApiResult> {
  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');

      if (response.status === 404) {
        return {
          success: false,
          error: 'Gist not found. It may be private or deleted.',
          status: 404,
        };
      }

      if (response.status === 403) {
        if (rateLimitRemaining === '0' && rateLimitReset) {
          const resetTime = parseInt(rateLimitReset, 10) * 1000;
          const waitSeconds = Math.ceil((resetTime - Date.now()) / 1000);
          return {
            success: false,
            error: `Rate limited. Try again in ${Math.ceil(waitSeconds / 60)} minutes.`,
            status: 403,
            retryAfter: waitSeconds,
          };
        }
        return {
          success: false,
          error: 'Access denied. This gist may be private.',
          status: 403,
        };
      }

      return {
        success: false,
        error: `GitHub API error (${response.status})`,
        status: response.status,
      };
    }

    const data: GistData = await response.json();
    return { success: true, data };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Check your connection and try again.',
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

export function getFilesByType(files: Record<string, GistFile>): {
  html: GistFile[];
  css: GistFile[];
  js: GistFile[];
  other: GistFile[];
} {
  const result = {
    html: [] as GistFile[],
    css: [] as GistFile[],
    js: [] as GistFile[],
    other: [] as GistFile[],
  };

  Object.values(files).forEach((file) => {
    const ext = file.filename.split('.').pop()?.toLowerCase();
    if (ext === 'html' || ext === 'htm') {
      result.html.push(file);
    } else if (ext === 'css') {
      result.css.push(file);
    } else if (ext === 'js' || ext === 'javascript') {
      result.js.push(file);
    } else {
      result.other.push(file);
    }
  });

  return result;
}

export function assemblePreviewHtml(
  htmlContent: string,
  cssFiles: GistFile[],
  jsFiles: GistFile[]
): string {
  const cssContent = cssFiles.map((f) => f.content).join('\n');
  const jsContent = jsFiles.map((f) => f.content).join('\n');

  const hasHtmlStructure = /<html/i.test(htmlContent);

  if (hasHtmlStructure) {
    let result = htmlContent;

    if (cssContent && !result.includes(cssContent)) {
      result = result.replace(
        /<\/head>/i,
        `<style>${cssContent}</style></head>`
      );
    }

    if (jsContent && !result.includes(jsContent)) {
      result = result.replace(
        /<\/body>/i,
        `<script>${jsContent}</script></body>`
      );
    }

    return result;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    ${cssContent}
  </style>
</head>
<body>
  ${htmlContent}
  <script>${jsContent}</script>
</body>
</html>`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isRenderableFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['html', 'htm', 'md', 'markdown'].includes(ext);
}

export function getLanguageFromExtension(ext: string): string {
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    sql: 'sql',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    css: 'css',
    scss: 'scss',
    less: 'less',
    html: 'html',
    htm: 'html',
    md: 'markdown',
    markdown: 'markdown',
  };
  return languageMap[ext] || 'plaintext';
}
