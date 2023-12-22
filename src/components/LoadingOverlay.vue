<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps({
  loading: Boolean,
  text: String,
});

 
const bc = computed<string>(() => {
  return "rgba(255,255,255,0.42)";
});
</script>

<template>
  <div
    class="loading-screen"
    v-if="loading"
    :style="{ backgroundColor: bc }"
  >
    <div>
      <div v-if="!!text" class="loading-circle"></div>
      <p v-if="!!text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9300;
  flex-direction: column;
  user-select: none;
  background-color: rgb(24, 109, 21) !important;
  opacity: 0.5;
}
.loading-circle {
  width: 50px;
  height: 50px;
  border-radius: 100%;
  border: 2px solid transparent;
  border-left-color: #ababab;
  animation: circleanimation 0.45s linear infinite;
}
.loading-text {
  margin-top: 15px;
  color: #2c2f2b;
  font-size: 14px;
  font-weight: 200%;
  text-align: center;
}
@keyframes circleanimation {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(360deg);
  }
}
</style>
