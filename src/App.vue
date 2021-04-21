<template>
  <v-app>
    <v-navigation-drawer
      v-model="appDrawer"
      app
      clipped
      mobile-breakpoint="960"
      width="300"
    >
      <v-sheet>
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
            <div class="subtitle-2">© 2021 <a href="https://github.com/taso0096" target="_blank">@taso0096</a></div>
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
        @click="appDrawer = !appDrawer"
      />

      <v-toolbar-title>
        <span>パターン認識課題</span>
      </v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

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
      }
    ]
  })
};
</script>
