# SIGSLAB - Sistema de Gestión de Soporte de Laboratorios (MVP 1 Serverless)

**SIGSLAB** es una plataforma web para la gestión, reporte y seguimiento de incidentes de soporte técnico dentro de los laboratorios de cómputo y electrónica de la institución. 

Esta versión representa la **arquitectura simplificada del MVP 1**, habiendo eliminado por completo los servidores propios (NestJS), los contenedores locales (Docker) y proxies inversos (Nginx). Toda la lógica de persistencia, autenticación, control de accesos (RLS) y lógica de negocio se delega directamente en **Supabase** como Backend-as-a-Service (BaaS).

---

## 👥 Roles del Sistema
El sistema cuenta con tres tipos de usuarios, cada uno con una interfaz adaptada a sus responsabilidades:

1. **Docente:**
   * Reporta nuevos incidentes (especificando laboratorio, PC afectada y descripción del problema).
   * Visualiza el historial de tickets creados por él y su estado actual (Pendiente, Asignado, Finalizado).
2. **Jefe de Soporte (Administrador):**
   * Visualiza la matriz completa de todos los tickets del sistema.
   * Asigna tickets pendientes a los técnicos disponibles.
   * Monitorea el progreso general del soporte.
3. **Técnico (Bolsistas y Personal):**
   * Visualiza su bandeja personal de tickets asignados.
   * Finaliza incidentes registrando las **acciones correctivas** aplicadas.
   * Visualiza su historial de tareas resueltas.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** Angular 16, Bootstrap 4 (basado en el tema SB Admin 2) y FontAwesome 5.
* **Backend-as-a-Service (BaaS):** Supabase (Autenticación, Base de datos PostgreSQL y políticas RLS).
* **Despliegue Recomendado:** Netlify / Vercel (100% gratuito, sin apagado de servidores).

---

## 📂 Estructura del Proyecto

El proyecto se compone de una aplicación de Angular pura y limpia en la raíz:
* `/src/app/services`: Servicios de comunicación con el SDK de Supabase (`AuthService`, `TicketService`, `SupabaseService`).
* `/src/app/components`: Vistas modulares para los paneles de Docente, Jefe y Técnico.
* `/src/environments`: Configuración de claves públicas de Supabase (`environment.ts`).
* `angular.json` y `package.json`: Configuración de empaquetado de Angular.

---

## 🚀 Guía de Instalación y Uso Local

Sigue estos pasos para levantar la aplicación en tu computadora de forma local:

### 📋 Prerrequisitos
* Tener instalado **Node.js** (versión `16.20.2` recomendada).

### ⚙️ Paso 1: Configurar la Base de Datos en Supabase
1. Regístrate en [Supabase](https://supabase.com/) y crea un proyecto nuevo.
2. Abre la pestaña **SQL Editor** en el menú izquierdo de tu proyecto de Supabase.
3. Crea una consulta nueva (New Query), copia y pega el código SQL de inicialización que se detalla abajo (Tablas, Triggers y Políticas RLS) y presiona **Run** (Ejecutar).
4. Crea tus cuentas de usuario de prueba en la sección **Authentication -> Users** con una contraseña genérica (ej. `123456`).

### ⚙️ Paso 2: Clonar y Configurar Claves en Angular
1. Clona este repositorio en tu computadora.
2. Abre el archivo [src/environments/environment.ts](file:///src/environments/environment.ts).
3. Reemplaza los valores de `supabaseUrl` y `supabaseKey` con las claves públicas de tu proyecto de Supabase (las puedes encontrar en **Project Settings -> API** en tu dashboard de Supabase).

### ⚙️ Paso 3: Ejecutar Localmente
1. Abre una terminal en la raíz del proyecto.
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Angular:
   ```bash
   npm start
   ```
4. Abre tu navegador en **[http://localhost:4200/](http://localhost:4200/)** para ingresar a la aplicación.

---

## ☁️ Despliegue en la Nube (Netlify o Vercel)

Al ser una arquitectura **serverless** (sin servidores propios que mantener), puedes alojar la aplicación web de Angular de forma 100% gratuita y permanente. Tu sitio web cargará instantáneamente y nunca se irá a dormir:

### Opción A: Desplegar en Netlify (Recomendado)
1. Regístrate en [Netlify](https://www.netlify.com/) conectando tu cuenta de GitHub.
2. Haz clic en **Add new site** ➔ **Import an existing project**.
3. Selecciona tu repositorio `sigslab`.
4. Rellena los campos de configuración de la siguiente forma:
   * **Base directory (Directorio base):** *(Dejar vacío)*
   * **Build command (Comando de construcción):** `npm run build`
   * **Publish directory (Carpeta de publicación):** `dist/sigslab`
5. Haz clic en **Deploy site**. ¡Listo! Netlify compilará el proyecto y te dará una URL pública HTTPS para compartir con tus amigas.

### Opción B: Desplegar en Vercel
1. Regístrate en [Vercel](https://vercel.com/) conectando tu cuenta de GitHub.
2. Haz clic en **Add New** ➔ **Project**.
3. Selecciona e importa tu repositorio `sigslab`.
4. Vercel detectará automáticamente que es un proyecto de Angular y configurará los comandos solos.
5. Haz clic en **Deploy**. En un minuto tendrás una URL pública HTTPS activa.

---

## 🛠️ Credenciales de Prueba (Registrar en Supabase Auth)
Crea las siguientes cuentas en la sección **Authentication -> Users** de tu panel de Supabase. Al momento de crearlas, ingresa el rol y nombre correspondientes en los metadatos del usuario (`User Metadata`) para que se sincronicen correctamente:

1. **Docente:**
   * **Email:** `docente@sigslab.edu`
   * **Contraseña:** `123456`
   * **User Metadata:** `{ "name": "Prof. Sofia Arboleda", "role": "docente" }`
2. **Jefe de Soporte:**
   * **Email:** `jefe@sigslab.edu`
   * **Contraseña:** `123456`
   * **User Metadata:** `{ "name": "Ing. Marcos Paz", "role": "jefe-soporte" }`
3. **Técnico:**
   * **Email:** `tecnico@sigslab.edu`
   * **Contraseña:** `123456`
   * **User Metadata:** `{ "name": "Juan Pérez (Bolsista)", "role": "tecnico" }`
