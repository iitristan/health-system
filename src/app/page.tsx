'use client';

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const [formData, setFormData] = useState({
    todayDate: '',
    signature: '',
    firstName: '',
    middleName: '',
    lastName: '',
    address1: '',
    city: '',
    state: '',
    zipCode: '',
    mobilePhone: '',
    email: '',
    dob: '',
    age: '',
    gender: '',
    maritalStatus: '',
    employmentStatus: '',
    ethnicity: '',
    mothersName: '',
    mothersDob: '',
    mothersAge: '',
    mothersOccupation: '',
    fathersName: '',
    fathersDob: '',
    fathersAge: '',
    fathersOccupation: '',
    siblingsCount: '0',
    siblings: []
  });

  // Set current date on component mount
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      todayDate: formattedDate
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSiblingChange = (index: number, field: string, value: string) => {
    const updatedSiblings = [...formData.siblings];
    updatedSiblings[index] = {
      ...updatedSiblings[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      siblings: updatedSiblings
    }));
  };

  const addSibling = () => {
    setFormData(prev => ({
      ...prev,
      siblings: [...prev.siblings, { name: '', age: '' }],
      siblingsCount: (parseInt(prev.siblingsCount) + 1).toString()
    }));
  };

  const removeSibling = (index: number) => {
    const updatedSiblings = formData.siblings.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      siblings: updatedSiblings,
      siblingsCount: updatedSiblings.length.toString()
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-800 py-6 px-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Electronic Health Record</h1>
          <p className="mt-1 text-lg text-indigo-200">Patient Information System</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">Patient Demographics Form</h2>
          </div>

          {/* Main Form Content */}
          <div className="p-8 space-y-10">
            {/* Section 1: Basic Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Today</label>
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-black">
                      {formData.todayDate}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address1"
                      value={formData.address1}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
                    <input
                      type="text"
                      name="signature"
                      value={formData.signature}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
                      <input
                        type="tel"
                        name="mobilePhone"
                        value={formData.mobilePhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Personal Details */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Personal Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender === 'Male'}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender === 'Female'}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Female</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="gender"
                          value="Other"
                          checked={formData.gender === 'Other'}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Other</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="Single"
                          checked={formData.maritalStatus === 'Single'}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Single</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="Married"
                          checked={formData.maritalStatus === 'Married'}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Married</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ethnicity</label>
                    <input
                      type="text"
                      name="ethnicity"
                      value={formData.ethnicity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="employmentStatus"
                          value="Employed"
                          checked={formData.employmentStatus === 'Employed'}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Employed</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="employmentStatus"
                          value="Student"
                          checked={formData.employmentStatus === 'Student'}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Student</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="employmentStatus"
                          value="Unemployed"
                          checked={formData.employmentStatus === 'Unemployed'}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Unemployed</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Parent Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Parent Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mother's Information */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Mother's Details</h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="mothersName"
                        value={formData.mothersName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          name="mothersDob"
                          value={formData.mothersDob}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input
                          type="number"
                          name="mothersAge"
                          value={formData.mothersAge}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                      <input
                        type="text"
                        name="mothersOccupation"
                        value={formData.mothersOccupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Father's Information */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Father's Details</h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="fathersName"
                        value={formData.fathersName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          name="fathersDob"
                          value={formData.fathersDob}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input
                          type="number"
                          name="fathersAge"
                          value={formData.fathersAge}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                      <input
                        type="text"
                        name="fathersOccupation"
                        value={formData.fathersOccupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Siblings Information */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Siblings Information</h3>
                <button
                  type="button"
                  onClick={addSibling}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Sibling
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.siblings.map((sibling, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-800">Sibling #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeSibling(index)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={sibling.name || ''}
                          onChange={(e) => handleSiblingChange(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input
                          type="number"
                          value={sibling.age || ''}
                          onChange={(e) => handleSiblingChange(index, 'age', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Form Actions */}
            <div className="border-t border-gray-200 pt-8 flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Patient Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;