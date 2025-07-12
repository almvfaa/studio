"use server";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import type {
  Articulo,
  CapituloGasto,
  ConceptoGasto,
  PartidaGenerica,
  PartidaEspecifica,
  AnalysisResult,
  Filters,
  FilterLevel
} from "@/lib/types";

// Helper function to chunk arrays for 'in' queries
const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

export async function loadSampleData(): Promise<{ success: boolean; message: string }> {
  try {
    const batch = writeBatch(db);

    // Catalogos
    const capitulos: CapituloGasto[] = [
      { id: "1000", denominacion: "SERVICIOS PERSONALES" },
      { id: "2000", denominacion: "MATERIALES Y SUMINISTROS" },
    ];
    capitulos.forEach((c) => batch.set(doc(db, "capitulos_gasto", c.id), c));

    const conceptos: ConceptoGasto[] = [
      { id: "2100", denominacion: "MATERIALES DE ADMINISTRACIÓN, EMISIÓN DE DOCUMENTOS Y ARTÍCULOS OFICIALES", capitulo_id: "2000" },
      { id: "2200", denominacion: "ALIMENTOS Y UTENSILIOS", capitulo_id: "2000" },
    ];
    conceptos.forEach((c) => batch.set(doc(db, "conceptos_gasto", c.id), c));

    const partidasGenericas: PartidaGenerica[] = [
        { id: "211", denominacion: "Materiales, Útiles y Equipos Menores de Oficina", concepto_id: "2100" },
        { id: "212", denominacion: "Materiales y Útiles de Impresión y Reproducción", concepto_id: "2100" },
        { id: "221", denominacion: "Productos Alimenticios para Personas", concepto_id: "2200" },
    ];
    partidasGenericas.forEach((p) => batch.set(doc(db, "partidas_genericas", p.id), p));

    const partidasEspecificas: PartidaEspecifica[] = [
        { id: "2111", denominacion: "Materiales y Útiles de Oficina", partida_generica_id: "211" },
        { id: "2211", denominacion: "Productos alimenticios", partida_generica_id: "221" },
    ];
    partidasEspecificas.forEach((p) => batch.set(doc(db, "partidas_especificas", p.id), p));
    
    const articulos: Articulo[] = [
        { id: "2111001", descripcion: "Bolígrafo", unidad_medida: "Pieza", partida_especifica_id: "2111" },
        { id: "2111002", descripcion: "Cuaderno", unidad_medida: "Pieza", partida_especifica_id: "2111" },
        { id: "2211001", descripcion: "Agua embotellada 500ml", unidad_medida: "Botella", partida_especifica_id: "2211" },
        { id: "2211002", descripcion: "Café en grano 1kg", unidad_medida: "Bolsa", partida_especifica_id: "2211" },
    ];
    articulos.forEach((a) => batch.set(doc(db, "articulos", a.id), a));
    
    // Inventario Mensual
    for (let i = 0; i < 24; i++) {
        const articulo = articulos[Math.floor(Math.random() * articulos.length)];
        const month = i % 12;
        const year = new Date().getFullYear() - (i > 11 ? 1 : 0);
        const fecha = Timestamp.fromDate(new Date(year, month, 15));
        
        const invInicialCant = Math.floor(Math.random() * 100) + 50;
        const invInicialImp = invInicialCant * (Math.random() * 10 + 5);
        const entradasCant = Math.floor(Math.random() * 50);
        const entradasImp = entradasCant * (Math.random() * 10 + 5);
        const salidasCant = Math.floor(Math.random() * invInicialCant);
        const salidasImp = salidasCant * (invInicialImp / invInicialCant);
        const invFinalCant = invInicialCant + entradasCant - salidasCant;
        const invFinalImp = invInicialImp + entradasImp - salidasImp;
        
        const inventarioDoc = doc(collection(db, "inventario_mensual"));
        batch.set(inventarioDoc, {
            fecha,
            codigo_articulo: articulo.id,
            inventario_inicial_cantidad: invInicialCant,
            inventario_inicial_importe: parseFloat(invInicialImp.toFixed(2)),
            entradas_cantidad: entradasCant,
            entradas_importe: parseFloat(entradasImp.toFixed(2)),
            salidas_cantidad: salidasCant,
            salidas_importe: parseFloat(salidasImp.toFixed(2)),
            inventario_final_cantidad: invFinalCant,
            inventario_final_importe: parseFloat(invFinalImp.toFixed(2)),
        });
    }

    await batch.commit();
    return { success: true, message: "Datos de prueba cargados exitosamente." };
  } catch (error) {
    console.error("Error loading sample data:", error);
    return { success: false, message: `Error al cargar datos: ${error instanceof Error ? error.message : "Error desconocido"}` };
  }
}

