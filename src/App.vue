<script setup lang="ts">
import { ref, computed } from 'vue'
import { getRandomMathLocal } from './utils/numberFacts'

const fact = ref('')
const number = ref(null)
const revealed = ref('')
const guessedLetters = ref([])
const userPhrase = ref('')
const userNumber = ref(null)
const score = ref(26)
const scores = ref([])

async function fetchData() {
  try {
    const resp = await fetch('http://numbersapi.com/random/math?json')
    const data = await resp.json()
    fact.value = data.text
    number.value = data.number
    revealed.value = fact.value.replace(/[a-z]/gi, '_')
  } catch (err) {
    const data = await getRandomMathLocal()
    fact.value = data.text
    number.value = data.number
    revealed.value = fact.value.replace(/[a-z]/gi, '_')
  }
}

function guessLetter(letter: string) {
  if (!guessedLetters.value.includes(letter)) {
    guessedLetters.value.push(letter)

    if (fact.value.toLowerCase().includes(letter.toLowerCase())) {
      revealed.value = fact.value.replace(/[a-z]/gi, (char) =>
        guessedLetters.value.includes(char.toLowerCase()) ? char : '_'
      )
    } else {
      score.value--
    }
  }
}

function submitAnswer() {
  let bonus = 0
  if (userPhrase.value.toLowerCase() === fact.value.toLowerCase()) {
    bonus += 2
  }
  if (userNumber.value === number.value) {
    bonus += 2
  }

  if (bonus === 4) {
    score.value += bonus
  } else if (bonus === 2) {
    score.value = Math.floor(score.value / 2)
  } else {
    score.value = 0
  }

  scores.value.push({
    score: score.value,
    number: number.value,
    fact: fact.value,
  })

  startNewGame()
}

async function startNewGame() {
  guessedLetters.value = []
  userPhrase.value = ''
  userNumber.value = null
  score.value = 26

  await fetchData()
}

const sortedScores = computed(() => {
  return scores.value.sort((a, b) => b.score - a.score)
})

fetchData()
</script>

<template>
  <div class="game-container">
    <h1 class="game-title">Number Guessing Game</h1>
    <p class="phrase">{{ revealed }}</p>
    <p class="score">Score: {{ score }}</p>

    <div class="input-container">
      <input class="input" type="text" v-model="userPhrase" placeholder="Guess the phrase" />
      <input class="input" type="number" v-model="userNumber" placeholder="Guess the number" />
      <button class="btn" @click="submitAnswer">Submit</button>
    </div>

    <div class="letter-buttons">
      <button class="btn letter-btn" v-for="letter in 'abcdefghijklmnopqrstuvwxyz'" :key="letter"
        @click="guessLetter(letter)">
        {{ letter }}
      </button>
    </div>

    <button class="btn new-game-btn" @click="startNewGame">New Game</button>

    <h2 class="scoreboard-title">Scoreboard</h2>
    <table class="scoreboard">
      <thead>
        <tr>
          <th>Score</th>
          <th>Number</th>
          <th>Fact</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(score, index) in sortedScores" :key="index">
          <td>{{ score.score }}</td>
          <td>{{ score.number }}</td>
          <td>{{ score.fact }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.game-title {
  text-align: center;
  margin-bottom: 20px;
}

.phrase {
  font-size: 24px;
  text-align: center;
  margin-bottom: 10px;
}

.score {
  text-align: center;
  margin-bottom: 20px;
}

.input-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.input {
  padding: 10px;
  margin-right: 10px;
  font-size: 16px;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}

.letter-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
}

.letter-btn {
  width: 40px;
  height: 40px;
  margin: 5px;
}

.new-game-btn {
  display: block;
  margin: 0 auto 20px;
}

.scoreboard-title {
  text-align: center;
  margin-bottom: 10px;
}

.scoreboard {
  width: 100%;
  border-collapse: collapse;
}

.scoreboard th,
.scoreboard td {
  padding: 10px;
  text-align: center;
  border: 1px solid #ccc;
}
</style>
