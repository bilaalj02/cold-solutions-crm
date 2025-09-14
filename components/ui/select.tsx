import * as React from "react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  defaultValue?: string
  children?: React.ReactNode
}

const Select = ({ children, ...props }: SelectProps) => {
  return <div>{children}</div>
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md ${className}`} {...props}>
    {children}
  </div>
)

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${className}`}
      {...props}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = "SelectItem"

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-muted-foreground">{placeholder || "Select..."}</span>
)

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }