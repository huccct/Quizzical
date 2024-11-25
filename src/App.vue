<script setup lang="ts">
import type { QuizResult, Score } from './types'
import { ref } from 'vue'
import LeaderBoard from './components/LeaderBoard.vue'
import MainGame from './components/MainGame.vue'
import Quiz from './components/Quiz.vue'

const scores = ref<Score[]>([])
const quizMode = ref<boolean>(false)
const quizAnswers = ref<(number | null)[]>([])
const quizResults = ref<QuizResult[] | null>(null)
const showLeaderboard = ref<boolean>(true)
const showScoreboard = ref<boolean>(true)
const isModalOpen = ref(false)

function loadScores() {
  const storedScores = localStorage.getItem('quizzicalScores')
  if (storedScores)
    scores.value = JSON.parse(storedScores)
}

function saveScore(score: Score) {
  scores.value.push(score)
  localStorage.setItem('quizzicalScores', JSON.stringify(scores.value))
  showLeaderboard.value = true
  showScoreboard.value = true
}

function startQuiz() {
  quizMode.value = true
  quizAnswers.value = Array.from({ length: scores.value.length }, () => null)
}

function checkQuizAnswers() {
  quizResults.value = quizAnswers.value.map((answer, index) => ({
    userAnswer: answer,
    isCorrect: answer === scores.value[index].number,
  }))
  quizMode.value = false
}

function resetQuiz() {
  quizResults.value = null
}

function handleStartGame() {
  showScoreboard.value = false
  showLeaderboard.value = false
}

function handleModalState(state: boolean) {
  isModalOpen.value = state
}

loadScores()
</script>

<template>
  <div :class="{ 'modal-open': isModalOpen }">
    <MainGame 
      v-if="!quizMode && !quizResults" 
      @save-score="saveScore" 
      @start-game="handleStartGame"
      @update-modal="handleModalState"
    />
    <LeaderBoard
      v-if="showLeaderboard"
      :scores="scores"
      :quiz-answers="quizAnswers"
      :show-scoreboard="showScoreboard"
      @start-quiz="startQuiz"
    />
    <Quiz
      v-if="quizMode"
      :scores="scores"
      :quiz-answers="quizAnswers"
      @check-quiz-answers="checkQuizAnswers"
    />
    <template v-if="quizResults">
      <div class="quiz-results">
        <h2>Quiz Results</h2>
        <ul>
          <li v-for="(result, index) in quizResults" :key="index">
            <p>{{ scores[index].phrase }}</p>
            <p>Your answer: {{ result.userAnswer }}, Correct answer: {{ scores[index].number }}</p>
            <p :class="{ correct: result.isCorrect }">
              {{ result.isCorrect ? 'Correct!' : 'Incorrect' }}
            </p>
          </li>
        </ul>
        <button @click="resetQuiz">
          Back to Scoreboard
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.quiz-results {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

li p {
  margin: 0.5rem 0;
}

li p:first-child {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

li p:last-child {
  color: #4caf50;
}

li p:last-child:not(.correct) {
  color: #f44336;
}

button {
  display: block;
  margin: 2rem auto 0;
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #0056b3;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.modal-open {
  height: 100vh;
  overflow: hidden;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
}
</style>
