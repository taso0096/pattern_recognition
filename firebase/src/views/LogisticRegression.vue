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
              label="教師データ数"
              type="number"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-switch
              v-model="isOverlap"
              label="生成する領域を重ねる"
              hide-details
              inset
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
          <v-col>
            <v-text-field
              v-model="lastEntropy"
              readonly
              label="交差エントロピー誤差"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="col-12 col-sm-auto">
            <v-btn
              depressed
              block
              class="mr-3"
              @click="generateData"
            >データ生成</v-btn>
          </v-col>
          <v-col class="col-12 col-sm-auto">
            <v-btn
              :disabled="!data.length"
              color="primary"
              depressed
              block
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
      <scatter-chart
        ref="entropy"
        :chartdata="entropyData"
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
    nodeCount: 500,
    isOverlap: false,
    calcTime: 0,
    clusterCount: 2,
    resultW: [],
    data: [],
    chartdata: {},
    entropyData: {},
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
    },
    entropyOptions: {
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
    lastEntropy() {
      return (this.entropyData.datasets || [])[0]?.data.slice(-1)[0].y;
    }
  },
  methods: {
    calcClass(x, y) {
      return [
        y > x,
        y - x > 0.2 || (y - x < 0 ? 0 : Math.round(Math.random()))
      ][Number(this.isOverlap)];
    },
    generateData() {
      this.data = [];
      [...Array(Number(this.nodeCount))].forEach(() => {
        const x = Math.random();
        const y = Math.random();
        this.data.push([x, y, Number(this.calcClass(x, y))]);
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
        const f = x => -(this.resultW[0]/this.resultW[1])*x - this.resultW[2]/this.resultW[1];
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
      const R = [...Array(Number(this.nodeCount)).keys()].map(i => Z[i][0]*(1 - Z[i][0]));
      return math.diag(R);
    },
    calcEw(Z, t) {
      let ew = 0;
      [...Array(Number(this.nodeCount)).keys()].forEach(i => {
        ew -= Math.log(t[i][0]*Z[i][0] + (1 - t[i][0])*(1 - Z[i][0]));
      });
      return ew;
    },
    calcLogisticRegression() {
      const startTime = Date.now();
      const datasets = [
        {
          label: '交差エントロピー誤差',
          data: [],
          backgroundColor: '#000'
        }
      ];
      // 教師データ作成
      const X = this.data.map(row => [...row.slice(0, 2), 1]);
      const t = math.transpose([this.data.map(a => a[2])]);
      // パラメータw初期化
      let w = [[...Array(3)].map(() => Math.random()*2 - 1)];
      // 転置行列xT
      const xT = math.transpose(X);
      // 出力行列Z
      let Z = math.transpose(this.calcSigmoid(math.multiply(w, xT)));
      // 重み付け行列R
      let R = this.calcR(Z);
      // ヘッセ行列H
      let H = math.multiply(math.multiply(xT, R), X);

      // ニュートン法
      [...Array(20).keys()].forEach(i => {
        const subW = math.multiply(math.multiply(math.inv(H), xT), math.subtract(Z, t));
        w = math.subtract(w, math.transpose(subW));
        Z = math.transpose(this.calcSigmoid(math.multiply(w, xT)));
        R = this.calcR(Z);
        H = math.multiply(math.multiply(xT, R), X);
        datasets[0].data.push({
          x: i,
          y: this.calcEw(Z, t)
        });
      });
      this.resultW = w[0];
      this.calcTime = Date.now() - startTime;
      this.setChartdata();

      this.entropyData = {
        datasets
      };
      this.$refs.entropy.renderChart(this.entropyData, this.entropyOptions);
    }
  }
};
</script>
