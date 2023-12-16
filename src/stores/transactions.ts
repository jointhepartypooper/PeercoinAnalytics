import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { IDecodeRawTransactionResponse } from "../implementation/JsonRPCClient";

export interface IDecodeRawTransactionResponseHash {
  [hash: string]: IDecodeRawTransactionResponse;
}
export interface IDecodeRawTransactionResponseHash {
  [unixtimestamp: number]: IDecodeRawTransactionResponse;
}
export const useTransactionsStore = defineStore("transactions", () => {
  const txMap = ref<IDecodeRawTransactionResponseHash>({}); //state
  const address = ref(""); //state
  const txids = ref<Array<string>>([]); //state
  const count = computed(() => txids.value.length); //getter example

  //actions:
  function clear() {
    txids.value = [];
    address.value = "";
    txMap.value = {};
  }

  function addTxRange(ids: string[]) {
    const outputArray = Array.from(new Set([...ids, ...txids.value]));
    txids.value = outputArray;
  }
  return { txMap, address, txids, addTxRange, clear };
});
