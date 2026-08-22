"use client";

import {Input, InputGroup} from "@chakra-ui/react";
import {dateForInput} from "@/utils/date.utils";

type DatePickerProps = {
    value: Date;
    onChange: (date: Date) => void;
};

export function DatePicker({ value, onChange }: DatePickerProps) {
    return (
        <InputGroup maxW="200px">
            <Input
                type="date"
                colorScheme="light dark"
                value={dateForInput(value)}
                onChange={(e) => onChange(new Date(e.target.value))}
            />
        </InputGroup>
    );
}

type DateTimePickerProps = {
    value: Date;
    onChange: (date: Date) => void;
};

export function DateTimePicker({value, onChange}: DateTimePickerProps) {
    return (
        <InputGroup maxW="200px">
            <Input
                type="datetime-local"
                colorScheme="light dark"
                value={dateForInput(value)}
                onChange={(e) => onChange(new Date(e.target.value))}
            />
        </InputGroup>
    );
}
