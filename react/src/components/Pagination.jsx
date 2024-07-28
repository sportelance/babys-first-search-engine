import react from "react"
import "./Pagination.css"
const Pagination = ({currentPage, totalPages, setCurrentPage}) => {
    const handlePageChange = (page) => {
        setCurrentPage(page);
    }
    return (
        <div className="pagination">
            {Array.from({length: totalPages}, (_, i) => i + 1).map((page) => (
                <a
                    key={page}
                    className={`${page === currentPage ? "active" : ""} page-link`}
                    onClick={() => handlePageChange(page)}>
                    {page}
                </a>
            ))}
        </div>
    )
}

export default Pagination