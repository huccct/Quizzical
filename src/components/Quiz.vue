<script setup lang="ts">
import type { Score } from '../types'
import { computed, ref } from 'vue'

const props = defineProps<{
  scores: Score[]
  quizAnswers: (number | null)[]
}>()

const emit = defineEmits<{
  (e: 'checkQuizAnswers'): void
}>()

const showResults = ref(false)
const results = ref<{ isCorrect: boolean, correctAnswer: number }[]>([])
const localAnswers = ref([...props.quizAnswers])
const currentPage = ref(0)
const itemsPerPage = 5

// Computed property for paginated scores
const paginatedScores = computed(() => {
  const start = currentPage.value * itemsPerPage
  return props.scores.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(props.scores.length / itemsPerPage))

/**
 * Go to the next page.
 */
function nextPage() {
  if (currentPage.value < totalPages.value - 1)
    currentPage.value++
}

function prevPage() {
  if (currentPage.value > 0)
    currentPage.value--
}

/**
 * Check the quiz answers.
 */
function checkAnswers() {
  results.value = props.scores.map((score, index) => ({
    isCorrect: localAnswers.value[index] === score.number,
    correctAnswer: score.number,
  }))
  showResults.value = true
  emit('checkQuizAnswers')
}
</script>

<template>
  <div class="quiz-container">
    <h2>Quiz</h2>
    <p>Enter the number for each phrase:</p>
    <div class="quiz-list">
      <div v-for="(scoreItem, index) in paginatedScores" :key="index" class="quiz-item">
        <div class="phrase">
          {{ scoreItem.phrase }}
        </div>
        <input
          v-model.number="localAnswers[index + currentPage * itemsPerPage]"
          type="number"
          class="number-input"
          placeholder="Number"
          :aria-label="`Enter number for phrase: ${scoreItem.phrase}`"
        >
        <div v-if="showResults" class="result" :class="[results[index + currentPage * itemsPerPage].isCorrect ? 'correct' : 'incorrect']">
          {{ results[index + currentPage * itemsPerPage].isCorrect
            ? '✓ Correct!'
            : `✗ Wrong! The correct answer is ${results[index + currentPage * itemsPerPage].correctAnswer}` }}
        </div>
      </div>
    </div>

    <!-- Add pagination controls -->
    <div class="pagination-controls">
      <button
        class="btn pagination-btn"
        :disabled="currentPage === 0"
        @click="prevPage"
      >
        Previous
      </button>
      <span class="page-info">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
      <button
        class="btn pagination-btn"
        :disabled="currentPage === totalPages - 1"
        @click="nextPage"
      >
        Next
      </button>
    </div>

    <button class="btn" @click="checkAnswers">
      Check Answers
    </button>
  </div>
</template>

  <style scoped>
  .quiz-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 1rem;
  }

  .quiz-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .quiz-item {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .phrase {
    font-family: 'Courier New', monospace;
    font-size: 1.2rem;
    color: #34495e;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e9ecef;
  }

  .number-input {
    width: 120px;
    padding: 0.75rem;
    font-size: 1.2rem;
    border: 2px solid #e9ecef;
    border-radius: 4px;
    text-align: center;
    transition: border-color 0.2s;
  }

  .number-input:focus {
    outline: none;
    border-color: #4776E6;
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

  .pagination-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 1rem 0;
  }

  .pagination-btn {
    padding: 0.5rem 1rem;
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-info {
    font-size: 0.9rem;
    color: #666;
  }
  </style>
