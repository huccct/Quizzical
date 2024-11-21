const mathFacts = [
  { text: '2 is the only even prime number', number: 2 },
  { text: '5 is the only prime number that ends in 5', number: 5 },
  { text: '27 is the only positive integer that is three times the sum of its digits', number: 27 },
  // Add more math facts here...
]

export function getRandomMathLocal() {
  const randomIndex = Math.floor(Math.random() * mathFacts.length)
  return Promise.resolve(mathFacts[randomIndex])
} 