/**
 * Get a random item from a local file.
 * @param path - The path to the local file.
 * @returns The random item.
 */
async function getRandomLocal(path: string) {
  const resp = await fetch(path)
  const data = await resp.json()
  return data[Math.floor(Math.random() * data.length)]
}

/**
 * Get a random trivia item from a local file.
 * @returns The random trivia item.
 */
export const getRandomTriviaLocal = () => getRandomLocal('/localtrivia.json')

/**
 * Get a random math item from a local file.
 * @returns The random math item.
 */
export const getRandomMathLocal = () => getRandomLocal('/localmath.json')

/**
 * Compare two strings.
 * @param a - The first string.
 * @param b - The second string.
 * @returns The comparison result.
 */
export function compareStrings(a: string, b: string): number {
  return a.localeCompare(b)
}
