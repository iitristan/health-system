"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/context/SessionContext";

interface DashboardCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  icon?: ReactNode;
  children?: ReactNode;
}

interface Patient {
  full_name: string;
  date_of_birth: string;
  gender: string;
}

interface Nurse {
  id: string;
  full_name: string;
  position: string;
  email: string;
  signature: string;
  created_at: string;
  updated_at: string;
}

export default function EHRDashboard() {
  const router = useRouter();
  const { selectedNurse, setSelectedNurse } = useSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [nurseSearchQuery, setNurseSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [filteredNurses, setFilteredNurses] = useState<Nurse[]>([]);
  const [showAddNurseForm, setShowAddNurseForm] = useState(false);
  const [newNurse, setNewNurse] = useState<Nurse>({
    id: "",
    full_name: "",
    position: "",
    email: "",
    signature: "",
    created_at: "",
    updated_at: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients
        const { data: patientsData, error: patientsError } = await supabase
          .from("patients")
          .select("full_name, date_of_birth, gender")
          .order("full_name");

        if (patientsError) {
          console.error("Error fetching patients:", patientsError);
          setError("Failed to load patients. Please try again.");
        } else {
          setPatients(patientsData || []);
          setFilteredPatients(patientsData || []);
        }

        // Fetch nurses
        const { data: nursesData, error: nursesError } = await supabase
          .from("nurses")
          .select("id, full_name, position, email, signature, created_at, updated_at")
          .order("full_name");

        if (nursesError) {
          console.error("Error fetching nurses:", nursesError);
          setError("Failed to load nurses. Please try again.");
        } else {
          const formattedNurses = nursesData?.map(nurse => ({
            ...nurse,
            created_at: nurse.created_at || new Date().toISOString(),
            updated_at: nurse.updated_at || new Date().toISOString()
          })) || [];
          
          setNurses(formattedNurses);
          setFilteredNurses(formattedNurses);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (patientSearchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filteredP = patients.filter((patient) =>
        patient.full_name.toLowerCase().includes(patientSearchQuery.toLowerCase())
      );
      setFilteredPatients(filteredP);
    }
  }, [patientSearchQuery, patients]);

  useEffect(() => {
    if (nurseSearchQuery.trim() === "") {
      setFilteredNurses(nurses);
    } else {
      const filteredN = nurses.filter((nurse) =>
        nurse.full_name.toLowerCase().includes(nurseSearchQuery.toLowerCase())
      );
      setFilteredNurses(filteredN);
    }
  }, [nurseSearchQuery, nurses]);

  const handlePatientSelect = (patientName: string) => {
    setSelectedPatient(patientName);
    router.push(
      `/patient-information?patient=${encodeURIComponent(patientName)}`
    );
  };

  const handleNurseSelect = (nurse: Nurse) => {
    setSelectedNurse(nurse);
  };

  const handleAddNurse = async () => {
    const { error } = await supabase.from("nurses").insert([newNurse]);

    if (error) {
      console.error("Error adding nurse:", error);
      return;
    }

    setNurses([...nurses, newNurse]);
    setFilteredNurses([...nurses, newNurse]);
    setShowAddNurseForm(false);
    setNewNurse({
      id: "",
      full_name: "",
      position: "",
      email: "",
      signature: "",
      created_at: "",
      updated_at: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Patient Management System
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Comprehensive healthcare management
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-indigo-50 px-4 py-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm font-medium text-indigo-700">
                  Welcome, {selectedNurse?.full_name || 'Guest'}
                </span>
              </div>
              <button
                onClick={() => router.push("/profile")}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Profiles</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
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
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {!selectedNurse && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please select a staff from the list before accessing any forms or services. This selection will be used for:</p>
                  <ul className="mt-2 list-disc list-inside">
                    <li>Form authentication and signing</li>
                    <li>Tracking medical records</li>
                    <li>Service authorization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* Patients Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Patients
                  </h2>
                  <p className="text-sm text-gray-500">
                    {filteredPatients.length} patients
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {patientSearchQuery && (
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setPatientSearchQuery("")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr
                        key={patient.full_name}
                        onClick={() => handlePatientSelect(patient.full_name)}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedPatient === patient.full_name
                            ? "bg-gray-50"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {patient.full_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {patient.gender}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nurses Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Staff</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredNurses.length} staff found
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/profile")}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Manage Staff
                  </button>
                </div>
                {!selectedNurse && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Please select a staff before accessing any forms. This will be used for signing and authentication.
                    </p>
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={nurseSearchQuery}
                    onChange={(e) => setNurseSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {nurseSearchQuery && (
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setNurseSearchQuery("")}
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(50vh-100px)]">
                <div className="divide-y divide-gray-200">
                  {filteredNurses.map((nurse) => (
                    <div
                      key={nurse.id}
                      onClick={() => handleNurseSelect(nurse)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedNurse?.id === nurse.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-blue-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {nurse.full_name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <svg
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                                  clipRule="evenodd"
                                />
                                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                              </svg>
                              {nurse.position}
                            </div>
                          </div>
                        </div>
                        {selectedNurse?.id === nurse.id && (
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-blue-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <DashboardCard 
            title="Patient Information"
            description="View and manage patient demographics and personal details"
                onClick={() => router.push("/patient-information")}
            icon={<UserIcon />}
          />
          
          {/* Vital Signs */}
          <DashboardCard 
            title="Vital Signs"
            description="Record and track patient vitals over time"
                onClick={() => router.push("/vital-signs")}
            icon={<HeartIcon />}
          />
          
          {/* Health History */}
          <DashboardCard 
            title="Health History"
            description="Document past medical conditions and treatments"
                onClick={() => router.push("/health-history")}
            icon={<HistoryIcon />}
          />
          
          {/* Health Assessment */}
          <DashboardCard 
            title="Health Assessment"
                description="Comprehensive health evaluation tools. Includes Physical and Health Status, Dietary and Nutritional Assessment, Psychosocial and Behavioral Factors, Nail Assessment, Hair Assessment, Skin Assessment"
            icon={<ClipboardIcon />}
                onClick={() => router.push("/health-assessment")}
              ></DashboardCard>
          
          {/* Medication Administration */}
          <DashboardCard 
            title="Medication Administration"
            description="Track and manage medication schedules"
                onClick={() => router.push("/medication-admin")}
            icon={<PillIcon />}
          />
          
              {/* Nurse Notes */}
          <DashboardCard 
                title="Nurse Notes"
            description="Clinical observations and assessments"
                onClick={() => router.push("/nurses-notes")}
            icon={<NotebookIcon />}
              />
          
          {/* Services */}
          <DashboardCard 
            title="Services"
            description="Access various healthcare services"
                icon={<ServicesIcon />}
              >
                <div className="mt-4 space-y-2">
                  <Link
                    href="/services/medical-checkup"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Medical Checkup Booking
                  </Link>
                  <Link
                    href="/services/nutrition-diet"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Nutrition & Diet Record
                  </Link>
                  <Link
                    href="/services/vaccination"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Vaccination Record
                  </Link>
                  <Link
                    href="/services/emergency-response"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Emergency Response
                  </Link>
                  <Link
                    href="/services/deworming"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Deworming Services
                  </Link>
                  <Link
                    href="/services/extensive-medical-assistance"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Request Medical Assistance
                  </Link>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </div>

      {/* Add Nurse Modal */}
      {showAddNurseForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Nurse
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={newNurse.full_name}
                  onChange={(e) =>
                    setNewNurse({ ...newNurse, full_name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Position
                </label>
                <input
                  type="text"
                  value={newNurse.position}
                  onChange={(e) =>
                    setNewNurse({ ...newNurse, position: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={newNurse.email}
                  onChange={(e) =>
                    setNewNurse({ ...newNurse, email: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Signature
                </label>
                <input
                  type="text"
                  value={newNurse.signature}
                  onChange={(e) =>
                    setNewNurse({ ...newNurse, signature: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddNurseForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNurse}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Nurse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Card Component
function DashboardCard({
  title,
  description,
  onClick,
  icon,
  children,
}: DashboardCardProps) {
  const { selectedNurse } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (!selectedNurse) {
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md ${
        !selectedNurse ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 p-3 rounded-lg bg-gray-100">{icon}</div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
            {!selectedNurse && (
              <p className="mt-2 text-sm text-yellow-600">
                Please select a staff to access this feature
              </p>
            )}
          </div>
        </div>
        {children && (
          <div className="mt-4 border-t border-gray-200">{children}</div>
        )}
      </div>
    </div>
  );
}

// Icons
function UserIcon() {
  return <span className="text-xl">👤</span>;
}
function HeartIcon() {
  return <span className="text-xl">❤️</span>;
}
function HistoryIcon() {
  return <span className="text-xl">📜</span>;
}
function ClipboardIcon() {
  return <span className="text-xl">📋</span>;
}
function PillIcon() {
  return <span className="text-xl">💊</span>;
}
function NotebookIcon() {
  return <span className="text-xl">📓</span>;
}
function ServicesIcon() {
  return <span className="text-xl">🏥</span>;
}
