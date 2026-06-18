/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

export type ReportStatus = "menunggu" | "diproses" | "selesai" | "eskalasi";

export interface TimelineStep {
  id: string;
  report_id: string;
  status: string;
  label: string;
  notes?: string;
  photo_evidence_url?: string;
  actor_id?: string;
  created_at: string;
}

export interface Report {
  id: string;
  ticket_number: string;
  reporter_id: string;
  category_id: string;
  region_id: string;
  title: string;
  description: string;
  photo_url?: string;
  location_address: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  assigned_officer_id?: string;
  anonymous: boolean;
  rating?: number;
  feedback_comment?: string;
  feedback_date?: string;
  created_at: string;
  updated_at: string;
  // Join data
  category?: { name: string; icon: string; color: string };
  timeline?: TimelineStep[];
  reporter?: { name: string };
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  role: "warga" | "petugas" | "admin";
  nik?: string;
  phone?: string;
  region_id?: string;
  active: boolean;
  region?: { name: string };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface State {
  user: Profile | null;
  reports: Report[];
  myReports: Report[];
  categories: Category[];
  notifications: AppNotification[];
  loading: boolean;
  logout: () => Promise<void>;
  addReport: (r: any) => Promise<{ data: Report | null; error: any }>;
  updateReport: (id: string, data: Partial<Pick<Report, "description" | "category_id" | "location_address" | "latitude" | "longitude" | "photo_url">>) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
  rateReport: (id: string, rating: number, feedback: string) => Promise<void>;
  markNotifsRead: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const Ctx = createContext<State | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    // Fetch categories
    const { data: catsData, error: catErr } = await supabase.from("categories").select("*");
    if (catErr) console.error("Store: Error fetching categories:", catErr);
    if (catsData) setCategories(catsData);

    // Fetch all reports (public feed for home page)
    const { data: reportsData, error: repErr } = await supabase
      .from("reports")
      .select("*, category:categories(*), timeline:report_timeline(*), reporter:profiles!reports_reporter_id_fkey(name)")
      .order("created_at", { ascending: false });

    if (repErr) console.error("Store: Error fetching reports:", repErr);
    if (reportsData) setReports(reportsData);

    if (!user) return;

    // Fetch MY reports only (filtered by reporter_id at database level)
    const { data: myReportsData, error: myRepErr } = await supabase
      .from("reports")
      .select("*, category:categories(*), timeline:report_timeline(*), reporter:profiles!reports_reporter_id_fkey(name)")
      .eq("reporter_id", user.id)
      .order("created_at", { ascending: false });

    if (myRepErr) console.error("Store: Error fetching my reports:", myRepErr);
    if (myReportsData) setMyReports(myReportsData);

    // Fetch notifications
    const { data: notifsData, error: notifErr } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (notifErr) console.error("Store: Error fetching notifications:", notifErr);
    if (notifsData) setNotifications(notifsData);
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setReports([]);
        setMyReports([]);
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, region:regions(name)")
      .eq("id", id)
      .single();

    if (data) {
      setUser(data);
      await refreshData();
    } else if (error) {
      console.error("Error fetching profile:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return false;
    const { error } = await supabase.from("profiles").update(data).eq("id", user.id);
    if (error) {
      console.error("Error updating profile:", error);
      return false;
    }
    await fetchProfile(user.id);
    return true;
  };

  const addReport = async (r: any) => {
    if (!user) return { data: null, error: "User not logged in" };

    let photo_url = r.photo_url;

    // Handle photo upload if it's a File object (to prevent 'value too long' base64 error)
    if (r.photo_file) {
      const file = r.photo_file as File;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`;
      const filePath = `report-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading photo:", uploadError);
        // Fallback or handle error
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('reports')
          .getPublicUrl(filePath);
        photo_url = publicUrl;
      }
    }

    const ticket_number = `RPT-${Date.now().toString().slice(-6)}`;
    const newReport = {
      ticket_number,
      reporter_id: user.id,
      category_id: r.category_id,
      description: r.description,
      location_address: r.location_address,
      latitude: r.latitude,
      longitude: r.longitude,
      photo_url: photo_url,
      anonymous: r.anonymous,
      status: "menunggu",
      region_id: user.region_id,
      title: r.description.slice(0, 50), // Fallback title
    };

    const { data, error } = await supabase.from("reports").insert([newReport]).select().single();

    if (error) {
      console.error("Error adding report:", error);
      return { data: null, error };
    }

    // Add initial timeline
    await supabase.from("report_timeline").insert([
      {
        report_id: data.id,
        status: "menunggu",
        label: "Laporan Diterima",
        notes: "Laporan Anda telah diterima oleh sistem dan menunggu verifikasi petugas.",
      },
    ]);

    // Create notification for the reporter
    const categoryName = categories.find(c => c.id === r.category_id)?.name || "Umum";
    const notifPayload = {
      user_id: user.id,
      title: "Laporan Terkirim",
      body: `Laporan ${data.ticket_number} (${categoryName}) berhasil dikirim dan sedang menunggu verifikasi petugas.`,
      read: false,
    };

    const { error: notifError } = await supabase.from("notifications").insert([notifPayload]);

    if (notifError) {
      console.warn("Notification insert to Supabase failed:", notifError);
      // Fallback: add notification locally so it still appears in the UI
      const localNotif: AppNotification = {
        id: `local-${Date.now()}`,
        user_id: user.id,
        title: notifPayload.title,
        body: notifPayload.body,
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications(prev => [localNotif, ...prev]);
    }

    await refreshData();
    return { data, error: null };
  };

  const updateReport = async (
    id: string,
    data: Partial<Pick<Report, "description" | "category_id" | "location_address" | "latitude" | "longitude" | "photo_url">>,
  ): Promise<boolean> => {
    if (!user) return false;

    // Only allow editing reports that are still "menunggu"
    const report = myReports.find((r) => r.id === id);
    if (!report || report.status !== "menunggu") {
      console.error("Cannot edit report: not found or status is not menunggu");
      return false;
    }
    if (report.reporter_id !== user.id) {
      console.error("Cannot edit report: not the owner");
      return false;
    }

    const updateData: Record<string, unknown> = { ...data };
    // Also update the title if description changed
    if (data.description) {
      updateData.title = data.description.slice(0, 50);
    }

    const { error } = await supabase.from("reports").update(updateData).eq("id", id);
    if (error) {
      console.error("Error updating report:", error);
      return false;
    }
    await refreshData();
    return true;
  };

  const deleteReport = async (id: string): Promise<boolean> => {
    if (!user) return false;

    // Only allow deleting reports that are still "menunggu"
    const report = myReports.find((r) => r.id === id);
    if (!report || report.status !== "menunggu") {
      console.error("Cannot delete report: not found or status is not menunggu");
      return false;
    }
    if (report.reporter_id !== user.id) {
      console.error("Cannot delete report: not the owner");
      return false;
    }

    // Delete timeline entries first (foreign key dependency)
    const { error: timelineError } = await supabase
      .from("report_timeline")
      .delete()
      .eq("report_id", id);
    if (timelineError) {
      console.error("Error deleting report timeline:", timelineError);
      return false;
    }

    // Delete the report itself
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) {
      console.error("Error deleting report:", error);
      return false;
    }

    await refreshData();
    return true;
  };

  const rateReport = async (id: string, rating: number, feedback_comment: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ rating, feedback_comment, feedback_date: new Date().toISOString() })
      .eq("id", id);

