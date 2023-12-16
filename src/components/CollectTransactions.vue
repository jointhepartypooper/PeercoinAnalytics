<script setup lang="ts">
import { computed, nextTick, ref, type PropType } from "vue";
import Setuptem from "./Setuptem.vue";
import VueNumberInput from "../components/VueNumberInput.vue";
import { useTransactionsStore } from "@/stores/transactions";
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

const store = useTransactionsStore();

async function getBlockbookTransactions(
  address: string
): Promise<Array<string> | null> {
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

    return txids;
  } catch (error) {
    console.error(error);
    //throw "could not GET status from blockbook.peercoin.net";
  }
  return null;
}
</script>

<template>
  <Setuptem>
    <template #icon>
      <BIconWrenchAdjustable />
    </template>
    <template #heading>Wallet setup</template>

    <div class="input-group">
      <span class="input-group-text">Address</span>
      <input type="text" aria-label="username" class="form-control" />
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
