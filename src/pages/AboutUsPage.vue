<script setup lang="ts">
import img1 from '@/assets/home/about_kinesiologia.jpg'
</script>

<template>
  <q-page class="content">
    <h1>Quiénes somos</h1>

    <div class="flex_column">
      <section class="flexSection">
        <div class="secition_text">
          <p>
            En <b>Buscakine.cl</b>, conectamos a pacientes con kinesiólogos especialistas que ofrecen atención
            profesional tanto a domicilio como en consulta. Nuestro objetivo es garantizar que cada persona reciba
            la terapia adecuada en el entorno que mejor se adapte a sus necesidades, respaldada por profesionales
            que demuestran su formación continua y especialización.
          </p>

          <h2>Nuestra Misión</h2>
          <p>
            Facilitar el acceso a una rehabilitación kinesiológica de calidad, ya sea en la comodidad del hogar o
            en un centro clínico, conectando a las personas con expertos que acreditan sus competencias específicas
            para una recuperación efectiva y segura.
          </p>

          <h2>Nuestra Visión</h2>
          <p>
            Ser el referente nacional en la búsqueda de servicios de kinesiología, consolidando una red de
            profesionales transparentes y confiables, donde la experiencia y la formación académica son el pilar de
            la elección del paciente.
          </p>
        </div>

        <img :src="img1" alt="kinesiologia" class="section_img" />
      </section>

      <section>
        <h2>¿Por qué elegirnos?</h2>

        <h3>Pacientes</h3>
        <p>
          Te damos la libertad de elegir dónde atenderte (casa o consulta) con la seguridad de estar contactando a
          un profesional que muestra abiertamente sus credenciales y estudios específicos para tu dolencia.
        </p>

        <h3>Kinesiólogos</h3>
        <p>
          Te ofrecemos una vitrina digital para exhibir tu trayectoria, permitiéndote cargar y mostrar tus
          certificados de especialización, lo que genera mayor confianza y atrae a los pacientes correctos para tu
          área de expertise.
        </p>

        <h3>Transparencia Profesional</h3>
        <p>
          Fomentamos que cada kinesiólogo respalde su perfil con imágenes de sus estudios. En nuestra plataforma, la
          experticia no solo se dice, se muestra a través de cursos, diplomados y magísteres verificables.
        </p>

        <h2>¿Cómo funciona para los pacientes?</h2>
        <p><b>Encuentra al kinesiólogo ideal validando su experiencia real:</b></p>
        <ul>
          <li><b>Selecciona tu modalidad:</b> Filtra según tu preferencia: visita a domicilio o atención en consulta.</li>
          <li>
            <b>Revisa el perfil y credenciales:</b> Podrás ver en el perfil las imágenes de sus certificados
            (diplomados, cursos de especialización o grados de magíster) que lo califican para tratar tu condición
            específica.
          </li>
          <li><b>Elige con confianza:</b> Contacta al especialista que demuestre la formación más adecuada para tu necesidad.</li>
        </ul>

        <h2>¿Cómo funciona para los kinesiólogos?</h2>
        <p><b>Destaca tu formación y capta pacientes que valoran tu especialización:</b></p>
        <ul>
          <li><b>Crea tu perfil experto:</b> Regístrate y completa tu información profesional básica.</li>
          <li>
            <b>Sube tus credenciales:</b> Carga imágenes de tus certificados de cursos, diplomados o magíster en tu
            perfil. Esto permite que el paciente vea tu preparación real en tu área de expertise.
          </li>
          <li><b>Define tu modalidad:</b> Indica si realizas atenciones a domicilio (seleccionando comunas) o si dispones de un box/consulta para recibir pacientes.</li>
          <li>
            <b>Recibe pacientes cualificados:</b> Al mostrar tus estudios específicos, te contactarán pacientes que
            buscan exactamente lo que tú sabes hacer, valorando tu formación por sobre la generalidad.
          </li>
        </ul>

        <p>
          En <b>Buscakine.cl</b>, creemos que una buena rehabilitación comienza con la elección correcta del
          profesional. Por eso, somos una plataforma donde la formación académica (cursos, diplomados y magíster)
          está a la vista, brindando seguridad al paciente y el reconocimiento que merece el especialista.
        </p>
      </section>
    </div>
  </q-page>
</template>
