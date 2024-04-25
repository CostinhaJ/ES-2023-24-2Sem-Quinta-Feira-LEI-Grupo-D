export default class DateConverter{
        /**
     * Converts a date string to a Date object.
     * @param {string} str - Date string in the format 'dd/mm/yyyy'.
     * @returns {Date | null} Date object if valid, null otherwise.
     */
    static convertToDate(str) {
        if (!str) {
            console.log("Data inválida fornecida para convertToDate:", str);
            return null; // or a default date if preferred
        }
        const parts = str.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // -1 because months in JavaScript start from 0
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }

    /**
     * Adds week information to each data row.
     * @param {Object[]} data - Array of data rows.
     * @returns {Object[]} Array of data rows with added week information.
     */
    static addWeeksToData(data) {
        return data.map(row => {
            if (!row['Data da aula']) {
                console.log("Data da aula ausente para a linha:", row);
                return row; // Or add some default handling for missing dates
            }

            const date = DateConverter.convertToDate(row['Data da aula']);
            if (isNaN(date.getTime())) {
                console.log("Data da aula inválida para a linha:", row);
                return row; // Or add some default handling for invalid dates
            }

            const weekOfYear = DateConverter.getWeekNumber(date);
            row['Semana do ano'] = weekOfYear;
            row['Semana do semestre'] = DateConverter.getSemesterWeekNumber(weekOfYear);
            return row;
        });
    }

    /**
     * Calculates the week number of a given date.
     * @param {Date} d - Date object.
     * @returns {number} Week number.
     */
    static getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    }

    /**
     * Calculates the week number of the semester.
     * @param {number} weekOfYear - Week number of the year.
     * @returns {number | string} Week number of the semester or 'Fora do semestre' (out of semester).
     */
    static getSemesterWeekNumber(weekOfYear) {
        if (weekOfYear >= 5 && weekOfYear <= 19) {
            // First Semester
            return weekOfYear - 4; // Adjustment to start semester week from 1
        } else if (weekOfYear >= 35 && weekOfYear <= 49) {
            // Second Semester
            return weekOfYear - 34; // Adjustment to start semester week from 1
        } else {
            // Out of Semester
            return 'Fora do semestre';
        }
    }
   
}



//module.exports= { addWeeksToData, convertToDate,getWeekNumber, getSemesterWeekNumber};