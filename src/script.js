 import * as Papa from 'papaparse';
 import {TabulatorFull as Tabulator} from 'tabulator-tables';


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('custom-file-upload').addEventListener('click', function() {
        const isUrl = confirm("Deseja carregar a partir de um URL? \nSe sim, clique Ok. Se não, clique em Cancelar")
        if(isUrl){
            const url = prompt("URL do arquivo CSV:")
            if(url){
            handleFileSelect(url);
            }
        }else{
        document.getElementById('csv-file').click();
        }
    });

    document.getElementById('csv-file').addEventListener('change', handleFileSelect, false);

    // Adiciona os event listeners para os botões AND e OR
    document.getElementById('filter-and').addEventListener('click', () => setFilterMode('AND'));
    document.getElementById('filter-or').addEventListener('click', () => setFilterMode('OR'));

    // Ouvinte para o botão de aplicar filtros
    document.getElementById('apply-filters').addEventListener('click', applyCustomFilters);
});


// let globalData = []; // Para armazenar os dados globalmente após o parsing
let filterMode = "AND"; // Modo de filtro padrão



function handleFileSelect(fileOrUrl) {
    if(typeof fileOrUrl === 'string'){
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
}else{
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



function convertToDate(str) {
    if (!str) {
        console.log("Data inválida fornecida para convertToDate:", str);
        return null; // ou uma data padrão, se preferir
    }
    const parts = str.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // -1 porque os meses em JavaScript começam em 0
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}



function addWeeksToData(data) {
    return data.map(row => {
        if (!row['Data da aula']) {
            console.log("Data da aula ausente para a linha:", row);
            return row; // Ou adicione algum tratamento padrão para datas ausentes
        }

        const date = convertToDate(row['Data da aula']);
        if (isNaN(date.getTime())) {
            console.log("Data da aula inválida para a linha:", row);
            return row; // Ou adicione algum tratamento padrão para datas inválidas
        }

        const weekOfYear = getWeekNumber(date);
        row['Semana do ano'] = weekOfYear;
        row['Semana do semestre'] = getSemesterWeekNumber(weekOfYear);
        return row;
    });
}




// Função para calcular o número da semana no ano
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

// Função para calcular o número da semana no semestre
function getSemesterWeekNumber(weekOfYear) {
    if (weekOfYear >= 5 && weekOfYear <= 19) {
        // Primeiro Semestre
        return weekOfYear - 4; // Ajuste para começar a semana do semestre de 1
    } else if (weekOfYear >= 35 && weekOfYear <= 49) {
        // Segundo Semestre
        return weekOfYear - 34; // Ajuste para começar a semana do semestre de 1
    } else {
        // Fora do Semestre
        return 'Fora do semestre';
    }
}



let myTable; // Variável global para armazenar a instância da tabela

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

function applyCustomFilters() {
    const filters = myTable.getHeaderFilters(); // Usa diretamente a variável global
    
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

// Função para alternar entre os modos de filtragem
function setFilterMode(mode) {
    filterMode = mode; // mode deve ser "AND" ou "OR"
    console.log("Modo de filtro alterado para:", filterMode);
}





//Para os testes
module.exports = { addWeeksToData, convertToDate, handleFileSelect,getWeekNumber,getSemesterWeekNumber, applyCustomFilters , setFilterMode, filterMode};
