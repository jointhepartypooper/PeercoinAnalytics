<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import { GChart } from "vue-google-charts";

const props = defineProps({
  title: { type: String, required: true },
  color: { type: String, required: false, default: "#6f9654" },
  xaxislabel: { type: String, required: true },
  yaxislabel: { type: String, required: true },
  xpoints: { type: Array as PropType<Array<Date>>, required: true },
  ypoints: { type: Array as PropType<Array<number>>, required: true },
});

const usedSeries = computed(() => {
  return {
    targetAxisIndex: 0,
    0: { color: props.color },
    1: { color: "#e7711b" },
    2: { color: "#f1ca3a" },
  };
});
const usedLineHeaders = computed<string[]>(() => {
  return [props.xaxislabel, props.yaxislabel];
});

const dataset = computed<any[][]>(() => {
  const arrayData = [] as any[][];
  for (let indexX = 0; indexX < props.xpoints.length; indexX++) {
    const curX = props.xpoints[indexX];
    const curY = props.ypoints[indexX];
    arrayData.push([curX, curY]);
  }

  return arrayData;
});
/**
 * 
 *         var data = google.visualization.arrayToDataTable([
          ['Age', 'Weight'],
          [ 8,      12],
          [ 4,      5.5],
          [ 11,     14],
          [ 4,      5],
          [ 3,      3.5],
          [ 6.5,    7]
        ]);

 * 
 */
 
const chartData = computed(() => {
  return [usedLineHeaders.value, ...dataset.value];
});

const chartOptions = computed(() => {
  return {
    title: props.title,
    interpolateNulls: true,
    pointSize: 2,
    // width: 1155,
    height: 800,
    curveType: "none",
    legend: 'none',

 
    hAxis: {
      gridlines: {
        count: -1,
      },
      scaleType: null,
      //title: props.xaxislabel,
    },
    vAxes: {
      0: {
        title: props.yaxislabel,
      },
    },
    series: usedSeries.value,
    explorer: {
      actions: ["dragToZoom", "rightClickToReset"],
      maxZoomOut: 4.0,
      zoomDelta: 0.1,
      axis: "horizontal",
      maxZoomIn: 0.005,
    },
    animation: {
      duration: 1.5,
      startup: false,
      easing: "linear",
    },
  };
});
</script>

<template>
  <div class="container mb-4">
    <div class="row mt-4">
      <div class="col">
        <GChart type="ColumnChart" :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
