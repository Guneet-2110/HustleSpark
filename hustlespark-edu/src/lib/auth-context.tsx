"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Classroom, Student } from "@/types";
import {
  getClassroomByJoinCode,
  joinClassroomAsStudent,
  loginStudentWithPin,
  getClassroomsByTeacher,
  createClassroom
} from "./classroom";

interface AuthContextType {
  user: User | null;
  role: "teacher" | "student" | null;
  studentProfile: Student | null;
  activeClassroom: Classroom | null;
  loading: boolean;
  signupTeacher: (email: string, pass: string, name: string, className?: string) => Promise<void>;
  loginTeacher: (email: string, pass: string) => Promise<void>;
  joinAsStudent: (joinCode: string, username: string, pin: string, avatar: string) => Promise<Student>;
  loginAsStudentWithPin: (joinCode: string, username: string, pin: string) => Promise<Student>;
  logout: () => Promise<void>;
  setActiveClassroom: (classroom: Classroom | null) => void;
  refreshStudentProfile: () => Promise<void>;
  loadTeacherClassrooms: () => Promise<Classroom[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"teacher" | "student" | null>(null);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (currentUser.isAnonymous) {
          setRole("student");
          const savedClassroomId = localStorage.getItem("hustlespark_student_classroomId");
          const savedStudentUid = localStorage.getItem("hustlespark_student_uid") || currentUser.uid;

          if (savedClassroomId) {
            try {
              const studentRef = doc(db, "classrooms", savedClassroomId, "students", savedStudentUid);
              const studentSnap = await getDoc(studentRef);
              if (studentSnap.exists()) {
                const sData = { id: studentSnap.id, ...studentSnap.data(), classroomId: savedClassroomId } as Student;
                setStudentProfile(sData);

                const classSnap = await getDoc(doc(db, "classrooms", savedClassroomId));
                if (classSnap.exists()) {
                  setActiveClassroom({ id: classSnap.id, ...classSnap.data() } as Classroom);
                }
              }
            } catch (e) {
              console.error("Error restoring student profile on refresh:", e);
            }
          }
        } else {
          setRole("teacher");
          try {
            let teacherClasses = await getClassroomsByTeacher(currentUser.uid);
            if (teacherClasses.length === 0) {
              const teacherName = currentUser.displayName || currentUser.email?.split("@")[0] || "Teacher";
              const newClass = await createClassroom(currentUser.uid, teacherName, "My Entrepreneurship Class", "SparkCoins", 500);
              teacherClasses = [newClass];
            }
            setActiveClassroom(teacherClasses[0]);
          } catch (e) {
            console.error("Error loading teacher classrooms on auth state change:", e);
            try {
              const teacherName = currentUser.displayName || currentUser.email?.split("@")[0] || "Teacher";
              const fallbackClass = await createClassroom(currentUser.uid, teacherName, "My Entrepreneurship Class", "SparkCoins", 500);
              setActiveClassroom(fallbackClass);
            } catch (fErr) {
              console.error("Fallback classroom creation error:", fErr);
            }
          }
        }
      } else {
        const savedClassroomId = localStorage.getItem("hustlespark_student_classroomId");
        const savedUsername = localStorage.getItem("hustlespark_student_username");
        const savedPin = localStorage.getItem("hustlespark_student_pin");

        if (savedClassroomId && savedUsername && savedPin) {
          try {
            const res = await signInAnonymously(auth);
            const { student, classroom } = await loginStudentWithPin(savedClassroomId, savedUsername, savedPin);
            setUser(res.user);
            setRole("student");
            setStudentProfile(student);
            setActiveClassroom(classroom);
          } catch (err) {
            console.error("Auto student session restoration failed:", err);
            setRole(null);
            setStudentProfile(null);
            setActiveClassroom(null);
          }
        } else {
          setRole(null);
          setStudentProfile(null);
          setActiveClassroom(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadTeacherClassrooms = async (): Promise<Classroom[]> => {
    if (!user) return [];
    try {
      let teacherClasses = await getClassroomsByTeacher(user.uid);
      if (teacherClasses.length === 0) {
        const teacherName = user.displayName || user.email?.split("@")[0] || "Teacher";
        const newClass = await createClassroom(user.uid, teacherName, "My Entrepreneurship Class", "SparkCoins", 500);
        teacherClasses = [newClass];
      }
      setActiveClassroom(teacherClasses[0]);
      return teacherClasses;
    } catch (err) {
      console.error("Error in loadTeacherClassrooms, creating fallback classroom:", err);
      const teacherName = user.displayName || user.email?.split("@")[0] || "Teacher";
      const fallbackClass = await createClassroom(user.uid, teacherName, "My Entrepreneurship Class", "SparkCoins", 500);
      setActiveClassroom(fallbackClass);
      return [fallbackClass];
    }
  };

  const signupTeacher = async (email: string, pass: string, name: string, className: string = "Grade 5 Entrepreneurs") => {
    if (auth.currentUser) {
      await signOut(auth);
    }
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name.trim() });
        setUser(res.user);
        setRole("teacher");
        const newClass = await createClassroom(res.user.uid, name.trim(), className.trim(), "SparkCoins", 500);
        setActiveClassroom(newClass);
        console.log("[Auth] Teacher account created successfully:", res.user.uid);
      }
    } catch (err: any) {
      console.error("[Auth] signupTeacher error code:", err.code, err.message);
      if (err.code === "auth/email-already-in-use") {
        throw new Error("An account already exists with this email address. Please log in instead.");
      } else if (err.code === "auth/weak-password") {
        throw new Error("Password should be at least 6 characters.");
      } else {
        throw new Error(err.message || "Failed to create teacher account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loginTeacher = async (email: string, pass: string) => {
    if (auth.currentUser) {
      await signOut(auth);
    }
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(res.user);
      setRole("teacher");
      let teacherClasses = await getClassroomsByTeacher(res.user.uid);
      if (teacherClasses.length === 0) {
        const teacherName = res.user.displayName || email.split("@")[0] || "Teacher";
        const newClass = await createClassroom(res.user.uid, teacherName, "My Entrepreneurship Class", "SparkCoins", 500);
        teacherClasses = [newClass];
      }
      setActiveClassroom(teacherClasses[0]);
      console.log("[Auth] Teacher logged in successfully:", res.user.uid);
    } catch (err: any) {
      console.error("[Auth] loginTeacher error code:", err.code, err.message);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        throw new Error("Wrong password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        throw new Error("No account found with this email. Please sign up first.");
      } else if (err.code === "auth/too-many-requests") {
        throw new Error("Too many failed attempts. Please wait a few minutes.");
      } else if (err.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      } else {
        throw new Error(err.message || "Failed to log in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const joinAsStudent = async (joinCode: string, username: string, pin: string, avatar: string) => {
    let authUser = auth.currentUser;
    if (!authUser || !authUser.isAnonymous) {
      const res = await signInAnonymously(auth);
      authUser = res.user;
    }

    const targetClass = await getClassroomByJoinCode(joinCode);
    if (!targetClass) {
      throw new Error("Invalid class code! Please check with your teacher.");
    }

    const student = await joinClassroomAsStudent(
      targetClass.id,
      authUser.uid,
      username,
      pin,
      avatar,
      targetClass.startingBalance || 500
    );

    localStorage.setItem("hustlespark_student_classroomId", targetClass.id);
    localStorage.setItem("hustlespark_student_username", student.username);
    localStorage.setItem("hustlespark_student_pin", pin);
    localStorage.setItem("hustlespark_student_uid", student.id);

    setUser(authUser);
    setStudentProfile(student);
    setActiveClassroom(targetClass);
    setRole("student");
    return student;
  };

  const loginAsStudentWithPin = async (joinCode: string, username: string, pin: string) => {
    let authUser = auth.currentUser;
    if (!authUser || !authUser.isAnonymous) {
      const res = await signInAnonymously(auth);
      authUser = res.user;
    }

    const { student, classroom } = await loginStudentWithPin(joinCode, username, pin);

    localStorage.setItem("hustlespark_student_classroomId", classroom.id);
    localStorage.setItem("hustlespark_student_username", student.username);
    localStorage.setItem("hustlespark_student_pin", pin);
    localStorage.setItem("hustlespark_student_uid", student.id);

    setUser(authUser);
    setStudentProfile(student);
    setActiveClassroom(classroom);
    setRole("student");
    return student;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("hustlespark_student_classroomId");
    localStorage.removeItem("hustlespark_student_username");
    localStorage.removeItem("hustlespark_student_pin");
    localStorage.removeItem("hustlespark_student_uid");
    setUser(null);
    setRole(null);
    setStudentProfile(null);
    setActiveClassroom(null);
  };

  const refreshStudentProfile = async () => {
    if (activeClassroom) {
      const savedStudentUid = localStorage.getItem("hustlespark_student_uid") || (user ? user.uid : null);
      if (savedStudentUid) {
        const studentRef = doc(db, "classrooms", activeClassroom.id, "students", savedStudentUid);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          setStudentProfile({ id: studentSnap.id, ...studentSnap.data(), classroomId: activeClassroom.id } as Student);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        studentProfile,
        activeClassroom,
        loading,
        signupTeacher,
        loginTeacher,
        joinAsStudent,
        loginAsStudentWithPin,
        logout,
        setActiveClassroom,
        refreshStudentProfile,
        loadTeacherClassrooms,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
