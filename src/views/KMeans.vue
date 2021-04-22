<template>
  <div class="k-means">
    <v-card
      outlined
      max-width="600"
      class="config-card mb-5"
    >
      <v-card-title>設定</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              v-model="nodeCount"
              label="要素数"
              type="number"
            />
          </v-col>
          <v-col>
            <v-text-field
              v-model="clusterCount"
              label="クラスタ数"
              type="number"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="calcTime"
              readonly
              label="処理時間（ms）"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="col-12 col-sm-auto">
            <v-btn
              :disabled="!isLoadedWasm || !clusterCount"
              depressed
              :block="$vuetify.breakpoint.smAndDown"
              class="mr-3"
              @click="initDataset"
            >データ初期化</v-btn>
          </v-col>
          <v-col class="col-6 col-sm-auto">
            <v-btn
              :disabled="!dataset.length"
              color="primary"
              depressed
              :block="$vuetify.breakpoint.smAndDown"
              class="mr-3"
              @click="calcWasmKMeans"
            >計算(WASM)</v-btn>
          </v-col>
          <v-col class="col-6 col-sm-auto">
            <v-btn
              :disabled="!dataset.length"
              color="primary"
              depressed
              :block="$vuetify.breakpoint.smAndDown"
              @click="calcJsKMeans"
            >計算(JS)</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <div class="ml-0 ml-sm-5">
      <scatter-chart
        ref="chart"
        :chartdata="chartdata"
        :options="options"
      />
    </div>
  </div>
</template>

<style scoped>
.config-card {
  height: fit-content;
}
</style>

<script>
import ScatterChart from '@/components/ScatterChart';

export default {
  components: {
    ScatterChart
  },
  data: () => ({
    isLoadedWasm: false,
    nodeCount: 100,
    calcTime: 0,
    clusterCount: 4,
    dataset: [],
    colors: ['#ff2121', '#007dff', '#87ff00', '#8700ff', '#000000'],
    chartdata: {},
    options: {
      legend: {
        labels: {
          fontSize: 16
        }
      },
      tooltips: {
        bodyFontSize: 16
      },
      scales: {
        xAxes: [{
          ticks: {
            fontSize: 16
          }
        }],
        yAxes: [{
          ticks: {
            fontSize: 16
          }
        }]
      },
      animation: {
        duration: 0
      }
    }
  }),
  mounted() {
    this.importWasm();
  },
  methods: {
    async importWasm() {
      const go = new Go();
      return await WebAssembly.instantiateStreaming(fetch('kmeans.wasm'), go.importObject)
        .then(result => {
          go.run(result.instance);
          this.isLoadedWasm = true;
        });
    },
    initDataset() {
      this.dataset = [];
      [...Array(Number(this.nodeCount))].forEach(() => {
        this.dataset.push([~~(Math.random()*100), ~~(Math.random()*100), 0]);
      });
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      [...Array(Number(this.clusterCount)).keys()].forEach(i => {
        datasets.push({
          label: i,
          data: this.dataset.filter(data => data[2] === i).map(data => ({
            x: data[0],
            y: data[1]
          })),
          backgroundColor: this.colors[i] || `#${Math.floor(Math.random()*0xFFFFFF).toString(16)}`
        });
      });
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    async calcWasmKMeans() {
      const startTime = Date.now();
      try {
        const result = window.kMeans(this.dataset, Number(this.clusterCount));
        this.dataset.forEach((data, i) => {
          data[2] = result[i];
        });
        this.calcTime = Date.now() - startTime;
        this.setChartdata();
      } catch (e) {
        await this.importWasm();
      }
    },
    initData() {
      this.dataset.forEach(data => {
        data[2] = ~~(Math.random()*Number(this.clusterCount));
      });
    },
    calcCenter(clusters) {
      clusters.forEach((cluster, i) => {
        [...Array(2).keys()].forEach(coord => {
          let sumCoords = 0;
          let count = 0;
          this.dataset.forEach(data => {
            if (data[2] !== i) {
              return;
            }
            count++;
            sumCoords += data[coord];
          });
          if (count > 0) {
            cluster[coord] = sumCoords/count;
          }
        });
      });
    },
    compareCenter(clusters) {
      this.dataset.forEach(data => {
        const nowDistance = Math.sqrt((data[0] - clusters[data[2]][0])**2 + (data[1] - clusters[data[2]][1])**2);
        clusters.forEach((cluster, i) => {
          const distance = Math.sqrt((data[0] - cluster[0])**2 + (data[1] - cluster[1])**2);
          if (distance < nowDistance) {
            data[2] = i;
          }
        });
      });
    },
    calcJsKMeans() {
      const startTime = Date.now();
      const clusters = [...Array(Number(this.clusterCount))].map(() => ([0, 0, 0]));
      let beforeClusters = JSON.parse(JSON.stringify(clusters));
      this.initData();
      while (true) {
        this.calcCenter(clusters);
        this.compareCenter(clusters);
        if (JSON.stringify(beforeClusters) === JSON.stringify(clusters)) {
          break;
        }
        beforeClusters = JSON.parse(JSON.stringify(clusters));
      }
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    }
  }
};
</script>
