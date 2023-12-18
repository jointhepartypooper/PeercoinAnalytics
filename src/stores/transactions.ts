import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { ResultData } from "../implementation/TransactionCollection";

//stores raw transactions and results of address
export const useTransactionsStore = defineStore("transactions", () => {
  const results = ref<Array<ResultData>>([]); //state
  const address = ref(""); //state
  const txids = ref<Array<string>>([]); //state

  const dataRange = computed(() => {
    let arr = [...results.value];
    if (!arr) null;
    arr.sort((a, b) => {
      return a.date - b.date;
    });
    //strips timestamps:
    const start = new Date(new Date(1000 * arr[0].date).toDateString());
    var enddate = new Date(1000 * arr[arr.length - 1].date);
    // add a day
    enddate.setDate(enddate.getDate() + 1);

    const end = new Date(enddate.toDateString());

    return {
      start,
      end,
    };
  }); //getter example

  //actions:
  function clear() {
    txids.value = [];
    results.value = [];
    address.value = "";
  }

  function addTxRange(ids: string[]) {
    const outputArray = Array.from(new Set([...ids, ...txids.value]));
    txids.value = outputArray;
  }

  return {
    address,
    txids,
    results,
    addTxRange,
    clear,
    dataRange,
  };
});
