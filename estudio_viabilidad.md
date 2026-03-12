# Estudio de viabilidad del proyecto Gestión360 (versión app Play Store)

## 1. Descripción general del proyecto

**Gestión360** es una aplicación SaaS de gestión para pequeños negocios y emprendedores que venden productos o servicios y hoy no tienen un orden real de sus operaciones (mayoristas de ropa, vendedores de comida, oficios y servicios que manejan stock y clientes). [file:71]  
La app permite:  
- Crear facturas caseras profesionales. [file:71]  
- Controlar inventario con doble precio (costo y venta). [file:71]  
- Gestionar clientes con historial. [file:71]  
- Ver indicadores simples de ingresos y ganancia neta, con reportes en PDF. [file:71]  

Técnicamente, el producto ya existe como **web app** (React + Vite en Vercel, backend BaaS en Supabase con PostgreSQL, Auth, Storage y RLS multi-tenant), y el objetivo de este análisis es evaluar la viabilidad de **adaptarlo y publicarlo en Google Play Store** bajo un modelo freemium con suscripción Pro de **20.000 COP/mes**, sin publicidad. [file:71]

---

## 2. Mercado objetivo y oportunidad

El público objetivo son micro y pequeños negocios latinoamericanos, especialmente en Colombia, que:  
- Manejan ventas, stock y clientes, pero sin sistema formal (usan cuadernos, Excel, WhatsApp).  
- No necesitan todavía facturación electrónica DIAN ni contabilidad avanzada, sino **orden práctico**. [file:71]  

Según la DIAN y análisis tributarios recientes, muchos pequeños negocios y personas naturales con ingresos por debajo de ciertos topes (expresados en UVT) **no están obligados a facturar electrónicamente**, por lo que pueden usar soluciones de “facturación casera” para control interno sin incumplir la normativa. [web:46][web:48][web:50]  

En paralelo, el mercado de **ERP/SaaS para PYMEs en América Latina** está creciendo con fuerza, impulsado por:  
- Mayor adopción de soluciones cloud por parte de PYMEs para reducir costos frente a ERP tradicionales. [web:27]  
- Una proyección de crecimiento anual relevante del mercado SaaS en la región hasta al menos 2026. [web:40][web:31]  

Los principales competidores (Alegra, Siigo, Zoho, Billdu, etc.) suelen:  
- Apuntar a empresas más formalizadas.  
- Incluir facturación electrónica y contabilidad profunda.  
- Estar precificados en dólares o en rangos de precio medio/alto. [file:71][web:30]  

Esto deja un espacio atractivo para una solución como Gestión360: **simple, en español, enfocada en orden diario de ventas, stock y clientes, y a un precio muy accesible** para negocios pequeños que aún no están listos para un ERP completo ni para la DIAN. [file:71]

---

## 3. Modelo de negocio y estructura de costos

### 3.1 Modelo de ingresos

Se propone un modelo **freemium sin publicidad**:  
- **Plan gratuito:** uso limitado (ej. número de facturas/mes, límite de clientes/productos) para probar y usar en escala pequeña. [file:71]  
- **Plan Pro:** 20.000 COP/mes, con límites ampliados o inexistentes y acceso a funcionalidades adicionales (reportes avanzados, más volumen, mejor control de cobros, etc.). [file:71]  

La app para Android se distribuiría a través de **Google Play Store**, pero la suscripción puede gestionarse:  
- Preferentemente con **pasarela de pago externa** (web propia), aprovechando los cambios en las políticas de Play que permiten más libertad de facturación, reduciendo o eliminando la comisión directa de Google sobre las suscripciones. [web:56][web:60][web:62][web:66]  

### 3.2 Costos de infraestructura

**Estado actual (MVP web):**  
- Supabase free tier (DB, Auth, Storage): 0 USD/mes. [file:71]  
- Vercel free tier (hosting frontend): 0 USD/mes. [file:71]  
- Dominio: no obligatorio por ahora (subdominio de Vercel). [file:71]  

**Escenario de escala moderada (100+ usuarios activos):**  
- Supabase Pro: ~25 USD/mes. [file:71]  
- Vercel Pro: ~20 USD/mes. [file:71]  
- Dominio .com: ~12 USD/año. [file:71]  

Total aproximado: **46 USD/mes**, que a un tipo de cambio cercano a 3.800 COP/USD implica unos **175.000 COP/mes** de infraestructura. [file:71][web:65]  

**Costos adicionales relevantes:**  
- Cuenta de desarrollador de Google Play: pago único de **25 USD** (~95.000 COP). [file:71][web:56]  

Conclusión: el **costo operativo mensual** es muy bajo, y en el estado actual (tiers free) prácticamente nulo; solo al crecer significativamente (100+ usuarios activos) se haría necesario pasar a planes de pago, pero incluso entonces el costo sigue siendo moderado. [file:71]

---

## 4. Punto de equilibrio y proyecciones mínimas

Considerando la suscripción Pro de **20.000 COP/mes** y el escenario de infraestructura pagada:

- Coste mensual aproximado de infraestructura: **175.000 COP**. [file:71]  
- Ingreso por usuario Pro (sin comisiones de Play, facturación externa): **20.000 COP**.  

