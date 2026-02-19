import {EmployeeBase} from "@/types/employee.types";

export function formatEmployeeName(employee: EmployeeBase): string {
    return employee.simpleName || `${employee.lastName} ${employee.firstName[0]}.`
}