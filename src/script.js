import * as Papa from 'papaparse';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import DateConverter from './DateConverter.js';
import ClassScheduler from './ClassScheduler.js';
import * as d3 from 'd3';

let filterMode = "AND"; // Modo de filtro padrão
let myTable; // Global variable to store the table instance
let horario;
let salas;
let substitutionTable;
let ucAllocationTable;

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
        document.querySelector('.uc-controls').style.display = 'none';
    });

    document.getElementById('salas-btn').addEventListener('click', function() {
        document.getElementById('example-table').style.display = 'none';
        document.getElementById('example-table2').style.display = 'block';
        document.getElementById('substitution-table').style.display = 'none';
        document.getElementById('uc-allocation-table').style.display = 'none';
        document.querySelector('.uc-controls').style.display = 'none';
    });

    document.getElementById('sub-btn').addEventListener('click', function() {
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

    document.getElementById('apply-graph-filters').addEventListener('click', applyGraphFilters);

    document.getElementById('apply-heatmap-filters').addEventListener('click', applyHeatmapFilters);

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

        // Verificação adicional antes de chamar a função
        if (!horario || !salas) {
            alert("Por favor, carregue os ficheiros de horários e salas primeiro.");
            return;
        }

        showUCAllocationTable(filters);
    });

    // Botões para remover sugestões e adicionar alternativas
    document.getElementById('remove-suggestions').addEventListener('click', removeSelectedRows);
    document.getElementById('add-alternative').addEventListener('click', addAlternativeRow);

    // Botões para remover sugestões e adicionar alternativas
    document.getElementById('remove-suggestions').addEventListener('click', removeSelectedRowsSub);
    document.getElementById('add-alternative').addEventListener('click', addAlternativeRowSub);
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
            console.log("Salas carregadas:", salas); // Adicione esta linha para depuração
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
                console.log("Horário carregado a partir de URL:", horario); // Adicione esta linha para depuração
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
                console.log("Horário carregado:", horario); // Adicione esta linha para depuração
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
    document.querySelector('.uc-controls').style.display = 'none';

    // Mostrar a tabela de substituição (crie se necessário)
    let subTable = document.getElementById('substitution-table');
    if (!subTable) {
        subTable = document.createElement('div');
        subTable.id = 'substitution-table';
        document.body.appendChild(subTable);
    }
    
    // Buscar slots de substituição
    const substitutionSlots = ClassScheduler.findSubstitutionSlots(filters, horario, salas);
    console.log("Substitution Slots:", substitutionSlots); // Adicione esta linha para depurar os slots
    initializeSubstitutionTable(substitutionSlots);
    document.querySelector('.uc-controls').style.display = 'block';
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
            { title: "Selecionar", formatter: "rowSelection", titleFormatter: "rowSelection", align: "center", headerSort: false },
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
    const ucAllocationSlots = ClassScheduler.findUCAllocationSlots(filters, horario, salas);
    console.log("UC Allocation Slots:", ucAllocationSlots); // Adicione esta linha para depurar os slots
    initializeUCTable(ucAllocationSlots);
    document.querySelector('.uc-controls').style.display = 'block';
}

// Função para inicializar a tabela de alocação de UC
function initializeUCTable(data) {
    ucAllocationTable = new Tabulator("#uc-allocation-table", {
        data: data,
        columns: [
            { title: "Data", field: "data", headerFilter: "input" },
            { title: "Sala", field: "sala", headerFilter: "input" },
            { title: "HoraIni", field: "HoraIni", headerFilter: "input" },
            { title: "HoraFim", field: "HoraFim", headerFilter: "input" },
            { title: "UC", field: "UC", headerFilter: "input" },
            { title: "Turma", field: "Turma", headerFilter: "input" },
            { title: "Curso", field: "Curso", headerFilter: "input" },
            { title: "Selecionar", formatter: "rowSelection", titleFormatter: "rowSelection", align: "center", headerSort: false },
        ],
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 15,
    });
}

function removeSelectedRows() {
    const selectedRows = ucAllocationTable.getSelectedRows();
    selectedRows.forEach(row => row.delete());
}

function addAlternativeRow() {
    const newRow = {
        data: prompt("Data:"),
        sala: prompt("Sala:"),
        HoraIni: prompt("Hora de Início:"),
        HoraFim: prompt("Hora de Fim:"),
        UC: prompt("UC:"),
        Turma: prompt("Turma:"),
        Curso: prompt("Curso:")
    };
    ucAllocationTable.addRow(newRow);
}

// Funções para a tabela de substituição
function removeSelectedRowsSub() {
    const selectedRows = substitutionTable.getSelectedRows();
    selectedRows.forEach(row => row.delete());
}

function addAlternativeRowSub() {
    const newRow = {
        data: prompt("Data:"),
        sala: prompt("Sala:"),
        HoraIni: prompt("Hora de Início:"),
        HoraFim: prompt("Hora de Fim:")
    };
    substitutionTable.addRow(newRow);
}

