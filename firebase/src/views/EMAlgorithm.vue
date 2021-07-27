<template>
  <div class="em-algorithm d-block d-lg-flex justify-center">
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
              :disabled="!X.length"
              color="primary"
              depressed
              :block="$vuetify.breakpoint.smAndDown"
              @click="calcEMAlgorithm"
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
    nodeCount: 1000,
    calcTime: 0,
    clusterCount: 3,
    X: [],
    starParameters: {
      pi: [],
      mu: [],
      sigma: []
    },
    emParameters: {
      pi: [],
      mu: [],
      sigma: []
    },
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
  computed: {
    D: () => 2
  },
  methods: {
    rnorm() {
      return Math.sqrt(-2*Math.log(1 - Math.random()))*Math.cos(2*Math.PI*Math.random());
    },
    generateData() {
      const D = this.D;
      const N = Number(this.nodeCount);
      const K = Number(this.clusterCount);
      this.X = [];
      this.starParameters.pi = [];
      this.starParameters.mu = [];
      this.starParameters.sigma = [];
      [...Array(K)].forEach(() => {
        const randomCoord = [~~(Math.random()*K*20), ~~(Math.random()*K*20)];
        const X = [];
        [...Array(Math.ceil(N/K))].forEach(() => {
          X.push([~~(this.rnorm()*5) + randomCoord[0], ~~(this.rnorm()*5) + randomCoord[1]]);
        });
        this.X.push(...X);
        this.starParameters.pi.push(1/K);
        this.starParameters.mu.push(randomCoord);
        const e = math.mean(X, 0);
        const v = math.variance(X, 0, 'uncorrected');
        const cov = X.reduce((cov, x) => cov + (x[0] - e[0])*(x[1] - e[1]), 0)/X.length;
        const sigma = math.add(math.subtract(math.multiply(math.ones(D, D), cov), math.diag([...Array(D)].map(() => cov))), math.diag(v));
        this.starParameters.sigma.push(sigma);
      });
      this.setChartdata();
    },
    setChartdata() {
      const K = Number(this.clusterCount);
      const datasets = [];
      datasets.push({
        label: 0,
        data: this.X.map(point => ({
          x: point[0],
          y: point[1]
        })),
        backgroundColor: `hsl(${360*0/K}, 100%, 70%)`
      });
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    calcN(x, mu, sigma) {
      const D = this.D;
      const a = 1/(2*Math.PI)**(D/2);
      const b = 1/math.det(sigma)**(1/2);
      const c = math.multiply(-1/2, math.transpose(math.subtract(x, mu)));
      const d = math.inv(sigma);
      const e = math.subtract(x, mu);
      return a*b*math.exp(math.multiply(c, d, e));
    },
    calcLikelihood(X, pi, mu, sigma) {
      const K = Number(this.clusterCount);
      let likelihood = 0;
      X.forEach(x => {
        [...Array(K).keys()].forEach(k => {
          likelihood += Math.log(pi[k]*this.calcN(x, mu[k], sigma[k]));
        });
      });
      return likelihood;
    },
    calcGamma(X, pi, mu, sigma) {
      const K = Number(this.clusterCount);
      const gamma = [];
      X.forEach(x => {
        gamma.push([]);
        let sum = 0;
        [...Array(K).keys()].forEach(k => {
          sum += pi[k]*this.calcN(x, mu[k], sigma[k]);
        });
        [...Array(K).keys()].forEach(k => {
          gamma.slice(-1)[0].push(pi[k]*this.calcN(x, mu[k], sigma[k])/sum);
        });
      });
      return gamma;
    },
    calcMu(X, gamma, Nm) {
      const K = Number(this.clusterCount);
      const mu = [];
      X.forEach((x, n) => {
        mu.push([]);
        [...Array(K).keys()].forEach(m => {
          mu.slice(-1)[0].push(math.multiply(1/Nm[m], gamma[n][m], x));
        });
      });
      return math.sum(mu, 0);
    },
    calcSigma(X, gamma, Nm, mu) {
      const K = Number(this.clusterCount);
      const sigma = [];
      X.forEach((x, n) => {
        sigma.push([]);
        [...Array(K).keys()].forEach(m => {
          sigma.slice(-1)[0].push(math.multiply(1/Nm[m], gamma[n][m], math.multiply(math.transpose([math.subtract(mu[m], x)]), [math.subtract(mu[m], x)])));
        });
      });
      return math.sum(sigma, 0);
    },
    calcEMAlgorithm() {
      const startTime = Date.now();
      const D = this.D;
      const N = Number(this.nodeCount);
      const K = Number(this.clusterCount);
      // パラメータ初期値
      this.emParameters.pi = [...Array(K)].map(() => Math.random()/K);
      this.emParameters.mu = [...Array(K)].map(() => [...Array(D)].map(() => Math.random()*5));
      this.emParameters.sigma = [...Array(K)].map(() => math.add(math.multiply(math.ones(D, D), Math.random()*5), math.diag([...Array(D)].map(() => Math.random()*5))));

      let count = 0;
      let delta = 1;
      while (count < 200 && Math.abs(delta) >= 0.01) {
        // E-step
        const gamma = this.calcGamma(this.X, ...Object.values(this.emParameters));
        const Nm = math.sum(gamma, 0);

        // M-step
        const newParameters = {
          pi: math.divide(Nm, N),
          mu: this.calcMu(this.X, gamma, Nm),
          sigma: this.calcSigma(this.X, gamma, Nm, this.emParameters.mu)
        };

        // 対数尤度関数
        const l = this.calcLikelihood(this.X, ...Object.values(this.emParameters));
        const newL = this.calcLikelihood(this.X, ...Object.values(newParameters));
        this.emParameters = { ...newParameters };
        delta = newL - l;
        count++;
      }
      this.calcTime = Date.now() - startTime;

      // 結果
      console.log(count);
      console.log(this.starParameters);
      console.log(this.emParameters);
      console.log(this.calcLikelihood(this.X, ...Object.values(this.starParameters)), this.calcLikelihood(this.X, ...Object.values(this.emParameters)));
    }
  }
};
</script>
