<script setup lang="ts">
import { computed, ref } from "vue";

import Slider from "@vueform/slider";
import { useTransactionsStore } from "@/stores/transactions";
import LineChart from "../components/LineChart.vue";

const store = useTransactionsStore();



const dateRangeValues = ref<Array<number>>([
  Math.floor(0.001 * store.dataRange.start.getTime()),
  Math.floor(0.001 * store.dataRange.end.getTime()),
]);

const xTotalPlotValues = computed<Array<Date>>(() => {
  return !!store.address && store.results.length > 0 && !!store.dataRange
    ? store.results.map((r) => new Date(1000 * r.date))
    : [];
});
const yTotalPlotValues = computed<Array<number>>(() => {
  return !!store.address && store.results.length > 0 && !!store.dataRange
    ? store.results.map((r) => r.amtTotal)
    : [];
});
const showResults = computed<boolean>(() => {
  return !!store.address && store.results.length > 0 && !!store.dataRange;
});

function formatLongDate(
  timestamp: number,
  longFormat: boolean = false
): string {
  const options = longFormat
    ? ({
        weekday: "short", // long, short, narrow
        day: "numeric", // numeric, 2-digit
        year: "numeric", // numeric, 2-digit
        month: "short", // numeric, 2-digit, long, short, narrow
        hour: "numeric", // numeric, 2-digit
        minute: "numeric", // numeric, 2-digit
        second: "numeric", // numeric, 2-digit
      } as Intl.DateTimeFormatOptions)
    : ({
        day: "numeric", // numeric, 2-digit
        year: "numeric", // numeric, 2-digit
        month: "short", // numeric, 2-digit, long, short, narrow
        hour: "numeric", // numeric, 2-digit
      } as Intl.DateTimeFormatOptions);

  return new Date(timestamp * 1000).toLocaleString(
    Intl.DateTimeFormat().resolvedOptions().locale,
    options
  );
}
</script>

<template>
  <div v-if="showResults" class="mt-5">
    <div class="row mt-5">
      <div class="col-12">
        <LineChart
          :title="'Balance ('+store.address+')'"
          xaxislabel="days"
          yaxislabel="balance"
          :xpoints="xTotalPlotValues"
          :ypoints="yTotalPlotValues"
        />
      </div>
    </div>

    <div class="row mt-5">
      <div class="col-12">
        <Slider
          v-model="dateRangeValues"
          :step="3600 * 4"
          :format="formatLongDate"
          :min="Math.floor(0.001 * store.dataRange.start.getTime())"
          :max="Math.floor(0.001 * store.dataRange.end.getTime())"
        >
        </Slider>
      </div>
    </div>
    <div class="mt-3">
      <button class="btn btn-outline-success" type="button">
        Generate 4 more charts (todo)
      </button>
    </div>
  </div>
</template>
