<script setup lang="ts">
import { useRouter } from 'vue-router'
import wave1 from '@/assets/wave1.svg'
import wave2 from '@/assets/wave2.svg'
import nurse1 from '@/assets/home/nurse1.png'
import nurse2 from '@/assets/home/nurse2.png'
import Banner from '@/components/shared/Banner.vue'
import CompaniesCarrousel from '@/components/companies/CompaniesCarrousel.vue'
import HomeSearchFilters from '@/components/home/HomeSearchFilters.vue'

const router = useRouter()

const whyUsItems = [
  {
    icon: 'support_agent',
    title: 'Atención Personalizada',
    subtitle: 'Según Tu Necesidad',
    text: 'Cada paciente recibe un plan de rehabilitación único, diseñado específicamente para su patología y objetivos de recuperación, asegurando un tratamiento kinésico eficaz y centrado en la persona.',
  },
  {
    icon: 'medical_services',
    title: 'Kinesiólogos',
    subtitle: 'Especializados & Acreditados',
    text: 'Todos nuestros profesionales validan sus credenciales académicas en su perfil, destacando sus Diplomados y Magísteres. Esto garantiza que te atiendas con un experto real en tu dolencia específica.',
  },
  {
    icon: 'health_and_safety',
    title: 'Cuidado Preventivo',
    subtitle: '& Educación',
    text: 'Nuestras kinesiólogos no solo tratan la herida, sino que también educan al paciente y su familia en el cuidado preventivo para evitar complicaciones.',
  },
  {
    icon: 'home_work',
    title: 'Atención Flexible',
    subtitle: 'En Consulta o a Domicilio',
    text: 'Tú decides cómo atenderte. Nuestra plataforma te permite conectar con especialistas que disponen de consulta establecida o que llevan la rehabilitación a la comodidad de tu hogar, adaptándose a tu preferencia.',
  },
  {
    icon: 'location_on',
    title: 'Red de Profesionales',
    subtitle: 'a lo Largo de Chile',
    text: 'Con cobertura en múltiples comunas, accede a un directorio de kinesiólogos con amplia experiencia clínica en distintas regiones del país, facilitando el acceso a salud de calidad donde sea que estés.',
  },
]

const kineBenefits = [
  'En <b>Buscakine.cl</b>, queremos facilitar el acceso a profesionales como tú, especialistas en kinesiología con diversas áreas de experticia.',
  'Al crear tu perfil, aumentas tu presencia online y brindas a tus pacientes una forma fácil y rápida de acceder a una atención confiable y especializada en tu comuna.',
  'Sé parte de una red colaborativa de kinesiólogos, donde todos compartimos el objetivo de mejorar la calidad de vida de las personas, potenciando la visibilidad y el alcance de cada profesional.',
]
</script>

<template>
  <q-page>
    <div class="header_container">
      <div class="header_content">
        <div class="header_title">
          <h2>Encuentra un Kinesiólogo especializado en todo Chile.</h2>
          <h3>Selecciona tu comuna y agenda tu terapia a domicilio o en consulta.</h3>
        </div>
        <div class="header_search">
          <HomeSearchFilters />
        </div>
      </div>
      <div class="header_box">
        <img :src="wave2" class="waves wave2" />
        <img :src="wave1" class="waves wave1" />
      </div>
    </div>

    <div class="sections_container">
      <section class="section1">
        <img :src="nurse1" alt="nurse1" />
        <h2>Kinesiólogos especialistas a domicilio</h2>
        <span class="text_w_background">a lo largo de Chile</span>

        <p class="text_1">
          En <b>Buscakine.cl</b> te conectamos con kinesiólogos especialistas en diversas áreas de la rehabilitación,
          listos para atenderte a domicilio o en su consulta. Contamos con profesionales certificados que se adaptan
          a tus objetivos terapéuticos y ritmo de recuperación.
        </p>

        <p class="text_2">
          Confía en <span class="highlight_text">Buscakine.cl</span> para encontrar al profesional que necesitas
          para tu recuperación, donde y cuando más lo requieras.
        </p>
      </section>

      <section class="section2">
        <h2 class="section_title">¿Por qué elegirnos?</h2>
        <div class="items_container">
          <div v-for="item in whyUsItems" :key="item.title" class="item_box">
            <div class="item_box_header">
              <q-icon :name="item.icon" size="30px" />
              <div>
                <h2>{{ item.title }}</h2>
                <span>{{ item.subtitle }}</span>
              </div>
            </div>
            <p>{{ item.text }}</p>
          </div>
        </div>
      </section>

      <Banner />

      <CompaniesCarrousel />

      <section class="section3">
        <img :src="nurse2" alt="nurse2" />
        <h2>¿Te dedicas a la Kinesiología especializada?</h2>
        <span class="text_w_background">Ayuda a más personas a encontrarte.</span>

        <div class="section_content">
          <div v-for="text in kineBenefits" :key="text" class="section_list_item">
            <q-icon name="check" size="25px" color="secondary" />
            <p class="text_3" v-html="text"></p>
          </div>

          <q-btn
            class="register_button"
            style="width: 100%"
            unelevated
            color="primary"
            label="REGISTRARME"
            @click="router.push('/login')"
          />
        </div>
      </section>
    </div>
  </q-page>
</template>
