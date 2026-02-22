import React, { useState } from 'react';
import axios from 'axios';

const AddCar = () => {
  const [car, setCar] = useState({
    carId: '',
    status: 'available',
    vehicleType: 'véhicule', // ✅ default value
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/cars', car);
      alert('✅ Car added!');
      setCar({ carId: '', status: 'available', vehicleType: 'véhicule' });
    } catch (err) {
      console.error('❌ Add Car Error:', err.response?.data || err.message);
      alert('❌ Failed to add car');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 mb-6">
      <h3 className="text-lg font-semibold">➕ Add New Car</h3>

      <input
        className="input"
        placeholder="Car ID"
        value={car.carId}
        onChange={(e) => setCar({ ...car, carId: e.target.value })}
      />

      <select
        className="input"
        value={car.vehicleType}
        onChange={(e) => setCar({ ...car, vehicleType: e.target.value })}
      >
        <option value="véhicule">Véhicule</option>
        <option value="camion">Camion</option>
        <option value="ambulance">Ambulance</option>
      </select>

      <select
        className="input"
        value={car.status}
        onChange={(e) => setCar({ ...car, status: e.target.value })}
      >
        <option value="available">Available</option>
        <option value="on_mission">On Mission</option>
        <option value="unavailable">Unavailable</option>
      </select>

      <button className="px-3 py-1 bg-blue-600 text-white rounded">Save Car</button>
    </form>
  );
};

export default AddCar;
