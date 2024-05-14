import * as Papa from 'papaparse';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import DateConverter from './DateConverter.js';

let filterMode = "AND"; // Modo de filtro padrão
let myTable; // Global variable to store the table instance
let horario;
let salas;
let substitutionTable;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('custom-file-upload').addEventListener('click', function() {
        const isUrl = confirm("Deseja carregar a partir de um URL? \nSe sim, clique Ok. Se não, clique em Cancelar");
        if (isUrl) {
            const url = prompt("URL do arquivo CSV:");
            if (url) {
                handleFileSelect(url);
            }
        } else {
            document.getElementById('csv-file').click();
        }
    });

    document.getElementById('menu-btn').addEventListener('click', function() {
        document.getElementById('example-table').style.display = 'block';
        document.getElementById('example-table2').style.display = 'none';
        document.getElementById('substitution-table').style.display = 'none';
        document.getElementById('uc-allocation-table').style.display = 'none';
    });

    document.getElementById('salas-btn').addEventListener('click', function() {
        document.getElementById('example-table').style.display = 'none';
        document.getElementById('example-table2').style.display = 'block';
        document.getElementById('substitution-table').style.display = 'none';
        document.getElementById('uc-allocation-table').style.display = 'none';
    });

    document.getElementById('sub-btn').addEventListener('click', function() {
        // Exibir modal para requisitos de substituição
        showModal();
    });

    document.getElementById('uc-allocation-btn').addEventListener('click', function() {
        showUCModal();
    });

    document.getElementById('custom-room-upload').addEventListener('click', function() {
        document.getElementById('classroom-file').click();
    });

    document.getElementById('csv-file').addEventListener('change', handleFileSelect, false);
    document.getElementById('classroom-file').addEventListener('change', handleClassroomFile, false);

    document.getElementById('filter-and').addEventListener('click', () => setFilterMode('AND'));
    document.getElementById('filter-or').addEventListener('click', () => setFilterMode('OR'));

    document.getElementById('apply-filters').addEventListener('click', applyCustomFilters);
    document.getElementById('export-json').addEventListener('click', exportToJSON);
    document.getElementById('export-csv').addEventListener('click', exportToCSV);

    // Configurar o modal
    const modal = document.getElementById('substitution-modal');
    const span = document.getElementsByClassName('close')[0];

    span.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Configurar o modal de alocação de UC
    const ucModal = document.getElementById('uc-allocation-modal');
    const spanUC = document.getElementsByClassName('close-uc')[0];

    spanUC.onclick = function() {
        ucModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == ucModal) {
            ucModal.style.display = 'none';
        }
    };

    // Capturar dados do formulário do modal de substituição
    document.getElementById('substitution-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const excludePeriods = document.getElementById('exclude-periods').value.split(',');
        const includePeriods = document.getElementById('include-periods').value.split(',');
        const preferredRooms = document.getElementById('preferred-rooms').value.split(',');
        const excludedRooms = document.getElementById('excluded-rooms').value.split(',');

        const filters = {
            DataIni: new Date(startDate),
            DataFim: new Date(endDate),
            ExcludePeriods: excludePeriods,
            IncludePeriods: includePeriods,
            PreferredRooms: preferredRooms,
            ExcludedRooms: excludedRooms
        };

        modal.style.display = 'none';
        showSubstitutionTable(filters);
    });

    // Capturar dados do formulário do modal de alocação de UC
    document.getElementById('uc-allocation-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const ucName = document.getElementById('uc-name').value;
        const numberOfClasses = document.getElementById('number-of-classes').value;
        const startDateUC = document.getElementById('start-date-uc').value;
        const endDateUC = document.getElementById('end-date-uc').value;
        const excludePeriodsUC = document.getElementById('exclude-periods-uc').value.split(',');
        const includePeriodsUC = document.getElementById('include-periods-uc').value.split(',');
        const preferredRoomsUC = document.getElementById('preferred-rooms-uc').value.split(',');
        const excludedRoomsUC = document.getElementById('excluded-rooms-uc').value.split(',');

        const filters = {
            UCName: ucName,
            NumberOfClasses: parseInt(numberOfClasses),
            DataIni: new Date(startDateUC),
            DataFim: new Date(endDateUC),
            ExcludePeriods: excludePeriodsUC,
            IncludePeriods: includePeriodsUC,
            PreferredRooms: preferredRoomsUC,
            ExcludedRooms: excludedRoomsUC
        };

        ucModal.style.display = 'none';
        showUCAllocationTable(filters);
    });
});

function showModal() {
    const modal = document.getElementById('substitution-modal');
    modal.style.display = 'block';
}

function showUCModal() {
    const modal = document.getElementById('uc-allocation-modal');
    modal.style.display = 'block';
}

function handleClassroomFile(event) {
    Papa.parse(event.target.files[0], {
        header: true,
        delimiter: ";",
        complete: (results) => {
            salas = results.data;
            initializeTable2(salas);
            console.log(salas);
        }
    });
}

