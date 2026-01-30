// import {fakerRU as faker} from '@faker-js/faker';
// import {
//     CalcCheckpointFormType,
//     CheckpointCalcDestination,
//     CheckpointFormFieldRecord,
//     ShiftCheckpoint
// } from "@/types/shift.types";
// import {Employee} from "@/types/employee.types";
// import {RealisticEmployeeStub} from "@/stub/employee.stub";
// import {checkpointDialogForms} from "@/components/shift/shift.checkpoint.components.dialog.constants";
//
// export class RealisticShiftCheckpointStub {
//     static generate(
//         employeeCount: number = 2,
//         type: CalcCheckpointFormType = CalcCheckpointFormType.REGULAR
//     ): ShiftCheckpoint {
//         const employees: Employee[] = RealisticEmployeeStub.generateForCompany(employeeCount)
//
//         const createdAt = faker.date.recent();
//
//         const fieldsResource = type === CalcCheckpointFormType.REGULAR
//             ? checkpointDialogForms.REGULAR.fields
//             : checkpointDialogForms.FINAL.fields
//
//         const fieldRecords: CheckpointFormFieldRecord[] = fieldsResource.map(f => ({
//             id: f.label,
//             label: f.label,
//             value: faker.number.int({min: 500, max: 5000}),
//             destination: f.destination
//         } as CheckpointFormFieldRecord))
//
//         return {
//             id: faker.string.uuid(),
//             tips: fieldRecords.filter(r => r.destination === CheckpointCalcDestination.TIPS)
//                 .map(el => el.value).reduce((prev, cur) => prev + cur),
//             revenue: fieldRecords.filter(r => r.destination === CheckpointCalcDestination.REVENUE)
//                 .map(el => el.value).reduce((prev, cur) => prev + cur),
//             type: CalcCheckpointFormType.REGULAR,
//             fieldRecords,
//             employees,
//             dateTime: createdAt,
//             creatorUserId: faker.string.uuid(),
//             createdAt,
//             updaterUserId: faker.string.uuid(),
//             updateAt: faker.date.between({from: createdAt, to: new Date()})
//         };
//     }
//
//     static generateList(count: number = 5): ShiftCheckpoint[] {
//         return Array.from({length: count}, () => this.generate());
//     }
// }
//
// // Использование:
// export const realisticCheckpoint = RealisticShiftCheckpointStub.generate();
// export const checkpointList = RealisticShiftCheckpointStub.generateList(10);