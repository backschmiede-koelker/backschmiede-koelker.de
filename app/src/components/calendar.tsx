import { useState } from "react"

export default function Calendar() {

    const [currentDate, setCurrentDate] = useState(new Date)

    function decreaseMonth() {
        const month = currentDate.getMonth() === 1 ? currentDate.getMonth() - 1 : 12;
        const year = currentDate.getMonth() === 1 ? currentDate.getFullYear() : currentDate.getFullYear() -1
        setCurrentDate(new Date(year, month, 1))
    }

    function increaseMonth() {
        const month = currentDate.getMonth() === 12 ? currentDate.getMonth() + 1 : 1;
        const year = currentDate.getMonth() === 12 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
        setCurrentDate(new Date(year, month, 1))
    }

    return (
        <div className="calendar">
            
        </div>
    )
}