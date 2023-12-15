<script setup lang="ts">
import { computed, nextTick, ref, type PropType } from "vue";
import WelcomeItem from "./WelcomeItem.vue";
import VueNumberInput from "../components/VueNumberInput.vue";
import { useRpcSettingsStore } from "@/stores/rpcsettings";
import {  
  BIconWrenchAdjustable,
  BIconGraphUp,
} from "bootstrap-icons-vue";
const store = useRpcSettingsStore();
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
corsdomain=https://findstake.peercoin.net (or * to accept all domains)
rest=1
 
</code></pre>`;

  return `${txtHtml}`;
});
</script>

<template>
  <WelcomeItem>
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
      <span class="input-group-text">RPC port</span>

      <VueNumberInput
        id="frmRpcPort"
        :modelValue="store.port"
        @update:modelValue="(newValue) => store.setPort(newValue)"
        :min="1000"
        :max="9999"
        :step="1"
        :controls="false"
        :required="true"
        inputclass="form-control form-control-sm"
      />
    </div>
  </WelcomeItem>

  <WelcomeItem>
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
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <BIconGraphUp />
    </template>
    <template #heading>Click on next tab</template>

    ...
  </WelcomeItem>
</template>
 
 