function applyGraphFilters() {
    const courseFilter = document.getElementById('filter-course').value;
    const ucFilter = document.getElementById('filter-uc').value;
    const dateStartFilter = document.getElementById('filter-date-start').value;
    const dateEndFilter = document.getElementById('filter-date-end').value;

    const filteredData = horario.filter(aula => {
        const courseMatch = courseFilter ? aula['Curso'].includes(courseFilter) : true;
        const ucMatch = ucFilter ? aula['Unidade Curricular'].includes(ucFilter) : true;
        const date = DateConverter.convertToDate(aula['Data da aula']);
        const dateMatch = (!dateStartFilter || date >= new Date(dateStartFilter)) && (!dateEndFilter || date <= new Date(dateEndFilter));
        return courseMatch && ucMatch && dateMatch;
    });

    const conflicts = ClassScheduler.findConflicts(filteredData);
    drawConflictGraph(conflicts);
}

function drawConflictGraph(conflicts) {
    const nodes = [];
    const links = [];

    conflicts.forEach(conflict => {
        const source = conflict.source['Unidade Curricular'] + " " + conflict.source['Data da aula'] + " " + conflict.source['Hora início da aula'];
        const target = conflict.target['Unidade Curricular'] + " " + conflict.target['Data da aula'] + " " + conflict.target['Hora início da aula'];

        if (!nodes.find(node => node.id === source)) {
            nodes.push({ id: source });
        }
        if (!nodes.find(node => node.id === target)) {
            nodes.push({ id: target });
        }

        links.push({ source, target });
    });

    const width = 800;
    const height = 600;

    const svg = d3.select("#conflict-graph").html("").append("svg")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(200))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke-width", 2)
        .attr("stroke", "#999");

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", "#69b3a2");

    const label = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("dy", -3)
        .text(d => d.id);

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label.attr("x", d => d.x)
            .attr("y", d => d.y);
    });
}

function processRoomData(horario, salas, filters) {
    const processedData = [];

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    // Iterar sobre cada sala
    salas.forEach(sala => {
        // Aplicar filtros de sala
        const isRoomTypeMatch = filters.roomType ? sala['Nome sala'].includes(filters.roomType) : true;
        const isRoomCapacityMatch = filters.roomCapacity ? parseInt(sala['Capacidade Normal']) >= filters.roomCapacity : true;

        if (isRoomTypeMatch && isRoomCapacityMatch) {
            // Inicializar mapa de ocupação
            const roomOccupation = {};

            // Iterar sobre cada dia dentro do intervalo
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                const dayStr = date.toISOString().split('T')[0];
                roomOccupation[dayStr] = Array(15).fill(0); // Inicializar slots horários (8h-22h30)

                // Verificar ocupação da sala
                horario.forEach(aula => {
                    if (aula['Sala atribuída à aula'].trim() === sala['Nome sala'].trim()) {
                        const aulaDate = DateConverter.convertToDate(aula['Data da aula']);
                        if (aulaDate.getTime() === date.getTime()) {
                            const startHour = parseInt(aula['Hora início da aula'].split(':')[0]) - 8;
                            const endHour = parseInt(aula['Hora fim da aula'].split(':')[0]) - 8;
                            for (let h = startHour; h <= endHour; h++) {
                                roomOccupation[dayStr][h] = 1;
                            }
                        }
                    }
                });
            }

            processedData.push({
                room: sala['Nome sala'],
                occupation: roomOccupation
            });
        }
    });

    return processedData;
}

function drawHeatmap(data) {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hoursOfDay = Array.from({ length: 15 }, (v, i) => i + 8); // 8h-22h

    const margin = { top: 50, right: 0, bottom: 100, left: 30 },
        width = 900 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    const svg = d3.select("#heatmap").html("").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .domain(daysOfWeek)
        .padding(0.01);

    const y = d3.scaleBand()
        .range([height, 0])
        .domain(hoursOfDay)
        .padding(0.01);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 1]);

    data.forEach(roomData => {
        Object.keys(roomData.occupation).forEach(day => {
            const dayIndex = new Date(day).getDay();
            roomData.occupation[day].forEach((value, hourIndex) => {
                svg.append("rect")
                    .attr("x", x(daysOfWeek[dayIndex]))
                    .attr("y", y(hoursOfDay[hourIndex]))
                    .attr("width", x.bandwidth())
                    .attr("height", y.bandwidth())
                    .style("fill", colorScale(value));
            });
        });
    });
}

function applyHeatmapFilters() {
    const roomType = document.getElementById('filter-room-type').value;
    const roomCapacity = document.getElementById('filter-room-capacity').value;
    const startDate = document.getElementById('filter-date-start-heatmap').value;
    const endDate = document.getElementById('filter-date-end-heatmap').value;

    const filters = {
        roomType,
        roomCapacity: parseInt(roomCapacity),
        startDate,
        endDate
    };

    const processedData = processRoomData(horario, salas, filters);
    drawHeatmap(processedData);
}
