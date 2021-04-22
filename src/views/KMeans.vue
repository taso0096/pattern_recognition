<template>
  <div class="k-means">
    <v-row>
      <v-col>
        <v-card outlined>
          <v-card-title>設定</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="clusterCount"
              label="クラスタ数"
            />
            <v-btn
              :disabled="!isLoadedWasm || !clusterCount"
              depressed
              class="mr-3"
              @click="initDataset"
            >データ初期化</v-btn>
            <v-btn
              :disabled="!dataset.length"
              color="primary"
              depressed
              @click="calcKMeans"
            >計算</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <scatter-chart
          ref="chart"
          :chartdata="chartdata"
          :options="options"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ScatterChart from '@/components/ScatterChart';

export default {
  components: {
    ScatterChart
  },
  data: () => ({
    isLoadedWasm: false,
    clusterCount: 4,
    dataset: [],
    colors: ['#ff2121', '#007dff', '#87ff00', '#8700ff', '#000000'],
    chartdata: {},
    options: {
      responsive: false,
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
      }
    }
  }),
  async mounted() {
    const go = new Go();
    await WebAssembly.instantiateStreaming(fetch('kmeans.wasm'), go.importObject)
      .then(result => {
        go.run(result.instance);
        this.isLoadedWasm = true;
      });
  },
  methods: {
    initDataset() {
      this.dataset = [];
      [...Array(25)].forEach(() => {
        this.dataset.push([~~(Math.random()*10), ~~(Math.random()*10), 0]);
        this.dataset.push([~~(Math.random()*10) + 50, ~~(Math.random()*10), 0]);
        this.dataset.push([~~(Math.random()*10), ~~(Math.random()*10) + 50, 0]);
        this.dataset.push([~~(Math.random()*10) + 50, ~~(Math.random()*10) + 50, 0]);
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
    calcKMeans() {
      const result = window.kMeans(this.dataset, this.clusterCount);
      this.dataset.forEach((data, i) => {
        data[2] = result[i];
      });
      this.setChartdata();
    }
  }
};
</script>
