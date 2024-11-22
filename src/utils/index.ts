export const getRandomTriviaLocal = async () => {
    console.log("Trying local fetch...");
    return fetch("/localtrivia.json")
    .then(resp => resp.json())
    .then(data => {
        let index = Math.floor(Math.random() * data.length);
        return data[index];
    })
} 

export const getRandomMathLocal = async () => {
    console.log("Trying local fetch...");
    return fetch("/localmath.json")
    .then(resp => resp.json())
    .then(data => {
        let index = Math.floor(Math.random() * data.length);
        return data[index];
    })
}

export const compareStrings = (a: string, b: string): number => {
  return a.localeCompare(b);
}