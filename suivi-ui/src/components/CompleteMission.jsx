import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CompleteMission = () => {
  const [missions, setMissions] = useState([]);
  const [kmValues, setKmValues] = useState({});
  const [driverFilter, setDriverFilter] = useState('');
  const [drivers, setDrivers] = useState([]);

  // Load all ongoing missions
  useEffect(() => {
    const fetchMissions = async () => {
      const res = await axios.get('http://localhost:3000/api/missions');
      const ongoing = res.data
        .filter(m => m.status === 'ongoing')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setMissions(ongoing);

      const driverList = [...new Set(ongoing.map(m => m.driverName))];
      setDrivers(driverList);

      // Initialize kmRetour inputs
      const kmMap = {};
      ongoing.forEach(m => {
        kmMap[m._id] = '';
      });
      setKmValues(kmMap);
    };

    fetchMissions();
  }, []);

  const handleKmChange = (id, value) => {
    setKmValues(prev => ({ ...prev, [id]: value }));
  };

  const handleComplete = async (mission) => {
    const kmRetour = parseInt(kmValues[mission._id]);
    const kmDepart = mission.kmDepart;

    if (isNaN(kmRetour) || kmRetour <= kmDepart) {
      alert(`❌ Km Retour must be greater than Km Départ (${kmDepart})`);
      return;
    }

    try {
      await axios.patch(`http://localhost:3000/api/missions/${mission._id}/complete`, {
        kmRetour
      });
      alert('✅ Mission completed!');
      
      // Refresh after completion
      setMissions(prev => prev.filter(m => m._id !== mission._id));
    } catch (err) {
      console.error(err);
      alert('❌ Failed to complete mission');
    }
  };

  const filteredMissions = driverFilter
    ? missions.filter(m => m.driverName === driverFilter)
    : missions;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold mb-2">✅ Complete Missions</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">🔍 Filter by Driver:</label>
        <select
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="">All Drivers</option>
          {drivers.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {filteredMissions.length === 0 ? (
        <p className="text-gray-500 italic">No ongoing missions to complete.</p>
      ) : (
        <table className="w-full border text-sm">
     <thead className="bg-gray-100">
  <tr>
    <th className="border p-2">Order</th>
    <th className="border p-2">Car</th>
    <th className="border p-2">Type</th> {/* ✅ New */}
    <th className="border p-2">Driver</th>
    <th className="border p-2">SA</th> {/* ✅ New */}
    <th className="border p-2">Zone</th> {/* ✅ New */}
    <th className="border p-2">Mission</th> {/* ✅ New */}
    <th className="border p-2">Lieu</th> {/* ✅ New */}
    <th className="border p-2">Km Depart</th>
    <th className="border p-2">Km Retour</th>
    <th className="border p-2 text-center">Actions</th>
  </tr>
</thead>

          <tbody>
            {filteredMissions.map(m => (
<tr key={m._id}>
  <td className="border p-2">{m.orderNumber}</td>
  <td className="border p-2">{m.carId}</td>
  <td className="border p-2">{m.vehicleType || '—'}</td> {/* ✅ New */}
  <td className="border p-2">{m.driverName}</td>
  <td className="border p-2">{m.sa || '—'}</td> {/* ✅ New */}
  <td className="border p-2">{m.missionZone}</td> {/* ✅ New */}
  <td className="border p-2">{m.missionType?.join(', ')}</td> {/* ✅ New */}
  <td className="border p-2">{m.lieu || '—'}</td> {/* ✅ New */}
  <td className="border p-2">{m.kmDepart}</td>
  <td className="border p-2">
    <input
      type="number"
      value={kmValues[m._id] || ''}
      onChange={(e) => handleKmChange(m._id, e.target.value)}
      className="border px-2 py-1 rounded w-full"
    />
  </td>
  <td className="border p-2 text-center">
    <button
      onClick={() => handleComplete(m)}
      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
    >
      Complete
    </button>
  </td>
</tr>

            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CompleteMission;
