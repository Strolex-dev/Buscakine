<script setup lang="ts">
import logo from '@/assets/logo.png'
import wave1 from '@/assets/wave1.svg'
import wave2 from '@/assets/wave2.svg'
import FooterMenu from './FooterMenu.vue'
</script>

<template>
  <footer>
    <div class="footer_content">
      <div class="footer_columns">
        <div class="footer_column">
          <img :src="logo" alt="logo" width="200" />
        </div>
        <div class="footer_column">
          <h3 class="footer_menu_title">Menu</h3>
          <FooterMenu />
        </div>
        <div class="footer_column">
          <h3>NOSOTROS</h3>
          <router-link to="/terminos" class="footer_link">Terminos y condiciones</router-link>
          <p>Fontanarosa Spa</p>
          <p>Rut: 77896452-K</p>
          <p>Representante Legal: Gabriel Toledo Birke</p>
          <div class="footer_social">
            <a style="color: white" target="_blank" href="https://www.linkedin.com/">
              <q-icon name="fa-brands fa-linkedin" size="32px" />
            </a>
            <a style="color: white" target="_blank" href="https://www.instagram.com/buscakine.cl/">
              <q-icon name="fa-brands fa-instagram" size="32px" />
            </a>
          </div>
        </div>
      </div>
      <p class="disclaimer">
        Todo contacto oficial de Buscakine.cl será llevado a cabo a través de su correo oficial
        (contacto@Buscakine.cl) o su cuenta de Instagram (@Buscakine.cl)
      </p>
    </div>
    <div class="footer_box">
      <img :src="wave2" class="waves wave2" />
      <img :src="wave1" class="waves wave1" />
    </div>
    <div class="footer_disclaimer">
      buscakine.cl es un directorio de profesionales independientes. No brindamos servicios médicos ni nos
      responsabilizamos por la atención clínica prestada por los kinesiólogos listados.
    </div>
    <div class="footer_credit">Desarrollado por Sergio Mancilla Escobar, Ingeniero Informático</div>
  </footer>
</template>
