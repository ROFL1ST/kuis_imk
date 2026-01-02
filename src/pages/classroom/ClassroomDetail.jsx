import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { classroomAPI } from "../../services/newFeatures";
import { Users, FileText, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const ClassroomDetail = () => {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await classroomAPI.getClassroomDetails(id);
      if (res.data.success) {
        setClassroom(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch details", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading classroom details...
      </div>
    );
  if (!classroom)
    return (
      <div className="p-8 text-center text-red-500">Classroom not found</div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-bold tracking-wider mb-4 border border-white/20">
            CODE: {classroom.code}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {classroom.name}
          </h1>
          <div className="flex items-center gap-2 opacity-90">
            <Users className="w-4 h-4" />
            <span>{classroom.members?.length || 0} Members</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignments Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Assignments
          </h2>

          {classroom.assignments?.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500">No active assignments yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classroom.assignments?.map((assignment) => (
                <motion.div
                  key={assignment.ID}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      {assignment.quiz?.title || "Untitled Quiz"}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>
                          Due:{" "}
                          {new Date(assignment.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/play/${assignment.quiz_id}`}
                    className="px-5 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 text-sm"
                  >
                    Start
                    <ChevronRight className="w-4 h-4" />
                  </Link>
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
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {classroom.members?.map((member) => (
                <div key={member.ID} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                    {member.student?.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {member.student?.name}
                    </p>
                    <p className="text-xs text-gray-400">Student</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetail;
