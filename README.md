# SIGSLAB - Sistema de Gestión de Soporte de Laboratorios

**SIGSLAB** es una plataforma web para la gestión, reporte y seguimiento de incidentes de soporte técnico dentro de los laboratorios de cómputo y electrónica de la institución. 

Esta versión representa el sistema completo e integrado, compuesto por un frontend modular, un servidor API (backend) y una base de datos relacional persistente, todo orquestado bajo contenedores Docker.

---

## 👥 Roles del Sistema
El sistema cuenta con tres tipos de usuarios, cada uno con una interfaz adaptada a sus responsabilidades:

1. **Docente:**
   * Reporta nuevos incidentes (especificando laboratorio, PC afectada y descripción del problema).
   * Visualiza el historial de tickets creados y su estado actual (Pendiente, Asignado, Finalizado).
2. **Jefe de Soporte:**
   * Visualiza la matriz completa de tickets en el sistema.
   * Asigna tickets pendientes a los técnicos disponibles.
   * Monitorea el progreso general del soporte.
3. **Técnico (Bolsistas y Personal):**
   * Visualiza su bandeja personal de tickets asignados.
   * Modifica el estado de los incidentes y registra las **acciones correctivas** aplicadas al dar por finalizado un ticket.
   * Visualiza su historial de tareas resueltas.

---

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** Angular 16, Bootstrap 4 (basado en el tema SB Admin 2) y FontAwesome.
*   **Backend:** NestJS v9 y TypeORM.
*   **Base de Datos:** PostgreSQL 15.
*   **Proxy Inverso y Servidor Web:** Nginx.
*   **Orquestación:** Docker y Docker Compose.

---

## 📂 Estructura del Proyecto

El proyecto está diseñado bajo una estructura limpia de monorrepositorio:
*   `/frontend`: Código cliente de Angular y su Dockerfile.
*   `/backend`: Código servidor de NestJS, su Dockerfile y conexión a base de datos.
*   `docker-compose.yml`: Archivo de orquestación de servicios en la raíz.
*   `.env.template`: Plantilla de variables de entorno para configuración local.

---

## 🚀 Guía de Instalación y Uso Rápido

¡Hola! Sigue estos sencillos pasos para levantar el proyecto en tu computadora. Puedes elegir usar una base de datos local en tu máquina o conectarte a la base de datos central en la nube con Supabase.

### 📋 Prerrequisitos
Antes de comenzar, asegúrate de tener instalado **Docker** y **Docker Compose** en tu sistema operativo:
* [Instalar Docker](https://docs.docker.com/get-docker/)
* [Instalar Docker Compose](https://docs.docker.com/compose/install/)

---

### ⚙️ Paso 1: Clonar el Repositorio y Configurar Variables de Entorno

1. **Clona este repositorio** en tu computadora.
2. Abre una terminal en la carpeta raíz del proyecto y duplica la plantilla de configuración:
   ```bash
   cp .env.template .env
   ```
   > [!IMPORTANT]
   > El archivo `.env` contendrá las contraseñas de conexión y está configurado en `.gitignore` para que **NUNCA** se suba a GitHub. Esto protege tus credenciales de accesos públicos.

---

### 🗄️ Paso 2: Elegir tu Base de Datos (Local o en la Nube)

Tienes **dos opciones** para hacer funcionar la base de datos:

#### 🔹 Opción A: Base de Datos Local (La más rápida para pruebas individuales)
No necesitas configurar nada adicional. Docker creará una base de datos PostgreSQL automáticamente en tu computadora.
1. Abre tu archivo `.env` y asegúrate de que esté configurado así:
   ```env
   POSTGRES_USER=sigslab
   POSTGRES_PASSWORD=sigslab_pass
   POSTGRES_DB=sigslab

   DB_HOST=db
   DB_PORT=5432
   DB_USER=sigslab
   DB_PASSWORD=sigslab_pass
   DB_NAME=sigslab
   DB_SSL=false
   ```

#### ☁️ Opción B: Base de Datos en la Nube con Supabase (Recomendada para compartir la misma información)
Si quieres que todas compartan la misma información en tiempo real, sigan estos pasos:

1. **Crear base de datos en Supabase:**
   * Regístrate en [Supabase](https://supabase.com/) y crea un proyecto nuevo.
   * Ve a la sección **SQL Editor** (en el menú lateral izquierdo).
   * Haz clic en **New Query** (Nueva consulta).
   * Abre el archivo [supabase_init.sql](file:///home/sofia-arboleda/Escritorio/plantilla./sigslab/supabase_init.sql) de este proyecto, copia todo su contenido, pégalo en el editor SQL de Supabase y presiona el botón **Run** (Ejecutar). Esto creará las tablas y los usuarios de prueba en la nube.

2. **Configurar el archivo `.env`:**
   * Abre tu archivo `.env` y configura el SSL en `true`:
     ```env
     DB_SSL=true
     ```
   * Consigue tu cadena de conexión (URI) en Supabase: Ve a **Project Settings** -> **Database** -> busca la sección **Connection string**, selecciona la opción **URI** y cópiala.
   * Pégala en la variable `DATABASE_URL` de tu `.env`. Debe verse parecida a esto:
     ```env
     DATABASE_URL=postgresql://postgres:tu_contraseña_real@db.efmjyxqqpgkbpzbvyypa.supabase.co:5432/postgres
     ```
     > [!WARNING]
     > **¡Cuidado con los corchetes!** Asegúrate de remover los corchetes `[` y `]` que Supabase coloca por defecto alrededor de `[YOUR-PASSWORD]`. 
     > * **Incorrecto:** `postgres:[mi_clave]@db...`
     > * **Correcto:** `postgres:mi_clave@db...`

---

### 🐳 Paso 3: Levantar la Aplicación con Docker

Dependiendo de la opción que elegiste en el paso anterior, ejecuta el comando correspondiente en tu terminal:

* **Si elegiste la Opción A (Local):**
  ```bash
  sudo docker compose up --build
  ```
* **Si elegiste la Opción B (Supabase en la nube):**
  *(Puedes omitir la base de datos local para no consumir recursos innecesarios)*
  ```bash
  sudo docker compose up --build backend frontend
  ```

---

### 💻 Paso 4: Acceder y Probar el Sistema

Una vez que Docker termine de levantar los contenedores, abre tu navegador web favorito e ingresa a:
👉 **[http://localhost/](http://localhost/)**

Usa los siguientes usuarios de prueba ya registrados para ver cómo interactúa cada rol:

| Rol | Correo Electrónico | Contraseña | ¿Qué puede hacer? |
| :--- | :--- | :--- | :--- |
| **Docente** | `docente@sigslab.edu` | *(Cualquiera, ej. `123456`)* | Reportar incidentes de laboratorios/PCs y ver su historial. |
| **Jefe de Soporte** | `jefe@sigslab.edu` | *(Cualquiera, ej. `123456`)* | Ver todos los reportes y asignarlos a los técnicos. |
| **Técnico** | `tecnico@sigslab.edu` | *(Cualquiera, ej. `123456`)* | Ver su bandeja de asignados y cerrarlos detallando las acciones correctivas. |

*También cuentas con cuentas técnicas adicionales:* `maria@sigslab.edu` y `carlos@sigslab.edu`.
