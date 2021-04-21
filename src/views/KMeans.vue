<template>
  <div class="k-means">
    k平均法
  </div>
</template>

<script>
export default {
  mounted() {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch('kmeans.wasm'), go.importObject).then(result => {
      go.run(result.instance);
    });
  }
};
</script>
