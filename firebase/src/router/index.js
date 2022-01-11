import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '../views/Home.vue';
import KMeans from '../views/KMeans.vue';
import LogisticRegression from '../views/LogisticRegression.vue';
import EMAlgorithm from '../views/EMAlgorithm.vue';
import LeastSquares from '../views/LeastSquares.vue';
import PolynomialRegression from '../views/PolynomialRegression.vue';
import MultilayerPerceptron from '../views/MultilayerPerceptron.vue';
import BayesianInference from '../views/BayesianInference.vue';
import BaysianLinearRegression from '../views/BaysianLinearRegression.vue';

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
    path: '/em-algorithm',
    name: 'EMAlgorithm',
    component: EMAlgorithm,
    meta: {
      title: 'EMアルゴリズム'
    }
  },
  {
    path: '/least-squares',
    name: 'LeastSquares',
    component: LeastSquares,
    meta: {
      title: '最小二乗法'
    }
  },
  {
    path: '/polynomial-regression',
    name: 'PolynomialRegression',
    component: PolynomialRegression,
    meta: {
      title: '多項式回帰'
    }
  },
  {
    path: '/multilayer-perceptron',
    name: 'MultilayerPerceptron',
    component: MultilayerPerceptron,
    meta: {
      title: '多層パーセプトロン'
    }
  },
  {
    path: '/bayesian-inference',
    name: 'BayesianInference',
    component: BayesianInference,
    meta: {
      title: 'ベイズ推定'
    }
  },
  {
    path: '/baysian-linear-regression',
    name: 'BaysianLinearRegression',
    component: BaysianLinearRegression,
    meta: {
      title: 'ベイズ線形回帰'
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
