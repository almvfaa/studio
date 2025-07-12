# **App Name**: InventarioClaro

## Core Features:

- Cascading Filters: Display cascaded filters for Capítulo, Concepto, Partida Genérica, and Partida Específica.  The options in the filters will be automatically populated from the Cloud Firestore database, and updated appropriately when a higher-level filter is chosen.
- Inventory Trend Visualization: Visualize data using Chart.js with a line graph showing monthly trends of inventario_final_importe, entradas_importe, and salidas_importe.
- Tabular Data Display: Present monthly inventory summaries with aggregated totals in a clear, tabular format.
- Data Loader: Provide a button to generate and load sample data into the Firestore collections, including the expense classifier catalogs (capitulos_gasto, conceptos_gasto, partidas_genericas, partidas_especificas, articulos) and initial inventario_mensual entries, for demonstration purposes.
- Data Retrieval Trigger: The 'Analyze' button triggers a call to the Cloud Function to fetch filtered inventory data based on the selected criteria.
- Key Performance Indicators (KPIs): Display KPIs such as total final inventory value, total entries, and total exits for the latest analyzed month based on the filter applied.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey professionalism and stability.
- Background color: Light gray (#F5F5F5) for a clean and neutral backdrop.
- Accent color: Teal (#009688) to highlight interactive elements and important data points, providing contrast and visual interest.
- Body and headline font: 'Inter', a sans-serif font, chosen for its modern, clean and neutral appearance.
- Use simple, clear icons from a consistent set (e.g., Material Design Icons) to represent categories and actions.
- Employ a responsive, grid-based layout to ensure optimal viewing across different devices and screen sizes.
- Incorporate subtle transitions and loading animations to enhance user experience without being distracting.