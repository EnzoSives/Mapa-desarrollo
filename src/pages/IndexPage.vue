<template>
  <q-page class="full-height">
    <MapVue />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MapVue from 'src/components/MapVue.vue';

export default defineComponent({
  components: { MapVue },
});
</script>

<style scoped></style>
