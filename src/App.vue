<script setup lang="ts">
import { ref, onMounted } from 'vue'

const fact = ref('')
const number = ref(null)
const revealed = ref('')
const userNumber = ref(null)
const score = ref(0)
const guessedLetters = ref(new Set())

const fetchData = async () => {
  try {
    const res = await fetch('http://numbersapi.com/random/math?json&fragment')
    const data = await res.json()
    console.log(data);
    fact.value = data.text
    number.value = data.number
    revealed.value = fact.value.replace(/[a-z]/gi, '_')
  } catch (err) {
    console.error('Error fetching data:', err)

  }
}
onMounted(() => {
  fetchData()
})

const guessLetter = (letter: string) => {
  guessedLetters.value.add(letter.toLowerCase())
  revealed.value = fact.value.replace(/[a-z]/gi, (match) =>
    guessedLetters.value.has(match.toLowerCase()) ? match : '_'
  )
}

const isLetterGuessed = (letter: string) => {
  return guessedLetters.value.has(letter)
}

const isLetterCorrect = (letter: string) => {
  return fact.value.toLowerCase().includes(letter.toLowerCase())
}

const submitAnswer = () => {
  const gotPhrase = revealed.value.toLowerCase() === fact.value.toLowerCase()
  const gotNumber = userNumber.value === number.value

  if (gotPhrase && gotNumber) {
    alert('Congratulations! You got both the phrase and number correct!')
  } else if (gotPhrase) {
    alert('You got the phrase correct, but not the number. Try again!')
  } else if (gotNumber) {
    alert('You got the number correct, but not the phrase. Try again!')
  } else {
    alert('Sorry, you got both the phrase and number wrong. Try again!')
  }

  guessedLetters.value.clear()
  userNumber.value = null
  fetchData()
}
</script>


<template>
  <div class="game-container">
    <h1>Quizzical</h1>
    <p>Work out what the clue is, then work out what number is being described!</p>
    <button @click="fetchData">Start Game</button>

    <div class="letter-buttons">
      <button v-for="letter in 'abcdefghijklm'" :key="letter" @click="guessLetter(letter)" :class="{
        'correct': isLetterGuessed(letter) && isLetterCorrect(letter),
        'incorrect': isLetterGuessed(letter) && !isLetterCorrect(letter)
      }" :disabled="isLetterGuessed(letter)">
        <span :class="{ 'strikethrough': isLetterGuessed(letter) }">
          {{ letter }}
        </span>
      </button>
    </div>

    <div class="letter-buttons">
      <button v-for="letter in 'nopqrstuvwxyz'" :key="letter" @click="guessLetter(letter)" :class="{
        'correct': isLetterGuessed(letter) && isLetterCorrect(letter),
        'incorrect': isLetterGuessed(letter) && !isLetterCorrect(letter)
      }" :disabled="isLetterGuessed(letter)">
        <span :class="{ 'strikethrough': isLetterGuessed(letter) }">
          {{ letter }}
        </span>
      </button>
    </div>

    <div class="clue-container">
      <b>Clue:</b>
      <input class="phrase" :value="revealed" readonly>
    </div>

    <div class="answer-container">
      <b>Answer:</b>
      <input type="number" v-model="userNumber" style="width: 50px" />
      <span>&nbsp;is&nbsp;</span>
      <input class="phrase" :value="revealed" readonly>
    </div>


    <div class="score-container">
      <b>Score:</b> {{ score.toFixed(2) }}
    </div>

    <button @click="submitAnswer">Submit Answer</button>

  </div>
</template>
<style scoped>
.game-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.clue-container,
.answer-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.clue-container b,
.answer-container b {
  margin-right: 10px;
}

.phrase {
  font-size: 24px;
  border: none;
  outline: none;
  width: 100%;
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
</style>