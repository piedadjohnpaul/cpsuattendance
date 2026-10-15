export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-green-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-green-800 focus:bg-green-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 active:bg-green-900 dark:bg-green-200 dark:text-green-950 dark:hover:bg-green-100 dark:focus:bg-green-100 dark:focus:ring-offset-gray-800 dark:active:bg-green-300 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
