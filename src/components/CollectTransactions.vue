<script setup lang="ts">
import { computed, nextTick, ref, type PropType } from "vue";
import Setuptem from "./Setuptem.vue";
import {TransactionCollection} from "../implementation/TransactionCollection"
import type { IDecodeRawTransactionResponse } from "../implementation/JsonRPCClient";
import VueNumberInput from "../components/VueNumberInput.vue";
import { useTransactionsStore } from "@/stores/transactions";
import { useRpcSettingsStore } from "@/stores/rpcsettings";
import {useProgress} from '@marcoschulte/vue3-progress';
import {
  BIconWrenchAdjustable,
  BIconGraphUp,
  BIconCloudCheck,
  BIconCheck2,
} from "bootstrap-icons-vue";
import { JsonRPCClient } from "../implementation/JsonRPCClient";
import axios from "axios";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();

interface IAddressResponse {
  page: number;
  addrStr: string;
  totalPages: number;
  transactions: string[];
}

interface BlockbookTxData {
  addrStr: string;
  transactions: Array<string>;
}

const store = useTransactionsStore();
const settingsStore = useRpcSettingsStore();
const busyGetBlockbookTransactions = ref<boolean>(false);
const peercoinAddress = ref<string>("");

const validPPCAddress = computed<boolean>(() => {
  if (!!peercoinAddress.value) {
    const str = peercoinAddress.value;
    //bc1 is bitcoin prefix, so does ppercoin have such a prefix?
    const regex = new RegExp(/^(pc1|[Pp])[a-km-zA-HJ-NP-Z1-9]{25,34}$/);

    return regex.test(str) == true;
  }

  return false;
});

async function onClickGetTx() {
  if (busyGetBlockbookTransactions.value) return;
  busyGetBlockbookTransactions.value = true;
  const data = await getBlockbookTransactions(peercoinAddress.value);

  if (!!data && !!data.addrStr) {

    const promise: Promise<IDecodeRawTransactionResponse[]> = loadRawTx(data.transactions);
    const attached = useProgress().attach(promise);
    await promise;

    store.clear();
    store.address = data.addrStr;
    store.addTxRange(data.transactions);



  }

  busyGetBlockbookTransactions.value = false;
}

async function loadRawTx(txids:string[]):Promise<IDecodeRawTransactionResponse[]>{
  const client = new TransactionCollection(new JsonRPCClient("localhost", settingsStore.name, settingsStore.password, settingsStore.port));
  const ggg= await client.fetchTransactions(txids);
  return []
}

async function getBlockbookTransactions(
  address: string
): Promise<BlockbookTxData | null> {
  try {
    let txids = [] as string[];
    let curPage = 1;

    let page = (
      await axios.get<IAddressResponse>(
        "https://blockbook.peercoin.net/api/address/" +
          address +
          "?page=" +
          curPage,
        null || undefined
      )
    ).data;
    txids = [...txids, ...page.transactions];
    if (!!page && page.totalPages > page.page) {
      do {
        curPage++;
        page = (
          await axios.get<IAddressResponse>(
            "https://blockbook.peercoin.net/api/address/" +
              address +
              "?page=" +
              curPage,
            null || undefined
          )
        ).data;
        txids = [...txids, ...page.transactions];
      } while (page.totalPages > page.page);
    }

    return {
      addrStr: page.addrStr,
      transactions: txids,
    } as BlockbookTxData;
  } catch (error) {
    console.error(error);
    //throw "could not GET status from blockbook.peercoin.net";
  }
  return null;
}

async function getRawTx(){



  
}

</script>

<template>
  <Setuptem>
    <template #icon>
      <BIconWrenchAdjustable />
    </template>
    <template #heading>Transactions</template>

    <div class="input-group">
      <span class="input-group-text">Address</span>
      <input
        id="peercoinAddressinp"
        class="form-control"
        :class="{ invalid: !!peercoinAddress && !validPPCAddress }"
        type="text"
        v-model="peercoinAddress"
      />
      <button
        :disabled="!validPPCAddress"
        class="btn btn-outline-success"
        type="button"
        @click="onClickGetTx"
      >
        Get transactions ids
      </button>
    </div>
  </Setuptem>
  <!-- 
  <Setuptem>
    <template #icon>
      <BIconWrenchAdjustable />
    </template>
    <template #heading>Setup wallet in docker</template>
    <code>
      {{ dockerruncommand }}
    </code>
    <div class="mt-4">or with compose.yaml:</div>
    <div v-html="dockercomposecommand"></div>
    <div class="mt-4">or with peercoin.conf:</div>
    <div v-html="conffile"></div>
  </Setuptem>
  <Setuptem>
    <template #icon>
      <BIconCloudCheck />
    </template>
    <template #heading>Test connection</template>
    <button
      type="button"
      class="btn"
      :class="{
        'btn-success': testOk === null,
        'btn-outline-success': testOk === true,
        'btn-outline-danger': testOk === false,
      }"
      @click="checkConnection"
    >
      Test wallet RPC <BIconCheck2 v-if="testOk" />
    </button>
  </Setuptem> -->
  <Setuptem>
    <template #icon>
      <BIconGraphUp />
    </template>
    <template #heading>Next tab</template>
    <button
      type="button"
      class="btn btn-success"
      @click="router.push({ name: 'address' })"
    >
      Next
    </button>
  </Setuptem>
</template>

<style lang="scss" scoped>
.invalid {
  border-bottom: 2px solid rgb(223, 98, 98);
}
</style>
