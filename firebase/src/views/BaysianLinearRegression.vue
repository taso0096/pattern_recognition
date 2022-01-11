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
    nodeCount: 50,
    calcTime: 0,
    data: [],
    M: 8,
    beta: null,
    muN: null,
    sigmaN: null,
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
      this.data.push([0, (Math.random() - 0.5)/2]);
      [...new Array(Number(this.nodeCount)/2 - 1).keys()].forEach(() => {
        const x = Math.random()*this.nodeCount/2;
        this.data.push([x, Math.sin(2*Math.PI*x/this.nodeCount - Math.PI) + (Math.random() - 0.5)/2]);
      });
      [...new Array(Number(this.nodeCount)/2 - 1).keys()].forEach(() => {
        const x = Math.random()*this.nodeCount/4 + this.nodeCount*3/4;
        this.data.push([x, Math.sin(2*Math.PI*x/this.nodeCount - Math.PI) + (Math.random() - 0.5)/2]);
      });
      this.data.push([this.nodeCount, Math.sin(2*Math.PI - Math.PI) + (Math.random() - 0.5)/2]);
      this.beta = null;
      this.muN = null;
      this.sigmaN = null;
      this.setChartdata();
    },
    setChartdata() {
      const datasets = [];
      if (this.muN) {
        const f = x => this.muN.map((wi, i) => [wi, i]).reduce((y, [wi, i]) => y + wi*this.calcPhi(x, i), 0);
        const data = [];
        [...new Array(Number(this.nodeCount) + 1).keys()].forEach(x => {
          data.push({ x, y: f(x) });
        });
        datasets.push({
          label: '回帰曲線',
          type: 'line',
          fill: false,
          data,
          pointRadius: 0,
          borderColor: 'hsl(180, 100%, 70%)'
        });

        const predUpperData = [];
        const predLowerData = [];
        [...new Array(Number(this.nodeCount) + 1).keys()].forEach(x => {
          const phiT = [...new Array(Number(this.M) + 1).keys()].reduce((row, i) => {
            row.push(this.calcPhi(x, i));
            return row;
          }, []);
          const phi = math.transpose(phiT);
          const mP = math.multiply(math.transpose(this.muN), phi);
          const sP = math.add(math.inv(this.beta), math.multiply(phiT, this.sigmaN, phi));
          predUpperData.push({ x, y: mP + Math.sqrt(sP) });
          predLowerData.push({ x, y: mP - Math.sqrt(sP) });
        });
        datasets.push({
          label: '予測分布（上）',
          type: 'line',
          fill: false,
          data: predUpperData,
          pointRadius: 0,
          borderColor: 'hsl(270, 100%, 70%)'
        });
        datasets.push({
          label: '予測分布（下）',
          type: 'line',
          fill: false,
          data: predLowerData,
          pointRadius: 0,
          borderColor: 'hsl(270, 100%, 70%)'
        });
      }
      datasets.push({
        label: 'サンプル',
        data: this.data.map(point => ({
          x: point[0],
          y: point[1]
        })),
        pointRadius: 4,
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
      const mu = (this.nodeCount/this.M)*i;
      const sigma = 0.1;
      return math.exp(-1*(x - mu)**2/2*sigma**2);
    },
    calcBaysianLinearRegression() {
      const startTime = Date.now();
      // ベイズ線形回帰
      const sigma0 = 1 - Math.random();
      const mu0 = 1 - Math.random();
      this.beta = 1 - Math.random();
      const phiT = this.data.map(p => [...new Array(Number(this.M) + 1).keys()].reduce((row, i) => {
        row.push(this.calcPhi(p[0], i));
        return row;
      }, []));
      const phi = math.transpose(phiT);
      const y = this.data.map(p => p[1]);
      this.sigmaN = math.inv(math.add(math.inv(sigma0), math.multiply(this.beta, phi, phiT)));
      const muPartial1 = math.multiply(math.inv(sigma0), mu0);
      const muPartial2 = math.multiply(this.beta, phi, y);
      this.muN = math.multiply(this.sigmaN, math.add(muPartial1, muPartial2));
      this.calcTime = Date.now() - startTime;
      this.setChartdata();
    }
  }
};
</script>
