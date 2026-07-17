"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getBrowserStorage, type ReaderState, readReaderState } from "@/lib/reader-storage";

export function ResumeReadingLink({
  bookSlug,
  bookTitle,
}: {
  bookSlug: string;
  bookTitle: string;
}) {
  const [readerState, setReaderState] = useState<ReaderState | null>(null);

  useEffect(() => {
    setReaderState(readReaderState(getBrowserStorage(), bookSlug));
  }, [bookSlug]);

  const href = {
    pathname: `/books/${bookSlug}`,
    hash: readerState?.lastSectionId,
  };

  return (
    <Button asChild className="mt-6 w-full" size="lg">
      <Link href={href}>
        {readerState
          ? `继续阅读 · ${Math.round(readerState.progress)}%`
          : `开始阅读《${bookTitle}》`}
        <ArrowRight />
      </Link>
    </Button>
  );
}
