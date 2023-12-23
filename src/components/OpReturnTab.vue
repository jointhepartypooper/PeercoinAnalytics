<script setup lang="ts">
import { computed, ref } from "vue";
import VueMultiselect from "vue-multiselect";
import { useRpcSettingsStore } from "@/stores/rpcsettings";
import {
  JsonRPCClient,
  type ITransactionOutput,
} from "../implementation/JsonRPCClient";

const store = useRpcSettingsStore();
const currentCollapsedIndex = ref<number>(-1);
const vouts = ref<Array<ITransactionOutput>>([]);

const BOOKS = [
  {
    title: "Alice's Adventures in Wonderland",
    authors: ["Lewis Carroll"],
    transaction_id:
      "3154d03bcc1f8fbfd89f2c3672567791187c95ba97d55ca05eca2ab4f40c3430",
    gzipped: false,
    hex_left_trim: 9,
    file_type: "txt",
  },
  {
    title: "The Narrative of the Life of Frederick Douglass",
    authors: ["Frederick Douglass"],
    transaction_id:
      "7c126ee20c5cdc4c8717fe00aa953c402c19b0e3b8a4adac5b848723960a2e4e",
    gzipped: false,
    hex_left_trim: 9,
    file_type: "txt",
  },
  {
    title: "Romeo and Juliet",
    authors: ["William Shakespeare"],
    transaction_id:
      "f40b4c7e97f2e83d1923481c19aed2f6ccaee470c636f7857dc4c970113df204",
    gzipped: false,
    hex_left_trim: 9,
    file_type: "txt",
  },
  {
    title: "Through the Looking-Glass",
    authors: ["Lewis Carroll"],
    transaction_id:
      "0a440999bafedbdf0e3bdc52f6bdb8caf9634cb38cfef84c8fc2a8ad3f853059",
    gzipped: false,
    hex_left_trim: 6,
    file_type: "txt",
  },
  {
    title: "The Emancipation Proclamation",
    authors: ["Abraham Lincoln"],
    transaction_id:
      "2243568d8b9a92d4235503431bc0d2e0c1dfea049f906b66087ab589769fead6",
    gzipped: true,
    hex_left_trim: 4,
    file_type: "txt",
  },
  {
    title: "Peercoin White Paper",
    authors: ["Sunny King", "Scott Nadal"],
    transaction_id:
      "1ff7ac2a0d2a87c846fefd57b8b4e8c3fb8ea1ee1d3c7fc9496c7dc407d9f622",
    gzipped: false,
    hex_left_trim: 9,
    file_type: "pdf",
  },
  {
    title: "The Declaration of Independence",
    authors: ["Representatives of the United States of America"],
    transaction_id:
      "6d852d9c3d7208233aa5906f155a602c02f9a0325786b45220cdc919a52eeb9d",
    gzipped: true,
    hex_left_trim: 4,
    file_type: "txt",
  },
];

const txid = ref<string>(
  "3154d03bcc1f8fbfd89f2c3672567791187c95ba97d55ca05eca2ab4f40c3430"
);

const curSelected = ref<string>(
  "3154d03bcc1f8fbfd89f2c3672567791187c95ba97d55ca05eca2ab4f40c3430"
);
const parsedBooks = computed<Array<ITransactionOutput>>(() => {
  return vouts.value
    .filter(
      (b) =>
        !!b.scriptPubKey &&
        !!b.scriptPubKey.asm &&
        !!b.scriptPubKey.hex &&
        b.scriptPubKey.asm.includes("OP_RETURN ")
    )
    .map((b) => b);
});
const avalableBooks = computed<Array<string>>(() => {
  return BOOKS.filter((b) => b.file_type === "txt" && !b.gzipped).map(
    (b) => b.transaction_id
  );
});

const validTxId = computed<boolean>(() => {
  if (!!txid.value) {
    const str = txid.value;
    const regex = new RegExp(/^[a-fA-F0-9]{64}$/);
    return regex.test(str) == true;
  }
  return false;
});

function getLabel(index: string): string {
  let opt = BOOKS.find((o) => o.transaction_id === index);
  return !!opt ? opt.title : "";
}

function isHex(hex: string): boolean {
  hex = hex.replace(/ /g, "");
  return (
    typeof hex === "string" &&
    (hex.match(/([0-9]|[a-f])/gim) || []).length === hex.length
  );
}

async function getTx(txid: string) {
  const client = new JsonRPCClient(
    "localhost",
    store.name,
    store.password,
    store.port
  );
  const tx = await client.getRawTransactionVerbose(txid);
  vouts.value = !!tx ? tx.vout : [];
}

function convertFromHex(hex: string): string {
  const finalHex = hex.replace(/ /g, "");
  if (isHex(finalHex)) {
    let str = "";
    for (let i = 0; i < finalHex.length; i += 2)
      str += String.fromCharCode(parseInt(finalHex.substring(i, i + 2), 16));
    return str;
  }
  return "";
}

function onClickHeader(index: number) {
  currentCollapsedIndex.value = index;
}

async function onClickGetTx() {
  await getTx(txid.value);
}

function onOptionSelectChange(newoption: string) {
  curSelected.value = newoption;
  txid.value = newoption;
}
</script>

<template>
  <vue-multiselect
    class="dropdown-ppc-style"
    :model-value="curSelected"
    @update:model-value="onOptionSelectChange"
    :customLabel="getLabel"
    :searchable="false"
    :options="avalableBooks"
    placeholder="Select a book"
    selectLabel=""
    deselectLabel=""
    :show-labels="false"
    :allow-empty="false"
  >
  </vue-multiselect>
  <div class="input-group">
    <span class="input-group-text">Transaction</span>
    <input
      class="form-control"
      :class="{ invalid: !!txid && !validTxId }"
      type="text"
      v-model="txid"
    />
    <button class="btn btn-outline-success" type="button" @click="onClickGetTx">
      Get OP_RETURN
    </button>
  </div>

  <div class="mt-5" v-if="parsedBooks.length > 0">
    <div class="accordion">
      <div class="accordion-item" v-for="item in parsedBooks" :key="item.n">
        <h2 class="accordion-header" :id="'heading' + item.n">
          <button
            @click="onClickHeader(item.n)"
            class="accordion-button"
            :class="{ collapsed: item.n !== currentCollapsedIndex }"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="'#collapse' + item.n"
            aria-expanded="true"
            :aria-controls="'collapse' + item.n"
          >
            Text from OP_RETURN at vout {{ item.n }}
          </button>
        </h2>
        <div
          :id="'collapse' + item.n"
          class="accordion-collapse collapse"
          :class="{ show: item.n === currentCollapsedIndex }"
          :aria-labelledby="'heading' + item"
          data-bs-parent="#accordionExample"
        >
          <div class="accordion-body">
            <code>{{ convertFromHex(item.scriptPubKey?.hex ?? "") }}</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
