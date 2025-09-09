function TestComponent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 React fonctionne !
        </h1>
        <p className="text-gray-600 mb-4">
          L'application se charge correctement
        </p>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">
            Si vous voyez ce message, React et Vite fonctionnent.
            <br />
            Configurez maintenant vos variables Supabase dans le fichier .env
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestComponent;
