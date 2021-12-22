<template>
  <v-app>
    <v-navigation-drawer
      v-model="appDrawer"
      app
      clipped
      width="300"
    >
      <v-sheet>
        <template v-if="$vuetify.breakpoint.smAndDown">
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="title">パターン認識課題</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider />
        </template>
        <v-list class="py-0">
          <v-list-item
            v-for="tab in drawerTabs"
            :key="tab.title"
            :to="tab.route"
            exact
          >
            <v-list-item-title>{{ tab.title }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <div class="py-3 pl-4">
            <div class="subtitle-2">© 2021 <a href="https://github.com/taso0096" target="_blank" rel="noopener">@taso0096</a></div>
          </div>
        </v-list>
      </v-sheet>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
      clipped-right
      color="white"
    >
      <v-app-bar-nav-icon
        aria-label="menu-button"
        @click="appDrawer = !appDrawer"
      />
      <v-toolbar-title class="app-title pl-0 pl-sm-5">
        <span v-if="!$vuetify.breakpoint.smAndDown || !$route.meta.title">パターン認識課題</span>
        <template v-if="$route.meta.title">
          <span
            v-if="!$vuetify.breakpoint.smAndDown"
            class="mx-2"
          >|</span>
          <span>{{ $route.meta.title }}</span>
        </template>
      </v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
@media (max-width:600px) {
  .app-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    -webkit-transform: translateX(-50%);
  }
}
</style>

<script>
export default {
  name: 'App',
  data: () => ({
    appDrawer: false,
    drawerTabs: [
      {
        title: 'ホーム',
        route: {
          name: 'Home'
        }
      },
      {
        title: 'k平均法',
        route: {
          name: 'KMeans'
        }
      },
      {
        title: 'ロジスティック回帰',
        route: {
          name: 'LogisticRegression'
        }
      },
      {
        title: 'EMアルゴリズム',
        route: {
          name: 'EMAlgorithm'
        }
      },
      {
        title: '最小二乗法',
        route: {
          name: 'LeastSquares'
        }
      },
      {
        title: '多項式回帰',
        route: {
          name: 'PolynomialRegression'
        }
      },
      {
        title: '多層パーセプトロン',
        route: {
          name: 'MultilayerPerceptron'
        }
      }
    ]
  })
};
</script>
