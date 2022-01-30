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
    calcTime: 0
  }),
  methods: {
    reset() {

    },
    calcTemporalDifferenceLearning() {
      const startTime = Date.now();
      // TD学習

      this.calcTime = Date.now() - startTime;
    }
  }
};
</script>
