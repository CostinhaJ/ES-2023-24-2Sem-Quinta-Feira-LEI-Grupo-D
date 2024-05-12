const Papa  = require("papaparse");
const fs = require('node:fs');
const util = require('util');
const { get } = require("node:http");
const { time } = require("node:console");

var classroom = null;
var horario = null;



fs.readFile("CaracterizaçãoDasSalas.csv", 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    classroom = data;
    horarioFile();
});
function horarioFile(){
    fs.readFile("HorarioDeExemplo.csv", 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        horario = data;
        getSalas();
    });
}


function getSalas(){
    Papa.parse(classroom, {
        header:true,
        complete: function(results) {
            classroom = results.data;
            getHorario();
        }
    });
}

function getHorario(){
    Papa.parse(horario, {
        header:true,
        complete: function(results) {
            horario = results.data;
            //getSala();
            //getDisponibilidadeSala('C7.09',new Date(2022,10,30));
            var startTime = performance.now()

            findOpenSlots(new Date(2022,10,21),new Date(2022,10,27)); 
                
            var endTime = performance.now()

            console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
            
            //findClassTimes();
        }
    });
}

function findClassTimes(){
    /*console.log( horario.reduce( (acc, curr) => {
        if (!acc.includes(curr['Hora início da aula']+"-"+curr['Hora fim da aula']))
            acc.push(curr['Hora início da aula']+"-"+curr['Hora fim da aula']);
        return acc;
    }, []).sort((a,b) => {
        if(a != undefined && b != undefined){
            const t1 = a.split(":");
            const t2 = b.split(":");
            if(t1[0]!= t2[0]){
                return parseInt(t1[0])-parseInt(t2[0]);
            } else {
                return parseInt(t1[1])-parseInt(t2[1]);
            } 
        }
        return 0;
    }));*/
    console.log(horario.reduce( (acc, curr) => {
        if (!acc.includes(curr['Hora fim da aula']))
            acc.push(curr['Hora fim da aula']);
        return acc;
    }, []).sort((a,b) => {
        if(a != undefined && b != undefined){
            const t1 = a.split(":");
            const t2 = b.split(":");
            if(t1[0]!= t2[0]){
                return parseInt(t1[0])-parseInt(t2[0]);
            } else {
                return parseInt(t1[1])-parseInt(t2[1]);
            } 
        }
        return 0;
    }));
}

function findOpenSlots(DataIni,DataFim){
    var days = [];
    for(let date = new Date(DataIni.getTime()); date <= DataFim;date.setDate(date.getDate()+1)){
        days.push(new Date(date.getTime()));
    }
    var salas = getSala();
    var daySala = [];
    var slots = [];
    days.forEach(data => {
        salas.forEach(sala =>{
            daySala = getDisponibilidadeSala(sala,data);
            daySala.forEach(time => {
                slots.push({data:data,sala:sala,hora:time});
            });
        });
    });

    return slots;
    /*console.log(horario.filter( data => {
        if(data['Data da aula'] != undefined){
            const d = data['Data da aula'].split("/");
            const date = new Date(d[2], parseInt(d[1])-1, d[0]);
            return date>DataIni && date < DataFim;
        }
        return false;
    }).sort((a,b) => {
        if(a['Data da aula'] != undefined && b['Data da aula'] != undefined){
            const d = a['Data da aula'].split("/");
            const d1 = b['Data da aula'].split("/");
            const date = new Date(d[2], parseInt(d[1])-1, d[0]);
            const date1 = new Date(d1[2], parseInt(d1[1])-1, d1[0]);
            return date-date1;
        }
        return 0;
    }));*/
}

function getSala(){
    let res = [];
    classroom.forEach(sala => {
        res.push(sala['Nome sala'])
    });
    res.sort((a,b) => a.localeCompare(b));
    return res;
}

function getDisponibilidadeSala(nome,dia){
    let daysOcupados = horario.filter((aula => {
        if(aula['Data da aula'] != undefined){
            const d = aula['Data da aula'].split("/");
            const date = new Date(d[2], parseInt(d[1])-1, d[0]);
            //console.log(aula['Sala atribuída à aula']);
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