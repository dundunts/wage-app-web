# Wage App Web

Wage App Web предоставляет пользовательский интерфейс для учёта рабочих смен
и выплат отдельно по каждой рабочей точке.

## Language

**Company**:
Рабочая точка, для которой смены и выплаты учитываются независимо.
_Avoid_: Предприятие как юридическое лицо, ресторан

**Employee**:
Человек, чей труд и выплаты учитываются в одной или нескольких Company. Employee
не обязательно является User.
_Avoid_: User, аккаунт

**User**:
Аутентифицированная учётная запись, которая может быть связана с Employee.
_Avoid_: Employee

**Position**:
Рабочее обозначение Employee, например менеджер или официант. Position само по
себе не предоставляет системные права.
_Avoid_: Роль, permission

**Shift Session**:
Учётная сессия одной рабочей смены для одной Company.
_Avoid_: Смена Employee, Shift

**Checkpoint**:
Граница интервала Shift Session, фиксирующая состав команды, накопленную Revenue
и Restaurant Tips. Начало Shift Session не является Checkpoint.
_Avoid_: Отчёт, событие

**Revenue**:
Накопленная выручка Company на определённый момент Shift Session.

**Restaurant Tips**:
Накопленный фонд чаевых и сервисных выплат Company на определённый момент Shift
Session.
_Avoid_: Employee Tips

**Shift Result Draft**:
Предварительный расчёт выплат по Shift Session, который ещё не подтверждён.
_Avoid_: Shift Result, отчёт

**Shift Result**:
Подтверждённый набор выплат сотрудникам за одну Shift Session одной Company.
_Avoid_: Отчёт, Payroll

**Payment**:
Выплата одному Employee, зафиксированная в Shift Result.
_Avoid_: Payroll, Salary

**Payroll**:
Выплаты сотрудникам, агрегированные за период для одной Company.
_Avoid_: Payment, Shift Result

**Salary**:
Общее пользовательское название оплаты труда. В доменной документации следует
использовать более точный термин Payment или Payroll.
