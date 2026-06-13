# SIGSLAB - Sistema de Gestión de Soporte de Laboratorios (MVP 1)

**SIGSLAB** es una plataforma web para la gestión, reporte y seguimiento de incidentes de soporte técnico dentro de los laboratorios de cómputo y electrónica de la institución. Este proyecto representa la fase **MVP 1 (Mínimo Producto Viable 1)**.

---

## 🚀 Estado del Proyecto: MVP 1
Esta primera versión está diseñada como un prototipo funcional **Front-end Only**. 

* **Persistencia:** Los datos se simulan y almacenan localmente en el navegador mediante `localStorage`.
* **Roles Simulados:** Permite alternar y experimentar con los distintos flujos de trabajo de los roles involucrados sin necesidad de configurar una base de datos o un servidor centralizado.

---

## 👥 Roles del Sistema
El sistema cuenta con tres tipos de usuarios, cada uno con una interfaz adaptada a sus responsabilidades:

1. **Docente:**
   * Reporta nuevos incidentes (especificando laboratorio, PC afectada y descripción del problema).
   * Visualiza el historial de tickets creados y su estado actual (Pendiente, Asignado, Finalizado).
2. **Jefe de Soporte:**
   * Dashboard con métricas clave (total de incidentes, pendientes, asignados e ingenieros disponibles).
   * Asigna tickets pendientes a los técnicos disponibles (con un límite máximo de 12 tickets activos por técnico).
   * Monitorea el progreso general del soporte.
3. **Técnico (Bolsistas y Personal):**
   * Visualiza su cola de tickets asignados.
   * Modifica el estado de los incidentes y registra las **acciones correctivas** aplicadas al dar por finalizado un ticket.

---

## 🛠️ Tecnologías Utilizadas
* **Diseño y Estructura:** HTML5, CSS3, SCSS (Sass).
* **Framework CSS:** Bootstrap 4 (basado en la plantilla SB Admin 2).
* **Lógica e Interactividad:** JavaScript moderno (ES6+) y jQuery.
* **Componentes Gráficos:** Chart.js para visualización de métricas y DataTables para listas dinámicas de historial.
* **Gestor de Tareas:** Gulp (para compilación de Sass, minificación de JS y recarga del navegador en tiempo de desarrollo).

---

## 📦 Instalación y Uso Local

### Prerrequisitos
* Tener instalado **Node.js** (versión recomendada LTS) y **npm**.

### Instrucciones de Ejecución
1. Clona este repositorio o descarga los archivos.
2. Abre la terminal en el directorio raíz del proyecto y ejecuta:
   ```bash
   npm install
   ```
3. Para iniciar el servidor de desarrollo local con recarga automática:
   ```bash
   npm start
   ```
   *Esto iniciará un servidor web local (BrowserSync) que abrirá el proyecto en tu navegador predeterminado y recargará las páginas automáticamente cuando realices cambios.*

4. *(Alternativa)* Si no deseas instalar Node/npm, puedes abrir directamente el archivo `login.html` en cualquier navegador moderno para probar la interfaz, aunque se recomienda usar el entorno de desarrollo con Gulp.

---

## 🛠️ Credenciales de Prueba (Simuladas)
Para probar el MVP 1, puedes ingresar al sistema desde la pantalla de login utilizando los siguientes perfiles de prueba:

* **Docente:**
  * **Email:** `docente@sigslab.edu`
  * **Contraseña:** `123456`
* **Jefe de Soporte:**
  * **Email:** `jefe@sigslab.edu`
  * **Contraseña:** `123456`
* **Técnico:**
  * **Email:** `tecnico@sigslab.edu`
  * **Contraseña:** `123456`

---

## 🔮 Próximos Pasos (Hacia Producción)
Para evolucionar este MVP 1 hacia un sistema en producción real se requiere:
1. **Desarrollar un Back-end:** Crear una API REST (utilizando Node.js/Express, Python/FastAPI, PHP u otra tecnología) para centralizar la lógica.
2. **Base de Datos:** Diseñar y conectar una base de datos relacional (como PostgreSQL o MySQL) o no relacional (como MongoDB) para almacenar los tickets de forma compartida.
3. **Autenticación Real:** Implementar autenticación segura basada en tokens (JWT) o sesiones cifradas en el servidor.
4. **Notificaciones:** Integrar envío de correos electrónicos automáticos (SMTP) ante cambios de estado de los incidentes.