export async function getFilterOptions(collectionName: string, parentId?: string, parentField?: string) {
    try {
        const collRef = collection(db, collectionName);
        let q;
        if (parentId && parentField) {
            q = query(collRef, where(parentField, "==", parentId));
        } else {
            q = query(collRef);
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
}


async function getArticuloIds(filters: Filters): Promise<string[]> {
    let ids: string[] = [];
    let collectionName = "";
    let parentField: FilterLevel | null = null;
    let childField = "";

    if (filters.partida_especifica_id) {
        collectionName = 'articulos';
        parentField = 'partida_especifica_id';
        ids = [filters.partida_especifica_id];
    } else if (filters.partida_generica_id) {
        collectionName = 'partidas_especificas';
        parentField = 'partida_generica_id';
        childField = 'partida_especifica_id';
        ids = [filters.partida_generica_id];
    } else if (filters.concepto_id) {
        collectionName = 'partidas_genericas';
        parentField = 'concepto_id';
        childField = 'partida_generica_id';
        ids = [filters.concepto_id];
    } else if (filters.capitulo_id) {
        collectionName = 'conceptos_gasto';
        parentField = 'capitulo_id';
        childField = 'concepto_id';
        ids = [filters.capitulo_id];
    } else {
        const snapshot = await getDocs(collection(db, 'articulos'));
        return snapshot.docs.map(doc => doc.id);
    }
    
    const hierarchy: { coll: string, parent: string, child: string }[] = [
        { coll: 'conceptos_gasto', parent: 'capitulo_id', child: 'id' },
        { coll: 'partidas_genericas', parent: 'concepto_id', child: 'id' },
        { coll: 'partidas_especificas', parent: 'partida_generica_id', child: 'id' },
        { coll: 'articulos', parent: 'partida_especifica_id', child: 'id' }
    ];

    const startIndex = hierarchy.findIndex(h => h.parent === parentField);

    if (startIndex === -1 && filters.partida_especifica_id) {
        // This is the base case, we already have the specific part IDs
        const q = query(collection(db, 'articulos'), where('partida_especifica_id', '==', filters.partida_especifica_id));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.id);
    }
    
    let currentIds = ids;
    for (let i = startIndex; i < hierarchy.length; i++) {
        const level = hierarchy[i];
        if (currentIds.length === 0) return [];
        
        const idChunks = chunk(currentIds, 30);
        let nextLevelIds: string[] = [];

        for (const idChunk of idChunks) {
            const q = query(collection(db, level.coll), where(level.parent, 'in', idChunk));
            const snapshot = await getDocs(q);
            const newIds = snapshot.docs.map(doc => doc.data()[level.child] || doc.id);
            nextLevelIds.push(...newIds);
        }
        currentIds = nextLevelIds;
    }
    
    return currentIds;
}

export async function getInventoryAnalysis(filters: Filters): Promise<AnalysisResult | null> {
    try {
        const articuloIds = await getArticuloIds(filters);

        if (articuloIds.length === 0 && Object.keys(filters).length > 0) {
             return { timeSeries: [], kpis: { total_entradas: 0, total_salidas: 0, total_inventario_final: 0 } };
        }
        
        let inventoryDocs: any[] = [];
        if (articuloIds.length > 0) {
            const idChunks = chunk(articuloIds, 30);
            for (const idChunk of idChunks) {
                const q = query(collection(db, "inventario_mensual"), where("codigo_articulo", "in", idChunk));
                const snapshot = await getDocs(q);
                snapshot.forEach(doc => inventoryDocs.push({ id: doc.id, ...doc.data() }));
            }
        } else {
             const snapshot = await getDocs(collection(db, "inventario_mensual"));
             snapshot.forEach(doc => inventoryDocs.push({ id: doc.id, ...doc.data() }));
        }

        if (inventoryDocs.length === 0) {
             return { timeSeries: [], kpis: { total_entradas: 0, total_salidas: 0, total_inventario_final: 0 } };
        }

        const monthlyData: { [key: string]: { entradas_importe: number; salidas_importe: number; inventario_final_importe: number; date: Date } } = {};

        inventoryDocs.forEach(doc => {
            const date = (doc.fecha as Timestamp).toDate();
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    entradas_importe: 0,
                    salidas_importe: 0,
                    inventario_final_importe: 0,
                    date: date,
                };
            }
            monthlyData[monthKey].entradas_importe += doc.entradas_importe;
            monthlyData[monthKey].salidas_importe += doc.salidas_importe;
            monthlyData[monthKey].inventario_final_importe += doc.inventario_final_importe;
        });

        const timeSeries = Object.entries(monthlyData)
            .map(([month, data]) => ({
                month,
                ...data,
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(({ date, ...rest }) => rest);

        const lastMonth = timeSeries[timeSeries.length - 1];
        const kpis = {
            total_inventario_final: lastMonth?.inventario_final_importe || 0,
            total_entradas: lastMonth?.entradas_importe || 0,
            total_salidas: lastMonth?.salidas_importe || 0,
        };

        return { timeSeries, kpis };
    } catch (error) {
        console.error("Error getting inventory analysis:", error);
        return null;
    }
}
