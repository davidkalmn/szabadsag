export default function PageContainer({ children, className = '' }) {
    return (
        <div className={`mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-6 py-6 ${className}`}>
            {children}
        </div>
    );
}
