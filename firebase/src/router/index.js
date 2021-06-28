import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '../views/Home.vue';
import KMeans from '../views/KMeans.vue';
import LogisticRegression from '../views/LogisticRegression.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/k-means',
    name: 'KMeans',
    component: KMeans,
    meta: {
      title: 'k平均法'
    }
  },
  {
    path: '/logistic-regression',
    name: 'LogisticRegression',
    component: LogisticRegression,
    meta: {
      title: 'ロジスティック回帰'
    }
  },
  {
    path: '*',
    redirect: '/'
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
