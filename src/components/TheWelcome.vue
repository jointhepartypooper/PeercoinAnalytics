<script setup lang="ts">
import { computed, nextTick, ref, type PropType } from "vue";
import WelcomeItem from "./WelcomeItem.vue";
import VueNumberInput from "../components/VueNumberInput.vue";
import {
  BIconWrench,
  BIconWrenchAdjustable,
  BIconGraphUp,
} from "bootstrap-icons-vue";

const rpcPort = ref<number>(9999);
const rpcUsername = ref<string>("My_Wallet_Username");
const rpcPassword = ref<string>("Correct_Horse_Battery_Staple");

const dockerruncommand = computed<string>(() => {
  const first = "docker run -p";
  const name = "--name emptywallet";
  const image = "-d peercoin/peercoind";
  const rpcallowip = "-rpcallowip=0.0.0.0/0";
  const username = `-rpcuser=${rpcUsername.value}`;
  const password = `-rpcpassword=${rpcPassword.value}`;

  return `${first} ${rpcPort.value}:9902 ${name} ${image} \
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
            - ${rpcPort.value}:9902
        container_name: peercoind
        image: peercoin/peercoind
        command: -rpcallowip=0.0.0.0/0 -rpcpassword=${rpcPassword.value}
            -rpcuser=${rpcUsername.value} -rest=1 -corsdomain=*
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
        v-model="rpcUsername"
      />
      <input
        type="text"
        aria-label="password"
        class="form-control"
        v-model="rpcPassword"
      />
    </div>
    <div class="input-group mt-2">
      <span class="input-group-text">RPC port</span>

      <VueNumberInput
        id="frmRpcPort"
        :modelValue="rpcPort"
        @update:modelValue="(newValue) => (rpcPort = newValue)"
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
    <div class="my-2">or with compose.yaml:</div>
    <div v-html="dockercomposecommand"></div>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <BIconGraphUp />
    </template>
    <template #heading>Click on next tab</template>

    ...
  </WelcomeItem>
</template>
