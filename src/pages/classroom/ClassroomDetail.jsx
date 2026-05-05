import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { classroomAPI } from "../../services/newFeatures";
import { useLanguage } from "../../context/LanguageContext";
import { Users, FileText, Clock, ChevronRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import UserAvatar from "../../components/ui/UserAvatar";
import Skeleton from "../../components/ui/Skeleton";

const ClassroomDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDetail(); }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await classroomAPI.getClassroomDetails(id);
      if (res.data.status === "success") {
        setClassroom(res.data.data.classroom);
        setAssignments(res.data.data.assignments || []);
        setMySubmissions(res.data.data.my_submissions || {});
      }
    } catch (error) {
      console.error("Gagal memuat detail", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ClassroomSkeleton />;

  if (!classroom)
    return (
      <div className="p-8 text-center font-black" style={{ color: "var(--color-danger)" }}>
        {t("classroom.notFound")}
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--color-brand-600) 0%, #7c3aed 100%)",
          boxShadow: "0 8px 32px rgb(99 102 241 / 0.30)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: "rgb(255 255 255 / 0.07)",
            transform: "translate(40%, -40%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: "rgb(255 255 255 / 0.05)",
            transform: "translate(-30%, 40%)",
            filter: "blur(30px)",
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider w-fit"
              style={{ background: "rgb(255 255 255 / 0.18)", color: "#fff", border: "1px solid rgb(255 255 255 / 0.20)" }}
            >
              {t("classroom.code")}: {classroom.code}
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold w-fit"
              style={{ background: "rgb(0 0 0 / 0.20)", color: "rgb(255 255 255 / 0.85)" }}
            >
              {t("classroom.teacher")}: {classroom.teacher?.name || "Tidak Diketahui"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
            {classroom.name}
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "rgb(255 255 255 / 0.75)" }}>
            <Users size={15} />
            <span>{classroom.members?.length || 0} {t("classroom.members")}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignments */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2" style={{ color: "var(--color-surface-100)" }}>
              <FileText size={18} style={{ color: "var(--color-brand-400)" }} />
              {t("classroom.assignments")}
            </h2>
            <span
              className="text-xs font-black px-2.5 py-1 rounded-lg"
              style={{ background: "var(--color-surface-800)", color: "var(--color-surface-400)", border: "1px solid var(--color-surface-700)" }}
            >
              {assignments.length} Aktif
            </span>
          </div>

          {assignments.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl border border-dashed"
              style={{
                background: "var(--color-surface-900)",
                borderColor: "var(--color-surface-700)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgb(99 102 241 / 0.12)" }}
              >
                <FileText size={20} style={{ color: "var(--color-brand-400)" }} />
              </div>
              <h3 className="font-black mb-1" style={{ color: "var(--color-surface-300)" }}>
                {t("classroom.noAssignments")}
              </h3>
              <p className="text-sm" style={{ color: "var(--color-surface-500)" }}>
                {t("classroom.relax")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment, idx) => (
                <AssignmentCard
                  key={assignment.ID}
                  assignment={assignment}
                  idx={idx}
                  mySubmissions={mySubmissions}
                  t={t}
                  classroom={classroom}
                />
              ))}
            </div>
          )}
        </div>

        {/* Members sidebar */}
        <div>
          <h2 className="text-lg font-black flex items-center gap-2 mb-5" style={{ color: "var(--color-surface-100)" }}>
            <Users size={18} style={{ color: "#a855f7" }} />
            {t("classroom.classmates")}
          </h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-5 rounded-2xl border sticky top-24"
            style={{
              background: "var(--color-surface-900)",
              border: "1px solid var(--color-surface-800)",
            }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-4"
              style={{ color: "var(--color-surface-500)" }}
            >
              {t("classroom.studentList")} ({classroom.members?.length || 0})
            </p>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {classroom.members?.map((member, key) => (
                <MemberCard key={key} member={member} t={t} />
              ))}
              {(!classroom.members || classroom.members.length === 0) && (
                <p className="text-center text-sm py-4" style={{ color: "var(--color-surface-500)" }}>
                  {t("classroom.noStudents")}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const AssignmentCard = ({ assignment, idx, mySubmissions, t, classroom }) => {
  const now = new Date();
  const deadline = new Date(assignment.deadline);
  const isExpired = now > deadline;
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isUrgent = !isExpired && diffDays <= 7;

  const cardBg = isExpired
    ? "rgb(239 68 68 / 0.05)"
    : isUrgent
    ? "rgb(245 158 11 / 0.06)"
    : "var(--color-surface-900)";
  const cardBorder = isExpired
    ? "rgb(239 68 68 / 0.20)"
    : isUrgent
    ? "rgb(245 158 11 / 0.25)"
    : "var(--color-surface-800)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.08 }}
      className="p-4 rounded-2xl border flex justify-between items-center gap-4"
      style={{ background: cardBg, borderColor: cardBorder }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h3
            className="font-black text-sm"
            style={{ color: isExpired ? "var(--color-surface-600)" : "var(--color-surface-100)" }}
          >
            {assignment.quiz?.title || "Kuis Tanpa Judul"}
          </h3>
          {isExpired && (
            <span
              className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
              style={{ background: "rgb(239 68 68 / 0.15)", color: "#f87171" }}
            >
              Expired
            </span>
          )}
          {isUrgent && (
            <span
              className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse"
              style={{ background: "rgb(245 158 11 / 0.15)", color: "#f59e0b" }}
            >
              H-{diffDays}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
            style={{
              background: isExpired
                ? "rgb(239 68 68 / 0.10)"
                : isUrgent
                ? "rgb(245 158 11 / 0.10)"
                : "var(--color-surface-800)",
              color: isExpired ? "#f87171" : isUrgent ? "#f59e0b" : "var(--color-surface-400)",
            }}
          >
            <Clock size={11} />
            <span>
              {t("classroom.deadline")}:{" "}
              {deadline.toLocaleDateString("id-ID", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <span
            className="text-xs px-2 py-1 rounded-lg font-medium"
            style={{ background: "var(--color-surface-800)", color: "var(--color-surface-500)" }}
          >
            {assignment.quiz?.questions?.length || "?"} {t("classroom.questions")}
          </span>
        </div>
      </div>

      {mySubmissions[assignment.ID] ? (
        <div
          className="px-4 py-2 rounded-xl text-sm font-black shrink-0"
          style={{
            background: "rgb(34 197 94 / 0.12)",
            color: "#4ade80",
            border: "1px solid rgb(34 197 94 / 0.20)",
          }}
        >
          ✓ {mySubmissions[assignment.ID].score}
        </div>
      ) : isExpired ? (
        <div
          className="px-4 py-2 rounded-xl text-sm font-black shrink-0"
          style={{
            background: "var(--color-surface-800)",
            color: "var(--color-surface-600)",
            cursor: "not-allowed",
          }}
        >
          {t("classroom.deadline")} Lewat
        </div>
      ) : (
        <Link
          to={`/play/${assignment.quiz_id}`}
          state={{
            title: assignment.quiz?.title || "Kuis Tugas",
            assignmentId: assignment.ID,
            classroomId: classroom.ID,
            classroomName: classroom.name,
          }}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white transition-all"
          style={{
            background: "var(--color-brand-500)",
            boxShadow: "0 4px 16px rgb(99 102 241 / 0.30)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-brand-600)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-brand-500)")}
        >
          {t("classroom.start")}
          <ChevronRight size={14} />
        </Link>
      )}
    </motion.div>
  );
};

const MemberCard = ({ member }) => (
  <div
    className="flex items-center gap-3 p-2 rounded-xl transition-colors"
    style={{ cursor: "default" }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-800)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    <UserAvatar user={member.student} size="sm" />
    <div>
      <p className="font-black text-sm" style={{ color: "var(--color-surface-200)" }}>
        {member.student?.name}
      </p>
      <span
        className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full w-fit block mt-0.5"
        style={{ background: "rgb(99 102 241 / 0.12)", color: "var(--color-brand-400)" }}
      >
        Siswa
      </span>
    </div>
  </div>
);

const ClassroomSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-8 pb-20">
    <Skeleton className="h-52 rounded-3xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-6 w-40" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div
          className="p-5 rounded-2xl space-y-4"
          style={{ border: "1px solid var(--color-surface-800)", background: "var(--color-surface-900)" }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ClassroomDetail;
