return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg border">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
        Set New Password
      </h2>

      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          placeholder="Confirm Email"
          required
          className="w-full px-3 py-2 rounded bg-gray-200 border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setData({ ...data, email: e.target.value })}
        />

        <input
          type="text"
          placeholder="Reset Code from Email"
          value={data.resetId}
          required
          className="w-full px-3 py-2 rounded bg-gray-200 border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setData({ ...data, resetId: e.target.value })}
        />

        <input
          type="password"
          placeholder="New Password (8+ chars)"
          required
          className="w-full px-3 py-2 rounded bg-gray-200 border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setData({ ...data, new_password: e.target.value })}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
        >
          Update Password
        </button>
      </form>

      {msg && (
        <p className="mt-4 text-center text-sm text-blue-600">
          {msg}
        </p>
      )}
    </div>
  </div>
);
