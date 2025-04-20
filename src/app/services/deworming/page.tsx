"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/context/SessionContext";
import { Suspense } from "react";

interface DewormingRecord {
  id: string;
  dateTime: string;
  date_of_service: string;
  time_of_service: string;
  weight: string;
  height: string;
  previousDeworming: string;
  allergies: string;
  currentMedications: string;
  symptoms: string;
  physician: string;
}

const DewormingPage: NextPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DewormingPageContent />
    </Suspense>
  );
};
const DewormingPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const { selectedNurse } = useSession();
  const [patients, setPatients] = useState<
    Array<{ full_name: string; age: number; gender: string }>
  >([]);
  const [selectedPatient, setSelectedPatient] = useState(patientName || "");
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString()
  );
  const [records, setRecords] = useState<DewormingRecord[]>([]);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    weight: "",
    height: "",
    previousDeworming: "",
    allergies: "",
    currentMedications: "",
    symptoms: "",
    physician: selectedNurse ? `${selectedNurse.full_name}` : "",
  });

  // Update physician when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      setFormData((prev) => ({
        ...prev,
        physician: `${selectedNurse.full_name}`,
      }));
    }
  }, [selectedNurse]);

  // Fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("full_name, age, gender")
          .order("full_name");

        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setError("Failed to load patients. Please try again.");
      }
    };

    fetchPatients();
  }, []);

  // Fetch records when patient changes
  useEffect(() => {
    if (selectedPatient) {
      fetchRecords();
    }
  }, [selectedPatient]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("deworming_records")
        .select("*")
        .eq("full_name", selectedPatient)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setRecords(
          data.map((record) => ({
            id: record.id,
            dateTime: new Date(record.created_at).toLocaleString(),
            date_of_service: record.date_of_service,
            time_of_service: record.time_of_service,
            weight: record.weight,
            height: record.height,
            previousDeworming: record.previous_deworming,
            allergies: record.allergies,
            currentMedications: record.current_medications,
            symptoms: record.symptoms,
            physician: record.physician_name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      setError("Failed to load records. Please try again.");
    }
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(
        `/services/deworming?patient=${encodeURIComponent(selectedName)}`
      );
    } else {
      router.push("/services/deworming");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectedPatientData = patients.find(
    (p) => p.full_name === selectedPatient
  );

  const handleViewRecord = (record: DewormingRecord) => {
    if (!record) return;

    setFormData({
      date: record.date_of_service,
      time: record.time_of_service,
      weight: record.weight,
      height: record.height,
      previousDeworming: record.previousDeworming,
      allergies: record.allergies,
      currentMedications: record.currentMedications,
      symptoms: record.symptoms,
      physician: record.physician,
    });
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!recordId) {
      setError("Invalid record ID");
      return;
    }

    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const { error } = await supabase
        .from("deworming_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      // Refresh the records
      await fetchRecords();
      alert("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
      setError("Failed to delete record. Please try again.");
    }
  };

  const handleNewRecord = () => {
    setFormData({
      date: "",
      time: "",
      weight: "",
      height: "",
      previousDeworming: "",
      allergies: "",
      currentMedications: "",
      symptoms: "",
      physician: selectedNurse ? `${selectedNurse.full_name}` : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate that a patient is selected
      if (!selectedPatient) {
        setError("Please select a patient before submitting the form.");
        return;
      }

      // Format date and time separately
      const dateOfService = formData.date;
      const timeOfService = formData.time;

      // Convert weight and height to numbers, use null if empty
      const weight = formData.weight ? parseFloat(formData.weight) : null;
      const height = formData.height ? parseFloat(formData.height) : null;

      const { error } = await supabase.from("deworming_records").insert([
        {
          full_name: selectedPatient,
          date_of_service: dateOfService,
          time_of_service: timeOfService,
          weight: weight,
          height: height,
          previous_deworming: formData.previousDeworming,
          allergies: formData.allergies,
          current_medications: formData.currentMedications,
          symptoms: formData.symptoms,
          physician_name: formData.physician,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Reset form
      setFormData({
        date: "",
        time: "",
        weight: "",
        height: "",
        previousDeworming: "",
        allergies: "",
        currentMedications: "",
        symptoms: "",
        physician: selectedNurse ? `${selectedNurse.full_name}` : "",
      });

      // Show success message
      alert("Deworming record submitted successfully!");

      // Refresh records after submission
      await fetchRecords();
    } catch (error) {
      console.error("Error submitting deworming record:", error);
      setError(
        "Failed to submit deworming record. Please check your input values and try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-800 py-6 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go to Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Deworming Service</h1>
            <p className="mt-1 text-lg text-indigo-200">
              Schedule and track deworming services
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">
              Deworming Service Form
            </h2>
            <span className="text-sm text-gray-200">
              To request services that the school clinic provides, select what
              kind of service is requested and fill in the request form which
              contains basic information, time and date of requested service
              needed, and other relevant data. Submit the request form and wait
              for the request to be accepted by the school clinic. Be sure to
              check within your email for confirmation of your request.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Patient
                </label>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/patient-information?returnTo=/services/deworming`
                    )
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Patient
                </button>
              </div>
              <select
                value={selectedPatient}
                onChange={handlePatientChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.full_name} value={patient.full_name}>
                    {patient.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Patient Name
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPatientData?.full_name || "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Date of Service
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentDate}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nurse</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedNurse
                    ? `${selectedNurse.full_name} (${selectedNurse.position})`
                    : "Not available"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Age</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPatientData?.age || "Not available"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPatientData?.gender || "Not available"}
                </p>
              </div>
            </div>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                Appointment Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous Deworming History
                    </label>
                    <textarea
                      name="previousDeworming"
                      value={formData.previousDeworming}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      placeholder="List previous deworming dates and medications used"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Known Allergies
                    </label>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                Health Information
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medications
                  </label>
                  <textarea
                    name="currentMedications"
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    placeholder="List any medications you are currently taking"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    placeholder="Describe any symptoms that may indicate parasitic infection"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-8 flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => router.push(`/`)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Appointment
              </button>
            </div>
          </form>

          {/* History Table */}
          {records.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4 px-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Assessment History
                </h3>
                <button
                  onClick={handleNewRecord}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Record
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date/Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nurse
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.dateTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.physician}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleViewRecord(record)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DewormingPage;
