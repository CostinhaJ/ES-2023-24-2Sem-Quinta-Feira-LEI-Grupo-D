const Papa  = require("papaparse");
const fs = require('node:fs');
const util = require('util');
const { get } = require("node:http");
const { time } = require("node:console");



fs.readFile("CaracterizaçãoDasSalas.csv", 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    var classroom = data;
    horarioFile(classroom);
});
function horarioFile(classroom){
    fs.readFile("HorarioDeExemplo.csv", 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        var horario = data;
        listSalass(classroom,horario);
    });
}


function listSalass(classroom,horario){
    Papa.parse(classroom, {
        header:true,
        complete: function(results) {
            classroom = results.data;
            getHorario(classroom,horario);
        }
    });
}

function getHorario(classroom,horario){
    Papa.parse(horario, {
        header:true,
        complete: function(results) {
            horario = results.data;
            var startTime = performance.now()

            findOpenSlots(classroom,horario,new Date(2022,10,21),new Date(2022,10,27)); 
                
            var endTime = performance.now()

            console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
        }
    });
}

function findOpenSlots(classroom,horario,DataIni,DataFim){
    var days = [];
    for(let date = new Date(DataIni.getTime()); date <= DataFim;date.setDate(date.getDate()+1)){
        days.push(new Date(date.getTime()));
    }
    fHorario = horario.filter(aula => {
        if(aula['Data da aula'] != undefined){
            const d = aula['Data da aula'].split("/");
            const date = new Date(d[2], parseInt(d[1])-1, d[0]);
            return date.getTime() >= DataIni.getTime() && date.getTime() <= DataFim.getTime();
        }
    });
    var salas = listSalas(classroom);
    var daySala = [];
    var slots = [];
    days.forEach(data => {
        salas.forEach(sala =>{
            daySala = getDisponibilidadeSala(fHorario,sala,data);
            daySala.forEach(time => {
                slots.push({data:data,sala:sala,hora:time});
            });
        });
    });

    return slots;
    
}

function listSalas(classroom){
    let res = [];
    classroom.forEach(sala => {
        res.push(sala['Nome sala'])
    });
    res.sort((a,b) => a.localeCompare(b));
    return res;
}

function getDisponibilidadeSala(horario,nome,dia){
    let daysOcupados = horario.filter((aula => {
        if(aula['Data da aula'] != undefined){
            const d = aula['Data da aula'].split("/");
            const date = new Date(d[2], parseInt(d[1])-1, d[0]);
            return aula['Sala atribuída à aula'].trim() ===nome.trim()&& date.getTime() === dia.getTime();
        }
        return false;
    })).sort((a,b) => {
        if(a['Hora início da aula'] != undefined && b['Hora início da aula'] != undefined){
            const t1 = a['Hora início da aula'].split(":");
            const t2 = b['Hora início da aula'].split(":");
            if(t1[0]!= t2[0]){
                return parseInt(t1[0])-parseInt(t2[0]);
            } else {
                return parseInt(t1[1])-parseInt(t2[1]);
            } 
        }
        return 0;
    });
    let timedays = [];
    let time = "08:00:00";
    daysOcupados.forEach(aula => {
        if(time===aula['Hora início da aula'].trim()){
            time=aula['Hora fim da aula'].trim();
        }else{
            timedays.push({'Hora início da aula':time,'Hora fim da aula':aula['Hora início da aula']});
            time=aula['Hora fim da aula'].trim();
        }
    });
    if(time!== "22:30:00")timedays.push({'Hora início da aula':time,'Hora fim da aula':"22:30:00"});
    return timedays;
}