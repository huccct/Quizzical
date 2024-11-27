<template>
  <footer class="validator-footer">
    <a href="https://jigsaw.w3.org/css-validator/check/referer">
      <img
        src="https://jigsaw.w3.org/css-validator/images/vcss-blue"
        alt="Valid CSS!"
        width="88"
        height="31"
      >
    </a>
    <a href="https://validator.w3.org/check?uri=https://quizzical-sable.vercel.app/">
      <img
        src="https://www.w3.org/Icons/valid-html401-blue"
        alt="Valid HTML!"
        width="88"
        height="31"
      >
    </a>
  </footer>
</template>

<style scoped>
.validator-footer {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
  margin-top: auto;
}

.validator-footer img {
  border: 0;
}
</style>
