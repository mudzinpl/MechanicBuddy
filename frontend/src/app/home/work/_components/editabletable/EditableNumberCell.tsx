import React, { useState, useImperativeHandle } from "react";
import { EditableCellHandle, IEditableNumericCellProps, Input } from "./EditableCell";

const formatPln = (value: number) =>
    `${new Intl.NumberFormat('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value).replace(/\u00A0/g, ' ')} zł`;

const EditableNumberCell = React.forwardRef<EditableCellHandle<number|null>, IEditableNumericCellProps<number|null>>((props, ref) => {
    const {
        defaultValue, placeholder, id, name, isEditing, className, step, isMoney, isPercentage, required
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);

    useImperativeHandle(ref, () => ({
        getValue(): number | null{
            return internalValue;
        },
        setValue(value: number |  null) {
            return setInternalValue(value);
        },
    }));

    const getFormattedValue = () => {
        if (internalValue === 0) return '';
        if (isMoney) {
            if (!internalValue) return '';
            return formatPln(internalValue);
        }
        if (isPercentage) return internalValue + ' %';
        return internalValue;
    };
    if (!isEditing) return getFormattedValue();

    return Input(required, id, name, "number", step, placeholder, internalValue, (e) => setInternalValue(+e.currentTarget.value), className);

});
EditableNumberCell.displayName = "EditableNumberCell";
export {
    EditableNumberCell
}