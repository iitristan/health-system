'use client';

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

interface Sibling {
  name: string;
  age: string;
}

interface PatientFormData {
  fullName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  maritalStatus: string;
  employmentStatus: string;
  ethnicity: string;
  address1: string;
  city: string;
  state: string;
  zipCode: string;
  mobilePhone: string;
  email: string;
  signature: string;
  motherName: string;
  motherDateOfBirth: string;
  motherAge: string;
  motherOccupation: string;
  fatherName: string;
  fatherDateOfBirth: string;
  fatherAge: string;
  fatherOccupation: string;
  siblingsCount: string;
  siblings: Sibling[];
  todayDate: string;
}

const PatientInformation: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");

  const [formData, setFormData] = useState<PatientFormData>({
    fullName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    maritalStatus: '',
    employmentStatus: '',
    ethnicity: '',
    address1: '',
    city: '',
    state: '',
    zipCode: '',
    mobilePhone: '',
    email: '',
    signature: '',
    motherName: '',
    motherDateOfBirth: '',
    motherAge: '',
    motherOccupation: '',
    fatherName: '',
    fatherDateOfBirth: '',
    fatherAge: '',
    fatherOccupation: '',
    siblingsCount: '0',
    siblings: [],
    todayDate: '',
  });

  // Set current date and fetch patient data if available
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      todayDate: formattedDate
    }));

    const fetchPatientData = async () => {
      if (patientName) {
        try {
          const { data, error } = await supabase
            .from("patients")
            .select("*")
            .eq("full_name", patientName)
            .single();

          if (error) throw error;

          if (data) {
            setFormData(prev => ({
              ...prev,
              fullName: data.full_name || '',
              dateOfBirth: data.date_of_birth || '',
              age: data.age?.toString() || '',
              gender: data.gender || '',
              maritalStatus: data.marital_status || '',
              employmentStatus: data.employment_status || '',
              ethnicity: data.ethnicity || '',
              address1: data.address1 || '',
              city: data.city || '',
              state: data.state || '',
              zipCode: data.zip_code || '',
              mobilePhone: data.mobile_phone || '',
              email: data.email || '',
              signature: data.signature || '',
              motherName: data.mother_name || '',
              motherDateOfBirth: data.mother_date_of_birth || '',
              motherAge: data.mother_age?.toString() || '',
              motherOccupation: data.mother_occupation || '',
              fatherName: data.father_name || '',
              fatherDateOfBirth: data.father_date_of_birth || '',
              fatherAge: data.father_age?.toString() || '',
              fatherOccupation: data.father_occupation || '',
              siblingsCount: data.siblings_count?.toString() || '0',
              siblings: data.siblings_names?.map((name: string, index: number) => ({
                name,
                age: (data.siblings_ages?.[index] || '').toString()
              })) || []
            }));
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
        }
      }
    };

    fetchPatientData();
  }, [patientName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSiblingChange = (index: number, field: keyof Sibling, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.fullName || !formData.dateOfBirth) {
        alert("Please fill in all required fields (Full Name and Date of Birth)");
        return;
      }

      // Check for duplicate names if this is a new patient
      if (!patientName) {
        const { data: existingPatients, error: checkError } = await supabase
          .from("patients")
          .select("full_name")
          .eq("full_name", formData.fullName);

        if (checkError) throw checkError;

        if (existingPatients && existingPatients.length > 0) {
          alert(`A patient with the name "${formData.fullName}" already exists. Please use a different name.`);
          return;
        }
      }

      const patientData = {
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        marital_status: formData.maritalStatus || null,
        employment_status: formData.employmentStatus || null,
        ethnicity: formData.ethnicity || null,
        address1: formData.address1 || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        mobile_phone: formData.mobilePhone || null,
        email: formData.email || null,
        signature: formData.signature || null,
        mother_name: formData.motherName || null,
        mother_date_of_birth: formData.motherDateOfBirth || null,
        mother_age: formData.motherAge ? parseInt(formData.motherAge) : null,
        mother_occupation: formData.motherOccupation || null,
        father_name: formData.fatherName || null,
        father_date_of_birth: formData.fatherDateOfBirth || null,
        father_age: formData.fatherAge ? parseInt(formData.fatherAge) : null,
        father_occupation: formData.fatherOccupation || null,
        siblings_count: formData.siblings.length,
        siblings_names: formData.siblings.map(sibling => sibling.name),
        siblings_ages: formData.siblings.map(sibling => parseInt(sibling.age))
      };

      if (patientName) {
        // Update existing patient
        const { error: updateError } = await supabase
          .from("patients")
          .update(patientData)
          .eq("full_name", patientName);

        if (updateError) throw updateError;
        alert("Patient information updated successfully!");
      } else {
        // Insert new patient
        const { error: insertError } = await supabase
          .from("patients")
          .insert(patientData);

        if (insertError) throw insertError;
        alert("New patient record created successfully!");
      }
    } catch (error) {
      console.error("Error saving patient information:", error);
      alert("Failed to save patient information. Please check all required fields and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-800 py-6 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go to Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Electronic Health Record</h1>
            <p className="mt-1 text-lg text-indigo-200">Patient Information System</p>
          </div>

          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Information Form */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">Patient Demographics Form</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      required
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
                      required
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
                      required
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
                        required
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
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      name="mobilePhone"
                      value={formData.mobilePhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      required
                    />
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
                </div>
              </div>
            </section>

            {/* Section 2: Personal Details */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Personal Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender === "Male"}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          required
                        />
                        <span className="text-sm text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender === "Female"}
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
                          checked={formData.gender === "Other"}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="Single"
                          checked={formData.maritalStatus === "Single"}
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
                          checked={formData.maritalStatus === "Married"}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="employmentStatus"
                          value="Employed"
                          checked={formData.employmentStatus === "Employed"}
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
                          checked={formData.employmentStatus === "Student"}
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
                          checked={formData.employmentStatus === "Unemployed"}
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
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-700">Mother&apos;s Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Name</label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Date of Birth</label>
                    <input
                      type="date"
                      name="motherDateOfBirth"
                      value={formData.motherDateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Age</label>
                    <input
                      type="number"
                      name="motherAge"
                      value={formData.motherAge}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Occupation</label>
                    <input
                      type="text"
                      name="motherOccupation"
                      value={formData.motherOccupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-700">Father&apos;s Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Name</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Date of Birth</label>
                    <input
                      type="date"
                      name="fatherDateOfBirth"
                      value={formData.fatherDateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Age</label>
                    <input
                      type="number"
                      name="fatherAge"
                      value={formData.fatherAge}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Occupation</label>
                    <input
                      type="text"
                      name="fatherOccupation"
                      value={formData.fatherOccupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
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
                onClick={() => router.push('/')}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Patient Record
              </button>
            </div>
          </form>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => router.push(`/vital-signs?patient=${encodeURIComponent(formData.fullName)}`)}
            className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mr-2">❤️</span>
            <span className="text-sm font-medium text-gray-900">Vital Signs</span>
          </button>
          
          <button
            onClick={() => router.push(`/health-history?patient=${encodeURIComponent(formData.fullName)}`)}
            className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mr-2">📜</span>
            <span className="text-sm font-medium text-gray-900">Health History</span>
          </button>
          
          <button
            onClick={() => router.push(`/health-assessment?patient=${encodeURIComponent(formData.fullName)}`)}
            className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mr-2">📋</span>
            <span className="text-sm font-medium text-gray-900">Health Assessment</span>
          </button>
          
          <button
            onClick={() => router.push(`/medication-admin?patient=${encodeURIComponent(formData.fullName)}`)}
            className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mr-2">💊</span>
            <span className="text-sm font-medium text-gray-900">Medication Administration</span>
          </button>
          
          <button
            onClick={() => router.push(`/nurse-notes/nurses-notes?patient=${encodeURIComponent(formData.fullName)}`)}
            className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mr-2">📓</span>
            <span className="text-sm font-medium text-gray-900">Nurse&apos;s Notes</span>
          </button>
          
          <button
            onClick={() => router.push(`/services/extensive-medical-assistance?patient=${encodeURIComponent(formData.fullName)}`)}
            className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mr-2">🏥</span>
            <span className="text-sm font-medium text-gray-900">Request Medical Assistance</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientInformation;