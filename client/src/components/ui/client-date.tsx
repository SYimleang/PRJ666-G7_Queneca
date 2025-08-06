"use client";

import { useEffect, useState } from "react";

interface ClientOnlyDateProps {
  date: string | number | Date;
  formatOptions?: Intl.DateTimeFormatOptions;
}

export default function ClientOnlyDate({
  date,
  formatOptions,
}: ClientOnlyDateProps) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    const d = new Date(date);
    setFormatted(
      d.toLocaleString(
        undefined,
        formatOptions || {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    );
  }, [date, formatOptions]);

  return <span>{formatted}</span>;
}
