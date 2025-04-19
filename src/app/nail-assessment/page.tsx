"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/context/SessionContext";

interface NailAssessmentForm {
  nailShape: {
    oval: boolean;
    square: boolean;
    round: boolean;
    almond: boolean;
    squoval: boolean;
    pointed: boolean;
  };
  nailLength: {
    short: boolean;
    medium: boolean;
    long: boolean;
  };
  nailTexture: {
    firm: boolean;
    soft: boolean;
    brittle: boolean;
  };
  nailColor: {
    pinkish: boolean;
    discolored: boolean;
    yellow: boolean;
    whiteSpots: boolean;
    bluePurple: boolean;
    other: boolean;
  };
  nailSurface: {
    smooth: boolean;
    ridged: boolean;
    pitted: boolean;
    grooved: boolean;
    brittle: boolean;
  };
  nailHydration: {
    hydrated: boolean;
    dehydrated: boolean;
    brittle: boolean;
  };
  cuticleCondition: {
    intact: boolean;
    overgrown: boolean;
    dry: boolean;
    inflamed: boolean;
    damaged: boolean;
  };
  nailBedCondition: {
    pink: boolean;
    pale: boolean;
    red: boolean;
    cyanotic: boolean;
    capillaryRefill: string;
  };
  nailDisorders: {
    onychomycosis: boolean;
    paronychia: boolean;
    beausLines: boolean;
    koilonychia: boolean;
    leukonychia: boolean;
    onycholysis: boolean;
  };
  nailGrowthRate: {
    moderate: boolean;
    slow: boolean;
    rapid: boolean;
  };
  nailCareRoutine: {
    nailTrimming: string;
    nailPolish: string;
    acrylicNails: string;
    harshChemicals: string;
  };
  nailTrauma: {
    present: boolean;
    description: string;
    evidence: string;
  };
  nailInjuryTrauma: {
    present: boolean;
    description: string;
    evidence: string;
  };
}

interface NailAssessmentRecord {
  id: string;
  full_name: string;
  physician_id: string;
  date_of_service: string;
  created_at: string;
  physician_info?: {
    full_name: string;
    position: string;
  };
  // Nail Shape
  nail_shape_oval: boolean;
  nail_shape_square: boolean;
  nail_shape_round: boolean;
  nail_shape_almond: boolean;
  nail_shape_squoval: boolean;
  nail_shape_pointed: boolean;
  // Nail Length
  nail_length_short: boolean;
  nail_length_medium: boolean;
  nail_length_long: boolean;
  // Nail Texture
  nail_texture_firm: boolean;
  nail_texture_soft: boolean;
  nail_texture_brittle: boolean;
  // Nail Color
  nail_color_pinkish: boolean;
  nail_color_discolored: boolean;
  nail_color_yellow: boolean;
  nail_color_white_spots: boolean;
  nail_color_blue_purple: boolean;
  nail_color_other: boolean;
  // Nail Surface
  nail_surface_smooth: boolean;
  nail_surface_ridged: boolean;
  nail_surface_pitted: boolean;
  nail_surface_grooved: boolean;
  nail_surface_brittle: boolean;
  // Nail Hydration
  nail_hydration_hydrated: boolean;
  nail_hydration_dehydrated: boolean;
  nail_hydration_brittle: boolean;
  // Cuticle Condition
  cuticle_condition_intact: boolean;
  cuticle_condition_overgrown: boolean;
  cuticle_condition_dry: boolean;
  cuticle_condition_inflamed: boolean;
  cuticle_condition_damaged: boolean;
  // Nail Bed Condition
  nail_bed_condition_pink: boolean;
  nail_bed_condition_pale: boolean;
  nail_bed_condition_red: boolean;
  nail_bed_condition_cyanotic: boolean;
  nail_bed_condition_capillary_refill: string;
  // Nail Disorders
  nail_disorders_onychomycosis: boolean;
  nail_disorders_paronychia: boolean;
  nail_disorders_beaus_lines: boolean;
  nail_disorders_koilonychia: boolean;
  nail_disorders_leukonychia: boolean;
  nail_disorders_onycholysis: boolean;
  // Nail Growth Rate
  nail_growth_rate_moderate: boolean;
  nail_growth_rate_slow: boolean;
  nail_growth_rate_rapid: boolean;
  // Nail Care Routine
  nail_care_routine_trimming: string;
  nail_care_routine_polish: string;
  nail_care_routine_acrylic: string;
  nail_care_routine_harsh_chemicals: string;
  // Nail Trauma
  nail_trauma_present: boolean;
  nail_trauma_description: string;
  nail_trauma_evidence: string;
  // Nail Injury/Trauma
  nail_injury_trauma_present: boolean;
  nail_injury_trauma_description: string;
  nail_injury_trauma_evidence: string;
}

