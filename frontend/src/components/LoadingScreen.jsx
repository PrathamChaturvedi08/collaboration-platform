function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>

        <p className="text-slate-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
