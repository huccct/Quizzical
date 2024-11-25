async function getRandomLocal(path: string) {
  const resp = await fetch(path)
  const data = await resp.json()
  return data[Math.floor(Math.random() * data.length)]
}

export const getRandomTriviaLocal = () => getRandomLocal('/localtrivia.json')
export const getRandomMathLocal = () => getRandomLocal('/localmath.json')

export function compareStrings(a: string, b: string): number {
  return a.localeCompare(b)
}
