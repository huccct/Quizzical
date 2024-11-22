export async function getRandomTriviaLocal() {
  return fetch('/localtrivia.json')
    .then(resp => resp.json())
    .then((data) => {
      const index = Math.floor(Math.random() * data.length)
      return data[index]
    })
}

export async function getRandomMathLocal() {
  return fetch('/localmath.json')
    .then(resp => resp.json())
    .then((data) => {
      const index = Math.floor(Math.random() * data.length)
      return data[index]
    })
}

export function compareStrings(a: string, b: string): number {
  return a.localeCompare(b)
}
