export const PRETTY_BY_ALIAS: Record<string, { name: string; color: string } | undefined> = {
  js: { name: 'JavaScript', color: '#F7DF1E' },
  javascript: { name: 'JavaScript', color: '#F7DF1E' },
  ts: { name: 'TypeScript', color: '#3178C6' },
  typescript: { name: 'TypeScript', color: '#3178C6' },
  python: { name: 'Python', color: '#3776AB' },
  py: { name: 'Python', color: '#3776AB' },
  go: { name: 'Go', color: '#00ADD8' },
  rust: { name: 'Rust', color: '#DEA584' },
  func: { name: 'FunC', color: '#FFD700' },
  c: { name: 'C', color: '#A8B9CC' },
  'c++': { name: 'C++', color: '#00599C' },
  cpp: { name: 'C++', color: '#00599C' },
  fortran: { name: 'Fortran', color: '#734F96' },
  f90: { name: 'Fortran', color: '#734F96' },
  f: { name: 'Fortran', color: '#734F96' },
  java: { name: 'Java', color: '#007396' },
  sql: { name: 'SQL', color: '#CC2927' },
  swift: { name: 'Swift', color: '#FA7343' },
  'objective-c': { name: 'Objective-C', color: '#438EFF' },
  kotlin: { name: 'Kotlin', color: '#A97BFF' },
  ruby: { name: 'Ruby', color: '#CC342D' },
  rb: { name: 'Ruby', color: '#CC342D' },
  php: { name: 'PHP', color: '#777BB4' },
  perl: { name: 'Perl', color: '#39457E' },
  bash: { name: 'Bash', color: '#4EAA25' },
  sh: { name: 'Shell', color: '#89E051' },
  markdown: { name: 'Markdown', color: '#083FA1' },
  'c#': { name: 'C#', color: '#239120' },
  cs: { name: 'C#', color: '#239120' },
  json: { name: 'JSON', color: '#000000' },
  yaml: { name: 'YAML', color: '#CB171E' },
  yml: { name: 'YAML', color: '#CB171E' },
  solidity: { name: 'Solidity', color: '#363636' },
  sol: { name: 'Solidity', color: '#363636' },
  tl: { name: 'TL', color: '#00FF00' },
};

export function getPrettyCodeLanguageName(codeLanguage: string): string {
  return PRETTY_BY_ALIAS[codeLanguage.toLowerCase()]?.name || codeLanguage;
}

export function getPrettyCodeLanguageColor(codeLanguage: string): string {
  return PRETTY_BY_ALIAS[codeLanguage.toLowerCase()]?.color || '#000000';
}
