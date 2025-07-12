export interface CapituloGasto {
  id: string;
  denominacion: string;
}

export interface ConceptoGasto {
  id: string;
  denominacion: string;
  capitulo_id: string;
}

export interface PartidaGenerica {
  id: string;
  denominacion: string;
  concepto_id: string;
}

export interface PartidaEspecifica {
  id: string;
  denominacion: string;
  partida_generica_id: string;
}

export interface Articulo {
  id: string;
  descripcion: string;
  unidad_medida: string;
  partida_especifica_id: string;
}

export interface InventarioMensual {
  id: string;
  fecha: Date; // Firestore Timestamp will be converted to Date
  codigo_articulo: string;
  inventario_inicial_cantidad: number;
  inventario_inicial_importe: number;
  entradas_cantidad: number;
  entradas_importe: number;
  salidas_cantidad: number;
  salidas_importe: number;
  inventario_final_cantidad: number;
  inventario_final_importe: number;
}

export interface AnalysisResult {
  timeSeries: {
    month: string;
    entradas_importe: number;
    salidas_importe: number;
    inventario_final_importe: number;
  }[];
  kpis: {
    total_inventario_final: number;
    total_entradas: number;
    total_salidas: number;
  };
}

export type FilterLevel = 'capitulo_id' | 'concepto_id' | 'partida_generica_id' | 'partida_especifica_id';

export interface Filters {
    capitulo_id?: string;
    concepto_id?: string;
    partida_generica_id?: string;
    partida_especifica_id?: string;
}
