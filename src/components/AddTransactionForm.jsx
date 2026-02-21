import React from "react";

function AddTransactionForm({postTransaction}) {
  function submitForm(e){
    e.preventDefault()
    
    // Get all form inputs safely
    const formElements = e.target.elements;
    const dateInput = formElements.namedItem('date');
    const descriptionInput = formElements.namedItem('description');
    const categoryInput = formElements.namedItem('category');
    const amountInput = formElements.namedItem('amount');
    
    const newTransaction = {
      date: (dateInput && dateInput.value) || new Date().toISOString().split('T')[0],
      description: (descriptionInput && descriptionInput.value) || "",
      category: (categoryInput && categoryInput.value) || "",
      amount: (amountInput && amountInput.value) || ""
    }
    postTransaction(newTransaction)
    // Reset form
    e.target.reset()
  }

  return (
    <div className="ui segment">
      <form className="ui form" onSubmit={(e)=>{submitForm(e)}}>
        <div className="inline fields">
          <input type="date" name="date" />
          <input type="text" name="description" placeholder="Description" />
          <input type="text" name="category" placeholder="Category" />
          <input type="number" name="amount" placeholder="Amount" step="0.01" />
        </div>
        <button className="ui button" type="submit">
          Add Transaction
        </button>
      </form>
    </div>
  );
}

export default AddTransactionForm;
