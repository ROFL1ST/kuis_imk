import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { classroomAPI } from "../../services/newFeatures";
import { Users, FileText, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const ClassroomDetail = () => {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await classroomAPI.getClassroomDetails(id);
      if (res.data.status === "success") {
        setClassroom(res.data.data.classroom);
        setAssignments(res.data.data.assignments || []);
        setMySubmissions(res.data.data.my_submissions || {});
      }
    } catch (error) {
      console.error("Failed to fetch details", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ClassroomSkeleton />;

  if (!classroom)
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Classroom not found or you don't have permission to view it.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-bold tracking-wider border border-white/20 w-fit">
              CODE: {classroom.code}
            </div>
            <div className="text-xs font-medium bg-black/20 px-3 py-1 rounded-full w-fit">
              {classroom.admin_id ? (
                <span>Created by Admin</span>
              ) : (
                <span>Teacher: {classroom.teacher?.name || "Unknown"}</span>
              )}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
            {classroom.name}
          </h1>
          <div className="flex items-center gap-2 opacity-90 font-medium">
            <Users className="w-4 h-4" />
            <span>{classroom.members?.length || 0} Members</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignments Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Assignments
            </h2>
            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              {assignments.length} Active
            </span>
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">
                No Assignments Yet
              </h3>
              <p className="text-gray-500 text-sm">
                Relax! There are no tasks due right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment, idx) => (
                <motion.div
                  key={assignment.ID}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{
                    scale: 1.01,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                  }}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all flex justify-between items-center group"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                      {assignment.quiz?.title || "Untitled Quiz"}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2 py-1 rounded-md text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Due:{" "}
                          {new Date(assignment.deadline).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-md font-medium text-gray-600">
                        {assignment.quiz?.questions?.length || "?"} Questions
                      </span>
                    </div>
                  </div>

                  {mySubmissions[assignment.ID] ? (
                    <div className="px-5 py-2.5 bg-green-100 ring-1 ring-green-200 text-green-700 font-bold rounded-xl flex items-center gap-2 text-sm cursor-default shadow-sm">
                      Done ({mySubmissions[assignment.ID].score})
                    </div>
                  ) : (
                    <Link
                      to={`/play/${assignment.quiz_id}`}
                      state={{
                        title: assignment.quiz?.title || "Assignment Quiz",
                        assignmentId: assignment.ID,
                        classroomId: classroom.ID,
                        classroomName: classroom.name,
                      }}
                      className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
                    >
                      Start
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar / Members (Simple List) */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-purple-600" />
            Classmates
          </h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24"
          >
            <div className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
              Student List ({classroom.members?.length || 0})
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {classroom.members?.map((member) => (
                <div
                  key={member.ID}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-50 shadow-sm">
                    {member.student?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {member.student?.name}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full w-fit mt-0.5">
                      Student
                    </p>
                  </div>
                </div>
              ))}
              {(!classroom.members || classroom.members.length === 0) && (
                <p className="text-center text-gray-400 text-sm py-4">
                  No other students yet.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Component
const ClassroomSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gray-200 rounded-3xl h-48 w-full relative overflow-hidden">
        <div className="absolute top-8 left-8 space-y-4">
          <div className="h-6 w-24 bg-gray-300 rounded-full"></div>
          <div className="h-10 w-64 bg-gray-300 rounded-lg"></div>
          <div className="h-5 w-32 bg-gray-300 rounded-lg"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignments Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-gray-100 h-28"
            >
              <div className="flex justify-between items-center h-full">
                <div className="space-y-3 w-3/4">
                  <div className="h-6 w-1/2 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 w-1/3 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Members Skeleton */}
        <div className="h-96 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded-lg mb-6"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded-lg"></div>
                <div className="h-2 w-16 bg-gray-100 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetail;
