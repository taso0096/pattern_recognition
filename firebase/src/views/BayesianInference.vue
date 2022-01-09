<template>
  <div class="d-block d-lg-flex justify-center">
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
          <v-col class="col-12 col-sm-auto">
            <v-btn
              :disabled="!data.length"
              color="primary"
              depressed
              :block="$vuetify.breakpoint.smAndDown"
              @click="calcBayesianInference"
            >計算</v-btn>
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
    nodeCount: 100,
    calcTime: 0,
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
            min: -0.5,
            max: 0.5,
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
  computed: {
    mu: () => 0,
    sigma: () => 9
  },
  methods: {
    generateData() {
      this.data = [];
      [...new Array(Number(this.nodeCount)).keys()].map(v => v/(this.nodeCount - 1) - 0.5).forEach(x => {
        this.data.push([x, this.gaussFunc(x)]);
      });
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      datasets.push({
        label: 'サンプル',
        data: this.data.map(point => ({
          x: point[0],
          y: point[1]
        })),
        backgroundColor: 'hsl(0, 100%, 70%)'
      });
      const gaussData = [];
      [...new Array(100).keys()].map(v => v/99 - 0.5).forEach(x => {
        gaussData.push([x, this.gaussFunc(x)]);
      });
      datasets.push({
        label: 'ガウス分布',
        type: 'line',
        fill: false,
        data: gaussData.map(point => ({
          x: point[0],
          y: point[1]
        })),
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: '#ddd'
      });
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    gaussFunc(x) {
      return (1/Math.sqrt(2*Math.PI*this.sigma**2))*Math.exp(-1*(x - this.mu)**2/2*this.sigma**2);
    },
    calcBayesianInference() {
      const startTime = Date.now();
      // ベイズ推定
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    }
  }
};
</script>
