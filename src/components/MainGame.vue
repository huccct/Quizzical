<script setup lang="ts">
import type { NumberResponse, Score } from '../types'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getRandomMathLocal, getRandomTriviaLocal } from '../utils'

const emit = defineEmits<{
  (e: 'saveScore', score: Score): void
  (e: 'startGame'): void
  (e: 'updateModal', state: boolean): void
}>()

const fact = ref('')
const number = ref()
const revealed = ref('')
const inputNumber = ref(null)
const score = ref(26)
const guessedLetters = ref(new Set())
const showRes = ref(false)
const resultMessage = ref('')
const resultType = ref<'success' | 'partial' | 'failure'>('success')
const tipMessage = ref('')
const showTip = ref(false)
const showResultModal = ref(false)
const inputPhrase = ref('')

const phraseLetters = computed(() => new Set(fact.value.replace(/[^a-z]/gi, '').toLowerCase()))

const nonPhraseLetters = computed(() => {
  const allLetters = 'abcdefghijklmnopqrstuvwxyz'
  return allLetters.split('').filter(letter => !phraseLetters.value.has(letter))
})

/**
 * Fetch data from the numbers API.
 */
async function fetchData() {
  const initGame = (data: NumberResponse) => {
    fact.value = data.text
    number.value = data.number
    revealed.value = fact.value.replace(/[a-z]/gi, '_')
    guessedLetters.value = new Set()
    score.value = 26
    showRes.value = false
    inputNumber.value = null
    showResultModal.value = false
    inputPhrase.value = ''
    emit('startGame')
  }
  try {
    const res = await fetch('http://numbersapi.com/random/math?json&fragment')
    const data = await res.json()
    console.log(data)
    initGame(data)
  }
  catch {
    // mock local data if the numbers API is down
    const localFetch = Math.random() < 0.5 ? getRandomTriviaLocal : getRandomMathLocal
    const data = await localFetch()
    initGame(data)
  }
}

/**
 * Guess a letter if user guesses a letter that is in the phrase.
 * @param letter - The letter to guess.
 */
function guessLetter(letter: string) {
  if (!revealed.value) {
    revealed.value = fact.value.replace(/[a-z]/gi, '_')
  }
  guessedLetters.value.add(letter.toLowerCase())
  revealed.value = fact.value.replace(/[a-z]/gi, match =>
    guessedLetters.value.has(match.toLowerCase()) ? match : '_')

  // calculate score
  if (!fact.value.toLowerCase().includes(letter.toLowerCase())) {
    score.value = Math.max(score.value - 26 / nonPhraseLetters.value.length, 0)
    tipMessage.value = `Oops! "${letter}" is not in the phrase.`
  }
  else {
    tipMessage.value = `Good guess! "${letter}" is in the phrase`
  }

  showTip.value = true
  setTimeout(() => {
    showTip.value = false
  }, 3000)
}

/**
 * Check if the letter is correct.
 * @param letter - The letter to check.
 * @returns True if the letter is correct, false otherwise.
 */
function isLetterCorrect(letter: string) {
  return fact.value.toLowerCase().includes(letter.toLowerCase())
}

/**
 * Submit the answer.
 */
function submitAnswer() {
  const gotPhrase = inputPhrase.value.toLowerCase() === fact.value.toLowerCase()
  const gotNumber = inputNumber.value === number.value

  if (gotPhrase && gotNumber) {
    score.value = Math.min(score.value + 4, 30)
    resultMessage.value = 'Congratulations! You got both the phrase and number correct!'
    resultType.value = 'success'
  }
  else if (gotPhrase || gotNumber) {
    // 先加分
    if (gotPhrase || gotNumber)
      score.value = Math.min(score.value + 2, 30)
    // 再除以2
    score.value = score.value / 2

    if (gotPhrase) {
      resultMessage.value = `You got the phrase correct, but the number was wrong. The correct number was ${number.value}.`
      resultType.value = 'partial'
    }
    else {
      resultMessage.value = `You got the number correct, but the phrase was wrong. The correct phrase was "${fact.value}".`
      resultType.value = 'partial'
    }
  }
  else {
    resultMessage.value = `Sorry, both were wrong. The correct answer was: ${number.value} is ${fact.value}`
    resultType.value = 'failure'
    score.value = 0
  }

  showRes.value = true
  inputNumber.value = null
  showResultModal.value = true
  emit('saveScore', {
    score: score.value,
    number: number.value!,
    phrase: fact.value,
  })
  emit('updateModal', true)
}

/**
 * Close the result modal.
 */
function closeModal() {
  showResultModal.value = false
  emit('updateModal', false)
}

/**
 * Handle key press events(accessibility).
 * @param event - The keyboard event.
 */
function handleKeyPress(event: KeyboardEvent) {
  const letter = event.key.toLowerCase()
  if (!showRes.value && /^[a-z]$/.test(letter) && !guessedLetters.value.has(letter)) {
    guessLetter(letter)
  }
}

/**
 * Copy the revealed text to the clipboard.
 */
function copyRevealedText() {
  navigator.clipboard.writeText(revealed.value)
    .then(() => {
      tipMessage.value = 'Text copied to clipboard!'
      showTip.value = true
      setTimeout(() => {
        showTip.value = false
      }, 3000)
    })
    .catch(() => {
      tipMessage.value = 'Failed to copy text'
      showTip.value = true
      setTimeout(() => {
        showTip.value = false
      }, 3000)
    })
}

