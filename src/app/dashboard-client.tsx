"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import KpiCard from "@/components/kpi-card";
import InventoryChart from "@/components/inventory-chart";
import InventoryTable from "@/components/inventory-table";

import {
  getFilterOptions,
  getInventoryAnalysis,
} from "./actions";
import type {
  CapituloGasto,
  ConceptoGasto,
  PartidaGenerica,
  PartidaEspecifica,
  AnalysisResult,
  Filters,
} from "@/lib/types";
import { TrendingUp, ArrowRight, ArrowLeft, BarChart, List } from "lucide-react";

export default function DashboardClient() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isDataLoading, setDataLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Filter states
  const [capitulos, setCapitulos] = useState<CapituloGasto[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoGasto[]>([]);
  const [partidasGenericas, setPartidasGenericas] = useState<PartidaGenerica[]>([]);
  const [partidasEspecificas, setPartidasEspecificas] = useState<PartidaEspecifica[]>([]);

  const [selectedCapitulo, setSelectedCapitulo] = useState<string>();
  const [selectedConcepto, setSelectedConcepto] = useState<string>();
  const [selectedPartidaGenerica, setSelectedPartidaGenerica] = useState<string>();
  const [selectedPartidaEspecifica, setSelectedPartidaEspecifica] = useState<string>();

  useEffect(() => {
    getFilterOptions("capitulos_gasto").then(setCapitulos);
    handleAnalyze(); // Initial analysis
  }, []);

  const handleAnalyze = () => {
    const filters: Filters = {
      capitulo_id: selectedCapitulo,
      concepto_id: selectedConcepto,
      partida_generica_id: selectedPartidaGenerica,
      partida_especifica_id: selectedPartidaEspecifica,
    };
    setDataLoading(true);
    startTransition(async () => {
      const result = await getInventoryAnalysis(filters);
      setAnalysisResult(result);
      setDataLoading(false);
    });
  };

  const handleCapituloChange = (value: string) => {
    setSelectedCapitulo(value);
    setSelectedConcepto(undefined);
    setSelectedPartidaGenerica(undefined);
    setSelectedPartidaEspecifica(undefined);
    setConceptos([]);
    setPartidasGenericas([]);
    setPartidasEspecificas([]);
    if (value) {
      getFilterOptions("conceptos_gasto", value, "capitulo_id").then(setConceptos);
    }
  };

  const handleConceptoChange = (value: string) => {
    setSelectedConcepto(value);
    setSelectedPartidaGenerica(undefined);
    setSelectedPartidaEspecifica(undefined);
    setPartidasGenericas([]);
    setPartidasEspecificas([]);
    if (value) {
      getFilterOptions("partidas_genericas", value, "concepto_id").then(setPartidasGenericas);
    }
  };
  
  const handlePartidaGenericaChange = (value: string) => {
    setSelectedPartidaGenerica(value);
    setSelectedPartidaEspecifica(undefined);
    setPartidasEspecificas([]);
    if (value) {
      getFilterOptions("partidas_especificas", value, "partida_generica_id").then(setPartidasEspecificas);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros Jerárquicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select onValueChange={handleCapituloChange} value={selectedCapitulo}>
              <SelectTrigger><SelectValue placeholder="Seleccionar Capítulo" /></SelectTrigger>
              <SelectContent>
                {capitulos.map((c) => (<SelectItem key={c.id} value={c.id}>{c.id} - {c.denominacion}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleConceptoChange} value={selectedConcepto} disabled={!selectedCapitulo}>
              <SelectTrigger><SelectValue placeholder="Seleccionar Concepto" /></SelectTrigger>
              <SelectContent>
                {conceptos.map((c) => (<SelectItem key={c.id} value={c.id}>{c.id} - {c.denominacion}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select onValueChange={handlePartidaGenericaChange} value={selectedPartidaGenerica} disabled={!selectedConcepto}>
              <SelectTrigger><SelectValue placeholder="Seleccionar Partida Genérica" /></SelectTrigger>
              <SelectContent>
                {partidasGenericas.map((p) => (<SelectItem key={p.id} value={p.id}>{p.id} - {p.denominacion}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedPartidaEspecifica} value={selectedPartidaEspecifica} disabled={!selectedPartidaGenerica}>
              <SelectTrigger><SelectValue placeholder="Seleccionar Partida Específica" /></SelectTrigger>
              <SelectContent>
                {partidasEspecificas.map((p) => (<SelectItem key={p.id} value={p.id}>{p.id} - {p.denominacion}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAnalyze} disabled={isDataLoading || isPending}>
            {isDataLoading || isPending ? "Analizando..." : "Analizar"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {isDataLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <KpiCard title="Valor Inventario Final" value={analysisResult?.kpis.total_inventario_final || 0} icon={TrendingUp} />
            <KpiCard title="Total Entradas (Importe)" value={analysisResult?.kpis.total_entradas || 0} icon={ArrowRight} />
            <KpiCard title="Total Salidas (Importe)" value={analysisResult?.kpis.total_salidas || 0} icon={ArrowLeft} />
          </>
        )}
      </div>
      
      <Tabs defaultValue="chart" className="w-full">
        <TabsList>
          <TabsTrigger value="chart"><BarChart className="mr-2 h-4 w-4" />Gráfica</TabsTrigger>
          <TabsTrigger value="table"><List className="mr-2 h-4 w-4" />Tabla</TabsTrigger>
        </TabsList>
        <TabsContent value="chart">
           <Card>
            <CardHeader><CardTitle>Evolución Mensual del Inventario</CardTitle></CardHeader>
            <CardContent>
              {isDataLoading ? <Skeleton className="h-[400px]" /> : <InventoryChart data={analysisResult?.timeSeries || []} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="table">
            <Card>
            <CardHeader><CardTitle>Resumen Mensual</CardTitle></CardHeader>
            <CardContent>
                {isDataLoading ? <Skeleton className="h-[400px]" /> : <InventoryTable data={analysisResult?.timeSeries || []} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
