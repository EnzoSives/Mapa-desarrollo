<template>
  <div class="login-container q-pa-xl flex flex-center column">
    <div class="header-section q-mb-lg text-center">
      <h2 class="main-title text-primary text-h4 text-weight-bold">
        Desarrollo Social
      </h2>
    </div>

    <q-card class="login-card q-pa-lg shadow-8 bg-white" style="width: 100%; max-width: 400px" elevated>
      <q-card-section class="text-center q-pb-sm welcome-section">
        <q-icon name="login" size="56px" color="primary" class="q-mb-md" />
        <div class="text-h5 text-weight-bold text-dark">Bienvenido</div>
        <div class="text-body1 text-grey-7">
          Ingresa tus credenciales para continuar
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="goToHome" class="q-gutter-md">
          <q-input v-model="username" label="Usuario" outlined dense label-color="primary" bg-color="blue-grey-1"
            :rules="[val => !!val || 'El usuario es requerido']" class="animated-input">
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>

          <q-input v-model="password" label="Contraseña" type="password" outlined dense label-color="primary"
            bg-color="blue-grey-1" :rules="[val => !!val || 'La contraseña es requerida']" class="animated-input">
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <q-btn :loading="loading" label="Ingresar al Sistema" color="primary" class="full-width login-btn q-mt-md"
            size="lg" type="submit" unelevated rounded :disable="!username || !password">
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Validando...
            </template>
          </q-btn>
        </q-form>
      </q-card-section>

      <q-card-section v-if="errorMessage" class="q-pt-none">
        <q-banner class="text-white bg-negative rounded-borders">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ errorMessage }}
        </q-banner>
      </q-card-section>

      <q-separator class="q-my-md" />

      <q-card-section class="text-center q-pt-none q-pb-none">
        <!-- <div class="text-caption text-grey-6 text-weight-medium">
          Desarrollo Social
        </div> -->
        <!-- <div class="text-caption text-grey-5">
          Sistema seguro y confiable
        </div> -->
      </q-card-section>
    </q-card>

    <div class="footer-section q-mt-lg">
      <div class="text-body2 text-grey-6 text-center">
        <q-icon name="shield" size="16px" class="q-mr-xs" />
        Desarrollado por <strong>Informática Madariaga</strong>
      </div>
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
    const response = await axios.post('http://179.43.127.133/:3006/auth/login', {
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
  background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  color: #424242;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"...>');
  opacity: 0.03;
  pointer-events: none;
}

.main-title {
  font-family: 'Roboto', sans-serif;
  color: #1565c0;
  font-size: 3.5rem;
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-card {
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}


.q-input__control,
.q-input__label {
  color: #424242;
}

.q-field__control {
  background-color: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.12);
}

.q-field--outlined .q-field__control {
  border-color: rgba(0, 0, 0, 0.12);
}

.q-field--outlined .q-field__control:hover {
  border-color: #1976d2;
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
  color: #757575;
}

.q-banner {
  background-color: #c62828 !important;
  color: white;
}

.q-separator {
  background-color: rgba(0, 0, 0, 0.12);
}
</style>
