# Gestión360 - Stack Tecnológico y Arquitectura

Este documento detalla las tecnologías, lenguajes y herramientas utilizadas en el ecosistema de Gestión360, desglosado por módulos principales.

## 🛠️ Entorno General y Lenguajes
- **Lenguaje Principal**: JavaScript (ES6+).
- **Entorno de Ejecución**: Node.js.
- **Gestor de Paquetes**: npm.
- **Manejador de Versiones**: Git.
- **Estandarización**: ESLint y Prettier.

---

## 💻 Módulo Web (Frontend)
Desarrollado con un enfoque en rendimiento, rapidez de desarrollo y una experiencia de usuario fluida.

- **Framework**: [React 19](https://react.dev/) (Vite como bundler).
- **Estilos**: [Tailwind CSS 3.4](https://tailwindcss.com/) (PostCSS).
- **Enrutamiento**: React Router DOM 7.
- **Visualización de Datos**: Recharts (Gráficos interactivos para el Dashboard).
- **Iconografía**: Lucide React.
- **Generación de Reportes**:
  - `jspdf` y `jspdf-autotable` para creación dinámica de PDFs.
  - `html-to-image` para capturas de pantalla de componentes.
- **Pruebas**: Vitest.

---

## 📱 Módulo Móvil (App)
Construido sobre una arquitectura moderna para permitir una transición suave desde la web a dispositivos nativos.

- **Framework**: [Expo 54](https://expo.dev/) (React Native 0.81).
- **Navegación**: React Navigation 7 (Bottom Tabs y Stack Navigation).
- **Estilos**: React Native Reanimated (para micro-animaciones) y Svg.
- **Gráficos**: React Native Chart Kit.
- **Almacenamiento Local**: AsyncStorage para persistencia básica.
- **Funcionalidades Nativas**:
  - Expo Print (Generación de PDF).
  - Expo Sharing (Compartir facturas por WhatsApp/Email).
  - Expo Image Picker (Gestión de imágenes de productos).
- **Utilidades**: Lucide React Native.

---

## 🗄️ Backend y Base de Datos (Infraestructura)
Implementación basada en el modelo **BaaS (Backend as a Service)** para maximizar la escalabilidad.

- **Proveedor**: [Supabase](https://supabase.com/).
- **Base de Datos**: PostgreSQL (Relacional).
- **Seguridad**: Row Level Security (RLS) para aislamiento multi-tenant.
- **Autenticación**: Supabase Auth (Email/Password, Social Login listo).
- **Almacenamiento de Archivos**: Supabase Storage (para logos y fotos de productos).
- **Hosting Web**: [Vercel](https://vercel.com/).
- **Lógica de Servidor**: SQL para procedimientos y automatizaciones de base de datos.

---

## 🔍 Resumen por Lenguajes:
- **JavaScript**: 85% (Lógica de negocio y UI).
- **SQL**: 10% (Esquemas, migraciones y seguridad de base de datos).
- **CSS**: 4% (Estilos personalizados adicionales).
- **Markdown**: 1% (Documentación y planes de viabilidad).
