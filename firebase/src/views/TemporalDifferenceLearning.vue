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
              v-model="learnCount"
              number
              label="学習回数"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="alpha"
              number
              label="学習率α"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="gamma"
              number
              label="割引率γ"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="epsilon"
              number
              label="ε"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="reward.goal"
              number
              label="ゴール報酬"
            />
          </v-col>
          <v-col>
            <v-text-field
              v-model="reward.road"
              number
              label="その他報酬"
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
            <v-btn
              depressed
              block
              class="mr-3"
              @click="reset"
            >初期化</v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              color="primary"
              depressed
              block
              @click="calcTemporalDifferenceLearning"
            >計算</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <div class="d-flex justify-center ml-0 ml-sm-5">
      <v-card
        width="350"
        flat
      >
        <v-row
          v-for="(row, i) in map"
          :key="i"
        >
          <v-col
            v-for="(col, j) in row"
            :key="j"
          >
            <v-sheet
              :color="getMapColor(col, route[i][j])"
              elevation="1"
              height="50"
              width="50"
              class="d-flex align-center justify-center"
            >
              <span class="white--text">{{ i*row.length + j }}</span>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.config-card {
  height: fit-content;
}
</style>

<script>
export default {
  data: () => ({
    calcTime: 0,
    alpha: 0.2,
    epsilon: 0.1,
    gamma: 0.99,
    learnCount: 20,
    map: [
      [0, 0, 1, 0, 3],
      [0, 1, 1, 0, 1],
      [0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0],
      [2, 0, 0, 0, 0]
    ],
    V: [...new Array(5)].map(() => [...new Array(5)].map(() => 0)),
    route: [...new Array(5)].map(() => [...new Array(5)].map(() => 0)),
    reward: {
      road: 0,
      goal: 100
    }
  }),
  computed: {
    mapLength: () => 5
  },
  methods: {
    getMapColor(label, routeState) {
      if (routeState) {
        return 'green';
      }
      switch (label) {
        case 0:
          return 'grey';
        case 1:
          return 'brown';
        case 2:
          return 'red';
        case 3:
          return 'blue';
      }
    },
    reset() {
      this.V = [...new Array(this.mapLength)].map(() => [...new Array(this.mapLength)].map(() => 0));
      this.route = [...new Array(this.mapLength)].map(() => [...new Array(this.mapLength)].map(() => 0));
      this.calcTime = 0;
    },
    getAction(p) {
      const actions = []
      if (this.map[p[1] - 1] && [0, 2, 3].includes(this.map[p[1] - 1][p[0]])) {
        actions.push(['up', this.V[p[1] - 1][p[0]]]);
      }
      if ([0, 2, 3].includes(this.map[p[1]][p[0] + 1])) {
        actions.push(['right', this.V[p[1]][p[0] + 1]]);
      }
      if (this.map[p[1] + 1] && [0, 2, 3].includes(this.map[p[1] + 1][p[0]])) {
        actions.push(['down', this.V[p[1] + 1][p[0]]]);
      }
      if ([0, 2, 3].includes(this.map[p[1]][p[0] - 1])) {
        actions.push(['left', this.V[p[1]][p[0] - 1]]);
      }
      if (Math.random() <= this.epsilon) {
        return actions[Math.floor(Math.random()*actions.length)][0];
      }
      return actions.sort((a, b) => b[1] - a[1])[0][0];
    },
    move(p, action) {
      switch (action) {
        case 'up':
          p[1]--;
          break;
        case 'right':
          p[0]++;
          break;
        case 'down':
          p[1]++;
          break;
        case 'left':
          p[0]--;
          break;
      }
      if ([0, 2].includes(this.map[p[1]][p[0]])) {
        return Number(this.reward.road);
      }
      return Number(this.reward.goal);
    },
    searchPath() {
      const p = [0, this.mapLength - 1];
      let count = 0;
      while (++count) {
        const action = this.getAction(p);
        this.move(p, action);
        if (count > this.mapLength**2 || (p[0] === this.mapLength - 1 && p[1] === 0)) {
          break;
        }
        this.route[p[1]][p[0]] = 1;
      }
    },
    calcTemporalDifferenceLearning() {
      this.reset();
      const startTime = Date.now();
      // TD学習
      const p = [0, this.mapLength - 1];
      [...new Array(Number(this.learnCount))].forEach(() => {
        const beforeP = [...p];
        const action = this.getAction(p);
        const reward = this.move(p, action);
        this.V[beforeP[1]][beforeP[0]] += this.alpha*(reward + this.gamma*this.V[p[1]][p[0]] - this.V[beforeP[1]][beforeP[0]]);
      });
      this.searchPath();
      this.calcTime = Date.now() - startTime;
    }
  }
};
</script>
