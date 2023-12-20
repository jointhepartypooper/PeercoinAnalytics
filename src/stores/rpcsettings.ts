import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useRpcSettingsStore = defineStore("rpcseetings", () => {
  const port = ref(9902); //state
  const name = ref("A_Wallet_Username"); //state
  const password = ref("Correct_Horse_Battery_Staple"); //state
  const testOk = ref(false); //state
  //actions:
  function setPort(newVal:number) {
    port.value = newVal;
  }

  return { port, name, password, testOk, setPort };
});
