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
    nodeCount: 1000,
    calcTime: 0,
    clusterCount: 2,
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
      this.data = [];
      [...Array(Number(this.clusterCount)).keys()].forEach(i => {
        const randomCoord = [~~(Math.random()*this.clusterCount*200), ~~(Math.random()*this.clusterCount*200)];
        [...Array(Math.ceil(this.nodeCount/this.clusterCount))].forEach(() => {
          this.data.push([~~(this.rnorm()*50) + randomCoord[0], ~~(this.rnorm()*50) + randomCoord[1], i]);
        });
      });
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
      this.chartdata = {
        datasets
      };
      this.$refs.chart.renderChart(this.chartdata, this.options);
    },
    calcLogisticRegression() {
    }
  }
};
</script>
