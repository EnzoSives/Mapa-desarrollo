<template>
  <div class="login-container">
    <div class="header-section">
      <h2 class="main-title">Desarrollo Social</h2>
    </div>

    <div class="login-card-container q-pa-md flex flex-center">
      <q-card class="login-card shadow-4 q-pa-sm" elevated>
        <q-card-section class="text-center q-pb-none welcome-section">
          <q-icon name="login" size="48px" color="primary" class="q-mb-md" />
          <div class="text-h5 text-weight-bold text-white">Bienvenido</div>
          <div class="text-body2 text-white-70 q-mt-xs">
            Ingresa tus credenciales para continuar
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="goToHome" class="q-gutter-md">
            <q-input v-model="username" label="Usuario" outlined dense label-color="primary"
              :rules="[val => !!val || 'El usuario es requerido']" class="animated-input">
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input v-model="password" label="Contraseña" type="password" outlined dense label-color="primary"
              :rules="[val => !!val || 'La contraseña es requerida']" class="animated-input">
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>

            <q-btn :loading="loading" label="Ingresar al Sistema" color="primary" size="md" class="full-width login-btn"
              type="submit" unelevated rounded :disable="!username || !password">
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Validando...
              </template>
            </q-btn>
          </q-form>
        </q-card-section>

        <q-card-section v-if="errorMessage" class="text-center q-pt-none">
          <q-banner class="text-white bg-negative rounded-borders">
            <template v-slot:avatar>
              <q-icon name="error" />
            </template>
            {{ errorMessage }}
          </q-banner>
        </q-card-section>

        <q-separator class="q-my-sm" />

        <q-card-section class="text-center q-pt-none q-pb-none">
          <div class="text-caption text-uppercase text-white-50 text-weight-light">
            Desarrollo social
          </div>
          <div class="text-caption text-white-40 q-mt-xs">
            Sistema seguro y confiable
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="footer-section">
      <div class="text-body2 text-white-60 text-center flex flex-center">
        <q-icon name="shield" size="16px" class="q-mr-xs" />
        Plataforma de Desarrollo Social
      </div>
      <!-- <div class="text-caption text-white-50 text-center q-mt-xs">
        Comprometidos con el bienestar de la comunidad
      </div> -->
    </div>
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
  if (!username.value || !password.value) {
    errorMessage.value = 'Por favor completa todos los campos';
    return;
  }

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
  } catch (error: unknown) {
    console.error('Error de login:', error);
    errorMessage.value = 'Usuario o contraseña incorrectos. Verifica tus credenciales.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  height: 100dvh;
  background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  color: #ffffff;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"...>');
  opacity: 0.05;
  pointer-events: none;
}

.main-title {
  font-family: 'Roboto', sans-serif;
  color: #f5f5f5;
  font-size: 3.5rem;
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
}

.login-card {
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  bottom: 20px;
}

.q-input__control,
.q-input__label {
  color: #e0e0e0;
}

.q-field__control {
  background-color: rgba(255, 255, 255, 0.05);
}

.q-btn {
  background-color: #1976d2;
  color: white;
}

.q-btn:hover {
  background-color: #1565c0;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.3);
}

.footer-section .text-body2,
.footer-section .text-caption {
  color: rgba(255, 255, 255, 0.6);
}

.q-banner {
  background-color: #c62828 !important;
  color: white;
}
</style>