<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useRpcSettingsStore } from "@/stores/rpcsettings";
import {
  BIconCheck2,
} from "bootstrap-icons-vue";
const store = useRpcSettingsStore();
</script>

<template>
  <div class="container my-5">
    <h1 class="text-center">Analyze a Peercoin Address</h1>

    <ul class="nav nav-tabs nav-tabs-frame maintab">
      <li class="nav-item">
        <router-link to="/" class="nav-link" aria-current="page"
          >Setup <BIconCheck2 v-if="store.testOk"
        /></router-link>
      </li>
      <li class="nav-item">
        <router-link to="/address" class="nav-link" aria-current="page"
          >Address</router-link
        >
      </li>
      <li class="nav-item" v-if="store.testOk">
        <router-link to="/opreturn" class="nav-link" aria-current="page"
          >Books</router-link
        >
      </li>
    </ul>
    <div class="container tab-frame mt-3">
      <router-view />
    </div>
  </div>
</template>
 
<style lang="scss" scoped>

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
.router-link-active.router-link-exact-active.nav-link {
  color: aquamarine;
}
@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
