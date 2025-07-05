<template>
    <q-banner v-if="visible" class="info-banner text-dark" dense inline-actions rounded>
        <template v-slot:avatar>
            <q-icon name="info" color="primary" />
        </template>

        Para crear un informe, primero debés marcar un lugar en el mapa.

        <template v-slot:action>
            <q-btn icon="close" dense flat round @click="visible = false" />
        </template>
    </q-banner>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(true)
</script>

<style scoped>
.info-banner {
    background-color: rgba(255, 255, 255, 0.8);
    /* semitransparente */
    backdrop-filter: blur(4px);
    /* efecto de difuminado */
    border: 1px solid rgba(0, 0, 0, 0.1);
    /* borde sutil */
}
</style>
