<template>
  <div class="q-pa-md flex flex-center" style="height: 100vh">
    <q-card style="min-width: 300px">
      <q-card-section class="text-h6 text-center"> Bienvenido </q-card-section>

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
          :loading="loading"
          label="Ingresar"
          color="primary"
          class="full-width"
          @click="goToHome"
        />
      </q-card-section>

      <q-card-section v-if="errorMessage" class="text-negative text-center">
        {{ errorMessage }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();

const goToHome = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.post('http://179.43.127.133:3006/auth/login', {
      name: username.value,
      password: password.value,
    });

    const { access_token, username: name, rol } = response.data;

    // Guarda token y datos del usuario
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', name);
    localStorage.setItem('rol', rol);

    router.push('/home');
  } catch (error: any) {
    console.error('Error de login:', error);
    errorMessage.value = 'Usuario o contraseña incorrectos';
  } finally {
    loading.value = false;
  }
};
</script>
