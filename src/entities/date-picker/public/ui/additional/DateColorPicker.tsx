import { FC, ReactNode } from 'react';

interface OwnProps {
 children: ReactNode;
}


const DateColorPicker: FC<OwnProps> = () => {
 return <section className="dateColorPicker"></section>;
};

export default DateColorPicker;