import React, { useState } from 'react';
import axios from 'axios';

const AddDriver = () => {
  const [driver, setDriver] = useState({
    name: '',
    permitType: 'B',   // ✅ matches backend schema
    status: 'available'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/drivers', driver);
      alert('✅ Driver added!');
      setDriver({ name: '', permitType: 'B', status: 'available' }); // reset
    } catch (err) {
      console.error('❌ Add Driver Error:', err.response?.data || err.message);
      alert('❌ Failed to add driver');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 p-4 bg-white shadow rounded max-w-md mx-auto">
      <h3 className="text-lg font-semibold">➕ Add New Driver</h3>

      {/* Driver Name */}
      <input
        type="text"
        placeholder="Driver Name"
        className="border px-3 py-2 rounded"
        value={driver.name}
        onChange={(e) => setDriver({ ...driver, name: e.target.value })}
        required
      />

      {/* Permit Type */}
      <select
        className="border px-3 py-2 rounded"
        value={driver.permitType}
        onChange={(e) => setDriver({ ...driver, permitType: e.target.value })}
      >
        <option value="B">B</option>
        <option value="C">C</option>
      </select>

      {/* Status (optional for now) */}
      <select
        className="border px-3 py-2 rounded"
        value={driver.status}
        onChange={(e) => setDriver({ ...driver, status: e.target.value })}
      >
        <option value="available">Available</option>
        <option value="on_mission">On Mission</option>
        <option value="off_duty">Off Duty</option>
      </select>

      {/* Submit */}
      <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
        ➕ Save Driver
      </button>
    </form>
  );
};

export default AddDriver;
