import { useState, useEffect } from 'react';
import { Plus, GraduationCap, Users, Calendar, CheckSquare, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Course {
  id: string;
  name: string;
  modality: string;
}

interface Class {
  id: string;
  course_id: string;
  name: string;
  day_of_week: string;
  class_time: string;
  total_classes: number;
  modality: 'EAD' | 'VIDEOCONFERENCIA';
  status: 'active' | 'closed';
  courses?: { name: string; modality: string };
  _count?: { students: number };
}

interface Student {
  id: string;
  full_name: string;
}

export function ClassesTab() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    course_id: '',
    name: '',
    day_of_week: 'Segunda-feira',
    class_time: '',
    total_classes: '',
    modality: 'VIDEOCONFERENCIA' as 'EAD' | 'VIDEOCONFERENCIA',
  });

  useEffect(() => {
    loadCourses();
    loadClasses();
  }, []);

  const loadCourses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('courses')
      .select('id, name, modality')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error loading courses:', error);
      return;
    }

    setCourses(data || []);
  };

  const loadClasses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('classes')
      .select('*, courses(name, modality)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading classes:', error);
      return;
    }

    const classesWithCount = await Promise.all(
      (data || []).map(async (cls) => {
        const { count } = await supabase
          .from('class_students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', cls.id);

        return { ...cls, _count: { students: count || 0 } };
      })
    );

    setClasses(classesWithCount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('classes').insert([
      {
        user_id: user.id,
        course_id: formData.course_id,
        name: formData.name,
        day_of_week: formData.day_of_week,
        class_time: formData.class_time,
        total_classes: parseInt(formData.total_classes),
        modality: formData.modality,
        status: 'active',
      },
    ]);

    if (error) {
      console.error('Error adding class:', error);
      alert('Erro ao adicionar turma');
      return;
    }

    resetForm();
    loadClasses();
  };

  const resetForm = () => {
    setShowModal(false);
    setFormData({
      course_id: '',
      name: '',
      day_of_week: 'Segunda-feira',
      class_time: '',
      total_classes: '',
      modality: 'VIDEOCONFERENCIA',
    });
  };

  const handleCourseChange = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    setFormData({
      ...formData,
      course_id: courseId,
      modality: (course?.modality || 'VIDEOCONFERENCIA') as 'EAD' | 'VIDEOCONFERENCIA',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Turmas</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Turma</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{cls.name}</h3>
                  <p className="text-sm text-slate-600">{cls.courses?.name}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cls.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cls.status === 'active' ? 'Ativa' : 'Encerrada'}
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {cls.day_of_week} às {cls.class_time}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{cls._count?.students || 0} alunos matriculados</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4" />
                <span>{cls.total_classes} aulas no ciclo</span>
              </div>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  cls.modality === 'EAD'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {cls.modality === 'EAD' ? 'EAD 24h' : 'Videoconferência'}
              </span>
            </div>

            <button
              onClick={() => setSelectedClass(cls)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Gerenciar Turma
            </button>
          </div>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Nenhuma turma cadastrada</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Nova Turma</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Curso</label>
                <select
                  value={formData.course_id}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione um curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} - {course.modality}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Turma</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Turma A - 2024"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dia da Semana</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option>Segunda-feira</option>
                    <option>Terça-feira</option>
                    <option>Quarta-feira</option>
                    <option>Quinta-feira</option>
                    <option>Sexta-feira</option>
                    <option>Sábado</option>
                    <option>Domingo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Horário</label>
                  <input
                    type="time"
                    value={formData.class_time}
                    onChange={(e) => setFormData({ ...formData, class_time: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total de Aulas no Ciclo</label>
                <input
                  type="number"
                  value={formData.total_classes}
                  onChange={(e) => setFormData({ ...formData, total_classes: e.target.value })}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Criar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedClass && (
        <ClassManagementModal
          classData={selectedClass}
          onClose={() => {
            setSelectedClass(null);
            loadClasses();
          }}
        />
      )}
    </div>
  );
}

interface ClassManagementModalProps {
  classData: Class;
  onClose: () => void;
}

function ClassManagementModal({ classData, onClose }: ClassManagementModalProps) {
  const [tab, setTab] = useState<'students' | 'attendance' | 'close'>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadClassStudents();
    loadAvailableStudents();
  }, []);

  const loadClassStudents = async () => {
    const { data, error } = await supabase
      .from('class_students')
      .select('*, students(*)')
      .eq('class_id', classData.id);

    if (error) {
      console.error('Error loading class students:', error);
      return;
    }

    if (classData.modality === 'VIDEOCONFERENCIA') {
      const studentsWithAttendance = await Promise.all(
        (data || []).map(async (cs) => {
          const { count: presentCount } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classData.id)
            .eq('student_id', cs.student_id)
            .eq('present', true);

          const percentage = ((presentCount || 0) / classData.total_classes) * 100;

          return {
            ...cs,
            attendanceCount: presentCount || 0,
            attendancePercentage: percentage,
          };
        })
      );

      setStudents(studentsWithAttendance);
    } else {
      const studentsWithAccess = await Promise.all(
        (data || []).map(async (cs) => {
          const { data: accessData } = await supabase
            .from('ead_access')
            .select('*')
            .eq('class_id', classData.id)
            .eq('student_id', cs.student_id)
            .maybeSingle();

          const accessCount = [
            accessData?.access_date_1,
            accessData?.access_date_2,
            accessData?.access_date_3,
          ].filter(Boolean).length;

          return {
            ...cs,
            accessData,
            isPresent: accessCount > 0,
          };
        })
      );

      setStudents(studentsWithAccess);
    }
  };

  const loadAvailableStudents = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('students')
      .select('id, full_name')
      .eq('user_id', user.id)
      .order('full_name');

    if (error) {
      console.error('Error loading students:', error);
      return;
    }

    const enrolledIds = students.map((s) => s.student_id);
    const available = (data || []).filter((s) => !enrolledIds.includes(s.id));

    setAvailableStudents(available);
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudent) return;

    const { error } = await supabase.from('class_students').insert([
      {
        class_id: classData.id,
        student_id: selectedStudent,
      },
    ]);

    if (error) {
      console.error('Error enrolling student:', error);
      alert('Erro ao matricular aluno');
      return;
    }

    if (classData.modality === 'EAD') {
      await supabase.from('ead_access').insert([
        {
          class_id: classData.id,
          student_id: selectedStudent,
        },
      ]);
    }

    setSelectedStudent('');
    loadClassStudents();
    loadAvailableStudents();
  };

  const handleCloseClass = async () => {
    const { error } = await supabase
      .from('classes')
      .update({ status: 'closed' })
      .eq('id', classData.id);

    if (error) {
      console.error('Error closing class:', error);
      alert('Erro ao encerrar turma');
      return;
    }

    alert('Turma encerrada com sucesso!');
    onClose();
  };

  const handleIssueCertificate = async (studentId: string, percentage: number) => {
    const { error } = await supabase.from('certificates').insert([
      {
        class_id: classData.id,
        student_id: studentId,
        issue_date: new Date().toISOString().split('T')[0],
        attendance_percentage: percentage,
      },
    ]);

    if (error) {
      console.error('Error issuing certificate:', error);
      alert('Erro ao emitir certificado');
      return;
    }

    alert('Certificado emitido com sucesso!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{classData.name}</h3>
            <p className="text-slate-600">{classData.courses?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="border-b border-slate-200 mb-6">
          <nav className="flex space-x-1">
            <button
              onClick={() => setTab('students')}
              className={`px-4 py-2 font-medium transition-colors ${
                tab === 'students'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Alunos
            </button>
            <button
              onClick={() => setTab('attendance')}
              className={`px-4 py-2 font-medium transition-colors ${
                tab === 'attendance'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {classData.modality === 'EAD' ? 'Acessos' : 'Frequência'}
            </button>
            {classData.status === 'active' && (
              <button
                onClick={() => setTab('close')}
                className={`px-4 py-2 font-medium transition-colors ${
                  tab === 'close'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Encerrar Ciclo
              </button>
            )}
          </nav>
        </div>

        {tab === 'students' && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione um aluno</option>
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleEnrollStudent}
                disabled={!selectedStudent}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Matricular
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Aluno
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {student.students.full_name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Matriculado
                        </span>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                        Nenhum aluno matriculado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'attendance' && classData.modality === 'VIDEOCONFERENCIA' && (
          <VideoconferenciaAttendance
            classData={classData}
            students={students}
            onUpdate={loadClassStudents}
          />
        )}

        {tab === 'attendance' && classData.modality === 'EAD' && (
          <EADAccessManagement
            classData={classData}
            students={students}
            onUpdate={loadClassStudents}
          />
        )}

        {tab === 'close' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Resumo do Ciclo</h4>
              <p className="text-sm text-amber-700">
                Total de alunos: {students.length}
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Aluno
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      {classData.modality === 'EAD' ? 'Status' : 'Frequência'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((student) => {
                    const canCertify =
                      classData.modality === 'VIDEOCONFERENCIA'
                        ? student.attendancePercentage >= 60
                        : student.isPresent;

                    return (
                      <tr key={student.id}>
                        <td className="px-4 py-3 text-sm text-slate-800">
                          {student.students.full_name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {classData.modality === 'VIDEOCONFERENCIA' ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                student.attendancePercentage >= 60
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {student.attendancePercentage.toFixed(1)}% ({student.attendanceCount}/
                              {classData.total_classes})
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                student.isPresent
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {student.isPresent ? 'Frequente' : 'Ausente'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {canCertify && (
                            <button
                              onClick={() =>
                                handleIssueCertificate(
                                  student.student_id,
                                  classData.modality === 'VIDEOCONFERENCIA'
                                    ? student.attendancePercentage
                                    : 100
                                )
                              }
                              className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              <Award className="w-4 h-4" />
                              <span>Emitir Certificado</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleCloseClass}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Encerrar Turma
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoconferenciaAttendance({ classData, students, onUpdate }: any) {
  const [classNumber, setClassNumber] = useState(1);
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const handleSaveAttendance = async () => {
    for (const student of students) {
      const present = attendance[student.student_id] || false;

      await supabase.from('attendance').upsert(
        [
          {
            class_id: classData.id,
            student_id: student.student_id,
            class_number: classNumber,
            class_date: classDate,
            present,
          },
        ],
        { onConflict: 'class_id,student_id,class_number' }
      );
    }

    alert('Frequência registrada!');
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Número da Aula</label>
          <input
            type="number"
            min="1"
            max={classData.total_classes}
            value={classNumber}
            onChange={(e) => setClassNumber(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Data da Aula</label>
          <input
            type="date"
            value={classDate}
            onChange={(e) => setClassDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Aluno</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Presente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student: any) => (
              <tr key={student.id}>
                <td className="px-4 py-3 text-sm text-slate-800">{student.students.full_name}</td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={attendance[student.student_id] || false}
                    onChange={(e) =>
                      setAttendance({ ...attendance, [student.student_id]: e.target.checked })
                    }
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSaveAttendance}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Salvar Frequência
      </button>
    </div>
  );
}

function EADAccessManagement({ students, onUpdate }: any) {
  const [accessData, setAccessData] = useState<Record<string, any>>({});

  useEffect(() => {
    const initial: Record<string, any> = {};
    students.forEach((student: any) => {
      initial[student.student_id] = {
        access_date_1: student.accessData?.access_date_1 || '',
        access_date_2: student.accessData?.access_date_2 || '',
        access_date_3: student.accessData?.access_date_3 || '',
      };
    });
    setAccessData(initial);
  }, [students]);

  const handleSaveAccess = async (studentId: string, classId: string) => {
    const data = accessData[studentId];

    await supabase
      .from('ead_access')
      .upsert(
        [
          {
            class_id: classId,
            student_id: studentId,
            access_date_1: data.access_date_1 || null,
            access_date_2: data.access_date_2 || null,
            access_date_3: data.access_date_3 || null,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'class_id,student_id' }
      );

    alert('Acessos atualizados!');
    onUpdate();
  };

  return (
    <div className="space-y-4">
      {students.map((student: any) => (
        <div key={student.id} className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-slate-800 mb-3">{student.students.full_name}</h4>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[1, 2, 3].map((num) => (
              <div key={num}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Acesso {num}
                </label>
                <input
                  type="date"
                  value={accessData[student.student_id]?.[`access_date_${num}`] || ''}
                  onChange={(e) =>
                    setAccessData({
                      ...accessData,
                      [student.student_id]: {
                        ...accessData[student.student_id],
                        [`access_date_${num}`]: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => handleSaveAccess(student.student_id, student.class_id)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Salvar Acessos
          </button>
        </div>
      ))}
    </div>
  );
}
