import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWorkOrder, useUploadMedia, useUpdateStatus } from '@/hooks/useWorkOrders';
import { MediaUploader } from '@/components/MediaUploader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Truck, Loader2 } from 'lucide-react';

export default function DeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const { data: wo, isLoading } = useWorkOrder(id!);
  const uploadMedia = useUploadMedia(id!);
  const updateStatus = useUpdateStatus(id!);
  const [deliveryVideo, setDeliveryVideo] = useState<File[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleDeliver = async () => {
    if (!deliveryVideo.length) {
      toast({ title: 'Envie o vídeo de entrega', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      deliveryVideo.forEach((f) => formData.append('DELIVERY_VIDEO', f));
      await uploadMedia.mutateAsync(formData);
      await updateStatus.mutateAsync({ status: 'DELIVERED' });
      toast({ title: 'Veículo entregue com sucesso!' });
      navigate(`/os/${id}`);
    } catch {
      toast({ title: 'Erro na entrega', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!wo || wo.status !== 'READY') {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <p className="text-muted-foreground">Esta OS não está pronta para entrega.</p>
        <Button variant="outline" asChild><Link to={`/os/${id}`}>Voltar para OS</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Button variant="ghost" asChild>
        <Link to={`/os/${id}`}><ArrowLeft className="h-4 w-4 mr-2" />Voltar para OS</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Entrega do Veículo</CardTitle>
              <CardDescription className="font-mono mt-1">{wo.code} · {wo.vehicle?.plate}</CardDescription>
            </div>
            <StatusBadge status={wo.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <MediaUploader
            label="Vídeo de Entrega (obrigatório)"
            accept="video/*"
            multiple={false}
            files={deliveryVideo}
            onChange={setDeliveryVideo}
          />

          {deliveryVideo.length > 0 && deliveryVideo[0] && (
            <div className="rounded-md overflow-hidden border">
              <video
                src={URL.createObjectURL(deliveryVideo[0])}
                controls
                className="w-full max-h-64 object-contain bg-black"
              />
            </div>
          )}

          <Button className="w-full" onClick={handleDeliver} disabled={!deliveryVideo.length || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Truck className="h-4 w-4 mr-2" />}
            Confirmar Entrega
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
