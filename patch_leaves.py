import re

with open('app/leaves/page.tsx', 'r') as f:
    content = f.read()

# 1. Imports
imports = """
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const leaveRequestSchema = z.object({
  leave_type_id: z.string().min(1, 'Please select a leave type.'),
  start_date: z.string().min(1, 'Please provide a valid start date.'),
  end_date: z.string().min(1, 'Please provide a valid end date.'),
  session_from: z.string().default('Session 1'),
  session_to: z.string().default('Session 2'),
  reason: z.string().optional().default(''),
  contact_details: z.string().optional().default(''),
}).superRefine((data, ctx) => {
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date cannot be before start date.',
        path: ['end_date']
      });
    } else if (data.start_date === data.end_date && data.session_from === 'Session 2' && data.session_to === 'Session 1') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'For same-day leave, session range is invalid.',
        path: ['session_to']
      });
    }
  }
});
type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;
"""
content = content.replace("import { apiFetch, buildApiUrl, getApiBaseUrl, isNetworkFetchError } from '@/lib/apiBase';", "import { apiFetch, buildApiUrl, getApiBaseUrl, isNetworkFetchError } from '@/lib/apiBase';\n" + imports)

# 2. Component state
old_form_state = """  const [form, setForm] = useState({ 
    leave_type_id: '', 
    start_date: '', 
    end_date: '', 
    session_from: 'Session 1',
    session_to: 'Session 2',
    reason: '',
    contact_details: '',
  });"""
new_form_state = """  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    mode: 'onChange',
    defaultValues: {
      leave_type_id: '', 
      start_date: '', 
      end_date: '', 
      session_from: 'Session 1',
      session_to: 'Session 2',
      reason: '',
      contact_details: '',
    }
  });
  
  const formLeaveTypeId = watch('leave_type_id');
  const formStartDate = watch('start_date');
  const formEndDate = watch('end_date');
"""
content = content.replace(old_form_state, new_form_state)

# 3. submitRequest
old_submit = "async function submitRequest(e: React.FormEvent) {"
new_submit = "const submitRequest = async (data: LeaveRequestFormValues) => {"
content = content.replace(old_submit, new_submit)

# replace e.preventDefault()
content = content.replace("e.preventDefault();\n    if (!auth.token) return;", "if (!auth.token) return;")

# remove manual validation in submitRequest
content = content.replace("""    const validationError = validateLeaveForm();
    if (validationError) {
      setError(validationError);
      return;
    }""", "")

# replace form. values in submitRequest with data.
content = content.replace("leave_type_id: form.leave_type_id", "leave_type_id: data.leave_type_id")
content = content.replace("start_date: form.start_date", "start_date: data.start_date")
content = content.replace("end_date: form.end_date", "end_date: data.end_date")
content = content.replace("session_from: form.session_from", "session_from: data.session_from")
content = content.replace("session_to: form.session_to", "session_to: data.session_to")
content = content.replace("reason: form.reason", "reason: data.reason")
content = content.replace("contact_details: form.contact_details", "contact_details: data.contact_details")

# reset form
content = content.replace("setForm({ leave_type_id: '', start_date: '', end_date: '', session_from: 'Session 1', session_to: 'Session 2', reason: '', contact_details: '' });", "reset();")

# 4. handleCategoryClick
content = content.replace("setForm((prev) => ({ ...prev, leave_type_id: leaveTypeId }));", "setValue('leave_type_id', leaveTypeId, { shouldValidate: true });")

# 5. useEffect for selectedCategory
content = content.replace("if (!form.leave_type_id) {", "if (!formLeaveTypeId) {")
content = content.replace("setSelectedCategory(resolveLeaveTypeLabel(form.leave_type_id));", "setSelectedCategory(resolveLeaveTypeLabel(formLeaveTypeId));")
content = content.replace("[form.leave_type_id, leaveTypeNameById]", "[formLeaveTypeId, leaveTypeNameById]")

# 6. Form JSX
content = content.replace("<form onSubmit={submitRequest}>", "<form onSubmit={handleSubmit(submitRequest)}>")

# Disable button
content = content.replace("disabled={submitting || !form.leave_type_id || !form.start_date || !form.end_date || !canRequestLeave}", "disabled={submitting || !formLeaveTypeId || !formStartDate || !formEndDate || !canRequestLeave}")

with open('app/leaves/page.tsx', 'w') as f:
    f.write(content)

