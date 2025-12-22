export function getShiftDate(shiftStartTime: string): Date {
    const now = new Date();
    const today = new Date(now);
    console.log("Date now:", now)
    console.log("Date today:", today)

    // Парсим время начала смены
    const [hours, minutes, seconds] = shiftStartTime.split(':').map(Number);
    const shiftStart = new Date(today);
    shiftStart.setHours(hours || 0, minutes || 0, seconds || 0, 0);

    // Если сейчас раньше времени начала смены, берем вчера
    if (now < shiftStart) {
        shiftStart.setDate(shiftStart.getDate() - 1);
    }

    console.log("Date result:", shiftStart)

    return shiftStart;
}