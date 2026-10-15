export type FloorLevel = -1 | 0 | 1;

export type HospitalZoneType =
  | 'reception'
  | 'triage'
  | 'ambulatory'
  | 'imaging_center'
  | 'surgical_block'
  | 'icu_ward'
  | 'general_ward'
  | 'satellite_pharmacy'
  | 'central_wms_depot'
  | 'dcim_data_center'
  | 'power_substation'
  | 'o2_gas_plant'
  | 'hvac_plant'
  | 'executive_board';

export interface ArchitecturalZone {
  id: string;
  name: string;
  shortCode: string;
  floor: FloorLevel;
  type: HospitalZoneType;
  gridArea: string; // e.g. "col-span-2 row-span-1"
  areaM2: number;
  capacityMax: number;
  openSourceApp: 'OpenMRS' | 'OpenBoxes' | 'openDCIM' | 'NetBox' | 'Odoo' | 'All';
  descriptionPt: string;
  descriptionEn: string;
  colorScheme: {
    border: string;
    bg: string;
    accent: string;
    badge: string;
  };
  infraSummary: string;
}

export type PersonProfileRole =
  | 'paciente'
  | 'recepcionista'
  | 'medico'
  | 'enfermeiro'
  | 'manutencao_ti'
  | 'farmaceutico_wms'
  | 'gestor_diretoria';

export interface HospitalPersonMarker {
  id: string;
  name: string;
  role: PersonProfileRole;
  floor: FloorLevel;
  zoneId: string;
  avatarEmoji: string;
  badgeText: string;
  badgeColor: string;
  currentActivityPt: string;
  currentActivityEn: string;
  coordinates: { xPercent: number; yPercent: number };
}

export type InfrastructureCategory =
  | 'dcim_rack'
  | 'netbox_network'
  | 'power_ups'
  | 'o2_gases'
  | 'hvac_negative_pressure'
  | 'cold_storage';

export interface PhysicalInfraNode {
  id: string;
  name: string;
  code: string;
  category: InfrastructureCategory;
  floor: FloorLevel;
  zoneId: string;
  status: 'optimal' | 'warning' | 'alert' | 'redundancy_active';
  systemBinding: 'openDCIM' | 'NetBox' | 'OpenBoxes' | 'OpenMRS';
  telemetry: {
    powerKw: number;
    temperatureC: number;
    redundancyMode: string;
    uptimePercent: number;
    metricLabel: string;
    metricValue: string;
  };
  detailsPt: string;
  detailsEn: string;
}

export type ServerArchitectureMode = 'on_premise' | 'hybrid_cloud';

export interface EcosystemIntegrationEvent {
  id: string;
  timestamp: string;
  sourceSystem: 'OpenMRS / OpenEMR' | 'OpenBoxes' | 'openDCIM' | 'NetBox' | 'Odoo ERP';
  targetSystem: 'OpenMRS / OpenEMR' | 'OpenBoxes' | 'openDCIM' | 'NetBox' | 'Odoo ERP';
  protocol: 'HL7 FHIR v4.0.1' | 'REST / JSON API' | 'SNMP v3 / Telemetry' | 'Kafka / RabbitMQ Event';
  eventType: 'MedicationRequest' | 'BatchAllocation' | 'BreakerAlert' | 'DicomPush' | 'SusInvoiceBill';
  descriptionPt: string;
  descriptionEn: string;
  payloadSnippet: string;
  status: 'success' | 'warning' | 'processing';
}

export interface DeploymentTopologyConfig {
  mode: ServerArchitectureMode;
  namePt: string;
  nameEn: string;
  summaryPt: string;
  summaryEn: string;
  serverNodes: Array<{
    name: string;
    role: string;
    spec: string;
    status: 'active' | 'standby';
    softwareStack: string[];
  }>;
  storageArchitecturePt: string;
  networkTopologyPt: string;
  compliancePt: string;
  latencyMs: number;
  availabilitySla: string;
}
