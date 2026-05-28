import re

with open('app/leaves/page.tsx', 'r') as f:
    content = f.read()

# Add Employee column header in Pending tab
content = content.replace(
    "<TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Leave Type</TableCell>",
    "{canApproveLeave && <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Employee</TableCell>}\n                            <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 2 }}>Leave Type</TableCell>"
)

# Add Employee name in Pending tab
content = content.replace(
    "<TableCell sx={{ color: 'text.primary', fontWeight: 500, py: 2 }}>{resolveLeaveTypeLabel(r.leave_type_id)}</TableCell>",
    "{canApproveLeave && <TableCell sx={{ py: 2 }}>{r.employee_name || 'Unknown'}</TableCell>}\n                              <TableCell sx={{ color: 'text.primary', fontWeight: 500, py: 2 }}>{resolveLeaveTypeLabel(r.leave_type_id)}</TableCell>"
)

# Add Employee type definition
content = content.replace(
    "employee_id: string;",
    "employee_id: string;\n  employee_name?: string;"
)

with open('app/leaves/page.tsx', 'w') as f:
    f.write(content)

