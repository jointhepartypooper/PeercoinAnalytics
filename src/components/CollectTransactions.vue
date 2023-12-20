<script setup lang="ts">
import { computed, ref } from "vue";
import axios from "axios";

import {
  BIconWrenchAdjustable,
  BIconGraphUp,
  BIconFloppy2,
} from "bootstrap-icons-vue";
import FileSaver from "file-saver";
import Setuptem from "./Setuptem.vue";
import {
  TransactionCollection,
  type ResultData,
} from "../implementation/TransactionCollection";
import { useTransactionsStore } from "@/stores/transactions";
import { useRpcSettingsStore } from "@/stores/rpcsettings";
import { JsonRPCClient } from "../implementation/JsonRPCClient";
import FileReader from "../components/FileReader.vue";
import ChartsOverview from "../components/ChartsOverview.vue";

let collector: null | TransactionCollection = null;

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
interface IPersistentDataJson {
  addrStr: string;
  transactionIds: string[];
  results: Array<ResultData>;
}

const store = useTransactionsStore();
const settingsStore = useRpcSettingsStore();
const busyGetBlockbookTransactions = ref<boolean>(false);
const peercoinAddress = ref<string>("");
const progressGetTx = ref<number>(0);
const progressAnalyseTx = ref<number>(0);
const combinedProgress = computed<number>(() => {
  return Math.ceil(
    0.1 * (7.5 * progressAnalyseTx.value + 2.5 * progressGetTx.value)
  );
});
const validPPCAddress = computed<boolean>(() => {
  if (!!peercoinAddress.value) {
    const str = peercoinAddress.value;
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
    //show total tx:
    store.addTxRange(data.transactions);
    store.address = data.addrStr;
    const promiseLoad: Promise<ResultData[]> = getResults(
      data.addrStr,
      getCollector(),
      data.transactions
    );

    const resultData = await promiseLoad;
    store.clear();
    store.address = data.addrStr;
    store.addTxRange(data.transactions);
    store.results = resultData;
  }

  busyGetBlockbookTransactions.value = false;
}

function getCollector(): TransactionCollection {
  if (!collector) {
    collector = new TransactionCollection(
      new JsonRPCClient(
        "localhost",
        settingsStore.name,
        settingsStore.password,
        settingsStore.port
      )
    );
  }
  return collector;
}

async function getResults(
  targetaddr: string,
  txcollection: TransactionCollection,
  txids: string[]
): Promise<ResultData[]> {
  const rawTxs = await txcollection.fetchTransactions(txids, (p) => {
    progressGetTx.value = p;
  });

  return await txcollection.procdata(targetaddr, rawTxs, (p) => {
    progressAnalyseTx.value = p;
  });
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

function onSave() {
  const obj = {
    addrStr: store.address,
    transactionIds: store.txids,
    results: store.results,
  } as IPersistentDataJson;
  const myJSON = JSON.stringify(obj, null, 2);
  // Note: Ie and Edge don't support the new File constructor,
  // so it's better to construct blobs and use saveAs(blob, filename)
  const file = new File([myJSON], (obj.addrStr ?? "myAddress") + ".json", {
    type: "text/plain;charset=utf-8",
  });
  FileSaver.saveAs(file);
}

function isIPersistentDataJsonType(o: any): o is IPersistentDataJson {
  return "addrStr" in o && "transactionIds" in o && "results" in o;
}

function onFileLoad(jsonString: string) {
  if (!jsonString) return;

  const parsed = JSON.parse(jsonString);

  if (isIPersistentDataJsonType(parsed)) {
    store.clear();
    store.address = parsed.addrStr;
    store.addTxRange(parsed.transactionIds);
    store.results = parsed.results;
    progressGetTx.value = 100;
    progressAnalyseTx.value = 100;
  } else {
    console.warn("This file aint right");
  }
}
</script>

<template>
  <Setuptem v-if="combinedProgress < 100.0">
    <template #icon>
      <BIconWrenchAdjustable />
    </template>
    <template #heading>Transactions</template>
    <div class="my-2">
      Get transaction from wallet by address.
      <span class="text-info my-1" v-if="!settingsStore.testOk">
        Pass the connection test first
      </span>
    </div>

    <div class="input-group" v-if="settingsStore.testOk">
      <span class="input-group-text">Address</span>
      <input
        id="peercoinAddressinp"
        class="form-control"
        :class="{ invalid: !!peercoinAddress && !validPPCAddress }"
        type="text"
        v-model="peercoinAddress"
      />
      <button
        :disabled="
          busyGetBlockbookTransactions ||
          !validPPCAddress ||
          !settingsStore.testOk
        "
        class="btn btn-outline-success"
        type="button"
        @click="onClickGetTx"
      >
        Get transactions
      </button>
    </div>
    <div v-if="settingsStore.testOk" class="progress" style="height: 2px">
      <div
        class="progress-bar bg-success"
        role="progressbar"
        :style="{ width: combinedProgress + '%' }"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
    <div class="my-2" v-if="store.txids.length > 0">
      {{ store.txids.length }} transactions found for this address
    </div>
    <div class="my-3" v-if="!busyGetBlockbookTransactions">
      or import a previous session
    </div>
    <FileReader
      v-if="!busyGetBlockbookTransactions"
      @text-loaded="onFileLoad"
    />
  </Setuptem>

  <Setuptem v-if="combinedProgress >= 100">
    <template #icon>
      <BIconFloppy2 />
    </template>
    <template #heading>Export results</template>
    <button type="button" class="btn btn-outline-success" @click="onSave">
      Save
    </button>
  </Setuptem>
  <Setuptem v-if="combinedProgress >= 100">
    <template #icon>
      <BIconGraphUp />
    </template>
    <template #heading>Charts</template>
    <div class="charts">
      <ChartsOverview />
    </div>
  </Setuptem>
</template>

<style lang="scss" scoped>
.invalid {
  border-bottom: 2px solid rgb(223, 98, 98);
}
</style>
