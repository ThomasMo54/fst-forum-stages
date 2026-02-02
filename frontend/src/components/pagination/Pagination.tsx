import "./Pagination.css"
import Button from "../button/Button.tsx";
import {useSearchParams, useNavigate, useLocation} from "react-router-dom";
import { useTransition } from "react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    maxVisible?: number
    preserveParams?: boolean
}

export function Pagination({
                               currentPage,
                               totalPages,
                               maxVisible = 15,
                               preserveParams = true
                           }: PaginationProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const navigateToPage = (page: number, replace = false) => {
        const params = preserveParams
            ? new URLSearchParams(searchParams.toString())
            : new URLSearchParams();

        params.set("page", String(page));
        const search = params.toString();
        const to = location.pathname + (search ? `?${search}` : "");

        startTransition(() => {
            navigate(to, { replace });
        });
    };

    const getPageNumbers = () => {
        const pages: number[] = []

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            const halfVisible = Math.floor(maxVisible / 2)

            if (currentPage <= halfVisible + 1) {
                for (let i = 1; i <= maxVisible - 1; i++) pages.push(i)
                pages.push(-1)
                pages.push(totalPages)
            } else if (currentPage >= totalPages - halfVisible) {
                pages.push(1)
                pages.push(-1)
                for (let i = totalPages - (maxVisible - 2); i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push(-1)
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push(-2)
                pages.push(totalPages)
            }
        }

        return pages
    }

    if (totalPages <= 1) return null

    return (
        <div className="pagination-container">
            <Button
                variant={"icon"}
                className={`pagination-button ${isPending || currentPage === 1 ? 'disabled' : ''}`}
                disabled={currentPage === 1 || isPending}
                onClick={() => navigateToPage(currentPage - 1)}
                aria-label="Previous page"
            >
                <i className="pagination-icon fas fa-arrow-left"/>
            </Button>

            {getPageNumbers().map((page, index) => {
                if (page < 0) {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="pagination-ellipsis"
                        >
                            ...
                        </span>
                    )
                }

                return (
                    <button
                        key={page}
                        className={`pagination-button ${
                            page === currentPage ? 'active' : ''
                        } ${isPending ? 'disabled' : ''}`}
                        onClick={() => navigateToPage(page)}
                        disabled={isPending || page === currentPage}
                        aria-label={`Page ${page}`}
                        aria-current={page === currentPage ? "page" : undefined}
                    >
                        {page}
                    </button>
                )
            })}

            <Button
                variant={"icon"}
                className={`pagination-button ${isPending || currentPage === totalPages ? 'disabled' : ''}`}
                disabled={currentPage === totalPages || isPending}
                onClick={() => navigateToPage(currentPage + 1)}
                aria-label="Next page"
            >
                <i className="pagination-icon fas fa-arrow-right"/>
            </Button>
        </div>
    )
}