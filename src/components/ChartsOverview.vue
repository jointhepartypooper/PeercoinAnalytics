<script setup lang="ts">
import { computed, ref } from "vue";
import Slider from "@vueform/slider";
import { useTransactionsStore } from "@/stores/transactions";
import LineChart from "../components/LineChart.vue";
import ColumnChart from "../components/ColumnChart.vue";
import { TransactionCollection } from "../implementation/TransactionCollection";

const store = useTransactionsStore();
const avg = ref<number | null>(null);
const interest = ref<number | null>(null);
const stake = ref<number | null>(null);
const periodic = ref<boolean | null>(null);
const continously = ref<boolean | null>(null);
const dateRangeValues = ref<Array<number>>([
  Math.floor(0.001 * store.dataRange.start.getTime()),
  Math.floor(0.001 * store.dataRange.end.getTime()),
]);
const xInterestValues = ref<Array<Date>>([]);
const yInterestValues = ref<Array<number>>([]);
const xStakeValues = ref<Array<Date>>([]);
const yStakeValues = ref<Array<number>>([]);
const xMintRewardValues = ref<Array<Date>>([]);
const yMintRewardValues = ref<Array<number>>([]);
const xMintTimeValues = ref<Array<Date>>([]);
const yMintTimeValues = ref<Array<number>>([]);

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

function showStats() {
  const stats = TransactionCollection.getStats(
    dateRangeValues.value[0],
    dateRangeValues.value[1],
    store.results
  );
  avg.value = stats.avg;
  stake.value = stats.stake;
  interest.value = stats.interest;
  periodic.value = !stats.continuousMinter;
  continously.value = stats.continuousMinter;

  const plotData = TransactionCollection.datedata(
    dateRangeValues.value[0],
    dateRangeValues.value[1],
    store.results
  );
  xInterestValues.value = plotData[0].xAxis;
  yInterestValues.value = plotData[0].yAxis;
  xStakeValues.value = plotData[1].xAxis;
  yStakeValues.value = plotData[1].yAxis;
  xMintRewardValues.value = plotData[2].xAxis;
  yMintRewardValues.value = plotData[2].yAxis;
  xMintTimeValues.value = plotData[3].xAxis;
  yMintTimeValues.value = plotData[3].yAxis;
}

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
      } as Intl.DateTimeFormatOptions);

  return new Date(timestamp * 1000).toLocaleString(
    Intl.DateTimeFormat().resolvedOptions().locale,
    options
  );
}
</script>

<template>
  <div v-if="showResults" class="container-lg mt-5">
    <div class="row mt-5">
      <div class="col-12">
        <LineChart
          :title="'Balance (' + store.address + ')'"
          xaxislabel="Time"
          yaxislabel="Balance"
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
      <button class="btn btn-outline-success" type="button" @click="showStats">
        Show stats over selected period
      </button>
    </div>

    <form class="row g-3 mt-4">
      <div class="col-md-6">
        <label class="form-label">Average Peercoin Balance</label>
        <input readonly type="text" class="form-control" :value="avg" />
      </div>
      <div class="col-md-6">
        <label class="form-label">Peercoin Minted</label>
        <input type="text" class="form-control" :value="stake" />
      </div>

      <div class="col-md-6">
        <label class="form-label">Average Annualized Interest</label>
        <input readonly type="text" class="form-control" :value="interest" />
      </div>
      <div class="col-md-6">
        <label class="form-label">Minter Behavior</label>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            disabled
            :checked="periodic === true"
          />
          <label class="form-check-label"> periodic </label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            :checked="continously === true"
            disabled
          />
          <label class="form-check-label"> continously </label>
        </div>
      </div>
    </form>

    <div class="row mt-5" v-if="xInterestValues.length > 0">
      <div class="col-12">
        <LineChart
          title="Annualized Interest"
          xaxislabel="Time"
          yaxislabel="Annualized Interest (%)"
          :xpoints="xInterestValues"
          :ypoints="yInterestValues"
        />
      </div>
    </div>

    <div class="row mt-5" v-if="xStakeValues.length > 0">
      <div class="col-12">
        <LineChart
          title="Percentage of Balance"
          xaxislabel="Time"
          yaxislabel="Percentage of Balance Minted (%)"
          :xpoints="xStakeValues"
          :ypoints="yStakeValues"
        />
      </div>
    </div>

    <div class="row mt-5" v-if="xMintRewardValues.length > 0">
      <div class="col-12">
        <ColumnChart
          title="Reward of Mint Events"
          xaxislabel="Time"
          yaxislabel="Mint Reward (# Coins)"
          :xpoints="xMintRewardValues"
          :ypoints="yMintRewardValues"
        />
      </div>
    </div>
    
    <div class="row mt-5" v-if="xMintTimeValues.length > 0">
      <div class="col-12">
        <ColumnChart
          title="Average Time Between Mints"
          xaxislabel="Time"
          yaxislabel="Time Between Mint Events (Days)"
          :xpoints="xMintTimeValues"
          :ypoints="yMintTimeValues"
        />
      </div>
    </div>
  </div>
</template>
