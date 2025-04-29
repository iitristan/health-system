"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/context/SessionContext";
import { Suspense } from "react";

interface FormData {
  tprSheetUrl: string;
  foodIntake: string;
  fiberIntake: string;
  fluidIntake: string;
  parenteral: string;
  waterIntake: string;
  urineOutput: string;
  stoolDateTime: string;
  stoolConsistency: string;
  stoolColor: string;
  stoolAmount: string;
  stoolStraining: string;
  stoolPain: string;
  stoolBloodMucus: string;
  stoolOdor: string;
}

interface TPRInputOutputRecord {
  id: string;
  full_name: string;
  physician_name: string;
  date_of_service: string;
  tpr_sheet_url: string;
  new_food_today: boolean;
  fiber_intake: string;
  fluid_intake: string;
  parenteral: string;
  water_intake: string;
  urine_output: string;
  stool_date_time: string;
  stool_consistency: string;
  stool_color: string;
  stool_amount: string;
  stool_straining: string;
  stool_pain: string;
  stool_blood_mucus: string;
  stool_odor: string;
  created_at: string;
}

const TPRInputOutputPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TPRInputOutputPageContent />
    </Suspense>
  );
};

const TPRInputOutputPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const { selectedNurse } = useSession();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    tprSheetUrl: "",
    foodIntake: "",
    fiberIntake: "",
    fluidIntake: "",
    parenteral: "",
    waterIntake: "",
    urineOutput: "",
    stoolDateTime: "",
    stoolConsistency: "",
    stoolColor: "",
    stoolAmount: "",
    stoolStraining: "",
    stoolPain: "",
    stoolBloodMucus: "",
    stoolOdor: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patients, setPatients] = useState<Array<{ full_name: string }>>([]);
  const [patientInfo, setPatientInfo] = useState({
    fullName: "",
    dateToday: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    age: "",
    gender: "",
  });

  const [historyRecords, setHistoryRecords] = useState<TPRInputOutputRecord[]>(
    []
  );
  const [selectedRecord, setSelectedRecord] =
    useState<TPRInputOutputRecord | null>(null);

  // Update the loading state to be more specific
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Add new state for drag and drop
  const [isDragging, setIsDragging] = useState(false);

  // Add state to track the uploaded filename
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  // Fetch all patients and patient info
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all patients for the dropdown
        const { data: patientsData, error: patientsError } = await supabase
          .from("patients")
          .select("full_name")
          .order("full_name");

        if (patientsError) {
          console.error("Error fetching patients:", patientsError);
          throw patientsError;
        }

        setPatients(patientsData || []);

        // If patient name is in URL, fetch their info
        if (patientName) {
          const { data: patientData, error: patientError } = await supabase
            .from("patients")
            .select("*")
            .eq("full_name", patientName)
            .single();

          if (patientError) {
            console.error("Error fetching patient info:", patientError);
            throw patientError;
          }

          if (patientData) {
            setPatientInfo((prev) => ({
              ...prev,
              fullName: patientData.full_name,
              age: patientData.age,
              gender: patientData.gender,
            }));
            setSelectedPatient(patientData.full_name);
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", {
          error,
          message: error instanceof Error ? error.message : "Unknown error",
          patientName,
        });
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
      }
    };

    fetchData();
  }, [patientName]);

  // Update physician when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      setFormData((prev) => ({
        ...prev,
        physician: `${selectedNurse.full_name}, ${selectedNurse.position}`,
      }));
    }
  }, [selectedNurse]);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientName = e.target.value;
    setSelectedPatient(patientName);
    router.push(`/tpr-input-output?patient=${encodeURIComponent(patientName)}`);
  };

  // Add drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const input = document.createElement("input");
      input.type = "file";
      input.files = e.dataTransfer.files;
      const event = { target: input } as React.ChangeEvent<HTMLInputElement>;
      await handleFileUpload(event);
    }
  };

  // Update handleFileUpload function
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadedFileName(file.name);

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Invalid file type. Please upload a JPEG, PNG, or PDF file."
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 5MB");
      }

      // Generate a unique file path
      const timestamp = new Date().getTime();
      const filePath = `${selectedPatient}/${timestamp}-${file.name}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("tpr-sheets")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the download URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("tpr-sheets").getPublicUrl(filePath);

      // Update form data with the file URL
      setFormData((prev) => ({
        ...prev,
        tprSheetUrl: publicUrl,
      }));

      // Show success message
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload file"
      );
      alert("Failed to upload file. Please try again.");
      setUploadedFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  // Update handleDownloadFile function
  const handleDownloadFile = async (url: string, filename: string) => {
    try {
      setIsDownloading(true);
      // Extract the file path from the URL
      const urlParts = url.split("/");
      const bucketName = "tpr-sheets";
      const filePath = urlParts
        .slice(urlParts.indexOf(bucketName) + 1)
        .join("/");

      console.log("Downloading file:", {
        url,
        bucketName,
        filePath,
        filename,
      });

      if (!filePath) {
        throw new Error("Could not extract file path from URL");
      }

      // Download the file directly from Supabase storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        console.error("Supabase storage error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No file data received from storage");
      }

      // Create a download URL for the blob
      const downloadUrl = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(
        `Failed to download file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev: FormData) => ({
      ...prev,
      [name]: checked !== undefined ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedPatient) {
        throw new Error("Please select a patient");
      }

      if (!selectedNurse) {
        throw new Error("Please select a nurse");
      }

      const submissionData = {
        full_name: selectedPatient,
        physician_name: `${selectedNurse.full_name}, ${selectedNurse.position}`,
        date_of_service: new Date().toISOString().split("T")[0],
        tpr_sheet_url: formData.tprSheetUrl,
        new_food_today: formData.foodIntake === "Yes",
        fiber_intake: formData.fiberIntake,
        fluid_intake: formData.fluidIntake,
        parenteral: formData.parenteral,
        water_intake: formData.waterIntake,
        urine_output: formData.urineOutput,
        stool_date_time: formData.stoolDateTime
          ? new Date(formData.stoolDateTime).toISOString()
          : null,
        stool_consistency: formData.stoolConsistency,
        stool_color: formData.stoolColor,
        stool_amount: formData.stoolAmount,
        stool_straining: formData.stoolStraining === "Yes",
        stool_pain: formData.stoolPain === "Yes",
        stool_blood_mucus: formData.stoolBloodMucus === "Yes",
        stool_odor: formData.stoolOdor,
      };

      // Insert the record into the database
      const { error: insertError } = await supabase
        .from("tpr_input_output_records")
        .insert([submissionData]);

      if (insertError) {
        throw insertError;
      }

      // Reset form and show success message
      setFormData({
        tprSheetUrl: "",
        foodIntake: "",
        fiberIntake: "",
        fluidIntake: "",
        parenteral: "",
        waterIntake: "",
        urineOutput: "",
        stoolDateTime: "",
        stoolConsistency: "",
        stoolColor: "",
        stoolAmount: "",
        stoolStraining: "",
        stoolPain: "",
        stoolBloodMucus: "",
        stoolOdor: "",
      });

      // Refresh history records
      await fetchHistoryRecords();

      alert("Record saved successfully!");
    } catch (error) {
      console.error("Error saving record:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save record"
      );
      alert("Failed to save record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add fetchHistoryRecords function
  const fetchHistoryRecords = async () => {
    if (!selectedPatient) return;

    try {
      const { data, error } = await supabase
        .from("tpr_input_output_records")
        .select("*")
        .eq("full_name", selectedPatient)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistoryRecords(data || []);
    } catch (error) {
      console.error("Error fetching history records:", error);
    }
  };

  // Add handleViewRecord function
  const handleViewRecord = (record: TPRInputOutputRecord) => {
    setSelectedRecord(record);
    setFormData({
      tprSheetUrl: record.tpr_sheet_url || "",
      foodIntake: record.new_food_today ? "Yes" : "No",
      fiberIntake: record.fiber_intake || "",
      fluidIntake: record.fluid_intake || "",
      parenteral: record.parenteral || "",
      waterIntake: record.water_intake || "",
      urineOutput: record.urine_output || "",
      stoolDateTime: record.stool_date_time
        ? new Date(record.stool_date_time).toISOString().slice(0, 16)
        : "",
      stoolConsistency: record.stool_consistency || "",
      stoolColor: record.stool_color || "",
      stoolAmount: record.stool_amount || "",
      stoolStraining: record.stool_straining ? "Yes" : "No",
      stoolPain: record.stool_pain ? "Yes" : "No",
      stoolBloodMucus: record.stool_blood_mucus ? "Yes" : "No",
      stoolOdor: record.stool_odor || "",
    });
  };

  // Add handleDeleteRecord function
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const { error } = await supabase
        .from("tpr_input_output_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;
      await fetchHistoryRecords();
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record. Please try again.");
    }
  };

  // Add handleNewRecord function
  const handleNewRecord = () => {
    setSelectedRecord(null);
    setFormData({
      tprSheetUrl: "",
      foodIntake: "",
      fiberIntake: "",
      fluidIntake: "",
      parenteral: "",
      waterIntake: "",
      urineOutput: "",
      stoolDateTime: "",
      stoolConsistency: "",
      stoolColor: "",
      stoolAmount: "",
      stoolStraining: "",
      stoolPain: "",
      stoolBloodMucus: "",
      stoolOdor: "",
    });
  };

  // Update useEffect to fetch history records when patient changes
  useEffect(() => {
    if (selectedPatient) {
      fetchHistoryRecords();
    }
  }, [selectedPatient]);

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
            <h1 className="text-3xl font-bold text-white">
              Electronic Health Record
            </h1>
            <p className="mt-1 text-lg text-indigo-200">TPR and Input/Output</p>
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
              TPR and Input/Output Form
            </h2>
            <p className="text-gray-200 text-sm">
              Please fill in the patient&apos;s TPR sheet and input/output
              details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Selection */}
            <div className="px-8 mt-2">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Patient
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/patient-information?returnTo=/tpr-input-output`
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Patient Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.fullName || "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date of Service
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.dateToday}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nurse</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedNurse
                      ? `${selectedNurse.full_name}, ${selectedNurse.position}`
                      : "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.age || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.gender || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            {/* TPR Sheet Upload */}
            <div className="px-8">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                TPR Sheet
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload TPR Sheet
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300"
                    } transition-colors duration-200`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <svg
                            className="animate-spin h-8 w-8 text-indigo-600 mb-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span className="text-sm text-gray-600">
                            Uploading...
                          </span>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <div className="mt-4">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium text-indigo-600">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, PDF up to 5MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {formData.tprSheetUrl && (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <svg
                        className="h-4 w-4 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {uploadedFileName} uploaded successfully
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Intake Section */}
            <div className="px-8">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                Intake
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Any new food today?
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="foodIntake"
                        value="Yes"
                        checked={formData.foodIntake === "Yes"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="foodIntake"
                        value="No"
                        checked={formData.foodIntake === "No"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiber Intake
                  </label>
                  <select
                    name="fiberIntake"
                    value={formData.fiberIntake}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="Low">Low</option>
                    <option value="Med">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fluid Intake
                  </label>
                  <select
                    name="fluidIntake"
                    value={formData.fluidIntake}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="Low">Low</option>
                    <option value="Med">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parenteral
                  </label>
                  <textarea
                    name="parenteral"
                    value={formData.parenteral}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Enter parenteral information..."
                  />
                </div>
              </div>
            </div>

            {/* Urine Input/Output Section */}
            <div className="px-8">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                Urine Input and Output
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Water Intake (cc)
                  </label>
                  <input
                    type="number"
                    name="waterIntake"
                    value={formData.waterIntake}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter water intake in cc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urine Output (cc)
                  </label>
                  <input
                    type="number"
                    name="urineOutput"
                    value={formData.urineOutput}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter urine output in cc"
                  />
                </div>
              </div>
            </div>

            {/* Stool Output Section */}
            <div className="px-8">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                Stool Output
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date/Time of Bowel Movement
                  </label>
                  <input
                    type="datetime-local"
                    name="stoolDateTime"
                    value={formData.stoolDateTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consistency
                  </label>
                  <select
                    name="stoolConsistency"
                    value={formData.stoolConsistency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="Soft">Soft</option>
                    <option value="Hard">Hard</option>
                    <option value="Loose">Loose</option>
                    <option value="Watery">Watery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <select
                    name="stoolColor"
                    value={formData.stoolColor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="Brown">Brown</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Green">Green</option>
                    <option value="Black">Black</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <select
                    name="stoolAmount"
                    value={formData.stoolAmount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="Small">Small</option>
                    <option value="Med">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Straining
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="stoolStraining"
                        value="Yes"
                        checked={formData.stoolStraining === "Yes"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="stoolStraining"
                        value="No"
                        checked={formData.stoolStraining === "No"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pain
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="stoolPain"
                        value="Yes"
                        checked={formData.stoolPain === "Yes"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="stoolPain"
                        value="No"
                        checked={formData.stoolPain === "No"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood or Mucus Present
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="stoolBloodMucus"
                        value="Yes"
                        checked={formData.stoolBloodMucus === "Yes"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="stoolBloodMucus"
                        value="No"
                        checked={formData.stoolBloodMucus === "No"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Odor
                  </label>
                  <select
                    name="stoolOdor"
                    value={formData.stoolOdor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="Mild">Mild</option>
                    <option value="Strong">Strong</option>
                    <option value="Foul">Foul</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-8 py-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
          {/* Add History Section */}
          {historyRecords.length > 0 && (
            <div className="px-8 py-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Record History
                </h2>
                <button
                  onClick={handleNewRecord}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  New Record
                </button>
              </div>
              <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Nurse
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        TPR Sheet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyRecords.length > 0 ? (
                      historyRecords.map((record) => (
                        <tr
                          key={record.id}
                          className={
                            selectedRecord?.id === record.id
                              ? "bg-indigo-50"
                              : ""
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.physician_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.tpr_sheet_url && (
                              <button
                                onClick={() => {
                                  const fileName = `TPR-Sheet-${
                                    record.full_name
                                  }-${new Date(
                                    record.created_at
                                  ).toISOString()}`;
                                  handleDownloadFile(
                                    record.tpr_sheet_url,
                                    fileName
                                  );
                                }}
                                disabled={isDownloading}
                                className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                {isDownloading ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4 mr-2"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      className="h-4 w-4 mr-2"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                      />
                                    </svg>
                                    Download Sheet
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewRecord(record)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View Record
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No records found
                        </td>
                      </tr>
                    )}
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

export default TPRInputOutputPage;
