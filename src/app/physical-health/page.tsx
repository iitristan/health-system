"use client";

import { useState, useEffect } from "react";
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
  full_name: string;
  physician_id: string;
  date_of_service: string;
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
  created_at: string;
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

const PhysicalHealthPage: NextPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PhysicalHealthPageContent />
    </Suspense>
  );
};
const PhysicalHealthPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const { selectedNurse } = useSession();

  const [patientInfo, setPatientInfo] = useState({
    fullName: "",
    dateOfService: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    physician: selectedNurse ? `${selectedNurse.full_name}, ${selectedNurse.position}` : "N/A",
    age: "",
    gender: "",
  });

  // Add effect to update physician info when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      setPatientInfo(prev => ({
        ...prev,
        physician: `${selectedNurse.full_name}, ${selectedNurse.position}`
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
            setPatientInfo(prev => ({
              ...prev,
              fullName: patientData.full_name,
              age: patientData.age || "N/A",
              gender: patientData.gender || "N/A",
              physician: selectedNurse ? `${selectedNurse.full_name}, ${selectedNurse.position}` : "N/A"
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
    if (!patientName) {
      alert("No patient selected");
      return;
    }

    if (!selectedNurse) {
      alert("No nurse selected. Please select a staff from the dashboard first.");
      return;
    }

    try {
      // Prepare the data for submission
      const submissionData = {
        full_name: decodeURIComponent(patientName),
        physician_id: selectedNurse.id,
        date_of_service: new Date().toISOString().split('T')[0],
        
        // Physical Activity Level
        exercise_regularly: exerciseRegularly,
        medical_conditions: medicalConditions,
        medical_conditions_specify: medicalConditionsSpecify,
        activities,
        
        // General Appearance
        posture,
        cleanliness,
        
        // Physical Findings
        eyes_normal: eyesNormal,
        pale_conjunctiva: paleConjunctiva,
        dry_eyes: dryEyes,
        muscle_mass_normal: muscleMassNormal,
        loss_of_muscle_mass: lossOfMuscleMass,
        weakness,
        localized_weakness: localizedWeakness,
        associated_symptoms: associatedSymptoms,
        possible_causes: possibleCauses,
        
        // Lab Results - CBC
        hemoglobin: labResults.cbc.hemoglobin,
        hematocrit: labResults.cbc.hematocrit,
        rbc_count: labResults.cbc.rbc,
        wbc_count: labResults.cbc.wbc,
        platelets_count: labResults.cbc.platelets,
        
        // Lab Results - Electrolytes
        sodium: labResults.electrolytes.sodium,
        potassium: labResults.electrolytes.potassium,
        calcium: labResults.electrolytes.calcium,
        magnesium: labResults.electrolytes.magnesium,
        
        // Lab Results - Protein and Nutrition
        albumin: labResults.proteinNutrition.albumin,
        globulin: labResults.proteinNutrition.globulin,
        total_protein: labResults.proteinNutrition.totalProtein,
        direct_bilirubin: labResults.proteinNutrition.directBilirubin,
        indirect_bilirubin: labResults.proteinNutrition.indirectBilirubin,
        total_bilirubin: labResults.proteinNutrition.totalBilirubin,
        
        // Lab Results - Glucose and Metabolism
        glucose: labResults.glucoseMetabolism.glucose,
        urea: labResults.glucoseMetabolism.urea,
        creatinine: labResults.glucoseMetabolism.creatinine,
        cholesterol_total: labResults.glucoseMetabolism.cholesterolTotal,
        cholesterol_hdl: labResults.glucoseMetabolism.cholesterolHDL,
        cholesterol_ldl: labResults.glucoseMetabolism.cholesterolLDL,
        triglycerides: labResults.glucoseMetabolism.triglycerides,
        hemoglobin_a1c: labResults.glucoseMetabolism.hemoglobinA1C,
        
        // Anthropometric Data
        height,
        weight,
        bmi,
        body_build: bodyBuild,
        signs_of_distress: signsOfDistress,
        mood_behavior: moodBehavior,
        
        // Oral Health
        oral_health: oralHealth,
        
        // Nose
        nasal_discharge: nasalDischarge,
        mucus_color: mucusColor,
        mucus_consistency: mucusConsistency,
        nose_shape: noseShape,
        nasal_obstruction: nasalObstruction,
        
        // Ears
        external_ear: externalEar,
        ear_canal: earCanal,
        hearing
      };

      console.log("Submitting data:", submissionData);

      const { data, error: upsertError } = await supabase
        .from("physical_health_records")
        .upsert(submissionData)
        .select();

      if (upsertError) {
        console.error("Supabase error:", upsertError);
        throw upsertError;
      }

      console.log("Success response:", data);
      alert("Physical health assessment saved successfully!");
    } catch (error) {
      console.error("Error saving physical health assessment:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      alert("Error saving physical health assessment. Please try again.");
    }
  };

  // Add these functions
  const calculateBMI = (height: string, weight: string) => {
    if (!height || !weight || !patientInfo.age) return "";

    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    const ageNum = parseInt(patientInfo.age);

    if (
      isNaN(heightInMeters) ||
      isNaN(weightInKg) ||
      heightInMeters <= 0 ||
      isNaN(ageNum)
    )
      return "";

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  // Update BMI whenever height or weight changes
  useEffect(() => {
    if (height && weight) {
      const newBMI = calculateBMI(height, weight);
      setBmi(newBMI);
    }
  }, [height, weight, patientInfo.age]);

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

  const [historyRecords, setHistoryRecords] = useState<PhysicalHealthRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PhysicalHealthRecord | null>(null);

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
                  physician_name: `${nurseData.full_name}, ${nurseData.position}`
                };
              }
            }
            return {
              ...record,
              physician_name: "Unknown"
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
    
    // Set form data based on the selected record
    setExerciseRegularly(record.exercise_regularly);
    setMedicalConditions(record.medical_conditions);
    setMedicalConditionsSpecify(record.medical_conditions_specify);
    setActivities(record.activities);
    setPosture(record.posture);
    setCleanliness(record.cleanliness);
    setEyesNormal(record.eyes_normal);
    setPaleConjunctiva(record.pale_conjunctiva);
    setDryEyes(record.dry_eyes);
    setMuscleMassNormal(record.muscle_mass_normal);
    setLossOfMuscleMass(record.loss_of_muscle_mass);
    setWeakness(record.weakness);
    setLocalizedWeakness(record.localized_weakness);
    setAssociatedSymptoms(record.associated_symptoms);
    setPossibleCauses(record.possible_causes);
    setHeight(record.height);
    setWeight(record.weight);
    setBmi(record.bmi);
    setBodyBuild(record.body_build);
    setSignsOfDistress(record.signs_of_distress);
    setMoodBehavior(record.mood_behavior);
    
    // Set lab results
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

    // Set oral health
    setOralHealth(record.oral_health || {
      healthy: true,
      foulOdor: false,
      swollenGums: "",
      bleedingGums: "",
      mouthUlcers: "",
    });

    // Set nose data
    setNasalDischarge(record.nasal_discharge || "");
    setMucusColor(record.mucus_color || "");
    setMucusConsistency(record.mucus_consistency || "");
    setNoseShape(record.nose_shape || "");
    setNasalObstruction(record.nasal_obstruction || "");

    // Set ear data
    setExternalEar(record.external_ear || []);
    setEarCanal(record.ear_canal || "");
    setHearing(record.hearing || "");

    // Scroll to the top of the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add delete record function
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
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
                  <p className="text-sm font-medium text-gray-500">Physician</p>
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
                      onChange={(e) => setHeight(e.target.value)}
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
                      onChange={(e) => setWeight(e.target.value)}
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
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* History Table */}
        {historyRecords.length > 0 && (
          <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-indigo-700 px-8 py-5 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">
                Physical Health History
              </h2>
              <button
                onClick={handleNewRecord}
                className="px-4 py-2 bg-white text-indigo-700 rounded-md hover:bg-indigo-50 transition-colors"
              >
                New Record
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Physician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historyRecords.map((record) => (
                    <tr 
                      key={record.id}
                      className={selectedRecord?.id === record.id ? "bg-indigo-50" : ""}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {selectedNurse ? `${selectedNurse.full_name}, ${selectedNurse.position}` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.created_at).toLocaleTimeString()}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhysicalHealthPage;
