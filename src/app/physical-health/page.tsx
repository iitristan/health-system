"use client";

import { useState, useEffect, useRef, type ReactElement } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { NextPage } from "next";
import { useSession } from "@/app/context/SessionContext";
import { Suspense } from "react";

type Activity = {
  name: string;
  does: boolean;
  frequency: string;
};

type LabResults = {
  cbc: {
    hemoglobin: string;
    hematocrit: string;
    rbc: string;
    wbc: string;
    platelets: string;
  };
  electrolytes: {
    sodium: string;
    potassium: string;
    calcium: string;
    magnesium: string;
  };
  proteinNutrition: {
    albumin: string;
    globulin: string;
    totalProtein: string;
    directBilirubin: string;
    indirectBilirubin: string;
    totalBilirubin: string;
  };
  glucoseMetabolism: {
    glucose: string;
    urea: string;
    creatinine: string;
    cholesterolTotal: string;
    cholesterolHDL: string;
    cholesterolLDL: string;
    triglycerides: string;
    hemoglobinA1C: string;
  };
};

interface BMIRange {
  age: number;
  boys: {
    normal: { min: number; max: number };
    severelyUnderweight: number;
    severelyOverweight: number;
    underweight: { min: number; max: number };
    overweight: { min: number; max: number };
  };
  girls: {
    normal: { min: number; max: number };
    severelyUnderweight: number;
    severelyOverweight: number;
    underweight: { min: number; max: number };
    overweight: { min: number; max: number };
  };
}

const bmiRanges: BMIRange[] = [
  {
    age: 6,
    boys: {
      normal: { min: 13.2, max: 18.8 },
      severelyUnderweight: 12.8,
      severelyOverweight: 21.5,
      underweight: { min: 12.9, max: 13.1 },
      overweight: { min: 18.9, max: 21.4 },
    },
    girls: {
      normal: { min: 12.9, max: 18.3 },
      severelyUnderweight: 12.6,
      severelyOverweight: 20.6,
      underweight: { min: 12.7, max: 12.8 },
      overweight: { min: 18.4, max: 20.5 },
    },
  },
  {
    age: 7,
    boys: {
      normal: { min: 13.4, max: 19.8 },
      severelyUnderweight: 13.0,
      severelyOverweight: 23.1,
      underweight: { min: 13.1, max: 13.3 },
      overweight: { min: 19.9, max: 23.0 },
    },
    girls: {
      normal: { min: 13.2, max: 19.1 },
      severelyUnderweight: 12.8,
      severelyOverweight: 21.9,
      underweight: { min: 12.9, max: 13.1 },
      overweight: { min: 19.2, max: 21.8 },
    },
  },
  {
    age: 8,
    boys: {
      normal: { min: 13.7, max: 20.9 },
      severelyUnderweight: 13.2,
      severelyOverweight: 24.7,
      underweight: { min: 13.3, max: 13.6 },
      overweight: { min: 21.0, max: 24.6 },
    },
    girls: {
      normal: { min: 13.5, max: 20.1 },
      severelyUnderweight: 13.1,
      severelyOverweight: 23.2,
      underweight: { min: 13.2, max: 13.4 },
      overweight: { min: 20.2, max: 23.1 },
    },
  },
  {
    age: 9,
    boys: {
      normal: { min: 13.9, max: 21.8 },
      severelyUnderweight: 13.5,
      severelyOverweight: 26.1,
      underweight: { min: 13.6, max: 13.8 },
      overweight: { min: 21.9, max: 26.0 },
    },
    girls: {
      normal: { min: 13.8, max: 21.0 },
      severelyUnderweight: 13.4,
      severelyOverweight: 24.5,
      underweight: { min: 13.5, max: 13.7 },
      overweight: { min: 21.1, max: 24.4 },
    },
  },
  {
    age: 10,
    boys: {
      normal: { min: 14.2, max: 22.7 },
      severelyUnderweight: 13.8,
      severelyOverweight: 27.4,
      underweight: { min: 13.9, max: 14.1 },
      overweight: { min: 22.8, max: 27.3 },
    },
    girls: {
      normal: { min: 14.2, max: 21.9 },
      severelyUnderweight: 13.7,
      severelyOverweight: 25.7,
      underweight: { min: 13.8, max: 14.1 },
      overweight: { min: 22.0, max: 25.6 },
    },
  },
  {
    age: 11,
    boys: {
      normal: { min: 14.6, max: 23.6 },
      severelyUnderweight: 14.1,
      severelyOverweight: 28.4,
      underweight: { min: 14.2, max: 14.5 },
      overweight: { min: 23.7, max: 28.3 },
    },
    girls: {
      normal: { min: 14.5, max: 22.7 },
      severelyUnderweight: 14.1,
      severelyOverweight: 26.7,
      underweight: { min: 14.2, max: 14.4 },
      overweight: { min: 22.8, max: 26.6 },
    },
  },
  {
    age: 12,
    boys: {
      normal: { min: 14.9, max: 24.3 },
      severelyUnderweight: 14.4,
      severelyOverweight: 29.3,
      underweight: { min: 14.5, max: 14.8 },
      overweight: { min: 24.4, max: 29.2 },
    },
    girls: {
      normal: { min: 14.9, max: 23.4 },
      severelyUnderweight: 14.4,
      severelyOverweight: 27.6,
      underweight: { min: 14.5, max: 14.8 },
      overweight: { min: 23.5, max: 27.5 },
    },
  },
];

interface PhysicalHealthRecord {
  id: string;
  patient_name: string;
  physician_name: string;
  date_of_service: string;
  created_at: string;
  lab_results_url?: string;
  other_images_urls?: string[];
  exercise_regularly: string;
  medical_conditions: string;
  medical_conditions_specify: string;
  activities: Array<{ name: string; does: boolean; frequency: string }>;
  posture: string;
  cleanliness: string;
  eyes_normal: boolean;
  pale_conjunctiva: { present: boolean; severity: string };
  dry_eyes: { present: boolean; frequency: string };
  muscle_mass_normal: boolean;
  loss_of_muscle_mass: string;
  weakness: string;
  localized_weakness: string;
  associated_symptoms: string[];
  possible_causes: string[];
  height: string;
  weight: string;
  bmi: string;
  body_build: string;
  signs_of_distress: string[];
  mood_behavior: string;
  hemoglobin?: string;
  hematocrit?: string;
  rbc_count?: string;
  wbc_count?: string;
  platelets_count?: string;
  sodium?: string;
  potassium?: string;
  calcium?: string;
  magnesium?: string;
  albumin?: string;
  globulin?: string;
  total_protein?: string;
  direct_bilirubin?: string;
  indirect_bilirubin?: string;
  total_bilirubin?: string;
  glucose?: string;
  urea?: string;
  creatinine?: string;
  cholesterol_total?: string;
  cholesterol_hdl?: string;
  cholesterol_ldl?: string;
  triglycerides?: string;
  hemoglobin_a1c?: string;
  oral_health?: {
    healthy: boolean;
    foulOdor: boolean;
    swollenGums: string;
    bleedingGums: string;
    mouthUlcers: string;
  };
  nasal_discharge?: string;
  mucus_color?: string;
  mucus_consistency?: string;
  nose_shape?: string;
  nasal_obstruction?: string;
  external_ear?: string[];
  ear_canal?: string;
  hearing?: string;
}

const PhysicalHealthPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PhysicalHealthPageContent />
    </Suspense>
  );
};

const PhysicalHealthPageContent = (): ReactElement => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const { selectedNurse } = useSession();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PhysicalHealthRecord>({
    id: "",
    patient_name: "",
    physician_name: "",
    date_of_service: "",
    created_at: "",
    lab_results_url: "",
    other_images_urls: [],
    exercise_regularly: "",
    medical_conditions: "",
    medical_conditions_specify: "",
    activities: [
      { name: "Walking", does: false, frequency: "" },
      { name: "Running", does: false, frequency: "" },
      { name: "Bicycle", does: false, frequency: "" },
      { name: "Stretching", does: false, frequency: "" },
      { name: "Dancing", does: false, frequency: "" },
    ],
    posture: "",
    cleanliness: "",
    eyes_normal: false,
    pale_conjunctiva: { present: false, severity: "" },
    dry_eyes: { present: false, frequency: "" },
    muscle_mass_normal: false,
    loss_of_muscle_mass: "",
    weakness: "",
    localized_weakness: "",
    associated_symptoms: [],
    possible_causes: [],
    height: "",
    weight: "",
    bmi: "",
    body_build: "",
    signs_of_distress: [],
    mood_behavior: "",
    hemoglobin: "",
    hematocrit: "",
    rbc_count: "",
    wbc_count: "",
    platelets_count: "",
    sodium: "",
    potassium: "",
    calcium: "",
    magnesium: "",
    albumin: "",
    globulin: "",
    total_protein: "",
    direct_bilirubin: "",
    indirect_bilirubin: "",
    total_bilirubin: "",
    glucose: "",
    urea: "",
    creatinine: "",
    cholesterol_total: "",
    cholesterol_hdl: "",
    cholesterol_ldl: "",
    triglycerides: "",
    hemoglobin_a1c: "",
    oral_health: {
      healthy: false,
      foulOdor: false,
      swollenGums: "",
      bleedingGums: "",
      mouthUlcers: "",
    },
    nasal_discharge: "",
    mucus_color: "",
    mucus_consistency: "",
    nose_shape: "",
    nasal_obstruction: "",
    external_ear: [],
    ear_canal: "",
    hearing: "",
  });
  const [labResultsFile, setLabResultsFile] = useState<File | null>(null);
  const [otherImagesFiles, setOtherImagesFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLabResultsUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);

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
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedPatient}-lab-results-${Date.now()}.${fileExt}`;
      const filePath = `lab-results/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("tpr-sheets") // Changed from 'physical-health' to 'tpr-sheets'
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("tpr-sheets") // Changed from 'physical-health' to 'tpr-sheets'
        .getPublicUrl(filePath);

      // Update form data with the file URL
      setFormData((prev) => ({
        ...prev,
        lab_results_url: publicUrl,
      }));

      // Show success message
      alert("Lab results uploaded successfully!");
    } catch (error) {
      console.error("Error uploading lab results:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload lab results"
      );
      alert("Failed to upload lab results. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOtherImagesUpload = async (files: File[]) => {
    try {
      setIsUploading(true);
      setError(null);

      const uploadedUrls: string[] = [];

      for (const file of files) {
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
        const fileExt = file.name.split(".").pop();
        const fileName = `${selectedPatient}-other-${Date.now()}-${file.name}`;
        const filePath = `other-images/${fileName}`;

        // Upload file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from("tpr-sheets") // Changed from 'physical-health' to 'tpr-sheets'
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("tpr-sheets") // Changed from 'physical-health' to 'tpr-sheets'
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // Update form data with the file URLs
      setFormData((prev) => ({
        ...prev,
        other_images_urls: [...prev.other_images_urls, ...uploadedUrls],
      }));

      // Show success message
      alert("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading other images:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload images"
      );
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

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
    age: "",
    gender: "",
  });

  // Add effect to update physician info when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      setPatientInfo((prev) => ({
        ...prev,
        physician: `${selectedNurse.full_name}, ${selectedNurse.position}`,
      }));
    }
  }, [selectedNurse]);

  // Fetch patient info when patientName changes
  useEffect(() => {
    const fetchPatientInfo = async () => {
      if (patientName) {
        try {
          const { data: patientData, error } = await supabase
            .from("patients")
            .select("full_name, age, gender")
            .eq("full_name", decodeURIComponent(patientName))
            .single();

          if (error) throw error;

          if (patientData) {
            setPatientInfo((prev) => ({
              ...prev,
              fullName: patientData.full_name,
              age: patientData.age || "N/A",
              gender: patientData.gender || "N/A",
              physician: selectedNurse
                ? `${selectedNurse.full_name}, ${selectedNurse.position}`
                : "N/A",
            }));
          }
        } catch (error) {
          console.error("Error fetching patient info:", error);
        }
      }
    };

    fetchPatientInfo();
  }, [patientName, selectedNurse]);

  // Only redirect if we're on the main physical health page without a patient
  useEffect(() => {
    if (!selectedNurse && !patientName) {
      alert("Please select a staff from the dashboard first.");
      router.push("/");
    }
  }, [selectedNurse, patientName, router]);

  const [patients, setPatients] = useState<Array<{ full_name: string }>>([]);

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
              age: patientData.age,
              gender: patientData.gender,
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

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(
        `/physical-health?patient=${encodeURIComponent(selectedName)}`
      );
    } else {
      router.push("/physical-health");
    }
  };

  // Physical Activity Level
  const [exerciseRegularly, setExerciseRegularly] = useState<string>("");
  const [medicalConditions, setMedicalConditions] = useState<string>("");
  const [medicalConditionsSpecify, setMedicalConditionsSpecify] =
    useState<string>("");
  const [activities, setActivities] = useState<Activity[]>([
    { name: "Walking", does: false, frequency: "" },
    { name: "Running", does: false, frequency: "" },
    { name: "Bicycle", does: false, frequency: "" },
    { name: "Stretching", does: false, frequency: "" },
    { name: "Dancing", does: false, frequency: "" },
  ]);

  // General Appearance
  const [posture, setPosture] = useState<string>("");
  const [cleanliness, setCleanliness] = useState<string>("");

  // Physical Findings
  const [eyesNormal, setEyesNormal] = useState<boolean>(true);
  const [paleConjunctiva, setPaleConjunctiva] = useState<{
    present: boolean;
    severity: string;
  }>({ present: false, severity: "" });
  const [dryEyes, setDryEyes] = useState<{
    present: boolean;
    frequency: string;
  }>({ present: false, frequency: "" });

  const [muscleMassNormal, setMuscleMassNormal] = useState<boolean>(true);
  const [lossOfMuscleMass, setLossOfMuscleMass] = useState<string>("");
  const [weakness, setWeakness] = useState<string>("");
  const [localizedWeakness, setLocalizedWeakness] = useState<string>("");
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([]);
  const [possibleCauses, setPossibleCauses] = useState<string[]>([]);

  // Lab Results
  const [labResults, setLabResults] = useState<LabResults>({
    cbc: {
      hemoglobin: "",
      hematocrit: "",
      rbc: "",
      wbc: "",
      platelets: "",
    },
    electrolytes: {
      sodium: "",
      potassium: "",
      calcium: "",
      magnesium: "",
    },
    proteinNutrition: {
      albumin: "",
      globulin: "",
      totalProtein: "",
      directBilirubin: "",
      indirectBilirubin: "",
      totalBilirubin: "",
    },
    glucoseMetabolism: {
      glucose: "",
      urea: "",
      creatinine: "",
      cholesterolTotal: "",
      cholesterolHDL: "",
      cholesterolLDL: "",
      triglycerides: "",
      hemoglobinA1C: "",
    },
  });

  // Anthropometric Data
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [bmi, setBmi] = useState<string>("");
  const [bodyBuild, setBodyBuild] = useState<string>("");
  const [signsOfDistress, setSignsOfDistress] = useState<string[]>([]);
  const [moodBehavior, setMoodBehavior] = useState<string>("");

  // Oral Health
  const [oralHealth, setOralHealth] = useState({
    healthy: true,
    foulOdor: false,
    swollenGums: "",
    bleedingGums: "",
    mouthUlcers: "",
  });

  // Nose
  const [nasalDischarge, setNasalDischarge] = useState<string>("");
  const [mucusColor, setMucusColor] = useState<string>("");
  const [mucusConsistency, setMucusConsistency] = useState<string>("");
  const [noseShape, setNoseShape] = useState<string>("");
  const [nasalObstruction, setNasalObstruction] = useState<string>("");

  // Ears
  const [externalEar, setExternalEar] = useState<string[]>([]);
  const [earCanal, setEarCanal] = useState<string>("");
  const [hearing, setHearing] = useState<string>("");

  // Helper functions
  const toggleActivity = (index: number) => {
    const newActivities = [...activities];
    newActivities[index].does = !newActivities[index].does;
    setActivities(newActivities);
  };

  const setActivityFrequency = (index: number, frequency: string) => {
    const newActivities = [...activities];
    newActivities[index].frequency = frequency;
    setActivities(newActivities);
  };

  const toggleArrayItem = (
    array: string[],
    item: string,
    setter: (val: string[]) => void
  ) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      alert("Please select a patient first");
      return;
    }

    try {
      const { error } = await supabase.from("physical_health_records").insert({
        full_name: selectedPatient,
        physician_id: selectedNurse?.id || "00000000-0000-0000-0000-000000000000",
        date_of_service: new Date().toISOString(), // Use current date and time
        // Physical Activity Level
        exercise_regularly: exerciseRegularly || null,
        medical_conditions: medicalConditions || null,
        medical_conditions_specify: medicalConditionsSpecify || null,
        activities: activities || null,
        // General Appearance
        posture: posture || null,
        cleanliness: cleanliness || null,
        // Physical Findings
        eyes_normal: eyesNormal || null,
        pale_conjunctiva: paleConjunctiva || null,
        dry_eyes: dryEyes || null,
        muscle_mass_normal: muscleMassNormal || null,
        loss_of_muscle_mass: lossOfMuscleMass || null,
        weakness: weakness || null,
        localized_weakness: localizedWeakness || null,
        associated_symptoms: associatedSymptoms || null,
        possible_causes: possibleCauses || null,
        // Lab Results - Complete Blood Count (CBC)
        hemoglobin: labResults.cbc.hemoglobin || null,
        hematocrit: labResults.cbc.hematocrit || null,
        rbc_count: labResults.cbc.rbc || null,
        wbc_count: labResults.cbc.wbc || null,
        platelets_count: labResults.cbc.platelets || null,
        // Lab Results - Electrolytes
        sodium: labResults.electrolytes.sodium || null,
        potassium: labResults.electrolytes.potassium || null,
        calcium: labResults.electrolytes.calcium || null,
        magnesium: labResults.electrolytes.magnesium || null,
        // Lab Results - Protein and Nutrition
        albumin: labResults.proteinNutrition.albumin || null,
        globulin: labResults.proteinNutrition.globulin || null,
        total_protein: labResults.proteinNutrition.totalProtein || null,
        direct_bilirubin: labResults.proteinNutrition.directBilirubin || null,
        indirect_bilirubin:
          labResults.proteinNutrition.indirectBilirubin || null,
        total_bilirubin: labResults.proteinNutrition.totalBilirubin || null,
        // Lab Results - Glucose and Metabolism
        glucose: labResults.glucoseMetabolism.glucose || null,
        urea: labResults.glucoseMetabolism.urea || null,
        creatinine: labResults.glucoseMetabolism.creatinine || null,
        cholesterol_total:
          labResults.glucoseMetabolism.cholesterolTotal || null,
        cholesterol_hdl: labResults.glucoseMetabolism.cholesterolHDL || null,
        cholesterol_ldl: labResults.glucoseMetabolism.cholesterolLDL || null,
        triglycerides: labResults.glucoseMetabolism.triglycerides || null,
        hemoglobin_a1c: labResults.glucoseMetabolism.hemoglobinA1C || null,
        // Anthropometric Data
        height: height || null,
        weight: weight || null,
        bmi: bmi || null,
        body_build: bodyBuild || null,
        signs_of_distress: signsOfDistress || null,
        mood_behavior: moodBehavior || null,
        // Oral Health
        oral_health: oralHealth || null,
        // Nose
        nasal_discharge: nasalDischarge || null,
        mucus_color: mucusColor || null,
        mucus_consistency: mucusConsistency || null,
        nose_shape: noseShape || null,
        nasal_obstruction: nasalObstruction || null,
        // Ears
        external_ear: externalEar || null,
        ear_canal: earCanal || null,
        hearing: hearing || null,
        // File uploads
        lab_results_url: formData.lab_results_url || null,
        other_images_urls: formData.other_images_urls || null,
      });

      if (error) throw error;

      alert("Record saved successfully!");
      // Reset all form fields
      handleNewRecord();
      // Refresh the history records
      await fetchHistoryRecords();
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Failed to save record. Please try again.");
    }
  };

  // Add these functions
  const calculateBMI = (height: string, weight: string) => {
    if (!height || !weight) return "";

    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);

    if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters <= 0) return "";

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  // Update BMI whenever height or weight changes
  useEffect(() => {
    if (height && weight) {
      const newBMI = calculateBMI(height, weight);
      setBmi(newBMI);
    }
  }, [height, weight]);

  const getBMIStatus = (bmi: string) => {
    if (!bmi || !patientInfo.age || !patientInfo.gender)
      return { status: "", color: "", intervention: "" };

    const bmiNum = parseFloat(bmi);
    const ageNum = parseInt(patientInfo.age);
    const range = bmiRanges.find((r) => r.age === ageNum);

    if (!range) return { status: "", color: "", intervention: "" };

    const genderRange =
      patientInfo.gender === "male" ? range.boys : range.girls;

    if (bmiNum <= genderRange.severelyUnderweight) {
      return {
        status: "Severely Underweight",
        color: "bg-red-100 text-red-800",
        intervention:
          "Monitor weight, height, and BMI; assess medical history and nutrition status. Enroll in school feeding programs; provide high-calorie, nutritious snacks; encourage balanced meals. Teach children and families about proper nutrition and healthy eating habits. Check for emotional issues; prevent bullying; involve parents and caregivers. Monitor progress regularly and refer to health professionals if needed.",
      };
    }

    if (bmiNum >= genderRange.severelyOverweight) {
      return {
        status: "Severely Overweight",
        color: "bg-red-100 text-red-800",
        intervention:
          "Assess BMI and lifestyle habits regularly. Promote healthy eating and portion control. Encourage daily physical activity and reduce screen time. Involve parents and teachers in supporting healthy routines. Address emotional concerns like low self-esteem or bullying. Monitor progress and refer to health professionals if needed.",
      };
    }

    if (
      bmiNum >= genderRange.underweight.min &&
      bmiNum <= genderRange.underweight.max
    ) {
      return {
        status: "Underweight",
        color: "bg-yellow-100 text-yellow-800",
        intervention:
          "Evaluate diet and health history for possible causes (e.g., poor appetite, illness). Promote balanced, nutrient-rich meals through health teaching. Encourage healthy snacks and regular meal schedules. Coordinate with feeding programs (e.g., school lunches, milk feeding). Involve parents in planning improved home nutrition. Monitor weight regularly (monthly or quarterly). Refer to healthcare providers if weight does not improve or if underlying issues are suspected.",
      };
    }

    if (
      bmiNum >= genderRange.overweight.min &&
      bmiNum <= genderRange.overweight.max
    ) {
      return {
        status: "Overweight",
        color: "bg-yellow-100 text-yellow-800",
        intervention:
          "Assess BMI and health status using growth charts. Identify eating and activity patterns through interviews or questionnaires. Promote healthy eating habits – encourage fruits, vegetables, whole grains, and limit sugary/junk foods. Encourage regular physical activity, aim for at least 60 minutes daily. Educate on healthy screen time limits – no more than 2 hours/day. Collaborate with parents and teachers to support healthy behaviors at school and home. Monitor progress with regular follow-up on BMI and behavior changes. Refer to professionals like dietitians or doctors if needed.",
      };
    }

    if (bmiNum >= genderRange.normal.min && bmiNum <= genderRange.normal.max) {
      return {
        status: "Normal",
        color: "bg-green-100 text-green-800",
        intervention:
          "Maintain current healthy habits. Continue regular physical activity and balanced diet. Regular monitoring of growth and development is recommended.",
      };
    }

    return { status: "", color: "", intervention: "" };
  };

  const [historyRecords, setHistoryRecords] = useState<PhysicalHealthRecord[]>(
    []
  );
  const [selectedRecord, setSelectedRecord] =
    useState<PhysicalHealthRecord | null>(null);

  // Move fetchHistoryRecords outside of useEffect
  const fetchHistoryRecords = async () => {
    if (patientName) {
      try {
        const { data: records, error } = await supabase
          .from("physical_health_records")
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

  // Update useEffect to use the moved function
  useEffect(() => {
    fetchHistoryRecords();
  }, [patientName]);

  const handleViewRecord = (record: PhysicalHealthRecord) => {
    setSelectedRecord(record);

    // Update all the individual state variables
    setExerciseRegularly(record.exercise_regularly || "");
    setMedicalConditions(record.medical_conditions || "");
    setMedicalConditionsSpecify(record.medical_conditions_specify || "");
    setActivities(
      record.activities || [
        { name: "Walking", does: false, frequency: "" },
        { name: "Running", does: false, frequency: "" },
        { name: "Bicycle", does: false, frequency: "" },
        { name: "Stretching", does: false, frequency: "" },
        { name: "Dancing", does: false, frequency: "" },
      ]
    );
    setPosture(record.posture || "");
    setCleanliness(record.cleanliness || "");
    setEyesNormal(record.eyes_normal || false);
    setPaleConjunctiva(
      record.pale_conjunctiva || { present: false, severity: "" }
    );
    setDryEyes(record.dry_eyes || { present: false, frequency: "" });
    setMuscleMassNormal(record.muscle_mass_normal || false);
    setLossOfMuscleMass(record.loss_of_muscle_mass || "");
    setWeakness(record.weakness || "");
    setLocalizedWeakness(record.localized_weakness || "");
    setAssociatedSymptoms(record.associated_symptoms || []);
    setPossibleCauses(record.possible_causes || []);
    setHeight(record.height || "");
    setWeight(record.weight || "");
    setBmi(record.bmi || "");
    setBodyBuild(record.body_build || "");
    setSignsOfDistress(record.signs_of_distress || []);
    setMoodBehavior(record.mood_behavior || "");

    // Update lab results
    setLabResults({
      cbc: {
        hemoglobin: record.hemoglobin || "",
        hematocrit: record.hematocrit || "",
        rbc: record.rbc_count || "",
        wbc: record.wbc_count || "",
        platelets: record.platelets_count || "",
      },
      electrolytes: {
        sodium: record.sodium || "",
        potassium: record.potassium || "",
        calcium: record.calcium || "",
        magnesium: record.magnesium || "",
      },
      proteinNutrition: {
        albumin: record.albumin || "",
        globulin: record.globulin || "",
        totalProtein: record.total_protein || "",
        directBilirubin: record.direct_bilirubin || "",
        indirectBilirubin: record.indirect_bilirubin || "",
        totalBilirubin: record.total_bilirubin || "",
      },
      glucoseMetabolism: {
        glucose: record.glucose || "",
        urea: record.urea || "",
        creatinine: record.creatinine || "",
        cholesterolTotal: record.cholesterol_total || "",
        cholesterolHDL: record.cholesterol_hdl || "",
        cholesterolLDL: record.cholesterol_ldl || "",
        triglycerides: record.triglycerides || "",
        hemoglobinA1C: record.hemoglobin_a1c || "",
      },
    });

    // Update oral health
    setOralHealth(
      record.oral_health || {
        healthy: false,
        foulOdor: false,
        swollenGums: "",
        bleedingGums: "",
        mouthUlcers: "",
      }
    );

    // Update nose data
    setNasalDischarge(record.nasal_discharge || "");
    setMucusColor(record.mucus_color || "");
    setMucusConsistency(record.mucus_consistency || "");
    setNoseShape(record.nose_shape || "");
    setNasalObstruction(record.nasal_obstruction || "");

    // Update ear data
    setExternalEar(record.external_ear || []);
    setEarCanal(record.ear_canal || "");
    setHearing(record.hearing || "");

    // Update form data
    setFormData({
      ...record,
      lab_results_url: record.lab_results_url || "",
      other_images_urls: record.other_images_urls || [],
      activities: record.activities || [
        { name: "Walking", does: false, frequency: "" },
        { name: "Running", does: false, frequency: "" },
        { name: "Bicycle", does: false, frequency: "" },
        { name: "Stretching", does: false, frequency: "" },
        { name: "Dancing", does: false, frequency: "" },
      ],
      associated_symptoms: record.associated_symptoms || [],
      possible_causes: record.possible_causes || [],
      signs_of_distress: record.signs_of_distress || [],
      external_ear: record.external_ear || [],
      oral_health: {
        healthy: record.oral_health?.healthy || false,
        foulOdor: record.oral_health?.foulOdor || false,
        swollenGums: record.oral_health?.swollenGums || "",
        bleedingGums: record.oral_health?.bleedingGums || "",
        mouthUlcers: record.oral_health?.mouthUlcers || "",
      },
    });

    // Scroll to the top of the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleNewRecord = () => {
    // Clear all form fields
    setExerciseRegularly(""); // Reset to unselected
    setMedicalConditions(""); // Reset to unselected
    setMedicalConditionsSpecify("");
    setActivities([
      { name: "Walking", does: false, frequency: "" },
      { name: "Running", does: false, frequency: "" },
      { name: "Bicycle", does: false, frequency: "" },
      { name: "Stretching", does: false, frequency: "" },
      { name: "Dancing", does: false, frequency: "" },
    ]);
    setPosture(""); // Reset to unselected
    setCleanliness(""); // Reset to unselected

    // Reset eyes to unselected state
    setEyesNormal(false); // Changed from true to false
    setPaleConjunctiva({ present: false, severity: "" });
    setDryEyes({ present: false, frequency: "" });

    // Reset muscle mass to unselected state
    setMuscleMassNormal(false); // Changed from true to false
    setLossOfMuscleMass("");
    setWeakness("");
    setLocalizedWeakness("");
    setAssociatedSymptoms([]); // Clear all selected symptoms
    setPossibleCauses([]); // Clear all selected causes

    setHeight("");
    setWeight("");
    setBmi("");
    setBodyBuild(""); // Reset to unselected
    setSignsOfDistress([]); // Clear all selected signs
    setMoodBehavior(""); // Reset to unselected

    // Clear lab results - reset all to unselected
    setLabResults({
      cbc: {
        hemoglobin: "",
        hematocrit: "",
        rbc: "",
        wbc: "",
        platelets: "",
      },
      electrolytes: {
        sodium: "",
        potassium: "",
        calcium: "",
        magnesium: "",
      },
      proteinNutrition: {
        albumin: "",
        globulin: "",
        totalProtein: "",
        directBilirubin: "",
        indirectBilirubin: "",
        totalBilirubin: "",
      },
      glucoseMetabolism: {
        glucose: "",
        urea: "",
        creatinine: "",
        cholesterolTotal: "",
        cholesterolHDL: "",
        cholesterolLDL: "",
        triglycerides: "",
        hemoglobinA1C: "",
      },
    });

    // Reset oral health to unselected state
    setOralHealth({
      healthy: false, // Changed from true to false
      foulOdor: false,
      swollenGums: "",
      bleedingGums: "",
      mouthUlcers: "",
    });

    // Reset nose data to unselected state
    setNasalDischarge("");
    setMucusColor("");
    setMucusConsistency("");
    setNoseShape("");
    setNasalObstruction("");

    // Reset ear data to unselected state
    setExternalEar([]);
    setEarCanal("");
    setHearing("");

    // Clear selected record
    setSelectedRecord(null);

    // Scroll to the top of the form
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
        .from("physical_health_records")
        .delete()
        .eq("id", recordId);

      if (error) {
        console.error("Error deleting record:", error);
        throw error;
      }

      alert("Record deleted successfully!");
      await fetchHistoryRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record. Please try again.");
    }
  };

  const handleDownloadFile = async (
    url: string | undefined,
    fileName: string
  ) => {
    if (!url) {
      alert("No file URL provided");
      return;
    }

    try {
      setIsDownloading(true);

      // Extract the file path from the URL
      // The URL format is typically: https://<domain>/storage/v1/object/public/<bucket>/<path>
      const pathMatch = url.match(/public\/([^/]+)\/(.+)$/);
      if (!pathMatch) {
        throw new Error("Invalid file URL format");
      }

      const [, bucket, filePath] = pathMatch;

      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);

      if (error) {
        console.error("Storage error:", error);
        throw new Error(`Failed to download file: ${error.message}`);
      }

      if (!data) {
        throw new Error("No file data received");
      }

      // Create a download URL for the blob
      const blob = new Blob([data], { type: data.type });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      alert("File downloaded successfully!");
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error downloading file. Please try again."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
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
            <p className="mt-1 text-lg text-indigo-200">
              Physical and Health Status Assessment
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
              Physical and Health Status Assessment Form
            </h2>
          </div>

          <div className="px-4">
            {/* Patient Selection */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Patient
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/patient-information")}
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
            {selectedPatient && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Patient Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date of Service
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.dateOfService}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nurse</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.physician}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.age || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.gender || "Not specified"}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Physical Activity Level */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-gray-200">
                  PHYSICAL ACTIVITY LEVEL
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">
                      1. Do you exercise regularly?
                    </p>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="exerciseRegularly"
                          checked={exerciseRegularly === "Yes"}
                          onChange={() => setExerciseRegularly("Yes")}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="exerciseRegularly"
                          checked={exerciseRegularly === "No"}
                          onChange={() => setExerciseRegularly("No")}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">No</span>
                      </label>
                    </div>
                  </div>

                  {exerciseRegularly === "Yes" && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Activity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Frequency
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activities.map((activity, index) => (
                            <tr key={activity.name}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {activity.name}
                                  </div>
                                  <div className="ml-4 flex space-x-4">
                                    <label className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={activity.does}
                                        onChange={() => toggleActivity(index)}
                                        className="h-4 w-4 text-blue-600"
                                      />
                                      <span className="ml-2">Yes</span>
                                    </label>
                                    <label className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={!activity.does}
                                        onChange={() => toggleActivity(index)}
                                        className="h-4 w-4 text-blue-600"
                                      />
                                      <span className="ml-2">No</span>
                                    </label>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {activity.does && (
                                  <div className="flex space-x-4">
                                    {[
                                      "Daily or almost daily",
                                      "3-5 times weekly",
                                      "1-2 times weekly",
                                    ].map((freq) => (
                                      <label
                                        key={freq}
                                        className="flex items-center"
                                      >
                                        <input
                                          type="radio"
                                          name={`frequency-${activity.name}`}
                                          checked={activity.frequency === freq}
                                          onChange={() =>
                                            setActivityFrequency(index, freq)
                                          }
                                          className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-2">{freq}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div>
                    <p className="font-medium mb-2">
                      2. Are there any medical conditions that preclude you from
                      exercising?
                    </p>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="medicalConditions"
                          checked={medicalConditions === "Yes"}
                          onChange={() => setMedicalConditions("Yes")}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="medicalConditions"
                          checked={medicalConditions === "No"}
                          onChange={() => setMedicalConditions("No")}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">No</span>
                      </label>
                    </div>
                    {medicalConditions === "Yes" && (
                      <div className="mt-2">
                        <label className="block font-medium mb-1">
                          Specify:
                        </label>
                        <input
                          type="text"
                          value={medicalConditionsSpecify}
                          onChange={(e) =>
                            setMedicalConditionsSpecify(e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* General Appearance */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-gray-200">
                  GENERAL APPEARANCE
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Posture:</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        "Healthy",
                        "Kyphosis",
                        "Flat back",
                        "Swayback",
                        "Forward head",
                      ].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="posture"
                            checked={posture === option}
                            onChange={() => setPosture(option)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Cleanliness:</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        "Clean",
                        "Unkempt",
                        "Dirt buildup",
                        "Excessive sweating",
                        "Body odor",
                      ].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="cleanliness"
                            checked={cleanliness === option}
                            onChange={() => setCleanliness(option)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Findings */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-gray-200">
                  PHYSICAL FINDINGS
                </h2>

                {/* Eyes */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium  mb-4">Eyes:</h3>
                  <div className="flex items-start space-x-8">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={eyesNormal}
                        onChange={() => setEyesNormal(!eyesNormal)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 ">Normal</span>
                    </div>

                    <div className="flex-1">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Visual Acuity
                          </p>
                          <div className="flex space-x-8">
                            <div>
                              <p className="text-sm mb-2">Pale conjunctiva</p>
                              <div className="flex space-x-4">
                                {["Mild", "Moderate", "Severe"].map(
                                  (severity) => (
                                    <label
                                      key={severity}
                                      className="flex items-center"
                                    >
                                      <input
                                        type="radio"
                                        name="paleConjunctivaSeverity"
                                        checked={
                                          paleConjunctiva.severity === severity
                                        }
                                        onChange={() =>
                                          setPaleConjunctiva({
                                            ...paleConjunctiva,
                                            severity,
                                          })
                                        }
                                        className="h-4 w-4 text-blue-600"
                                      />
                                      <span className="ml-2">{severity}</span>
                                    </label>
                                  )
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm mb-2">Dry Eyes</p>
                              <div className="flex space-x-4">
                                {["Occassional", "Persistent"].map(
                                  (frequency) => (
                                    <label
                                      key={frequency}
                                      className="flex items-center"
                                    >
                                      <input
                                        type="radio"
                                        name="dryEyesFrequency"
                                        checked={
                                          dryEyes.frequency === frequency
                                        }
                                        onChange={() =>
                                          setDryEyes({ ...dryEyes, frequency })
                                        }
                                        className="h-4 w-4 text-blue-600"
                                      />
                                      <span className="ml-2">{frequency}</span>
                                    </label>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Muscle Mass */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Muscle Mass:</h3>
                  <div className="flex items-start space-x-8">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={muscleMassNormal}
                        onChange={() => setMuscleMassNormal(!muscleMassNormal)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Normal</span>
                    </div>

                    <div className="flex-1">
                      <div className="space-y-4">
                        <div className="flex space-x-8">
                          <div>
                            <p className="text-sm  mb-2">Loss of Muscle Mass</p>
                            <div className="flex space-x-4">
                              {["Gradual", "Sudden"].map((option) => (
                                <label
                                  key={option}
                                  className="flex items-center"
                                >
                                  <input
                                    type="radio"
                                    name="lossOfMuscleMass"
                                    checked={lossOfMuscleMass === option}
                                    onChange={() => setLossOfMuscleMass(option)}
                                    className="h-4 w-4 text-blue-600"
                                  />
                                  <span className="ml-2 ">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm mb-2">Weakness</p>
                            <div className="flex space-x-4">
                              {["Generalized", "Localized"].map((option) => (
                                <label
                                  key={option}
                                  className="flex items-center"
                                >
                                  <input
                                    type="radio"
                                    name="weakness"
                                    checked={weakness === option}
                                    onChange={() => setWeakness(option)}
                                    className="h-4 w-4 text-blue-600"
                                  />
                                  <span className="ml-2 ">{option}</span>
                                </label>
                              ))}
                            </div>
                            {weakness === "Localized" && (
                              <div className="mt-2">
                                <input
                                  type="text"
                                  value={localizedWeakness}
                                  onChange={(e) =>
                                    setLocalizedWeakness(e.target.value)
                                  }
                                  placeholder="Specify location"
                                  className="w-full px-3 py-2 border rounded text-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-8">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Associated Symptoms
                            </p>
                            <div className="flex space-x-4">
                              {[
                                "Fatigue",
                                "Diziness",
                                "Nerve Involvement (numbness/tingling)",
                              ].map((symptom) => (
                                <label
                                  key={symptom}
                                  className="flex items-center"
                                >
                                  <input
                                    type="checkbox"
                                    checked={associatedSymptoms.includes(
                                      symptom
                                    )}
                                    onChange={() =>
                                      toggleArrayItem(
                                        associatedSymptoms,
                                        symptom,
                                        setAssociatedSymptoms
                                      )
                                    }
                                    className="h-4 w-4 text-blue-600"
                                  />
                                  <span className="ml-2 text-gray-700">
                                    {symptom}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Possible Causes
                            </p>
                            <div className="flex space-x-4">
                              {[
                                "Electrolyte imbalance",
                                "Neuromuscular disorders",
                                "Inadequate protein intake",
                              ].map((cause) => (
                                <label
                                  key={cause}
                                  className="flex items-center"
                                >
                                  <input
                                    type="checkbox"
                                    checked={possibleCauses.includes(cause)}
                                    onChange={() =>
                                      toggleArrayItem(
                                        possibleCauses,
                                        cause,
                                        setPossibleCauses
                                      )
                                    }
                                    className="h-4 w-4 text-blue-600"
                                  />
                                  <span className="ml-2 text-gray-700">
                                    {cause}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lab Results */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    LAB RESULTS:
                  </h3>

                  {/* Complete Blood Count */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Complete Blood Count</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block font-medium mb-1">
                          Hemoglobin (Hgb):
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="hemoglobin"
                                checked={labResults.cbc.hemoglobin === level}
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    cbc: {
                                      ...labResults.cbc,
                                      hemoglobin: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Hematocrit (Hct):
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="hematocrit"
                                checked={labResults.cbc.hematocrit === level}
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    cbc: {
                                      ...labResults.cbc,
                                      hematocrit: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Red Blood Cell Count (RBC):
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="rbc"
                                checked={labResults.cbc.rbc === level}
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    cbc: { ...labResults.cbc, rbc: level },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          White Blood Cell Count (WBC):
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="wbc"
                                checked={labResults.cbc.wbc === level}
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    cbc: { ...labResults.cbc, wbc: level },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Platelets:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="platelets"
                                checked={labResults.cbc.platelets === level}
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    cbc: {
                                      ...labResults.cbc,
                                      platelets: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Electrolytes & Hydration */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">
                      Electrolytes & Hydration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block font-medium mb-1">
                          Sodium (Na+):
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="sodium"
                                checked={
                                  labResults.electrolytes.sodium === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    electrolytes: {
                                      ...labResults.electrolytes,
                                      sodium: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Potassium (K+):
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="potassium"
                                checked={
                                  labResults.electrolytes.potassium === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    electrolytes: {
                                      ...labResults.electrolytes,
                                      potassium: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Calcium (Ca2+):
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="calcium"
                                checked={
                                  labResults.electrolytes.calcium === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    electrolytes: {
                                      ...labResults.electrolytes,
                                      calcium: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Magnesium (Mg2+):
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="magnesium"
                                checked={
                                  labResults.electrolytes.magnesium === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    electrolytes: {
                                      ...labResults.electrolytes,
                                      magnesium: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Protein & Nutritional Status */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">
                      Protein & Nutritional Status
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div>
                        <label className="block font-medium mb-1">
                          Albumin:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="albumin"
                                checked={
                                  labResults.proteinNutrition.albumin === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    proteinNutrition: {
                                      ...labResults.proteinNutrition,
                                      albumin: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Globulin:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="globulin"
                                checked={
                                  labResults.proteinNutrition.globulin === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    proteinNutrition: {
                                      ...labResults.proteinNutrition,
                                      globulin: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Total Protein:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="totalProtein"
                                checked={
                                  labResults.proteinNutrition.totalProtein ===
                                  level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    proteinNutrition: {
                                      ...labResults.proteinNutrition,
                                      totalProtein: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Direct Bilirubin:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="directBilirubin"
                                checked={
                                  labResults.proteinNutrition
                                    .directBilirubin === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    proteinNutrition: {
                                      ...labResults.proteinNutrition,
                                      directBilirubin: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Indirect Bilirubin:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="indirectBilirubin"
                                checked={
                                  labResults.proteinNutrition
                                    .indirectBilirubin === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    proteinNutrition: {
                                      ...labResults.proteinNutrition,
                                      indirectBilirubin: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Total Bilirubin:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="totalBilirubin"
                                checked={
                                  labResults.proteinNutrition.totalBilirubin ===
                                  level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    proteinNutrition: {
                                      ...labResults.proteinNutrition,
                                      totalBilirubin: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blood Glucose & Metabolism */}
                  <div>
                    <h4 className="font-medium mb-2">
                      Blood Glucose & Metabolism
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block font-medium mb-1">
                          Glucose:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="glucose"
                                checked={
                                  labResults.glucoseMetabolism.glucose === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    glucoseMetabolism: {
                                      ...labResults.glucoseMetabolism,
                                      glucose: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">Urea:</label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="urea"
                                checked={
                                  labResults.glucoseMetabolism.urea === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    glucoseMetabolism: {
                                      ...labResults.glucoseMetabolism,
                                      urea: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Creatinine:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="creatinine"
                                checked={
                                  labResults.glucoseMetabolism.creatinine ===
                                  level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    glucoseMetabolism: {
                                      ...labResults.glucoseMetabolism,
                                      creatinine: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Cholesterol Total:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="cholesterolTotal"
                                checked={
                                  labResults.glucoseMetabolism
                                    .cholesterolTotal === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    glucoseMetabolism: {
                                      ...labResults.glucoseMetabolism,
                                      cholesterolTotal: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Cholesterol HDL:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="cholesterolHDL"
                                checked={
                                  labResults.glucoseMetabolism
                                    .cholesterolHDL === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    glucoseMetabolism: {
                                      ...labResults.glucoseMetabolism,
                                      cholesterolHDL: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Cholesterol LDL:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="cholesterolLDL"
                                checked={
                                  labResults.glucoseMetabolism
                                    .cholesterolLDL === level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    glucoseMetabolism: {
                                      ...labResults.glucoseMetabolism,
                                      cholesterolLDL: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Triglycerides:
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="triglycerides"
                                checked={
                                  labResults.glucoseMetabolism.triglycerides ===
                                  level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    glucoseMetabolism: {
                                      ...labResults.glucoseMetabolism,
                                      triglycerides: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Hemoglobin Glycosylate (Hb A1C):
                        </label>
                        <div className="space-y-1">
                          {["Low", "Normal", "High"].map((level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="hemoglobinA1C"
                                checked={
                                  labResults.glucoseMetabolism.hemoglobinA1C ===
                                  level
                                }
                                onChange={() =>
                                  setLabResults({
                                    ...labResults,
                                    glucoseMetabolism: {
                                      ...labResults.glucoseMetabolism,
                                      hemoglobinA1C: level,
                                    },
                                  })
                                }
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anthropometric Data */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-gray-200">
                  ANTHROPOMETRIC DATA
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => {
                        setHeight(e.target.value);
                        if (e.target.value && weight) {
                          const newBMI = calculateBMI(e.target.value, weight);
                          setBmi(newBMI);
                        }
                      }}
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter height in cm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value);
                        if (e.target.value && height) {
                          const newBMI = calculateBMI(height, e.target.value);
                          setBmi(newBMI);
                        }
                      }}
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter weight in kg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium mb-1">BMI</label>
                    <input
                      type="text"
                      value={bmi}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-50"
                      placeholder="BMI will be calculated automatically"
                    />
                    {bmi && (
                      <div
                        className={`mt-2 p-3 rounded ${
                          getBMIStatus(bmi).color
                        }`}
                      >
                        <p className="font-medium">
                          {getBMIStatus(bmi).status}
                        </p>
                        <p className="text-sm mt-1 whitespace-pre-line">
                          {getBMIStatus(bmi).intervention}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Body Build:</p>
                    <div className="flex space-x-4">
                      {["Ectomorph", "Mesomorph", "Endomorph"].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="bodyBuild"
                            checked={bodyBuild === option}
                            onChange={() => setBodyBuild(option)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Signs of Distress:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {["Labored breathing", "Pain", "Discomfort"].map(
                        (option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={signsOfDistress.includes(option)}
                              onChange={() =>
                                toggleArrayItem(
                                  signsOfDistress,
                                  option,
                                  setSignsOfDistress
                                )
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">{option}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Mood/Behavior:</p>
                    <div className="flex space-x-4">
                      {["Calm", "Agitated", "Withdrawn", "Cooperative"].map(
                        (option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              name="moodBehavior"
                              checked={moodBehavior === option}
                              onChange={() => setMoodBehavior(option)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">{option}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Oral Health */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-gray-200">
                  Oral Health
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={oralHealth.healthy}
                      onChange={() =>
                        setOralHealth({
                          ...oralHealth,
                          healthy: !oralHealth.healthy,
                        })
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">
                      Healthy (Pink and moist without lesion, ulcers, swelling,
                      inflammation, and foul odor)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={oralHealth.foulOdor}
                      onChange={() =>
                        setOralHealth({
                          ...oralHealth,
                          foulOdor: !oralHealth.foulOdor,
                        })
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Observed foul odor</span>
                  </label>

                  <div>
                    <p className="font-medium mb-2">Swollen Gums:</p>
                    <div className="flex space-x-4">
                      {["None", "Mild", "Moderate", "Severe"].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="swollenGums"
                            checked={oralHealth.swollenGums === option}
                            onChange={() =>
                              setOralHealth({
                                ...oralHealth,
                                swollenGums: option,
                              })
                            }
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Bleeding Gums:</p>
                    <div className="flex space-x-4">
                      {[
                        "No bleeding",
                        "Spontaneous",
                        "When brushing/flossing",
                      ].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="bleedingGums"
                            checked={oralHealth.bleedingGums === option}
                            onChange={() =>
                              setOralHealth({
                                ...oralHealth,
                                bleedingGums: option,
                              })
                            }
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Mouth Ulcers:</p>
                    <div className="flex space-x-4">
                      {["None", "Single ulcer", "Multiple ulcers"].map(
                        (option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              name="mouthUlcers"
                              checked={oralHealth.mouthUlcers === option}
                              onChange={() =>
                                setOralHealth({
                                  ...oralHealth,
                                  mouthUlcers: option,
                                })
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">{option}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nose */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-gray-200">
                  Nose
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Nasal discharge:</p>
                    <div className="flex space-x-4">
                      {["None", "Mucus"].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="nasalDischarge"
                            checked={nasalDischarge === option}
                            onChange={() => setNasalDischarge(option)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      ))}
                    </div>
                    {nasalDischarge === "Mucus" && (
                      <div className="mt-2 space-y-2">
                        <div>
                          <label className="block font-medium mb-1">
                            Color:
                          </label>
                          <input
                            type="text"
                            value={mucusColor}
                            onChange={(e) => setMucusColor(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">
                            Consistency:
                          </label>
                          <input
                            type="text"
                            value={mucusConsistency}
                            onChange={(e) =>
                              setMucusConsistency(e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-medium mb-2">Shape & Symmetry:</p>
                    <div className="flex space-x-4">
                      {["Straight and symmetrical", "Crooked", "Swollen"].map(
                        (option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              name="noseShape"
                              checked={noseShape === option}
                              onChange={() => setNoseShape(option)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">{option}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Nasal Obstruction:</p>
                    <div className="flex space-x-4">
                      {[
                        "Child can breathe through both nostrils",
                        "Blocked nostril(s)",
                        "Mouth breathing",
                      ].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="nasalObstruction"
                            checked={nasalObstruction === option}
                            onChange={() => setNasalObstruction(option)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ears */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-gray-200">
                  Ears
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">External Ear:</p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      {[
                        "No redness, swelling, or discharge",
                        "Redness",
                        "Swelling",
                        "Discharge",
                        "Tenderness",
                      ].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={externalEar.includes(option)}
                            onChange={() =>
                              toggleArrayItem(
                                externalEar,
                                option,
                                setExternalEar
                              )
                            }
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">
                      Ear Canal (with otoscope):
                    </p>
                    <div className="flex space-x-4">
                      {[
                        "Clear canal",
                        "Small amount of wax",
                        "Excess wax",
                        "Discharge",
                        "Foreign Body",
                      ].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="earCanal"
                            checked={earCanal === option}
                            onChange={() => setEarCanal(option)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Hearing (basic test):</p>
                    <div className="flex space-x-4">
                      {[
                        "Responds to voice or soft sound",
                        "No response",
                        "Delayed reaction to sound",
                      ].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="hearing"
                            checked={hearing === option}
                            onChange={() => setHearing(option)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <h2 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b border-gray-200">
                  Laboratory Results
                </h2>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Laboratory Results</h3>
                  <p className="text-sm text-gray-500">
                    Kindly upload the photo of the patient's laboratory results (Maximum file size: 5MB)
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Lab Results (JPG, PNG, PDF)
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLabResultsFile(file);
                          handleLabResultsUpload(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">
                      Other Essential Images
                    </h3>
                    <p className="text-sm text-gray-500">
                      Upload here other essential images, if necessary: (eg.
                      Plates, etc)
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Essential Images
                      </label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            setOtherImagesFiles(files);
                            handleOtherImagesUpload(files);
                          }
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <p className="mt-2 text-sm text-gray-500">
                          Uploading...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-4 mb-6">
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
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
          {/* History Table */}
          {historyRecords.length > 0 && (
            <div className="px-8 py-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Assessment History
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
                        Physician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Files
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.physician_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {record.lab_results_url && (
                              <button
                                onClick={() => {
                                  const fileName = `lab-results-${record.patient_name}-${new Date(
                                    record.date_of_service
                                  ).toISOString()}`;
                                  handleDownloadFile(record.lab_results_url, fileName);
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
                                    Lab Results
                                  </>
                                )}
                              </button>
                            )}
                            {record.other_images_urls && record.other_images_urls.length > 0 && (
                              <button
                                onClick={() => {
                                  const url = record.other_images_urls[0];
                                  const fileName = `other-images-${record.patient_name}-${new Date(
                                    record.date_of_service
                                  ).toISOString()}`;
                                  handleDownloadFile(url, fileName);
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
                                    Other Images
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewRecord(record)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-600 hover:text-red-800"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PhysicalHealthPage;