    if (error) console.error("Error rating report:", error);
    else await refreshData();
  };

  const markNotifsRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id);

    if (error) console.error("Error marking notifications as read:", error);
    else await refreshData();
  };

  return (
    <Ctx.Provider
      value={{
        user,
        reports,
        myReports,
        categories,
        notifications,
        loading,
        logout,
        addReport,
        updateReport,
        deleteReport,
        updateProfile,
        rateReport,
        markNotifsRead,
        refreshData,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const CATEGORIES = [
  { id: "Infrastruktur", icon: "🛣️", color: "bg-info/10 text-info" },
  { id: "Lingkungan", icon: "🌿", color: "bg-success/10 text-success" },
  { id: "Ketertiban", icon: "🚨", color: "bg-destructive/10 text-destructive" },
  { id: "Kesehatan", icon: "🏥", color: "bg-accent/10 text-accent" },
  { id: "Pendidikan", icon: "🎓", color: "bg-warning/10 text-warning" },
  { id: "Lainnya", icon: "📌", color: "bg-muted text-muted-foreground" },
];

export const STATUS_META: Record<ReportStatus, { label: string; className: string }> = {
  menunggu: {
    label: "Menunggu",
    className: "bg-warning/15 text-warning-foreground border-warning/30 text-[oklch(0.45_0.12_65)]",
  },
  diproses: { label: "Diproses", className: "bg-info/15 border-info/30 text-info" },
  selesai: { label: "Selesai", className: "bg-success/15 border-success/30 text-success" },
  eskalasi: {
    label: "Eskalasi",
    className: "bg-destructive/15 border-destructive/30 text-destructive",
  },
};
