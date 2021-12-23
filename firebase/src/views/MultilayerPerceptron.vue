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
              @click="calcMultilayerPerceptron"
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
    w1: null,
    w2: null,
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
    D: () => 2,
    M: () => 5,
    K: () => 1
  },
  methods: {
    generateData() {
      this.data = [];
      [...new Array(Number(this.nodeCount)).keys()].map(v => ++v).forEach(i => {
        this.data.push([i/this.nodeCount, Math.sin(2*Math.PI*i/this.nodeCount - Math.PI) + (Math.random() - 0.5)/2]);
      });
      this.w1 = null;
      this.w2 = null;
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      if (this.w1 && this.w2) {
        const f = x => this.recognize([1, x]).Y[0];
        const data = [];
        [...new Array(Number(this.nodeCount)).keys()].map(v => ++v).forEach(i => {
          data.push({ x: i/this.nodeCount, y: f(i/this.nodeCount) });
        });
        datasets.push({
          label: '回帰曲線',
          type: 'line',
          fill: false,
          data,
          backgroundColor: '#000'
        });
      }
      datasets.push({
        label: 'データ',
        data: this.data.map(point => ({
          x: point[0],
          y: point[1]
        })),
        backgroundColor: 'hsl(0, 100%, 70%)'
      });
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    recognize(x) {
      // 中間層
      const Z = [];
      for (let j = 0; j < this.M; ++j) {
        let a = 0;
        for (let i = 0; i < this.D; ++i) {
          a += this.w1[j][i]*x[i];
        }
        Z.push(Math.tanh(a));
      }
      Z[0] = 1; // バイアス
      // 出力層
      const Y = [];
      for (let k = 0; k < this.K; ++k) {
        Y.push(0);
        for (let j = 0; j < this.M; ++j) {
          Y[k] += this.w2[k][j]*Z[j];
        }
      }
      return { Z, Y };
    },
    calcError(X, T) {
      let error = 0;
      for (let n = 0; n < this.nodeCount; ++n) {
        const { Y } = this.recognize(X[n]);
        for (let k = 0; k < this.K; ++k) {
          error += (Y[k] - T[n][k])*(Y[k] - T[n][k])/2;
        }
      }
      return error;
    },
    calcMultilayerPerceptron() {
      const startTime = Date.now();
      // 多層パーセプトロン
      const D = 2; // 入力ユニット数
      const M = 5; // 中間層ユニット数
      const K = 1; // 出力ユニット数
      const X = this.data.map(p => [1, p[0]]); // [バイアス, x_i]
      const T = this.data.map(p => [p[1]]);
      const ETA = 0.01; // 学習率
      // パラメータw初期化
      this.w1 = [...new Array(M)].map(() => [...new Array(D)].map(() => Math.random()*2 - 1));
      this.w2 = [...new Array(K)].map(() => [...new Array(M)].map(() => Math.random()*2 - 1));
      // 1000回繰り返し
      [...new Array(1000)].forEach(() => {
        if (Number.isNaN(this.w1[0][0])) {
          console.log('NaN');
          return;
        }
        X.forEach((x, n) => {
          const { Z, Y } = this.recognize(x);
          // 出力層の誤差を計算
          const d2 = [...new Array(K).keys()].reduce((d2, k) => {
            d2.push(Y[k] - T[n][k]);
            return d2;
          }, []);
          // 隠れ層の誤差を計算
          const d1 = [...new Array(M).keys()].reduce((d1, j) => {
            d1.push((1 - Z[j]**2)*[...new Array(K).keys()].reduce((tmp, k) => tmp + this.w2[k][j]*d2[k], 0));
            return d1;
          }, []);
          for (let j = 0; j < M; ++j) {
            for (let i = 0; i < D; ++i) {
              this.w1[j][i] -= ETA*d1[j]*x[i];
            }
          }
          for (let k = 0; k < K; ++k) {
            for (let j = 0; j < M; ++j) {
              this.w2[k][j] -= ETA*d2[k]*Z[j];
            }
          }
        });
      });
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    }
  }
};
</script>
