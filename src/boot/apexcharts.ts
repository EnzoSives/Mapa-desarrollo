import { boot } from 'quasar/wrappers';
import VueApexCharts from 'vue3-apexcharts';

export default boot(({ app }) => {
  // Registrar VueApexCharts globalmente como plugin
  app.use(VueApexCharts);
});
