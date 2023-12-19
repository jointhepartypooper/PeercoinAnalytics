import "./assets/main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import axios from "axios";
import axiosRetry from "axios-retry";
import "./assets/bootstrap-night.min.css";
  import "@vueform/slider/themes/default.css"
import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// Exponential back-off retry delay between requests
axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
  onRetry: (retryCount, error, requestConfig) => {
    console.log("retry count: ", retryCount);
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
