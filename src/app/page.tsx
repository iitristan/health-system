'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

export default function EHRDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('full_name, date_of_birth, gender')
        .order('full_name');

      if (error) {
        console.error('Error fetching patients:', error);
        return;
      }

      setPatients(data || []);
    };

    fetchPatients();
  }, []);

  const handlePatientSelect = (patientName: string) => {
    setSelectedPatient(patientName);
    router.push(`/patient-information?patient=${encodeURIComponent(patientName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Patient Management System</h1>
              <p className="mt-1 text-sm text-gray-500">Comprehensive healthcare management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                Profile
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Patients Table Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Patients</h2>
                <p className="mt-1 text-sm text-gray-500">{patients.length} total patients</p>
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
                    {patients.map((patient) => (
                      <tr
                        key={patient.full_name}
                        onClick={() => handlePatientSelect(patient.full_name)}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedPatient === patient.full_name ? 'bg-gray-50' : ''
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
          </div>

          {/* Dashboard Cards */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Information */}
              <DashboardCard 
                title="Patient Information"
                description="View and manage patient demographics and personal details"
                onClick={() => router.push('/patient-information')}
                icon={<UserIcon />}
              />
              
              {/* Vital Signs */}
              <DashboardCard 
                title="Vital Signs"
                description="Record and track patient vitals over time"
                onClick={() => router.push('/vital-signs')}
                icon={<HeartIcon />}
              />
              
              {/* Health History */}
              <DashboardCard 
                title="Health History"
                description="Document past medical conditions and treatments"
                onClick={() => router.push('/health-history')}
                icon={<HistoryIcon />}
              />
              
              {/* Health Assessment */}
              <DashboardCard 
                title="Health Assessment"
                description="Comprehensive health evaluation tools"
                onClick={() => router.push('/health-assessment')}
                icon={<ClipboardIcon />}
              />
              
              {/* Medication Administration */}
              <DashboardCard 
                title="Medication Administration"
                description="Track and manage medication schedules"
                onClick={() => router.push('/medication-admin')}
                icon={<PillIcon />}
              />
              
              {/* Nurse's Notes */}
              <DashboardCard 
                title="Nurse's Notes"
                description="Clinical observations and assessments"
                icon={<NotebookIcon />}
              >
                <div className="mt-4 space-y-2">
                  <Link href="/nurse-notes/nurses-notes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Nurse Notes
                  </Link>
                  <Link href="/nurse-notes/skin-assessment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Skin Assessment
                  </Link>
                  <Link href="/nurse-notes/hair-assessment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Hair Assessment
                  </Link>
                  <Link href="/nurse-notes/nail-assessment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Nail Assessment
                  </Link>
                </div>
              </DashboardCard>
              
              {/* Services */}
              <DashboardCard 
                title="Services"
                description="Access various healthcare services"
                icon={<ServicesIcon />}
              >
                <div className="mt-4 space-y-2">
                  <Link href="/services/medical-checkup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Medical Checkup Booking
                  </Link>
                  <Link href="/services/nutrition-diet" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Nutrition & Diet Record
                  </Link>
                  <Link href="/services/vaccination" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Vaccination Record
                  </Link>
                  <Link href="/services/emergency-response" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Emergency Response
                  </Link>
                  <Link href="/services/deworming" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Deworming Services
                  </Link>
                  <Link href="/services/extensive-medical-assistance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Request Medical Assistance
                  </Link>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Card Component
function DashboardCard({ title, description, onClick, icon, children }: DashboardCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 p-3 rounded-lg bg-gray-100">
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
        {children && (
          <div className="mt-4 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// Icons
function UserIcon() { return <span className="text-xl">👤</span> }
function HeartIcon() { return <span className="text-xl">❤️</span> }
function HistoryIcon() { return <span className="text-xl">📜</span> }
function ClipboardIcon() { return <span className="text-xl">📋</span> }
function PillIcon() { return <span className="text-xl">💊</span> }
function NotebookIcon() { return <span className="text-xl">📓</span> }
function ServicesIcon() { return <span className="text-xl">🏥</span> }