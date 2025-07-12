"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

interface InventoryChartProps {
  data: {
    month: string;
    entradas_importe: number;
    salidas_importe: number;
    inventario_final_importe: number;
  }[];
}

const chartConfig = {
  inventario_final_importe: {
    label: "Inventario Final",
    color: "hsl(var(--primary))",
  },
  entradas_importe: {
    label: "Entradas",
    color: "hsl(var(--accent))",
  },
  salidas_importe: {
    label: "Salidas",
    color: "hsl(var(--destructive))",
  },
}

export default function InventoryChart({ data }: InventoryChartProps) {
    if (data.length === 0) {
        return <div className="flex items-center justify-center h-[400px] text-muted-foreground">No hay datos para mostrar en la gráfica.</div>
    }

  return (
    <div className="h-[400px] w-full">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                tickFormatter={(value) =>
                    `$${new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                    }).format(value as number)}`
                }
                />
                <Tooltip
                    content={
                        <ChartTooltipContent
                            formatter={(value, name) => (
                            <div className="flex flex-col">
                                <span className="text-xs">{chartConfig[name as keyof typeof chartConfig].label}</span>
                                <span className="font-bold">
                                {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value as number)}
                                </span>
                            </div>
                            )}
                        />
                    }
                    />
                <Legend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="inventario_final_importe" stroke={chartConfig.inventario_final_importe.color} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="entradas_importe" stroke={chartConfig.entradas_importe.color} strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="salidas_importe" stroke={chartConfig.salidas_importe.color} strokeWidth={2} dot={false}/>
            </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
