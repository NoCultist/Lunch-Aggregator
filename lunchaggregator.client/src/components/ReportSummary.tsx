interface ReportSummaryProps {
  totalOrders: number;
  totalAmount: number;
}

export function ReportSummary({ totalOrders, totalAmount }: ReportSummaryProps) {
  return (
    <div className="report-summary">
      <div className="summary-card">
        <h3>Liczba zamówień</h3>
        <p>{totalOrders}</p>
      </div>
      <div className="summary-card">
        <h3>Suma do zapłaty</h3>
        <p>{totalAmount.toFixed(2)} zł</p>
      </div>
    </div>
  );
}
