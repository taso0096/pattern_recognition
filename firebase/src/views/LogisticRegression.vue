<template>
  <div class="logistic-regression d-block d-lg-flex justify-center">
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
          <v-col class="col-6 col-sm-auto">
            <v-btn
              :disabled="!data.length"
              color="primary"
              depressed
              :block="$vuetify.breakpoint.smAndDown"
              @click="calcLogisticRegression"
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
    nodeCount: 50,
    calcTime: 0,
    clusterCount: 2,
    resultW: [],
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
            fontSize: 16,
            min: 0,
            max: 1
          }
        }],
        yAxes: [{
          ticks: {
            fontSize: 16,
            min: 0,
            max: 1
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
      [...Array(Number(this.nodeCount))].forEach(() => {
        const x = Math.random();
        const y = Math.random();
        this.data.push([x, y, Number(y > x + 0.1)]);
      });
      this.resultW = [];
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
      if (this.resultW.length) {
        const f = x => -(this.resultW[0]/this.resultW[1])*x - 1/this.resultW[1];
        datasets.push({
          label: '境界線',
          type: 'line',
          fill: false,
          data: [
            { x: 0, y: f(0) },
            { x: 1, y: f(1) }
          ],
          backgroundColor: '#000'
        });
      }
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    calcSigmoid(matrix) {
      const sigmoid = x => 1/(1 + Math.exp(-x));
      return matrix.map(row => row.map(col => sigmoid(col)));
    },
    calcR(Z) {
      const initRow = [...Array(Number(this.nodeCount))].map(() => 0);
      const R = [...Array(Number(this.nodeCount))].map(() => [...initRow]);
      R.forEach((row, i) => {
        row[i] = Z[i][0]*(1 - Z[i][0]);
      });
      return R;
    },
    calcEw(Z, t) {
      let ew = 0;
      [...Array(Number(this.nodeCount)).keys()].forEach(i => {
        ew -= Math.log(t[i][0]*Z[i][0] + (1 - t[i][0])*(1 - Z[i][0]))
      });
      return ew
    },
    calcLogisticRegression() {
      const math = window.math;
      const X = this.data.map(row => row.slice(0, 2));
      // パラメータw初期化
      let w = [[...Array(2)].map(() => Math.random()*2 - 1)];

      // 出力y
      const xT = math.transpose(X);
      let Z = math.transpose(this.calcSigmoid(math.multiply(w, xT)));

      // 重み付け行列R
      let R = this.calcR(Z);

      // ヘッセ行列H
      let H = math.multiply(math.multiply(xT, R), X);

      // ニュートン法
      const t = math.transpose([this.data.map(a => a[2])]); // 分類配列
      [...Array(20)].forEach(() => {
        const subW = math.multiply(math.multiply(math.inv(H), xT), math.subtract(Z, t));
        w = math.subtract(w, math.transpose(subW));
        Z = math.transpose(this.calcSigmoid(math.multiply(w, xT)));
        R = this.calcR(Z);
        H = math.multiply(math.multiply(xT, R), X);
      });
      console.log(math.transpose(Z));
      console.log(w[0]);
      console.log(this.calcEw(Z, t));
      this.resultW = w[0];
      this.setChartdata();
    }
  }
};
</script>
