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
        <v-row no-gutters>
          <v-col>
            <v-switch
              v-model="isOutlier"
              label="外れ値を生成する"
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
              @click="calcLeastSquares"
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
    nodeCount: 20,
    calcTime: 0,
    data: [],
    a: null,
    b: null,
    isOutlier: false,
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
  methods: {
    generateData() {
      this.data = [];
      [...new Array(Number(this.nodeCount - this.isOutlier)).keys()].map(v => ++v).forEach(i => {
        this.data.push([10*i, 10*i + Math.random()*20 - 5]);
      });
      if (this.isOutlier) {
        this.data.push([10*this.nodeCount, 10*this.nodeCount + this.nodeCount*10])
      }
      this.a = null;
      this.b = null;
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      datasets.push({
        label: 'データ',
        data: this.data.map(point => ({
          x: point[0],
          y: point[1]
        })),
        backgroundColor: 'hsl(0, 100%, 70%)'
      });
      if (this.a && this.b) {
        const f = x => this.a*x + this.b;
        datasets.push({
          label: '回帰直線',
          type: 'line',
          fill: false,
          data: [
            { x: 0, y: f(0) },
            { x: this.nodeCount*10, y: f(this.nodeCount*10) }
          ],
          backgroundColor: '#000'
        });
      }
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    calcLeastSquares() {
      const startTime = Date.now();
      // 最小二乗法
      const [xBar, yBar] = math.mean(this.data, 0);
      const varX = math.variance(this.data, 0, 'uncorrected')[0];
      const covXY = this.data.reduce((cov, [x, y]) => cov + (x - xBar)*(y - yBar), 0)/this.data.length;
      this.a = covXY/varX;
      this.b = yBar - this.a*xBar;
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    }
  }
};
</script>
