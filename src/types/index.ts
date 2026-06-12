// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  username: string
  full_name?: string | null   // optional — set later via Settings/profile
  avatar_url: string | null
  created_at: string
}

// ─── Project ──────────────────────────────────────────────────────────────────

export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface Project {
  id: string
  name: string
  description: string | null
  owner_id: string
  client_name: string | null
  client_email: string | null
  status: ProjectStatus
  color: string
  budget: number
  portal_token: string | null
  created_at: string
  updated_at: string
}

// When creating a project we only send these fields
export interface CreateProjectPayload {
  name: string
  description?: string
  client_name?: string
  client_email?: string
  color?: string
  budget?: number
}

// ─── Project Member ───────────────────────────────────────────────────────────

export type MemberRole = 'owner' | 'member'

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: MemberRole
  joined_at: string
  // Joined from users table when fetching members
  user?: User
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  due_date: string | null
  position: number
  created_by: string
  created_at: string
  updated_at: string
  // Optionally joined
  assignee?: User
  attachments?: TaskAttachment[]
  _commentCount?: number
}

export interface CreateTaskPayload {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: string
  due_date?: string
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: string | null
  due_date?: string | null
  position?: number
}

// ─── Task Attachment ──────────────────────────────────────────────────────────

export interface TaskAttachment {
  id: string
  task_id: string
  file_url: string
  file_name: string
  file_size: number | null
  uploaded_by: string
  uploaded_at: string
}

// ─── Comment ──────────────────────────────────────────────────────────────────

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: User
}

// ─── Time Log ─────────────────────────────────────────────────────────────────

export interface TimeLog {
  id: string
  task_id: string
  project_id: string
  user_id: string
  minutes: number
  description: string | null
  logged_at: string
  billable: boolean
  created_at: string
  user?: User
}

export interface CreateTimeLogPayload {
  minutes: number
  description?: string
  logged_at?: string
  billable?: boolean
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  project_id: string
  owner_id: string
  invoice_number: string
  client_name: string
  client_email: string
  status: InvoiceStatus
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  currency: string
  due_date: string | null
  paid_at: string | null
  stripe_payment_link: string | null
  stripe_session_id: string | null
  notes: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
  line_items?: InvoiceLineItem[]
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  time_log_ids: string[] | null
  position: number
}

export interface CreateInvoicePayload {
  project_id: string
  client_name: string
  client_email: string
  currency?: string
  due_date?: string
  notes?: string
  tax_rate?: number
  line_items: {
    description: string
    quantity: number
    unit_price: number
    time_log_ids?: string[]
  }[]
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardData {
  total_revenue: number
  pending_revenue: number
  active_projects: number
  total_hours_this_month: number
  revenue_by_month: { month: string; amount: number }[]
  recent_activity: ActivityItem[]
  project_stats: ProjectStat[]
}

export interface ActivityItem {
  id: string
  type: 'task_created' | 'task_moved' | 'invoice_paid' | 'comment_added' | 'member_joined'
  description: string
  user?: User
  created_at: string
}

export interface ProjectStat {
  project_id: string
  project_name: string
  total_tasks: number
  completed_tasks: number
  total_hours: number
  billed_amount: number
}

// ─── Client Portal ────────────────────────────────────────────────────────────

export interface ClientPortalData {
  project: Pick<Project, 'id' | 'name' | 'description' | 'client_name' | 'status' | 'color'>
  tasks: Pick<Task, 'id' | 'title' | 'status' | 'priority' | 'due_date'>[]
  invoices: Pick<Invoice, 'id' | 'invoice_number' | 'status' | 'total' | 'currency' | 'due_date' | 'stripe_payment_link'>[]
}

// ─── API Response wrappers ────────────────────────────────────────────────────

// Every API response from our backend follows this shape
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  status: number
}

// ─── Socket event payloads ────────────────────────────────────────────────────

export interface TaskMovedPayload {
  taskId: string
  newStatus: TaskStatus
  newPosition: number
  projectId: string
}

export interface TaskUpdatedPayload {
  task: Task
  projectId: string
}

export interface CommentAddedPayload {
  comment: Comment
  taskId: string
  projectId: string
}