import * as chalk from 'chalk';

/** 주어진 텍스트의 각 줄에 지정된 공백 수만큼 들여쓰기를 적용 */
export const indent = (text: string, spaces: number = 4): string =>
  text
    .split('\n')
    .map((line) => ' '.repeat(spaces) + line)
    .join('\n');

/** SQL 쿼리 문자열의 키워드, 숫자, 문자열 및 식별자에 색상 포맷을 적용하여 하이라이트 */
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

/** SQL 쿼리의 파라미터 배열을 JSON 문자열로 변환하여 색상 포맷을 적용 */
export const formatParameters = (params: unknown[]): string =>
  params.length > 0 ? chalk.hex('#2E8B57')(JSON.stringify(params)) : '';

/** SQL 쿼리를 분석하여 성능 이슈가 발생할 수 있는 부분에 대한 경고 메시지를 반환 */
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