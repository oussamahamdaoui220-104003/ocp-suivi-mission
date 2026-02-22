import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

 const [newCar, setNewCar] = useState({ carId: '', status: 'available', kmDepart: 0, vehicleType: 'véhicule' });

  const [editingCarId, setEditingCarId] = useState(null);
 const [editedCar, setEditedCar] = useState({ carId: '', status: 'available', vehicleType: 'véhicule' });

const [missionSort, setMissionSort] = useState('none');
const [kmSort, setKmSort] = useState('none');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const res = await axios.get('http://localhost:3000/api/cars');
    setCars(res.data);
  };
const addCar = async () => {
  try {
    if (!newCar.carId.trim()) {
      alert('Car ID is required');
      return;
    }

   const payload = {
  carId: newCar.carId,
  status: newCar.status || 'available',
  kmDepart: Number(newCar.kmDepart) || 0,
  vehicleType: newCar.vehicleType || 'véhicule'
};

    const res = await axios.post('http://localhost:3000/api/cars', payload);
    if (res.status === 201 || res.data._id) {
setNewCar({ carId: '', status: 'available', kmDepart: 0, vehicleType: 'véhicule' });

      fetchCars();
    } else {
      alert('Failed to add car. Please try again.');
    }
  } catch (err) {
    console.error('❌ Add Car Error:', err.response?.data || err.message);
    alert(err.response?.data?.error || 'Something went wrong while adding the car.');
  }
};


const deleteCar = async (id) => {
  try {
   if (window.confirm('❗ Are you sure you want to delete this car?')) {
  await axios.delete(`http://localhost:3000/api/cars/${id}`);
}

    fetchCars();
  } catch (err) {
    console.error('❌ Delete Car Error:', err.response?.data || err.message);
    alert('Failed to delete car.');
  }
};

const saveEdit = async () => {
  try {
    await axios.patch(`http://localhost:3000/api/cars/${editingCarId}`, editedCar);
    setEditingCarId(null);
    fetchCars();
  } catch (err) {
    console.error('❌ Edit Car Error:', err.response?.data || err.message);
    alert('Failed to save car edits.');
  }
};


const toggleAvailability = async (car) => {
  try {
    const newStatus = car.status === 'unavailable' ? 'available' : 'unavailable';
    const action = newStatus === 'available' ? 'make this car available again' : 'mark this car as unavailable (e.g. for maintenance)';
    if (window.confirm(`⚠️ Are you sure you want to ${action}?`)) {
      await axios.patch(`http://localhost:3000/api/cars/${car._id}`, { status: newStatus });
      fetchCars();
    }
  } catch (err) {
    console.error('❌ Toggle Availability Error:', err.response?.data || err.message);
    alert('Failed to update availability.');
  }
};

const startEdit = (car) => {
  setEditingCarId(car._id);
  setEditedCar({
    carId: car.carId,
    status: car.status,
    kmDepart: car.kmDepart || 0,
    vehicleType: car.vehicleType || 'véhicule'  // ✅ add this
  });
};

  const cancelEdit = () => {
    setEditingCarId(null);
  };

  const filtered = cars
  .filter(car => {
    return (
      car.carId.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === 'all' || car.status === statusFilter)
    );
  })
  .sort((a, b) => {
  let result = 0;

  if (missionSort !== 'none') {
    const aM = Number(a.missionsCompleted || 0);
    const bM = Number(b.missionsCompleted || 0);
    result = missionSort === 'more' ? bM - aM : aM - bM;
  }

  if (result === 0 && kmSort !== 'none') {
    const aK = Number(a.totalKm || 0);
    const bK = Number(b.totalKm || 0);
    result = kmSort === 'more' ? bK - aK : aK - bK;
  }

  return result;
});



  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold">🚗 Car Management</h2>

      {/* 🔍 Search & Filter */}
     <div className="flex flex-wrap gap-4">
  {/* 🔍 Search */}
  <input
    type="text"
    placeholder="Search by Car ID"
    className="border px-3 py-1 rounded"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  {/* 🚦 Status Filter */}
  <select
    className="border px-3 py-1 rounded"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">All Statuses</option>
    <option value="available">Available</option>
    <option value="on_mission">On Mission</option>
    <option value="unavailable">Unavailable</option>
  </select>
<button
  className="bg-gray-300 text-black px-3 py-1 rounded"
  onClick={() => {
    setSearch('');
    setStatusFilter('all');
    setMissionSort('none');
    setKmSort('none');
  }}
