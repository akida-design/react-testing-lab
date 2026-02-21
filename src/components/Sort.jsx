function Sort({onSort}){
    return(
        <select onChange={(e)=>{
            onSort(e.target.value)
        }}>
            <option value={"description"}>Description</option>
            <option value={"category"}>Category</option>
            <option value={"amount-asc"}>Amount (Low to High)</option>
            <option value={"amount-desc"}>Amount (High to Low)</option>
        </select>
    )
}
export default Sort