
import React, { useState, useRef } from 'react';
import { Plus, Search, FileUp, FileDown, Edit2, Trash2, Filter, AlertCircle, Users as UsersIcon, FileText, Upload, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { Member, MemberStatus, MemberDocument } from '../types';
import { StorageService } from '../services/storageService';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface MembersProps {
  members: Member[];
  onSave: (member: Member) => void;
  onImport: (members: Member[]) => void;
  onDelete: (id: string) => void;
}

export const Members: React.FC<MembersProps> = ({ members, onSave, onImport, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docUploadRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Member>>({
    name: '', phone: '', status: MemberStatus.ACTIVE, documents: []
  });

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm)
  );

  const handleOpenModal = (member?: Member) => {
    setErrorMsg(null);
    if (member) {
      setEditingMember(member);
      setFormData({...member});
    } else {
      setEditingMember(null);
      setFormData({ name: '', phone: '', status: MemberStatus.ACTIVE, joinedAt: new Date().toISOString(), documents: [] });
    }
    setIsModalOpen(true);
  };

  const handleOpenDocs = (member: Member) => {
    setEditingMember(member);
    setIsDocModalOpen(true);
  };

  const processImportedData = (data: any[]) => {
      const existingNames = new Set(members.map(m => m.name.toLowerCase().trim()));
      let duplicatesCount = 0;

      const newMembers: Member[] = data.map((row, idx): Member | null => {
          const rowKeys = Object.keys(row);
          const nameKey = rowKeys.find(k => k.toLowerCase().trim() === 'nome');
          const phoneKey = rowKeys.find(k => k.toLowerCase().trim() === 'telefone');

          const name = nameKey ? String(row[nameKey]).trim() : '';
          const phone = phoneKey ? String(row[phoneKey]).trim() : '';

          if (!name) return null;
          
          if (existingNames.has(name.toLowerCase())) {
              duplicatesCount++;
              return null;
          }

          existingNames.add(name.toLowerCase());

          return {
              id: `member-${Date.now()}-${idx}`,
              name,
              phone: phone || '(00) 00000-0000',
              joinedAt: new Date().toISOString(),
              status: MemberStatus.ACTIVE,
              documents: []
          };
      }).filter((m): m is Member => m !== null);

      if (newMembers.length > 0) {
          onImport(newMembers);
          alert(`${newMembers.length} novos associados importados!${duplicatesCount > 0 ? ` (${duplicatesCount} duplicados ignorados)` : ''}`);
      } else {
          if (duplicatesCount > 0) {
              alert(`Nenhum associado novo importado. Todos os ${duplicatesCount} nomes já existem no sistema.`);
          } else {
              alert('Cabeçalhos não encontrados ou planilha vazia. Use "nome" e "telefone".');
          }
      }
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => processImportedData(results.data),
            error: () => {
                alert('Erro ao ler CSV');
                setIsImporting(false);
            }
        });
    } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'array' });
                const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                processImportedData(data);
            } catch (err) {
                alert('Erro ao processar planilha Excel');
                setIsImporting(false);
            }
        };
        reader.readAsArrayBuffer(file);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMember) return;

    setIsUploading(true);
    try {
        const doc = await StorageService.uploadDocument(editingMember.id, file);
        if (doc) {
            const updatedMember = {
                ...editingMember,
                documents: [...(editingMember.documents || []), doc]
            };
            onSave(updatedMember);
            setEditingMember(updatedMember);
            alert("Documento arquivado com sucesso!");
        } else {
            alert("Erro ao enviar documento. Verifique as configurações do Supabase.");
        }
    } catch (err) {
        alert("Erro no processo de upload.");
    } finally {
        setIsUploading(false);
        if (docUploadRef.current) docUploadRef.current.value = '';
    }
  };

  const handleRemoveDoc = (docId: string) => {
      if(!editingMember || !confirm("Remover este arquivo permanentemente?")) return;
      const updated = {
          ...editingMember,
          documents: (editingMember.documents || []).filter(d => d.id !== docId)
      };
      onSave(updated);
      setEditingMember(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameToSave = formData.name?.trim() || '';
    const isDuplicate = members.some(m => m.name.toLowerCase() === nameToSave.toLowerCase() && m.id !== editingMember?.id);

    if (isDuplicate) {
        setErrorMsg("Este nome já existe.");
        return;
    }

    onSave({
      id: editingMember?.id || Date.now().toString(),
      name: nameToSave,
      phone: formData.phone || '',
      joinedAt: formData.joinedAt || new Date().toISOString(),
      status: formData.status || MemberStatus.ACTIVE,
      documents: formData.documents || []
    } as Member);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar associado..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-neon-blue text-white text-sm outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="flex gap-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <FileUp size={14} /> {isImporting ? '...' : 'Importar Planilha'}
            </button>
            <div className="flex bg-slate-950 rounded-xl border border-slate-800 p-0.5 items-center px-3">
              <span className="text-neon-blue text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <UsersIcon size={12}/> {members.length} Associados
              </span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
          
          <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-neon-blue text-slate-900 font-bold rounded-xl hover:brightness-110 transition-all text-xs uppercase tracking-widest">
            <Plus size={16} /> Novo Cadastro
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-6 py-4 border-b border-slate-800 w-16">#</th>
                <th className="px-6 py-4 border-b border-slate-800">Associado Único</th>
                <th className="px-6 py-4 border-b border-slate-800">Documentos</th>
                <th className="px-6 py-4 border-b border-slate-800">Status</th>
                <th className="px-6 py-4 border-b border-slate-800 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredMembers.map((member, index) => (
                <tr key={member.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] text-neon-blue font-black">{(index + 1).toString().padStart(2, '0')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm uppercase">{member.name}</span>
                        <p className="text-[10px] text-slate-500 font-mono">{member.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <button 
                        onClick={() => handleOpenDocs(member)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase transition-all ${
                            (member.documents?.length || 0) > 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-white'
                        }`}
                     >
                        <FileText size={14}/> {member.documents?.length || 0} Arquivos
                     </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleOpenModal(member)} className="p-2 text-slate-500 hover:text-neon-blue transition-colors"><Edit2 size={16} /></button>
                      <button 
                        onDoubleClick={() => onDelete(member.id)} 
                        title="CLIQUE DUAS VEZES (2 CLICKS) PARA EXCLUIR"
                        className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Documentos */}
      {isDocModalOpen && editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-slate-700 max-h-[85vh] flex flex-col animate-in zoom-in duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Arquivo de Documentos</h2>
                        <p className="text-neon-blue text-[10px] font-bold uppercase tracking-widest">{editingMember.name}</p>
                    </div>
                    <button onClick={() => setIsDocModalOpen(false)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><XCircle size={24}/></button>
                </div>

                <div className="bg-slate-950/60 p-6 rounded-2xl border-2 border-dashed border-slate-800 mb-6 flex flex-col items-center justify-center gap-4 text-center group hover:border-neon-blue/40 transition-all">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                        {isUploading ? <Loader2 size={24} className="animate-spin text-neon-blue"/> : <Upload size={24}/>}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white uppercase">Upload de Comprovante ou Doc</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">PDF, JPG ou PNG (Máx 5MB)</p>
                    </div>
                    <button 
                        disabled={isUploading}
                        onClick={() => docUploadRef.current?.click()}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase rounded-xl transition-all border border-slate-700"
                    >
                        {isUploading ? 'Enviando...' : 'Selecionar Arquivo'}
                    </button>
                    <input type="file" ref={docUploadRef} className="hidden" onChange={handleDocUpload} accept=".pdf,.jpg,.jpeg,.png" />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Arquivados ({editingMember.documents?.length || 0})</h3>
                    {editingMember.documents?.map(doc => (
                        <div key={doc.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-800 text-neon-blue rounded-lg"><FileText size={20}/></div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase truncate max-w-[200px]">{doc.name}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={doc.base64} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 text-slate-400 hover:text-neon-blue rounded-lg transition-all"><ExternalLink size={16}/></a>
                                <button onClick={() => handleRemoveDoc(doc.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                    {(!editingMember.documents || editingMember.documents.length === 0) && (
                        <div className="py-12 text-center opacity-30 italic text-sm">Nenhum documento arquivado.</div>
                    )}
                </div>
            </div>
          </div>
      )}

      {/* Modal de Cadastro Simples */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-700 animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter">{editingMember ? 'Editar Registro' : 'Novo Associado'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="EX: JOÃO DA SILVA" className={`w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm font-bold uppercase focus:border-neon-blue outline-none transition-all ${errorMsg ? 'border-red-500' : ''}`} />
                  {errorMsg && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase">{errorMsg}</p>}
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Telefone</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000" className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-neon-blue outline-none transition-all" />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-neon-blue text-slate-900 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:brightness-110 transition-all shadow-xl shadow-sky-500/20">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
