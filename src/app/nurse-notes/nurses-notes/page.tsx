'use client';

import { useState } from 'react';
import type { NextPage } from 'next';

const NurseNotesPage: NextPage = () => {
  const [formData, setFormData] = useState({
    clientName: 'Charlene Olayvar',
    dateOfBirth: '',
    dateOfService: '',
    physician: 'G',
    documentationTo: '',
    assessmentTimeFrame: {
      admission: false,
      weekly: false,
      changeInCondition: false,
      quarterly: false
    },
    riskLevel: {
      highRisk: false,
      lowRisk: false
    },
    documentationMethod: {
      email: false,
      fax: false,
      hardCopy: true
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-800 py-6 px-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Nurse Notes</h1>
          <p className="mt-1 text-lg text-indigo-200">Patient Assessment Documentation</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">Nurse Notes Form</h2>
          </div>

          <div className="p-8 space-y-10">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Patient Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Service</label>
                    <input
                      type="date"
                      name="dateOfService"
                      value={formData.dateOfService}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Physician</label>
                    <input
                      type="text"
                      name="physician"
                      value={formData.physician}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Documentation Details</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documentation to be sent back to</label>
                  <input
                    type="text"
                    name="documentationTo"
                    value={formData.documentationTo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Level of Risk</label>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="riskLevel.highRisk"
                        checked={formData.riskLevel.highRisk}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">High Risk</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="riskLevel.lowRisk"
                        checked={formData.riskLevel.lowRisk}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Low Risk</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Assessment Time Frame</label>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="assessmentTimeFrame.admission"
                        checked={formData.assessmentTimeFrame.admission}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Admission</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="assessmentTimeFrame.weekly"
                        checked={formData.assessmentTimeFrame.weekly}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Weekly</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="assessmentTimeFrame.changeInCondition"
                        checked={formData.assessmentTimeFrame.changeInCondition}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Change in Condition</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="assessmentTimeFrame.quarterly"
                        checked={formData.assessmentTimeFrame.quarterly}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Quarterly</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Documentation Method</label>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="documentationMethod.email"
                        checked={formData.documentationMethod.email}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Email</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="documentationMethod.fax"
                        checked={formData.documentationMethod.fax}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Fax</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="documentationMethod.hardCopy"
                        checked={formData.documentationMethod.hardCopy}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Hard Copy</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Parts to be Assessed</h3>
              <div className="space-y-4">
                <a
                  href="/nurse-notes/skin-assessment"
                  className="block text-indigo-600 hover:text-indigo-800"
                >
                  Skin Assessment
                </a>
                <a
                  href="/nurse-notes/hair-assessment"
                  className="block text-indigo-600 hover:text-indigo-800"
                >
                  Hair Assessment
                </a>
                <a
                  href="/nurse-notes/nail-assessment"
                  className="block text-indigo-600 hover:text-indigo-800"
                >
                  Nail Assessment
                </a>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Submit Nurse Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseNotesPage; 