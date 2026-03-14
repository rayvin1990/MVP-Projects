// 时间记录类型
export interface TimeEntry {
  id: string;
  projectId: string;
  description: string;
  startTime: number; // timestamp
  endTime: number | null; // timestamp, null 表示正在计时
  createdAt: number;
}

// 项目类型
export interface Project {
  id: string;
  name: string;
  color: string;
  hourlyRate: number;
  clientId: string | null;
  createdAt: number;
}

// 客户类型
export interface Client {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  createdAt: number;
}

// 发票类型
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  timeEntryIds: string[];
  hourlyRate: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid';
  createdAt: number;
  dueDate?: number;
  notes?: string;
}

// 设置类型
export interface Settings {
  defaultProjectId: string | null;
  autoStart: boolean;
  defaultHourlyRate: number;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  defaultTimezone: string;
  defaultCurrency: string;
}

// Storage Keys
const STORAGE_KEYS = {
  TIME_ENTRIES: 'timeinvoice_entries',
  PROJECTS: 'timeinvoice_projects',
  CLIENTS: 'timeinvoice_clients',
  INVOICES: 'timeinvoice_invoices',
  SETTINGS: 'timeinvoice_settings',
} as const;

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 获取/设置时间记录
export function getTimeEntries(): TimeEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES);
  return data ? JSON.parse(data) : [];
}

export function saveTimeEntries(entries: TimeEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries));
}

export function addTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt'>): TimeEntry {
  const newEntry: TimeEntry = {
    ...entry,
    id: generateId(),
    createdAt: Date.now(),
  };
  const entries = getTimeEntries();
  entries.unshift(newEntry);
  saveTimeEntries(entries);
  return newEntry;
}

export function updateTimeEntry(id: string, updates: Partial<TimeEntry>): void {
  const entries = getTimeEntries();
  const index = entries.findIndex(e => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    saveTimeEntries(entries);
  }
}

export function deleteTimeEntry(id: string): void {
  const entries = getTimeEntries().filter(e => e.id !== id);
  saveTimeEntries(entries);
}

// 获取/设置项目
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (!data) {
    // Default project
    const defaultProjects: Project[] = [
      { id: 'default', name: 'Default Project', color: '#6366f1', hourlyRate: 100, clientId: null, createdAt: Date.now() },
    ];
    saveProjects(defaultProjects);
    return defaultProjects;
  }
  // 确保旧数据有默认值
  const projects = JSON.parse(data);
  return projects.map((p: Project) => ({
    ...p,
    hourlyRate: p.hourlyRate ?? 100,
    clientId: p.clientId ?? null,
  }));
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

export function addProject(name: string, color: string, hourlyRate: number = 100, clientId: string | null = null): Project {
  const newProject: Project = {
    id: generateId(),
    name,
    color,
    hourlyRate,
    clientId,
    createdAt: Date.now(),
  };
  const projects = getProjects();
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates };
    saveProjects(projects);
  }
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
}

// 获取/设置设置
export function getSettings(): Settings {
  if (typeof window === 'undefined') return { 
    defaultProjectId: null, 
    autoStart: false,
    defaultHourlyRate: 100,
    businessName: '',
    businessAddress: '',
    businessEmail: '',
    defaultTimezone: 'Asia/Shanghai',
    defaultCurrency: 'CNY'
  };
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  const defaults = { 
    defaultProjectId: null, 
    autoStart: false,
    defaultHourlyRate: 100,
    businessName: '',
    businessAddress: '',
    businessEmail: '',
    defaultTimezone: 'Asia/Shanghai',
    defaultCurrency: 'CNY'
  };
  return data ? { ...defaults, ...JSON.parse(data) } : defaults;
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// 计算时间跨度（毫秒）
export function calculateDuration(entry: TimeEntry): number {
  if (!entry.endTime) {
    return Date.now() - entry.startTime;
  }
  return entry.endTime - entry.startTime;
}

// 格式化时间显示
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

// ============ Invoice Functions ============

export function getInvoices(): Invoice[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
  return data ? JSON.parse(data) : [];
}

export function saveInvoices(invoices: Invoice[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
}

export function getInvoiceById(id: string): Invoice | undefined {
  return getInvoices().find(inv => inv.id === id);
}

export function createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>): Invoice {
  const invoices = getInvoices();
  const invoiceNumber = `INV-${String(invoices.length + 1).padStart(4, '0')}`;
  const newInvoice: Invoice = {
    ...invoice,
    id: generateId(),
    invoiceNumber,
    createdAt: Date.now(),
  };
  invoices.unshift(newInvoice);
  saveInvoices(invoices);
  return newInvoice;
}

export function updateInvoice(id: string, updates: Partial<Invoice>): void {
  const invoices = getInvoices();
  const index = invoices.findIndex(inv => inv.id === id);
  if (index !== -1) {
    invoices[index] = { ...invoices[index], ...updates };
    saveInvoices(invoices);
  }
}

export function deleteInvoice(id: string): void {
  const invoices = getInvoices().filter(inv => inv.id !== id);
  saveInvoices(invoices);
}

// ============ Client Functions ============

export function getClients(): Client[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return data ? JSON.parse(data) : [];
}

export function saveClients(clients: Client[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
}

export function getClientById(id: string): Client | undefined {
  return getClients().find(c => c.id === id);
}

export function createClient(client: Omit<Client, 'id' | 'createdAt'>): Client {
  const clients = getClients();
  const newClient: Client = {
    ...client,
    id: generateId(),
    createdAt: Date.now(),
  };
  clients.push(newClient);
  saveClients(clients);
  return newClient;
}

export function updateClient(id: string, updates: Partial<Client>): void {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updates };
    saveClients(clients);
  }
}

export function deleteClient(id: string): void {
  const clients = getClients().filter(c => c.id !== id);
  saveClients(clients);
}

// 添加客户
export function addClient(client: Omit<Client, 'id' | 'createdAt'>): Client {
  const newClient: Client = {
    ...client,
    id: generateId(),
    createdAt: Date.now(),
  };
  const clients = getClients();
  clients.push(newClient);
  saveClients(clients);
  return newClient;
}

// 添加发票
export function addInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Invoice {
  const invoices = getInvoices();
  const year = new Date().getFullYear();
  const count = invoices.filter(i => i.invoiceNumber.startsWith(`INV-${year}`)).length + 1;
  const invoiceNumber = `INV-${year}-${String(count).padStart(4, '0')}`;
  
  const newInvoice: Invoice = {
    ...invoice,
    id: generateId(),
    invoiceNumber,
    createdAt: Date.now(),
  };
  invoices.unshift(newInvoice);
  saveInvoices(invoices);
  return newInvoice;
}

// 计算小时数（从时间条目）
export function calculateHours(entries: TimeEntry[]): number {
  const totalMs = entries.reduce((sum, entry) => sum + calculateDuration(entry), 0);
  return totalMs / (1000 * 60 * 60); // 转换为小时
}

// 格式化货币
export function formatCurrency(amount: number, symbol: string = '$'): string {
  return `${symbol}${amount.toFixed(2)}`;
}
