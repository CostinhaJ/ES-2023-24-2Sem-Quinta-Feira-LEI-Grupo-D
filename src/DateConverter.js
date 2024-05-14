export default class DateConverter {
    /**
     * Converte uma string de data para um objeto Date.
     * @param {string} str - String de data no formato 'dd/mm/yyyy'.
     * @returns {Date | null} Objeto Date se válido, null caso contrário.
     */
    static convertToDate(str) {
        if (!str) {
            console.log("Data inválida fornecida para convertToDate:", str);
            return null;
        }
        const parts = str.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }

    /**
     * Adiciona informações de semana a cada linha de dados.
     * @param {Object[]} data - Array de linhas de dados.
     * @returns {Object[]} Array de linhas de dados com informações de semana adicionadas.
     */
    static addWeeksToData(data) {
        return data.map(row => {
            if (!row['Data da aula']) {
                console.log("Data da aula ausente para a linha:", row);
                return row;
            }

            const date = DateConverter.convertToDate(row['Data da aula']);
            if (isNaN(date.getTime())) {
                console.log("Data da aula inválida para a linha:", row);
                return row;
            }

            const weekOfYear = DateConverter.getWeekNumber(date);
            row['Semana do ano'] = weekOfYear;
            row['Semana do semestre'] = DateConverter.getSemesterWeekNumber(weekOfYear);
            return row;
        });
    }

    /**
     * Calcula o número da semana de uma data específica.
     * @param {Date} d - Objeto Date.
     * @returns {number} Número da semana.
     */
    static getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    }

    /**
     * Calcula o número da semana do semestre.
     * @param {number} weekOfYear - Número da semana do ano.
     * @returns {number | string} Número da semana do semestre ou 'Fora do semestre'.
     */
    static getSemesterWeekNumber(weekOfYear) {
        if (weekOfYear >= 5 && weekOfYear <= 19) {
            return weekOfYear - 4;
        } else if (weekOfYear >= 35 && weekOfYear <= 49) {
            return weekOfYear - 34;
        } else {
            return 'Fora do semestre';
        }
    }
}