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
              :value="MU"
              readonly
              label="μ"
            />
          </v-col>
          <v-col>
            <v-text-field
              :value="SIGMA**2"
              readonly
              label="σ^2"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              :value="mu1"
              readonly
              label="最尤推定μ"
            />
          </v-col>
          <v-col>
            <v-text-field
              :value="sigma1**2"
              readonly
              label="最尤推定σ^2"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              :value="mu2"
              readonly
              label="ベイズ推定μ"
            />
          </v-col>
          <v-col>
            <v-text-field
              :value="sigma2**2"
              readonly
              label="ベイズ推定σ^2"
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
          <v-col>
            <v-btn
              :disabled="!data.length"
              color="primary"
              depressed
              block
              @click="calc"
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
    type: null,
    mu1: null,
    sigma1: null,
    mu2: null,
    sigma2: null,
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
            min: 0,
            max: 6,
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
    MU: () => 3,
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
      this.mu1 = null;
      this.sigma1 = null;
      this.mu2 = null;
      this.sigma2 = null;
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      if (this.mu1) {
        const inferenceData1 = [];
        [...new Array(100).keys()].map(v => v*6/99).forEach(x => {
          inferenceData1.push([x, this.gaussFunc(x, this.mu1, this.sigma1)]);
        });
        datasets.push({
          label: '最尤推定',
          type: 'line',
          fill: false,
          data: inferenceData1.map(point => ({
            x: point[0],
            y: point[1]
          })),
          pointRadius: 0,
          borderColor: 'hsl(120, 100%, 70%)'
        });
        const epsilonMu1 = (this.mu1 - this.MU)/this.MU;
        const epsilonVar1 = (this.sigma1**2 - this.SIGMA**2)/this.SIGMA**2;
        console.log(`最尤推定: ${epsilonMu1}, ${epsilonVar1}`);

        const inferenceData2 = [];
        [...new Array(100).keys()].map(v => v*6/99).forEach(x => {
          inferenceData2.push([x, this.gaussFunc(x, this.mu2, this.sigma2)]);
        });
        datasets.push({
          label: 'ベイズ推定',
          type: 'line',
          fill: false,
          data: inferenceData2.map(point => ({
            x: point[0],
            y: point[1]
          })),
          pointRadius: 0,
          borderColor: 'hsl(240, 100%, 70%)'
        });
        const epsilonMu2 = (this.mu2 - this.MU)/this.MU;
        const epsilonVar2 = (this.sigma2**2 - this.SIGMA**2)/this.SIGMA**2;
        console.log(`ベイズ推定: ${epsilonMu2}, ${epsilonVar2}`);
      }
      datasets.push({
        label: 'サンプル',
        data: this.data.map(point => ({
          x: point[0],
          y: point[1]
        })),
        pointRadius: 4,
        backgroundColor: 'hsl(0, 100%, 70%)'
      });
      const gaussData = [];
      [...new Array(100).keys()].map(v => v*6/99).forEach(x => {
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
        pointRadius: 0,
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
    calc() {
      const startTime = Date.now();
      this.calcMLE();
      this.calcBayesianInference();
      this.calcTime = Date.now() - startTime;
    },
    calcMLE() {
      // 最尤推定
      const X = this.data.map(p => p[0]);
      this.mu1 = math.mean(X);
      this.sigma1 = Math.sqrt(X.reduce((v, x) => v + (x - this.mu1)**2, 0)/X.length);
      this.setChartdata();
    },
    calcBayesianInference() {
      // ベイズ推定
      const X = this.data.map(p => p[0]);
      const n = X.length;
      const mu0 = 1 - Math.random();
      const var0 = 1 - Math.random();
      const muML = math.mean(X);
      const _var = this.SIGMA**2;
      const muN = n*var0*muML/(n*var0 + _var) + _var*mu0/(n*var0 + _var);
      const sigmaN = Math.sqrt(1/(1/var0 + n/_var));
      this.mu2 = muN;
      this.sigma2 = Math.sqrt(this.SIGMA**2 + sigmaN**2);
      this.setChartdata();
    }
  }
};
</script>
