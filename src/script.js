 import * as Papa from 'papaparse';
 import {TabulatorFull as Tabulator} from 'tabulator-tables';
 import DateConverter from './DateConverter.js';

// @ts-check
/**
 * @fileoverview Handles CSV file parsing, data manipulation, and table initialization.
 * @module csvHandler
 */

let filterMode = "AND"; // Modo de filtro padrão

/** @type {Tabulator} */
let myTable; // Global variable to store the table instance

let horario;
let salas;

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

    document.getElementById('custom-room-upload').addEventListener('click', function() {
        document.getElementById('classroom-file').click();
    });

    // Add event listener for CSV file input change
    document.getElementById('csv-file').addEventListener('change', handleFileSelect, false);
    document.getElementById('classroom-file').addEventListener('change', handleClassroomFile, false);

    // Add event listeners for filter buttons
    document.getElementById('filter-and').addEventListener('click', () => setFilterMode('AND'));
    document.getElementById('filter-or').addEventListener('click', () => setFilterMode('OR'));

    // Add event listener for apply filters button
    document.getElementById('apply-filters').addEventListener('click', applyCustomFilters);
});

function handleClassroomFile(file){

    Papa.parse(file.target.files[0],{
        header:true,
        delimiter: ";",
        complete:((results) => {salas=results.data;initializeTable2(salas);console.log(salas)})
    })
}


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
                horario = DateConverter.addWeeksToData(results.data);
                initializeTable(horario)
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
                horario = DateConverter.addWeeksToData(results.data);
                initializeTable(horario)
            }
        });
    }
}

function initializeTable2(data){
    myTable = new Tabulator("#example-table2",{
        data:data,
        columns:[
            {title: "Edificio", field: "Edif�cio", headerFilter: "input"},
            {title: "Nome sala", field: "Nome sala", headerFilter: "input"},
            {title: "Capacidade Normal", field: "Capacidade Normal", headerFilter: "input"},
            {title: "Capacidade Exame", field: "Capacidade Exame", headerFilter: "input"},
            {title: "No caracteristicas", field: "N� caracter�sticas", headerFilter: "input"},
            {title: "Anfiteatro aulas", field: "Anfiteatro aulas", headerFilter: "input"},
            {title: "Apoio tecnico eventos", field: "Apoio t�cnico eventos", headerFilter: "input"},
            {title: "Arq 1", field: "Arq 1", headerFilter: "input"},
            {title: "Arq 2", field: "Arq 2", headerFilter: "input"},
            {title: "Arq 3", field: "Arq 3", headerFilter: "input"},
            {title: "Arq 4", field: "Arq 4", headerFilter: "input"},
            {title: "Arq 5", field: "Arq 5", headerFilter: "input"},
            {title: "Arq 6", field: "Arq 6", headerFilter: "input"},
            {title: "Arq 9", field: "Arq 9", headerFilter: "input"},
            {title: "BYOD (Bring Your Own Device)", field: "BYOD (Bring Your Own Device)", headerFilter: "input"},
            {title: "Focus Group", field: "Focus Group", headerFilter: "input"},
            {title: "Horario sala vis�vel portal p�blico", field: "Hor�rio sala vis�vel portal p�blico", headerFilter: "input"},
            {title: "Laboratorio de Arquitectura de Computadores I", field: "Laborat�rio de Arquitectura de Computadores I", headerFilter: "input"},
            {title: "Laboratorio de Arquitectura de Computadores II", field: "Laborat�rio de Arquitectura de Computadores II", headerFilter: "input"},
            {title: "Laboratorio de Bases de Engenharia", field: "Laborat�rio de Bases de Engenharia", headerFilter: "input"},
            {title: "Laboratorio de Electr�nica", field: "Laborat�rio de Electr�nica", headerFilter: "input"},
            {title: "Laboratorio de Inform�tica", field: "Laborat�rio de Inform�tica", headerFilter: "input"},
            {title: "Laboratorio de Jornalismo", field: "Laborat�rio de Jornalismo", headerFilter: "input"},
            {title: "Laborat�rio de Redes de Computadores I", field: "Laborat�rio de Redes de Computadores I", headerFilter: "input"},
            {title: "Laborat�rio de Redes de Computadores II", field: "Laborat�rio de Redes de Computadores II", headerFilter: "input"},
            {title: "Laborat�rio de Telecomunica��es", field: "Laborat�rio de Telecomunica��es", headerFilter: "input"},
            {title: "Sala Aulas Mestrado", field: "Sala Aulas Mestrado", headerFilter: "input"},
            {title: "Sala Aulas Mestrado Plus", field: "Sala Aulas Mestrado Plus", headerFilter: "input"},
            {title: "Sala NEE", field: "Sala NEE", headerFilter: "input"},
            {title: "Sala Provas", field: "Sala Provas", headerFilter: "input"},
            {title: "Sala Reuni�o", field: "Sala Reuni�o", headerFilter: "input"},
            {title: "Sala de Arquitectura", field: "Sala de Arquitectura", headerFilter: "input"},
            {title: "Sala de Aulas normal", field: "Sala de Aulas normal", headerFilter: "input"},
            {title: "videoconfer�ncia", field: "videoconfer�ncia", headerFilter: "input"},
            {title: "Atrio", field: "Atrio", headerFilter: "input"},
        ],
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 50,

    })
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

//Para os testes
module.exports = { handleFileSelect, applyCustomFilters , setFilterMode, filterMode};