onMounted(() => {
  fetchData()
  window.addEventListener('keypress', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keypress', handleKeyPress)
})
</script>

<template>
  <div class="game-container">
    <h1>Quizzical</h1>
    <p>Work out what the clue is, then work out what number is being described!</p>
    <button class="btn btn-secondary" aria-label="Start a new game" @click="fetchData">
      Start Game
    </button>

    <div class="letter-buttons">
      <button
        v-for="letter in 'abcdefghijklm'" :key="letter" :class="{
          correct: guessedLetters.has(letter) && isLetterCorrect(letter),
          incorrect: guessedLetters.has(letter) && !isLetterCorrect(letter),
        }" :disabled="guessedLetters.has(letter) || showRes" @click="guessLetter(letter)"
      >
        <span :class="{ strikethrough: guessedLetters.has(letter) }">
          {{ letter }}
        </span>
      </button>
    </div>

    <div class="letter-buttons">
      <button
        v-for="letter in 'nopqrstuvwxyz'" :key="letter" :class="{
          correct: guessedLetters.has(letter) && isLetterCorrect(letter),
          incorrect: guessedLetters.has(letter) && !isLetterCorrect(letter),
        }" :disabled="guessedLetters.has(letter) || showRes" @click="guessLetter(letter)"
      >
        <span :class="{ strikethrough: guessedLetters.has(letter) }">
          {{ letter }}
        </span>
      </button>
    </div>

    <!-- tips -->

    <template v-if="!showRes">
      <div class="clue-container">
        <div class="section-header">
          Clue
        </div>
        <div class="phrase-container">
          <button class="btn-copy" @click="copyRevealedText">
            <span class="sr-only">复制提示文字</span>
            📋
          </button>
          <div class="phrase">
            {{ revealed }}
          </div>
        </div>
      </div>

      <div class="answer-container">
        <div class="section-header">
          Answer
        </div>
        <div class="input-group">
          <label for="number-input" class="sr-only">Enter the number</label>
          <input id="number-input" v-model="inputNumber" type="number" placeholder="Number">
          <span class="is-text">is</span>
          <label for="phrase-input" class="sr-only">Enter the phrase</label>
          <input
            id="phrase-input"
            v-model="inputPhrase"
            type="text"
            class="phrase-input"
          >
        </div>
      </div>

      <div class="score-container">
        <b>Score:</b> {{ score.toFixed(2) }}
      </div>

      <button class="btn" aria-label="Submit your answer" @click="submitAnswer">
        Submit Answer
      </button>
    </template>

    <div v-if="showResultModal" class="result-modal">
      <div class="result-content" :class="resultType">
        <h2>Game Result</h2>
        <p>{{ resultMessage }}</p>
        <p class="final-score">
          Final Score: {{ score.toFixed(2) }}
        </p>
        <button class="btn" @click="closeModal">
          Close
        </button>
      </div>
    </div>

    <div
      v-if="showTip"
      class="tip-message"
      :class="{
        'tip-correct': tipMessage.includes('Good guess') || tipMessage.includes('copied'),
        'tip-incorrect': !tipMessage.includes('Good guess') && !tipMessage.includes('copied'),
      }"
    >
      {{ tipMessage }}
    </div>
  </div>
</template>

<style scoped>
.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.letter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin: 1.5rem 0;
}

.letter-buttons button {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.letter-buttons button:hover:not(:disabled) {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.letter-buttons button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.letter-buttons button.correct {
  border-color: #4caf50;
  background-color: #e8f5e9;
}

.letter-buttons button.incorrect {
  border-color: #f44336;
  background-color: #ffebee;
}

.strikethrough {
  text-decoration: line-through;
}

.clue-container, .answer-container {
  margin: 2rem auto;
  padding: 1.5rem;
  max-width: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-header {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.phrase {
  font-family: 'Courier New', monospace;
  font-size: 1.4rem;
  letter-spacing: 2px;
  color: #34495e;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.input-group input {
  width: 120px;
  padding: 0.75rem;
  font-size: 1.2rem;
  border: 2px solid #e9ecef;
  border-radius: 4px;
  text-align: center;
  transition: border-color 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #007bff;
}

.is-text {
  font-size: 1.2rem;
  color: #6c757d;
  font-weight: 500;
}

.score-container {
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(to right, #4776E6, #8E54E9);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 1rem 0;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: white;
  border: 2px solid #2851A3;
  color: #2851A3;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8f9fa;
}

.btn-secondary:disabled {
  border-color: #666;
  color: #666;
  background: white;
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.result-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 70%;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.result-content h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.result-content p {
  margin: 1rem 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

.final-score {
  font-weight: bold;
  font-size: 1.2rem !important;
  color: #2c3e50;
}

.result-content.success {
  border-top: 4px solid #4caf50;
}

.result-content.partial {
  border-top: 4px solid #ff9800;
}

.result-content.failure {
  border-top: 4px solid #f44336;
}

.tip-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.tip-correct {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.tip-incorrect {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #f44336;
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.phrase-container {
  position: relative;
}

.btn-copy {
  position: absolute;
  right: 0;
  top: -50px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.btn-copy:hover {
  background: #f0f0f0;
}

.input-group .phrase-input {
  width: 375px;
}
</style>
