import { useState, useRef } from 'react';
import { X, Download, Edit2, Save } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoImg from '../../assets/image.png';

interface CertificateModalProps {
  studentName: string;
  courseName: string;
  courseModules: string[];
  workload: number;
  startDate: string;
  endDate: string;
  onClose: () => void;
}

export function CertificateModal({
  studentName,
  courseName,
  courseModules,
  workload,
  startDate,
  endDate,
  onClose,
}: CertificateModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [editableData, setEditableData] = useState({
    studentName,
    courseName,
    workload: workload.toString(),
    startDate,
    endDate,
    modules: [...courseModules],
  });

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const handleGeneratePDF = async () => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    if (frontRef.current) {
      const canvas = await html2canvas(frontRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    if (backRef.current) {
      pdf.addPage();
      const canvas = await html2canvas(backRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`Certificado_${editableData.studentName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Certificado de Conclusão</h3>
            <p className="text-slate-600 mt-1">{editableData.studentName}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isEditing
                  ? 'bg-slate-600 text-white hover:bg-slate-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salvar</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-5 h-5" />
                  <span>Editar</span>
                </>
              )}
            </button>
            {isEditing && (
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Concluir Edição
              </button>
            )}
            <button
              onClick={handleGeneratePDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Baixar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-3xl p-2"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setShowBack(false)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                !showBack
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Frente
            </button>
            <button
              onClick={() => setShowBack(true)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                showBack
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Verso
            </button>
          </div>

          {!showBack ? (
            <div
              ref={frontRef}
              className="bg-white border-2 border-slate-300 aspect-[297/210] w-full relative overflow-hidden"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #f8fafc 0%, #ffffff 100%)',
              }}
            >
              <div className="absolute top-0 left-0 w-32 h-32 border-l-[40px] border-t-[40px] border-l-[#60a5fa] border-t-[#60a5fa] opacity-80"></div>
              <div className="absolute top-8 left-8 w-24 h-24 border-l-[30px] border-t-[30px] border-l-[#1e40af] border-t-[#1e40af] opacity-60"></div>

              <div className="absolute bottom-0 right-0 w-32 h-32 border-r-[40px] border-b-[40px] border-r-[#60a5fa] border-b-[#60a5fa] opacity-80"></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 border-r-[30px] border-b-[30px] border-r-[#1e40af] border-b-[#1e40af] opacity-60"></div>

              <div className="relative z-10 p-12 h-full flex flex-col justify-between">
                <div className="flex justify-center">
                  <div className="text-center">
                    <img src={logoImg} alt="IDHS" className="h-20 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Instituto do Desenvolvimento</p>
                    <p className="text-sm text-slate-600">Humano e Social</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center text-center px-8">
                  <h1 className="text-4xl font-bold text-slate-800 mb-8 tracking-wide">
                    CERTIFICADO DE CONCLUSÃO
                  </h1>

                  <div className="space-y-6 text-slate-700">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editableData.studentName}
                        onChange={(e) =>
                          setEditableData({ ...editableData, studentName: e.target.value })
                        }
                        className="text-3xl font-bold text-center w-full uppercase border-b-2 border-slate-300 focus:border-green-500 focus:outline-none"
                      />
                    ) : (
                      <h2 className="text-3xl font-bold uppercase">{editableData.studentName}</h2>
                    )}

                    <div className="text-lg leading-relaxed max-w-4xl mx-auto">
                      <p className="mb-4">
                        Concluiu o curso de{' '}
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableData.courseName}
                            onChange={(e) =>
                              setEditableData({ ...editableData, courseName: e.target.value })
                            }
                            className="font-bold border-b border-slate-300 focus:border-green-500 focus:outline-none px-2"
                          />
                        ) : (
                          <span className="font-bold">{editableData.courseName}</span>
                        )}
                        , realizado no período de{' '}
                        {isEditing ? (
                          <input
                            type="date"
                            value={editableData.startDate}
                            onChange={(e) =>
                              setEditableData({ ...editableData, startDate: e.target.value })
                            }
                            className="border-b border-slate-300 focus:border-green-500 focus:outline-none px-2"
                          />
                        ) : (
                          formatDate(editableData.startDate)
                        )}{' '}
                        a{' '}
                        {isEditing ? (
                          <input
                            type="date"
                            value={editableData.endDate}
                            onChange={(e) =>
                              setEditableData({ ...editableData, endDate: e.target.value })
                            }
                            className="border-b border-slate-300 focus:border-green-500 focus:outline-none px-2"
                          />
                        ) : (
                          formatDate(editableData.endDate)
                        )}
                        , pela plataforma de videoconferência, promovido pelo{' '}
                        <span className="font-bold">Instituto do Desenvolvimento Humano e Social - IDHS</span>, com
                        carga horária de{' '}
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableData.workload}
                            onChange={(e) =>
                              setEditableData({ ...editableData, workload: e.target.value })
                            }
                            className="w-16 border-b border-slate-300 focus:border-green-500 focus:outline-none px-2 text-center"
                          />
                        ) : (
                          editableData.workload
                        )}{' '}
                        (trinta e duas) horas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-left text-sm text-slate-600">
                    <p>São Luis (MA), {today}.</p>
                  </div>
                  <div className="text-center">
                    <div className="mb-2">
                      <div className="w-64 border-t-2 border-slate-400 mx-auto mb-1"></div>
                      <p className="text-sm font-semibold text-slate-700">Marcelo Henrique de Oliveira Malheiros</p>
                      <p className="text-xs text-slate-600">Diretor-Presidente do IDHS</p>
                      <p className="text-xs text-slate-600">CNPJ: 05.832.015/0001-30</p>
                    </div>
                  </div>
                  <div className="w-32"></div>
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={backRef}
              className="bg-white border-2 border-slate-300 aspect-[297/210] w-full relative overflow-hidden"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, #f8fafc 0%, #ffffff 100%)',
              }}
            >
              <div className="absolute top-0 left-0 w-32 h-32 border-l-[40px] border-t-[40px] border-l-[#60a5fa] border-t-[#60a5fa] opacity-80"></div>
              <div className="absolute top-8 left-8 w-24 h-24 border-l-[30px] border-t-[30px] border-l-[#1e40af] border-t-[#1e40af] opacity-60"></div>

              <div className="absolute bottom-0 right-0 w-32 h-32 border-r-[40px] border-b-[40px] border-r-[#60a5fa] border-b-[#60a5fa] opacity-80"></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 border-r-[30px] border-b-[30px] border-r-[#1e40af] border-b-[#1e40af] opacity-60"></div>

              <div className="relative z-10 p-12 h-full flex flex-col">
                <div className="flex justify-center mb-8">
                  <div className="text-center">
                    <img src={logoImg} alt="IDHS" className="h-16 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Instituto do Desenvolvimento</p>
                    <p className="text-sm text-slate-600">Humano e Social</p>
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">MÓDULOS:</h2>
                  <div className="space-y-3 text-slate-700 text-lg">
                    {isEditing ? (
                      <div className="space-y-2">
                        {editableData.modules.map((module, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="font-medium">{index + 1}.</span>
                            <input
                              type="text"
                              value={module}
                              onChange={(e) => {
                                const newModules = [...editableData.modules];
                                newModules[index] = e.target.value;
                                setEditableData({ ...editableData, modules: newModules });
                              }}
                              className="flex-1 border-b border-slate-300 focus:border-green-500 focus:outline-none px-2"
                            />
                            <button
                              onClick={() => {
                                const newModules = editableData.modules.filter((_, i) => i !== index);
                                setEditableData({ ...editableData, modules: newModules });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            setEditableData({
                              ...editableData,
                              modules: [...editableData.modules, 'Novo módulo'],
                            });
                          }}
                          className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Adicionar Módulo
                        </button>
                      </div>
                    ) : (
                      editableData.modules.map((module, index) => (
                        <p key={index}>
                          {index + 1}. {module}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
