<template>
  <div class="k-means d-block d-lg-flex justify-center">
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
              depressed
              :block="$vuetify.breakpoint.smAndDown"
              class="mr-3"
              @click="generateData"
            >データ生成</v-btn>
          </v-col>
          <v-col class="col-6 col-sm-auto">
            <v-btn
              :disabled="!isLoadedWasm || !data.length"
              color="primary"
              depressed
              :block="$vuetify.breakpoint.smAndDown"
              class="mr-3"
              @click="calcWasmKMeans"
            >計算(WASM)</v-btn>
          </v-col>
          <v-col class="col-6 col-sm-auto">
            <v-btn
              :disabled="!data.length"
              color="primary"
              depressed
              :block="$vuetify.breakpoint.smAndDown"
              @click="calcJsKMeans"
            >計算(JS)</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <div class="chart-wrapper ml-0 ml-sm-5">
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
@media (min-width:1264px) {
  .chart-wrapper {
    width: calc(100% - 600px - 10vw);
  }
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
    nodeCount: 1000,
    calcTime: 0,
    clusterCount: 4,
    data: [],
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
      const kmeans = await (await fetch('/wasm/kmeans.wasm')).arrayBuffer();
      await WebAssembly.instantiate(kmeans, go.importObject)
        .then(result => {
          go.run(result.instance);
          this.isLoadedWasm = true;
        });
    },
    rnorm() {
      return Math.sqrt(-2*Math.log(1 - Math.random()))*Math.cos(2*Math.PI*Math.random());
    },
    generateData() {
      this.data = [];
      [...Array(Number(this.clusterCount))].forEach(() => {
        const randomCoord = [~~(Math.random()*this.clusterCount*200), ~~(Math.random()*this.clusterCount*200)];
        [...Array(Math.ceil(this.nodeCount/this.clusterCount))].forEach(() => {
          this.data.push([~~(this.rnorm()*50) + randomCoord[0], ~~(this.rnorm()*50) + randomCoord[1], 0]);
        });
      });
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      [...Array(Number(this.clusterCount)).keys()].forEach(i => {
        datasets.push({
          label: i,
          data: this.data.filter(point => point[2] === i).map(point => ({
            x: point[0],
            y: point[1]
          })),
          backgroundColor: `hsl(${360*i/this.clusterCount}, 100%, 70%)`
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
        const result = window.kMeans(this.data, Number(this.clusterCount));
        this.data.forEach((point, i) => {
          point[2] = result[i];
        });
        this.calcTime = Date.now() - startTime;
        this.setChartdata();
      } catch (e) {
        await this.importWasm();
      }
    },
    initData() {
      this.data.forEach(point => {
        point[2] = ~~(Math.random()*Number(this.clusterCount));
      });
    },
    calcCenter(clusters) {
      clusters.forEach((cluster, i) => {
        [...Array(2).keys()].forEach(coord => {
          let sumCoords = 0;
          let count = 0;
          this.data.forEach(point => {
            if (point[2] !== i) {
              return;
            }
            count++;
            sumCoords += point[coord];
          });
          if (count > 0) {
            cluster[coord] = sumCoords/count;
          }
        });
      });
    },
    compareCenter(clusters) {
      this.data.forEach(point => {
        const nowDistance = Math.sqrt((point[0] - clusters[point[2]][0])**2 + (point[1] - clusters[point[2]][1])**2);
        clusters.forEach((cluster, i) => {
          const distance = Math.sqrt((point[0] - cluster[0])**2 + (point[1] - cluster[1])**2);
          if (distance < nowDistance) {
            point[2] = i;
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
