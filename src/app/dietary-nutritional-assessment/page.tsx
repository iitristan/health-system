"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Suspense } from "react";
import { useSession } from "@/app/context/SessionContext";

interface DietRecall {
  [key: string]: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

interface FoodGroups {
  milk: boolean;
  fruits: boolean;
  meat: boolean;
  bread: boolean;
  vegetables: boolean;
  fat: boolean;
}

interface MealDetails {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  reason: string;
}

interface DietHistory {
  foodGroups: FoodGroups;
  junkFood: MealDetails;
  fastFood: MealDetails;
  skippedMeals: MealDetails;
}

interface FoodInsecurity {
  skippingMeals: boolean;
  limitedAccess: boolean;
  foodAssistance: boolean;
  other: string;
}

interface FormData {
  dietRecall: DietRecall;
  waterIntake: {
    amount: string;
    temperature: string;
  };
  dietHistory: DietHistory;
  malnutritionScreening: {
    weightLoss: string;
    appetite: string;
    foodIntake: string;
    eatingDifficulty: string;
    weightLossAmount?: string;
    foodIntakeDetails?: string;
  };
  appetiteStatus: {
    normal: boolean;
    suppressed: boolean;
    increased: boolean;
  };
}

interface DietaryNutritionalRecord {
  id: string;
  full_name: string;
  physician_id: string;
  physician_name: string;
  date_of_service: string;
  created_at: string;
  diet_recall: {
    [key: string]: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
  };
  water_intake: {
    amount: string;
    temperature: string;
  };
  diet_history: {
    foodGroups: {
      milk: boolean;
      fruits: boolean;
      meat: boolean;
      bread: boolean;
      vegetables: boolean;
      fat: boolean;
    };
    junkFood: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      reason: string;
    };
    fastFood: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      reason: string;
    };
    skippedMeals: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      reason: string;
    };
  };
  malnutrition_screening: {
    weightLoss: string;
    appetite: string;
    foodIntake: string;
    eatingDifficulty: string;
    weightLossAmount?: string;
    foodIntakeDetails?: string;
  };
  appetite_status: {
    normal: boolean;
    suppressed: boolean;
    increased: boolean;
  };
}

export default function DietaryAssessmentWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DietaryAssessmentPage />
    </Suspense>
  );
}

function DietaryAssessmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientName = searchParams.get("patient");
  const { selectedNurse } = useSession();

  const [patientInfo, setPatientInfo] = useState({
    fullName: "",
    dateOfService: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    physician: selectedNurse
      ? `${selectedNurse.full_name}, ${selectedNurse.position}`
      : "N/A",
  });

  const [patients, setPatients] = useState<Array<{ full_name: string }>>([]);
  const [selectedPatient, setSelectedPatient] = useState("");

  // Fetch all patients and patient info
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all patients for the dropdown
        const { data: patientsData, error: patientsError } = await supabase
          .from("patients")
          .select("full_name")
          .order("full_name");

        if (patientsError) throw patientsError;
        setPatients(patientsData || []);

        // If patient name is in URL, fetch their info
        if (patientName) {
          const { data: patientData, error: patientError } = await supabase
            .from("patients")
            .select("*")
            .eq("full_name", patientName)
            .single();

          if (patientError) throw patientError;

          if (patientData) {
            setPatientInfo((prev) => ({
              ...prev,
              fullName: patientData.full_name,
            }));
            setSelectedPatient(patientData.full_name);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [patientName]);

  // Add effect to update physician info when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      setPatientInfo((prev) => ({
        ...prev,
        physician: `${selectedNurse.full_name}, ${selectedNurse.position}`,
      }));
    }
  }, [selectedNurse]);

  // Only redirect if we're on the main page without a patient
  useEffect(() => {
    if (!selectedNurse && !patientName) {
      alert("Please select a staff from the dashboard first.");
      router.push("/");
    }
  }, [selectedNurse, patientName, router]);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(
        `/dietary-nutritional-assessment?patient=${encodeURIComponent(
          selectedName
        )}`
      );
    } else {
      router.push("/dietary-nutritional-assessment");
    }
  };

  // State management for form fields
  const [formData, setFormData] = useState<FormData>({
    dietRecall: {
      day1: { breakfast: "", lunch: "", dinner: "" },
    },
    waterIntake: {
      amount: "",
      temperature: "",
    },
    dietHistory: {
      foodGroups: {
        milk: false,
        fruits: false,
        meat: false,
        bread: false,
        vegetables: false,
        fat: false,
      },
      junkFood: {
        breakfast: false,
        lunch: false,
        dinner: false,
        reason: "",
      },
      fastFood: {
        breakfast: false,
        lunch: false,
        dinner: false,
        reason: "",
      },
      skippedMeals: {
        breakfast: false,
        lunch: false,
        dinner: false,
        reason: "",
      },
    },
    malnutritionScreening: {
      weightLoss: "",
      appetite: "",
      foodIntake: "",
      eatingDifficulty: "",
    },
    appetiteStatus: {
      normal: false,
      suppressed: false,
      increased: false,
    },
  });

  const handleMealInputChange = (day: string, meal: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dietRecall: {
        ...prev.dietRecall,
        [day]: {
          ...prev.dietRecall[day],
          [meal]: value,
        },
      },
    }));
  };

  const handleFoodGroupChange = (group: keyof FoodGroups, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      dietHistory: {
        ...prev.dietHistory,
        foodGroups: {
          ...prev.dietHistory.foodGroups,
          [group]: value,
        },
      },
    }));
  };

  const handleMealDetailsChange = (
    type: "junkFood" | "fastFood" | "skippedMeals",
    meal: keyof MealDetails,
    value: boolean | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      dietHistory: {
        ...prev.dietHistory,
        [type]: {
          ...prev.dietHistory[type],
          [meal]: value,
        },
      },
    }));
  };

  const handleFoodInsecurityChange = (
    key: keyof FoodInsecurity,
    value: boolean | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      foodInsecurity: {
        ...prev.foodInsecurity,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) {
      alert("No patient selected");
      return;
    }

    if (!selectedNurse) {
      alert(
        "No staff selected. Please select a staff from the dashboard first."
      );
      return;
    }

    try {
      const submissionData = {
        full_name: decodeURIComponent(patientName),
        physician_id: selectedNurse.id,
        date_of_service: new Date().toISOString().split("T")[0],
        diet_recall: formData.dietRecall,
        water_intake: formData.waterIntake,
        diet_history: {
          foodGroups: formData.dietHistory.foodGroups,
          junkFood: formData.dietHistory.junkFood,
          fastFood: formData.dietHistory.fastFood,
          skippedMeals: formData.dietHistory.skippedMeals,
        },
        malnutrition_screening: formData.malnutritionScreening,
        appetite_status: formData.appetiteStatus,
      };

      console.log("Submitting data:", submissionData);

      const { error } = await supabase
        .from("dietary_nutritional_records")
        .upsert(submissionData);

      if (error) throw error;

      alert("Dietary assessment saved successfully!");

      // Refresh the history records after saving
      const { data: updatedRecords, error: fetchError } = await supabase
        .from("dietary_nutritional_records")
        .select("*")
        .eq("full_name", decodeURIComponent(patientName))
        .order("date_of_service", { ascending: false });

      if (fetchError) throw fetchError;
      setHistoryRecords(updatedRecords || []);
    } catch (error) {
      console.error("Error saving dietary assessment:", error);
      alert("Error saving dietary assessment. Please try again.");
    }
  };

  const [historyRecords, setHistoryRecords] = useState<
    DietaryNutritionalRecord[]
  >([]);
  const [selectedRecord, setSelectedRecord] =
    useState<DietaryNutritionalRecord | null>(null);

  // Fetch history records when patient changes
  useEffect(() => {
    const fetchHistoryRecords = async () => {
      if (patientName) {
        try {
          const { data: records, error } = await supabase
            .from("dietary_nutritional_records")
            .select("*")
            .eq("full_name", decodeURIComponent(patientName))
            .order("created_at", { ascending: false });

          if (error) throw error;

          // Fetch nurse information for each record
          const recordsWithNurseInfo = await Promise.all(
            (records || []).map(async (record) => {
              if (record.physician_id) {
                const { data: nurseData, error: nurseError } = await supabase
                  .from("nurses")
                  .select("full_name, position")
                  .eq("id", record.physician_id)
                  .single();

                if (!nurseError && nurseData) {
                  return {
                    ...record,
                    physician_name: `${nurseData.full_name}, ${nurseData.position}`,
                  };
                }
              }
              return {
                ...record,
                physician_name: "Unknown",
              };
            })
          );

          setHistoryRecords(recordsWithNurseInfo);
        } catch (error) {
          console.error("Error fetching history records:", error);
        }
      }
    };

    fetchHistoryRecords();
  }, [patientName]);

  const handleViewRecord = (record: DietaryNutritionalRecord) => {
    setSelectedRecord(record);

    // Log the raw record data
    console.log("Raw record data:", record);

    // Convert the record data to match the form structure
    const formDataFromRecord = {
      dietRecall: record.diet_recall || {
        day1: { breakfast: "", lunch: "", dinner: "" },
      },
      waterIntake: {
        amount: record.water_intake?.amount || "",
        temperature: record.water_intake?.temperature || "",
      },
      dietHistory: {
        foodGroups: {
          milk: record.diet_history?.foodGroups?.milk || false,
          fruits: record.diet_history?.foodGroups?.fruits || false,
          meat: record.diet_history?.foodGroups?.meat || false,
          bread: record.diet_history?.foodGroups?.bread || false,
          vegetables: record.diet_history?.foodGroups?.vegetables || false,
          fat: record.diet_history?.foodGroups?.fat || false,
        },
        junkFood: {
          breakfast: record.diet_history?.junkFood?.breakfast || false,
          lunch: record.diet_history?.junkFood?.lunch || false,
          dinner: record.diet_history?.junkFood?.dinner || false,
          reason: record.diet_history?.junkFood?.reason || "",
        },
        fastFood: {
          breakfast: record.diet_history?.fastFood?.breakfast || false,
          lunch: record.diet_history?.fastFood?.lunch || false,
          dinner: record.diet_history?.fastFood?.dinner || false,
          reason: record.diet_history?.fastFood?.reason || "",
        },
        skippedMeals: {
          breakfast: record.diet_history?.skippedMeals?.breakfast || false,
          lunch: record.diet_history?.skippedMeals?.lunch || false,
          dinner: record.diet_history?.skippedMeals?.dinner || false,
          reason: record.diet_history?.skippedMeals?.reason || "",
        },
      },
      malnutritionScreening: {
        weightLoss: record.malnutrition_screening?.weightLoss || "",
        weightLossAmount: record.malnutrition_screening?.weightLossAmount || "",
        appetite: record.malnutrition_screening?.appetite || "",
        foodIntake: record.malnutrition_screening?.foodIntake || "",
        foodIntakeDetails: record.malnutrition_screening?.foodIntakeDetails || "",
        eatingDifficulty: record.malnutrition_screening?.eatingDifficulty || "",
      },
      appetiteStatus: {
        normal: record.appetite_status?.normal || false,
        suppressed: record.appetite_status?.suppressed || false,
        increased: record.appetite_status?.increased || false,
      },
    };

    // Log the processed form data
    console.log("Processed form data:", formDataFromRecord);

    setFormData(formDataFromRecord);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setFormData({
      dietRecall: {
        day1: { breakfast: "", lunch: "", dinner: "" },
      },
      waterIntake: {
        amount: "",
        temperature: "",
      },
      dietHistory: {
        foodGroups: {
          milk: false,
          fruits: false,
          meat: false,
          bread: false,
          vegetables: false,
          fat: false,
        },
        junkFood: {
          breakfast: false,
          lunch: false,
          dinner: false,
          reason: "",
        },
        fastFood: {
          breakfast: false,
          lunch: false,
          dinner: false,
          reason: "",
        },
        skippedMeals: {
          breakfast: false,
          lunch: false,
          dinner: false,
          reason: "",
        },
      },
      malnutritionScreening: {
        weightLoss: "",
        appetite: "",
        foodIntake: "",
        eatingDifficulty: "",
      },
      appetiteStatus: {
        normal: false,
        suppressed: false,
        increased: false,
      },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add delete record function
  const handleDeleteRecord = async (recordId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this record? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("dietary_nutritional_records")
        .delete()
        .eq("id", recordId);

      if (error) {
        console.error("Error deleting record:", error);
        throw error;
      }

      alert("Record deleted successfully!");

      // Fetch updated records after deletion
      if (patientName) {
        const { data: records, error: fetchError } = await supabase
          .from("dietary_nutritional_records")
          .select("*")
          .eq("full_name", decodeURIComponent(patientName))
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        // Fetch nurse information for each record
        const recordsWithNurseInfo = await Promise.all(
          (records || []).map(async (record) => {
            if (record.physician_id) {
              const { data: nurseData, error: nurseError } = await supabase
                .from("nurses")
                .select("full_name, position")
                .eq("id", record.physician_id)
                .single();

              if (!nurseError && nurseData) {
                return {
                  ...record,
                  physician_name: `${nurseData.full_name}, ${nurseData.position}`,
                };
              }
            }
            return {
              ...record,
              physician_name: "Unknown",
            };
          })
        );

        setHistoryRecords(recordsWithNurseInfo);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-800 py-4 sm:py-6 px-4 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go to Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
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
            <h1 className="text-xl sm:text-3xl font-bold text-white">
              Electronic Health Record
            </h1>
            <p className="mt-1 text-sm sm:text-lg text-indigo-200">
              Dietary and Nutritional Assessment
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-indigo-700 px-4 sm:px-8 py-4 sm:py-5">
            <h2 className="text-lg sm:text-2xl font-semibold text-white">
              Dietary and Nutritional Assessment Form
            </h2>
          </div>

          <div className="p-4 sm:p-8">
            {/* Patient Selection */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                  Select Patient
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/patient-information")}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
              <div>
                <p className="text-sm font-medium text-gray-500">Patient Name</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {patientInfo.fullName || "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Service</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {patientInfo.dateOfService}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nurse</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {patientInfo.physician || "Not available"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Appetite Status */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Appetite
                </h3>
                <div className="space-y-2">
                  {[
                    { key: "normal", label: "Normal" },
                    { key: "suppressed", label: "Suppressed" },
                    { key: "increased", label: "Increased" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          formData.appetiteStatus?.[
                            key as keyof typeof formData.appetiteStatus
                          ] || false
                        }
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            appetiteStatus: {
                              ...(prev.appetiteStatus || {
                                normal: false,
                                suppressed: false,
                                increased: false,
                              }),
                              [key]: newValue,
                            },
                          }));
                        }}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Diet Recall */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    DIET RECALL
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const currentDays = Object.keys(formData.dietRecall);
                      const lastDayNumber = parseInt(
                        currentDays[currentDays.length - 1].replace("day", "")
                      );
                      const newDayKey = `day${lastDayNumber + 1}`;
                      setFormData((prev) => ({
                        ...prev,
                        dietRecall: {
                          ...prev.dietRecall,
                          [newDayKey]: { breakfast: "", lunch: "", dinner: "" },
                        },
                      }));
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add Day
                  </button>
                </div>
                {Object.keys(formData.dietRecall).map((day) => (
                  <div
                    key={day}
                    className="mb-6 border border-gray-200 rounded-lg p-4 relative"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Day {day.charAt(3)}</h4>
                      {Object.keys(formData.dietRecall).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const { [day]: removed, ...remainingDays } =
                              formData.dietRecall;
                            setFormData((prev) => ({
                              ...prev,
                              dietRecall: remainingDays,
                            }));
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove Day
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["breakfast", "lunch", "dinner"].map((meal) => (
                        <div key={meal}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {meal}
                          </label>
                          <input
                            type="text"
                            value={formData.dietRecall[day][meal]}
                            onChange={(e) =>
                              handleMealInputChange(day, meal, e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder={`Enter ${meal} details`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Water Intake */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  WATER INTAKE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of glasses per day
                    </label>
                    <input
                      type="number"
                      value={formData.waterIntake.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          waterIntake: {
                            ...prev.waterIntake,
                            amount: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred water temperature
                    </label>
                    <select
                      value={formData.waterIntake.temperature}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          waterIntake: {
                            ...prev.waterIntake,
                            temperature: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select temperature</option>
                      <option value="room">Room temperature</option>
                      <option value="cold">Cold</option>
                      <option value="warm">Warm</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Diet History */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  DIET HISTORY
                </h3>
                <div className="mb-4">
                  <p className="mb-2">
                    Daily consumption of foods from each food group:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {Object.entries({
                      milk: "Milk products",
                      fruits: "Fruits",
                      meat: "Meat",
                      bread: "Bread and cereals",
                      vegetables: "Vegetables",
                      fat: "Fat",
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            formData.dietHistory.foodGroups[
                              key as keyof FoodGroups
                            ]
                          }
                          onChange={(e) =>
                            handleFoodGroupChange(
                              key as keyof FoodGroups,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How often do you take junk food?
                  </label>
                  <input
                    type="text"
                    value={formData.dietHistory.junkFood.reason}
                    onChange={(e) =>
                      handleMealDetailsChange(
                        "junkFood",
                        "reason",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Process/fast foods consumption:{" "}
                    <input
                      type="text"
                      value={formData.dietHistory.fastFood.reason}
                      onChange={(e) =>
                        handleMealDetailsChange(
                          "fastFood",
                          "reason",
                          e.target.value
                        )
                      }
                      className="inline-block w-16 p-1 border border-gray-300 rounded-md"
                    />{" "}
                    times/week
                  </label>
                </div>

                <div className="mb-4">
                  <p className="mb-2">
                    Do you skip meals? If yes, which meals and why?
                  </p>
                  <div className="flex space-x-4 mb-2">
                    {["breakfast", "lunch", "dinner"].map((meal) => (
                      <label key={meal} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            formData.dietHistory.skippedMeals[
                              meal as keyof MealDetails
                            ] as boolean
                          }
                          onChange={(e) =>
                            handleMealDetailsChange(
                              "skippedMeals",
                              meal as keyof MealDetails,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 capitalize">{meal}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.dietHistory.skippedMeals.reason}
                    onChange={(e) =>
                      handleMealDetailsChange(
                        "skippedMeals",
                        "reason",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Specify reason"
                  />
                </div>
              </div>

              {/* Malnutrition Screening */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Malnutrition Screening
                </h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">
                        Have you lost weight recently without trying?
                        <br />
                        {formData.malnutritionScreening.weightLoss === "Yes" && (
                          <span className="text-sm ml-4">
                            How much weight have you lost?
                            <input
                              type="number"
                              value={formData.malnutritionScreening.weightLossAmount || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    weightLossAmount: e.target.value,
                                  },
                                }))
                              }
                              className="ml-2 w-20 p-1 border border-gray-300 rounded-md"
                              placeholder="kg"
                              min="0"
                              step="0.1"
                            />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-4">
                          {["Yes", "No"].map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="radio"
                                checked={
                                  formData.malnutritionScreening.weightLoss ===
                                  option
                                }
                                onChange={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    malnutritionScreening: {
                                      ...prev.malnutritionScreening,
                                      weightLoss: option,
                                      weightLossAmount: option === "No" ? "" : prev.malnutritionScreening.weightLossAmount
                                    },
                                  }))
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{option}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">
                        Have you been eating poorly because of decreased
                        appetite?
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-4">
                          {["Yes", "No"].map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="radio"
                                checked={
                                  formData.malnutritionScreening.appetite ===
                                  option
                                }
                                onChange={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    malnutritionScreening: {
                                      ...prev.malnutritionScreening,
                                      appetite: option,
                                    },
                                  }))
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{option}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">
                        Have you experienced any difficulty in eating?
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-4">
                          {["Yes", "No"].map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="radio"
                                checked={
                                  formData.malnutritionScreening
                                    .eatingDifficulty === option
                                }
                                onChange={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    malnutritionScreening: {
                                      ...prev.malnutritionScreening,
                                      eatingDifficulty: option,
                                    },
                                  }))
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{option}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">
                        Do you have any allergies?
                        <br />
                        {formData.malnutritionScreening.foodIntake === "Yes" && (
                          <span className="text-sm ml-4">
                            If yes, specify:
                            <input
                              type="text"
                              value={formData.malnutritionScreening.foodIntakeDetails || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    foodIntakeDetails: e.target.value,
                                  },
                                }))
                              }
                              className="ml-2 w-48 p-1 border border-gray-300 rounded-md"
                              placeholder="Specify allergies"
                            />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-4">
                          {["Yes", "No"].map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="radio"
                                checked={
                                  formData.malnutritionScreening.foodIntake ===
                                  option
                                }
                                onChange={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    malnutritionScreening: {
                                      ...prev.malnutritionScreening,
                                      foodIntake: option,
                                      foodIntakeDetails: option === "No" ? "" : prev.malnutritionScreening.foodIntakeDetails
                                    },
                                  }))
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{option}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Form Actions */}
              <div className="border-t border-gray-200 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => router.push(`/`)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* History Table */}
        {historyRecords.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
                Assessment History
              </h2>
              <button
                onClick={handleNewRecord}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                New Record
              </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Nurse
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyRecords.map((record) => (
                      <tr
                        key={record.id}
                        className={
                          selectedRecord?.id === record.id ? "bg-indigo-50" : ""
                        }
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.date_of_service).toLocaleDateString()}{" "}
                          at {new Date(record.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.physician_name}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
