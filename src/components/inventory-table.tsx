"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryTableProps {
  data: {
    month: string;
    entradas_importe: number;
    salidas_importe: number;
    inventario_final_importe: number;
  }[];
}

export default function InventoryTable({ data }: InventoryTableProps) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[400px] text-muted-foreground">No hay datos para mostrar en la tabla.</div>
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Mes</TableHead>
            <TableHead className="text-right font-bold">Entradas</TableHead>
            <TableHead className="text-right font-bold">Salidas</TableHead>
            <TableHead className="text-right font-bold">Inventario Final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.month}>
              <TableCell className="font-medium">{row.month}</TableCell>
              <TableCell className="text-right text-green-600">{formatCurrency(row.entradas_importe)}</TableCell>
              <TableCell className="text-right text-red-600">{formatCurrency(row.salidas_importe)}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(row.inventario_final_importe)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
