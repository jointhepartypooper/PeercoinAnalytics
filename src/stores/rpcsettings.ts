import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useRpcSettingsStore = defineStore("rpcseetings", () => {
  const port = ref(9902); //state
  const name = ref("A_Wallet_Username"); //state
  const password = ref("Correct_Horse_Battery_Staple"); //state
  //const doubleCount = computed(() => count.value * 2); //getter example

  //actions:
  function setPort(newVal:number) {
    port.value = newVal;
  }

  return { port, name, password, setPort };
});
