import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { IDecodeRawTransactionResponse } from "../implementation/JsonRPCClient";

export interface IDecodeRawTransactionResponseHash {
  [hash: string]: IDecodeRawTransactionResponse;
}
export interface IDecodeRawTransactionResponseTime {
  [unixtimestamp: number]: IDecodeRawTransactionResponse; //in seconds!!!. assumed is there is just 1 tx at maximum of that address in that 1 secons
}

//stores raw transactions of address
export const useTransactionsStore = defineStore("transactions", () => {
  const txMapHash = ref<IDecodeRawTransactionResponseHash>({}); //state
  const txMapTime = ref<IDecodeRawTransactionResponseTime>({}); //state
  const address = ref(""); //state
  const txids = ref<Array<string>>([]); //state
  const count = computed(() => txids.value.length); //getter example

  //actions:
  function clear() {
    txids.value = [];
    address.value = "";
    txMapHash.value = {};
    txMapTime.value = {};
  }

  function addTxRange(ids: string[]) {
    const outputArray = Array.from(new Set([...ids, ...txids.value]));
    txids.value = outputArray;
  }

  function setMaps(txs: Array<IDecodeRawTransactionResponse>) {
    let tmpHash = {} as IDecodeRawTransactionResponseHash;
    let tmpTime = {} as IDecodeRawTransactionResponseTime;
    for (let index = 0; index < txs.length; index++) {
      const raw = txs[index];

      tmpHash[raw.hash] = raw;
      tmpTime[raw.time] = raw;
    }
    txMapHash.value = tmpHash;
    txMapTime.value = tmpTime;
  }









  return { txMapHash, txMapTime, address, txids, addTxRange, clear, setMaps };
});
