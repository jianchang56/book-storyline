import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookCollectionPage } from "@/components/book-collection-page";
import { catalog } from "@/lib/catalog";
import { collectionPath, getBookCollections } from "@/lib/collections";

type CollectionPageProps = {
  params: Promise<{ collection: string }>;
};

const collections = getBookCollections(catalog);

export function generateStaticParams() {
  return collections.map((collection) => ({ collection: collection.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const slug = (await params).collection;
  const collection = collections.find((item) => item.slug === slug);
  if (!collection) {
    return {};
  }
  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: collectionPath(collection.slug) },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const slug = (await params).collection;
  const collection = collections.find((item) => item.slug === slug);
  if (!collection) {
    notFound();
  }

  return (
    <BookCollectionPage
      eyebrow={collection.eyebrow}
      title={collection.title}
      description={collection.description}
      backHref="/collections"
      backLabel="返回专题"
      books={collection.books}
    />
  );
}
