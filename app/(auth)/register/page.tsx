"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { QrCodeIcon, Loader2Icon, EyeIcon, EyeOffIcon, CheckCircle2Icon } from "lucide-react";

import { registerSchema, RegisterInput } from "@/validators/auth";
import { registerUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AcademicItem {
  _id: string;
  name: string;
  code: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Dynamic dropdown states
  const [institutions, setInstitutions] = useState<AcademicItem[]>([]);
  const [departments, setDepartments] = useState<AcademicItem[]>([]);
  const [programmes, setProgrammes] = useState<AcademicItem[]>([]);

  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingProgrammes, setIsLoadingProgrammes] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
      institutionId: "",
      matricNumber: "",
      staffId: "",
      departmentId: "",
      programmeId: "",
      currentLevel: 100,
    },
  });

  const role = watch("role");
  const selectedInstitutionId = watch("institutionId");
  const selectedDepartmentId = watch("departmentId");

  // Fetch institutions on mount
  useEffect(() => {
    async function loadInstitutions() {
      setIsLoadingInstitutions(true);
      try {
        const res = await fetch("/api/academic-data?type=institutions");
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data);
        }
      } catch (err) {
        console.error("Failed to load institutions", err);
      } finally {
        setIsLoadingInstitutions(false);
      }
    }
    loadInstitutions();
  }, []);

  // Fetch departments when institution changes
  useEffect(() => {
    if (!selectedInstitutionId) {
      setDepartments([]);
      setValue("departmentId", "");
      return;
    }

    async function loadDepartments() {
      setIsLoadingDepartments(true);
      try {
        const res = await fetch(`/api/academic-data?type=departments&institutionId=${selectedInstitutionId}`);
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
        }
      } catch (err) {
        console.error("Failed to load departments", err);
      } finally {
        setIsLoadingDepartments(false);
      }
    }
    loadDepartments();
  }, [selectedInstitutionId, setValue]);

  // Fetch programmes when department changes
  useEffect(() => {
    if (!selectedDepartmentId) {
      setProgrammes([]);
      setValue("programmeId", "");
      return;
    }

    async function loadProgrammes() {
      setIsLoadingProgrammes(true);
      try {
        const res = await fetch(`/api/academic-data?type=programmes&departmentId=${selectedDepartmentId}`);
        if (res.ok) {
          const data = await res.json();
          setProgrammes(data);
        }
      } catch (err) {
        console.error("Failed to load programmes", err);
      } finally {
        setIsLoadingProgrammes(false);
      }
    }
    loadProgrammes();
  }, [selectedDepartmentId, setValue]);

  const handleNextStep = async () => {
    // Validate current step fields before proceeding
    const fieldsToValidate = step === 1 
      ? ["name", "email", "password", "confirmPassword", "role", "institutionId"] as const
      : [];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await registerUser(data);
      if (response.success) {
        toast.success("Account created successfully! Please log in.");
        router.push("/login");
      } else {
        toast.error(response.error || "Failed to create account");
        setIsLoading(false);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-muted/50 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <QrCodeIcon className="size-8" />
          </div>
          <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            QRAttend
          </span>
        </div>

        <Card className="border-muted/60 shadow-xl backdrop-blur-md bg-card/90">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 ? "Step 1: Credentials & Role" : "Step 2: Profile Details"}
            </CardDescription>
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className={`h-2 w-12 rounded-full transition-colors duration-300 ${step === 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 w-12 rounded-full transition-colors duration-300 ${step === 2 ? "bg-primary" : "bg-muted"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                {/* STEP 1 */}
                <div
                  className={`space-y-4 transition-all duration-300 ${
                    step === 1 ? "block opacity-100" : "hidden opacity-0"
                  }`}
                >
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        {...register("name")}
                        className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                        disabled={isLoading}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive font-medium">{errors.name.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@university.edu"
                        {...register("email")}
                        className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive font-medium">{errors.email.message as string}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("password")}
                            className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-destructive font-medium">{errors.password.message as string}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("confirmPassword")}
                            className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message as string}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Portal Role</Label>
                        <Select
                          defaultValue="student"
                          onValueChange={(val: any) => setValue("role", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="lecturer">Lecturer</SelectItem>
                            <SelectItem value="institution_admin">Institution Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="institution">Institution</Label>
                        <Select
                          value={selectedInstitutionId}
                          onValueChange={(val: string | null) => setValue("institutionId", val || "")}
                          disabled={isLoadingInstitutions}
                        >
                          <SelectTrigger className={errors.institutionId ? "border-destructive" : ""}>
                            <SelectValue placeholder={isLoadingInstitutions ? "Loading..." : "Select Institution"}>
                              {institutions.find(i => i._id === selectedInstitutionId)?.name || (isLoadingInstitutions ? "Loading..." : "Select Institution")}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {institutions.map((inst) => (
                              <SelectItem key={inst._id} value={inst._id}>
                                {inst.name} ({inst.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.institutionId && (
                          <p className="text-xs text-destructive font-medium">{errors.institutionId.message as string}</p>
                        )}
                      </div>
                    </div>

                    <Button type="button" className="w-full mt-4 h-11" onClick={handleNextStep}>
                      Next Step
                    </Button>
                </div>

                {/* STEP 2 */}
                <div
                  className={`space-y-4 transition-all duration-300 ${
                    step === 2 ? "block opacity-100" : "hidden opacity-0"
                  }`}
                >
                    {/* Common Details for Lecturers / Students */}
                    {(role === "student" || role === "lecturer") && (
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={selectedDepartmentId}
                          onValueChange={(val: string | null) => setValue("departmentId", val || "")}
                          disabled={isLoadingDepartments || departments.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingDepartments ? "Loading..." : departments.length === 0 ? "Select an institution first" : "Select Department"}>
                              {departments.find(d => d._id === selectedDepartmentId)?.name || (isLoadingDepartments ? "Loading..." : departments.length === 0 ? "Select an institution first" : "Select Department")}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept._id} value={dept._id}>
                                {dept.name} ({dept.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Student Profile Info */}
                    {role === "student" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="matricNumber">Matriculation / Student Number</Label>
                          <Input
                            id="matricNumber"
                            placeholder="AGU/CS/2026/001"
                            {...register("matricNumber")}
                            className={errors.matricNumber ? "border-destructive focus-visible:ring-destructive" : ""}
                            disabled={isLoading}
                          />
                          {errors.matricNumber && (
                            <p className="text-xs text-destructive font-medium">{errors.matricNumber.message as string}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="programme">Programme</Label>
                            <Select
                              value={watch("programmeId")}
                              onValueChange={(val: string | null) => setValue("programmeId", val || "")}
                              disabled={isLoadingProgrammes || programmes.length === 0}
                            >
                              <SelectTrigger className={errors.programmeId ? "border-destructive" : ""}>
                                <SelectValue placeholder={isLoadingProgrammes ? "Loading..." : programmes.length === 0 ? "Select department first" : "Select Programme"}>
                                  {programmes.find(p => p._id === watch("programmeId"))?.name || (isLoadingProgrammes ? "Loading..." : programmes.length === 0 ? "Select department first" : "Select Programme")}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {programmes.map((prog) => (
                                  <SelectItem key={prog._id} value={prog._id}>
                                    {prog.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="currentLevel">Current Level</Label>
                            <Select
                              defaultValue="100"
                              onValueChange={(val: string | null) => setValue("currentLevel", val ? parseInt(val) : 100)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="100">100 Level</SelectItem>
                                <SelectItem value="200">200 Level</SelectItem>
                                <SelectItem value="300">300 Level</SelectItem>
                                <SelectItem value="400">400 Level</SelectItem>
                                <SelectItem value="500">500 Level</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Lecturer Profile Info */}
                    {role === "lecturer" && (
                      <div className="space-y-2">
                        <Label htmlFor="staffId">Staff Identification Number</Label>
                        <Input
                          id="staffId"
                          placeholder="AGU/L/042"
                          {...register("staffId")}
                          className={errors.staffId ? "border-destructive focus-visible:ring-destructive" : ""}
                          disabled={isLoading}
                        />
                        {errors.staffId && (
                          <p className="text-xs text-destructive font-medium">{errors.staffId.message as string}</p>
                        )}
                      </div>
                    )}

                    {/* Institution Admin Notice */}
                    {role === "institution_admin" && (
                      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex gap-3 items-start">
                        <CheckCircle2Icon className="size-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-primary">Institution Administration Request</p>
                          <p className="text-muted-foreground mt-1">
                            Your account request will be mapped directly as the administrator for the selected institution.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-1/2 h-11"
                        onClick={() => setStep(1)}
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                      <Button type="submit" className="w-1/2 h-11" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2Icon className="mr-2 size-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-center w-full text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Log in here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
