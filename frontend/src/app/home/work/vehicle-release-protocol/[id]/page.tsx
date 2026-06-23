import { httpGet } from '@/_lib/server/query-api';
import Link from 'next/link';

interface ProtocolChecklistItem {
  itemName: string;
  isCompleted: boolean;
  notes?: string | null;
}

interface VehicleReleaseProtocol {
  workId: string;
  workNr: string;
  claimNumber?: string | null;
  clientName?: string | null;
  clientAddress?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  vehicleProducer?: string | null;
  vehicleModel?: string | null;
  vehicleVin?: string | null;
  vehicleRegNr?: string | null;
  plannedReleaseOn?: string | null;
  releasedOn?: string | null;
  releasedByEmployeeName?: string | null;
  receivedByName?: string | null;
  identityDocumentNumber?: string | null;
  mileageOut?: number | null;
  fuelOut?: string | null;
  releaseNotes?: string | null;
  clientReceivedDocuments: boolean;
  clientReceivedInvoiceInfo: boolean;
  vehicleWashed: boolean;
  finalControlCompleted: boolean;
  clientSignaturePlaceholder?: string | null;
  checklist: ProtocolChecklistItem[];
}

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat('pl-PL').format(new Date(value)) : 'Brak daty';
}

function yesNo(value: boolean) {
  return value ? 'Tak' : 'Nie';
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || 'Brak danych'}</dd>
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await httpGet(`work/${id}/vehicle-release/protocol`);
  const protocol = await response.json() as VehicleReleaseProtocol;
  const vehicle = [protocol.vehicleProducer, protocol.vehicleModel, protocol.vehicleRegNr ? `(${protocol.vehicleRegNr})` : null].filter(Boolean).join(' ');

  return (
    <main className="mx-auto max-w-4xl bg-white px-6 py-8 text-gray-900 print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
        <Link href={`/home/work/${protocol.workId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Wróć do zlecenia</Link>
        <p className="text-sm text-gray-500">Użyj opcji drukowania w przeglądarce, aby wydrukować protokół.</p>
      </div>

      <header className="border-b border-gray-300 pb-5">
        <h1 className="text-2xl font-bold">Protokół zdawczo-odbiorczy pojazdu</h1>
        <p className="mt-2 text-sm text-gray-600">Zlecenie nr {protocol.workNr} · Szkoda: {protocol.claimNumber || 'Brak numeru szkody'}</p>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-base font-semibold">Dane klienta</h2>
          <dl className="space-y-3">
            <Field label="Klient" value={protocol.clientName}></Field>
            <Field label="Adres" value={protocol.clientAddress}></Field>
            <Field label="Telefon" value={protocol.clientPhone}></Field>
            <Field label="E-mail" value={protocol.clientEmail}></Field>
          </dl>
        </div>
        <div>
          <h2 className="mb-3 text-base font-semibold">Dane pojazdu</h2>
          <dl className="space-y-3">
            <Field label="Pojazd" value={vehicle}></Field>
            <Field label="VIN" value={protocol.vehicleVin}></Field>
            <Field label="Numer rejestracyjny" value={protocol.vehicleRegNr}></Field>
          </dl>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold">Wydanie pojazdu</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Data planowana" value={formatDate(protocol.plannedReleaseOn)}></Field>
          <Field label="Data wydania" value={formatDate(protocol.releasedOn)}></Field>
          <Field label="Osoba wydająca" value={protocol.releasedByEmployeeName}></Field>
          <Field label="Osoba odbierająca" value={protocol.receivedByName}></Field>
          <Field label="Dokument tożsamości" value={protocol.identityDocumentNumber}></Field>
          <Field label="Przebieg" value={protocol.mileageOut ? `${protocol.mileageOut} km` : null}></Field>
          <Field label="Stan paliwa" value={protocol.fuelOut}></Field>
          <Field label="Dokumenty odebrane" value={yesNo(protocol.clientReceivedDocuments)}></Field>
          <Field label="Faktura / dopłata przekazana" value={yesNo(protocol.clientReceivedInvoiceInfo)}></Field>
          <Field label="Pojazd umyty" value={yesNo(protocol.vehicleWashed)}></Field>
          <Field label="Kontrola końcowa" value={yesNo(protocol.finalControlCompleted)}></Field>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold">Checklista końcowa</h2>
        {protocol.checklist.length === 0 ? (
          <p className="text-sm text-gray-600">Brak pozycji checklisty końcowej.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 pr-3 font-semibold">Pozycja</th>
                <th className="py-2 pr-3 font-semibold">Wykonane</th>
                <th className="py-2 font-semibold">Uwagi</th>
              </tr>
            </thead>
            <tbody>
              {protocol.checklist.map(item => (
                <tr key={item.itemName} className="border-b border-gray-200">
                  <td className="py-2 pr-3">{item.itemName}</td>
                  <td className="py-2 pr-3">{yesNo(item.isCompleted)}</td>
                  <td className="py-2">{item.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold">Uwagi</h2>
        <p className="min-h-20 whitespace-pre-line rounded-md border border-gray-200 p-3 text-sm text-gray-700">{protocol.releaseNotes || 'Brak uwag.'}</p>
        <p className="mt-3 text-sm text-gray-600">{protocol.clientSignaturePlaceholder || 'Podpis klienta zbierany poza systemem.'}</p>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="border-t border-gray-500 pt-2 text-center text-sm">Podpis klienta</div>
        <div className="border-t border-gray-500 pt-2 text-center text-sm">Podpis pracownika</div>
      </section>
    </main>
  );
}
