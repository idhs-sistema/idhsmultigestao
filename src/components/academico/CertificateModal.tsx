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
              className="bg-white aspect-[297/210] w-full relative overflow-hidden shadow-2xl"
              style={{
                backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
              }}
            >
              <div className="absolute inset-0 border-[12px] border-double border-blue-800 opacity-20"></div>
              <div className="absolute inset-4 border-4 border-blue-600 opacity-30"></div>

              <div className="absolute top-0 left-0 w-48 h-48 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full border-l-[60px] border-t-[60px] border-blue-800"></div>
              </div>
              <div className="absolute bottom-0 right-0 w-48 h-48 opacity-10">
                <div className="absolute bottom-0 right-0 w-full h-full border-r-[60px] border-b-[60px] border-blue-800"></div>
              </div>

              <div className="absolute top-6 left-6 w-40 h-40 border-l-[3px] border-t-[3px] border-blue-700 opacity-40"></div>
              <div className="absolute bottom-6 right-6 w-40 h-40 border-r-[3px] border-b-[3px] border-blue-700 opacity-40"></div>

              <div className="relative z-10 p-16 h-full flex flex-col justify-between">
                <div className="flex justify-center mb-4">
                  <div className="text-center">
                    <img src={logoImg} alt="IDHS" className="h-24 mx-auto mb-3 drop-shadow-lg" />
                    <div className="border-t-2 border-b-2 border-blue-700 py-2 px-8">
                      <p className="text-base font-semibold text-slate-800 tracking-wide">INSTITUTO DO DESENVOLVIMENTO</p>
                      <p className="text-base font-semibold text-slate-800 tracking-wide">HUMANO E SOCIAL</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center text-center px-12 space-y-8">
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-4 mb-2">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
                      <h1 className="text-5xl font-bold text-blue-900 tracking-wider uppercase" style={{ fontFamily: 'serif' }}>
                        Certificado
                      </h1>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
                    </div>
                    <p className="text-xl text-slate-700 tracking-widest uppercase">de Conclusão</p>
                  </div>

                  <div className="space-y-8 text-slate-800">
                    <p className="text-lg leading-relaxed">Certificamos que</p>

                    {isEditing ? (
                      <input
                        type="text"
                        value={editableData.studentName}
                        onChange={(e) =>
                          setEditableData({ ...editableData, studentName: e.target.value })
                        }
                        className="text-4xl font-bold text-center w-full uppercase border-b-2 border-blue-400 focus:border-blue-600 focus:outline-none text-blue-900 bg-transparent"
                        style={{ fontFamily: 'serif' }}
                      />
                    ) : (
                      <h2 className="text-4xl font-bold uppercase text-blue-900 tracking-wide" style={{ fontFamily: 'serif' }}>
                        {editableData.studentName}
                      </h2>
                    )}

                    <div className="text-base leading-loose max-w-4xl mx-auto text-justify px-8">
                      <p>
                        Concluiu com êxito o curso de{' '}
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableData.courseName}
                            onChange={(e) =>
                              setEditableData({ ...editableData, courseName: e.target.value })
                            }
                            className="font-bold border-b border-slate-400 focus:border-blue-600 focus:outline-none px-2 bg-transparent"
                          />
                        ) : (
                          <span className="font-bold text-slate-900">{editableData.courseName}</span>
                        )}
                        , realizado no período de{' '}
                        {isEditing ? (
                          <input
                            type="date"
                            value={editableData.startDate}
                            onChange={(e) =>
                              setEditableData({ ...editableData, startDate: e.target.value })
                            }
                            className="border-b border-slate-400 focus:border-blue-600 focus:outline-none px-2 bg-transparent"
                          />
                        ) : (
                          <span className="font-semibold">{formatDate(editableData.startDate)}</span>
                        )}{' '}
                        a{' '}
                        {isEditing ? (
                          <input
                            type="date"
                            value={editableData.endDate}
                            onChange={(e) =>
                              setEditableData({ ...editableData, endDate: e.target.value })
                            }
                            className="border-b border-slate-400 focus:border-blue-600 focus:outline-none px-2 bg-transparent"
                          />
                        ) : (
                          <span className="font-semibold">{formatDate(editableData.endDate)}</span>
                        )}
                        , pela plataforma de videoconferência, promovido pelo{' '}
                        <span className="font-bold text-slate-900">Instituto do Desenvolvimento Humano e Social - IDHS</span>, com
                        carga horária total de{' '}
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableData.workload}
                            onChange={(e) =>
                              setEditableData({ ...editableData, workload: e.target.value })
                            }
                            className="w-16 border-b border-slate-400 focus:border-blue-600 focus:outline-none px-2 text-center bg-transparent"
                          />
                        ) : (
                          <span className="font-bold">{editableData.workload}</span>
                        )}{' '}
                        horas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 flex justify-between items-end">
                  <div className="text-left">
                    <p className="text-sm text-slate-700 font-medium">São Luís, Maranhão</p>
                    <p className="text-sm text-slate-600">{today}</p>
                  </div>

                  <div className="text-center flex-1 max-w-sm mx-auto">
                    <div className="border-t-2 border-slate-700 pt-2 px-4">
                      <p className="text-base font-bold text-slate-900 mb-1">Marcelo Henrique de Oliveira Malheiros</p>
                      <p className="text-sm text-slate-700 font-medium">Diretor-Presidente</p>
                      <p className="text-xs text-slate-600 mt-1">Instituto do Desenvolvimento Humano e Social - IDHS</p>
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
              className="bg-white aspect-[297/210] w-full relative overflow-hidden shadow-2xl"
              style={{
                backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
              }}
            >
              <div className="absolute inset-0 border-[12px] border-double border-blue-800 opacity-20"></div>
              <div className="absolute inset-4 border-4 border-blue-600 opacity-30"></div>

              <div className="absolute top-0 left-0 w-48 h-48 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full border-l-[60px] border-t-[60px] border-blue-800"></div>
              </div>
              <div className="absolute bottom-0 right-0 w-48 h-48 opacity-10">
                <div className="absolute bottom-0 right-0 w-full h-full border-r-[60px] border-b-[60px] border-blue-800"></div>
              </div>

              <div className="absolute top-6 left-6 w-40 h-40 border-l-[3px] border-t-[3px] border-blue-700 opacity-40"></div>
              <div className="absolute bottom-6 right-6 w-40 h-40 border-r-[3px] border-b-[3px] border-blue-700 opacity-40"></div>

              <div className="relative z-10 p-16 h-full flex flex-col">
                <div className="flex justify-center mb-10">
                  <div className="text-center">
                    <img src={logoImg} alt="IDHS" className="h-20 mx-auto mb-3 drop-shadow-lg" />
                    <div className="border-t-2 border-b-2 border-blue-700 py-2 px-8">
                      <p className="text-sm font-semibold text-slate-800 tracking-wide">INSTITUTO DO DESENVOLVIMENTO</p>
                      <p className="text-sm font-semibold text-slate-800 tracking-wide">HUMANO E SOCIAL</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-8">
                  <div className="mb-6 border-b-3 border-blue-700 pb-3">
                    <h2 className="text-3xl font-bold text-blue-900 uppercase tracking-wide" style={{ fontFamily: 'serif' }}>
                      Conteúdo Programático
                    </h2>
                  </div>

                  <div className="space-y-4 text-slate-800">
                    {isEditing ? (
                      <div className="space-y-3">
                        {editableData.modules.map((module, index) => (
                          <div key={index} className="flex items-start space-x-3 bg-blue-50 bg-opacity-30 p-3 rounded">
                            <span className="font-bold text-blue-900 text-lg mt-0.5">{index + 1}.</span>
                            <input
                              type="text"
                              value={module}
                              onChange={(e) => {
                                const newModules = [...editableData.modules];
                                newModules[index] = e.target.value;
                                setEditableData({ ...editableData, modules: newModules });
                              }}
                              className="flex-1 border-b border-blue-400 focus:border-blue-600 focus:outline-none px-2 py-1 bg-transparent text-base"
                            />
                            <button
                              onClick={() => {
                                const newModules = editableData.modules.filter((_, i) => i !== index);
                                setEditableData({ ...editableData, modules: newModules });
                              }}
                              className="text-red-600 hover:text-red-800 mt-1"
                            >
                              <X className="w-5 h-5" />
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
                          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Adicionar Módulo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editableData.modules.map((module, index) => (
                          <div key={index} className="flex items-start space-x-3 border-l-4 border-blue-600 pl-4 py-2">
                            <span className="font-bold text-blue-900 text-lg">{index + 1}.</span>
                            <p className="flex-1 text-base leading-relaxed text-slate-800">{module}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-blue-200 text-center">
                  <p className="text-sm text-slate-600">
                    Este certificado é válido em todo território nacional conforme legislação vigente
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
