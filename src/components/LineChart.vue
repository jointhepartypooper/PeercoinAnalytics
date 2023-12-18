<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import { GChart } from "vue-google-charts";

const props = defineProps({
  title: { type: String, required: true },
  color: { type: String, required: false },
  xaxislabel: { type: String, required: true },
  yaxislabel: { type: String, required: true },
  xpoints: { type: Array as PropType<Array<Date>>, required: true },
  ypoints: { type: Array as PropType<Array<number>>, required: true },
});

const usedSeries = computed(() => {
  return {
    targetAxisIndex: 0,
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

// const chartDatwa = ref<any[]>([
//   ["output", "Sales", "name3"],

//   [0.1, 0.1, 3.23],
//   [1, 1, 3.23],
//   [6, 8, 3.23],
//   [7, 13, 3.23],
//   [8, 21, 3.23],
//   [9, 34, 3.23],
//   [10, 55, 3.23],
//   [11, 89, 3.23],
//   [12, 144, 3.23],
//   [13, 233, 3.23],
//   [14, 377, 3.23],
//   [15, 610, 3.23],
//   [16, 987, 3.23],
//   [26, 987, 3.23],
//   [56, 987, 3.23],
//   [66, 987, 3.23],
//   [76, 987, 3.23],
//   [126, 987, 3.23],
// ]);
const chartData = computed(() => {
  return [usedLineHeaders.value, ...dataset.value];
});

const linearOptions = computed(() => {
  return {
    title: props.title,
    interpolateNulls: true,
    pointSize: 2,
    // width: 1155,
    height: 800,
    curveType: "none",
    legend: 'none',

    lineWidth: 1,
    hAxis: {
      gridlines: {
        count: -1,
      },
      scaleType: null,
      title: props.xaxislabel,
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
        <GChart type="LineChart" :data="chartData" :options="linearOptions" />
      </div>
    </div>
  </div>
</template>
