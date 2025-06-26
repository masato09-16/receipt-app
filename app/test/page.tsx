// app/test/page.tsx

export default function TestPage() {
  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-xl font-bold mb-4">Tailwind テスト</h1>
      <div className="space-y-6">
        <div className="bg-white p-4 shadow rounded">レシート1</div>
        <div className="bg-white p-4 shadow rounded">レシート2</div>
        <div className="bg-white p-4 shadow rounded">レシート3</div>
      </div>
    </div>
  );
}