const NailAssessmentPage: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const { selectedNurse } = useSession();
  const [patients, setPatients] = useState<
    Array<{ full_name: string; age: number; gender: string }>
  >([]);
  const [selectedPatient, setSelectedPatient] = useState(patientName || "");
  const [error, setError] = useState<string | null>(null);
  const [currentDate] = useState(new Date().toLocaleDateString());
  const [attending] = useState(
    selectedNurse ? `${selectedNurse.full_name}, ${selectedNurse.position}` : ""
  );
  const [historyRecords, setHistoryRecords] = useState<NailAssessmentRecord[]>(
    []
  );
  const [selectedRecord, setSelectedRecord] =
    useState<NailAssessmentRecord | null>(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);

  const [formData, setFormData] = useState<NailAssessmentForm>({
    nailShape: {
      oval: false,
      square: false,
      round: false,
      almond: false,
      squoval: false,
      pointed: false,
    },
    nailLength: {
      short: false,
      medium: true,
      long: false,
    },
    nailTexture: {
      firm: true,
      soft: false,
      brittle: false,
    },
    nailColor: {
      pinkish: true,
      discolored: false,
      yellow: false,
      whiteSpots: false,
      bluePurple: false,
      other: false,
    },
    nailSurface: {
      smooth: true,
      ridged: false,
      pitted: false,
      grooved: false,
      brittle: false,
    },
    nailHydration: {
      hydrated: true,
      dehydrated: false,
      brittle: false,
    },
    cuticleCondition: {
      intact: true,
      overgrown: false,
      dry: false,
      inflamed: false,
      damaged: false,
    },
    nailBedCondition: {
      pink: true,
      pale: false,
      red: false,
      cyanotic: false,
      capillaryRefill: "",
    },
    nailDisorders: {
      onychomycosis: false,
      paronychia: false,
      beausLines: false,
      koilonychia: false,
      leukonychia: false,
      onycholysis: false,
    },
    nailGrowthRate: {
      moderate: true,
      slow: false,
      rapid: false,
    },
    nailCareRoutine: {
      nailTrimming: "Weekly",
      nailPolish: "No",
      acrylicNails: "No",
      harshChemicals: "Once a week (detergents)",
    },
    nailTrauma: {
      present: false,
      description: "",
      evidence: "",
    },
    nailInjuryTrauma: {
      present: false,
      description: "",
      evidence: "",
    },
  });

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

  // Only redirect if we're on the main page without a patient
  useEffect(() => {
    if (!selectedNurse && !patientName) {
      alert("Please select a nurse from the dashboard first.");
      router.push("/");
    }
  }, [selectedNurse, patientName, router]);

  // Fetch patient info when patientName changes
  useEffect(() => {
    const fetchPatientInfo = async () => {
      if (patientName) {
        try {
          const { data, error } = await supabase
            .from("patients")
            .select("*")
            .eq("full_name", decodeURIComponent(patientName))
            .single();

          if (error) throw error;

          if (data) {
            setPatientInfo((prev) => ({
              ...prev,
              fullName: data.full_name,
              age: data.age,
              gender: data.gender,
            }));
          }
        } catch (error) {
          console.error("Error fetching patient info:", error);
        }
      }
    };

    fetchPatientInfo();
  }, [patientName]);

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

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(
        `/nail-assessment?patient=${encodeURIComponent(selectedName)}`
      );
    } else {
      router.push("/nail-assessment");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const [parent, child, subChild] = name.split(".");

    if (type === "checkbox") {
      if (subChild) {
        setFormData((prev) => ({
          ...prev,
          [parent as keyof NailAssessmentForm]: {
            ...prev[parent as keyof NailAssessmentForm],
            [child]: {
              ...(
                prev[parent as keyof NailAssessmentForm] as Record<
                  string,
                  unknown
                >
              )[child],
              [subChild]: checked,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [parent as keyof NailAssessmentForm]: {
            ...prev[parent as keyof NailAssessmentForm],
            [child]: checked,
          },
        }));
      }
    } else {
      if (subChild) {
        setFormData((prev) => ({
          ...prev,
          [parent as keyof NailAssessmentForm]: {
            ...prev[parent as keyof NailAssessmentForm],
            [child]: {
              ...(
                prev[parent as keyof NailAssessmentForm] as Record<
                  string,
                  unknown
                >
              )[child],
              [subChild]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [parent as keyof NailAssessmentForm]: {
            ...prev[parent as keyof NailAssessmentForm],
            [child]: value,
          },
        }));
      }
    }
  };

  const selectedPatientData = patients.find(
    (p) => p.full_name === selectedPatient
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert("No patient selected");
      return;
    }

    if (!selectedNurse) {
      alert(
        "No nurse selected. Please select a nurse from the dashboard first."
      );
      return;
    }

    try {
      // Prepare the submission data with proper structure matching the database schema
      const submissionData = {
        full_name: decodeURIComponent(selectedPatient),
        physician_id: selectedNurse.id,
        date_of_service: new Date().toISOString().split("T")[0],

        // Nail Shape
        nail_shape_oval: formData.nailShape.oval,
        nail_shape_square: formData.nailShape.square,
        nail_shape_round: formData.nailShape.round,
        nail_shape_almond: formData.nailShape.almond,
        nail_shape_squoval: formData.nailShape.squoval,
        nail_shape_pointed: formData.nailShape.pointed,

        // Nail Length
        nail_length_short: formData.nailLength.short,
        nail_length_medium: formData.nailLength.medium,
        nail_length_long: formData.nailLength.long,

        // Nail Texture
        nail_texture_firm: formData.nailTexture.firm,
        nail_texture_soft: formData.nailTexture.soft,
        nail_texture_brittle: formData.nailTexture.brittle,

        // Nail Color
        nail_color_pinkish: formData.nailColor.pinkish,
        nail_color_discolored: formData.nailColor.discolored,
        nail_color_yellow: formData.nailColor.yellow,
        nail_color_white_spots: formData.nailColor.whiteSpots,
        nail_color_blue_purple: formData.nailColor.bluePurple,
        nail_color_other: formData.nailColor.other,

        // Nail Surface
        nail_surface_smooth: formData.nailSurface.smooth,
        nail_surface_ridged: formData.nailSurface.ridged,
        nail_surface_pitted: formData.nailSurface.pitted,
        nail_surface_grooved: formData.nailSurface.grooved,
        nail_surface_brittle: formData.nailSurface.brittle,

        // Nail Hydration
        nail_hydration_hydrated: formData.nailHydration.hydrated,
        nail_hydration_dehydrated: formData.nailHydration.dehydrated,
        nail_hydration_brittle: formData.nailHydration.brittle,

        // Cuticle Condition
        cuticle_condition_intact: formData.cuticleCondition.intact,
        cuticle_condition_overgrown: formData.cuticleCondition.overgrown,
        cuticle_condition_dry: formData.cuticleCondition.dry,
        cuticle_condition_inflamed: formData.cuticleCondition.inflamed,
        cuticle_condition_damaged: formData.cuticleCondition.damaged,

        // Nail Bed Condition
        nail_bed_condition_pink: formData.nailBedCondition.pink,
        nail_bed_condition_pale: formData.nailBedCondition.pale,
        nail_bed_condition_red: formData.nailBedCondition.red,
        nail_bed_condition_cyanotic: formData.nailBedCondition.cyanotic,
        nail_bed_condition_capillary_refill:
          formData.nailBedCondition.capillaryRefill,

        // Nail Disorders
        nail_disorders_onychomycosis: formData.nailDisorders.onychomycosis,
        nail_disorders_paronychia: formData.nailDisorders.paronychia,
        nail_disorders_beaus_lines: formData.nailDisorders.beausLines,
        nail_disorders_koilonychia: formData.nailDisorders.koilonychia,
        nail_disorders_leukonychia: formData.nailDisorders.leukonychia,
        nail_disorders_onycholysis: formData.nailDisorders.onycholysis,

        // Nail Growth Rate
        nail_growth_rate_moderate: formData.nailGrowthRate.moderate,
        nail_growth_rate_slow: formData.nailGrowthRate.slow,
        nail_growth_rate_rapid: formData.nailGrowthRate.rapid,

        // Nail Care Routine
        nail_care_routine_trimming: formData.nailCareRoutine.nailTrimming,
        nail_care_routine_polish: formData.nailCareRoutine.nailPolish,
        nail_care_routine_acrylic: formData.nailCareRoutine.acrylicNails,
        nail_care_routine_harsh_chemicals:
          formData.nailCareRoutine.harshChemicals,

        // Nail Trauma
        nail_trauma_present: formData.nailTrauma.present,
        nail_trauma_description: formData.nailTrauma.description,
        nail_trauma_evidence: formData.nailTrauma.evidence,

        // Nail Injury/Trauma
        nail_injury_trauma_present: formData.nailInjuryTrauma.present,
        nail_injury_trauma_description: formData.nailInjuryTrauma.description,
        nail_injury_trauma_evidence: formData.nailInjuryTrauma.evidence,
      };

      console.log("Submitting data:", submissionData);

      const { data, error } = await supabase
        .from("nail_assessment_records")
        .insert(submissionData)
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw new Error(`Insert failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from insert operation");
      }

      console.log("Insert successful:", data);
      alert("Nail assessment saved successfully!");
      await fetchHistoryRecords();
    } catch (error) {
      console.error("Error saving nail assessment:", error);
      if (error instanceof Error) {
        alert(`Error saving nail assessment: ${error.message}`);
      } else {
        alert("Error saving nail assessment: Unknown error occurred");
      }
    }
  };

  const fetchHistoryRecords = async () => {
    if (!selectedPatient) return;

    try {
      const { data: records, error } = await supabase
        .from("nail_assessment_records")
        .select("*")
        .eq("full_name", selectedPatient)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich records with physician info
      const enrichedRecords = await Promise.all(
        records.map(async (record) => {
          const { data: physicianData } = await supabase
            .from("nurses")
            .select("full_name, position")
            .eq("id", record.physician_id)
            .single();

          return {
            ...record,
            physician_info: physicianData || null,
          };
        })
      );

      setHistoryRecords(enrichedRecords);
    } catch (error) {
      console.error("Error fetching history records:", error);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      fetchHistoryRecords();
    }
  }, [selectedPatient]);

  const handleViewRecord = (record: NailAssessmentRecord) => {
    setSelectedRecord(record);
    const formDataFromRecord = {
      nailShape: {
        oval: Boolean(record.nail_shape_oval),
        square: Boolean(record.nail_shape_square),
        round: Boolean(record.nail_shape_round),
        almond: Boolean(record.nail_shape_almond),
        squoval: Boolean(record.nail_shape_squoval),
        pointed: Boolean(record.nail_shape_pointed),
      },
      nailLength: {
        short: Boolean(record.nail_length_short),
        medium: Boolean(record.nail_length_medium),
        long: Boolean(record.nail_length_long),
      },
      nailTexture: {
        firm: Boolean(record.nail_texture_firm),
        soft: Boolean(record.nail_texture_soft),
        brittle: Boolean(record.nail_texture_brittle),
      },
      nailColor: {
        pinkish: Boolean(record.nail_color_pinkish),
        discolored: Boolean(record.nail_color_discolored),
        yellow: Boolean(record.nail_color_yellow),
        whiteSpots: Boolean(record.nail_color_white_spots),
        bluePurple: Boolean(record.nail_color_blue_purple),
        other: Boolean(record.nail_color_other),
      },
      nailSurface: {
        smooth: Boolean(record.nail_surface_smooth),
        ridged: Boolean(record.nail_surface_ridged),
        pitted: Boolean(record.nail_surface_pitted),
        grooved: Boolean(record.nail_surface_grooved),
        brittle: Boolean(record.nail_surface_brittle),
      },
      nailHydration: {
        hydrated: Boolean(record.nail_hydration_hydrated),
        dehydrated: Boolean(record.nail_hydration_dehydrated),
        brittle: Boolean(record.nail_hydration_brittle),
      },
      cuticleCondition: {
        intact: Boolean(record.cuticle_condition_intact),
        overgrown: Boolean(record.cuticle_condition_overgrown),
        dry: Boolean(record.cuticle_condition_dry),
        inflamed: Boolean(record.cuticle_condition_inflamed),
        damaged: Boolean(record.cuticle_condition_damaged),
      },
      nailBedCondition: {
        pink: Boolean(record.nail_bed_condition_pink),
        pale: Boolean(record.nail_bed_condition_pale),
        red: Boolean(record.nail_bed_condition_red),
        cyanotic: Boolean(record.nail_bed_condition_cyanotic),
        capillaryRefill: record.nail_bed_condition_capillary_refill || "",
      },
      nailDisorders: {
        onychomycosis: Boolean(record.nail_disorders_onychomycosis),
        paronychia: Boolean(record.nail_disorders_paronychia),
        beausLines: Boolean(record.nail_disorders_beaus_lines),
        koilonychia: Boolean(record.nail_disorders_koilonychia),
        leukonychia: Boolean(record.nail_disorders_leukonychia),
        onycholysis: Boolean(record.nail_disorders_onycholysis),
      },
      nailGrowthRate: {
        moderate: Boolean(record.nail_growth_rate_moderate),
        slow: Boolean(record.nail_growth_rate_slow),
        rapid: Boolean(record.nail_growth_rate_rapid),
      },
      nailCareRoutine: {
        nailTrimming: record.nail_care_routine_trimming || "",
        nailPolish: record.nail_care_routine_polish || "",
        acrylicNails: record.nail_care_routine_acrylic || "",
        harshChemicals: record.nail_care_routine_harsh_chemicals || "",
      },
      nailTrauma: {
        present: Boolean(record.nail_trauma_present),
        description: record.nail_trauma_description || "",
        evidence: record.nail_trauma_evidence || "",
      },
      nailInjuryTrauma: {
        present: Boolean(record.nail_injury_trauma_present),
        description: record.nail_injury_trauma_description || "",
        evidence: record.nail_injury_trauma_evidence || "",
      },
    };
    setFormData(formDataFromRecord);
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from("nail_assessment_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      await fetchHistoryRecords();
      alert("Record deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record");
    }
  };

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setFormData({
      nailShape: {
        oval: false,
        square: false,
        round: false,
        almond: false,
        squoval: false,
        pointed: false,
      },
      nailLength: {
        short: false,
        medium: false,
        long: false,
      },
      nailTexture: {
        firm: false,
        soft: false,
        brittle: false,
      },
      nailColor: {
        pinkish: false,
        discolored: false,
        yellow: false,
        whiteSpots: false,
        bluePurple: false,
        other: false,
      },
      nailSurface: {
        smooth: false,
        ridged: false,
        pitted: false,
        grooved: false,
        brittle: false,
      },
      nailHydration: {
        hydrated: false,
        dehydrated: false,
        brittle: false,
      },
      cuticleCondition: {
        intact: false,
        overgrown: false,
        dry: false,
        inflamed: false,
        damaged: false,
      },
      nailBedCondition: {
        pink: false,
        pale: false,
        red: false,
        cyanotic: false,
        capillaryRefill: "",
      },
      nailDisorders: {
        onychomycosis: false,
        paronychia: false,
        beausLines: false,
        koilonychia: false,
        leukonychia: false,
        onycholysis: false,
      },
      nailGrowthRate: {
        moderate: false,
        slow: false,
        rapid: false,
      },
      nailCareRoutine: {
        nailTrimming: "",
        nailPolish: "",
        acrylicNails: "",
        harshChemicals: "",
      },
      nailTrauma: {
        present: false,
        description: "",
        evidence: "",
      },
      nailInjuryTrauma: {
        present: false,
        description: "",
        evidence: "",
      },
    });
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
            <h1 className="text-3xl font-bold text-white">Nail Assessment</h1>
            <p className="mt-1 text-lg text-indigo-200">
              Comprehensive Nail Assessment Documentation
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">
                Nail Assessment Form
              </h2>
            </div>
          </div>

          <div className="p-8 space-y-10">
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
                      `/patient-information?returnTo=/nail-assessment`
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
                <p className="text-sm font-medium text-gray-500">Physician</p>
                <p className="text-lg font-semibold text-gray-900">
                  {attending || "Not available"}
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
                Nail Characteristics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Nail Shape
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailShape).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`nailShape.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Nail Length
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailLength).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`nailLength.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Nail Texture
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailTexture).map(
                      ([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`nailTexture.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Nail Color
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailColor).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`nailColor.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {key === "pinkish"
                            ? "Pinkish in color"
                            : key === "whiteSpots"
                            ? "White spots"
                            : key === "bluePurple"
                            ? "Blue/purple (indicating cyanosis)"
                            : key === "other"
                            ? "Other abnormalities"
                            : key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                Nail Health Assessment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Nail Surface
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailSurface).map(
                      ([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`nailSurface.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key === "ridged"
                              ? "Ridged (lengthwise or across)"
                              : key === "grooved"
                              ? "Grooved"
                              : key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Nail Hydration
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailHydration).map(
                      ([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`nailHydration.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Cuticle Condition
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(formData.cuticleCondition).map(
                      ([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`cuticleCondition.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Nail Bed Condition
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailBedCondition).map(
                      ([key, value]) =>
                        key !== "capillaryRefill" ? (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`nailBedCondition.${key}`}
                              checked={value as boolean}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key === "pink"
                                ? "Pink (normal)"
                                : key === "cyanotic"
                                ? "Cyanotic"
                                : key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </label>
                        ) : (
                          <div key={key} className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Capillary refill time
                            </label>
                            <input
                              type="text"
                              name={`nailBedCondition.${key}`}
                              value={value as string}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Normal or delayed"
                            />
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                Nail Disorders
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nail Disorders / Diseases
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Presence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Onychomycosis (fungal infection)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.onychomycosis"
                              checked={formData.nailDisorders.onychomycosis}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Yes
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.onychomycosis"
                              checked={!formData.nailDisorders.onychomycosis}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              No
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Paronychia (bacterial infection)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.paronychia"
                              checked={formData.nailDisorders.paronychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Yes
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.paronychia"
                              checked={!formData.nailDisorders.paronychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              No
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Beau&apos;s lines (transverse depressions)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.beausLines"
                              checked={formData.nailDisorders.beausLines}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Yes
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.beausLines"
                              checked={!formData.nailDisorders.beausLines}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              No
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Koilonychia (spoon-shaped nails)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.koilonychia"
                              checked={formData.nailDisorders.koilonychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Yes
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.koilonychia"
                              checked={!formData.nailDisorders.koilonychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              No
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Leukonychia (white spots)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.leukonychia"
                              checked={formData.nailDisorders.leukonychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Yes
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.leukonychia"
                              checked={!formData.nailDisorders.leukonychia}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              No
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Onycholysis (separation of the nail from the nail bed)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.onycholysis"
                              checked={formData.nailDisorders.onycholysis}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Yes
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="nailDisorders.onycholysis"
                              checked={!formData.nailDisorders.onycholysis}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              No
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                Nail Growth and Care
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Nail Growth Rate
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(formData.nailGrowthRate).map(
                      ([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`nailGrowthRate.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-700 mb-4">
                  Nail Care Routine
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nail Care Routine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequency
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Nail trimming
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="nailCareRoutine.nailTrimming"
                            value={formData.nailCareRoutine.nailTrimming}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Use of nail polish
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="nailCareRoutine.nailPolish"
                            value={formData.nailCareRoutine.nailPolish}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Use of acrylic nails
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="nailCareRoutine.acrylicNails"
                            value={formData.nailCareRoutine.acrylicNails}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Exposure to harsh chemicals
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="nailCareRoutine.harshChemicals"
                            value={formData.nailCareRoutine.harshChemicals}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                Nail Trauma Assessment
              </h3>

              <div className=" border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Other assessment of Nail Injury or Trauma
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="nailInjuryTrauma.present"
                        checked={formData.nailInjuryTrauma.present}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            nailInjuryTrauma: {
                              ...prev.nailInjuryTrauma,
                              present: true,
                            },
                          }))
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">PRESENT</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="nailInjuryTrauma.present"
                        checked={!formData.nailInjuryTrauma.present}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            nailInjuryTrauma: {
                              ...prev.nailInjuryTrauma,
                              present: false,
                            },
                          }))
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">NOT PRESENT</span>
                    </label>
                  </div>

                  {formData.nailInjuryTrauma.present && (
                    <div className="space-y-4 pl-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Do you experience any nail trauma? (e.g., crush
                          injury, nail biting)
                        </label>
                        <textarea
                          name="nailInjuryTrauma.description"
                          value={formData.nailInjuryTrauma.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              nailInjuryTrauma: {
                                ...prev.nailInjuryTrauma,
                                description: e.target.value,
                              },
                            }))
                          }
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Describe any nail trauma experiences..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Evidence of recent or past trauma (bruising,
                          lacerations)?
                        </label>
                        <textarea
                          name="nailInjuryTrauma.evidence"
                          value={formData.nailInjuryTrauma.evidence}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              nailInjuryTrauma: {
                                ...prev.nailInjuryTrauma,
                                evidence: e.target.value,
                              },
                            }))
                          }
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Describe any evidence of trauma..."
                        />
                      </div>
                    </div>
                  )}
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
                onClick={handleSubmit}
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Assessment
              </button>
            </div>
          </div>

          {/* History Table */}
          {historyRecords.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4 p-2">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Assessment History
                </h2>
                <button
                  onClick={handleNewRecord}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  New Record
                </button>
              </div>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Nurse/Physician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(
                            record.date_of_service
                          ).toLocaleDateString()}{" "}
                          at {new Date(record.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.physician_info
                            ? `${record.physician_info.full_name}, ${record.physician_info.position}`
                            : "Unknown"}
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
    </div>
  );
};

export default NailAssessmentPage;
