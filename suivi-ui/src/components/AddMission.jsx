import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Car, User, FileText, Download, Calendar, Clock, MapPin } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Plus } from 'lucide-react';

const AddMission = () => {
  const [form, setForm] = useState({
    orderNumber: '',
    carId: '',
    driverName: '',
    kmDepart: '',
    vehicleType: '',
    sa: '',
    missionType: [],
    missionZone: '',
    lieu: '',
  });

  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const fetchAvailable = async () => {
    try {
      const [carRes, driverRes] = await Promise.all([
        axios.get('http://localhost:3000/api/cars'),
        axios.get('http://localhost:3000/api/drivers'),
      ]);
      setCars(carRes.data.filter(c => c.status === 'available'));
      setDrivers(driverRes.data.filter(d => d.status === 'available'));
    } catch (err) {
      console.error('❌ Failed to fetch cars/drivers:', err);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCarChange = async (e) => {
    const selectedCarId = e.target.value;
    setForm(prev => ({ ...prev, carId: selectedCarId }));

    if (selectedCarId) {
      try {
        const res = await axios.get(`http://localhost:3000/api/cars/${selectedCarId}`);
        const car = res.data;
        setForm(prev => ({
          ...prev,
          kmDepart: car.kmDepart || 0,
          vehicleType: car.vehicleType || 'véhicule'
        }));
      } catch (err) {
        console.error('❌ Error fetching car info:', err);
        alert('Failed to fetch car kmDepart');
      }
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      missionType: checked
        ? [...prev.missionType, value]
        : prev.missionType.filter(t => t !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    const payload = {
      ...form,
      kmDepart: parseInt(form.kmDepart),
      dateDepart: now.toISOString().split('T')[0],
      heureDepart: now.toTimeString().slice(0, 5),
    };

    try {
      const res = await axios.post('http://localhost:3000/api/missions', payload);
      const { message, mission, pdf } = res.data;

      alert(message);
if (pdf) {
  // Convert base64 PDF to binary
  const byteCharacters = atob(pdf);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  // Create Blob and trigger download
  const blob = new Blob(byteArrays, { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mission_${mission.orderNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


      setForm({
        orderNumber: '',
        carId: '',
        driverName: '',
        kmDepart: '',
        vehicleType: '',
        sa: '',
        missionType: [],
        missionZone: '',
        lieu: '',
      });

      fetchAvailable();
    } catch (err) {
      console.error('❌ Mission error:', err.response?.data || err.message);
      alert(`❌ Failed to start mission: ${err.response?.data?.error || 'Unknown error'}`);
    }
  };

 return (
<div className="min-h-screen bg-[#f8f9fb] flex px-10 py-10 gap-10">

    {/* Sidebar */}
  {/* Sidebar */}
 




    {/* Main Content Area */}
{/* Main Content Area */}
<div className="flex-1 flex justify-center">
  <div className="bg-white rounded-lg shadow p-6 w-full max-w-5xl">

        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Start New Mission</h2>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">

    {/* 1. Order Number */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Order Number</label>
      <input
        name="orderNumber"
        value={form.orderNumber}
        onChange={handleChange}
        required
        placeholder="Order Number"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    {/* 2. Select Car */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">
        <Car className="inline w-4 h-4 mr-2" />Available Car
      </label>
      <select
        name="carId"
        value={form.carId}
        onChange={handleCarChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a car</option>
        {cars.map(car => (
          <option key={car._id} value={car.carId}>{car.carId}</option>
        ))}
      </select>
    </div>

    {/* 3. KM Depart */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">KM Depart</label>
      <input
        name="kmDepart"
        value={form.kmDepart}
        readOnly
        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 font-medium"
      />
    </div>

    {/* 4. Vehicle Type */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Vehicle Type</label>
      <input
        name="vehicleType"
        value={form.vehicleType}
        readOnly
        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 font-medium"
      />
    </div>
{/* 4.5 SA Input */}
<div>
  <label className="block mb-1 font-medium text-gray-700">
    <button
      type="button"
      className="bg-blue-100 text-blue-700 font-semibold py-1 px-3 rounded-full shadow inline-flex items-center"
    >
      SA
    </button>
  </label>
  <input
    name="sa"
    value={form.sa}
    onChange={handleChange}
    required
    placeholder="Enter SA value"
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  />
</div>

    {/* 5. Select Driver */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">
        <User className="inline w-4 h-4 mr-2" />Available Driver
      </label>
      <select
        name="driverName"
        value={form.driverName}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a driver</option>
        {drivers.map(driver => (
          <option key={driver._id} value={driver.name}>{driver.name}</option>
        ))}
      </select>
    </div>

    {/* 6. Mission Type */}
    <div className="md:col-span-2">
      <label className="block mb-1 font-medium text-gray-700">Mission Type</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['personnel', 'matériel', 'malades', 'courrier'].map(type => (
          <label key={type} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              value={type}
              checked={form.missionType.includes(type)}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="capitalize text-gray-700">{type}</span>
          </label>
        ))}
      </div>
    </div>

    {/* 7. Zone */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Zone</label>
      <select
        name="missionZone"
        value={form.missionZone}
        onChange={handleChange}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Zone</option>
        <option value="zone_ocp">Zone OCP</option>
        <option value="hors_ocp">Hors OCP</option>
      </select>
    </div>

    {/* 8. Lieu if hors OCP */}
    {form.missionZone === 'hors_ocp' && (
      <div>
        <label className="block mb-1 font-medium text-gray-700">
          <MapPin className="inline w-4 h-4 mr-2" />Lieu
        </label>
        <input
          name="lieu"
          value={form.lieu}
          onChange={handleChange}
          required
          placeholder="Destination location"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    )}
  </div>

  {/* Submit Button */}
  <div>
    <button
      type="submit"
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2"
    >
      <Download className="w-5 h-5" />
      <span>Start Mission & Download PDF</span>
    </button>
  </div>
</form>
      </div>
    </div>
    </div>
  );
};

export default AddMission;
