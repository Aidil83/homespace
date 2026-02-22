export interface LanguageConfig {
  id: number; // Judge0 language ID
  name: string;
  monacoId: string;
  extension: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  python: {
    id: 71,
    name: "Python 3",
    monacoId: "python",
    extension: ".py",
  },
} as const;

export const DEFAULT_LANGUAGE = "python";
