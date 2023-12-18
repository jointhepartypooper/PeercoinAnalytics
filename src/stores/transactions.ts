import { ref, computed } from "vue";
import { defineStore } from "pinia";
//import type { IRawTransactionResponse } from "../implementation/JsonRPCClient";
import type { ResultData } from "../implementation/TransactionCollection";

//stores raw transactions and results of address
export const useTransactionsStore = defineStore("transactions", () => {
  //const rawTransactions = ref<Array<IRawTransactionResponse>>([]); //state
  const results = ref<Array<ResultData>>([]); //state
  const address = ref(""); //state
  const txids = ref<Array<string>>([]); //state
  // const orderedTransactions = computed(() => {
  //   let arr = [...rawTransactions.value];
  //   arr.sort((a, b) => {
  //     return a.time - b.time;
  //   });
  //   return arr;
  // }); //getter

  //actions:
  function clear() {
    txids.value = [];
    results.value = [];
   // rawTransactions.value = [];
    address.value = "";
  }

  function addTxRange(ids: string[]) {
    const outputArray = Array.from(new Set([...ids, ...txids.value]));
    txids.value = outputArray;
  }

  return {
   // orderedTransactions,
   // rawTransactions,
    address,
    txids,
    results,
    addTxRange,
    clear,
  };
});
