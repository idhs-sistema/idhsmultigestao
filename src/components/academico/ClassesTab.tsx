function EADAccessManagement({ classData, students, onUpdate }: any) {
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

  const handleSaveAccess = async (studentId: string) => {
    const data = accessData[studentId];

    await supabase
      .from('ead_access')
      .upsert(
        [
          {
            class_id: classData.id,
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

  const handleSaveAll = async () => {
    for (const student of students) {
      const data = accessData[student.student_id];
      
      if (data) {
        await supabase
          .from('ead_access')
          .upsert(
            [
              {
                class_id: classData.id,
                student_id: student.student_id,
                access_date_1: data.access_date_1 || null,
                access_date_2: data.access_date_2 || null,
                access_date_3: data.access_date_3 || null,
                updated_at: new Date().toISOString(),
              },
            ],
            { onConflict: 'class_id,student_id' }
          );
      }
    }
    
    alert('Todos os acessos foram salvos!');
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-slate-800">Controle de Acessos EAD</h4>
        <button
          onClick={handleSaveAll}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Salvar Todos
        </button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                Aluno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                Acesso 1
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                Acesso 2
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                Acesso 3
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student: any) => (
              <tr key={student.id}>
                <td className="px-6 py-4 text-sm text-slate-800">
                  {student.students.full_name}
                </td>
                {[1, 2, 3].map((num) => (
                  <td key={num} className="px-6 py-4">
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </td>
                ))}
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleSaveAccess(student.student_id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Salvar
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Nenhum aluno matriculado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
