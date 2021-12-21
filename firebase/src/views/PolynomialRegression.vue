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
              v-model="n"
              label="次数"
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
              @click="calcPolynomialRegression"
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
    n: 3,
    w: null,
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
      [...new Array(Number(this.nodeCount)).keys()].map(v => ++v).forEach(i => {
        this.data.push([i, Math.sin(2*Math.PI*i/this.nodeCount) + (Math.random() - 0.5)/2]);
      });
      this.w = null;
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
      if (this.w) {
        const f = x => this.w.map((wi, i) => [wi, i]).reduce((y, [wi, i]) => y + wi*x**i, 0);
        const data = [];
        [...new Array(Number(this.nodeCount)).keys()].map(v => ++v).forEach(i => {
          data.push({ x: i, y: f(i) });
        });
        datasets.push({
          label: '回帰曲線',
          type: 'line',
          fill: false,
          data,
          backgroundColor: '#000'
        });
      }
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    calcPolynomialRegression() {
      const startTime = Date.now();
      // 多項式回帰
      const phi = this.data.map(p => [...new Array(Number(this.n)).keys()].map(v => ++v).reduce((row, n) => {
        row.push(p[0]**n);
        return row;
      }, [1]));
      const phiT = math.transpose(phi);
      const y = this.data.map(p => p[1]);
      this.w = math.multiply(math.inv(math.multiply(phiT, phi)), phiT, y);
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    }
  }
};
</script>
