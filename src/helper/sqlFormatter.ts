import * as chalk from 'chalk';

export const indent = (text: string, spaces: number = 4): string =>
  text
    .split('\n')
    .map((line) => ' '.repeat(spaces) + line)
    .join('\n');

export const sqlHighlighter = (sql: string): string => {
  const keywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'INNER JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'FULL JOIN',
    'INSERT',
    'INTO',
    'UPDATE',
    'DELETE',
    'CREATE',
    'TABLE',
    'INDEX',
    'DROP',
    'ORDER BY',
    'GROUP BY',
    'LIMIT',
    'OFFSET',
    'HAVING',
    'VALUES',
    'SET',
    'EXPLAIN',
    'AND',
    'OR',
    'AS',
    'IN',
  ];
  return sql
    .split(/\b/)
    .map((token) => {
      const upperToken = token.toUpperCase();
      if (keywords.includes(upperToken)) return chalk.blueBright.bold(token);
      if (/^\d+(\.\d+)?$/.test(token)) return chalk.yellow(token);
      if (/^'.*'$/.test(token) || /^".*"$/.test(token)) return chalk.green(token);
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) return chalk.hex('#4682B4')(token);
      return token;
    })
    .join('');
};

export const formatParameters = (params: unknown[]): string =>
  params.length > 0 ? chalk.hex('#2E8B57')(JSON.stringify(params)) : '';

export const addQueryAnalysis = (query: string): string => {
  const warnings: string[] = [];
  const simplified = query.toLowerCase().replace(/\s+/g, ' ');
  if (simplified.includes('select *')) {
    warnings.push(chalk.yellowBright('⚠️ Avoid SELECT * - specify columns explicitly'));
  }
  if (simplified.includes('join') && !simplified.includes(' on ')) {
    warnings.push(chalk.redBright('❗ JOIN without ON clause detected'));
  }
  if (simplified.includes("like '%")) {
    warnings.push(chalk.magentaBright('🚨 Leading % in LIKE can cause full table scan'));
  }
  return warnings.join('\n');
};
