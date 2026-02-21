import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../components/App.jsx";

// initial transactions returned by GET
const initialTransactions = [
  {
    id: 1,
    date: "2026-02-20",
    description: "Coffee",
    category: "Food",
    amount: 3.5,
  },
];

describe("AddTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds a new transaction in frontend after submit and calls POST", async () => {
    // mock fetch for GET and POST
    let fetchCount = 0;
    global.fetch = vi.fn(async (url, options) => {
      fetchCount++;
      if (!options || options.method !== "POST") {
        // GET request
        return {
          ok: true,
          json: async () => initialTransactions,
        };
      } else {
        // POST request
        return {
          ok: true,
          json: async () => ({
            id: 2,
            date: "2026-02-21",
            description: "Lunch",
            category: "Food",
            amount: "10",
          }),
        };
      }
    });

    render(<App />);

    // Wait for initial transaction to be displayed
    expect(await screen.findByText("Coffee")).toBeInTheDocument();

    // Fill out the form - all fields including date
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (dateInputs.length > 0) {
      fireEvent.change(dateInputs[0], { target: { value: "2026-02-21" } });
    }
    
    fireEvent.change(screen.getByPlaceholderText(/Description/i), {
      target: { value: "Lunch" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Category/i), {
      target: { value: "Food" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: "10" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Add Transaction/i }));

    // Wait for the new transaction to be displayed
    await waitFor(() => {
      expect(screen.getByText("Lunch")).toBeInTheDocument();
    });

    // Verify POST was called
    expect(global.fetch).toHaveBeenCalledTimes(2);
    // Check that the second call (POST) had the correct method
    const postCall = global.fetch.mock.calls.find(
      (call) => call[1] && call[1].method === "POST"
    );
    expect(postCall).toBeDefined();
  });

  it("new transaction appears in the transaction list", async () => {
    let fetchCount = 0;
    global.fetch = vi.fn(async (url, options) => {
      fetchCount++;
      if (!options || options.method !== "POST") {
        return {
          ok: true,
          json: async () => initialTransactions,
        };
      } else {
        return {
          ok: true,
          json: async () => ({
            id: 2,
            date: "2026-02-21",
            description: "Dinner",
            category: "Food",
            amount: "15",
          }),
        };
      }
    });

    render(<App />);

    // Wait for initial transaction
    await screen.findByText("Coffee");

    // Add new transaction - fill all fields including date
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (dateInputs.length > 0) {
      fireEvent.change(dateInputs[0], { target: { value: "2026-02-21" } });
    }
    
    fireEvent.change(screen.getByPlaceholderText(/Description/i), {
      target: { value: "Dinner" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Category/i), {
      target: { value: "Food" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: "15" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Transaction/i }));

    // Verify both transactions are now visible
    expect(await screen.findByText("Dinner")).toBeInTheDocument();
    expect(screen.getByText("Coffee")).toBeInTheDocument();
  });

  it("verifies POST request is called with correct data", async () => {
    global.fetch = vi.fn(async (url, options) => {
      if (!options || options.method !== "POST") {
        return {
          ok: true,
          json: async () => initialTransactions,
        };
      } else {
        const body = JSON.parse(options.body);
        return {
          ok: true,
          json: async () => ({ id: 2, ...body }),
        };
      }
    });

    render(<App />);

    await screen.findByText("Coffee");

    fireEvent.change(screen.getByPlaceholderText(/Description/i), {
      target: { value: "Test Transaction" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Category/i), {
      target: { value: "Misc" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: "25" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Transaction/i }));

    await waitFor(() => {
      expect(screen.getByText("Test Transaction")).toBeInTheDocument();
    });

    // Verify the POST call was made
    const fetchCalls = global.fetch.mock.calls;
    const postCall = fetchCalls.find(
      (call) => call[1] && call[1].method === "POST"
    );
    expect(postCall).toBeDefined();

    // Verify the POST URL
    expect(postCall[0]).toBe("http://localhost:6001/transactions");

    // Verify the POST body contains the transaction data
    const body = JSON.parse(postCall[1].body);
    expect(body.description).toBe("Test Transaction");
    expect(body.category).toBe("Misc");
    expect(body.amount).toBe("25");
  });
});
