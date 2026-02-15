import type { Order } from '../types';

interface OrderTableProps {
  orders: Order[];
  totalAmount: number;
}

export function OrderTable({ orders, totalAmount }: OrderTableProps) {
  return (
    <table className="order-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Osoba</th>
          <th>Danie</th>
          <th>Cena</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order, index) => (
          <tr key={order.id}>
            <td>{index + 1}</td>
            <td><strong>{order.personName}</strong></td>
            <td>{order.dishName}</td>
            <td><strong>{order.dishPrice.toFixed(2)} zł</strong></td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} style={{ textAlign: 'right' }}>RAZEM:</td>
          <td><strong>{totalAmount.toFixed(2)} zł</strong></td>
        </tr>
      </tfoot>
    </table>
  );
}
