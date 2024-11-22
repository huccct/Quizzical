<script setup lang="ts">
import type { Score } from '../types'
import { computed, ref } from 'vue'
import { compareStrings } from '../utils'
import Quiz from './Quiz.vue'

const props = defineProps<{
  scores: Score[]
  quizAnswers: (number | null)[]
  showScoreboard: boolean
}>()

const emit = defineEmits<{
  (e: 'startQuiz'): void
  (e: 'checkQuizAnswers'): void
}>()

const sortKey = ref('score')
const sortOrder = ref('desc')
const showQuiz = ref(false)
const quizAnswers = ref<(number | null)[]>([])
const showResults = ref(false)

const sortedScores = computed(() => {
  return [...props.scores].sort((a: Score, b: Score) => {
    const aValue = a[sortKey.value]
    const bValue = b[sortKey.value]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder.value === 'asc'
        ? compareStrings(aValue, bValue)
        : compareStrings(bValue, aValue)
    }
    else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
    }
    return 0
  })
})

function toggleQuiz() {
  showQuiz.value = !showQuiz.value
  if (showQuiz.value) {
    quizAnswers.value = Array.from({ length: props.scores.length }, () => null) as (number | null)[]
  }
}

function checkAnswers() {
  showResults.value = true
  emit('checkQuizAnswers')
}
</script>

<template>
  <div v-if="showScoreboard" class="scoreboard-container">
    <template v-if="!showQuiz">
      <h2>Scoreboard</h2>
      <div class="sort-controls">
        <label for="sort-key">Sort by:</label>
        <select id="sort-key" v-model="sortKey" aria-label="Select a field to sort by">
          <option value="score">
            Score
          </option>
          <option value="number">
            Number
          </option>
          <option value="phrase">
            Phrase
          </option>
        </select>
        <div role="radiogroup" aria-label="Select sort order">
          <label>
            <input v-model="sortOrder" type="radio" value="asc"> Ascending
          </label>
          <label>
            <input v-model="sortOrder" type="radio" value="desc"> Descending
          </label>
        </div>
      </div>
      <table>
        <caption>Scoreboard</caption>
        <thead>
          <tr>
            <th scope="col">
              Score
            </th>
            <th scope="col">
              Number
            </th>
            <th scope="col">
              Phrase
            </th>
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

    <Quiz v-else :scores="scores" :quiz-answers="quizAnswers" @check-quiz-answers="checkAnswers" />

    <div class="button-container">
      <button
        class="btn"
        :disabled="scores.length === 0"
        @click="toggleQuiz"
      >
        {{ showQuiz ? 'Back to Scoreboard' : 'Quiz Me' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.scoreboard-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.sort-controls {
  max-width: 500px;
  margin: 1rem auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.sort-controls select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.sort-controls [role="radiogroup"] {
  display: flex;
  gap: 1rem;
}

.sort-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

table {
  max-width: 500px;
  width: 100%;
  border-collapse: collapse;
  margin: 1rem auto;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

caption {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-bottom: none;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #dee2e6;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f8f9fa;
}

tr:hover {
  background-color: #f2f2f2;
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

.button-container {
  max-width: 600px;
  margin: 1rem auto;
  text-align: center;
}

.result {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.result.correct {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.result.incorrect {
  background-color: #ffebee;
  color: #c62828;
}
</style>
