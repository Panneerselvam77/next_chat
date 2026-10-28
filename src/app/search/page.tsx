import PostSearch from "@/features/post/components/PostSearch";

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Search Posts</h1>
      <PostSearch />
    </main>
  );
}
