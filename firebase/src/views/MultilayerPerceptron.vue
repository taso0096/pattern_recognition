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
          <v-col>
            <v-text-field
              v-model="M"
              label="中間層ユニット数"
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
            <v-text-field
              v-model="error"
              readonly
              label="二乗和誤差"
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
      <scatter-chart
        ref="error"
        :chartdata="errorData"
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
    calcTime: null,
    data: [],
    M: 5,
    w1: null,
    w2: null,
    error: null,
    chartdata: {},
    errorData: {},
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
  methods: {
    generateData() {
      this.data = [];
      [...new Array(Number(this.nodeCount)).keys()].map(v => ++v).forEach(i => {
        this.data.push([i/this.nodeCount, Math.sin(2*Math.PI*i/this.nodeCount - Math.PI) + (Math.random() - 0.5)/2]);
      });
      this.w1 = null;
      this.w2 = null;
      this.error = null;
      this.calcTime = null;
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
          pointRadius: 0,
          borderColor: '#000'
        });
      } else {
        this.errorData = {};
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
      this.$refs.error.renderChart(this.errorData, this.options);
    },
    recognize(x) {
      // 中間層
      const Z = math.tanh(math.multiply(this.w1, x));
      Z[0] = 1;
      // 出力層
      const Y = math.multiply(this.w2, Z);
      return { Z, Y };
    },
    calcError() {
      const X = this.data.map(p => [1, p[0]]);
      const T = this.data.map(p => [p[1]]);
      const data = [];
      const e = X.map((xn, n) => [xn, n])
        .reduce((eSum, [xn, n]) => {
          const en = this.recognize(xn).Y.map((yk, k) => [yk, k]).reduce((e, [yk, k]) => e + ((yk - T[n][k])**2)/2, 0);
          data.push({ x: xn[1], y: en });
          return eSum + en;
        }, 0);
      this.errorData = {
        datasets: [
          {
            label: '二乗誤差関数',
            type: 'line',
            fill: false,
            data,
            pointRadius: 0,
            borderColor: '#000'
          }
        ]
      };
      return e;
    },
    calcMultilayerPerceptron() {
      const startTime = Date.now();
      // 多層パーセプトロン
      const D = 2; // 入力ユニット数
      const M = Number(this.M); // 中間層ユニット数
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
          const d2 = math.subtract(Y, T[n]);
          // 隠れ層の誤差を計算
          const d1 = [...new Array(M).keys()].reduce((d1, j) => {
            d1.push((1 - Z[j]**2)*this.w2.map((w2k, k) => [w2k, k]).reduce((tmp, [w2k, k]) => tmp + w2k[j]*d2[k], 0));
            return d1;
          }, []);
          this.w1 = math.subtract(this.w1, math.multiply(ETA, math.transpose([d1]), [x]));
          this.w2 = math.subtract(this.w2, [math.multiply(ETA, d2, [Z])]);
        });
      });
      this.error = this.calcError();
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    }
  }
};
</script>
