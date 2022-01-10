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
          <v-col>
            <v-btn
              depressed
              block
              class="mr-3"
              @click="generateData"
            >データ生成</v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="col-12 col-sm-6">
            <v-btn
              :disabled="!data.length"
              color="primary"
              depressed
              block
              @click="calcMLE"
            >最尤推定</v-btn>
          </v-col>
          <v-col class="col-12 col-sm-6">
            <v-btn
              :disabled="!data.length"
              color="primary"
              depressed
              block
              @click="calcBayesianInference"
            >ベイズ推定</v-btn>
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
    type: null,
    mu: null,
    sigma: null,
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
            min: -3,
            max: 3,
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
    MU: () => 0,
    SIGMA: () => 1
  },
  methods: {
    generateData() {
      this.data = [];
      [...new Array(Number(this.nodeCount))].forEach(() => {
        const x = this.rnorm(this.MU, this.SIGMA);
        this.data.push([x, this.gaussFunc(x, this.MU, this.SIGMA)]);
      });
      this.type = null;
      this.mu = null;
      this.sigma = null;
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      if (this.type) {
        const inferenceData = [];
        [...new Array(100).keys()].map(v => v*6/99 - 3).forEach(x => {
          inferenceData.push([x, this.gaussFunc(x, this.mu, this.sigma)]);
        });
        datasets.push({
          label: this.type === 1 ? '最尤推定' : 'ベイズ推定',
          type: 'line',
          fill: false,
          data: inferenceData.map(point => ({
            x: point[0],
            y: point[1]
          })),
          backgroundColor: 'hsl(180, 100%, 70%)',
          borderColor: 'hsl(180, 100%, 70%)'
        });
      }
      datasets.push({
        label: 'サンプル',
        data: this.data.map(point => ({
          x: point[0],
          y: point[1]
        })),
        backgroundColor: 'hsl(0, 100%, 70%)'
      });
      const gaussData = [];
      [...new Array(100).keys()].map(v => v*6/99 - 3).forEach(x => {
        gaussData.push([x, this.gaussFunc(x, this.MU, this.SIGMA)]);
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
    rnorm(mu, sigma) {
      return Math.sqrt(-2*Math.log(1 - Math.random()))*Math.cos(2*Math.PI*Math.random())*sigma + mu;
    },
    gaussFunc(x, mu, sigma) {
      return (1/Math.sqrt(2*Math.PI*sigma**2))*Math.exp(-1*(x - mu)**2/2*sigma**2);
    },
    calcMLE() {
      this.type = 1;
      this.mu = null;
      this.sigma = null;
      const startTime = Date.now();
      // 最尤推定
      const X = this.data.map(p => p[0]);
      this.mu = math.mean(X);
      this.sigma = Math.sqrt(X.reduce((v, x) => v + (x - this.mu)**2, 0)/X.length);
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    },
    calcBayesianInference() {
      this.type = 2;
      this.mu = null;
      this.sigma = null;
      const startTime = Date.now();
      // ベイズ推定
      const X = this.data.map(p => p[0]);
      const n = X.length;
      const mu0 = 1 - Math.random();
      const var0 = 1 - Math.random();
      const muML = math.mean(X);
      const _var = this.SIGMA**2;
      const muN = n*var0*muML/(n*var0 + _var) + _var*mu0/(n*var0 + _var);
      const sigmaN = Math.sqrt(1/(1/var0 + n/_var));
      this.mu = muN;
      this.sigma = Math.sqrt(this.SIGMA**2 + sigmaN**2);
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    }
  }
};
</script>
