// import { fakerRU as faker } from '@faker-js/faker';
// import { Employee } from '@/types/employee.types';
//
// export class RealisticEmployeeStub {
//     // Константа - сотрудники одной компании
//     static readonly COMPANY_ID = 'company-12345';
//
//     // Генерация одного сотрудника (можно указать компанию или использовать дефолтную)
//     static generate(companyId: string = this.COMPANY_ID): Employee {
//         const firstName = faker.person.firstName();
//         const lastName = faker.person.lastName();
//         const patronymic = faker.person.middleName();
//
//         return {
//             id: faker.string.uuid(),
//             companyIds: [companyId],
//             firstName,
//             lastName,
//             patronymic,
//             simpleName: `${lastName} ${firstName} ${patronymic}`
//         };
//     }
//
//     // Генерация массива сотрудников одной компании
//     static generateForCompany(
//         count: number = 5,
//         companyId: string = this.COMPANY_ID
//     ): Employee[] {
//         return Array.from({ length: count }, () => this.generate(companyId));
//     }
//
//     // Генерация сотрудников для разных компаний
//     static generateMultiple(
//         companies: Array<{ companyId: string; count: number }>
//     ): Employee[] {
//         return companies.flatMap(({ companyId, count }) =>
//             Array.from({ length: count }, () => this.generate(companyId))
//         );
//     }
// }
//
// // Использование:
// export const singleEmployee = RealisticEmployeeStub.generate();
// export const companyEmployees = RealisticEmployeeStub.generateForCompany(5);
// export const mixedEmployees = RealisticEmployeeStub.generateMultiple([
//     { companyId: 'comp-1', count: 2 },
//     { companyId: 'comp-2', count: 3 }
// ]);