<template>
  <div class="k-means">
    k平均法

    <scatter-chart
      v-if="dataset.length"
      :chartdata="chartdata"
    />
  </div>
</template>

<script>
import ScatterChart from '@/components/ScatterChart';

export default {
  components: {
    ScatterChart
  },
  data: () => ({
    clusterCount: 4,
    dataset: []
  }),
  computed: {
    chartdata() {
      const datasets = [];
      [...Array(this.clusterCount).keys()].forEach(i => {
        datasets.push({
          label: i,
          data: this.dataset.filter(data => data[2] === i).map(data => ({
            x: data[0],
            y: data[1]
          })),
          backgroundColor: `#${Math.floor(Math.random()*0xFFFFFF).toString(16)}`
        });
      });
      return {
        datasets
      };
    }
  },
  async mounted() {
    const go = new Go();
    await WebAssembly.instantiateStreaming(fetch('kmeans.wasm'), go.importObject)
      .then(result => {
        go.run(result.instance);
      });
    this.initDataset();
    const result = window.kMeans(this.dataset, this.clusterCount);
    this.setResult(result);
  },
  methods: {
    initDataset() {
      [...Array(25)].forEach(() => {
        this.dataset.push([~~(Math.random()*10), ~~(Math.random()*10), 0]);
        this.dataset.push([~~(Math.random()*10) + 50, ~~(Math.random()*10), 0]);
        this.dataset.push([~~(Math.random()*10), ~~(Math.random()*10) + 50, 0]);
        this.dataset.push([~~(Math.random()*10) + 50, ~~(Math.random()*10) + 50, 0]);
      });
    },
    setResult(result) {
      this.dataset.forEach((data, i) => {
        data[2] = result[i];
      });
    }
  }
};
</script>
