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
  methods: {
    rnorm() {
      return Math.sqrt(-2*Math.log(1 - Math.random()))*Math.cos(2*Math.PI*Math.random());
    },
    generateData() {
      this.X = [];
      this.starParameters.mu = [];
      this.starParameters.sigma = [];
      [...Array(Number(this.clusterCount))].forEach(() => {
        const randomCoord = [~~(Math.random()*this.clusterCount*200), ~~(Math.random()*this.clusterCount*200)];
        const X = [];
        [...Array(Math.ceil(this.nodeCount/this.clusterCount))].forEach(() => {
          X.push([~~(this.rnorm()*50) + randomCoord[0], ~~(this.rnorm()*50) + randomCoord[1]]);
        });
        this.X.push(...X);
        this.starParameters.pi.push(1/this.clusterCount);
        this.starParameters.mu.push(randomCoord);
        const e = math.mean(X, 0);
        const v = math.variance(X, 0, 'uncorrected');
        const cov = X.reduce((cov, x) => cov + (x[0] - e[0])*(x[1] - e[1]), 0)/X.length;
        const sigma = math.add(math.subtract(math.multiply(math.ones(2, 2), cov), math.diag([...Array(2)].map(() => cov))), math.diag(v));
        this.starParameters.sigma.push(sigma);
      });
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      datasets.push({
        label: 0,
        data: this.X.map(point => ({
          x: point[0],
          y: point[1]
        })),
        backgroundColor: `hsl(${360*0/this.clusterCount}, 100%, 70%)`
      });
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    calcN(x, mu, sigma) {
      const D = 2;
      const a = 1/(2*Math.PI)**(D/2);
      const b = 1/math.det(sigma)**(1/2);
      const c = math.multiply(-1/2, math.transpose(math.subtract(x, mu)));
      const d = math.inv(sigma);
      const e = math.subtract(x, mu);
      return math.multiply(a, b, math.exp(math.multiply(c, d, e)));
    },
    calcEMAlgorithm() {
    }
  }
};
</script>
