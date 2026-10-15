import React, { useState } from 'react';
import {
  Building2,
  Layers,
  Server,
  Zap,
  Wind,
  Droplets,
  Network,
  Users,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Cpu,
  Database,
  Radio,
  FileCode2,
  Stethoscope,
  DoorOpen,
  Pill,
  HeartPulse,
  Scan,
  Scissors,
  Wrench,
  Boxes,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AppLanguage } from '../../types';
import {
  FloorLevel,
  PersonProfileRole,
  ServerArchitectureMode,
  InfrastructureCategory,
  ArchitecturalZone,
  HospitalPersonMarker,
  PhysicalInfraNode,
  EcosystemIntegrationEvent,
} from '../../types/hospitalArchitecture';
import {
  ARCHITECTURAL_ZONES,
  HOSPITAL_PERSON_MARKERS,
  PHYSICAL_INFRA_NODES,
  INITIAL_ECOSYSTEM_EVENTS,
  DEPLOYMENT_TOPOLOGIES,
} from '../../data/hospitalArchitectureData';

interface HospitalArchitectureProps {
  language: AppLanguage;
  onOpenMultiModalCenter?: () => void;
  onOpenRoleDashboard?: (role: string) => void;
}

export const HospitalArchitectureBlueprint: React.FC<HospitalArchitectureProps> = ({
  language,
  onOpenMultiModalCenter,
  onOpenRoleDashboard,
}) => {
  const pt = language === 'pt';

  // State management
  const [activeFloor, setActiveFloor] = useState<FloorLevel>(0);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone_triage');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<PersonProfileRole | 'all'>('all');
  const [activeInfraLayer, setActiveInfraLayer] = useState<InfrastructureCategory | 'all'>('all');
  const [architectureMode, setArchitectureMode] = useState<ServerArchitectureMode>('on_premise');
  const [events, setEvents] = useState<EcosystemIntegrationEvent[]>(INITIAL_ECOSYSTEM_EVENTS);
  const [isSimulatingEvent, setIsSimulatingEvent] = useState(false);
  const [simulationAlert, setSimulationAlert] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Filter zones, people, infra
  const currentFloorZones = ARCHITECTURAL_ZONES.filter((z) => z.floor === activeFloor);
  const selectedZone = ARCHITECTURAL_ZONES.find((z) => z.id === selectedZoneId) || currentFloorZones[0];

  const currentFloorPeople = HOSPITAL_PERSON_MARKERS.filter(
    (p) => p.floor === activeFloor && (selectedRoleFilter === 'all' || p.role === selectedRoleFilter)
  );

  const currentFloorInfra = PHYSICAL_INFRA_NODES.filter(
    (n) => n.floor === activeFloor && (activeInfraLayer === 'all' || n.category === activeInfraLayer)
  );

  // Stats
  const totalPeopleFloor = HOSPITAL_PERSON_MARKERS.filter((p) => p.floor === activeFloor).length;
  const totalInfraFloor = PHYSICAL_INFRA_NODES.filter((n) => n.floor === activeFloor).length;

  // Simulate HL7 FHIR Trigger
  const handleTriggerFhirMedication = () => {
    setIsSimulatingEvent(true);
    const newId = `evt_fhir_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('pt-BR');

    const fhirEvent: EcosystemIntegrationEvent = {
      id: newId,
      timestamp,
      sourceSystem: 'OpenMRS / OpenEMR',
      targetSystem: 'OpenBoxes',
      protocol: 'HL7 FHIR v4.0.1',
      eventType: 'MedicationRequest',
      descriptionPt: 'Nova prescrição médica assinada eletronicamente. Ordem FHIR disparada para separação de lote no OpenBoxes WMS.',
      descriptionEn: 'Electronic prescription signed. HL7 FHIR order dispatched to OpenBoxes WMS for batch picking.',
      payloadSnippet: JSON.stringify(
        {
          resourceType: 'MedicationRequest',
          status: 'active',
          intent: 'order',
          medicationCodeableConcept: { text: 'Ceftriaxona 1g + Dexametasona 6mg' },
          priority: 'urgent',
          authoredOn: new Date().toISOString(),
        },
        null,
        2
      ),
      status: 'success',
    };

    setTimeout(() => {
      setEvents((prev) => [fhirEvent, ...prev.slice(0, 7)]);
      setIsSimulatingEvent(false);
      setSimulationAlert({
        message: pt
          ? 'Evento HL7 FHIR processado com sucesso! OpenBoxes alocou lote e Odoo gerou apropriação de custos SUS.'
          : 'HL7 FHIR Event processed! OpenBoxes allocated batch and Odoo registered SUS cost.',
        type: 'success',
      });
      setTimeout(() => setSimulationAlert(null), 5000);
    }, 900);
  };

  // Simulate openDCIM Alert Trigger
  const handleTriggerDcimBreakerAlert = () => {
    setIsSimulatingEvent(true);
    const timestamp = new Date().toLocaleTimeString('pt-BR');

    const dcimEvent: EcosystemIntegrationEvent = {
      id: `evt_dcim_${Date.now()}`,
      timestamp,
      sourceSystem: 'openDCIM',
      targetSystem: 'NetBox',
      protocol: 'SNMP v3 / Telemetry',
      eventType: 'BreakerAlert',
      descriptionPt: 'openDCIM detectou oscilação no circuito A da UTI. Sistema acionou redundância automática no No-break N+1 e NetBox reencaminhou rota.',
      descriptionEn: 'openDCIM detected oscillation on ICU circuit A. Automatic failover to N+1 UPS and NetBox rerouted link.',
      payloadSnippet: JSON.stringify(
        {
          alarmId: 'DCIM_UPS_FAILOVER_01',
          circuit: 'PDU-A-ICU-WARD',
          action: 'FAILOVER_TO_PDU_B_UPS_N1',
          durationMs: 4,
          powerQualityStatus: 'OPTIMAL_REDUNDANT',
        },
        null,
        2
      ),
      status: 'warning',
    };

    setTimeout(() => {
      setEvents((prev) => [dcimEvent, ...prev.slice(0, 7)]);
      setIsSimulatingEvent(false);
      setSimulationAlert({
        message: pt
          ? 'Alerta openDCIM registrado! Redundância física N+1 absorveu a carga em 4 milissegundos sem interrupção.'
          : 'openDCIM alert triggered! N+1 physical redundancy absorbed load in 4ms with zero downtime.',
        type: 'warning',
      });
      setTimeout(() => setSimulationAlert(null), 5000);
    }, 900);
  };

  const currentTopology = DEPLOYMENT_TOPOLOGIES[architectureMode];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>{pt ? 'ARQUITETURA HOSPITALAR FULL & PLANTA BAIXA' : 'HOSPITAL ARCHITECTURE & BLUEPRINT'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {pt
                ? 'Geografia, Planta Baixa e Ecossistema Open Source Integrado'
                : 'Hospital Geography, Multi-Floor Blueprint & Open Source Ecosystem'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {pt
                ? 'Mapeamento arquitetônico multi-pavimento integrando a infraestrutura de Data Center (openDCIM / NetBox), Gestão Clínica (OpenMRS / OpenEMR com HL7 FHIR), Logística e Cadeia de Frio (OpenBoxes WMS) e ERP Corporativo (Odoo / OFBiz).'
                : 'Multi-floor architectural mapping unifying DCIM infrastructure (openDCIM / NetBox), Clinical EHR (OpenMRS / OpenEMR with HL7 FHIR), Cold Chain Logistics (OpenBoxes WMS) and Corporate ERP (Odoo / OFBiz).'}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 backdrop-blur-md">
            <div className="text-center p-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {pt ? 'Pavimentos' : 'Floors'}
              </span>
              <span className="text-xl font-black text-white">3 Níveis</span>
            </div>
            <div className="text-center p-2 border-l border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {pt ? 'Pessoas / Equipes' : 'Staff & Patients'}
              </span>
              <span className="text-xl font-black text-cyan-400">{HOSPITAL_PERSON_MARKERS.length} Ativos</span>
            </div>
            <div className="text-center p-2 border-l border-slate-800 col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {pt ? 'Infraestrutura' : 'Critical Infra'}
              </span>
              <span className="text-xl font-black text-emerald-400">{PHYSICAL_INFRA_NODES.length} Ativos N+1</span>
            </div>
          </div>
        </div>

        {/* Floor Selection Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono mr-1">
              {pt ? 'SELECIONE O PAVIMENTO:' : 'SELECT FLOOR:'}
            </span>
            <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-700">
              {[
                {
                  level: -1 as FloorLevel,
                  label: pt ? 'Subsolo (-1) Infra & WMS' : 'Basement (-1) Infra & WMS',
                  icon: Server,
                  badge: 'openDCIM • NetBox • OpenBoxes',
                },
                {
                  level: 0 as FloorLevel,
                  label: pt ? 'Térreo (0) Recepção & Triagem' : 'Ground (0) Reception & Triage',
                  icon: DoorOpen,
                  badge: 'OpenMRS • Admissão • Farmácia',
                },
                {
                  level: 1 as FloorLevel,
                  label: pt ? '1º Andar (+1) Cirurgia & UTI' : '1st Floor (+1) Surgery & ICU',
                  icon: HeartPulse,
                  badge: 'OpenMRS • PACS • Odoo ERP',
                },
              ].map((f) => {
                const Icon = f.icon;
                const isActive = activeFloor === f.level;
                return (
                  <button
                    key={f.level}
                    onClick={() => {
                      setActiveFloor(f.level);
                      const firstZone = ARCHITECTURAL_ZONES.find((z) => z.floor === f.level);
                      if (firstZone) setSelectedZoneId(firstZone.id);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{pt ? 'Telemetria e barramento HL7 FHIR ativos' : 'Telemetry & HL7 FHIR bus active'}</span>
          </div>
        </div>
      </div>

      {/* Alert toast if simulation triggered */}
      {simulationAlert && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
            simulationAlert.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-amber-950/80 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {simulationAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{simulationAlert.message}</span>
          </div>
          <button
            onClick={() => setSimulationAlert(null)}
            className="text-xs underline hover:opacity-80 font-mono"
          >
            {pt ? 'Fechar' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Main Floor Blueprint & Interactive Zone Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Architectural Blueprint Layout (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-5">
            {/* Blueprint Header with Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400" />
                  <h2 className="text-lg font-black text-white">
                    {pt
                      ? activeFloor === -1
                        ? 'Planta Baixa: Subsolo (-1) - Infraestrutura Crítica & WMS'
                        : activeFloor === 0
                        ? 'Planta Baixa: Pavimento Térreo (0) - Acolhimento & Triagem'
                        : 'Planta Baixa: 1º Pavimento (+1) - Centro Cirúrgico, UTI & Imagem'
                      : activeFloor === -1
                      ? 'Floorplan: Basement (-1) - Critical Infrastructure & WMS'
                      : activeFloor === 0
                      ? 'Floorplan: Ground Floor (0) - Reception & Triage'
                      : 'Floorplan: 1st Floor (+1) - Surgical Theater, ICU & Imaging'}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pt
                    ? 'Clique nas salas para inspecionar sistemas vinculados, pessoas presentes e telemetria física.'
                    : 'Click any zone to inspect linked open-source systems, personnel and live telemetry.'}
                </p>
              </div>

              {/* People Role Filter Dropdown / Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                  {pt ? 'Filtrar Pessoas:' : 'Filter People:'}
                </span>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
                  className="bg-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-700 font-semibold focus:outline-hidden focus:border-cyan-400"
                >
                  <option value="all">{pt ? 'Todos os Perfis' : 'All Roles'}</option>
                  <option value="paciente">{pt ? 'Pacientes' : 'Patients'}</option>
                  <option value="recepcionista">{pt ? 'Recepcionistas' : 'Receptionists'}</option>
                  <option value="medico">{pt ? 'Médicos / Cirurgiões' : 'Doctors'}</option>
                  <option value="enfermeiro">{pt ? 'Enfermagem' : 'Nurses'}</option>
                  <option value="manutencao_ti">{pt ? 'Eng. Clínica & TI' : 'Maintenance & IT'}</option>
                  <option value="farmaceutico_wms">{pt ? 'Farmácia & WMS' : 'Pharmacy & WMS'}</option>
                  <option value="gestor_diretoria">{pt ? 'Gestão & Diretoria' : 'Management'}</option>
                </select>
              </div>
            </div>

            {/* Architectural Blueprint Layout Canvas */}
            <div className="relative bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800/80 min-h-[460px] overflow-hidden">
              {/* Engineering Blueprint Grid Background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Compass & North indicator */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-cyan-400">
                <span className="font-bold">NORTE ↑</span>
                <span className="text-slate-500">| Eixo Hospitalar</span>
              </div>

              {/* Architectural Zones Grid */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-6">
                {currentFloorZones.map((zone) => {
                  const isSelected = selectedZoneId === zone.id;
                  const peopleInZone = currentFloorPeople.filter((p) => p.zoneId === zone.id);
                  const infraInZone = currentFloorInfra.filter((i) => i.zoneId === zone.id);

                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        zone.gridArea
                      } ${
                        isSelected
                          ? 'border-cyan-400 bg-slate-900/90 shadow-xl ring-2 ring-cyan-500/20 scale-[1.01]'
                          : `${zone.colorScheme.border} ${zone.colorScheme.bg} hover:border-slate-600 hover:bg-slate-900/70`
                      }`}
                    >
                      {/* Zone Header */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
                              {zone.shortCode}
                            </span>
                            <h3 className="text-sm font-black text-white leading-tight">
                              {zone.name}
                            </h3>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${zone.colorScheme.badge}`}
                          >
                            {zone.openSourceApp}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                          {pt ? zone.descriptionPt : zone.descriptionEn}
                        </p>
                      </div>

                      {/* People Markers Present in this Zone */}
                      <div className="my-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1 font-bold">
                            <Users className="w-3 h-3 text-cyan-400" />
                            <span>
                              {pt ? 'Ocupantes no Local:' : 'Occupants in Zone:'} ({peopleInZone.length})
                            </span>
                          </span>
                          <span>Max: {zone.capacityMax}</span>
                        </div>

                        {peopleInZone.length === 0 ? (
                          <div className="text-[10px] text-slate-600 font-mono italic">
                            {pt ? 'Nenhuma pessoa com o filtro atual' : 'No personnel under filter'}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {peopleInZone.map((person) => (
                              <div
                                key={person.id}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border shadow-xs ${person.badgeColor}`}
                                title={`${person.name} - ${pt ? person.currentActivityPt : person.currentActivityEn}`}
                              >
                                <span>{person.avatarEmoji}</span>
                                <span className="text-[11px] font-semibold">{person?.name ? person.name.split(' ')[0] : 'Colaborador'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Zone Bottom Infrastructure Bar */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="truncate max-w-[200px]" title={zone.infraSummary}>
                          {zone.infraSummary}
                        </span>
                        <span className="font-bold text-slate-300">{zone.areaM2} m²</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Ecosystem Simulation Bar */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{pt ? 'Simulador de Fluxos Open Source em Tempo Real' : 'Real-time Open Source Flow Simulator'}</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {pt
                    ? 'Dispare fluxos automáticos entre OpenMRS (Prescrição) -> OpenBoxes (WMS) -> openDCIM (Telemetria).'
                    : 'Dispatch automated transactions across OpenMRS -> OpenBoxes -> openDCIM.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerFhirMedication}
                  disabled={isSimulatingEvent}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>{pt ? 'Prescrição HL7 FHIR' : 'Trigger HL7 FHIR'}</span>
                </button>
                <button
                  onClick={handleTriggerDcimBreakerAlert}
                  disabled={isSimulatingEvent}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{pt ? 'Alerta openDCIM' : 'openDCIM Failover'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Zone Inspector & Physical Infrastructure Panel (1 col) */}
        <div className="space-y-4">
          {/* Selected Zone Inspector Details */}
          <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  {pt ? 'Inspeção da Zona' : 'Zone Inspector'}
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                {selectedZone.shortCode}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-base font-black text-white">{selectedZone.name}</h4>
                <p className="text-xs text-slate-300 mt-1">
                  {pt ? selectedZone.descriptionPt : selectedZone.descriptionEn}
                </p>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>{pt ? 'Pavimento:' : 'Floor Level:'}</span>
                  <span className="text-white font-bold">
                    {selectedZone.floor === -1 ? 'Subsolo (-1)' : selectedZone.floor === 0 ? 'Térreo (0)' : '1º Andar (+1)'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{pt ? 'Área Construída:' : 'Floor Area:'}</span>
                  <span className="text-cyan-400 font-bold">{selectedZone.areaM2} m²</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{pt ? 'Capacidade Máxima:' : 'Max Occupancy:'}</span>
                  <span className="text-white font-bold">{selectedZone.capacityMax} pessoas</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{pt ? 'Sistema de Gestão:' : 'Managing System:'}</span>
                  <span className="text-emerald-400 font-bold">{selectedZone.openSourceApp}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{pt ? 'Infraestrutura Crítica:' : 'Critical Infra:'}</span>
                  <span className="text-amber-400 font-bold truncate max-w-[150px]">{selectedZone.infraSummary}</span>
                </div>
              </div>

              {/* Personnel in Selected Zone */}
              <div className="space-y-2">
                <h5 className="text-xs font-black text-slate-300 uppercase font-mono">
                  {pt ? 'Pessoas / Profissionais Alocados:' : 'Allocated Personnel:'}
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {HOSPITAL_PERSON_MARKERS.filter((p) => p.zoneId === selectedZone.id).length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500 italic">
                      {pt ? 'Nenhum profissional no momento nesta sala.' : 'No personnel currently in this room.'}
                    </div>
                  ) : (
                    HOSPITAL_PERSON_MARKERS.filter((p) => p.zoneId === selectedZone.id).map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5"
                      >
                        <span className="text-xl">{p.avatarEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">{p.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${p.badgeColor}`}>
                              {p.badgeText}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                            {pt ? p.currentActivityPt : p.currentActivityEn}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick links to role dashboard */}
              {onOpenRoleDashboard && (
                <div className="pt-2">
                  <button
                    onClick={() => onOpenRoleDashboard('medico')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                  >
                    <span>{pt ? 'Abrir Painel Clínico deste Pavimento' : 'Open Floor Clinical View'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Physical Infrastructure Telemetry Box (openDCIM / NetBox / OpenBoxes) */}
          <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  {pt ? 'Telemetria de Infraestrutura' : 'Infra Telemetry'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                openDCIM N+1
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {currentFloorInfra.map((node) => (
                <div
                  key={node.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{node.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {node.code}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {pt ? node.detailsPt : node.detailsEn}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                    <span>
                      {node.telemetry.metricLabel}: <strong className="text-slate-300">{node.telemetry.metricValue}</strong>
                    </span>
                    <span className="text-emerald-400">{node.telemetry.temperatureC}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Ecosystem Integration Architecture (OpenMRS + OpenBoxes + openDCIM + NetBox + Odoo) */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-black text-white">
                {pt
                  ? 'Ecossistema Aberto Integrado (Arquitetura de Dados de Mercado)'
                  : 'Integrated Open Source Ecosystem (Production Architecture)'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {pt
                ? 'Conexão em tempo real entre HIS, WMS, DCIM e ERP através de barramento de eventos HL7 FHIR e APIs abertas.'
                : 'Real-time orchestration between HIS, WMS, DCIM and ERP via HL7 FHIR and open APIs.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800/80">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>HL7 FHIR v4.0.1 Bus Active</span>
          </div>
        </div>

        {/* 4 Connected System Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              system: 'openDCIM / NetBox',
              title: pt ? '1. Observabilidade TI & Redes' : '1. DCIM & Network Observability',
              badge: 'openDCIM GPL v3 • NetBox',
              desc: pt
                ? 'Mapeia os racks 42U, switches 10GbE, temperatura e no-breaks N+1. Dispara alerta se um disjuntor da UTI ou vacinas oscilar.'
                : 'Maps 42U racks, 10GbE switches, thermal metrics and N+1 UPS. Alerts immediately upon circuit or switch drops.',
              color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
              icon: Server,
            },
            {
              system: 'OpenMRS / OpenEMR',
              title: pt ? '2. Prontuário & Clínico (HIS)' : '2. Clinical EHR / HIS Core',
              badge: 'OpenMRS Core • HL7 FHIR',
              desc: pt
                ? 'Gerencia o prontuário do paciente, leitos, triagem Manchester e assina prescrições médicas emitindo eventos HL7 FHIR.'
                : 'Manages EHR records, beds, Manchester triage and digital medical prescriptions generating HL7 FHIR events.',
              color: 'border-sky-500/40 bg-sky-950/20 text-sky-300',
              icon: Stethoscope,
            },
            {
              system: 'OpenBoxes / OpenLMIS',
              title: pt ? '3. WMS & Cadeia de Frio' : '3. WMS & Cold Chain Logistics',
              badge: 'OpenBoxes Java • Rastreio Lote',
              desc: pt
                ? 'Recebe a prescrição FHIR, debita o lote com rastreabilidade, emite ordens de separação e abastece a farmácia satélite.'
                : 'Receives FHIR prescriptions, deducts specific batches, creates picking orders and replenishes satellite pharmacies.',
              color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
              icon: Boxes,
            },
            {
              system: 'Odoo ERP / Apache OFBiz',
              title: pt ? '4. Gestão Financeira & SUS' : '4. Corporate ERP & Healthcare Billing',
              badge: 'Odoo Community • SUS AIH',
              desc: pt
                ? 'Consolida custos de OPME, faturamento SUS (AIH / APAC), contas a pagar, suprimentos macro e RH hospitalar.'
                : 'Consolidates surgical OPME costs, public SUS billing, accounts payable, macro purchasing and healthcare payroll.',
              color: 'border-violet-500/40 bg-violet-950/20 text-violet-300',
              icon: FileCode2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-3 ${item.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono opacity-80">
                  <span>API HL7 FHIR</span>
                  <span className="text-emerald-400">Online 100%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Event Stream Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-300 uppercase font-mono tracking-wider">
              {pt ? 'Log de Transações HL7 FHIR e Observabilidade' : 'HL7 FHIR & Observability Transaction Log'}
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {events.length} {pt ? 'mensagens registradas' : 'messages captured'}
            </span>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
              {events.map((evt) => (
                <div key={evt.id} className="p-3 sm:p-4 hover:bg-slate-900/50 transition-colors space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold">{evt.timestamp}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-bold font-mono text-[10px]">
                        {evt.sourceSystem} → {evt.targetSystem}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400">{evt.protocol}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        evt.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {evt.eventType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{pt ? evt.descriptionPt : evt.descriptionEn}</p>

                  <details className="text-[10px] font-mono text-slate-500 cursor-pointer pt-0.5">
                    <summary className="hover:text-slate-300 transition-colors">
                      {pt ? 'Ver Payload JSON' : 'View JSON Payload'}
                    </summary>
                    <pre className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 mt-1 overflow-x-auto whitespace-pre-wrap">
                      {evt.payloadSnippet}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Server Architecture Simulator: On-Premise vs Hybrid Cloud Kubernetes */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-800">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
              <Cpu className="w-3.5 h-3.5" />
              <span>{pt ? 'ARQUITETURA DE SERVIDORES & IMPLANTAÇÃO' : 'SERVER DEPLOYMENT ARCHITECTURE'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {pt
                ? 'Data Center On-Premise vs Infraestrutura Híbrida em Nuvem (Docker/K8s)'
                : 'On-Premise Data Center vs Hybrid Cloud Infrastructure (Docker & K8s)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {pt
                ? 'Escolha a topologia de servidores ideal para a escala do hospital e visualize a distribuição física dos nós, latência e conformidade regulatória.'
                : 'Select the target server topology to simulate physical nodes, low-latency performance and regulatory compliance.'}
            </p>
          </div>

          {/* Topology Mode Selector Switcher */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-700 shrink-0">
            <button
              onClick={() => setArchitectureMode('on_premise')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                architectureMode === 'on_premise'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>{pt ? 'On-Premise (Local)' : 'On-Premise'}</span>
            </button>
            <button
              onClick={() => setArchitectureMode('hybrid_cloud')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                architectureMode === 'hybrid_cloud'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{pt ? 'Híbrido Nuvem (K8s)' : 'Hybrid Cloud K8s'}</span>
            </button>
          </div>
        </div>

        {/* Selected Topology Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Server Nodes Stack (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">
                  {pt ? currentTopology.namePt : currentTopology.nameEn}
                </h3>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  SLA: {currentTopology.availabilitySla}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {pt ? currentTopology.summaryPt : currentTopology.summaryEn}
              </p>
            </div>

            {/* List of Server Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentTopology.serverNodes.map((node, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{node.name}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {node.role}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono">{node.spec}</p>

                  <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-1">
                    {node.softwareStack.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Architecture Analysis & Compliance (1 col) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-black text-slate-300 uppercase font-mono tracking-wider">
              {pt ? 'Indicadores de Infraestrutura' : 'Infrastructure KPIs'}
            </h4>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="block text-slate-400 text-[10px]">{pt ? 'Latência Média de Laudo:' : 'Avg DICOM Latency:'}</span>
                <span className="text-lg font-black text-cyan-400">{currentTopology.latencyMs} ms</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  {currentTopology.mode === 'on_premise' ? '10GbE local direto' : 'SD-WAN IPsec Edge'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="block text-slate-400 text-[10px] font-bold uppercase">
                  {pt ? 'Armazenamento & PACS:' : 'Storage & PACS:'}
                </span>
                <p className="text-[11px] text-slate-300 font-sans">
                  {currentTopology.storageArchitecturePt}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="block text-slate-400 text-[10px] font-bold uppercase">
                  {pt ? 'Rede & Segmentação:' : 'Network & Security:'}
                </span>
                <p className="text-[11px] text-slate-300 font-sans">
                  {currentTopology.networkTopologyPt}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="block text-slate-400 text-[10px] font-bold uppercase">
                  {pt ? 'Conformidade Regulatória:' : 'Regulatory Compliance:'}
                </span>
                <p className="text-[11px] text-emerald-300 font-sans">
                  {currentTopology.compliancePt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