**Punto de equilibrio operativo:**  
- Usuarios Pro necesarios = 175.000 / 20.000 ≈ **9 usuarios Pro**.  

**Objetivo del emprendedor:** al menos **250.000 COP mensuales** de ingresos.  
- Con **13 usuarios Pro**: 13 × 20.000 = **260.000 COP/mes** → objetivo alcanzado incluso asumiendo ya la infraestructura pagada. [file:71]  

Mientras el producto opere sobre tiers gratuitos de Supabase y Vercel, esos 260.000 COP/mes serían prácticamente **margen bruto**, descontando solo comisiones de pasarela y el pago único de la cuenta de desarrollador. [file:71][web:56]  

Esta estructura hace que:  
- El **punto de equilibrio** esté muy bajo (alrededor de 9 usuarios de pago).  
- La meta de 250.000 COP/mes se logre con ~13–14 usuarios Pro, lo cual es realista si se atiende a un mercado amplio de microemprendedores. [file:71][web:27]

---

## 5. Riesgos principales y mitigaciones

### 5.1 Alcance contable y fiscal

**Riesgo:** Gestión360 **no es un sistema de facturación electrónica DIAN** ni un sistema contable certificado; las facturas son comprobantes internos, no documentos fiscales oficiales. [file:71][web:54][web:55]  

**Mitigación:**  
- Incluir advertencias claras en:  
  - Política de privacidad. [file:71]  
  - Términos de uso. [file:71]  
  - Ficha de Play Store y dentro de la app (“No sustituye la facturación electrónica DIAN”). [file:71]  
- Posicionarse explícitamente como herramienta de **gestión y orden interno**, no de cumplimiento tributario. [file:71]

### 5.2 Adquisición de usuarios

**Riesgo:** el mayor desafío es **llegar** a mayoristas de ropa, vendedores de comida y otros negocios pequeños que no buscan activamente “ERP”, sino soluciones simples para “tener orden”. [file:71]  

**Mitigación:**  
- Foco de marketing en nichos concretos (ej.: mayoristas pequeños, negocios de comida, servicios que manejan productos). [file:71]  
- Mensajes en lenguaje cotidiano (“saber cuánto ganas”, “a quién le has fiado y cuánto stock te queda”) en lugar de jerga ERP. [file:71]  
- Uso de canales orgánicos (grupos de Facebook/WhatsApp, redes de emprendedores, referidos) antes de invertir en publicidad pagada. [web:31][web:32][web:38]  

### 5.3 Capacidad de desarrollo y alcance funcional

**Riesgo:** ser un proyecto liderado por una sola persona y con un PRD rico en funcionalidades (dashboard avanzado, reportes, panel admin, etc.) puede producir cuellos de botella y retrasar la salida a Play Store. [file:71]  

**Mitigación:**  
- Definir un **MVP móvil reducido**, centrado en:  
  - Autenticación y creación de negocio.  
  - Crear factura.  
  - Ver lista de facturas.  
  - Ver/gestionar clientes y productos básicos. [file:71]  
- Dejar para etapas posteriores: modo offline, notificaciones push, escáner, panel admin completo, etc. [file:71]  

### 5.4 Competencia indirecta en tiendas de apps

**Riesgo:** ya existen múltiples apps de facturación y control de ventas en Play Store, algunas gratuitas o freemium. [web:30]  

**Mitigación:**  
- Diferenciarse por:  
  - **Gestión de inventario con doble precio** (costo y venta) integrada a las ventas. [file:71]  
  - **Cálculo de ganancia neta real** desde el primer momento. [file:71]  
  - Interfaz en español, pensada para el contexto LATAM (IVA 19% Colombia por defecto). [file:71]  
- Usar textos y ejemplos muy concretos para los nichos mencionados. [file:71]

---

## 6. Conclusión de viabilidad

Desde la perspectiva **financiera**, Gestión360 es un proyecto **altamente viable**:  
- Costos fijos de infraestructura muy bajos (0 COP/mes en el estado actual y ~175.000 COP/mes en una escala moderada). [file:71][web:65]  
- Punto de equilibrio en torno a 9 usuarios Pro y cumplimiento de la meta de 250.000 COP/mes con unos 13–14 usuarios de pago. [file:71]  

Desde la perspectiva de **mercado**, el producto se alinea bien con:  
- Un segmento amplio de micro y pequeños negocios que necesitan orden en ventas, stock y clientes más que soluciones contables completas. [file:71][web:48]  
- La tendencia de crecimiento del SaaS para PYMEs y ERP cloud en Latinoamérica, que abre espacio para herramientas ligeras, locales y de bajo costo. [web:27][web:30][web:40]  

Los **riesgos clave** (alcance fiscal, adquisición de usuarios, capacidad de desarrollo y competencia en tiendas de apps) son reales, pero tienen mitigaciones claras: posicionamiento honesto y limitado a gestión interna, MVP móvil acotado, foco en nichos concretos y estrategia de adquisición orgánica inicial. [file:71][web:32][web:38]  

En síntesis, Gestión360, en su versión app para Play Store con modelo freemium y plan Pro de 20.000 COP, presenta una **relación riesgo–recompensa favorable** y una viabilidad realista, siempre que se mantenga un alcance funcional prudente en la primera versión móvil y se ejecute una estrategia de nicho bien enfocada. [file:71][web:27]
```

