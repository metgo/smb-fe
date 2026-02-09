const TestLabPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - fixed at top with 100px height */}
      <nav className="fixed top-0 left-0 right-0 h-[100px] bg-white border-b border-gray-200 z-50 flex items-center justify-center">
        Fixed Navbar
      </nav>

      <main className="flex pt-[100px] min-h-screen">
        {/* Sidebar - fixed position with scrollable content */}
        <aside className="fixed left-0 top-[100px] h-[calc(100vh-100px)] w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            Sidebar
            {/* Add more content here to see the scrollbar */}
            <div className="mt-4 space-y-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="p-2 bg-white rounded shadow-sm">
                  Item {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Fixed footer at bottom of sidebar */}
          <footer className="p-4 bg-gray-800 text-white border-t border-gray-700">
            Fixed footer at bottom
          </footer>
        </aside>

        {/* Main content area */}
        <div className="flex-1 ml-64 p-6">
          {/* Sticky section - 400px height */}
          <section className="sticky top-[100px] h-[400px] bg-blue-100 border border-blue-300 rounded-lg mb-6 p-4 z-40 flex items-center justify-center">
            Sticky Content
          </section>

          {/* Scrollable content - dynamic height */}
          <section className="min-h-[calc(100vh-100px-400px-3rem)] bg-white border border-gray-300 rounded-lg p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Scrollable content</h2>
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg border">
                  Content item {i + 1} - This area will scroll independently
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TestLabPage;
