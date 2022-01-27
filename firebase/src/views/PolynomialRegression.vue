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
            <v-select
              v-model="basisFunction"
              :items="basisFunctionList"
              label="基底関数"
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
    nodeCount: 20,
    calcTime: 0,
    data: [],
    n: 3,
    w: null,
    basisFunction: 0,
    basisFunctionList: [
      { text: '多項式基底', value: 0 },
      { text: 'ガウス基底', value: 1 }
    ],
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
        this.data.push([i, Math.sin(2*Math.PI*i/this.nodeCount - Math.PI) + (Math.random() - 0.5)/2]);
      });
      this.w = null;
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      if (this.w) {
        const f = x => this.w.map((wi, i) => [wi, i]).reduce((y, [wi, i]) => y + wi*this.calcPhi(x, i), 0);
        const data = [];
        [...new Array(Number(this.nodeCount)).keys()].map(v => ++v).forEach(i => {
          data.push({ x: i, y: f(i) });
        });
        datasets.push({
          label: '回帰曲線',
          type: 'line',
          fill: false,
          data,
          pointRadius: 0,
          borderColor: '#000'
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
      const sinData = [];
      [...new Array(Number(this.nodeCount) + 1).keys()].forEach(x => {
        sinData.push([x, Math.sin(2*Math.PI*x/this.nodeCount - Math.PI)]);
      });
      datasets.push({
        label: 'sin関数',
        type: 'line',
        fill: false,
        data: sinData.map(point => ({
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
    calcPhi(x, i) {
      if (this.basisFunction === 1) {
        const mu = (this.nodeCount/this.n)*i;
        const sigma = 0.1;
        return math.exp(-1*(x - mu)**2/2*sigma**2);
      }
      return x**i;
    },
    calcPolynomialRegression() {
      const startTime = Date.now();
      // 多項式回帰
      const phi = this.data.map(p => [...new Array(Number(this.n) + 1).keys()].reduce((row, i) => {
        row.push(this.calcPhi(p[0], i));
        return row;
      }, []));
      const phiT = math.transpose(phi);
      const y = this.data.map(p => p[1]);
      this.w = math.multiply(math.inv(math.multiply(phiT, phi)), phiT, y);
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    }
  }
};
</script>
