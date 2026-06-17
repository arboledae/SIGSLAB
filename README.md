# SIGSLAB - Sistema de Gestión de Soporte de Laboratorios (MVP 1 Serverless)

**SIGSLAB** es una plataforma web para la gestión, reporte y seguimiento de incidentes de soporte técnico dentro de los laboratorios de cómputo y electrónica de la institución. 

Esta versión representa la **arquitectura simplificada del MVP 1**, habiendo eliminado por completo los servidores propios (NestJS), los contenedores locales (Docker) y proxies inversos (Nginx). Toda la lógica de persistencia, autenticación, control de accesos (RLS) y lógica de negocio se delega directamente en **Supabase** como Backend-as-a-Service (BaaS).

---

## Roles del Sistema
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

## Tecnologías Utilizadas

* **Frontend:** Angular 16, Bootstrap 4 (basado en el tema SB Admin 2) y FontAwesome 5.
* **Backend-as-a-Service (BaaS):** Supabase (Autenticación, Base de datos PostgreSQL y políticas RLS).
* **Despliegue Recomendado:** Netlify / Vercel (100% gratuito, sin apagado de servidores).

---

## Estructura del Proyecto

El proyecto se compone de una aplicación de Angular pura y limpia en la raíz:
* `/src/app/services`: Servicios de comunicación con el SDK de Supabase (`AuthService`, `TicketService`, `SupabaseService`).
* `/src/app/components`: Vistas modulares para los paneles de Docente, Jefe y Técnico.
* `/src/environments`: Configuración de claves públicas de Supabase (`environment.ts`).
* `angular.json` y `package.json`: Configuración de empaquetado de Angular.

---

## Guía de Instalación y Uso Local

Sigue estos pasos para levantar la aplicación en tu computadora de forma local:

### Prerrequisitos
* Tener instalado **Node.js** (versión `16.20.2` recomendada).

### Paso 1: Configurar la Base de Datos en Supabase
1. Regístrate en [Supabase](https://supabase.com/) y crea un proyecto nuevo.
2. Abre la pestaña **SQL Editor** en el menú izquierdo de tu proyecto de Supabase.
3. Crea una consulta nueva (New Query), copia y pega el código SQL de inicialización que se detalla abajo (Tablas, Triggers y Políticas RLS) y presiona **Run** (Ejecutar).
4. Crea tus cuentas de usuario de prueba en la sección **Authentication -> Users** con una contraseña genérica (ej. `123456`).

### Paso 2: Clonar y Configurar Claves en Angular
1. Clona este repositorio en tu computadora.
2. Duplica el archivo [src/environments/environment.template.ts](file:///home/sofia-arboleda/Escritorio/plantilla./sigslab/src/environments/environment.template.ts) y renómbralo como `src/environments/environment.ts` (este último está ignorado en Git para proteger tus credenciales).
3. Reemplaza los valores de `supabaseUrl` y `supabaseKey` con las claves públicas de tu proyecto de Supabase (las puedes encontrar en **Project Settings -> API** en tu dashboard de Supabase).

### Paso 3: Ejecutar Localmente
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