function handleFileSelect(fileOrUrl) {
    if (typeof fileOrUrl === 'string') {
        Papa.parse(fileOrUrl, {
            download: true,
            header: true,
            complete: function(results) {
                horario = DateConverter.addWeeksToData(results.data);
                initializeTable(horario);
            },
            error: function(error) {
                console.error("Error fetching CSV file:", error);
                alert("Erro ao carregar arquivo CSV. Verifique se o URL está correto e tente novamente");
            }
        });
    } else {
        const file = fileOrUrl.target.files[0];
        Papa.parse(file, {
            header: true,
            delimiter: ";",
            complete: function(results) {
                horario = DateConverter.addWeeksToData(results.data);
                initializeTable(horario);
            }
        });
    }
}

function initializeTable2(data) {
    myTable = new Tabulator("#example-table2", {
        data: data,
        columns: [
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
        layout: "fitData",
        pagination: "local",
        paginationSize: 15,
    });
}

function initializeTable(data) {
    myTable = new Tabulator("#example-table", {
        data: data,
        columns: [
            { title: "Curso", field: "Curso", headerFilter: "input" },
            { title: "Unidade Curricular", field: "Unidade Curricular", headerFilter: "input" },
            { title: "Turno", field: "Turno", headerFilter: "input" },
            { title: "Turma", field: "Turma", headerFilter: "input" },
            { title: "Inscritos no turno", field: "Inscritos no turno", headerFilter: "input" },
            { title: "Dia da semana", field: "Dia da semana", headerFilter: "input" },
            { title: "Hora início da aula", field: "Hora início da aula", headerFilter: "input" },
            { title: "Hora fim da aula", field: "Hora fim da aula", headerFilter: "input" },
            { title: "Data da aula", field: "Data da aula", headerFilter: "input" },
            { title: "Características da sala pedida para a aula", field: "Características da sala pedida para a aula", headerFilter: "input" },
            { title: "Sala atribuída à aula", field: "Sala atribuída à aula", headerFilter: "input" },
            { title: "Semana do ano", field: "Semana do ano", headerFilter: "input" },
            { title: "Semana do semestre", field: "Semana do semestre", headerFilter: "input" },
        ],
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 15,
    });
}

function applyCustomFilters() {
    const filters = myTable.getHeaderFilters(); // Uses the global variable directly
    console.log("Modo de filtro atual:", filterMode);
    console.log("Filtros a serem aplicados:", filters);

    if (filterMode === "AND") {
        myTable.setFilter(filters.map(filter => ({ field: filter.field, type: "like", value: filter.value })));
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

function setFilterMode(mode) {
    filterMode = mode; // mode should be 'AND' or 'OR'
    console.log("Modo de filtro alterado para:", filterMode);
}

function exportToJSON() {
    let data = myTable.getData();
    let dataStr = JSON.stringify(data);
    downloadData(dataStr, "application/json", "horario.json");
}

function exportToCSV() {
    myTable.download("csv", "dados.csv");
}

function downloadData(dataStr, mimeType, fileName) {
    let blob = new Blob([dataStr], { type: mimeType });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, 0);
}

// Função para exibir a tabela de substituição
function showSubstitutionTable(filters) {
    console.log("Filters:", filters); // Adicione esta linha para depurar os filtros
    // Esconder outras tabelas
    document.getElementById('example-table').style.display = 'none';
    document.getElementById('example-table2').style.display = 'none';
    document.getElementById('uc-allocation-table').style.display = 'none';

    // Mostrar a tabela de substituição (crie se necessário)
    let subTable = document.getElementById('substitution-table');
    if (!subTable) {
        subTable = document.createElement('div');
        subTable.id = 'substitution-table';
        document.body.appendChild(subTable);
    }
    
    // Buscar slots de substituição
    const substitutionSlots = findSubstitutionSlots(filters);
    console.log("Substitution Slots:", substitutionSlots); // Adicione esta linha para depurar os slots
    initializeSubstitutionTable(substitutionSlots);
}

// Função para inicializar a tabela de substituição
function initializeSubstitutionTable(data) {
    substitutionTable = new Tabulator("#substitution-table", {
        data: data,
        columns: [
            { title: "Data", field: "data", headerFilter: "input" },
            { title: "Sala", field: "sala", headerFilter: "input" },
            { title: "HoraIni", field: "HoraIni", headerFilter: "input" },
            { title: "HoraFim", field: "HoraFim", headerFilter: "input" },
        ],
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 15,
    });
}

// Função para exibir a tabela de alocação de UC
function showUCAllocationTable(filters) {
    console.log("Filters for UC Allocation:", filters); // Adicione esta linha para depurar os filtros
    // Esconder outras tabelas
    document.getElementById('example-table').style.display = 'none';
    document.getElementById('example-table2').style.display = 'none';
    document.getElementById('substitution-table').style.display = 'none';

    // Mostrar a tabela de alocação de UC (crie se necessário)
    let ucTable = document.getElementById('uc-allocation-table');
    if (!ucTable) {
        ucTable = document.createElement('div');
        ucTable.id = 'uc-allocation-table';
        document.body.appendChild(ucTable);
    }
    
    // Buscar slots de alocação de UC
    const ucAllocationSlots = findUCAllocationSlots(filters);
    console.log("UC Allocation Slots:", ucAllocationSlots); // Adicione esta linha para depurar os slots
    initializeUCTable(ucAllocationSlots);
}

// Função para inicializar a tabela de alocação de UC
function initializeUCTable(data) {
    substitutionTable = new Tabulator("#uc-allocation-table", {
        data: data,
        columns: [
            { title: "Data", field: "data", headerFilter: "input" },
            { title: "Sala", field: "sala", headerFilter: "input" },
            { title: "HoraIni", field: "HoraIni", headerFilter: "input" },
            { title: "HoraFim", field: "HoraFim", headerFilter: "input" },
            { title: "UC", field: "UC", headerFilter: "input" },
            { title: "Turma", field: "Turma", headerFilter: "input" },
            { title: "Curso", field: "Curso", headerFilter: "input" },
        ],
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 15,
    });
}

// Exemplo de função para encontrar slots de substituição (adaptar conforme necessário)
function findSubstitutionSlots(filters) {
    if (!horario || !salas) {
        alert("Por favor, carregue os ficheiros de horários e salas primeiro.");
        return [];
    }

    // Adapte esta função conforme necessário para utilizar os filtros fornecidos
    return findOpenSlots(salas, horario, filters);
}

function findUCAllocationSlots(filters) {
    if (!horario || !salas) {
        alert("Por favor, carregue os ficheiros de horários e salas primeiro.");
        return [];
    }

    const slots = findOpenSlots(salas, horario, filters);
    const allocatedSlots = [];

    for (let i = 0; i < filters.NumberOfClasses; i++) {
        if (slots.length > 0) {
            const slot = slots.shift();
            allocatedSlots.push({
                ...slot,
                UC: filters.UCName,
            });
        } else {
            break;
        }
    }

    return allocatedSlots;
}

function findOpenSlots(classroom, horario, filters) {
    if (filters.DataIni != undefined && filters.DataFim != undefined) {
        var days = [];
        for (let date = new Date(filters.DataIni.getTime()); date <= filters.DataFim; date.setDate(date.getDate() + 1)) {
            days.push(new Date(date.getTime()));
        }

        var fHorario = horario.filter(aula => {
            if (aula['Data da aula'] != undefined) {
                const d = aula['Data da aula'].split("/");
                const date = new Date(d[2], parseInt(d[1]) - 1, d[0]);
                return date.getTime() >= filters.DataIni.getTime() && date.getTime() <= filters.DataFim.getTime();
            }
            return false;
        });

        var salas = listSalas(classroom);
        var slots = [];

        days.forEach(data => {
            var dHorario = fHorario.filter(a => {
                const d = a['Data da aula'].split("/");
                const date = new Date(d[2], parseInt(d[1]) - 1, d[0]);
                return data.getTime() === date.getTime();
            });

            salas.forEach(sala => {
                let daySala = getDisponibilidadeSala(dHorario, sala, data);
                daySala.forEach(time => {
                    slots.push({ data: data.toISOString().split('T')[0], sala: sala, HoraIni: time.HoraIni, HoraFim: time.HoraFim });
                });
            });
        });

        return slots;
    } else {
        return [];
    }
}

function listSalas(classroom) {
    let res = [];
    classroom.forEach(sala => {
        res.push(sala['Nome sala']);
    });
    res.sort((a, b) => a.localeCompare(b));
    return res;
}

function getDisponibilidadeSala(horario, nome, dia) {
    let daysOcupados = horario.filter((aula => {
        return aula['Sala atribuída à aula'].trim() === nome.trim();
    })).sort((a, b) => {
        if (a['Hora início da aula'] != undefined && b['Hora início da aula'] != undefined) {
            const t1 = a['Hora início da aula'].split(":");
            const t2 = b['Hora início da aula'].split(":");
            if (t1[0] != t2[0]) {
                return parseInt(t1[0]) - parseInt(t2[0]);
            } else {
                return parseInt(t1[1]) - parseInt(t2[1]);
            }
        }
        return 0;
    });

    let timedays = [];
    let time = "08:00:00";

    daysOcupados.forEach(aula => {
        if (time < aula['Hora início da aula'].trim()) {
            timedays.push({ 'HoraIni': time, 'HoraFim': aula['Hora início da aula'].trim() });
        }
        time = aula['Hora fim da aula'].trim();
    });

    if (time < "22:30:00") {
        timedays.push({ 'HoraIni': time, 'HoraFim': "22:30:00" });
    }

    return timedays;
}
