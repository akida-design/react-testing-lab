import React from "react";

function Transaction({transaction}) {
  return (
    <tr data-testid="transaction-item">
      <td>{transaction.date}</td>
      <td>{transaction.description}</td>
      <td>{transaction.category}</td>
      <td>{transaction.amount}</td>
    </tr>
  );
}

export default Transaction;
