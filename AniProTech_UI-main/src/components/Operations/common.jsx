export function Field({ label, children }) {
    return (
        <label className="block space-y-1 text-sm text-gray-700">
            <span>{label}</span>
            {children}
        </label>
    );
}
export function Page({ title, description, children }) {
    return (
        <main className="mx-auto max-w-7xl space-y-5 p-5 md:p-8">
            <header>
                <h1 className="text-2xl font-semibold text-customNavy">{title}</h1>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </header>
            {children}
        </main>
    );
}
export function ErrorBox({ error }) {
    return error ? (
        <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
            {error}
        </p>
    ) : null;
}

