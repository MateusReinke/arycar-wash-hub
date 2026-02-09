import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import type { WorkOrderStatus } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statuses: { value: WorkOrderStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'CREATED', label: 'Criada' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'READY', label: 'Pronta' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: orders, isLoading, error } = useWorkOrders({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
        <Button asChild>
          <Link to="/os/nova">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova OS
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa ou código…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {statuses.map((s) => (
                <Button
                  key={s.value}
                  variant={statusFilter === s.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(s.value)}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-destructive">
              Erro ao carregar ordens. Verifique se a API está disponível.
            </div>
          ) : !orders?.length ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhuma ordem de serviço encontrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((wo) => (
                  <TableRow key={wo.id} className="cursor-pointer" onClick={() => {}}>
                    <TableCell>
                      <Link to={`/os/${wo.id}`} className="font-mono font-medium text-primary hover:underline">
                        {wo.code}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">{wo.vehicle?.plate || '—'}</TableCell>
                    <TableCell>{wo.customer?.name || wo.customer?.phone || '—'}</TableCell>
                    <TableCell><StatusBadge status={wo.status} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(wo.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
