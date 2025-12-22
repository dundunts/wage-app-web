import { fakerRU as faker } from '@faker-js/faker';
import { Company } from '@/types/company.types';

export class RealisticCompanyStub {
    // Константа - ID тестовой компании
    static readonly DEFAULT_COMPANY_ID = 'company-12345';

    // Предопределенные названия компаний для реалистичности
    private static readonly COMPANY_NAMES = [
        'Вкусно и Точка',
        'Ресторан "У Белки"',
        'Кафе "Блинчики"',
        'Кофейня "Арабика"',
        'Пиццерия "Маргарита"',
        'Столовая №1',
        'Бар "У Ашота"',
        'Ресторан "Золотой Дракон"',
        'Фастфуд "Бургер Кинг"',
        'Пекарня "Сдоба"'
    ];

    private static readonly COMPANY_TYPES = [
        'ООО', 'ИП', 'АО', 'ЗАО'
    ];

    // Генерация одной компании
    static generate(companyId: string = this.DEFAULT_COMPANY_ID): Company {
        const companyType = faker.helpers.arrayElement(this.COMPANY_TYPES);
        const companyName = faker.helpers.arrayElement(this.COMPANY_NAMES);

        return {
            id: companyId,
            title: `${companyType} "${companyName}"`,
            employeeWageCoefficientFromRevenue: faker.number.float({
                min: 0.05,
                max: 0.2,
            }),
            defaultShiftStartTime: "11:00"
        };
    }

    // Генерация компании с конкретным коэффициентом
    static generateWithCoefficient(
        coefficient: number,
        companyId: string = this.DEFAULT_COMPANY_ID
    ): Company {
        const company = this.generate(companyId);
        return {
            ...company,
            employeeWageCoefficientFromRevenue: coefficient
        };
    }

    // Генерация нескольких компаний
    static generateMultiple(count: number = 3): Company[] {
        return Array.from({ length: count }, (_, index) =>
            this.generate(`company-${index + 1}`)
        );
    }

    // Генерация компании по типу бизнеса
    static generateByBusinessType(businessType: 'restaurant' | 'cafe' | 'store' | 'office'): Company {
        const businessTitles = {
            restaurant: ['Ресторан "Гурман"', 'Ресторан "Престиж"', 'Ресторан "Уют"'],
            cafe: ['Кафе "Кофеин"', 'Кафе "Пирожок"', 'Кафе "У Федора"'],
            store: ['Магазин "Продукты"', 'Супермаркет "Еда"', 'Гипермаркет "Мега"'],
            office: ['Офис "Технологии"', 'Бюро "Аналитика"', 'Агентство "Старт"']
        };

        const businessCoefficients = {
            restaurant: { min: 0.08, max: 0.15 },  // 8-15%
            cafe: { min: 0.06, max: 0.12 },        // 6-12%
            store: { min: 0.04, max: 0.08 },       // 4-8%
            office: { min: 0.1, max: 0.2 }         // 10-20%
        };

        return {
            id: faker.string.uuid(),
            title: faker.helpers.arrayElement(businessTitles[businessType]),
            employeeWageCoefficientFromRevenue: faker.number.float(businessCoefficients[businessType]),
            defaultShiftStartTime: "11:00"
        };
    }

    // Получение компании по ID (если нужна консистентность)
    static getCompany(id: string = this.DEFAULT_COMPANY_ID): Company {
        // Для консистентности в тестах можно возвращать фиксированные данные
        const predefinedCompanies: Record<string, Company> = {
            'company-12345': {
                id: 'company-12345',
                title: 'ООО "Вкусно и Точка"',
                employeeWageCoefficientFromRevenue: 0.1, // 10%
                defaultShiftStartTime: "11:00"
            },
            'company-67890': {
                id: 'company-67890',
                title: 'ИП "Ресторан У Белки"',
                employeeWageCoefficientFromRevenue: 0.15, // 15%
                defaultShiftStartTime: "11:00"
            },
            'company-11111': {
                id: 'company-11111',
                title: 'АО "Кофейня Арабика"',
                employeeWageCoefficientFromRevenue: 0.08,
                defaultShiftStartTime: "11:00"
            }
        };

        return predefinedCompanies[id] || this.generate(id);
    }
}

// Константы с тестовыми компаниями
export const TEST_COMPANIES = {
    // Основная тестовая компания (соответствует COMPANY_ID из EmployeeStub)
    MAIN: {
        id: 'company-12345',
        title: 'ООО "Пивная кружка"',
        employeeWageCoefficientFromRevenue: 0.035,
        defaultShiftStartTime: "11:00"
    },

    // Компания с высоким коэффициентом
    HIGH_COEFF: {
        id: 'company-high-coeff',
        title: 'ИП "Ресторан Премиум"',
        employeeWageCoefficientFromRevenue: 0.2,
        defaultShiftStartTime: "11:00"
    },

    // Компания с низким коэффициентом
    LOW_COEFF: {
        id: 'company-low-coeff',
        title: 'Кафе "Эконом"',
        employeeWageCoefficientFromRevenue: 0.05,
        defaultShiftStartTime: "11:00"
    },

    // Компания без коэффициента (для тестирования edge cases)
    NO_COEFF: {
        id: 'company-no-coeff',
        title: 'Тестовая компания',
        employeeWageCoefficientFromRevenue: 0,
        defaultShiftStartTime: "11:00"
    }
} as const;

export const mainCompanyStub = TEST_COMPANIES.MAIN

// Массив тестовых компаний
export const companiesStub: Company[] = [
    TEST_COMPANIES.MAIN,
    TEST_COMPANIES.HIGH_COEFF,
    TEST_COMPANIES.LOW_COEFF,
    TEST_COMPANIES.NO_COEFF
];