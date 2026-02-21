import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import App from "../../components/App.jsx";

// mock fetch
const mockTransactions = [
  {
    id: 1,
    date: "2026-02-20",
    description: "Coffee",
    category: "Food",
    amount: 3.5,
  },
  {
    id: 2,
    date: "2026-02-21",
    description: "Groceries",
    category: "Food",
    amount: 25.0,
  },
  {
    id: 3,
    date: "2026-02-22",
    description: "Gas",
    category: "Transportation",
    amount: 45.0,
  },
];

describe("DisplayTransactions on startup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTransactions),
      })
    );
  });

  it("shows transactions on startup", async () => {
    render(<App />);

    // Wait for transactions to be displayed
    for (const tx of mockTransactions) {
      const el = await screen.findByText(tx.description);
      expect(el).toBeInTheDocument();
    }

    // Verify fetch was called to get transactions
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:6001/transactions"
    );
  });

  it("displays all transaction details", async () => {
    render(<App />);

    // Check that all transaction details are displayed
    expect(await screen.findByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("2026-02-20")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("2026-02-21")).toBeInTheDocument();
    
    // Check amounts are displayed
    const items = screen.getAllByTestId("transaction-item");
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it("renders transaction items with correct test IDs", async () => {
    render(<App />);

    // Wait for transactions to load
    await screen.findByText("Coffee");

    // Check that transaction items are rendered with data-testid
    const transactionItems = screen.getAllByTestId("transaction-item");
    expect(transactionItems).toHaveLength(mockTransactions.length);
  });
});
