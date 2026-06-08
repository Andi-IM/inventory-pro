'use client';

export function DeleteButton({ 
  className = "btn btn-danger", 
  text = "Delete",
  confirmMessage = "Are you sure you want to delete this tool?"
}: { 
  className?: string, 
  text?: string,
  confirmMessage?: string
}) {
  return (
    <button type="submit" className={className} onClick={(e) => {
      if (!confirm(confirmMessage)) e.preventDefault();
    }}>
      {text}
    </button>
  );
}
