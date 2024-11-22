<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'

const fact = ref('')
const number = ref(null)
const revealed = ref('')
const inputNumber = ref(null)
const score = ref(26)
const guessedLetters = ref(new Set())
const showRes = ref(false)
const scores = ref([])
const sortKey = ref('score')
const sortOrder = ref('desc')

// 一个包含短语中所有不同字母的集合
const phraseLetters = computed(() => new Set(fact.value.replace(/[^a-z]/gi, '').toLowerCase()))

// 一个包含所有不在短语中的字母的数组
const nonPhraseLetters = computed(() => {
  const allLetters = 'abcdefghijklmnopqrstuvwxyz'
  return allLetters.split('').filter(letter => !phraseLetters.value.has(letter))
})

const fetchData = async () => {
  try {
    const res = await fetch('http://numbersapi.com/random/math?json&fragment')
    const data = await res.json()
    console.log(data);
    fact.value = data.text
    number.value = data.number
    revealed.value = fact.value.replace(/[a-z]/gi, '_')
    guessedLetters.value = new Set() // 重置 guessedLetters 为新的空集合
    score.value = 26 // 重置分数为初始值
    showRes.value = false
    inputNumber.value = null
  } catch (err) {
    console.error('Error fetching data:', err)
  }
}

const saveScore = () => {
  const newScore = {
    score: score.value,
    number: number.value,
    phrase: fact.value
  }
  scores.value.push(newScore)
  localStorage.setItem('quizzicalScores', JSON.stringify(scores.value))
}

const loadScores = () => {
  const storedScores = localStorage.getItem('quizzicalScores')
  if (storedScores) {
    scores.value = JSON.parse(storedScores)
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  const letter = event.key.toLowerCase()
  if (/^[a-z]$/.test(letter) && !guessedLetters.value.has(letter)) {
    guessLetter(letter)
  }
}

onMounted(() => {
  fetchData()
  loadScores()
  window.addEventListener('keypress', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keypress', handleKeyPress)
})

const guessLetter = (letter: string) => {
  if (!revealed.value) {
    revealed.value = fact.value.replace(/[a-z]/gi, '_')
  }
  guessedLetters.value.add(letter.toLowerCase())
  revealed.value = fact.value.replace(/[a-z]/gi, (match) =>
    guessedLetters.value.has(match.toLowerCase()) ? match : '_'
  )
  if (!fact.value.toLowerCase().includes(letter.toLowerCase())) {
    score.value = Math.max(score.value - 26 / nonPhraseLetters.value.length, 0)
  }
}

const isLetterGuessed = (letter: string) => {
  return guessedLetters.value.has(letter)
}

const isLetterCorrect = (letter: string) => {
  return fact.value.toLowerCase().includes(letter.toLowerCase())
}

const submitAnswer = () => {
  const gotPhrase = revealed.value.toLowerCase() === fact.value.toLowerCase()
  const gotNumber = inputNumber.value === number.value

  if (gotPhrase && gotNumber) {
    alert('Congratulations! You got both the phrase and number correct!')
    score.value = Math.min(score.value + 4, 30)
  } else if (gotPhrase || gotNumber) {
    alert(`You got the ${gotPhrase ? 'phrase' : 'number'} correct, but not the ${gotPhrase ? 'number' : 'phrase'}. Your score has been halved.`)
    score.value = Math.floor(score.value / 2)
  } else {
    alert('Sorry, you got both the phrase and number wrong. Your score is now 0.')
    score.value = 0
  }
  showRes.value = true
  inputNumber.value = null
  saveScore()
}

const sortedScores = computed(() => {
  return scores.value.sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a[sortKey.value] - b[sortKey.value]
    } else {
      return b[sortKey.value] - a[sortKey.value]
    }
  })
})
</script>


<template>
  <div class="game-container">
    <h1>Quizzical</h1>
    <p>Work out what the clue is, then work out what number is being described!</p>
    <button @click="fetchData" aria-label="Start a new game">Start Game</button>

    <div class="letter-buttons">
      <button v-for="letter in 'abcdefghijklm'" :key="letter" @click="guessLetter(letter)" :class="{
        'correct': guessedLetters.has(letter) && isLetterCorrect(letter),
        'incorrect': guessedLetters.has(letter) && !isLetterCorrect(letter)
      }" :disabled="guessedLetters.has(letter)">
        <span :class="{ 'strikethrough': guessedLetters.has(letter) }">
          {{ letter }}
        </span>
      </button>
    </div>

    <div class="letter-buttons">
      <button v-for="letter in 'nopqrstuvwxyz'" :key="letter" @click="guessLetter(letter)" :class="{
        'correct': guessedLetters.has(letter) && isLetterCorrect(letter),
        'incorrect': guessedLetters.has(letter) && !isLetterCorrect(letter)
      }" :disabled="guessedLetters.has(letter)">
        <span :class="{ 'strikethrough': guessedLetters.has(letter) }">
          {{ letter }}
        </span>
      </button>
    </div>

    <template v-if="!showRes">
      <div class="clue-container">
        <b>Clue:</b>
        <div class="phrase">{{ revealed }}</div>
      </div>

      <div class="answer-container">
        <label for="number-input">Answer:</label>
        <input type="number" id="number-input" v-model="inputNumber" />
        <span>&nbsp;is&nbsp;</span>
        <div class="phrase">{{ revealed }}</div>
      </div>

      <div class="score-container">
        <b>Score:</b> {{ score.toFixed(2) }}
      </div>

      <button @click="submitAnswer" aria-label="Submit your answer">Submit Answer</button>
    </template>
    <template v-else>
      <h2>Scoreboard</h2>
      <div class="sort-controls">
        <label for="sort-key">Sort by:</label>
        <select id="sort-key" v-model="sortKey" aria-label="Select a field to sort by">
          <option value="score">Score</option>
          <option value="number">Number</option>
          <option value="phrase">Phrase</option>
        </select>
        <div role="radiogroup" aria-label="Select sort order">
          <label>
            <input type="radio" value="asc" v-model="sortOrder"> Ascending
          </label>
          <label>
            <input type="radio" value="desc" v-model="sortOrder"> Descending
          </label>
        </div>
      </div>
      <table>
        <caption>Scoreboard</caption>
        <thead>
          <tr>
            <th scope="col">Score</th>
            <th scope="col">Number</th>
            <th scope="col">Phrase</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(scoreItem, index) in sortedScores" :key="index">
            <td>{{ scoreItem.score.toFixed(2) }}</td>
            <td>{{ scoreItem.number }}</td>
            <td>{{ scoreItem.phrase }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.game-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  overflow-x: auto;
}

.clue-container,
.answer-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 20px;
  flex-wrap: nowrap;
}

.clue-container b,
.answer-container b {
  margin-right: 10px;
}

.phrase {
  font-size: 24px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 8px;
  min-width: 200px;
  display: inline-block;
  text-align: center;
  margin-right: 10px;
}

.letter-buttons {
  margin-top: 10px;
}

.letter-buttons button {
  margin: 5px;
  width: 30px;
}

.letter-buttons button.correct {
  background-color: green;
  color: white;
}

.letter-buttons button.incorrect {
  background-color: red;
  color: white;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  cursor: pointer;
}

.sort-controls {
  margin-bottom: 10px;
}

.sort-controls label {
  margin-right: 10px;
}
</style>