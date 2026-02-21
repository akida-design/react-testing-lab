import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../components/App.jsx";

const transactions = [
  {
    id: 1,
    date: "2026-02-20",
    description: "Apple",
    category: "Fruit",
    amount: 5,
  },
  {
    id: 2,
    date: "2026-02-21",
    description: "Banana",
    category: "Fruit",
    amount: 3,
  },
  {
    id: 3,
    date: "2026-02-22",
    description: "Onion",
    category: "Vegetable",
    amount: 2,
  },
];

describe("Search and Sort Transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(transactions),
      })
    );
  });

  it("filters transactions based on search input", async () => {
    render(<App />);

    // Wait for transactions to be displayed
    expect(await screen.findByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Onion")).toBeInTheDocument();

    // Type "Ban" in search to filter for Banana
    fireEvent.change(screen.getByPlaceholderText(/Search/i), {
      target: { value: "Ban" },
    });

    // Only Banana should be visible now
    await waitFor(() => {
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
      expect(screen.queryByText("Onion")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("clears search filter when input is cleared", async () => {
    render(<App />);

    await screen.findByText("Apple");

    // Search for Banana
    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: "Ban" } });

    await waitFor(() => {
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
    });

    // Clear the search
    fireEvent.change(searchInput, { target: { value: "" } });

    // All transactions should be visible again
    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Banana")).toBeInTheDocument();
      expect(screen.getByText("Onion")).toBeInTheDocument();
    });
  });

  it("search is case insensitive", async () => {
    render(<App />);

    await screen.findByText("Apple");

    // Search with lowercase
    fireEvent.change(screen.getByPlaceholderText(/Search/i), {
      target: { value: "apple" },
    });

    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.queryByText("Banana")).not.toBeInTheDocument();
    });
  });

  it("sorts transactions by description", async () => {
    render(<App />);

    await screen.findByText("Apple");

    // Get sort dropdown
    const sortSelect = screen.getByDisplayValue(/Description/i);

    // Keep Description sorting (default)
    fireEvent.change(sortSelect, { target: { value: "description" } });

    // Get all transaction items
    const items = screen.getAllByTestId("transaction-item");

    // Verify alphabetical order: Apple, Banana, Onion
    expect(items[0]).toHaveTextContent("Apple");
    expect(items[1]).toHaveTextContent("Banana");
    expect(items[2]).toHaveTextContent("Onion");
  });

  it("sorts transactions by amount ascending", async () => {
    render(<App />);

    await screen.findByText("Apple");

    // Sort by amount ascending
    const sortSelect = screen.getByDisplayValue(/Description/i);
    fireEvent.change(sortSelect, { target: { value: "amount-asc" } });

    await waitFor(() => {
      const items = screen.getAllByTestId("transaction-item");
      // Order should be: Onion (2), Banana (3), Apple (5)
      expect(items[0]).toHaveTextContent("Onion");
      expect(items[0]).toHaveTextContent("2");
      expect(items[1]).toHaveTextContent("Banana");
      expect(items[1]).toHaveTextContent("3");
      expect(items[2]).toHaveTextContent("Apple");
      expect(items[2]).toHaveTextContent("5");
    });
  });

  it("sorts transactions by amount descending", async () => {
    render(<App />);

    await screen.findByText("Apple");

    // Sort by amount descending
    const sortSelect = screen.getByDisplayValue(/Description/i);
    fireEvent.change(sortSelect, { target: { value: "amount-desc" } });

    await waitFor(() => {
      const items = screen.getAllByTestId("transaction-item");
      // Order should be: Apple (5), Banana (3), Onion (2)
      expect(items[0]).toHaveTextContent("Apple");
      expect(items[0]).toHaveTextContent("5");
      expect(items[1]).toHaveTextContent("Banana");
      expect(items[1]).toHaveTextContent("3");
      expect(items[2]).toHaveTextContent("Onion");
      expect(items[2]).toHaveTextContent("2");
    });
  });

  it("sorts transactions by category", async () => {
    render(<App />);

    await screen.findByText("Apple");

    // Sort by category
    const sortSelect = screen.getByDisplayValue(/Description/i);
    fireEvent.change(sortSelect, { target: { value: "category" } });

    await waitFor(() => {
      const items = screen.getAllByTestId("transaction-item");
      // Fruit items should come before Vegetable items alphabetically
      const textContent = items.map((item) => item.textContent);
      const fruitIndex = textContent.findIndex(
        (text) => text.includes("Fruit") || text.includes("Apple")
      );
      const vegIndex = textContent.findIndex(
        (text) => text.includes("Vegetable") || text.includes("Onion")
      );
      expect(fruitIndex).toBeLessThan(vegIndex);
    });
  });

  it("filters and sorts work together", async () => {
    render(<App />);

    await screen.findByText("Apple");

    // Search for items in Fruit category
    fireEvent.change(screen.getByPlaceholderText(/Search/i), {
      target: { value: "a" },
    });

    // Both Apple and Banana have 'a' in their name
    const sortSelect = screen.getByDisplayValue(/Description/i);
    fireEvent.change(sortSelect, { target: { value: "amount-asc" } });

    await waitFor(() => {
      const items = screen.getAllByTestId("transaction-item");
      // Should have Apple and Banana, sorted by amount: Banana (3), Apple (5)
      expect(items.length).toBe(2);
      expect(items[0]).toHaveTextContent("Banana");
      expect(items[1]).toHaveTextContent("Apple");
    });
  });

  it("page updates when search input changes", async () => {
    render(<App />);

    await screen.findByText("Apple");

    const searchInput = screen.getByPlaceholderText(/Search/i);

    // Initial state - all items visible
    let items = screen.getAllByTestId("transaction-item");
    expect(items).toHaveLength(3);

    // Search for "Apple"
    fireEvent.change(searchInput, { target: { value: "Apple" } });

    await waitFor(() => {
      items = screen.getAllByTestId("transaction-item");
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent("Apple");
    });

    // Search for "Banana"
    fireEvent.change(searchInput, { target: { value: "Banana" } });

    await waitFor(() => {
      items = screen.getAllByTestId("transaction-item");
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent("Banana");
    });
  });

  it("page updates when sort selection changes", async () => {
    render(<App />);

    await screen.findByText("Apple");

    const sortSelect = screen.getByDisplayValue(/Description/i);

    // Initial sort by description: Apple, Banana, Onion
    let items = screen.getAllByTestId("transaction-item");
    expect(items[0]).toHaveTextContent("Apple");

    // Sort by amount ascending: Onion (2), Banana (3), Apple (5)
    fireEvent.change(sortSelect, { target: { value: "amount-asc" } });

    await waitFor(() => {
      items = screen.getAllByTestId("transaction-item");
      expect(items[0]).toHaveTextContent("Onion");
    });

    // Sort by amount descending: Apple (5), Banana (3), Onion (2)
    fireEvent.change(sortSelect, { target: { value: "amount-desc" } });

    await waitFor(() => {
      items = screen.getAllByTestId("transaction-item");
      expect(items[0]).toHaveTextContent("Apple");
    });
  });
});
