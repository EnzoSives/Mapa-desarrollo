<template>
  <div class="q-pa-md flex flex-center" style="height: 100vh">
    <q-card style="min-width: 300px;">
      <q-card-section class="text-h6">
        Bienvenido
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="username"
          label="Usuario"
          outlined
          dense
          class="q-mb-sm"
        />
        <q-input
          v-model="password"
          label="Contraseña"
          type="password"
          outlined
          dense
          class="q-mb-md"
        />
        <q-btn
          label="Ingresar"
          color="primary"
          class="full-width"
          @click="goToHome"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const router = useRouter()

const goToHome = () => {
  // Por ahora no validamos nada
  console.log('Usuario:', username.value)
  console.log('Contraseña:', password.value)
  router.push('/home')
}
</script>
