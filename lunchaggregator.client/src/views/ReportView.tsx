import type { OrderReport } from '../types';
import { EmptyState } from '../components/EmptyState';
import { SessionInfo } from '../components/SessionInfo';
import { ReportSummary } from '../components/ReportSummary';
import { OrderTable } from '../components/OrderTable';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ReportViewProps {
  report: OrderReport | null;
  loading: boolean;
  onClearOrders: () => void;
}

export function ReportView({ report, loading, onClearOrders }: ReportViewProps) {
  return (
    <div className="card">
      <div className="report-header">
        <div>
          <h2>Raport zbiorczy zamówień</h2>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
            🔄 Automatyczne odświeżanie co 10 sekund
          </p>
        </div>
        {report?.session && (
          <button className="btn btn-danger" onClick={onClearOrders} disabled={loading}>
            🗑️ Wyczyść zamówienia
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Ładowanie raportu..." />
      ) : report?.session ? (
        <>
          <SessionInfo session={report.session} />
          <ReportSummary totalOrders={report.totalOrders} totalAmount={report.totalAmount} />

          {report.orders.length > 0 ? (
            <OrderTable orders={report.orders} totalAmount={report.totalAmount} />
          ) : (
            <EmptyState
              icon="📭"
              title="Brak zamówień"
              message="Sesja rozpoczęta, ale nikt jeszcze nie złożył zamówienia."
            />
          )}
        </>
      ) : (
        <EmptyState
          icon="🚫"
          title="Brak aktywnej sesji"
          message='Organizator musi najpierw wybrać restaurację w zakładce "Przeglądaj menu"'
        />
      )}
    </div>
  );
}
