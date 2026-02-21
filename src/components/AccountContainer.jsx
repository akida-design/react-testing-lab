import React, {useState, useEffect} from "react";
import TransactionsList from "./TransactionsList";
import Search from "./Search";
import AddTransactionForm from "./AddTransactionForm";
import Sort from "./Sort";

function AccountContainer() {
  const [transactions,setTransactions] = useState([])
  const [search,setSearch] = useState("")
  const [sortBy, setSortBy] = useState("description")
  // console.log(search)

  useEffect(()=>{
    fetch("http://localhost:6001/transactions")
    .then(r=>r.json())
    .then(data=>setTransactions(data))
  },[])

  function postTransaction(newTransaction){
    fetch('http://localhost:6001/transactions',{
      method: "POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTransaction)
    })
    .then(r=>r.json())
    .then(data=>setTransactions([...transactions,data]))
  }
  
  // Sort function here
  function onSort(sortBy){
    setSortBy(sortBy)
  }

  // Filter using search here and pass new variable down
  let filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(search.toLowerCase())
  )

  // Sort transactions based on sortBy
  if (sortBy === "amount-asc") {
    filteredTransactions = filteredTransactions.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
  } else if (sortBy === "amount-desc") {
    filteredTransactions = filteredTransactions.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
  } else if (sortBy === "category") {
    filteredTransactions = filteredTransactions.sort((a, b) => (a.category || "").localeCompare(b.category || ""))
  } else {
    filteredTransactions = filteredTransactions.sort((a, b) => (a.description || "").localeCompare(b.description || ""))
  }

  return (
    <div>
      <Search setSearch={setSearch}/>
      <AddTransactionForm postTransaction={postTransaction}/>
      <Sort onSort={onSort}/>
      <TransactionsList transactions={filteredTransactions} />
    </div>
  );
}

export default AccountContainer;
