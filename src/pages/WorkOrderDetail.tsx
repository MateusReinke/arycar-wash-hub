import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWorkOrder, useUpdateStatus } from '@/hooks/useWorkOrders';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusTimeline } from '@/components/StatusTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Play, CheckCircle, Truck, XCircle, FileVideo, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { WorkOrderStatus } from '@/types';
import api from '@/services/api';

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: wo, isLoading, error } = useWorkOrder(id!);
  const updateStatus = useUpdateStatus(id!);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (error || !wo) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-destructive">Erro ao carregar a OS.</p>
        <Button variant="outline" onClick={() => navigate('/')}>Voltar</Button>
      </div>
    );
  }

  const hasEntryVideos = wo.media?.some((m) => m.type === 'ENTRY_VIDEO_EXTERNAL') && wo.media?.some((m) => m.type === 'ENTRY_VIDEO_INTERNAL');

  const handleTransition = async (status: WorkOrderStatus) => {
    if (status === 'DELIVERED') {
      navigate(`/os/${id}/entrega`);
      return;
    }
    try {
      await updateStatus.mutateAsync({ status });
      toast({ title: `Status alterado para ${status}` });
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
    }
  };

  const getSignedUrl = async (mediaId: string) => {
    try {
      const { data } = await api.get(`/media/${mediaId}/signed-url`);
      window.open(data.url, '_blank');
    } catch {
      toast({ title: 'Erro ao abrir mídia', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" asChild className="mb-2">
        <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Link>
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="font-mono text-lg font-bold text-primary">{wo.code}</p>
              <p className="text-2xl font-mono font-bold mt-1">{wo.vehicle?.plate || '—'}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {wo.customer?.name && <span>{wo.customer.name} · </span>}
                {wo.customer?.phone || '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Criado em {format(new Date(wo.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={wo.status} className="text-sm px-3 py-1" />

              {/* Transition buttons */}
              <div className="flex gap-2 flex-wrap justify-end">
                {wo.status === 'CREATED' && (
                  <>
                    <Button size="sm" onClick={() => handleTransition('IN_PROGRESS')} disabled={!hasEntryVideos || updateStatus.isPending}>
                      <Play className="h-3.5 w-3.5 mr-1" />Iniciar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleTransition('CANCELLED')} disabled={updateStatus.isPending}>
                      <XCircle className="h-3.5 w-3.5 mr-1" />Cancelar
                    </Button>
                  </>
                )}
                {wo.status === 'IN_PROGRESS' && (
                  <Button size="sm" onClick={() => handleTransition('READY')} disabled={updateStatus.isPending}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Marcar Pronta
                  </Button>
                )}
                {wo.status === 'READY' && (
                  <Button size="sm" onClick={() => handleTransition('DELIVERED')} disabled={updateStatus.isPending}>
                    <Truck className="h-3.5 w-3.5 mr-1" />Entregar
                  </Button>
                )}
              </div>

              {wo.status === 'CREATED' && !hasEntryVideos && (
                <p className="text-xs text-destructive">Envie os vídeos de entrada para iniciar</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      {wo.services && wo.services.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Serviços</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {wo.services.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span>{s.service?.name || s.service_id}</span>
                  <span className="text-muted-foreground">×{s.quantity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Notas</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Notas sobre a OS…" defaultValue={wo.notes || ''} readOnly={wo.status === 'DELIVERED' || wo.status === 'CANCELLED'} className="min-h-[80px]" />
        </CardContent>
      </Card>

      {/* Media */}
      {wo.media && wo.media.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Mídias</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wo.media.map((m) => (
                <button key={m.id} onClick={() => getSignedUrl(m.id)} className="flex flex-col items-center gap-1 rounded-md border p-3 hover:bg-muted transition-colors">
                  {m.mime_type.startsWith('video/') ? (
                    <FileVideo className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">{m.type.replace(/_/g, ' ')}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
        <CardContent>
          <StatusTimeline events={wo.events || []} />
        </CardContent>
      </Card>
    </div>
  );
}
