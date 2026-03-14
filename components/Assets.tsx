
import React, { useState, useMemo } from 'react';
import { Box, Plus, Search, Trash2, PenTool, DollarSign, MapPin, User as UserIcon, Heart, HandCoins } from 'lucide-react';
import { Asset, User } from '../types';

interface AssetsProps {
    assets: Asset[];
    onSave: (asset: Asset) => void;
    onDelete: (id: string) => void;
    user: User | null;
}

export const Assets: React.FC<AssetsProps> = ({ assets, onSave, onDelete, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Asset>>({
        name: '',
        value: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        condition: 'Bom',
        location: '',
        ownership: 'Associação Habitacional Vida Nova',
        ownerName: '',
        acquisitionMode: 'Compra Direta',
        acquiredBy: ''
    });

    const isFoxAdm = user?.role === 'FOX_ADM';

    const filteredAssets = useMemo(() => {
        return assets.filter(a => 
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (a.acquiredBy && a.acquiredBy.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [assets, searchTerm]);

    const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAsset: Asset = {
            id: formData.id || Date.now().toString(),
            name: formData.name || 'Sem nome',
            value: Number(formData.value),
            purchaseDate: formData.purchaseDate || new Date().toISOString(),
            condition: (formData.condition as any) || 'Bom',
            location: formData.location || 'Sede',
            ownership: (formData.ownership as any) || 'Associação Habitacional Vida Nova',
            ownerName: formData.ownership === 'Bem Particular' ? formData.ownerName : '',
            acquisitionMode: (formData.acquisitionMode as any) || 'Compra Direta',
            acquiredBy: formData.acquisitionMode === 'Compra Direta' ? 'Associação' : formData.acquiredBy
        };
        onSave(newAsset);
        setIsModalOpen(false);
        setFormData({ 
            name: '', 
            value: 0, 
            purchaseDate: new Date().toISOString().split('T')[0], 
            condition: 'Bom', 
            location: '', 
            ownership: 'Associação Habitacional Vida Nova',
            ownerName: '',
            acquisitionMode: 'Compra Direta',
            acquiredBy: ''
        });
    };

    const handleEdit = (asset: Asset) => {
        setFormData(asset);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Box className="text-neon-blue"/> Gestão de Patrimônio</h2>
                    <p className="text-slate-400 text-sm">Controle de bens, equipamentos e estrutura física.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                        <span className="text-xs text-slate-400 block">Valor Total Estimado</span>
                        <span className="text-lg font-bold text-emerald-400">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-slate-900 font-bold rounded-lg hover:bg-sky-400 transition-colors">
                        <Plus size={18} /> Novo Item
                    </button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar por nome, proprietário ou doador..." 
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-neon-blue text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map(asset => (
                    <div key={asset.id} className="glass-panel p-5 rounded-xl border border-slate-700 hover:border-neon-blue/50 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-3 bg-slate-800 rounded-lg text-neon-blue">
                                <Box size={24} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(asset)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg" title="Editar item"><PenTool size={14}/></button>
                                {isFoxAdm && (
                                    <button onClick={() => onDelete(asset.id)} className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg" title="Somente Fox ADM pode excluir"><Trash2 size={14}/></button>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                asset.ownership === 'Bem Particular' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
                             }`}>
                                {asset.ownership === 'Bem Particular' ? `Particular: ${asset.ownerName}` : asset.ownership}
                             </span>
                             
                             {asset.acquisitionMode !== 'Compra Direta' && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1 ${
                                    asset.acquisitionMode === 'Doação' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                }`}>
                                    {asset.acquisitionMode === 'Doação' ? <Heart size={10}/> : <HandCoins size={10}/>}
                                    {asset.acquisitionMode}: {asset.acquiredBy}
                                </span>
                             )}
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{asset.name}</h3>
                        <p className="text-emerald-400 font-mono font-bold text-lg mb-4">R$ {asset.value.toFixed(2)}</p>
                        
                        <div className="space-y-2 text-sm text-slate-400 border-t border-slate-700 pt-3">
                            <div className="flex justify-between">
                                <span className="flex items-center gap-2"><MapPin size={14}/> Localização:</span>
                                <span className="text-white">{asset.location}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Condição:</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold 
                                    ${asset.condition === 'Novo' ? 'bg-green-500/20 text-green-400' : 
                                      asset.condition === 'Ruim' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {asset.condition}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Adquirido em:</span>
                                <span>{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-4">{formData.id ? 'Editar Item' : 'Novo Item de Patrimônio'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">Nome do Item</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-neon-blue focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">Propriedade / Responsabilidade</label>
                                <select 
                                    required 
                                    value={formData.ownership} 
                                    onChange={e => setFormData({...formData, ownership: e.target.value as any})} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-neon-blue focus:outline-none"
                                >
                                    <option value="Associação Habitacional Vida Nova">Associação Habitacional Vida Nova</option>
                                    <option value="Associação Renascer">Associação Renascer</option>
                                    <option value="Bem Particular">Bem Particular</option>
                                </select>
                            </div>

                            {formData.ownership === 'Bem Particular' && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">Nome do Proprietário</label>
                                    <div className="relative">
                                        <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input 
                                            required 
                                            type="text" 
                                            value={formData.ownerName} 
                                            onChange={e => setFormData({...formData, ownerName: e.target.value})} 
                                            placeholder="Nome do dono do bem"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pl-10 text-white focus:border-neon-blue focus:outline-none" 
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-slate-800 pt-4 mt-4">
                                <label className="block text-sm text-slate-400 mb-2 font-bold uppercase text-[10px] tracking-widest">Modo de Aquisição</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, acquisitionMode: 'Compra Direta'})}
                                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${formData.acquisitionMode === 'Compra Direta' ? 'bg-neon-blue text-slate-900 border-neon-blue' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                                    >Compra Direta</button>
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, acquisitionMode: 'Doação'})}
                                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${formData.acquisitionMode === 'Doação' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                                    >Doação</button>
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, acquisitionMode: 'Pago por Terceiro'})}
                                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${formData.acquisitionMode === 'Pago por Terceiro' ? 'bg-purple-500 text-white border-purple-500' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                                    >Pago por Terceiro</button>
                                </div>
                            </div>

                            {formData.acquisitionMode !== 'Compra Direta' && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">
                                        {formData.acquisitionMode === 'Doação' ? 'Quem realizou a doação?' : 'Quem pagou pelo bem?'}
                                    </label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={formData.acquiredBy} 
                                        onChange={e => setFormData({...formData, acquiredBy: e.target.value})} 
                                        placeholder="Nome da pessoa ou empresa"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-neon-blue focus:outline-none" 
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">Valor Estimado (R$)</label>
                                    <input required type="number" step="0.01" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-neon-blue focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">Data Aquisição</label>
                                    <input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-neon-blue focus:outline-none" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">Localização / Onde se encontra?</label>
                                <input type="text" placeholder="Ex: Sede, Cozinha, Sala de Reunião..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-neon-blue focus:outline-none" />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">Estado de Conservação</label>
                                <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value as any})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-neon-blue focus:outline-none">
                                    <option value="Novo">Novo</option>
                                    <option value="Bom">Bom / Bem conservado</option>
                                    <option value="Manutenção">Precisa de Manutenção</option>
                                    <option value="Ruim">Ruim / Descarte</option>
                                </select>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 bg-neon-blue text-slate-900 font-bold py-3 rounded-xl hover:bg-sky-400 transition-colors">Salvar Registro</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
