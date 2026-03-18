# Informe de Auditoría Financiera: Gestión360 (Web vs. Mobile)

Como responsable financiero del proyecto, he realizado una auditoría técnica de los algoritmos y la lógica matemática implementada en ambos módulos. A continuación, presento los hallazgos detallados sobre lo que cumple, lo que discrepa y los puntos de atención.

## 1. Validación de Funcionalidades Correctas ✅

Ambas versiones comparten una base técnica sólida en los siguientes puntos:

- **Precisión de Redondeo**: Tanto Web como Mobile utilizan `Number.EPSILON` para evitar errores de coma flotante en los cálculos de moneda.
- **Fórmula de Totales**: La secuencia `(Subtotal - Descuento) + IVA` es consistente en ambas plataformas, garantizando que el impuesto se calcule sobre el valor real de venta.
- **Cálculo de Ganancia Neta**: Ambas versiones deducen correctamente el **costo base de compra** y los **impuestos** del total para obtener la utilidad real.
- **Control de Inventario**: La métrica de "Inversión en Inventario" (`stock * costo_base`) está correctamente implementada en el Dashboard móvil.

---

## 2. Hallazgos y Discrepancias Detectadas ⚠️

He identificado diferencias importantes en la metodología de cálculo que podrían causar confusión al usuario final al comparar ambos paneles:

### A. Metodología del Dashboard (Crítico)
-   **Web (Base de Efectivo)**: El panel web calcula ingresos y ganancias basándose en el **monto pagado** (`amount_paid`). Si una factura es de $1M pero solo se han pagado $200k, el dashboard web solo muestra $200k de ingreso.
-   **Mobile (Base de Devengo)**: El panel móvil utiliza el **total facturado** (`total`), sin importar si se ha pagado o no. En el mismo ejemplo, el dashboard móvil mostraría $1M de ingreso.
-   **Impacto**: Las gráficas y totales no coincidirán a menos que todas las facturas estén marcadas como pagadas.

### B. Flexibilidad Tributaria (Medio)
-   **Web**: Permite configurar y cambiar la tasa de IVA (por defecto 19%).
-   **Mobile**: Tiene la tasa de IVA **hardcoded al 19%** en el código. Esto limita el uso de la app móvil en contextos donde el IVA sea diferente o para productos exentos.

### C. Gestión de Descuentos
-   **Web**: La lógica interna soporta descuentos fijos y porcentuales, aunque el formulario actual prioriza el valor fijo.
-   **Mobile**: Solo permite descuentos de valor fijo en la interfaz de creación de facturas.

### D. Redondeo en Ítems (Bajo)
-   **Mobile**: Aplica un `Math.round()` individual a cada línea de producto (`subtotal por ítem`).
-   **Web**: Mantiene los decimales en las líneas individuales y solo redondea al final del cálculo de totales.

---

## 3. Conclusiones del Auditor

| Criterio | Estado | Observación |
| :--- | :---: | :--- |
| **Paridad de Cálculos** | 🟧 | La lógica base es igual, pero las metodologías de reporte difieren. |
| **Precisión Matemática** | ✅ | No se detectaron fugas de centavos ni errores de desbordamiento. |
| **Validación de Negocio** | ✅ | Cumple con los requisitos de ganancia neta e inversión solicitados. |
| **Consistencia de Datos** | 🟧 | El Dashboard Web es más realista (contable), el Mobile es más ventas (comercial). |

### Recomendación Proactiva
Para garantizar una experiencia profesional "360", recomiendo unificar la lógica del Dashboard. La versión **Web** es financieramente más precisa al basarse en flujos de caja reales, mientras que la versión **Mobile** es más optimista al mostrar ventas proyectadas.

---
*Informe generado con fines de validación técnica. No se han modificado archivos de código según lo solicitado.*
