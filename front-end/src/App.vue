<template>
  <Pdf_Loader></Pdf_Loader>
</template>

<script>
import Pdf_Loader from './components/pdfLoader.vue';
export default {
  name: 'App',
  components: {
    Pdf_Loader
  }
}
</script>

<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }


  #app{
    width: 100%;
    height: 100%;
    text-align: center;
    font-family: 'Poppins', sans-serif;
  }
</style>
