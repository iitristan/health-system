'use client';

import { useState } from 'react';

export default function VitalSignsPage() {
  // Patient information (would typically come from props or API)
  const patientInfo = {
    lastName: 'Olayvar',
    firstName: 'Charlene',
    middleName: 'Alison',
    dateToday: 'March 2025',
    physician: 'Dr. Alena Santos, Pediatrician',
    admissionHeight: '4 feet and 9 inches',
    admissionWeight: '36 kg'
  };

  // State for vital signs records
  const [vitalSigns, setVitalSigns] = useState([
    {
      dateTime: 'December 2024',
      bloodPressure: '90/60 mmHg',
      temperature: '37.2°C',
      pulseRate: '100',
      respirationRate: '20',
      weight: '36 kg',
      height: '4 ft 9 inch',
      oxygen: '95%',
      painScale: '0',
      comments: ''
    },
    {
      dateTime: 'January 2025',
      bloodPressure: '90/55 mmHg',
      temperature: '37.0°C',
      pulseRate: '95',
      respirationRate: '22',
      weight: '35 kg',
      height: '4 ft 9 inch',
      oxygen: '95%',
      painScale: '0',
      comments: ''
    },
    {
      dateTime: 'March 2025',
      bloodPressure: '90/70 mmHg',
      temperature: '36.8°C',
      pulseRate: '95',
      respirationRate: '19',
      weight: '35 kg',
      height: '4 ft 9 inch',
      oxygen: '98%',
      painScale: '0',
      comments: ''
    }
  ]);

  // State for new entry
  const [newEntry, setNewEntry] = useState({
    dateTime: '',
    bloodPressure: '',
    temperature: '',
    pulseRate: '',
    respirationRate: '',
    weight: '',
    height: '',
    oxygen: '',
    painScale: '',
    comments: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVitalSigns([...vitalSigns, newEntry]);
    setNewEntry({
      dateTime: '',
      bloodPressure: '',
      temperature: '',
      pulseRate: '',
      respirationRate: '',
      weight: '',
      height: '',
      oxygen: '',
      painScale: '',
      comments: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Patient Information Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Last Name</p>
              <p className="text-lg">{patientInfo.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">First Name</p>
              <p className="text-lg">{patientInfo.firstName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Middle Name</p>
              <p className="text-lg">{patientInfo.middleName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date Today</p>
              <p className="text-lg">{patientInfo.dateToday}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Attending Physician</p>
              <p className="text-lg">{patientInfo.physician}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Admission Height/Length</p>
              <p className="text-lg">{patientInfo.admissionHeight}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Admission Weight</p>
              <p className="text-lg">{patientInfo.admissionWeight}</p>
            </div>
          </div>
        </div>

        {/* Vital Signs Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Vital Signs Record</h2>
            
            {/* Add New Entry Form */}
            <form onSubmit={handleSubmit} className="mb-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Add New Vital Signs Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input
                    type="text"
                    name="dateTime"
                    value={newEntry.dateTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. March 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    name="bloodPressure"
                    value={newEntry.bloodPressure}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 120/80 mmHg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                  <input
                    type="text"
                    name="temperature"
                    value={newEntry.temperature}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 37.0°C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pulse Rate</label>
                  <input
                    type="text"
                    name="pulseRate"
                    value={newEntry.pulseRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 72"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Respiration Rate</label>
                  <input
                    type="text"
                    name="respirationRate"
                    value={newEntry.respirationRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 16"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={newEntry.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 36 kg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                  <input
                    type="text"
                    name="height"
                    value={newEntry.height}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 4 ft 9 inch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oxygen Saturation</label>
                  <input
                    type="text"
                    name="oxygen"
                    value={newEntry.oxygen}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 98%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pain Scale (0-10)</label>
                  <input
                    type="text"
                    name="painScale"
                    value={newEntry.painScale}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <input
                    type="text"
                    name="comments"
                    value={newEntry.comments}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Record
              </button>
            </form>

            {/* Vital Signs Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Pressure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pulse Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respiration Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oxygen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pain Scale</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vitalSigns.map((record, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.dateTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.bloodPressure}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.temperature}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.pulseRate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.respirationRate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.weight}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.height}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.oxygen}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.painScale}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.comments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}