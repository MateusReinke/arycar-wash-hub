import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useCreateWorkOrder } from '@/hooks/useWorkOrders';
import { PlateInput } from '@/components/PlateInput';
import { MediaUploader } from '@/components/MediaUploader';
import { isValidPlate } from '@/lib/plate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';

const STEPS = ['Veículo', 'Serviços', 'Cliente', 'Mídias', 'Resumo'];

interface SelectedService {
  service_id: string;
  name: string;
  quantity: number;
}

export default function NewWorkOrder() {
  const [step, setStep] = useState(0);
  const [plate, setPlate] = useState('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [entryVideoExt, setEntryVideoExt] = useState<File[]>([]);
  const [entryVideoInt, setEntryVideoInt] = useState<File[]>([]);
  const [detailPhotos, setDetailPhotos] = useState<File[]>([]);

  const { data: services, isLoading: loadingServices } = useServices();
  const createOrder = useCreateWorkOrder();
  const navigate = useNavigate();
  const { toast } = useToast();

  const canNext = () => {
    switch (step) {
      case 0: return isValidPlate(plate);
      case 1: return selectedServices.length > 0;
      case 2: return phone.length >= 10;
      case 3: return true;
      default: return true;
    }
  };

  const toggleService = (svc: { id: string; name: string }) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.service_id === svc.id);
      if (exists) return prev.filter((s) => s.service_id !== svc.id);
      return [...prev, { service_id: svc.id, name: svc.name, quantity: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    setSelectedServices((prev) => prev.map((s) => s.service_id === id ? { ...s, quantity: Math.max(1, qty) } : s));
  };

  const handleSubmit = async () => {
    try {
      const order = await createOrder.mutateAsync({
        plate,
        customer_phone: phone,
        customer_name: customerName || undefined,
        services: selectedServices.map(({ service_id, quantity }) => ({ service_id, quantity })),
      });

      // Upload media files if any
      if (entryVideoExt.length || entryVideoInt.length || detailPhotos.length) {
        const formData = new FormData();
        entryVideoExt.forEach((f) => formData.append('ENTRY_VIDEO_EXTERNAL', f));
        entryVideoInt.forEach((f) => formData.append('ENTRY_VIDEO_INTERNAL', f));
        detailPhotos.forEach((f) => formData.append('ENTRY_DETAIL_PHOTO', f));

        const { default: api } = await import('@/services/api');
        await api.post(`/work-orders/${order.id}/media`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast({ title: 'OS criada com sucesso!' });
      navigate(`/os/${order.id}`);
    } catch {
      toast({ title: 'Erro ao criar OS', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Nova Ordem de Serviço</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:inline ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-4 sm:w-8 h-0.5 bg-border mx-1" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Step 0 — Veículo */}
          {step === 0 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Veículo</CardTitle>
                <CardDescription>Digite a placa do veículo</CardDescription>
              </CardHeader>
              <PlateInput value={plate} onChange={setPlate} />
            </div>
          )}

          {/* Step 1 — Serviços */}
          {step === 1 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Serviços</CardTitle>
                <CardDescription>Selecione os serviços a realizar</CardDescription>
              </CardHeader>
              {loadingServices ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : !services?.length ? (
                <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado. Configure os serviços na API.</p>
              ) : (
                <div className="space-y-2">
                  {services.filter((s) => s.is_active).map((svc) => {
                    const selected = selectedServices.find((s) => s.service_id === svc.id);
                    return (
                      <div key={svc.id} className="flex items-center gap-3 rounded-md border p-3">
                        <Checkbox checked={!!selected} onCheckedChange={() => toggleService(svc)} />
                        <span className="flex-1 text-sm font-medium">{svc.name}</span>
                        {svc.price_cents != null && (
                          <span className="text-sm text-muted-foreground">
                            R$ {(svc.price_cents / 100).toFixed(2)}
                          </span>
                        )}
                        {selected && (
                          <Input
                            type="number"
                            min={1}
                            value={selected.quantity}
                            onChange={(e) => updateQty(svc.id, Number(e.target.value))}
                            className="w-16 h-8 text-center"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Cliente */}
          {step === 2 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Cliente</CardTitle>
                <CardDescription>Telefone obrigatório, nome opcional</CardDescription>
              </CardHeader>
              <div className="space-y-2">
                <Label>Telefone *</Label>
                <Input placeholder="11999998888" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={11} />
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Nome do cliente (opcional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 3 — Mídias */}
          {step === 3 && (
            <div className="space-y-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Mídias de Entrada</CardTitle>
                <CardDescription>Vídeos e fotos do veículo na entrada</CardDescription>
              </CardHeader>
              <MediaUploader label="Vídeo Externo" accept="video/*" files={entryVideoExt} onChange={setEntryVideoExt} />
              <MediaUploader label="Vídeo Interno" accept="video/*" files={entryVideoInt} onChange={setEntryVideoInt} />
              <MediaUploader label="Fotos de Detalhe" accept="image/*" files={detailPhotos} onChange={setDetailPhotos} />
            </div>
          )}

          {/* Step 4 — Resumo */}
          {step === 4 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Resumo</CardTitle>
                <CardDescription>Confirme os dados antes de criar</CardDescription>
              </CardHeader>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Placa</span>
                  <span className="font-mono font-bold">{plate}</span>
                </div>
                <div className="border-b pb-2">
                  <span className="text-muted-foreground">Serviços</span>
                  <ul className="mt-1 space-y-1">
                    {selectedServices.map((s) => (
                      <li key={s.service_id} className="flex justify-between">
                        <span>{s.name}</span>
                        <span className="text-muted-foreground">×{s.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Telefone</span>
                  <span>{phone}</span>
                </div>
                {customerName && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Nome</span>
                    <span>{customerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mídias</span>
                  <span>{entryVideoExt.length + entryVideoInt.length + detailPhotos.length} arquivo(s)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : navigate('/')} >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 0 ? 'Cancelar' : 'Voltar'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={createOrder.isPending}>
            {createOrder.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Criar OS
          </Button>
        )}
      </div>
    </div>
  );
}
