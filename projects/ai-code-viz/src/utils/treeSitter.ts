/**
 * Tree-sitter WASM 加载工具
 * 用于从 CDN 加载语言语法文件
 */

interface GrammarConfig {
  name: string;
  url: string;
}

export const GRAMMARS: Record<string, GrammarConfig> = {
  javascript: {
    name: 'tree-sitter-javascript.wasm',
    url: 'https://cdn.jsdelivr.net/npm/tree-sitter-javascript@0.23.4/tree-sitter-javascript.wasm',
  },
  typescript: {
    name: 'tree-sitter-typescript.wasm',
    url: 'https://cdn.jsdelivr.net/npm/tree-sitter-typescript@0.23.2/tree-sitter-typescript.wasm',
  },
};

/**
 * 从 CDN 加载 tree-sitter 语法文件
 */
export const loadGrammar = async (language: string): Promise<Buffer> => {
  const grammar = GRAMMARS[language.toLowerCase()];
  
  if (!grammar) {
    throw new Error(`Unsupported language: ${language}`);
  }

  try {
    const response = await fetch(grammar.url);
    if (!response.ok) {
      throw new Error(`Failed to load grammar: ${grammar.name}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Error loading grammar ${grammar.name}:`, error);
    throw error;
  }
};

/**
 * 预加载所有语法文件
 */
export const preloadGrammars = async (): Promise<void> => {
  const loadPromises = Object.keys(GRAMMARS).map((lang) =>
    loadGrammar(lang).catch((err) => {
      console.warn(`Failed to preload ${lang} grammar:`, err);
      return null;
    })
  );
  
  await Promise.all(loadPromises);
};

/**
 * 获取支持的编程语言列表
 */
export const getSupportedLanguages = (): string[] => {
  return Object.keys(GRAMMARS);
};