>
  ↩️ Reset Filters
</button>

  {/* 🧭 Mission Count Filter */}
  <select
    className="border px-3 py-1 rounded"
    value={missionSort}
    onChange={(e) => setMissionSort(e.target.value)}
  >
    <option value="none">Sort by Missions</option>
    <option value="more">More Missions</option>
    <option value="less">Fewer Missions</option>
  </select>

  {/* 📏 KM Filter */}
  <select
    className="border px-3 py-1 rounded"
    value={kmSort}
    onChange={(e) => setKmSort(e.target.value)}
  >
    <option value="none">Sort by KM</option>
    <option value="more">More KM</option>
    <option value="less">Less KM</option>
  </select>
</div>


      {/* 📋 Car Table */}
      <table className="w-full border mt-4 text-sm">
<thead>
  <tr className="bg-gray-200">
    <th className="border p-2">Car ID</th>
    <th className="border p-2">Status</th>
    <th className="border p-2">Vehicle Type</th>
    <th className="border p-2">KM Depart</th>
    <th className="border p-2">KM Total</th> {/* ✅ NEW */}
    <th className="border p-2">Missions</th>
    <th className="border p-2 text-center">Actions</th>
  </tr>
</thead>


        <tbody>
          {filtered.map(car => (
            <tr key={car._id} className="bg-white">
              <td className="border p-2">
                {editingCarId === car._id ? (
                  <input
                    value={editedCar.carId}
                    onChange={(e) => setEditedCar({ ...editedCar, carId: e.target.value })}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  car.carId
                )}
              </td>
              <td className="border p-2">
                <span
                
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    car.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : car.status === 'unavailable'
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {car.status}
                </span>
              </td><td className="border p-2">
  {editingCarId === car._id ? (
    <select
      className="border px-2 py-1 rounded w-full"
      value={editedCar.vehicleType}
      onChange={(e) =>
        setEditedCar({ ...editedCar, vehicleType: e.target.value })
      }
    >
      <option value="véhicule">Véhicule</option>
      <option value="camion">Camion</option>
      <option value="ambulance">Ambulance</option>
    </select>
  ) : (
    car.vehicleType ?? '—'
  )}
</td>

              <td className="border p-2">
  {editingCarId === car._id ? (
    <input
      type="number"
      className="border px-2 py-1 rounded w-full"
      value={editedCar.kmDepart}
      onChange={(e) => setEditedCar({ ...editedCar, kmDepart: Number(e.target.value) })}
    />
  ) : (
    car.kmDepart ?? '—'
  )}
</td>
<td className="border p-2">{car.totalKm ?? 0}</td>
<td className="border p-2">{car.missionsCompleted ?? 0}</td>


              <td className="border p-2 text-center space-x-2">
                {editingCarId === car._id ? (
                  <>
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                      onClick={saveEdit}
                    >
                      ✅ Save
                    </button>
                    <button
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                      onClick={cancelEdit}
                    >
                      ❌ Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-indigo-600 text-white px-2 py-1 rounded text-xs"
                      onClick={() => startEdit(car)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      onClick={() => deleteCar(car._id)}
                    >
                      🗑️ Delete
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                      onClick={() => toggleAvailability(car)}
                    >
                      {car.status === 'unavailable' ? '✅ Mark Available' : '⚙️ Mark Unavailable'}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ➕ Add Car */}
    {/* ➕ Add Car */}
<div className="flex items-center gap-2 mt-4">
  <input
    type="text"
    placeholder="New Car ID"
    className="border px-3 py-1 rounded"
    value={newCar.carId}
    onChange={(e) => setNewCar({ ...newCar, carId: e.target.value })}
  />
  <input
    type="number"
    placeholder="KM Depart"
    className="border px-3 py-1 rounded"
    value={newCar.kmDepart}
    onChange={(e) => setNewCar({ ...newCar, kmDepart: Number(e.target.value) })}
  />
  <select
  className="border px-3 py-1 rounded"
  value={newCar.vehicleType}
  onChange={(e) => setNewCar({ ...newCar, vehicleType: e.target.value })}
>
  <option value="véhicule">Véhicule</option>
  <option value="camion">Camion</option>
  <option value="ambulance">Ambulance</option>
</select>

  <button
    className="bg-blue-600 text-white px-3 py-1 rounded"
    onClick={addCar}
  >
    ➕ Add Car
  </button>
</div>

    </div>
  );
};

export default CarList;
