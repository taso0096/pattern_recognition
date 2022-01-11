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
              @click="calcBaysianLinearRegression"
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
    M: 3,
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
      [...new Array(Number(this.nodeCount)).keys()].forEach(() => {
        const x = Math.random()*this.nodeCount;
        this.data.push([x, Math.sin(2*Math.PI*x/this.nodeCount - Math.PI) + (Math.random() - 0.5)/2]);
      });
      this.w = null;
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      if (this.w) {
        const f = x => this.w.map((wi, i) => [wi, i]).reduce((y, [wi, i]) => y + wi*this.calcPhi(x, i), 0);
        const data = [];
        [...new Array(Number(this.nodeCount) + 1).keys()].forEach(i => {
          data.push({ x: i, y: f(i) });
        });
        datasets.push({
          label: '回帰曲線',
          type: 'line',
          fill: false,
          data,
          pointRadius: 0,
          borderColor: 'hsl(180, 100%, 70%)'
        });
      }
      datasets.push({
        label: 'データ',
        data: this.data.map(point => ({
          x: point[0],
          y: point[1]
        })),
        pointRadius: 4,
        backgroundColor: 'hsl(0, 100%, 70%)'
      });
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    calcPhi(x, i) {
      const mu = (this.nodeCount/this.M)*i;
      const sigma = 0.1;
      return math.exp(-1*(x - mu)**2/2*sigma**2);
    },
    calcBaysianLinearRegression() {
      const startTime = Date.now();
      // ベイズ線形回帰
      const sigma0 = 1 - Math.random();
      const mu0 = 1 - Math.random();
      const beta = 1 - Math.random();
      const phiT = this.data.map(p => [...new Array(Number(this.M) + 1).keys()].reduce((row, i) => {
        row.push(this.calcPhi(p[0], i));
        return row;
      }, []));
      const phi = math.transpose(phiT);
      const y = this.data.map(p => p[1]);
      const sigmaN = math.inv(math.add(math.inv(sigma0), math.multiply(beta, phi, phiT)));
      const muPartial1 = math.multiply(math.inv(sigma0), mu0);
      const muPartial2 = math.multiply(beta, phi, y);
      const muN = math.multiply(sigmaN, math.add(muPartial1, muPartial2));
      console.log(muN);
      this.w = muN;
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    }
  }
};
</script>
