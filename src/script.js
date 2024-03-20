 import * as Papa from 'papaparse';
 import {TabulatorFull as Tabulator} from 'tabulator-tables';

// @ts-check
/**
 * @fileoverview Handles CSV file parsing, data manipulation, and table initialization.
 * @module csvHandler
 */

/**
 * Event listener for DOMContentLoaded event.
 * Adds event listeners for file upload, filter buttons, and apply filters button.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for custom file upload button
    document.getElementById('custom-file-upload').addEventListener('click', function() {
        const isUrl = confirm("Deseja carregar a partir de um URL? \nSe sim, clique Ok. Se não, clique em Cancelar")
        if(isUrl){
            const url = prompt("URL do arquivo CSV:")
            if(url){
                handleFileSelect(url);
            }
        } else {
            document.getElementById('csv-file').click();
        }
    });

    // Add event listener for CSV file input change
    document.getElementById('csv-file').addEventListener('change', handleFileSelect, false);

    // Add event listeners for filter buttons
    document.getElementById('filter-and').addEventListener('click', () => setFilterMode('AND'));
    document.getElementById('filter-or').addEventListener('click', () => setFilterMode('OR'));

    // Add event listener for apply filters button
    document.getElementById('apply-filters').addEventListener('click', applyCustomFilters);
});


let filterMode = "AND"; // Modo de filtro padrão

/**
 * Handles file selection event.
 * Parses the CSV file and initializes the table.
 * @param {string | Event} fileOrUrl - File or URL of the CSV file, or event object.
 */
function handleFileSelect(fileOrUrl) {
    if(typeof fileOrUrl === 'string'){
        // Parse CSV from URL
        Papa.parse(fileOrUrl, {
            download: true,
            header: true,
            complete: function(results){
                const dataWithWeeks = addWeeksToData(results.data);
                initializeTable(dataWithWeeks);
            },
            error: function(error) {
                console.error("Error fetching CSV file:", error);
                alert("Erro ao carregar arquivo CSV. Verifique se o URL está correto e tente novamente")
            }
        });
    } else {
        // Parse CSV from file input
        const file= fileOrUrl.target.files[0];
        Papa.parse(file, {
            header: true,
            delimiter: ";",
            complete: function(results) {
                const dataWithWeeks = addWeeksToData(results.data);
                initializeTable(dataWithWeeks)
            }
        });
    }
}

/**
 * Converts a date string to a Date object.
 * @param {string} str - Date string in the format 'dd/mm/yyyy'.
 * @returns {Date | null} Date object if valid, null otherwise.
 */
function convertToDate(str) {
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
function addWeeksToData(data) {
    return data.map(row => {
        if (!row['Data da aula']) {
            console.log("Data da aula ausente para a linha:", row);
            return row; // Or add some default handling for missing dates
        }

        const date = convertToDate(row['Data da aula']);
        if (isNaN(date.getTime())) {
            console.log("Data da aula inválida para a linha:", row);
            return row; // Or add some default handling for invalid dates
        }

        const weekOfYear = getWeekNumber(date);
        row['Semana do ano'] = weekOfYear;
        row['Semana do semestre'] = getSemesterWeekNumber(weekOfYear);
        return row;
    });
}

/**
 * Calculates the week number of a given date.
 * @param {Date} d - Date object.
 * @returns {number} Week number.
 */
function getWeekNumber(d) {
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
function getSemesterWeekNumber(weekOfYear) {
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

/**
 * Initializes the Tabulator table with the provided data.
 * @param {Object[]} data - Array of data rows.
 */
function initializeTable(data) {
    myTable = new Tabulator("#example-table", {
        data: data,
        columns: [
            {title: "Curso", field: "Curso", headerFilter: "input"},
            {title: "Unidade Curricular", field: "Unidade Curricular", headerFilter: "input"},
            {title: "Turno", field: "Turno", headerFilter: "input"},
            {title: "Turma", field: "Turma", headerFilter: "input"},
            {title: "Inscritos no turno", field: "Inscritos no turno", headerFilter: "input"},
            {title: "Dia da semana", field: "Dia da semana", headerFilter: "input"},
            {title: "Hora início da aula", field: "Hora início da aula", headerFilter: "input"},
            {title: "Hora fim da aula", field: "Hora fim da aula", headerFilter: "input"},
            {title: "Data da aula", field: "Data da aula", headerFilter: "input"},
            {title: "Características da sala pedida para a aula", field: "Características da sala pedida para a aula", headerFilter: "input"},
            {title: "Sala atribuída à aula", field: "Sala atribuída à aula", headerFilter: "input"},
            {title: "Semana do ano", field: "Semana do ano", headerFilter: "input"},
            {title: "Semana do semestre", field: "Semana do semestre", headerFilter: "input"},
        ],
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 50,
    });
}

/**
 * Applies custom filters to the table based on the selected filter mode.
 */
function applyCustomFilters() {
    const filters = myTable.getHeaderFilters(); // Uses the global variable directly
    
    console.log("Modo de filtro atual:", filterMode);
    console.log("Filtros a serem aplicados:", filters);

    if (filterMode === "AND") {
        myTable.setFilter(filters.map(filter => ({field: filter.field, type:"like", value: filter.value})));
        console.log("Filtros AND aplicados.");
    } else {
        myTable.clearFilter(true);
        myTable.setFilter((data) => {
            return filters.some(filter => {
                const fieldValue = data[filter.field] ? data[filter.field].toString().toLowerCase() : "";
                const filterValue = filter.value.toString().toLowerCase();
                return fieldValue.includes(filterValue);
            });
        });
        console.log("Filtros OR aplicados.");
    }
}

/**
 * Sets the filter mode to either 'AND' or 'OR'.
 * @param {string} mode - Filter mode ('AND' or 'OR').
 */
function setFilterMode(mode) {
    filterMode = mode; // mode should be 'AND' or 'OR'
    console.log("Modo de filtro alterado para:", filterMode);
}

/** @type {Tabulator} */
let myTable; // Global variable to store the table instance


//Para os testes
module.exports = { addWeeksToData, convertToDate, handleFileSelect,getWeekNumber,getSemesterWeekNumber, applyCustomFilters , setFilterMode, filterMode};