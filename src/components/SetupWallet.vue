<script setup lang="ts">
import { computed, nextTick, ref, type PropType } from "vue";
import Setuptem from "./Setuptem.vue";
import VueNumberInput from "../components/VueNumberInput.vue";
import { useRpcSettingsStore } from "@/stores/rpcsettings";
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

interface IBlockbook {
  blockbook: {
    bestHeight: number;
  };
}

const store = useRpcSettingsStore();

const testOk = ref<boolean | null>(null);

const dockerruncommand = computed<string>(() => {
  const first = "docker run -p";
  const name = "--name emptywallet";
  const image = "-d peercoin/peercoind";
  const rpcallowip = "-rpcallowip=0.0.0.0/0";
  const username = `-rpcuser=${store.name}`;
  const password = `-rpcpassword=${store.password}`;

  return `${first} ${store.port}:9902 ${name} ${image} \
    ${rpcallowip} \
    ${password} \
    ${username} \
    -rest=1 \
    -corsdomain=*`;
});
const dockercomposecommand = computed<string>(() => {
  const txtHtml = `<pre><code>
name: emptywallet
services:
    peercoind:
        ports:
            - ${store.port}:9902
        container_name: emptywallet
        image: peercoin/peercoind
        command: -rpcallowip=0.0.0.0/0 -rpcpassword=${store.password}
            -rpcuser=${store.name} -rest=1 -corsdomain=*
</code></pre>`;

  return `${txtHtml}`;
});

const conffile = computed<string>(() => {
  const txtHtml = `<pre><code>

listen=1
server=1
txindex=1
rpcuser=${store.name}
rpcpassword=${store.password}
rpcport=${store.port}
corsdomain=*
rest=1
 
</code></pre>`;

  return `${txtHtml}`;
});

async function checkConnection() {
  const wallettest = await getBlockCount();
  const status = await getBlockbookStatus();
  testOk.value =
    wallettest > 0 &&
    !!status &&
    Math.abs(wallettest - status?.blockbook.bestHeight) < 10;
  store.testOk = testOk.value
}

async function getBlockCount(): Promise<number> {
  const client = new JsonRPCClient(
    "localhost",
    store.name,
    store.password,
    store.port
  );
  return await client.getBlockCount();
}

async function getBlockbookStatus(): Promise<IBlockbook | null> {
  try {
    return (
      await axios.get<IBlockbook>(
        "https://blockbook.peercoin.net/api/",
        null || undefined
      )
    ).data;
  } catch (error) {
    console.error(error);
    throw "could not GET status from blockbook.peercoin.net";
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
      <span class="input-group-text">RPC username and password</span>
      <input
        type="text"
        aria-label="username"
        class="form-control"
        v-model="store.name"
      />
      <input
        type="text"
        aria-label="password"
        class="form-control"
        v-model="store.password"
      />
    </div>
    <div class="input-group mt-2">
      <span class="input-group-text pe-5">RPC port</span>

      <VueNumberInput
        id="frmRpcPort"
        :modelValue="store.port"
        @update:modelValue="(newValue) => store.setPort(newValue)"
        :min="1000"
        :max="9999"
        :step="1"
        :controls="false"
        :required="true"
        inputclass="form-control form-control"
      />
    </div>
  </Setuptem>

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
  </Setuptem>
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
