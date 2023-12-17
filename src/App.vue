<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

  

<template>
  <vue3-progress-bar></vue3-progress-bar>
  <div class="container my-5">
    <h1 class="text-center">Address analyser</h1>

    <ul class="nav nav-tabs nav-tabs-frame maintab">
      <li class="nav-item">
        <router-link
          to="/"
          class="nav-link "
          active-class="active"
          aria-current="page"
          >Home</router-link
        >
      </li>
      <li class="nav-item">
        <router-link
          to="/address"
          class="nav-link "
          active-class="active"
          aria-current="page"
          >Address</router-link
        >
      </li>
    </ul>

    <div class="container tab-frame">
      <router-view />
    </div>
  </div>
</template>



<style lang="scss" scoped>
@import "../node_modules/@marcoschulte/vue3-progress/dist/index.scss";

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
