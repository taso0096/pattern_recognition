<template>
  <div class="em-algorithm d-block d-lg-flex justify-center">
    <v-card
      outlined
      max-width="600"
      min-width="300"
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

      <v-card-title>パラメータ設定値</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              v-for="(pi, i) in starParameters.pi"
              :key="i"
              :value="pi"
              :label="`π_${i}`"
              type="number"
              readonly
            />
          </v-col>
          <v-col>
            <v-text-field
              v-for="(mu, i) in starParameters.mu"
              :key="i"
              :value="`[${mu}]`"
              :label="`µ_${i}`"
              readonly
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-textarea
              v-for="(sigma, i) in starParameters.sigma"
              :key="i"
              :value="displaySigma(sigma)"
              :label="`∑_${i}`"
              readonly
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card
      outlined
      max-width="600"
      min-width="300"
      class="config-card mb-5 ml-lg-3"
    >
      <v-card-title>パラメータ推定値</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              v-for="(pi, i) in emParameters.pi"
              :key="i"
              :value="pi"
              :label="`π_${i}`"
              type="number"
              readonly
            />
          </v-col>
          <v-col>
            <v-text-field
              v-for="(mu, i) in emParameters.mu"
              :key="i"
              :value="`[${mu.map(v => Math.round(v*100)/100)}]`"
              :label="`µ_${i}`"
              readonly
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-textarea
              v-for="(sigma, i) in emParameters.sigma"
              :key="i"
              :value="displaySigma(sigma)"
              :label="`∑_${i}`"
              readonly
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="calcTime"
              readonly
              label="処理時間（ms）"
              :error="isFailedSimulation"
            />
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
    isFailedSimulation: false,
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
    displaySigma(sigma) {
      return (sigma._data || sigma).reduce((text, arr) => {
        return `${text}  [${arr.map(v => Math.round(v*100)/100)}],\n`;
      }, '[\n') + ']';
    },
    rnorm() {
      return Math.sqrt(-2*Math.log(1 - Math.random()))*Math.cos(2*Math.PI*Math.random());
    },
    generateData() {
      const D = this.D;
      const N = Number(this.nodeCount);
      const K = Number(this.clusterCount);
      this.X = [];
      this.calcTime = 0;
      while (!this.X.length || this.calcLikelihood(this.X, ...Object.values(this.starParameters)) === -Infinity) {
        this.X = [];
        this.starParameters.pi = [];
        this.starParameters.mu = [];
        this.starParameters.sigma = [];
        this.emParameters.pi = [];
        this.emParameters.mu = [];
        this.emParameters.sigma = [];
        let sumNodeCount = 0;
        [...Array(K).keys()].map(i => ++i).forEach(i => {
          const randomCoord = [~~(Math.random()*K*100), ~~(Math.random()*K*100)];
          const X = [];
          const s = Math.random() > 0.5;
          const n = i === K ? N - sumNodeCount : Math.ceil(N*(Math.random() + 0.5)/K);
          sumNodeCount += n;
          [...Array(n)].forEach(() => {
            X.push([~~(this.rnorm()*(s ? 50 : 10)) + randomCoord[0], ~~(this.rnorm()*(s ? 10 : 50)) + randomCoord[1]]);
          });
          this.X.push(...X);
          this.starParameters.pi.push(n/1000);
          this.starParameters.mu.push(randomCoord);
          const e = math.mean(X, 0);
          const v = math.variance(X, 0, 'uncorrected');
          const cov = X.reduce((cov, x) => cov + (x[0] - e[0])*(x[1] - e[1]), 0)/X.length;
          const sigma = math.add(math.subtract(math.multiply(math.ones(D, D), cov), math.diag([...Array(D)].map(() => cov))), math.diag(v));
          this.starParameters.sigma.push(sigma);
        });
      }
      this.setChartdata();
    },
    selectCluster(x) {
      const K = Number(this.clusterCount);
      let cluster;
      let greaterP = 0;
      [...Array(K).keys()].forEach(k => {
        const p = this.calcP(x, this.emParameters.mu[k], this.emParameters.sigma[k]);
        if (p > greaterP) {
          cluster = k;
          greaterP = p;
        }
      });
      return cluster;
    },
    setChartdata() {
      const K = Number(this.clusterCount);
      const datasets = [];
      if (this.emParameters.pi.length) {
        [...Array(K).keys()].forEach(k => {
          datasets.push({
            label: k,
            data: this.X.filter(x => this.selectCluster(x) === k).map(x => ({
              x: x[0],
              y: x[1]
            })),
            backgroundColor: `hsl(${360*k/K}, 100%, 70%)`
          });
        });
      } else {
        datasets.push({
          label: 0,
          data: this.X.map(x => ({
            x: x[0],
            y: x[1]
          })),
          backgroundColor: 'hsl(0, 100%, 70%)'
        });
      }
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    calcP(x, mu, sigma) {
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
          likelihood += Math.log(pi[k]*this.calcP(x, mu[k], sigma[k]));
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
          sum += pi[k]*this.calcP(x, mu[k], sigma[k]);
        });
        [...Array(K).keys()].forEach(k => {
          gamma.slice(-1)[0].push(pi[k]*this.calcP(x, mu[k], sigma[k])/sum);
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
      this.isFailedSimulation = false;
      const startTime = Date.now();
      const D = this.D;
      const N = Number(this.nodeCount);
      const K = Number(this.clusterCount);
      let simulateCount = 0;
      let stepCount = 0;
      let newL = -Infinity;

      while (simulateCount < 20 && (newL === -Infinity || Number.isNaN(newL))) {
        stepCount = 0;
        // パラメータ初期値
        this.emParameters.pi = [...Array(K)].map(() => 1/K);
        this.emParameters.mu = [...Array(K)].map(() => [...Array(D)].map(() => Math.random()*100));
        this.emParameters.sigma = [...Array(K)].map(() => math.add(math.multiply(math.ones(D, D), Math.random()*50), math.diag([...Array(D)].map(() => Math.random()*500))));

        let delta = 1;
        while (stepCount < 500 && Math.abs(delta) >= 0.01) {
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
          newL = this.calcLikelihood(this.X, ...Object.values(newParameters));
          this.emParameters = { ...newParameters };
          delta = newL - l;
          stepCount++;
        }
        console.log(stepCount);
        simulateCount++;
      }
      if (newL === -Infinity || Number.isNaN(newL)) {
        this.isFailedSimulation = true;
      }
      this.calcTime = Date.now() - startTime;
      this.setChartdata();

      // 結果
      console.log(simulateCount);
      console.log(this.starParameters);
      console.log(this.emParameters);
      console.log(this.calcLikelihood(this.X, ...Object.values(this.starParameters)), this.calcLikelihood(this.X, ...Object.values(this.emParameters)));
    }
  }
};
</script>
